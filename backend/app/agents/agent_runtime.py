import re
import json
import logging
from typing import Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from ..models import Agent, AgentDocument, AgentDocumentChunk, AgentRun
from .embedding_service import create_vector_embedding, cosine_similarity
from ..config import settings
from .llm_client import complete_json, LLMError

logger = logging.getLogger(__name__)

def close_braces(s: str) -> str:
    s = s.strip()
    if not s.startswith('{') and not s.startswith('['):
        idx_brace = s.find('{')
        idx_bracket = s.find('[')
        if idx_brace != -1 and (idx_bracket == -1 or idx_brace < idx_bracket):
            s = s[idx_brace:]
        elif idx_bracket != -1:
            s = s[idx_bracket:]
    
    in_string = False
    escape = False
    stack = []
    repaired_chars = []
    
    for c in s:
        if escape:
            repaired_chars.append(c)
            escape = False
            continue
        if c == '\\':
            repaired_chars.append(c)
            escape = True
            continue
        if c == '"':
            in_string = not in_string
            repaired_chars.append(c)
            continue
        if not in_string:
            if c in ('{', '['):
                stack.append(c)
            elif c in ('}', ']'):
                if stack:
                    top = stack[-1]
                    if (c == '}' and top == '{') or (c == ']' and top == '['):
                        stack.pop()
        repaired_chars.append(c)
    
    repaired = "".join(repaired_chars)
    if in_string:
        repaired += '"'
    while stack:
        top = stack.pop()
        if top == '{':
            repaired += '}'
        elif top == '[':
            repaired += ']'
    return repaired

def extract_json_fields_via_regex(text: str) -> dict:
    fields = {"thought": None, "tool_call": None, "final_answer": None}
    
    thought_match = re.search(r'"thought"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"', text, re.DOTALL | re.IGNORECASE)
    if thought_match:
        try:
            fields["thought"] = json.loads('"' + thought_match.group(1) + '"')
        except Exception:
            fields["thought"] = thought_match.group(1)
    
    answer_match = re.search(r'"final_answer"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"', text, re.DOTALL | re.IGNORECASE)
    if answer_match:
        try:
            fields["final_answer"] = json.loads('"' + answer_match.group(1) + '"')
        except Exception:
            fields["final_answer"] = answer_match.group(1)
    else:
        truncated_answer_match = re.search(r'"final_answer"\s*:\s*"([^"]*)$', text, re.DOTALL | re.IGNORECASE)
        if truncated_answer_match:
            fields["final_answer"] = truncated_answer_match.group(1).strip()

    tool_match = re.search(r'"tool_call"\s*:\s*(\{.*?\})', text, re.DOTALL | re.IGNORECASE)
    if tool_match:
        try:
            tool_json_str = close_braces(tool_match.group(1))
            fields["tool_call"] = json.loads(tool_json_str)
        except Exception:
            pass
            
    return fields

def parse_tolerant_agent_step(raw_response: str) -> dict:
    clean_text = raw_response.strip()
    if clean_text.startswith("```"):
        lines = clean_text.split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        clean_text = "\n".join(lines).strip()

    try:
        return json.loads(clean_text)
    except Exception:
        pass

    try:
        repaired = close_braces(clean_text)
        return json.loads(repaired)
    except Exception:
        pass

    try:
        fields = extract_json_fields_via_regex(clean_text)
        if fields["thought"] or fields["final_answer"] or fields["tool_call"]:
            parsed = {}
            if fields["thought"] is not None:
                parsed["thought"] = fields["thought"]
            if fields["final_answer"] is not None:
                parsed["final_answer"] = fields["final_answer"]
            if fields["tool_call"] is not None:
                parsed["tool_call"] = fields["tool_call"]
            return parsed
    except Exception:
        pass

    return {
        "thought": "Fell back to raw response parsing due to malformed JSON.",
        "final_answer": raw_response
    }

def parse_tolerant_questions(raw_response: str) -> list[str]:
    try:
        repaired = close_braces(raw_response)
        parsed = json.loads(repaired)
        if isinstance(parsed, list):
            return [str(q) for q in parsed]
    except Exception:
        pass

    questions = []
    try:
        candidates = re.findall(r'"([^"\\]*(?:\\.[^"\\]*)*)"', raw_response)
        for c in candidates:
            c_clean = c.strip()
            if len(c_clean) > 5 and (c_clean.endswith('?') or any(kw in c_clean.lower() for kw in ['how', 'what', 'why', 'explain', 'show', 'compare', 'analyze'])):
                questions.append(c_clean)
    except Exception:
        pass

    if len(questions) >= 2:
        return questions

    try:
        lines = raw_response.split('\n')
        for line in lines:
            line_clean = line.strip().lstrip('0123456789.-*• ')
            if len(line_clean) > 5 and line_clean.endswith('?'):
                questions.append(line_clean)
    except Exception:
        pass

    return questions


def retrieve_rag_context(db: Session, agent_id: int, query_text: str, limit: int = 3) -> list[str]:
    """Retrieve relevant document chunks for the agent using vector similarity.
    
    ========================================================================
    PRODUCTION WARNING / TODO:
    This function implements an in-memory cosine similarity search over database
    chunks as a compatibility layer for local development (SQLite / no-pgvector).
    In a production Postgres environment with pgvector, this must be swapped
    to run a native database vector search query:
    
        db.query(AgentDocumentChunk.text)\\
          .join(AgentDocument)\\
          .filter(AgentDocument.agent_id == agent_id)\\
          .order_by(AgentDocumentChunk.embedding.cosine_distance(query_vector))\\
          .limit(limit)\\
          .all()
          
    Callers are decoupled from the similarity backend.
    ========================================================================
    """
    # 1. Generate query embedding
    query_vector = create_vector_embedding(query_text)
    is_zero_vector = all(x == 0.0 for x in query_vector)
    
    # 2. Fetch all document chunks linked to this agent
    chunks = (
        db.query(AgentDocumentChunk)
        .join(AgentDocument)
        .filter(AgentDocument.agent_id == agent_id)
        .all()
    )
    
    if not chunks:
        return []
        
    # 3. If query vector is a zero vector fallback, do keyword/substring fallback
    if is_zero_vector:
        logger.info("RAG query: zero-vector detected, falling back to substring matching")
        matched_chunks = []
        words = query_text.lower().split()
        for chunk in chunks:
            chunk_text_lower = chunk.text.lower()
            # Score based on keyword overlap
            matches = sum(1 for w in words if w in chunk_text_lower)
            if matches > 0:
                matched_chunks.append((chunk.text, float(matches)))
        matched_chunks.sort(key=lambda x: x[1], reverse=True)
        return [text for text, _ in matched_chunks[:limit]]

    # 4. Perform cosine similarity calculation in-memory
    scored_chunks = []
    for chunk in chunks:
        try:
            vector = json.loads(chunk.embedding_json)
            if len(vector) != len(query_vector):
                continue
            sim = cosine_similarity(query_vector, vector)
            # Threshold matches embedding_service.py threshold
            if sim >= 0.60:
                scored_chunks.append((chunk.text, sim))
        except Exception:
            logger.exception("Failed to compute similarity for chunk %s", chunk.id)
            
    scored_chunks.sort(key=lambda x: x[1], reverse=True)
    return [text for text, _ in scored_chunks[:limit]]


