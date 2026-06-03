"""Pytest setup: makes the `app` package importable when running tests from backend/."""
import os
import sys
import ssl
import base64
from pathlib import Path

# Insert backend/ at the head of sys.path so `from app.agents.score_agent ...`
# resolves regardless of how pytest is invoked.
sys.path.insert(0, str(Path(__file__).resolve().parent))

# Programmatically bypass SSL verification for local test execution to handle corporate proxy environments.
try:
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    
    import requests
    original_request = requests.Session.request
    
    def patched_request(self, method, url, *args, **kwargs):
        kwargs["verify"] = False
        return original_request(self, method, url, *args, **kwargs)
        
    requests.Session.request = patched_request
except Exception:
    pass

# Extract and combine Windows host certificates and certifi trust store to resolve Windows gRPC SSL certificate issues.
try:
    import certifi
    with open(certifi.where(), "r", encoding="utf-8") as f:
        cert_data = f.read()
except Exception:
    cert_data = ""

# Append certificates from Windows trust store
win_certs = []
try:
    for store_name in ("CA", "ROOT", "AUTHROOT", "MY"):
        for cert_der, encoding, trust in ssl.enum_certificates(store_name):
            if encoding == "der":
                b64_str = base64.b64encode(cert_der).decode("ascii")
                lines = [b64_str[i:i+64] for i in range(0, len(b64_str), 64)]
                pem = "-----BEGIN CERTIFICATE-----\n" + "\n".join(lines) + "\n-----END CERTIFICATE-----\n"
                win_certs.append(pem)
except Exception:
    pass

if win_certs:
    cert_data += "\n" + "\n".join(win_certs)

if cert_data:
    cache_dir = Path(__file__).resolve().parent / ".pytest_cache"
    cache_dir.mkdir(exist_ok=True)
    combined_pem_path = cache_dir / "combined_cacerts.pem"
    with open(combined_pem_path, "w", encoding="utf-8") as f:
        f.write(cert_data)
    
    # Expose combined bundle path to gRPC, OpenSSL, requests, and curl
    os.environ["GRPC_DEFAULT_SSL_ROOTS_FILE_PATH"] = str(combined_pem_path)
    os.environ["SSL_CERT_FILE"] = str(combined_pem_path)
    os.environ["REQUESTS_CA_BUNDLE"] = str(combined_pem_path)
    os.environ["CURL_CA_BUNDLE"] = str(combined_pem_path)

# Initialize Vertex AI with REST transport to bypass gRPC SSL handshake issues on Windows.
try:
    from app.config import settings
    if settings.gcp_project_id:
        import vertexai
        import app.agents.llm_client as llm_client
        
        vertexai.init(
            project=settings.gcp_project_id,
            location=settings.gcp_location or "us-central1",
            api_transport="rest"
        )
        llm_client._vertex_initialised = True
except Exception:
    pass


def pytest_configure(config):
    """Programmatically register the eval marker to prevent warnings."""
    config.addinivalue_line(
        "markers", "eval: run LLM-as-judge evaluation tests"
    )

