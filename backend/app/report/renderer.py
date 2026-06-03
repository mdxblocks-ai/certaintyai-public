"""Fills the Jinja2 report template with agent output and returns rendered HTML."""
from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from jinja2 import Environment, FileSystemLoader, select_autoescape

import re
from markupsafe import Markup, escape

logger = logging.getLogger(__name__)

_TEMPLATE_DIR = Path(__file__).resolve().parent
_env = Environment(
    loader=FileSystemLoader(str(_TEMPLATE_DIR)),
    autoescape=select_autoescape(enabled_extensions=("html",)),
    trim_blocks=True,
    lstrip_blocks=True,
)

def md_bold_filter(value: Any) -> Markup:
    if not value:
        return Markup("")
    s = str(value)
    escaped_s = escape(s)
    # Convert **text** to <strong>text</strong> safely
    processed = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', escaped_s)
    return Markup(processed)

_env.filters["md_bold"] = md_bold_filter


def render_report(report_data: dict[str, Any]) -> str:
    """Render the AI Readiness Report HTML from the orchestrator's payload."""
    template = _env.get_template("template.html")
    return template.render(**report_data)


def render_error_page(message: str) -> str:
    """Friendly fallback when the orchestrator fails — keeps the demo from 500ing."""
    return f"""<!doctype html>
<html><head><meta charset="utf-8"><title>Report unavailable</title>
<style>
  body {{ background:#0B1220; color:#E2E8F0; font-family:Inter,system-ui,sans-serif;
          display:flex; align-items:center; justify-content:center; min-height:100vh; margin:0; }}
  .card {{ max-width:520px; padding:32px; border:1px solid #1f2a44; border-radius:14px;
           background:#0F172A; text-align:center; }}
  h1 {{ margin:0 0 8px; font-size:20px; }}
  p  {{ margin:8px 0; color:#94a3b8; font-size:14px; }}
  code {{ background:#111c34; padding:2px 6px; border-radius:4px; font-size:12px; }}
</style></head><body><div class="card">
  <h1>Report generation hit a snag.</h1>
  <p>Your survey was saved. The orchestrator couldn't complete this run.</p>
  <p><code>{message}</code></p>
  <p>Re-submit the survey or check the backend logs for details.</p>
</div></body></html>"""
