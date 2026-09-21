import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TrendingUp, BookOpenCheck, ListChecks } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getProgress } from "../services/api.js";
import { useApi } from "../hooks/useApi.js";
import PageHeader from "../components/ui/PageHeader.jsx";
import ProgressRing from "../components/ui/ProgressRing.jsx";
import ProgressBar from "../components/ui/ProgressBar.jsx";
import SubjectDot from "../components/ui/SubjectDot.jsx";
import Button from "../components/ui/Button.jsx";
import { CardSkeleton } from "../components/ui/Skeleton.jsx";
import { ErrorState, EmptyState } from "../components/ui/StateViews.jsx";
import { ChartTooltip } from "../components/dashboard/QuizPerformanceCard.jsx";
import { PRIORITY_META } from "../utils/format.js";
import { formatDate } from "../utils/dates.js";

const GROUPS = [
  { key: "high", emoji: "🔴", title: "High Priority" },
  { key: "medium", emoji: "🟠", title: "Needs Practice" },
  { key: "low", emoji: "🟡", title: "Improving" },
];

function WeakTopicGroups({ weakTopics }) {
  const navigate = useNavigate();
  if (!weakTopics.length) {
    return <EmptyState emoji="🎉" title="No weak topics right now" message="Every topic is above 65%. Keep your streak going with a mixed quiz." />;
  }
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {GROUPS.map((g) => {
        const items = weakTopics.filter((w) => w.priority === g.key);
        const meta = PRIORITY_META[g.key];
        return (
          <div key={g.key} className="card p-5">
            <h3 className="flex items-center gap-2 text-base font-bold"><span aria-hidden>{g.emoji}</span>{g.title}
              <span className="ml-auto rounded-full bg-surface px-2 py-0.5 font-sans text-xs font-semibold text-muted">{items.length}</span>
            </h3>
            {items.length === 0 ? (
              <p className="mt-4 text-sm text-muted">Nothing here.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {items.map((w) => (
                  <li key={w.topic} className={`rounded-2xl p-4 ${meta.bg}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold leading-snug">{w.topic}</p>
                        <p className="text-xs text-muted">{w.subject}{w.examInDays != null ? `, exam in ${w.examInDays} days` : ""}</p>
                      </div>
                      <span className={`font-display text-2xl font-bold leading-none ${meta.text}`}>{w.mastery}%</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="secondary" icon={BookOpenCheck} className="flex-1"
                        onClick={() => navigate("/tutor", { state: { prompt: `Teach me ${w.topic}` } })}>Study</Button>
                      <Button size="sm" variant="secondary" icon={ListChecks} className="flex-1"
                        onClick={() => navigate("/quiz", { state: { autostart: { subject: w.subject, topic: w.topic, difficulty: "medium", numQuestions: 5 } } })}>Quiz</Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Progress() {
  const { data, loading, error, reload } = useApi(getProgress);
  const { hash } = useLocation();

  useEffect(() => {
    if (data && hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [data, hash]);

  if (error) {
    return (
      <>
        <PageHeader icon={TrendingUp} title="Your Progress" />
        <ErrorState error={error} onRetry={reload} />
      </>
    );
  }

  return (
    <>
      <PageHeader icon={TrendingUp} title="Your Progress" subtitle={loading ? "Loading your learning progress..." : "Where you stand, and what needs attention."} />

      {loading ? (
        <div className="grid gap-5 lg:grid-cols-[340px_1fr]"><CardSkeleton lines={5} /><CardSkeleton lines={6} /></div>
      ) : (
        <>
          <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
            <section className="card flex flex-col items-center p-6 text-center" aria-labelledby="overall">
              <h2 id="overall" className="self-start text-lg font-bold">Overall Progress</h2>
              <div className="my-6">
                <ProgressRing value={data.overall} size={200} stroke={16} label="Overall progress">
                  <div>
                    <div className="font-display text-[52px] font-extrabold leading-none tracking-tight">{data.overall}%</div>
                    <div className="mt-1 text-sm text-muted">across {data.subjects.length} subjects</div>
                  </div>
                </ProgressRing>
              </div>
              <dl className="grid w-full grid-cols-3 gap-2">
                {[
                  ["Topics", data.topics.length],
                  ["Quizzes", data.quizHistory.length],
                  ["Streak", `${data.streakDays}d`],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-2xl bg-surface p-3">
                    <dt className="text-xs text-muted">{k}</dt>
                    <dd className="font-display text-xl font-bold">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="card p-6" aria-labelledby="subject-progress">
              <h2 id="subject-progress" className="text-lg font-bold">Subject Progress</h2>
              <ul className="mt-5 space-y-5">
                {data.subjects.map((s) => {
                  const topics = data.topics.filter((t) => (t.subjectId || t.subject) === s.id);
                  return (
                    <li key={s.id}>
                      <div className="mb-2 flex items-baseline justify-between gap-2">
                        <span className="flex items-center gap-2.5 font-semibold"><SubjectDot subject={s.id} className="h-3 w-3" />{s.name}</span>
                        <span className="font-display text-xl font-bold tabular-nums">{s.progress}%</span>
                      </div>
                      <ProgressBar value={s.progress} size="lg" tone="brand" label={`${s.name} progress`} />
                      {topics.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {topics.map((t) => (
                            <span key={t.id || t.name} className={`rounded-lg px-2 py-0.5 text-xs font-medium
                              ${t.mastery < 50 ? "bg-coral-50 text-coral-600" : t.mastery < 65 ? "bg-amber-50 text-amber-600" : "bg-surface text-muted"}`}>
                              {t.name} {t.mastery}%
                            </span>
                          ))}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>

          <section id="weak-topics" className="mt-8 scroll-mt-24" aria-labelledby="weak-heading">
            <h2 id="weak-heading" className="mb-4 text-2xl font-bold">Weak Topics</h2>
            <WeakTopicGroups weakTopics={data.weakTopics} />
          </section>

          <section className="card mt-8 p-6" aria-labelledby="quiz-trend">
            <h2 id="quiz-trend" className="text-lg font-bold">Quiz scores over time</h2>
            {data.quizHistory.length === 0 ? (
              <EmptyState emoji="📝" title="No quizzes yet" className="mt-4" action={<Button to="/quiz">Take Your First Quiz</Button>} />
            ) : (
              <div className="mt-4 h-64" aria-label="Quiz score history chart">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.quizHistory} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
                    <CartesianGrid stroke="#EDEFF7" vertical={false} />
                    <XAxis dataKey="date" tickFormatter={(d) => formatDate(d, { month: "short", day: "numeric" })} tick={{ fontSize: 12, fill: "#5E6587" }} axisLine={false} tickLine={false} minTickGap={16} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#5E6587" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Line type="monotone" dataKey="score" stroke="#4338CA" strokeWidth={3} dot={{ r: 4, fill: "#fff", stroke: "#4338CA", strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}
