import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import Button from "../ui/Button.jsx";
import Segmented from "../ui/Segmented.jsx";
import { CardSkeleton } from "../ui/Skeleton.jsx";
import { ErrorState, EmptyState } from "../ui/StateViews.jsx";
import SubjectDot from "../ui/SubjectDot.jsx";
import { relativeDay } from "../../utils/dates.js";

const DIFFICULTIES = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];
const COUNTS = [5, 10, 15];

export default function QuizSetup({ progress, loading, error, onRetry, onGenerate, initialTopic }) {
  const subjects = progress?.subjects || [];
  const topics = progress?.topics || [];
  const [subjectId, setSubjectId] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [count, setCount] = useState(5);

  const subjectTopics = useMemo(
    () => topics.filter((t) => (t.subjectId || t.subject) === subjectId),
    [topics, subjectId]
  );

  // Default to the weakest topic (what PISTA would suggest), or a topic passed in.
  useEffect(() => {
    if (!progress || subjectId) return;
    const pick = topics.find((t) => t.name === initialTopic) ||
      topics.find((t) => t.name === progress.weakTopics?.[0]?.topic) || topics[0];
    if (pick) { setSubjectId(pick.subjectId || pick.subject); setTopic(pick.name); }
    else if (subjects[0]) setSubjectId(subjects[0].id);
  }, [progress, subjectId, topics, subjects, initialTopic]);

  const changeSubject = (id) => {
    setSubjectId(id);
    const first = topics.find((t) => (t.subjectId || t.subject) === id);
    setTopic(first?.name || "");
  };

  if (error) return <ErrorState error={error} onRetry={onRetry} title="Quiz options didn't load" />;
  if (loading) return <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]"><CardSkeleton lines={6} /><CardSkeleton lines={4} /></div>;

  const subjectName = subjects.find((s) => s.id === subjectId)?.name || "";
  const history = [...(progress?.quizHistory || [])].reverse().slice(0, 5);
  const canGenerate = subjectId && topic;

  return (
    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <form
        className="card p-5 sm:p-7"
        onSubmit={(e) => { e.preventDefault(); if (canGenerate) onGenerate({ subject: subjectName, topic, difficulty, numQuestions: count }); }}
      >
        <h2 className="text-xl font-bold">Build your quiz</h2>
        <p className="mt-1 text-sm text-muted">PISTA writes questions from your course material and grades them for you.</p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="quiz-subject" className="label">Subject</label>
            <select id="quiz-subject" className="input" value={subjectId} onChange={(e) => changeSubject(e.target.value)}>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="quiz-topic" className="label">Topic</label>
            <select id="quiz-topic" className="input" value={topic} onChange={(e) => setTopic(e.target.value)} disabled={!subjectTopics.length}>
              {subjectTopics.length === 0 && <option value="">No topics yet</option>}
              {subjectTopics.map((t) => <option key={t.id || t.name} value={t.name}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <span className="label" id="diff-label">Difficulty</span>
            <Segmented label="Difficulty" options={DIFFICULTIES} value={difficulty} onChange={setDifficulty} />
          </div>
          <div>
            <span className="label" id="count-label">Questions</span>
            <Segmented label="Number of questions" options={COUNTS} value={count} onChange={setCount} />
          </div>
        </div>

        <Button type="submit" size="lg" className="mt-7 w-full sm:w-auto" disabled={!canGenerate}>
          Generate Quiz <Sparkles className="h-4 w-4" aria-hidden />
        </Button>
      </form>

      <section className="card p-5 sm:p-6" aria-labelledby="recent-quizzes">
        <h2 id="recent-quizzes" className="text-lg font-bold">Recent quizzes</h2>
        {history.length === 0 ? (
          <EmptyState emoji="📝" title="No quizzes yet" className="mt-4 !py-8"
            action={<Button size="sm" disabled={!canGenerate}
              onClick={() => onGenerate({ subject: subjectName, topic, difficulty, numQuestions: count })}>Take Your First Quiz</Button>} />
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {history.map((q) => (
              <li key={q.id} className="flex items-center justify-between gap-3 py-3">
                <span className="min-w-0">
                  <span className="flex items-center gap-2 font-medium"><SubjectDot subject={q.subjectId || q.subject} /><span className="truncate">{q.topic}</span></span>
                  <span className="text-xs text-muted">{q.subject}, {relativeDay(q.date).toLowerCase()}</span>
                </span>
                <span className={`shrink-0 rounded-lg px-2 py-1 font-display text-sm font-bold ${q.score >= 70 ? "bg-mint-50 text-mint-600" : "bg-coral-50 text-coral-600"}`}>
                  {q.score}%
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
