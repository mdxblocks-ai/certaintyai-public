"""Tests for the FrameworksMapper (Phase 1.5)."""
from app.agents.frameworks import group_by_category, resolve_frameworks


def _ids(frameworks):
    return [f["id"] for f in frameworks]


def test_global_frameworks_always_present():
    fws = resolve_frameworks(domains=[])
    ids = _ids(fws)
    for expected in [
        "gartner_ai_maturity",
        "nist_ai_rmf",
        "cmmi",
        "dcam",
        "eu_ai_act",
        "iso_42001",
        "gdpr",
        "soc2",
    ]:
        assert expected in ids, f"Global framework {expected} missing"


def test_healthcare_adds_sector_frameworks():
    fws = resolve_frameworks(domains=["Healthcare & Life Sciences"])
    ids = _ids(fws)
    assert "hipaa" in ids
    assert "hitech" in ids
    assert "fda_ai_ml" in ids
    assert "iso_27799" in ids


def test_bfsi_adds_full_finance_pack():
    fws = resolve_frameworks(domains=["BFSI"])
    ids = _ids(fws)
    for expected in ["pci_dss", "sox", "glba", "basel_iii", "iso_22301"]:
        assert expected in ids


def test_government_adds_fed_pack():
    fws = resolve_frameworks(domains=["Government"])
    ids = _ids(fws)
    for expected in ["fedramp", "fisma", "nist_800_171", "cmmc", "nist_800_53"]:
        assert expected in ids


def test_keyword_trigger_adds_hipaa_from_freetext_industry():
    fws = resolve_frameworks(domains=[], domains_other="Behavioral Health & Wellness")
    assert "hipaa" in _ids(fws)


def test_keyword_trigger_adds_pci_dss_from_finance_keyword():
    fws = resolve_frameworks(domains=[], domains_other="Retail payments aggregator")
    ids = _ids(fws)
    assert "pci_dss" in ids


def test_custom_frameworks_are_parsed_and_appended():
    fws = resolve_frameworks(
        domains=[],
        custom_frameworks="CCPA, ISO 27018, my-custom-thing",
    )
    custom_names = [f["name"] for f in fws if f["category"] == "User-Specified"]
    assert "CCPA" in custom_names
    assert "ISO 27018" in custom_names
    assert "my-custom-thing" in custom_names


def test_no_duplicates_in_result():
    """Picking healthcare twice + custom IT consulting should not duplicate ISO 27001."""
    fws = resolve_frameworks(
        domains=["Healthcare & Life Sciences", "IT Consulting", "Cybersecurity"],
    )
    ids = _ids(fws)
    assert len(ids) == len(set(ids)), "Frameworks list contains duplicates"


def test_group_by_category_returns_dict_of_lists():
    fws = resolve_frameworks(domains=["Healthcare & Life Sciences"])
    grouped = group_by_category(fws)
    assert isinstance(grouped, dict)
    assert "Sector" in grouped
    assert "AI Governance" in grouped
    # Every framework should appear in exactly one bucket
    flat_count = sum(len(v) for v in grouped.values())
    assert flat_count == len(fws)


def test_all_catalog_frameworks_have_required_fields():
    """Smoke test: every framework dict has the keys the template needs."""
    fws = resolve_frameworks(
        domains=["Healthcare & Life Sciences", "BFSI", "Government", "IT Consulting", "Cybersecurity"],
    )
    for f in fws:
        assert {"id", "name", "category", "url", "why"} <= f.keys()
        assert f["name"]
        assert f["category"]
