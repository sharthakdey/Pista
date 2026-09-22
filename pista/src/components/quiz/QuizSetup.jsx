import { useEffect, useState, useRef } from "react";
import { Sparkles, UploadCloud, X, FileText } from "lucide-react";
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

/* Turns raw ids like "dbms" / "computer-networks" into "DBMS" / "Computer Networks" */
function prettyName(raw, subjects = []) {
  if (!raw) return "General";
  const known = subjects.find((s) => s.id === raw);
  if (known?.name) return known.name;
  return raw
    .replace(/[-_]+/g, " ")
    .trim()
    .split(" ")
    .map((w) => (!/[aeiou]/i.test(w) && w.length <= 6 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

function scoreTone(score) {
  if (score >= 70) return "bg-mint-50 text-mint-600";
  if (score >= 40) return "bg-amber-50 text-amber-600";
  return "bg-coral-50 text-coral-600";
}

export default function QuizSetup({ progress, loading, error, onRetry, onGenerate, initialTopic }) {
  const subjects = progress?.subjects || [];
  const [subject, setSubject] = useState(""); // ✅ free-text subject, no dropdown
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [count, setCount] = useState(5);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  // Pre-fill from weakest topic on first load (as text, not selection)
    // Pre-fill from weakest topic ONCE on first load — then never fight the user's typing
  const prefilled = useRef(false);
  useEffect(() => {
    if (!progress || prefilled.current) return;
    prefilled.current = true;
    const weak = progress.weakTopics?.[0];
    if (initialTopic) {
      setTopic(initialTopic);
    } else if (weak?.topic) {
      setTopic(weak.topic);
      const weakSubject = weak.subjectId || weak.subject;
      const known = subjects.find((s) => s.id === weakSubject);
      if (known) setSubject(known.name);
      else if (weakSubject) setSubject(prettyName(weakSubject, subjects));
    } else if (subjects[0]) {
      setSubject(subjects[0].name);
    }
  }, [progress, initialTopic, subjects]);

  if (error) return <ErrorState error={error} onRetry={onRetry} title="Quiz options didn't load" />;
  if (loading) return <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]"><CardSkeleton lines={6} /><CardSkeleton lines={4} /></div>;

  const subjectName = subject.trim() || "General";
  // Unique suggestions for the datalist (no duplicates ever)
  const subjectSuggestions = Array.from(new Set([...subjects.map((s) => s.name), "General"]));
  const history = [...(progress?.quizHistory || [])].reverse().slice(0, 5);
  const canGenerate = topic.trim().length > 0 || !!file;

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    if (!topic.trim()) setTopic(f.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " "));
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGenerate = () => {
    if (!canGenerate) return;
    onGenerate({
      subject: subjectName,
      topic: topic.trim() || (file ? file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ") : ""),
      difficulty,
      numQuestions: count,
      file,
    });
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <form className="card p-5 sm:p-7" onSubmit={(e) => { e.preventDefault(); handleGenerate(); }}>
        <h2 className="text-xl font-bold">Build your quiz</h2>
        <p className="mt-1 text-sm text-muted">PISTA writes questions from your course material, or any custom topic you choose.</p>

        <div className="mt-6 grid gap-5">
          {/* ✅ MANUAL SUBJECT INPUT with autocomplete suggestions */}
          <div>
            <label htmlFor="quiz-subject" className="label">Subject</label>
            <input
              id="quiz-subject"
              className="input"
              list="quiz-subject-suggestions"
              placeholder="Type any subject (e.g. DBMS, Operating Systems, Chemistry)…"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <datalist id="quiz-subject-suggestions">
              {subjectSuggestions.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
            <p className="mt-1.5 text-xs text-muted">Optional — type anything you like, or pick a suggestion. Empty means "General".</p>
          </div>

          <div>
            <span className="label" id="diff-label">Difficulty</span>
            <Segmented label="Difficulty" options={DIFFICULTIES} value={difficulty} onChange={setDifficulty} />
          </div>

          <div>
            <label htmlFor="quiz-topic" className="label">Topic or upload notes</label>
            <input
              id="quiz-topic"
              type="text"
              className="input"
              placeholder="e.g. Normalization, Transactions, React Hooks…"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.txt,.doc,.docx,.ppt,.pptx,.md" onChange={handleFileChange} />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm font-semibold text-ink-700 transition hover:bg-surface"
              >
                <UploadCloud className="h-4 w-4" />
                Upload Notes / PDF
              </button>
              {file && (
                <span className="inline-flex max-w-full items-center gap-2 rounded-xl bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700">
                  <FileText className="h-4 w-4 shrink-0" />
                  <span className="truncate">{file.name}</span>
                  <button type="button" onClick={clearFile} aria-label="Remove file" className="text-brand-600 hover:text-coral-600">
                    <X className="h-4 w-4" />
                  </button>
                </span>
              )}
            </div>
            <p className="mt-1.5 text-xs text-muted">Type any concept, or upload lecture notes and PISTA will build questions from them.</p>
          </div>

          <div>
            <span className="label" id="count-label">Number of questions</span>
            <Segmented label="Number of questions" options={COUNTS} value={count} onChange={setCount} />
          </div>
        </div>

        <Button type="submit" size="lg" className="mt-7 w-full sm:w-auto" disabled={!canGenerate}>
          Generate Quiz <Sparkles className="h-4 w-4 ml-2" aria-hidden />
        </Button>
      </form>

      <section className="card p-5 sm:p-6" aria-labelledby="recent-quizzes">
        <h2 id="recent-quizzes" className="text-lg font-bold">Recent quizzes</h2>
        {history.length === 0 ? (
          <EmptyState emoji="📝" title="No quizzes yet" className="mt-4 !py-8"
            action={<Button size="sm" disabled={!canGenerate} onClick={handleGenerate}>Take Your First Quiz</Button>} />
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {history.map((q, i) => (
              <li key={q.id || `${q.topic}-${i}`} className="flex items-center justify-between gap-3 py-3">
                <span className="min-w-0">
                  <span className="flex items-center gap-2 font-medium">
                    <SubjectDot subject={q.subjectId || q.subject} />
                    <span className="truncate" title={q.topic}>
                      {prettyName(q.topic, subjects)}
                    </span>
                  </span>
                  <span className="text-xs text-muted">
                    {prettyName(q.subjectId || q.subject, subjects)}, {relativeDay(q.date).toLowerCase()}
                  </span>
                </span>
                <span className={`shrink-0 rounded-lg px-2 py-1 font-display text-sm font-bold ${scoreTone(q.score)}`}>
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