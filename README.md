# PISTA — Your Personal AI Study Assistant

PISTA is an AI-powered learning and study management platform designed to help students learn smarter, prepare for examinations, identify weak topics, and track their academic progress.

It combines an AI Tutor, personalized study recommendations, course-material management, quiz generation, examination planning, and progress tracking in one application.

PISTA is built with a React frontend and a Python FastAPI backend, with integrations for Microsoft Azure AI services and Azure Cosmos DB.

## Features

### 1. AI Tutor
- Interact with an AI-powered study assistant.
- Ask academic questions and receive structured explanations.
- Get explanations based on uploaded course materials.
- Support for Markdown formatting and mathematical notation.
- Maintain recent conversation history in the browser.
- Generate quizzes directly from tutor conversations.

### 2. Personalized Study Guide
- Understand upcoming examination schedules.
- Identify weak subjects and topics.
- Get recommendations based on academic progress.
- Receive suggestions for revision and study planning.
- Use student progress and examination information as context.

### 3. Course Material Management
- Upload study materials.
- Organize materials according to subjects.
- Search uploaded files.
- Filter materials by subject.
- Track the material processing status.
- Delete uploaded study materials.

Supported file types in the frontend include:
- PDF
- PPT
- PPTX
- DOC
- DOCX
- TXT

The backend additionally accepts Markdown (`.md`) files. The backend upload size limit is 50 MB per file.

### 4. AI Quiz Generation
- Generate quizzes on selected subjects and topics.
- Choose quiz difficulty:
  - Easy
  - Medium
  - Hard
- Configure the number of questions.
- Answer generated multiple-choice questions.
- Submit answers for evaluation.
- Receive scores and explanations.
- Identify weak areas based on quiz performance.

### 5. Academic Progress Tracking
- Track overall learning progress.
- Monitor subject-wise progress.
- Track topic mastery.
- Identify weak topics.
- Review previous quiz performance.
- Monitor study streak information.

### 6. Examination Management
- Add examination dates manually.
- Upload PDF examination datesheets.
- Extract examination information using AI.
- Organize upcoming examinations.
- Export examination schedules as iCalendar files.

### 7. Student Profile and Settings
- View student profile information.
- Manage learning preferences.
- Configure explanation style.
- Set preferred study session duration.
- Configure daily study goals.
- Switch between Demo Mode and Live Service.
- Reset demo data.

## Technology Stack

**Frontend**
- React.js
- Vite
- JavaScript
- Tailwind CSS
- React Router
- Recharts
- React Markdown
- KaTeX

**Backend**
- Python
- FastAPI
- Pydantic

**Database**
- Microsoft Azure Cosmos DB

**Artificial Intelligence**
- Microsoft Foundry
- Azure AI Projects
- AI Tutor and Study Guide agents
- OpenAI-compatible Responses and Chat Completions APIs
- Retrieval-Augmented Generation (RAG) through the configured vector store

**Authentication and Azure Services**
- Azure Identity
- DefaultAzureCredential
- Token-based authentication

**Development and Deployment**
- npm
- Vite
- Netlify
- Vercel
- Git and GitHub

## Project Structure

```text
PISTA/
│
├── pista/
│   ├── public/
│   │   ├── _redirects
│   │   └── pista-mark.svg
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── chat/
│   │   │   ├── dashboard/
│   │   │   ├── exams/
│   │   │   ├── layout/
│   │   │   ├── quiz/
│   │   │   └── ui/
│   │   │
│   │   ├── context/
│   │   │   └── StudyContext.jsx
│   │   │
│   │   ├── data/
│   │   │   ├── demoData.js
│   │   │   └── demoTutor.js
│   │   │
│   │   ├── hooks/
│   │   │   ├── useApi.js
│   │   │   ├── useConversations.js
│   │   │   └── useTypewriter.js
│   │   │
│   │   ├── layouts/
│   │   │   └── AppLayout.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Tutor.jsx
│   │   │   ├── Materials.jsx
│   │   │   ├── Quiz.jsx
│   │   │   ├── Progress.jsx
│   │   │   ├── Exams.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── NotFound.jsx
│   │   │
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── http.js
│   │   │   └── demoAdapter.js
│   │   │
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── config.js
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── netlify.toml
│   └── vercel.json
│
├── pista-tutor-backend/
│   ├── main.py
│   ├── main2.py
│   ├── db_tools.py
│   └── tutor_instructions.txt
│
└── README.md
```