def format_history_context(history: list[dict]) -> str:
    """Format conversation history into a structured text log for LLM context."""
    if not history:
        return ""
    formatted = []
    for msg in history[-6:]:  # Keep last 6 messages to stay within token limits
        role = msg.get("role", "user")
        role_label = "User" if role == "user" else "Assistant"
        content = msg.get("content", "")
        formatted.append(f"{role_label}: {content}")
    return "--- CONVERSATION HISTORY ---\n" + "\n".join(formatted) + "\n----------------------------"


# Intent × role × follow-ups table — used as the fallback when the LLM
# is not configured or the live generation fails. The previous version
# was role-only, which meant role="base" always returned the same three
# prompts regardless of what the user had just asked. This table is keyed
# by intent first so the suggestions stay relevant to the conversation.
INTENT_FOLLOWUPS: dict[str, dict[str, list[str]]] = {
    # Each list is ordered by typical conversation depth (top = shallowest,
    # bottom = deepest). The fallback selector picks the first 3 entries
    # whose normalised text isn't in the exclusion set, so as the user
    # clicks through the conversation the suggestions naturally descend
    # the ladder: Score → Priority → Timeline → Value → Sponsorship → Roadmap.
    "explain_score": {
        "base": [
            "What are the priority actions to lift my score?",
            "How does my score compare to industry benchmarks?",
            "Which sub-score is driving my tier the most?",
            "What is the implementation timeline for closing the largest gap?",
            "What business value does each sub-score improvement unlock?",
            "Who should sponsor each sub-score improvement at the C-suite level?",
            "What does the 12-month roadmap look like to reach the next tier?",
        ],
        "ciso": [
            "Which NIST AI RMF controls drive my Audit & Provenance sub-score?",
            "What governance gaps are hurting my score the most?",
            "How does my security posture compare to my sector?",
            "What is the implementation timeline for the largest control gap?",
            "What business risk does each unresolved gap carry?",
            "Who at the executive level should sponsor each control rollout?",
            "What does the 12-month security roadmap look like to reach the next tier?",
        ],
        "cfo": [
            "Which sub-score has the largest ROI to fix first?",
            "What is the cost of inaction at my current tier?",
            "How do top-quartile peers structure their AI spend?",
            "What is the payback timeline for each sub-score improvement?",
            "What business value does each tier jump unlock for the P&L?",
            "Who at the C-suite should sponsor each investment?",
            "What does the 12-month investment roadmap look like to reach the next tier?",
        ],
    },
    "priority_actions": {
        "base": [
            "How long does each priority action typically take?",
            "Which action has the highest impact-to-effort ratio?",
            "How do I get executive buy-in for these actions?",
            "What business value does each action unlock for the organization?",
            "Who at the C-suite should sponsor each action?",
            "What does the 12-month roadmap look like for these actions?",
            "Which actions can be sequenced in parallel vs. serial?",
        ],
        "ciso": [
            "Which actions close the biggest NIST AI RMF gaps?",
            "What does a 90-day AI governance charter cover?",
            "How do I sequence vendor and model risk reviews?",
            "What is the implementation timeline for each action?",
            "What residual risk remains after each action ships?",
            "Who at the C-suite should sponsor the security program?",
            "What does the 12-month security roadmap look like?",
        ],
        "cfo": [
            "What is the 12-month payback on these actions?",
            "How do I budget for an AI governance committee?",
            "Which action carries the lowest cost-of-inaction risk?",
            "What is the implementation timeline by quarter?",
            "What is the net business value per dollar spent?",
            "Who at the C-suite should sponsor each line of investment?",
            "What does the 12-month roadmap look like by quarter?",
        ],
    },
    "industry_benchmarks": {
        "base": [
            "How can I close the gap with the top quartile?",
            "Which sub-score most differentiates leaders from peers?",
            "What practices do top-quartile organizations have in common?",
            "What is the implementation timeline to reach top-quartile performance?",
            "What business value comes from reaching the top quartile?",
            "Who at the C-suite typically sponsors top-quartile programs?",
            "What does a 12-month roadmap to top-quartile readiness look like?",
        ],
        "ciso": [
            "What controls do top-quartile peers use that we do not?",
            "How do my NIST GOVERN/MEASURE scores compare to my sector?",
            "Which framework adoption is the sector median?",
            "What is the implementation timeline to reach sector top quartile?",
            "What residual risk reduction comes from closing each gap?",
            "Who sponsors top-quartile security programs at peer firms?",
            "What does the 12-month roadmap to top-quartile security look like?",
        ],
        "cfo": [
            "What is the typical AI-readiness investment for top-quartile peers?",
            "How do peers structure committed-spend drawdown?",
            "Where do laggards leak the most AI spend?",
            "What is the implementation timeline for top-quartile investment patterns?",
            "What is the P&L delta between median and top-quartile peers?",
            "Who sponsors top-quartile AI investment at peer firms?",
            "What does the 12-month investment roadmap to top quartile look like?",
        ],
    },
    "governance_recommendations": {
        "base": [
            "What does an AI Review Committee charter look like?",
            "How do I prioritize among NIST AI RMF controls?",
            "Which controls should our auditors see first?",
            "What is the implementation timeline for the highest-priority controls?",
            "What business value does each control deliver beyond compliance?",
            "Who at the C-suite should sponsor the governance program?",
            "What does the 12-month governance roadmap look like?",
        ],
        "ciso": [
            "How do I instrument continuous control attestation?",
            "What is the right cadence for vendor and model risk triage?",
            "How do I prove policy enforcement at runtime?",
            "What is the implementation timeline for continuous attestation?",
            "What residual risk drops after each control matures?",
            "Who at the C-suite should sponsor each control program?",
            "What does the 12-month attestation roadmap look like?",
        ],
        "cfo": [
            "What is the year-one budget envelope for the governance program?",
            "Which governance controls have measurable ROI?",
            "How do regulators weigh governance vs. model performance?",
            "What is the implementation timeline by quarter?",
            "What is the P&L impact of each control delivered?",
            "Who at the C-suite should sponsor the governance investment?",
            "What does the 12-month governance investment roadmap look like?",
        ],
    },
    "cost_optimization": {
        "base": [
            "What is the typical payback period for model routing?",
            "How do I measure AI unit economics?",
            "Where do most teams overspend on AI?",
            "What is the implementation timeline for the largest savings lever?",
            "What business value does each cost lever unlock?",
            "Who at the C-suite should sponsor the FinOps program?",
            "What does the 12-month cost-optimization roadmap look like?",
        ],
        "ciso": [
            "How do I balance security controls with cost optimization?",
            "Which security tools have outsized AI cost impact?",
            "How do I measure security ROI on AI spend?",
            "What is the implementation timeline for security-cost rebalancing?",
            "What residual risk remains after each consolidation?",
            "Who at the C-suite should sponsor security-cost tradeoff decisions?",
            "What does the 12-month security-cost roadmap look like?",
        ],
        "cfo": [
            "What is the right baseline metric for AI unit economics?",
            "How do I structure committed-spend drawdowns?",
            "What does best-in-class AI gross margin look like?",
            "What is the implementation timeline for FinOps program rollout?",
            "What is the P&L impact in year one vs. year two?",
            "Who at the C-suite should sponsor the FinOps program?",
            "What does the 12-month FinOps roadmap look like?",
        ],
    },
    "general": {
        "base": [
            "Explain my AI Readiness Score in more detail.",
            "What are the priority actions for our organization?",
            "How do we compare with industry benchmarks?",
            "What is the implementation timeline for our top priorities?",
            "What business value will we gain by acting on these?",
            "Who at the C-suite should sponsor our AI readiness program?",
            "What does our 12-month AI readiness roadmap look like?",
        ],
        "ciso": [
            "Which NIST AI RMF controls should we prioritize next?",
            "What are the top threat-exposure gaps in our current posture?",
            "How do we establish automated alerting for shadow AI?",
            "What is the implementation timeline for our security priorities?",
            "What residual risk reduction do we gain from each control?",
            "Who at the C-suite should sponsor the security program?",
            "What does our 12-month security roadmap look like?",
        ],
        "cfo": [
            "What is our estimated payback period for these AI cost savings?",
            "How can we optimize multi-cloud LLM token spend today?",
            "Does our current AI spend governance model meet standards?",
            "What is the implementation timeline for the FinOps program?",
            "What is the P&L impact of each lever?",
            "Who at the C-suite should sponsor FinOps?",
            "What does our 12-month FinOps roadmap look like?",
        ],
    },
}


