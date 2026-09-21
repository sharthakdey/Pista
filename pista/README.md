# PISTA — Your Personal AI Study Path

React + Vite + Tailwind frontend for PISTA, an AI study tutor. It has 8 pages: Landing, Dashboard, AI Tutor, Materials, Quiz, Progress, Exams and Settings. It includes a full **Demo Mode**, so it runs with no backend.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build && npm run preview   # production build
```

Requires Node 18+.

## Demo Mode

Demo Mode turns on automatically when `VITE_API_BASE_URL` is not set. You can also force it with `VITE_DEMO_MODE=true`, or toggle it in **Settings → Study service connection**.

The demo student is **Harman**, with 4 subjects, weak topics (ARQ, TCP Congestion Control, Deadlocks), a CN exam in 4 days and a latest quiz score of 72%. Demo state is saved in `localStorage`. **Settings → Reset demo data** restores it before a presentation.

### Demo script (≈2 min)
1. On the **Dashboard**, the card reads "Focus on Computer Networks — ARQ Protocols". Click **Start Learning**.
2. In the **AI Tutor**, the prompt is pre-filled. Press Enter to get a lesson with course-material citations.
3. Type "Give me a quiz on this topic", then click **Start Quiz**.
4. Answer a few questions wrong and click **Submit**. The results show ARQ as a weak topic and its progress drops.
5. Go back to the **Dashboard**. The card now reads "Review ARQ Protocols — Updated after your latest quiz".

## Connecting a backend

Copy `.env.example` to `.env` and set `VITE_API_BASE_URL`. All calls go through `src/services/api.js`, which documents the expected request and response shapes in JSDoc. The endpoint paths are listed in `ENDPOINTS`.

| Function | Endpoint |
|---|---|
| `getStudent` / `createStudent` | `GET /students/me`, `POST /students` |
| `getExams` / `addExam` | `GET/POST /exams` |
| `getProgress` / `updateProgress` | `GET/PATCH /progress` |
| `getRecommendation` | `GET /recommendations/today` |
| `generateQuiz` (`createQuiz`) / `submitQuiz` | `POST /quizzes`, `POST /quizzes/:id/submit` |
| `sendMessage` | `POST /chat`, which returns `{ content, sources, citations, action? }` |
| `uploadMaterial` / `getMaterials` | `POST /materials` (multipart), `GET /materials` |

Keep these out of the frontend and put them in the backend: API keys, LLM calls, the RAG pipeline, and quiz answer keys. Demo logic lives only in `src/services/demoAdapter.js` and `src/data/`.

## Structure
`src/components` (ui, layout, dashboard, chat, quiz) · `src/pages` · `src/layouts` · `src/services` · `src/hooks` · `src/context` · `src/data` · `src/utils`
