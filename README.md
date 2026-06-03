# CertaintyAI

Ontology-driven Enterprise AI for regulated industries — from MDxBlocks Inc.
Take a 2-minute survey and get an instant, governed, explainable AI Readiness Report.

## Run

```powershell
# Backend
cd backend; python -m venv .venv; .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

```powershell
# Frontend (new terminal)
cd frontend; npm install; npm run dev
```

Then open <http://localhost:5173/>.

> Before the first `uvicorn` run, copy `backend/.env.example` to
> `backend/.env` and paste your real API key
> (`ANTHROPIC_API_KEY` on-spec, or `OPENAI_API_KEY` with
> `LLM_PROVIDER=openai` for local dev).

## Demo login

Password for all demo accounts: `Certainty2026!`

| Email | Role (cosmetic) |
|---|---|
| `demo@mdxblocks.com` | Demo Admin |
| `cto@acmehealth.com` | Healthcare CTO |
| `dean@stateuniversity.edu` | Education Leader |
| `ciso@fintrust.com` | Cybersecurity Leader |
| `pm@itconsult.io` | IT Consulting PM |

On first startup the demo user is auto-seeded with one pre-generated
report so `/profile` has something to show immediately.