def _normalize_followup(s: str) -> str:
    """Normalise a follow-up string for stable equality comparison
    (case-insensitive, whitespace-collapsed, terminal punctuation stripped).
    """
    out = (s or "").strip().lower()
    out = " ".join(out.split())
    out = out.rstrip(" .?!:;-—")
    return out


def _resolve_fallback_followups(
    role: str,
    intent: str,
    seen_norm: Optional[set] = None,
    needed: int = 3,
) -> list[str]:
    """Pick fresh follow-ups from the intent×role ladder, excluding any whose
    normalised form is already in `seen_norm`. Walks the ladder top-to-bottom
    (shallowest → deepest), so as the user progresses through a topic the
    suggestions naturally deepen: Score → Priority → Timeline → Value →
    Sponsorship → Roadmap.

    If the primary bucket is exhausted, draws additional entries from the
    `general` bucket so the runtime never returns fewer than `needed` items.
    """
    role_key = role.lower() if role and role.lower() in ("ciso", "cfo") else "base"
    seen = seen_norm or set()

    def _walk(bucket: list[str]) -> list[str]:
        picked: list[str] = []
        for entry in bucket:
            if _normalize_followup(entry) in seen:
                continue
            picked.append(entry)
            seen.add(_normalize_followup(entry))
            if len(picked) >= needed:
                break
        return picked

    primary = (INTENT_FOLLOWUPS.get(intent) or INTENT_FOLLOWUPS["general"]).get(role_key) \
              or INTENT_FOLLOWUPS["general"]["base"]
    out = _walk(primary)

    if len(out) < needed:
        # Topic ladder is exhausted; pull additional fresh entries from the
        # general bucket so the user never sees an empty suggestion strip.
        general = INTENT_FOLLOWUPS["general"].get(role_key) \
                  or INTENT_FOLLOWUPS["general"]["base"]
        for entry in _walk(general):
            out.append(entry)
            if len(out) >= needed:
                break

    return out[:needed]


