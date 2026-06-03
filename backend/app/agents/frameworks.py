"""FrameworksMapper — turns selected industries + custom text into the
"Frameworks Applied to This Assessment" grid in the report.

Mirrors the CertaintyAI prompt's industry → frameworks table exactly, plus
defensive global additions (Gartner / NIST / EU AI Act / ISO 42001 always
apply; GDPR is always added; HIPAA / PCI DSS are keyword-triggered).

Each framework carries a display name, short id (used for stable React
keys), and an authority URL so the report can link out — that's the
"clickable Source" pattern the CertaintyAI report uses to read as defensible
to a regulator.
"""
from __future__ import annotations

import re

from typing import Iterable, TypedDict


class Framework(TypedDict):
    id: str
    name: str
    category: str          # "AI Governance" | "Privacy" | "Sector" | "Security" | "Quality"
    url: str
    why: str               # one-line rationale shown on hover / in tooltip


# ============================================================
# Catalog
# ============================================================

_CATALOG: dict[str, Framework] = {
    # ---------- Always-on (global) ----------
    "gartner_ai_maturity": {
        "id": "gartner_ai_maturity",
        "name": "Gartner AI Maturity Model",
        "category": "AI Governance",
        "url": "https://www.gartner.com/en/information-technology/glossary/ai-maturity-model",
        "why": "Industry-standard 5-level maturity rubric used to position your readiness tier.",
    },
    "nist_ai_rmf": {
        "id": "nist_ai_rmf",
        "name": "NIST AI RMF 1.0",
        "category": "AI Governance",
        "url": "https://www.nist.gov/itl/ai-risk-management-framework",
        "why": "U.S. federal AI risk-management baseline; we score GOVERN and MEASURE directly.",
    },
    "cmmi": {
        "id": "cmmi",
        "name": "CMMI",
        "category": "Quality",
        "url": "https://cmmiinstitute.com/",
        "why": "Process-maturity model adopted by Fortune-500 IT and engineering orgs.",
    },
    "dcam": {
        "id": "dcam",
        "name": "DCAM (EDM Council)",
        "category": "Data Governance",
        "url": "https://edmcouncil.org/page/dcam",
        "why": "Data-management capability framework used by global banks and asset managers.",
    },
    "eu_ai_act": {
        "id": "eu_ai_act",
        "name": "EU AI Act",
        "category": "AI Governance",
        "url": "https://artificialintelligenceact.eu/",
        "why": "Risk-tiered AI obligations for any system serving EU users from Aug 2024.",
    },
    "iso_42001": {
        "id": "iso_42001",
        "name": "ISO/IEC 42001 (AI Management)",
        "category": "AI Governance",
        "url": "https://www.iso.org/standard/81230.html",
        "why": "First international standard for AI management systems; basis for AI assurance audits.",
    },
    "gdpr": {
        "id": "gdpr",
        "name": "GDPR",
        "category": "Privacy",
        "url": "https://gdpr-info.eu/",
        "why": "Always relevant: AI systems process personal data; explainability is a Recital 71 requirement.",
    },
    "soc2": {
        "id": "soc2",
        "name": "SOC 2",
        "category": "Security",
        "url": "https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2",
        "why": "Common B2B trust baseline; AI vendors are increasingly expected to attest.",
    },

    # ---------- Healthcare ----------
    "hipaa": {
        "id": "hipaa",
        "name": "HIPAA",
        "category": "Sector",
        "url": "https://www.hhs.gov/hipaa/index.html",
        "why": "Protects U.S. PHI; AI workflows touching patient data must meet the Privacy & Security Rules.",
    },
    "hitech": {
        "id": "hitech",
        "name": "HITECH",
        "category": "Sector",
        "url": "https://www.hhs.gov/hipaa/for-professionals/special-topics/hitech-act-enforcement-interim-final-rule/index.html",
        "why": "Strengthens HIPAA enforcement; breach-notification stakes are material for AI logging.",
    },
    "fda_ai_ml": {
        "id": "fda_ai_ml",
        "name": "FDA AI/ML Guidance",
        "category": "Sector",
        "url": "https://www.fda.gov/medical-devices/software-medical-device-samd/artificial-intelligence-and-machine-learning-software-medical-device",
        "why": "Required for AI/ML-as-medical-device; defines predetermined change-control plans.",
    },
    "iso_27799": {
        "id": "iso_27799",
        "name": "ISO 27799",
        "category": "Sector",
        "url": "https://www.iso.org/standard/62777.html",
        "why": "Health-informatics security management; complements HIPAA for non-U.S. deployments.",
    },

    # ---------- Education ----------
    "ferpa": {
        "id": "ferpa",
        "name": "FERPA",
        "category": "Sector",
        "url": "https://studentprivacy.ed.gov/",
        "why": "Protects U.S. student records; AI tutoring and analytics systems are in scope.",
    },
    "coppa": {
        "id": "coppa",
        "name": "COPPA",
        "category": "Sector",
        "url": "https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa",
        "why": "Online services collecting data on under-13s; AI personalization triggers consent requirements.",
    },

    # ---------- BFSI ----------
    "pci_dss": {
        "id": "pci_dss",
        "name": "PCI DSS",
        "category": "Sector",
        "url": "https://www.pcisecuritystandards.org/",
        "why": "Required wherever cardholder data is processed; AI fraud models must respect data-isolation rules.",
    },
    "sox": {
        "id": "sox",
        "name": "SOX",
        "category": "Sector",
        "url": "https://www.sec.gov/about/laws/soa2002.pdf",
        "why": "Section 404 ICFR controls — AI in financial reporting must produce auditable evidence.",
    },
    "glba": {
        "id": "glba",
        "name": "GLBA",
        "category": "Sector",
        "url": "https://www.ftc.gov/business-guidance/privacy-security/gramm-leach-bliley-act",
        "why": "Safeguards Rule applies to non-public personal info; AI personalization is in scope.",
    },
    "basel_iii": {
        "id": "basel_iii",
        "name": "Basel III",
        "category": "Sector",
        "url": "https://www.bis.org/bcbs/basel3.htm",
        "why": "Model risk management (BCBS 239) explicitly covers AI / advanced-analytics models.",
    },
    "iso_22301": {
        "id": "iso_22301",
        "name": "ISO 22301 (BCM)",
        "category": "Sector",
        "url": "https://www.iso.org/standard/75106.html",
        "why": "Business-continuity standard; AI dependencies must appear in BIA and recovery plans.",
    },

    # ---------- Energy & Utilities ----------
    "nerc_cip": {
        "id": "nerc_cip",
        "name": "NERC CIP",
        "category": "Sector",
        "url": "https://www.nerc.com/pa/Stand/Pages/CIPStandards.aspx",
        "why": "Bulk-electric-system cybersecurity standards; AI / OT integration requires CIP-013 supply-chain controls.",
    },
    "iec_62443": {
        "id": "iec_62443",
        "name": "IEC 62443",
        "category": "Sector",
        "url": "https://www.iec.ch/blog/understanding-iec-62443",
        "why": "Industrial-automation security baseline; AI-in-OT deployments must zone and conduit correctly.",
    },
    "iso_50001": {
        "id": "iso_50001",
        "name": "ISO 50001",
        "category": "Sector",
        "url": "https://www.iso.org/iso-50001-energy-management.html",
        "why": "Energy-management systems; AI optimization use-cases benefit from documented baselines.",
    },

    # ---------- Legal & Compliance ----------
    "ediscovery": {
        "id": "ediscovery",
        "name": "EDRM / eDiscovery Standards",
        "category": "Sector",
        "url": "https://edrm.net/",
        "why": "Process model for legal-hold and review workflows; AI-assisted review must defend its sampling.",
    },

    # ---------- Engineering & Manufacturing ----------
    "iso_9001": {
        "id": "iso_9001",
        "name": "ISO 9001",
        "category": "Quality",
        "url": "https://www.iso.org/iso-9001-quality-management.html",
        "why": "Quality-management baseline; AI-driven decisions must show controlled-process evidence.",
    },
    "iatf_16949": {
        "id": "iatf_16949",
        "name": "IATF 16949",
        "category": "Sector",
        "url": "https://www.iatfglobaloversight.org/",
        "why": "Automotive quality management; AI in defect-detection requires PPAP-grade traceability.",
    },
    "iso_14001": {
        "id": "iso_14001",
        "name": "ISO 14001",
        "category": "Quality",
        "url": "https://www.iso.org/iso-14001-environmental-management.html",
        "why": "Environmental-management systems; AI-led process optimization should integrate with EMS.",
    },

    # ---------- IT Consulting & Cybersecurity ----------
    "iso_27001": {
        "id": "iso_27001",
        "name": "ISO/IEC 27001",
        "category": "Security",
        "url": "https://www.iso.org/standard/27001",
        "why": "ISMS baseline; the de-facto export-grade trust signal for SaaS and consulting.",
    },
    "nist_csf": {
        "id": "nist_csf",
        "name": "NIST CSF 2.0",
        "category": "Security",
        "url": "https://www.nist.gov/cyberframework",
        "why": "GOVERN function added in 2.0 explicitly addresses AI/ML supply-chain risk.",
    },
    "cis_controls": {
        "id": "cis_controls",
        "name": "CIS Controls v8",
        "category": "Security",
        "url": "https://www.cisecurity.org/controls",
        "why": "Prioritized control set; AI workloads inherit IG3 control expectations.",
    },
    "nist_800_53": {
        "id": "nist_800_53",
        "name": "NIST SP 800-53 r5",
        "category": "Security",
        "url": "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final",
        "why": "Federal control catalog; baseline for FedRAMP and most U.S. govt AI deployments.",
    },

    # ---------- Government ----------
    "fedramp": {
        "id": "fedramp",
        "name": "FedRAMP",
        "category": "Sector",
        "url": "https://www.fedramp.gov/",
        "why": "Required for cloud services sold to U.S. federal agencies; AI workloads have specific overlays.",
    },
    "fisma": {
        "id": "fisma",
        "name": "FISMA",
        "category": "Sector",
        "url": "https://csrc.nist.gov/projects/risk-management/fisma-background",
        "why": "Federal information-security mandate; AI systems are federal information systems.",
    },
    "nist_800_171": {
        "id": "nist_800_171",
        "name": "NIST SP 800-171",
        "category": "Sector",
        "url": "https://csrc.nist.gov/pubs/sp/800/171/r3/final",
        "why": "CUI protection in non-federal systems; defense-industrial-base AI vendors must comply.",
    },
    "cmmc": {
        "id": "cmmc",
        "name": "CMMC 2.0",
        "category": "Sector",
        "url": "https://dodcio.defense.gov/CMMC/",
        "why": "DoD contract gate; AI tools touching CUI require Level 2 certification.",
    },
}