## Application Pages

| Page | Route | Description |
|---|---|---|
| Landing | `/` | Introduces the PISTA platform. |
| Login | `/login` | Provides student registration and authentication. |
| Dashboard | `/dashboard` | Displays personalized study recommendations, subjects, exams, and progress summaries. |
| AI Tutor | `/tutor` | Allows students to interact with the AI Tutor. |
| Materials | `/materials` | Uploads, searches, filters, and manages course materials. |
| Quiz | `/quiz` | Generates quizzes and evaluates student answers. |
| Progress | `/progress` | Displays learning progress, mastery, weak topics, and quiz history. |
| Exams | `/exams` | Manages examination dates and datesheet information. |
| Settings | `/settings` | Manages student preferences and application settings. |

## How PISTA Works

### 1. Student Access

Students enter PISTA through the landing page.

The application supports two execution modes:

- **Demo Mode:** Uses sample student information and sample academic data without requiring a backend connection.
- **Live Mode:** Communicates with the Python FastAPI backend and connected Azure services.

### 2. AI-Powered Learning

Students can ask questions through the AI Tutor.

The backend uses keyword-based routing to select between two configured AI agents:

- **Pista-Tutor:** Handles general academic questions and learning-related queries.
- **Pista-Guide:** Handles study planning, examination schedules, student progress, and weak-topic-related queries.

The Study Guide can use student information stored in Cosmos DB to provide personalized context.

### 3. Course Material Processing

Students can upload academic documents through the Materials page.

The backend sends uploaded files to the configured AI file and vector-store services so they can be used as learning resources by the Tutor.

### 4. Quiz Generation and Evaluation

Students select a subject, topic, difficulty, and number of questions.

The backend generates quiz questions using the configured AI model. The quiz answers are evaluated on the backend rather than being sent to the frontend with the questions.

After submission, the system calculates:
- Total correct answers.
- Overall quiz percentage.
- Topic-wise performance.
- Weak areas.
- Recommended revision actions.

The backend also attempts to update student learning progress and save quiz activity in Cosmos DB.

### 5. Personalized Recommendations

PISTA considers available examination dates and weak-topic information to recommend what students should focus on.

The current live recommendation endpoint uses rule-based logic to prioritize weak topics and upcoming examinations.

### 6. Progress Tracking

The application uses student progress and quiz records to display learning information, subject mastery, weak topics, and quiz history.

## Demo Mode

PISTA includes a complete frontend Demo Mode with sample student data.

The demo experience is useful for exploring the application's frontend without configuring Azure services or running the Python backend.

### Demo Mode Features

- Sample student profile.
- Sample subjects and academic progress.
- Sample examination schedules.
- Sample course materials.
- Simulated AI Tutor interactions.
- Quiz generation and evaluation using demo logic.
- Updated demo progress after quiz submission.
- Daily study recommendations.
- Local storage persistence.

Demo Mode is enabled automatically when `VITE_API_BASE_URL` is empty, unless a previously stored browser setting overrides it.

You can also explicitly enable it with:

```env
VITE_DEMO_MODE=true
```

Demo data can be restored from:

**Settings → Reset demo data**

The main demo experience can be opened directly from the landing page. The Login page uses the backend authentication endpoints and therefore requires a running live backend.

## Installation and Setup

### Prerequisites

**For the frontend:**
- Node.js
- npm