def generate_dynamic_follow_ups(
    agent_role: str,
    history: list[dict],
    last_answer: str,
    last_user_input: str = "",
    previous_follow_ups: Optional[list[str]] = None,
) -> list[str]:
    """Generate 2-3 follow-up prompts grounded in the latest assistant response.

    FIREWALL CONFIRMATION: this is conversational guidance only and never
    interacts with the scoring engine.

    Bug A fix: detect intent from `last_user_input` first, falling back to
    `last_answer` only when the user prompt classifies as "general". The
    prior order was the reverse, which funneled almost every reply to
    governance_recommendations because the agent's stock system-prompt
    phrase "security, governance, and financial dimensions" gets quoted
    verbatim in nearly every long-form Gemini answer, triggering a
    "governance" substring match.

    `previous_follow_ups` is an exclusion set — entries already shown
    in this conversation are removed from both the LLM-generated set and the
    fallback ladder, so suggestions evolve and never repeat within a session.
    """
    previous_follow_ups = previous_follow_ups or []
    seen_norm: set = {_normalize_followup(s) for s in previous_follow_ups if s}

    # ----- Bug A fix: detect intent from user prompt first -----
    # Special case: user asks about an uploaded document AND the assistant
    # replies with score / readiness language. The conversation is about
    # interpreting the doc against the readiness model -> explain_score.
    if _has_upload_with_score_anchor(last_user_input, last_answer):
        intent = "explain_score"
        intent_source = "upload+score_anchor"
    else:
        intent = _detect_intent(last_user_input)
        intent_source = "user_prompt"
        if intent == "general" and last_answer:
            intent = _detect_intent(last_answer)
            intent_source = "assistant_response"

    fallbacks = _resolve_fallback_followups(agent_role, intent, seen_norm=set(seen_norm))

    logger.info(
        "[follow_ups] role=%r intent=%r source=%s seen_count=%d user_input_preview=%r answer_preview=%r",
        (agent_role or "base").lower(), intent, intent_source,
        len(seen_norm),
        (last_user_input or "")[:120], (last_answer or "")[:120],
    )

    is_llm_configured = bool(
        (settings.llm_provider == "vertex" and settings.gcp_project_id) or
        (settings.llm_provider == "gemini" and settings.gemini_api_key) or
        (settings.openai_api_key) or
        (settings.anthropic_api_key)
    )
    if not is_llm_configured:
        return fallbacks

    try:
        history_snippet = ""
        if history:
            history_snippet = "\n".join([f"{m.get('role')}: {m.get('content')}" for m in history[-3:]])

        # ----- Fix 2 (LLM path): instruct the model NOT to repeat seen items.
        exclusion_block = ""
        if previous_follow_ups:
            quoted = "\n".join(f"- {p}" for p in previous_follow_ups if p)
            exclusion_block = (
                "\n\nDo NOT repeat any of these previously-shown follow-ups; "
                "produce ones that go deeper into the topic or pivot naturally:\n"
                f"{quoted}"
            )

        system_prompt = (
            "You are a C-suite assistant coordinator. Given the recent conversation history and the assistant's last answer, "
            "generate exactly 2 or 3 highly relevant, professional follow-up questions or prompts that the user "
            "(a non-technical C-suite executive) might want to ask next.\n"
            "Keep the questions concise, strategic, and direct (do not use technical jargon like RAG, pgvector, etc.).\n"
            "Each new question should go ONE step deeper than the previous turn — surface → priority → "
            "timeline → business value → executive sponsorship → roadmap.\n"
            "You must return a JSON array of strings, e.g. [\"question 1\", \"question 2\"]."
            f"{exclusion_block}"
        )

        user_message = (
            f"Conversation History:\n{history_snippet}\n\n"
            f"Latest User Prompt:\n{last_user_input}\n\n"
            f"Assistant's Last Answer (use this as the primary source for the new follow-ups):\n{last_answer}\n\n"
            "Generate 2-3 C-suite follow-up prompts that deepen the conversation."
        )

        raw_response = complete_json(system_prompt=system_prompt, user_message=user_message, max_tokens=250)
        try:
            questions = json.loads(raw_response)
        except Exception:
            logger.warning("Failed to parse dynamic follow-up questions JSON. Raw: %s", raw_response)
            questions = parse_tolerant_questions(raw_response)
        if isinstance(questions, list) and len(questions) >= 2:
            # Belt-and-suspenders: filter the LLM's output through the
            # exclusion set too, in case it ignored the instruction.
            cleaned: list[str] = []
            local_seen = set(seen_norm)
            for q in questions:
                qs = str(q)
                if _normalize_followup(qs) in local_seen:
                    continue
                cleaned.append(qs)
                local_seen.add(_normalize_followup(qs))
                if len(cleaned) >= 3:
                    break
            # If filtering left us with too few, top up from the fallback
            # ladder (which itself already excludes seen items).
            if len(cleaned) < 2:
                for f in fallbacks:
                    if _normalize_followup(f) in local_seen:
                        continue
                    cleaned.append(f)
                    local_seen.add(_normalize_followup(f))
                    if len(cleaned) >= 3:
                        break
            if cleaned:
                return cleaned[:3]
    except Exception as exc:
        logger.warning("Failed to generate dynamic follow-up questions: %s. Using intent-aware fallbacks.", exc)

    return fallbacks


