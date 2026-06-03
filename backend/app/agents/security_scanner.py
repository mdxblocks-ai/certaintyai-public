"""Security Ingestion Heuristic Filter — detects and neutralizes prompt injections."""
import re
import logging

logger = logging.getLogger(__name__)

# List of regex signatures for common injection and command-override hacks
PROMPT_INJECTION_PATTERNS = [
    r"(?i)ignore\s+(all\s+)?previous\s+instructions",
    r"(?i)system\s+override",
    r"(?i)you\s+are\s+now\s+a",
    r"(?i)forget\s+(what\s+)?you\s+were\s+told",
    r"(?i)disregard\s+prior\s+rules",
    r"(?i)override\s+scoring",
    r"(?i)give\s+(us\s+)?(a\s+)?score\s+of\s+100",
    r"<script\b[^>]*>([\s\S]*?)<\/script>", # html javascript blocks
    r"javascript:[\s\S]*?",
    r"SELECT\s+.*\s+FROM\s+.*", # basic SQL injection patterns
    r"UNION\s+SELECT\s+.*",
]

def sanitize_and_scan_input(text: str, auto_strip: bool = True) -> tuple[str, bool]:
    """Scans and sanitizes free-text fields.
    
    If an injection pattern is detected:
      - If auto_strip is True: Strips out the malicious sentences/lines, logging the attempt.
      - Returns (sanitized_text, was_flagged).
    """
    if not text:
        return "", False
        
    was_flagged = False
    
    # 1. Scan the whole block against our known signatures
    for pattern in PROMPT_INJECTION_PATTERNS:
        if re.search(pattern, text):
            was_flagged = True
            logger.warning("PROMPT INJECTION SCANNED AND FLAGGED: Pattern matched '%s'", pattern)
            break
            
    # 2. Sanitization: Split by sentences or lines, and filter out any sentence containing an injection keyword
    if was_flagged and auto_strip:
        # Break text into separate sentences/lines
        lines = text.split("\n")
        clean_lines = []
        for line in lines:
            line_flagged = False
            for pattern in PROMPT_INJECTION_PATTERNS:
                if re.search(pattern, line):
                    line_flagged = True
                    break
            if not line_flagged:
                clean_lines.append(line)
            else:
                logger.info("Stripped malicious line from input: %r", line)
        
        sanitized = "\n".join(clean_lines).strip()
        # Fallback to standard safe default if the entire input was malicious
        if not sanitized:
            sanitized = "Standard compliance review requested."
        return sanitized, True
        
    return text, was_flagged