# ============================================================
# Mapping rules
# ============================================================

# Frameworks that always appear (global trust baseline).
_GLOBAL = [
    "gartner_ai_maturity",
    "nist_ai_rmf",
    "cmmi",
    "dcam",
    "eu_ai_act",
    "iso_42001",
    "gdpr",
    "soc2",
]

# Industry slug → framework ids (CertaintyAI-spec).
_BY_INDUSTRY: dict[str, list[str]] = {
    "healthcare":   ["hipaa", "hitech", "fda_ai_ml", "iso_27799"],
    "education":    ["ferpa", "coppa", "iso_27001"],
    "bfsi":         ["pci_dss", "sox", "glba", "basel_iii", "iso_22301"],
    "energy":       ["nerc_cip", "iec_62443", "iso_50001"],
    "legal":        ["ediscovery", "iso_27001"],
    "engineering":  ["iso_9001", "iatf_16949", "iso_14001"],
    "itconsulting": ["iso_27001", "nist_csf", "pci_dss"],
    "cybersecurity": ["iso_27001", "nist_800_53", "cis_controls", "pci_dss", "nist_csf"],
    "government":   ["fedramp", "fisma", "nist_800_171", "cmmc", "nist_800_53"],
}

# Aliases — accept the UI's pretty labels too.
_INDUSTRY_ALIASES: dict[str, str] = {
    "healthcare & life sciences": "healthcare",
    "health":                     "healthcare",
    "education":                  "education",
    "bfsi":                       "bfsi",
    "banking":                    "bfsi",
    "finance":                    "bfsi",
    "financial services":         "bfsi",
    "energy & utilities":         "energy",
    "energy":                     "energy",
    "utilities":                  "energy",
    "legal & compliance":         "legal",
    "legal":                      "legal",
    "engineering & manufacturing": "engineering",
    "manufacturing":              "engineering",
    "engineering":                "engineering",
    "it consulting":              "itconsulting",
    "itconsulting":               "itconsulting",
    "cybersecurity":              "cybersecurity",
    "government":                 "government",
    "public sector":              "government",
}