**For the backend:**
- Python
- pip
- Azure Cosmos DB account
- Microsoft Foundry project
- Azure authentication configured for the backend

## Run the Frontend

### 1. Navigate to the Frontend Directory

```bash
cd pista
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Demo Mode

Create a `.env` file using `.env.example` as a reference.

For Demo Mode:

```env
VITE_API_BASE_URL=
VITE_DEMO_MODE=true
VITE_API_TIMEOUT_MS=60000
```

### 4. Start the Development Server

```bash
npm run dev
```

Open the application at:

```text
http://localhost:5173
```

## Frontend Build

To create a production frontend build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

To generate the single-file Demo Mode build:

```bash
npm run build:single
```

The standard build output is stored in `dist/`.

The single-file build output is stored in `dist-single/`.

## Run the Python Backend

The backend is located in:

```text
pista-tutor-backend/
```

The main FastAPI application entry point is `main.py`.

### 1. Navigate to the Backend Directory

```bash
cd pista-tutor-backend
```

### 2. Create a Virtual Environment

```bash
python -m venv .venv
```

Activate it on Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

On macOS or Linux:

```bash
source .venv/bin/activate
```

### 3. Install Backend Dependencies

The supplied project does not include a backend `requirements.txt` file.

Install the packages used by the backend:

```bash
pip install "uvicorn[standard]" fastapi pydantic azure-cosmos python-dotenv azure-identity azure-ai-projects python-multipart pypdf
```

### 4. Configure Environment Variables

Create a `.env` file inside `pista-tutor-backend/`:

```env
COSMOS_ENDPOINT=your_cosmos_endpoint
COSMOS_KEY=your_cosmos_key
COSMOS_DATABASE=your_database_name
AUTH_SECRET=your_long_random_secret
```

The Cosmos DB database must contain the containers expected by the backend:

- `students`
- `activity`

### 5. Configure Azure Authentication

The backend uses Azure `DefaultAzureCredential` to connect to the configured Microsoft Foundry project.

For local development, authenticate using the Azure CLI:

```bash
az login
```

Make sure the authenticated identity has the necessary permissions for the Azure AI project and related resources.

The Azure AI project endpoint, vector-store ID, and model deployment name are currently configured as constants in `main.py`. Verify that these values match your Azure resources before running the live application.

### 6. Start the Backend Server

Run:

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The backend will be available at:

```text
http://127.0.0.1:8000
```

FastAPI interactive API documentation:

```text
http://127.0.0.1:8000/docs
```

## Connect the Frontend to the Backend

To enable Live Mode, configure the frontend `.env` file:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_DEMO_MODE=false
VITE_API_TIMEOUT_MS=60000
```

Restart the Vite development server after changing environment variables.

If a previous Demo Mode selection is stored in the browser, change the service selection under:

**Settings → Study service connection**

The backend currently allows the following local frontend origins:

- `http://localhost:5173`
- `http://127.0.0.1:5173`

Update the CORS configuration in `main.py` before deploying the frontend to another domain.

## Backend API Endpoints

The backend exposes the following main API endpoints.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a student. |
| POST | `/auth/login` | Authenticate a student. |
| GET | `/auth/me` | Retrieve the current student identity. |

### Student and Progress

| Method | Endpoint | Description |
|---|---|---|
| GET | `/students/me` | Retrieve student profile and statistics. |
| GET | `/progress` | Retrieve learning progress and quiz history. |
| GET | `/recommendations/today` | Retrieve the daily study recommendation. |

### AI Learning

| Method | Endpoint | Description |
|---|---|---|
| POST | `/chat` | Route a message to the Tutor or Guide agent. |
| POST | `/guide` | Send a message directly to the Study Guide agent. |

### Course Materials

| Method | Endpoint | Description |
|---|---|---|
| POST | `/materials` | Upload course material. |
| GET | `/materials` | Retrieve uploaded materials. |
| DELETE | `/materials/{file_id}` | Delete an uploaded material. |

