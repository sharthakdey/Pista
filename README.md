# PISTA — Your Personal AI Study Path

PISTA is a study-planning and tutoring application. It combines a React web app, a Python FastAPI service, Azure Cosmos DB for student and activity data, and Microsoft Foundry agents for tutor conversations and course-material retrieval.

The frontend can also run independently in **Demo Mode**. Demo Mode uses seeded sample data and browser storage, so the main study flow can be explored without configuring Azure or running the Python backend.

## What PISTA does

- **Study dashboard** — shows the student's subjects, progress, weak topics, upcoming exams, and daily study recommendation.
- **AI Tutor** — answers academic questions and can use course-material retrieval through the configured Foundry tutor agent.
- **Personalized study guidance** — routes exam, schedule, performance, and study-planning questions to the Guide agent, which receives the student's exam and progress context from Cosmos DB.
- **Course materials** — upload, list, and delete course files (`.pdf`, `.ppt`, `.pptx`, `.doc`, `.docx`, `.txt`, and `.md`; backend upload limit: 50 MiB). The backend sends uploaded files to an Azure vector store for retrieval.
- **Quiz generation** — create multiple-choice quizzes by subject/topic or from an uploaded file, with easy, medium, and hard difficulty options and 5, 10, or 15 questions in the UI.
- **Quiz evaluation** — grade answers on the backend, show explanations, identify weaker concepts, and update learning progress and quiz activity.
- **Progress tracking** — view topic mastery, weak areas, subject progress, and quiz history.
- **Daily recommendations** — select a review/focus task using weak-topic priority and upcoming exam dates.
- **Exam management** — add exams manually, upload a university datesheet PDF for AI extraction, and export exam dates as an `.ics` calendar file.
- **Learning preferences** — edit the displayed profile and preferences such as explanation style, session length, and daily goal.
- **Interactive demo data** — demo quiz results change topic mastery, weak topics, and subsequent recommendations. Demo state is stored in `localStorage` and can be reset from Settings.

## Repository layout

```text
Pista-main/
├── pista/                         # React + Vite frontend
│   ├── src/
│   │   ├── components/             # Chat, dashboard, exams, quiz, and UI components
│   │   ├── context/                # App-wide study state
│   │   ├── data/                   # Demo student data, question banks, demo tutor
│   │   ├── hooks/                  # API and conversation hooks
│   │   ├── layouts/                # Main application layout
│   │   ├── pages/                  # Landing, Dashboard, Tutor, Materials, Quiz,
│   │   │                           # Progress, Exams, Settings, Login
│   │   ├── services/               # API client, HTTP client, and demo adapter
│   │   └── utils/                  # Date, formatting, and subject helpers
│   ├── public/
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.js
│   ├── netlify.toml
│   └── vercel.json
└── pista-tutor-backend/            # FastAPI + Azure backend
    ├── main.py                     # Main API application (recommended entry point)
    ├── main2.py                    # Alternate/older API implementation
    ├── db_tools.py                 # Cosmos DB read/write helpers
    └── tutor_instructions.txt      # Tutor behavior and source-labeling instructions
```

## Technology

| Area | Technologies |
|---|---|
| Frontend | React 18, Vite 5, JavaScript (ES modules) |
| UI and styling | Tailwind CSS 3, Lucide React |
| Navigation | React Router 6 (browser routing; hash routing for the single-file build) |
| Charts and study content | Recharts, React Markdown, remark-gfm, remark-math, KaTeX, rehype-katex |
| Backend API | Python, FastAPI, Pydantic |
| Student and activity data | Azure Cosmos DB (`students` and `activity` containers) |
| AI services | Microsoft Foundry project client and OpenAI-compatible Responses/Chat Completions APIs |
| Azure identity | `DefaultAzureCredential` |

## Frontend pages