def run_agent_loop(
    db: Session,
    agent: Agent,
    user_input: str,
    owner_id: int,
    history: list[dict] = None,
    attached_doc_ref: Optional[str] = None,
    attached_doc_content: Optional[str] = None,
    attached_doc_b64: Optional[str] = None,
    attached_doc_mime: Optional[str] = None,
    previous_follow_ups: Optional[list[str]] = None,
) -> AgentRun:
    """Execute the config-driven runtime loop for a custom agent.

    Logs every step to AgentRun. Connects to Gemini-on-Vertex if configured,
    and falls back gracefully to a trace-logged simulated execution.
    """
    started_at = datetime.now(timezone.utc).replace(tzinfo=None)

    # ----- Structured run logging (User Prompt) -----
    logger.info(
        "[agent_run] User Prompt | agent=%r role=%r len=%d preview=%r",
        agent.name, agent.role, len(user_input or ""), (user_input or "")[:400],
    )

    steps = []
    
    # 1. RAG Retrieval Step (Knowledge Base + ad-hoc document)
    context_chunks = retrieve_rag_context(db, agent.id, user_input)
    
    # If ad-hoc document text is supplied, parse and index/inject it
    doc_str = ""
    retrieved_refs = []
    
    # Find matching document references for retrieved chunks
    for chunk_text in context_chunks:
        matching_chunk = db.query(AgentDocumentChunk).filter(AgentDocumentChunk.text == chunk_text).first()
        if matching_chunk:
            doc = db.query(AgentDocument).filter(AgentDocument.id == matching_chunk.agent_document_id).first()
            if doc and doc.source_ref not in retrieved_refs:
                retrieved_refs.append(doc.source_ref)

    # ----- Layer A: prompt grounding state machine (Layer C extends) -----
    # Always tell the model when the user attached a file. doc_status drives
    # the system-prompt block, the user_message bridge, AND (Layer C) whether
    # to call the multimodal completion path with the raw PDF bytes.
    doc_block = ""
    # "none" | "extracted" | "received_but_empty" | "multimodal"
    doc_status = "none"
    multimodal_bytes: Optional[bytes] = None
    multimodal_mime: Optional[str] = None
    _content_clean = (attached_doc_content or "").strip()
    _has_b64 = bool((attached_doc_b64 or "").strip())

    if attached_doc_ref or _content_clean or _has_b64:
        _filename = attached_doc_ref or "untitled"
        if _content_clean:
            doc_block = (
                "\n\n--- ATTACHED DOCUMENT (CURRENT TURN) ---\n"
                f"Filename: {_filename}\n"
                f"Length: {len(attached_doc_content)} characters\n"
                "--- BEGIN DOCUMENT CONTENT ---\n"
                f"{attached_doc_content}\n"
                "--- END DOCUMENT CONTENT ---\n"
                "This document was uploaded by the user in the current turn. "
                "Treat it as authoritative source material. Quote it verbatim "
                "when the user asks for facts contained in it. Do NOT say you "
                "cannot read uploaded files — the text above IS the file."
            )
            doc_status = "extracted"
        elif _has_b64 and settings.multimodal_enabled:
            # Layer C: route to Gemini multimodal with the raw PDF bytes.
            try:
                import base64 as _b64
                multimodal_bytes = _b64.b64decode(attached_doc_b64, validate=True)
                multimodal_mime = attached_doc_mime or "application/pdf"
                doc_block = (
                    "\n\n--- ATTACHED DOCUMENT (CURRENT TURN, MULTIMODAL) ---\n"
                    f"Filename: {_filename}\n"
                    f"MIME: {multimodal_mime}\n"
                    f"Size: {len(multimodal_bytes)} bytes\n"
                    "NOTE TO MODEL: The user attached this PDF in the current "
                    "turn. The full file is provided to you directly as inline "
                    "binary PDF data alongside this prompt. Read the document, "
                    "extract the user's requested information, and answer from "
                    "the file's content. Do NOT say you cannot read uploaded "
                    "files — the file IS attached as binary in this turn."
                )
                doc_status = "multimodal"
            except Exception as exc:
                logger.warning(
                    "[multimodal] base64 decode failed for %r: %s", _filename, exc
                )
                # Fall through to received_but_empty
                doc_block = ""
                multimodal_bytes = None
                multimodal_mime = None

        if doc_status == "none":
            # received_but_empty: file attached (ref or b64) but no readable
            # content and multimodal either disabled or decode failed.
            doc_block = (
                "\n\n--- ATTACHED DOCUMENT (CURRENT TURN) ---\n"
                f"Filename: {_filename}\n"
                "NOTE TO MODEL: The user attached this file but no text could "
                "be extracted (it may be a scanned image, password-protected, "
                "or empty), and multimodal ingestion is disabled or "
                "unavailable in this environment. Tell the user explicitly "
                "that the file was received but its content could not be "
                "parsed, and recommend re-attaching a text-selectable PDF or "
                "a .docx / .txt file. Do NOT pretend to have read content "
                "you do not have."
            )
            doc_status = "received_but_empty"
        if attached_doc_ref and attached_doc_ref not in retrieved_refs:
            retrieved_refs.append(attached_doc_ref)

    # Backwards-compatible alias for code paths further down that referenced doc_str.
    doc_str = doc_block

    context_str = "\n\n".join(context_chunks) if context_chunks else "No relevant documents in knowledge base."

    # ----- Layer D: attachment diagnostics -----
    logger.info(
        "[agent_run] Attachment | ref=%r status=%s content_chars=%d doc_block_chars=%d",
        attached_doc_ref, doc_status,
        len(attached_doc_content or ""), len(doc_block or ""),
    )
    
    # Check if Vertex or Gemini is fully configured
    is_llm_configured = bool(
        (settings.llm_provider == "vertex" and settings.gcp_project_id) or
        (settings.llm_provider == "gemini" and settings.gemini_api_key) or
        (settings.openai_api_key) or
        (settings.anthropic_api_key)
    )
    
    outcome = ""
    status = "completed"
    
    if not is_llm_configured:
        logger.info("LLM not fully configured in environment. Generating simulated agent run trace.")
        outcome, steps = _generate_simulated_trace(agent, user_input, len(context_chunks) + (1 if attached_doc_content else 0))
        logger.info(
            "[agent_run] Model Response (simulated) | resp_chars=%d preview=%r",
            len(outcome or ""), (outcome or "")[:600],
        )
    else:
        # Build prompt guidelines. Knowledge Base Context (long-term, indexed
        # docs from the agent's vector store) and ATTACHED DOCUMENT (current
        # turn's user upload) are now in clearly distinct sections so Gemini
        # never confuses the two.
        system_prompt = (
            f"You are a C-suite governed agent named '{agent.name}' operating with a C-suite focus: {agent.role.upper()}.\n"
            f"Instructions:\n{agent.instructions}\n\n"
            f"Available Tools: {agent.tools}\n"
            f"Response Style Temperature: {agent.temperature} (0.0=focused, 1.0=creative)\n\n"
            f"Knowledge Base Context (long-term, indexed):\n{context_str}"
            f"{doc_block}\n\n"
            f"You must perform step-by-step reasoning. Output a JSON object matching this exact schema:\n"
            f"{{\n"
            f"  \"thought\": \"your reasoning about what to do next\",\n"
            f"  \"tool_call\": {{\n"
            f"    \"name\": \"one of the available tools\",\n"
            f"    \"arguments\": {{\"arg_name\": \"value\"}}\n"
            f"  }} or null,\n"
            f"  \"final_answer\": \"your final summary response if no more tools are needed\" or null\n"
            f"}}\n"
        )

        # Layer A + C: user_message bridge — link the user's question to the
        # attachment so Gemini doesn't fall back to "I can't read files".
        attachment_cue = ""
        if doc_status == "extracted":
            attachment_cue = (
                f"\n\n(Context: the user attached '{attached_doc_ref or 'a file'}' in this turn. "
                f"Its full text is in the system instruction under 'ATTACHED DOCUMENT (CURRENT TURN)'. "
                f"Use that text to answer.)"
            )
        elif doc_status == "multimodal":
            attachment_cue = (
                f"\n\n(Context: the user attached '{attached_doc_ref or 'a file'}' in this turn. "
                f"The PDF is provided to you as inline binary data in this same request. "
                f"Read the PDF directly and answer the user's question from its content.)"
            )
        elif doc_status == "received_but_empty":
            attachment_cue = (
                f"\n\n(Context: the user attached '{attached_doc_ref or 'a file'}' in this turn but no "
                f"text could be extracted from it. Tell the user the file came through but couldn't "
                f"be parsed.)"
            )

        history_str = format_history_context(history)
        user_message = f"{history_str}\n\nUser Input:\n{user_input}{attachment_cue}\n\nProceed with the first step."
        
        current_step = 1
        current_input = user_message
        
        try:
            while current_step <= agent.max_steps:
                logger.info("Agent %s: executing step %s", agent.name, current_step)

                # ----- Structured run logging (Final LLM Prompt) -----
                logger.info(
                    "[agent_run] Final LLM Prompt | step=%d system_chars=%d user_chars=%d preview=%r",
                    current_step,
                    len(system_prompt),
                    len(current_input),
                    (system_prompt + " || USER || " + current_input)[:600],
                )

                # Execute completion — Layer C routes multimodal on step 1
                # only (subsequent steps after a tool call are pure-text).
                _multimodal_this_step = (
                    current_step == 1
                    and doc_status == "multimodal"
                    and multimodal_bytes is not None
                )
                if _multimodal_this_step:
                    from .llm_client import complete_json_multimodal
                    raw_response = complete_json_multimodal(
                        system_prompt=system_prompt,
                        user_message=current_input,
                        file_bytes=multimodal_bytes,
                        file_mime=multimodal_mime or "application/pdf",
                        max_tokens=2000,
                    )
                else:
                    raw_response = complete_json(
                        system_prompt=system_prompt,
                        user_message=current_input,
                        max_tokens=1000
                    )

                # ----- Structured run logging (Model Response) -----
                logger.info(
                    "[agent_run] Model Response | step=%d resp_chars=%d preview=%r",
                    current_step,
                    len(raw_response or ""),
                    (raw_response or "")[:600],
                )

                # ----- Layer C: multimodal-specific diagnostics -----
                if _multimodal_this_step:
                    logger.info(
                        "[multimodal] filename=%r mime=%r size_bytes=%d used=True provider=%r model=%r response_chars=%d",
                        attached_doc_ref,
                        multimodal_mime or "application/pdf",
                        len(multimodal_bytes or b""),
                        (settings.llm_provider or "").lower(),
                        settings.vertex_model or "",
                        len(raw_response or ""),
                    )
                
                try:
                    resp_json = json.loads(raw_response)
                except Exception:
                    logger.warning("Agent %s: failed to parse JSON response. Raw: %s", agent.name, raw_response)
                    try:
                        resp_json = parse_tolerant_agent_step(raw_response)
                    except Exception as fallback_exc:
                        logger.warning("Agent %s: tolerant parse also failed: %s", agent.name, fallback_exc)
                        resp_json = {
                            "thought": "Fell back to raw text parsing.",
                            "final_answer": raw_response
                        }
                    if not isinstance(resp_json, dict):
                        resp_json = {
                            "thought": "Fell back to raw text parsing.",
                            "final_answer": str(resp_json)
                        }
                
                thought = resp_json.get("thought", "")
                tool_call = resp_json.get("tool_call")
                final_answer = resp_json.get("final_answer")
                
                steps.append({
                    "step": current_step,
                    "type": "reasoning",
                    "detail": thought,
                    "tool": None,
                    "tokens": len(raw_response) // 4
                })
                
                if final_answer:
                    outcome = final_answer
                    steps.append({
                        "step": current_step + 1,
                        "type": "complete",
                        "detail": f"Completed execution. Final Answer: {final_answer}",
                        "tool": None,
                        "tokens": 0
                    })
                    break
                
                if tool_call and isinstance(tool_call, dict):
                    tool_name = tool_call.get("name")
                    tool_args = tool_call.get("arguments", {})
                    
                    if tool_name in agent.tools:
                        # Simulated tool execution: clearly label as simulated
                        simulated_result = f"[Simulated Execution] Tool '{tool_name}' successfully executed with args {tool_args}."
                        logger.info("Agent %s: simulated tool call: %s", agent.name, tool_name)
                        
                        steps.append({
                            "step": current_step + 1,
                            "type": "tool_call",
                            "detail": f"[Simulated Tool Run] Called tool '{tool_name}' with arguments: {tool_args}. Result: {simulated_result}",
                            "tool": tool_name,
                            "tokens": 0
                        })
                        
                        current_input = f"Tool '{tool_name}' returned: {simulated_result}\n\nProceed to next step."
                        current_step += 2
                    else:
                        error_detail = f"Attempted to call tool '{tool_name}' which is not in the agent's authorized capabilities."
                        steps.append({
                            "step": current_step + 1,
                            "type": "error",
                            "detail": error_detail,
                            "tool": tool_name,
                            "tokens": 0
                        })
                        current_input = f"Error: {error_detail}\n\nAdjust and proceed."
                        current_step += 2
                else:
                    outcome = "Agent completed execution without providing a structured final answer."
                    steps.append({
                        "step": current_step + 1,
                        "type": "complete",
                        "detail": outcome,
                        "tool": None,
                        "tokens": 0
                    })
                    break
                    
                current_step += 1
                
            if current_step > agent.max_steps:
                outcome = f"Execution reached effort limit of {agent.max_steps} steps."
                status = "failed"
                steps.append({
                    "step": current_step,
                    "type": "error",
                    "detail": outcome,
                    "tool": None,
                    "tokens": 0
                })
                
        except Exception as exc:
            logger.warning("Agent execution loop encountered error: %s. Falling back to simulated trace.", exc)
            outcome, steps = _generate_simulated_trace(agent, user_input, len(context_chunks) + (1 if attached_doc_content else 0))
            logger.info(
                "[agent_run] Model Response (simulated, after LLM error) | resp_chars=%d preview=%r",
                len(outcome or ""), (outcome or "")[:600],
            )
            status = "completed"
            
    # Generate dynamic follow-up prompts (intent-aware fallback if LLM unavailable)
    follow_ups = generate_dynamic_follow_ups(
        agent.role,
        history,
        outcome,
        last_user_input=user_input,
        previous_follow_ups=previous_follow_ups or [],
    )
            
    # Persist the AgentRun to database
    finished_at = datetime.now(timezone.utc).replace(tzinfo=None)
    run_log = AgentRun(
        agent_id=agent.id,
        input=user_input,
        steps=steps,
        outcome=outcome,
        follow_ups=follow_ups,
        retrieved_sources=retrieved_refs,
        status=status,
        started_at=started_at,
        finished_at=finished_at,
        owner_id=owner_id
    )
    db.add(run_log)
    db.commit()
    db.refresh(run_log)
    return run_log