### Quiz Management

| Method | Endpoint | Description |
|---|---|---|
| POST | `/quizzes` | Generate a quiz. |
| POST | `/quizzes/{quiz_id}/submit` | Submit answers and evaluate quiz performance. |

### Examination Management

| Method | Endpoint | Description |
|---|---|---|
| GET | `/exams` | Retrieve examination records. |
| POST | `/exams` | Add or update examination information. |
| POST | `/exams/extract` | Extract examination information from a PDF datesheet. |
| GET | `/exams/export-ics` | Export examination schedules as an iCalendar file. |

The backend also provides additional `/tools/` endpoints for accessing and updating student context, progress, quiz results, and study plans.

## Database and Data Storage

PISTA uses Azure Cosmos DB for storing student and academic information.

The main containers are:

- **students:** Stores student profiles, subjects, examination information, preferences, progress, and weak-topic information.
- **activity:** Stores quiz activity and learning records.

Uploaded course materials are managed through the configured Azure file and vector-store services.

In Demo Mode, application data is stored in the browser's local storage.

Tutor conversation history is also maintained in browser local storage.

## Important Implementation Notes

The current project contains both Demo Mode and Live Mode implementations. They should not be considered identical in terms of backend integration.

Some live-mode API integrations still need to be completed:

1. The frontend declares `POST /students`, but the backend currently creates accounts through `POST /auth/register`.
2. The frontend declares `PATCH /students/me`, but the backend currently implements only `GET /students/me`.
3. The frontend declares `PATCH /progress`, while the backend exposes a separate `POST /tools/progress/update` endpoint with a different request format.
4. The frontend declares `GET /quizzes/history`, but the backend does not currently implement that route. Quiz history is also included in the response from `GET /progress`.
5. Active quiz answer data is stored in backend process memory, so unfinished quizzes are lost if the backend restarts.
6. The current material-management backend uses one configured vector store and does not provide complete per-student material isolation.
7. Authentication enforcement is disabled by default in `main.py` through `REQUIRE_AUTH = False`. Production deployment requires proper authentication enforcement and access control.
8. The backend contains a default authentication secret. Replace it with a strong private secret before deployment.
9. The backend CORS configuration needs to be updated for deployed frontend domains.
10. PDF datesheet extraction uses a hard-coded reference date in the backend prompt. Update it before relying on relative-date extraction in a future deployment.

These points should be addressed before using the live backend with multiple real students.

## Deployment

### Frontend Deployment

PISTA includes configuration files for:

- Netlify
- Vercel

Build the frontend using:

```bash
npm run build
```

Deploy the generated `dist/` directory.

For single-file Demo Mode deployment, use:

```bash
npm run build:single
```

### Backend Deployment

The backend can be deployed using a Python-compatible hosting environment.

Before deployment:

- Configure Cosmos DB credentials.
- Configure Azure authentication.
- Verify Microsoft Foundry project settings.
- Update CORS origins.
- Replace default authentication secrets.
- Enable and enforce authentication.
- Implement proper student and material access isolation.
- Resolve the frontend/backend API differences.

Never expose Azure credentials or database secrets in frontend environment variables.

## Future Improvements

- Complete the remaining frontend/backend API integrations.
- Implement stronger authentication and authorization.
- Add per-student course-material isolation.
- Persist active quiz sessions in the database.
- Improve AI-generated study-plan personalization.
- Introduce better examination reminders and notifications.
- Add expanded learning analytics.
- Implement automated frontend and backend testing.
- Improve production deployment and monitoring.

## Project Objective

PISTA aims to make academic learning more personalized, organized, and effective.

By combining AI-powered tutoring, course-material retrieval, quiz-based evaluation, examination management, and progress tracking, PISTA helps students understand their subjects, identify learning gaps, and prepare more effectively for examinations.