| Route | Page | Purpose |
|---|---|---|
| `/` | Landing | Product introduction and entry to the study app |
| `/login` | Login | Sign in or create a live-backend student account |
| `/dashboard` | Dashboard | Subject overview, upcoming exams, weak topics, and daily recommendation |
| `/tutor` | AI Tutor | Ask questions and continue tutor conversations |
| `/materials` | Materials | Upload, browse, and remove course files |
| `/quiz` | Quiz | Configure quizzes, answer questions, and review results |
| `/progress` | Progress | Inspect mastery, weak topics, and performance history |
| `/exams` | Exams | Manage dates, import a datesheet, and export a calendar |
| `/settings` | Settings | Edit profile/preferences, inspect service mode, and reset demo state |

## Quick start: frontend Demo Mode

Demo Mode is the easiest way to run the project. No Python service, Cosmos DB, or Azure credentials are needed.

### Requirements

- Node.js 18 or later
- npm

### Install and run

```bash
cd Pista-main/pista
npm install
npm run dev
```

Vite serves the frontend at <http://localhost:5173>.

On the landing page, click **Open app** or **Start Studying** to enter the dashboard. The app's main Demo Mode flow does not require signing in. The `/login` screen is for the live backend's account endpoints; it is not a demo authentication screen.

### Demo Mode configuration

Copy `.env.example` to `.env` if you want an explicit local configuration:

```dotenv
VITE_API_BASE_URL=
VITE_DEMO_MODE=true
VITE_API_TIMEOUT_MS=60000
```

Behavior:

- If `VITE_API_BASE_URL` is empty, Demo Mode turns on automatically unless explicitly overridden by a stored browser choice.
- `VITE_DEMO_MODE=true` forces Demo Mode.
- `VITE_DEMO_MODE=false` selects the live service only when `VITE_API_BASE_URL` is configured.
- A choice previously made under **Settings → Study service connection** is stored in `localStorage` and takes precedence over the environment setting.
- **Settings → Reset demo data** restores the seeded student, exams, materials, quiz history, and study state.

The seeded demo profile is **Harman**, a B.E. Computer Science student with Computer Networks, Operating Systems, DBMS, and Machine Learning subjects. It includes sample topic mastery, exam dates, quiz history, and course files. Taking and submitting demo quizzes changes the demo progress and recommendations.

## Build and preview the frontend

Standard multi-file build:

```bash
npm run build
npm run preview
```

The standard build is written to `pista/dist/` and uses the normal Vite deployment configuration. `netlify.toml`, `vercel.json`, and `public/_redirects` include single-page-app rewrites so browser routes can resolve to `index.html`.

Single-file build:

```bash
npm run build:single
```

This runs Vite with `--mode single`, writes `pista/dist-single/index.html`, inlines the frontend assets, and uses hash routing. The checked-in `.env.single` sets `VITE_ROUTER=hash` and `VITE_DEMO_MODE=true`, so this build is configured as a self-contained Demo Mode build by default.

## Run the Python backend

The backend is only needed for live AI, Cosmos DB persistence, course-material processing, quiz generation/grading, and live exam operations.

### 1. Create a Python environment

There is no backend `requirements.txt` in the supplied project. Install the packages imported by `main.py` in a virtual environment:

```bash
cd Pista-main/pista-tutor-backend
python -m venv .venv

# macOS / Linux
source .venv/bin/activate

# Windows PowerShell
.venv\Scripts\Activate.ps1

pip install "uvicorn[standard]" fastapi pydantic azure-cosmos python-dotenv azure-identity azure-ai-projects python-multipart pypdf
```

### 2. Configure Cosmos DB

Create a `.env` file inside `pista-tutor-backend/`:

```dotenv
COSMOS_ENDPOINT=https://<your-cosmos-account>.documents.azure.com:443/
COSMOS_KEY=<your-cosmos-account-key>
COSMOS_DATABASE=<your-database-name>
AUTH_SECRET=<long-random-secret-for-token-signing>
```