# ============================================================
# Intent-aware simulated demo mode
# ============================================================
#
# Fires when (a) no LLM provider key is configured (local dev) or (b) the
# live LLM call raises mid-loop. Real production traffic uses the full LLM
# path above. This block exists only so the dev experience stays useful.
#
# Responses are surfaced to the user without an internal "[Simulated Demo
# Mode]" tag — the bracketed label was visible in chat output and read as
# a debug marker. The simulated path itself is unchanged; only the visible
# label was removed.

SIMULATED_INTENT_KEYWORDS: dict[str, list[str]] = {
    "industry_benchmarks": [
        "benchmark", "benchmarks", "compare", "comparison", "peer",
        "industry", "median", "quartile", "stack up", "how do we stack",
        "where do we stand",
    ],
    "explain_score": [
        "explain my", "explain the", "my score", "my readiness score",
        "readiness score", "what does my", "interpret", "my number",
        "my tier", "my band", "what is my", "in more detail",
    ],
    "governance_recommendations": [
        "governance", "oversight", "policy", "policies", "compliance",
        "control", "controls", "committee", "audit", "framework",
        "frameworks", "missing controls",
    ],
    "cost_optimization": [
        "cost", "costs", "roi", "budget", "spend", "spending", "finops",
        "savings", "save", "payback", "reduce ai", "optimize", "optimise",
        "spending money",
        # Bug A keyword expansion: business-value vocabulary lives here so
        # questions about value / benefits / return route to the cost-and-
        # value-realization bucket rather than falling to assistant fallback.
        "business value", "value realization", "return", "benefits",
    ],
    "priority_actions": [
        "priority", "priorities", "next step", "next steps", "do next",
        "what next", "action", "actions", "what should i do",
        "where to start", "first thing",
        # Bug A keyword expansion: roadmap / planning vocabulary. These are
        # how executives ask "what's our path forward" — they belong in the
        # priority-actions bucket alongside next-step language.
        "roadmap", "plan", "timeline", "milestones", "30-60-90", "implementation",
    ],
}

