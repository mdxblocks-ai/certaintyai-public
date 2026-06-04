# CertaintyAI

Ontology-driven Enterprise AI for regulated industries — from MDxBlocks Inc.
Take a 2-minute survey and get an instant, governed, explainable AI Readiness Report.

## Live Testing URL
The application is deployed on Google Cloud Run and can be tested live at:
**[https://certaintyai-frontend-217783557903.us-central1.run.app](https://certaintyai-frontend-217783557903.us-central1.run.app)**

## Demo Login

The password for all demo accounts is `Certainty2026!`.

- **Primary Demo Login**: `demo@mdxblocks.com`
  - **Role**: Demo Admin
  - **Behavior**: Auto-seeded with a pre-generated assessment report. Logging in lands you directly on the dashboard with populated charts, forecasts, and AI advisor transcripts.
- **Other Seeded Accounts**:
  - `cto@acmehealth.com` (Healthcare CTO)
  - `dean@stateuniversity.edu` (Education Leader)
  - `ciso@fintrust.com` (Cybersecurity Leader)
  - `pm@itconsult.io` (IT Consulting PM)
  - **Behavior**: These accounts do not have pre-seeded reports. Following the new funnel, logging in with these accounts routes them straight into the **Mandatory Survey Wizard** first to complete their initial assessment before the dashboard is unlocked.

## User Funnel & Intake
- **Unassessed Users & New Signups**: Enforce a mandatory intake survey. Unassessed users are locked into `/dashboard?tab=readiness` (the survey wizard) with all other navigation tabs hidden until the first assessment is completed.
- **Role Intake Selector**: The intake survey role selector is streamlined and shows only the **CFO** and **Security Director / CISO** roles (with the other 6 hidden behind a config flag).
- **Assessed Users**: Once a survey is completed or a report is claimed, the full dashboard (Home, Dashboard, Saved Reports, Settings) is unlocked, and subsequent logins redirect directly to the home tab.

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