`COSMOS_ENDPOINT`, `COSMOS_KEY`, and `COSMOS_DATABASE` are required by `main.py` at import/startup. The database must contain the `students` and `activity` containers expected by the code. Configure their partitioning to match your Cosmos DB data model and the `student_id`/`id` lookups in `db_tools.py`.

### 3. Configure Microsoft Foundry access

`main.py` creates an Azure AI Projects client using `DefaultAzureCredential`. The app also initializes the `student-001` demo account as `demo@pista.app` with password `demo123` when that Cosmos record does not already have a password hash; treat this as development-only and change/remove it before public deployment. For local development, authenticate with an Azure identity that has permission to use the configured Foundry project, for example:

```bash
az login
```

In Azure hosting, use a managed identity or another supported `DefaultAzureCredential` source and grant it the required project permissions.

The AI project endpoint, vector-store ID, and model deployment name (`gpt-5-mini`) are currently constants in `main.py`, not environment variables. Verify or replace those constants with values from the Azure resources you intend to use. The tutor agent references (`Pista-Tutor` and `Pista-Guide`) must also exist in the configured Foundry project with the expected versions and tools/instructions.

### 4. Start FastAPI

From `pista-tutor-backend/` with the virtual environment activated:

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The root health endpoint is <http://127.0.0.1:8000/>. FastAPI's interactive API documentation is available at <http://127.0.0.1:8000/docs>.

Use `main.py` as the backend entry point. `main2.py` is an alternate/older implementation; it does not contain the same account-registration/login middleware found in `main.py`.

### 5. Connect the frontend to the live service

In `pista/.env`, configure:

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_DEMO_MODE=false
VITE_API_TIMEOUT_MS=60000
```

Restart the Vite dev server after changing environment variables. If Demo Mode remains selected because of an earlier browser setting, open **Settings → Study service connection** and choose **Use live service**.

The FastAPI CORS configuration currently allows `http://localhost:5173` and `http://127.0.0.1:5173`. Add your deployed frontend origin to the `origins` list in `main.py` before using a hosted frontend.

## Main API endpoints