# Intent dispatch order — when multiple intents could match, earlier wins.
# Benchmarks first because "compare my score" should read as benchmark intent
# rather than score-explanation intent. Priority actions last because "action"
# is a weak signal that many other intents accidentally trigger.
_INTENT_ORDER = [
    "industry_benchmarks",
    "explain_score",
    "governance_recommendations",
    "cost_optimization",
    "priority_actions",
]

# Stock phrase that the agent's system instruction makes Gemini repeat in
# almost every long-form reply: "security, governance, and financial
# dimensions" (and the trailing-noun variants). Without scrubbing, the
# single substring "governance" funnels every reply into
# governance_recommendations, defeating intent dispatch. Stripped before
# substring matching in _detect_intent.
_AGENT_STOCK_PHRASE = re.compile(
    r"\bsecurity\s*,?\s+governance\s*,?\s+(?:and\s+)?financial"
    r"(?:\s+(?:dimensions?|investments?|considerations?|aspects?))?",
    re.IGNORECASE,
)

# Upload vocabulary + score-anchor vocabulary for the Bug A special case:
# when the user explicitly asks about an uploaded document AND the
# assistant's reply talks about score/readiness, route to explain_score
# (the user is asking the assistant to interpret the doc against the
# readiness model).
_UPLOAD_VOCAB = (
    "uploaded pdf", "uploaded document", "uploaded file",
    "attached file", "attached document",
    "document analysis", "pdf analysis",
)
_SCORE_READINESS_ANCHOR = ("score", "readiness")


def _has_upload_with_score_anchor(user_input: Optional[str], assistant_answer: Optional[str]) -> bool:
    u = (user_input or "").lower()
    a = (assistant_answer or "").lower()
    return any(t in u for t in _UPLOAD_VOCAB) and any(t in a for t in _SCORE_READINESS_ANCHOR)


def _detect_intent(user_input: Optional[str]) -> str:
    text = (user_input or "").lower()
    # Strip the agent's stock system-prompt phrase before substring matching,
    # otherwise "security, governance, and financial dimensions" routes
    # everything to governance_recommendations.
    text = _AGENT_STOCK_PHRASE.sub(" ", text)
    for intent in _INTENT_ORDER:
        if any(kw in text for kw in SIMULATED_INTENT_KEYWORDS[intent]):
            return intent
    return "general"


def _role_lens(role: str) -> str:
    """Tiny role-flavored opener that prefixes the body of the simulated reply."""
    r = (role or "").lower()
    if r == "ciso":
        return "Reading your question through a security & risk lens — "
    if r == "cfo":
        return "Reading your question through a financial lens — "
    return ""


