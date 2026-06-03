import vertexai
from vertexai.generative_models import GenerativeModel

vertexai.init(project='certaintyai-prod', location='us-central1')
m = GenerativeModel('gemini-2.5-flash')
resp = m.generate_content('Reply with exactly this JSON and nothing else: {"ok": true}')
print(resp.text)
