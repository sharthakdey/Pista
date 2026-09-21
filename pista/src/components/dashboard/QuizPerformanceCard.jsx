import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { CardSkeleton } from "../ui/Skeleton.jsx";
import { ErrorState, EmptyState } from "../ui/StateViews.jsx";
import Button from "../ui/Button.jsx";
import { formatDate } from "../../utils/dates.js";

export function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-xl bg-ink-900 px-3 py-2 text-xs text-white shadow-lift">
      <div className="font-semibold">{p.topic}</div>
      <div className="text-ink-300">{formatDate(p.date, { month: "short", day: "numeric" })}: <span className="font-semibold text-white">{p.score}%</span></div>
    </div>
  );
}

export default function QuizPerformanceCard({ progress, loading, error, onRetry }) {
  if (error) return <ErrorState compact error={error} onRetry={onRetry} title="Quiz results didn't load" />;
  if (loading) return <CardSkeleton lines={4} />;
  const history = (progress?.quizHistory || []).slice(-8);
  if (!history.length) {
    return (
      <EmptyState emoji="📝" title="No quizzes yet" className="h-full !py-8"
        action={
          <Button
            to="/quiz"
            size="sm"
            iconRight={ArrowRight}
          >
            Take Your First Quiz
          </Button>
        } />
    );
  }
  const latest = history[history.length - 1];
  const prev = history[history.length - 2];
  const delta = prev ? latest.score - prev.score : 0;
  const up = delta >= 0;
  return (
    <section className="card flex h-full flex-col p-5 sm:p-6" aria-labelledby="quizperf-title">
      <h2 id="quizperf-title" className="font-sans text-sm font-semibold text-muted">Quiz performance</h2>
      <div className="mt-2 flex items-end gap-3">
        <span key={latest.id} className="animate-pop-in font-display text-[44px] font-extrabold leading-none tracking-tight transition-transform duration-200 ease-out hover:scale-[1.02]">{latest.score}%</span>
        {prev && (
          <span className={`mb-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${up ? "bg-mint-50 text-mint-600" : "bg-coral-50 text-coral-600"}`}>
            {up ? <TrendingUp className="h-3.5 w-3.5" aria-hidden /> : <TrendingDown className="h-3.5 w-3.5" aria-hidden />}
            {up ? "+" : ""}{delta} pts
          </span>
        )}
      </div>
      <p className="mt-1 truncate text-sm text-muted">Latest: {latest.topic}</p>
      <div className="mt-3 h-28 min-h-[112px] flex-1" aria-label="Recent quiz score trend">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="qp-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#5B5BF0" stopOpacity=".28" />
                <stop offset="1" stopColor="#5B5BF0" stopOpacity="0" />
              </linearGradient>
            </defs>
            <XAxis dataKey="id" hide />
            <YAxis domain={[0, 100]} hide />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#C4C8FF" }} />
            <Area type="monotone" dataKey="score" stroke="#4338CA" strokeWidth={2.5} fill="url(#qp-fill)"
              dot={{ r: 3, fill: "#fff", stroke: "#4338CA", strokeWidth: 2 }} activeDot={{ r: 5 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}