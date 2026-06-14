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


def generate_dynamic_follow_ups(agent_role: str, history: list[dict], last_answer: str) -> list[str]:
    """Contact Gemini to generate 2-3 dynamic follow-up prompts from the conversation.
    
    FIREWALL CONFIRMATION: This call is strictly for conversational guidance only
    and never interacts with the scoring engine (score_agent.py).
    """
    # Default fallbacks based on C-suite role
    default_follow_ups = {
        "ciso": [
            "Which NIST AI RMF controls should we prioritize next?",
            "What are the top threat-exposure gaps in our current posture?",
            "How do we establish automated alerting for shadow AI?"
        ],
        "cfo": [
            "What is our estimated payback period for these AI cost savings?",
            "How can we optimize multi-cloud LLM token spend today?",
            "Does our current AI spend governance model meet standards?"
        ],
        "base": [
            "Explain my AI Readiness Score in more detail.",
            "What are the priority actions for our organization?",
            "How do we compare with industry benchmarks?"
        ]
    }
    
    role_key = agent_role.lower() if agent_role.lower() in ["ciso", "cfo"] else "base"
    fallbacks = default_follow_ups[role_key]

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

        system_prompt = (
            "You are a C-suite assistant coordinator. Given the recent conversation history and the assistant's last answer, "
            "generate exactly 2 or 3 highly relevant, professional follow-up questions or prompts that the user "
            "(a non-technical C-suite executive) might want to ask next.\n"
            "Keep the questions concise, strategic, and direct (do not use technical jargon like RAG, pgvector, etc.).\n"
            "You must return a JSON array of strings, e.g. [\"question 1\", \"question 2\"]."
        )
        
        user_message = (
            f"Conversation History:\n{history_snippet}\n\n"
            f"Last Answer:\n{last_answer}\n\n"
            "Generate 2-3 C-suite follow-up prompts."
        )

        raw_response = complete_json(system_prompt=system_prompt, user_message=user_message, max_tokens=250)
        try:
            questions = json.loads(raw_response)
        except Exception:
            logger.warning("Failed to parse dynamic follow-up questions JSON. Raw: %s", raw_response)
            questions = parse_tolerant_questions(raw_response)
        if isinstance(questions, list) and len(questions) >= 2:
            return [str(q) for q in questions[:3]]
    except Exception as exc:
        logger.warning("Failed to generate dynamic follow-up questions: %s. Using role fallbacks.", exc)
        
    return fallbacks


def run_agent_loop(
    db: Session,
    agent: Agent,
    user_input: str,
    owner_id: int,
    history: list[dict] = None,
    attached_doc_ref: Optional[str] = None,
    attached_doc_content: Optional[str] = None
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

    if attached_doc_content:
        # TODO: Implement real PDF/docx parsing + pgvector chunking later in production.
        # Inject ad-hoc doc contents directly into the prompt context for session RAG grounding.
        doc_str = f"\n\n--- AD-HOC ATTACHED DOCUMENT ({attached_doc_ref or 'Attached File'}) ---\n{attached_doc_content}\n-----------------------------------------------------"
        if attached_doc_ref and attached_doc_ref not in retrieved_refs:
            retrieved_refs.append(attached_doc_ref)

    context_str = "\n\n".join(context_chunks) if context_chunks else "No relevant documents in knowledge base."
    
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
        # Build prompt guidelines
        system_prompt = (
            f"You are a C-suite governed agent named '{agent.name}' operating with a C-suite focus: {agent.role.upper()}.\n"
            f"Instructions:\n{agent.instructions}\n\n"
            f"Available Tools: {agent.tools}\n"
            f"Response Style Temperature: {agent.temperature} (0.0=focused, 1.0=creative)\n\n"
            f"Knowledge Base Context:\n{context_str}{doc_str}\n\n"
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
        
        history_str = format_history_context(history)
        user_message = f"{history_str}\n\nUser Input:\n{user_input}\n\nProceed with the first step."
        
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

                # Execute completion
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
            
    # Generate dynamic follow-up prompts
    follow_ups = generate_dynamic_follow_ups(agent.role, history, outcome)
            
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
# All responses are clearly marked [Simulated Demo Mode] so no one mistakes
# them for genuine model output.

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
    ],
    "priority_actions": [
        "priority", "priorities", "next step", "next steps", "do next",
        "what next", "action", "actions", "what should i do",
        "where to start", "first thing",
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


def _detect_intent(user_input: Optional[str]) -> str:
    text = (user_input or "").lower()
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
    """Return a distinct [Simulated Demo Mode] response per intent."""
    quoted = (user_input or "(empty)").strip()
    if len(quoted) > 140:
        quoted = quoted[:137] + "..."
    lens = _role_lens(role)

    if intent == "explain_score":
        return (
            "[Simulated Demo Mode] AI Readiness Score — Interpretation\n\n"
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
            "[Simulated Demo Mode] Priority Actions\n\n"
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
            "[Simulated Demo Mode] Industry Benchmark Comparison\n\n"
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
            "[Simulated Demo Mode] Governance Recommendations\n\n"
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
            "[Simulated Demo Mode] AI Cost Optimization\n\n"
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
        "[Simulated Demo Mode] AI Readiness Copilot\n\n"
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
    """[Simulated Demo Mode] Intent-aware fallback when no LLM is configured
    or the live call raised mid-loop.

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
                f"[Simulated Demo Mode] Agent '{agent.name}' loaded on model "
                f"'{agent.model}'. Temperature: {agent.temperature}. No live LLM call performed."
            ),
            "tool": None,
            "tokens": 0,
        },
        {
            "step": 2,
            "type": "tool_call",
            "detail": (
                f"[Simulated Demo Mode] Searched the knowledge base over {document_count} "
                "active document(s) using in-memory cosine similarity fallback."
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
                f"[Simulated Demo Mode] Would call '{first_tool}' with input "
                f"'{(user_input or '')[:40]}...' — skipped in demo mode."
            ),
            "tool": first_tool,
            "tokens": 0,
        })
        curr_step += 1

    steps.append({
        "step": curr_step,
        "type": "reasoning",
        "detail": (
            f"[Simulated Demo Mode] Classified prompt intent as '{intent}' "
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
        "detail": f"[Simulated Demo Mode] Reply generated for intent '{intent}'.",
        "tool": None,
        "tokens": 0,
    })

    return outcome, steps