The checked-in FastAPI app is defined in `pista-tutor-backend/main.py`.

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/` | Backend health response |
| `POST` | `/auth/register` | Create a student account and issue a token |
| `POST` | `/auth/login` | Authenticate a student and issue a token |
| `GET` | `/auth/me` | Return the resolved student identity |
| `POST` | `/chat` | Route a message to the Tutor or Guide agent |
| `POST` | `/guide` | Send a message directly to the Guide agent |
| `GET` | `/students/me` | Return the active student profile and statistics |
| `GET` | `/progress` | Return subject/topic mastery, weak topics, and quiz history |
| `GET` | `/recommendations/today` | Return a rule-based daily study recommendation |
| `POST` | `/materials` | Upload a supported file to the configured vector store |
| `GET` | `/materials` | List files in the configured vector store |
| `DELETE` | `/materials/{file_id}` | Remove a file from the vector store and file storage |
| `POST` | `/quizzes` | Generate a quiz (multipart form fields; optional file) |
| `POST` | `/quizzes/{quiz_id}/submit` | Grade submitted answers and update learning records |
| `GET` | `/exams` | List exams for the active student/profile |
| `POST` | `/exams` | Add or update an exam record |
| `POST` | `/exams/extract` | Extract exam details from a datesheet PDF and save them |
| `GET` | `/exams/export-ics` | Export the student's exam schedule as an iCalendar file |

The backend also exposes `/tools/...` routes for reading/updating student context, progress, quiz results, and study plans. These are service/helper endpoints rather than the main page-level frontend workflow.

## How the AI routing works

`POST /chat` uses keyword routing in `route_message()`:

- Questions mentioning exams, schedules, study plans, progress, weaknesses, scores, revision, or similar planning terms are routed to **Pista-Guide**. The backend adds current exams, weak topics, and progress from Cosmos DB to the request context.
- Other academic questions are routed to **Pista-Tutor**, whose agent is configured for teaching and course-material retrieval.

The exact agent behavior and source-labeling guidance are described in `pista-tutor-backend/tutor_instructions.txt`. The frontend renders tutor responses as Markdown and supports mathematical notation.

## Important live-mode gaps and deployment cautions

The frontend and backend are not yet a completely matched live API contract. Demo Mode is self-contained, but the following issues should be addressed before relying on every live feature:

1. **Profile update route is missing.** The frontend calls `PATCH /students/me` when saving Settings, but `main.py` currently implements only `GET /students/me`. The Settings save action will fail in live mode until the backend route is added or the client is changed.
2. **Progress update route does not match.** The frontend API wrapper refers to `PATCH /progress`; `main.py` currently exposes `GET /progress` and a separate `POST /tools/progress/update` endpoint with a different request schema.
3. **Quiz history route is absent.** The frontend API wrapper declares `GET /quizzes/history`, but no such route exists. The current Quiz page gets recent history from the `quizHistory` field returned by `GET /progress`.
4. **Student creation route is absent.** The frontend wrapper declares `POST /students`, while account creation in `main.py` is implemented at `POST /auth/register`.
5. **The login page is a live-backend flow.** Demo Mode is entered from the landing page's app CTA; the Login form itself calls `/auth/login` and `/auth/register`, so it requires a running backend.
6. **Quiz state is held in process memory.** Active answer keys are stored in `ACTIVE_QUIZZES`; in-progress quizzes are lost on backend restart and are not shared between multiple worker processes.
7. **Materials currently use one configured vector store.** The material list/upload/delete handlers do not isolate files by `x-student-id`; list responses also label every existing file as `General` rather than restoring the upload subject. Do not use this configuration for multiple real students until per-user material/subject isolation and authorization are implemented.
8. **Authentication is not enforced by default.** `REQUIRE_AUTH` is set to `False` in `main.py`, and endpoints fall back to `student-001` when no student ID is supplied. The code also has a public fallback `AUTH_SECRET`, and the token helper does not include an expiry timestamp. Set a strong secret, add an expiry/revocation strategy, and implement/enforce production authentication before exposing the API publicly. If auth enforcement is enabled, update the datesheet uploader to send the Bearer token as well.
9. **CORS is local-development-only by default.** Add the exact frontend deployment origin before hosting the frontend separately.
10. **Quiz file extraction is limited.** Quiz generation extracts text from PDFs with `pypdf`; non-PDF attachments are decoded as UTF-8 rather than parsed with format-specific readers, so binary Office files may not provide usable quiz context.
11. **Exam date parsing contains a fixed reference date.** The AI prompts in `main.py` include a hard-coded date (`2026-09-22`) for interpreting relative dates. Update this before relying on date extraction or relative-date parsing in a later deployment.

Keep Cosmos credentials, Azure credentials, and other secrets in the backend environment. Never put them in Vite variables: every `VITE_*` value is shipped to the browser.

## Data and persistence

- In live mode, student profile, exam, and progress information is stored in the Cosmos DB `students` container.
- Quiz activity is stored through the `activity` container by `db_tools.py`.
- Uploaded course material is stored in the configured Azure file/vector-store services.
- Active quiz question/answer data is currently held in backend process memory until submission.
- In Demo Mode, state is stored in browser `localStorage` under the `pista:demo-state:v1` key and can be reset in Settings.

## Deployment notes

- **Frontend:** use `npm run build` and publish `pista/dist/`. Netlify and Vercel rewrite configuration is included. For a single HTML artifact, use `npm run build:single` and publish `pista/dist-single/`.
- **Backend:** deploy the FastAPI app with `main:app`, provision Cosmos DB and Microsoft Foundry resources, configure environment variables and Azure identity, and update the CORS origins and hard-coded Azure resource references.
- Do not expose the backend publicly until the authentication, student isolation, vector-store isolation, and secret configuration issues above have been resolved.