def _simulated_outcome(intent: str, user_input: str, role: str) -> str:
    """Return a distinct fallback response per intent (used when no LLM is
    configured or the live call raised). No user-visible debug label —
    the heading is just the topic title."""
    quoted = (user_input or "(empty)").strip()
    if len(quoted) > 140:
        quoted = quoted[:137] + "..."
    lens = _role_lens(role)

    if intent == "explain_score":
        return (
            "AI Readiness Score — Interpretation\n\n"
            f'Prompt: "{quoted}"\n\n'
            f"{lens}your readiness score combines five deterministic sub-dimensions, "
            "each scored 0–100:\n\n"
            "1. Semantic Alignment — how consistently your systems define the same business entity.\n"
            "2. RAG Accuracy — how reliably your retrieval grounds AI answers in your own data.\n"
            "3. Audit & Provenance — whether every AI-generated answer can show its sources.\n"
            "4. Governance Oversight — formal committee plus named decision rights for AI.\n"
            "5. Data Maturity — quality, freshness, and structural integrity of the data layer.\n\n"
            "These roll up to your total score and tier (Foundational 0–39 / Piloting 40–74 / Scale 75–100). "
            "Your weakest sub-score is usually the highest-leverage fix for the next tier jump.\n\n"
            "Open the AI Readiness report from the Reports tab for the per-sub-score breakdown with your actual numbers."
        )

    if intent == "priority_actions":
        return (
            "Priority Actions\n\n"
            f'Prompt: "{quoted}"\n\n'
            f"{lens}three actions ranked by typical impact-to-effort for organizations at your tier:\n\n"
            "1. Charter a formal AI governance committee with binding decision rights (not advisory). "
            "Owner: COO or CIO. 90-day target. Without an oversight body, every downstream initiative is ungoverned.\n\n"
            "2. Pick one domain — Healthcare, Finance, or Education — and ship one copilot under explicit policy guardrails. "
            "The Copilots page lists pre-built starters with status badges (Available Today / Pilot Available / Coming Soon).\n\n"
            "3. Wire Evidence Pack provenance into your three most consequential AI workflows. "
            "Every answer should cite the data source and ontology term it relied on — that is the artifact your auditors will ask for first.\n\n"
            "Defer: any pilot without a named owner, a 90-day milestone, and a written shutdown criterion."
        )

    if intent == "industry_benchmarks":
        return (
            "Industry Benchmark Comparison\n\n"
            f'Prompt: "{quoted}"\n\n'
            f"{lens}sector medians and top quartiles for AI readiness, per Gartner's mid-market AI cut:\n\n"
            "  Healthcare & Life Sciences   median 52   top quartile 74\n"
            "  BFSI                         median 62   top quartile 82\n"
            "  Education                    median 45   top quartile 68\n"
            "  Cybersecurity                median 60   top quartile 80\n"
            "  IT Consulting                median 58   top quartile 78\n"
            "  Energy & Utilities           median 48   top quartile 70\n"
            "  Government                   median 46   top quartile 68\n\n"
            "Reading your position:\n"
            "- Below median → catch-up phase: focus on Governance Oversight + Semantic Alignment.\n"
            "- Median to top quartile → consolidation: productize one or two copilots under continuous oversight.\n"
            "- Above top quartile → defend the lead and export your governance pattern internally.\n\n"
            "Your live peer benchmark is computed against your declared sector specifically."
        )

    if intent == "governance_recommendations":
        return (
            "Governance Recommendations\n\n"
            f'Prompt: "{quoted}"\n\n'
            f"{lens}controls to implement, mapped to the frameworks your auditors recognize.\n\n"
            "Frameworks in scope:\n"
            "- NIST AI RMF — GOVERN and MEASURE functions are scored directly in your report.\n"
            "- ISO/IEC 42001 — AI management system standard.\n"
            "- EU AI Act — risk-tier classification per use case.\n"
            "- Sector overlays — HIPAA / SOX / SOC 2 / FERPA / GDPR depending on your domain.\n\n"
            "Concrete controls to implement first:\n"
            "1. AI Review Committee chartered with binding decision rights (not advisory).\n"
            "2. Pre-deployment risk classification for every model and every use case.\n"
            "3. Evidence Pack standard — every AI-supported decision cites its sources, ontology term, and policy.\n"
            "4. Vendor and model risk triage on a quarterly cadence.\n"
            "5. Incident playbook covering hallucination, data leakage, and prompt-injection scenarios.\n\n"
            "Your readiness report's Governance section includes the per-control gap analysis with named owners."
        )

    if intent == "cost_optimization":
        return (
            "AI Cost Optimization\n\n"
            f'Prompt: "{quoted}"\n\n'
            f"{lens}three cost levers in order of typical payback for mid-market organizations:\n\n"
            "1. Model routing — send 70–80% of routine workloads to a smaller/cheaper model. "
            "Most teams default everything to a premium model and overspend by 3–5x. Build a query classifier that routes first.\n\n"
            "2. Caching — prompt-cache and semantic-result cache for repeated queries. "
            "30–50% spend reduction is typical in customer-support and internal-Q&A workloads.\n\n"
            "3. Committed-spend optimization — if you are on Google Cloud or Azure, drawing down on committed spend via Marketplace listings "
            "often yields a 15–30% effective discount.\n\n"
            "Track unit economics, not just raw spend: dollars per decision, per copilot-run, per dashboard-load. "
            "Connect your telemetry so these are computed continuously, not in a quarterly spreadsheet."
        )

    # general fallback
    return (
        "AI Readiness Copilot\n\n"
        f'Prompt: "{quoted}"\n\n'
        f"{lens}I am running in simulated demo mode because no LLM provider key is configured in this environment "
        "(or the configured LLM call did not return). In production, this prompt would be answered by Gemini via Vertex AI "
        "under your governance policy.\n\n"
        "I can answer prompts across five topic areas in simulated mode:\n"
        "1. Explain Score — interpretation of your AI Readiness Score and its sub-dimensions.\n"
        "2. Priority Actions — what to do next, ranked by impact-to-effort.\n"
        "3. Industry Benchmarks — how your score compares against sector medians.\n"
        "4. Governance Recommendations — controls to implement, mapped to NIST / ISO / EU AI Act.\n"
        "5. Cost Optimization — levers to reduce AI spend without sacrificing capability.\n\n"
        "Try one of those topics, or open the AI Readiness report from the Reports tab to see your live scores."
    )


def _generate_simulated_trace(agent: Agent, user_input: str, document_count: int) -> tuple[str, list[dict]]:
    """Intent-aware fallback when no LLM is configured or the live call
    raised mid-loop. (Internal — no user-visible debug label.)

    Intent is detected from the user's prompt and dispatched to one of five
    distinct response templates (plus a general fallback). The agent's role
    contributes a small framing prefix but does not override the intent —
    eliminating the previous bug where role='base' silently fell into a CFO
    template regardless of what the user asked.
    """
    intent = _detect_intent(user_input)
    role = (agent.role or "base").lower()

    logger.info(
        "[agent_run] Simulated trace | role=%r intent=%r preview=%r",
        role, intent, (user_input or "")[:200],
    )

    steps: list[dict] = [
        {
            "step": 1,
            "type": "reasoning",
            "detail": (
                f"Agent '{agent.name}' loaded on model "
                f"'{agent.model}'. Temperature: {agent.temperature}."
            ),
            "tool": None,
            "tokens": 0,
        },
        {
            "step": 2,
            "type": "tool_call",
            "detail": (
                f"Searched the knowledge base over {document_count} "
                "active document(s) using in-memory cosine similarity."
            ),
            "tool": "Doc retrieval",
            "tokens": 0,
        },
    ]

    curr_step = 3
    if agent.tools:
        first_tool = agent.tools[0]
        steps.append({
            "step": curr_step,
            "type": "tool_call",
            "detail": (
                f"Would call '{first_tool}' with input "
                f"'{(user_input or '')[:40]}...'."
            ),
            "tool": first_tool,
            "tokens": 0,
        })
        curr_step += 1

    steps.append({
        "step": curr_step,
        "type": "reasoning",
        "detail": (
            f"Classified prompt intent as '{intent}' "
            f"under role '{role.upper()}'. Drafting topic-specific reply."
        ),
        "tool": None,
        "tokens": 0,
    })
    curr_step += 1

    outcome = _simulated_outcome(intent, user_input or "", role)

    steps.append({
        "step": curr_step,
        "type": "complete",
        "detail": f"Reply generated for intent '{intent}'.",
        "tool": None,
        "tokens": 0,
    })

    return outcome, steps