def _strip_label(s: str) -> str:
    # Strip leading emoji/whitespace/non-alphanumeric chars so labels like
    # "🏥 Healthcare & Life Sciences" canonicalize the same as the bare text.
    cleaned = re.sub(r'^[\s\W_]+', '', s).strip().lower()
    return cleaned


def _canonical(industry: str) -> str | None:
    return _INDUSTRY_ALIASES.get(_strip_label(industry))


def _parse_custom_frameworks(raw: str) -> list[Framework]:
    """Turn the user's free-text Q14 input into Framework dicts so they
    render in the grid alongside the catalog entries."""
    if not raw:
        return []
    items: list[Framework] = []
    for chunk in raw.split(","):
        name = chunk.strip()
        if not name:
            continue
        items.append({
            "id": f"custom_{name.lower().replace(' ', '_')[:32]}",
            "name": name,
            "category": "User-Specified",
            "url": "",
            "why": "Added by you — included so the report reflects your full compliance scope.",
        })
    return items


def resolve_frameworks(
    domains: Iterable[str],
    domains_other: str = "",
    custom_frameworks: str = "",
) -> list[Framework]:
    """Resolve the full Frameworks Applied list for one assessment.

    Rules (CertaintyAI-aligned):
      1. Start with _GLOBAL (Gartner, NIST AI RMF, CMMI, DCAM, EU AI Act,
         ISO 42001, GDPR, SOC 2).
      2. For each selected industry, union in _BY_INDUSTRY.
      3. Keyword sweep on the union of all industry text:
         "health" → HIPAA always added;
         any of {payment, card, bank, finance, fintech, retail} → PCI DSS added.
      4. Parse custom_frameworks free text into Framework dicts and append.
      5. Deduplicate by id; preserve first-seen order.
    """
    selected_ids: list[str] = list(_GLOBAL)
    raw_industries = list(domains) + ([domains_other] if domains_other else [])
    haystack = " ".join(raw_industries).lower()

    for label in raw_industries:
        canon = _canonical(label)
        if canon and canon in _BY_INDUSTRY:
            for fid in _BY_INDUSTRY[canon]:
                if fid not in selected_ids:
                    selected_ids.append(fid)

    # Keyword triggers.
    if "health" in haystack and "hipaa" not in selected_ids:
        selected_ids.append("hipaa")
    pci_triggers = ("payment", "card", "bank", "finance", "fintech", "retail")
    if any(t in haystack for t in pci_triggers) and "pci_dss" not in selected_ids:
        selected_ids.append("pci_dss")

    resolved = [_CATALOG[fid] for fid in selected_ids if fid in _CATALOG]
    resolved.extend(_parse_custom_frameworks(custom_frameworks))
    return resolved


def group_by_category(frameworks: list[Framework]) -> dict[str, list[Framework]]:
    """Group resolved frameworks by category for the report's grid layout."""
    out: dict[str, list[Framework]] = {}
    for f in frameworks:
        out.setdefault(f["category"], []).append(f)
    return out
