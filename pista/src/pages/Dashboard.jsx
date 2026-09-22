import { Sparkles } from "lucide-react";
import { getExams, getProgress, getRecommendation } from "../services/api.js";
import { useApi } from "../hooks/useApi.js";
import { useStudy } from "../context/StudyContext.jsx";
import { greeting } from "../utils/dates.js";
import Button from "../components/ui/Button.jsx";
import RecommendationCard from "../components/dashboard/RecommendationCard.jsx";
import ExamCountdownCard from "../components/dashboard/ExamCountdownCard.jsx";
import WeakTopicsCard from "../components/dashboard/WeakTopicsCard.jsx";
import QuizPerformanceCard from "../components/dashboard/QuizPerformanceCard.jsx";
import StreakCard from "../components/dashboard/StreakCard.jsx";
import SubjectsCard from "../components/dashboard/SubjectsCard.jsx";

export default function Dashboard() {
  const { student } = useStudy();
  const rec = useApi(getRecommendation);
  const exams = useApi(getExams);
  const progress = useApi(getProgress);
  const firstName = student?.name?.split(" ")[0] || "Student";

  return (
    <>
      <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between lg:mb-10">
        <div>
          <h1 className="text-[28px] font-bold leading-tight sm:text-[36px]">
            {greeting()}, {firstName} <span aria-hidden>👋</span>
          </h1>
          <p className="mt-1.5 text-[15px] text-muted">
            Here's what matters for your studies today.
          </p>
        </div>
        <Button
          to="/tutor"
          variant="secondary"
          icon={Sparkles}
          className="self-start sm:self-auto lg:hover:-translate-y-0.5"
        >
          Ask PISTA
        </Button>
      </header>

      <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        <div className="lg:col-span-2">
          <RecommendationCard data={rec.data} loading={rec.loading} error={rec.error} onRetry={rec.reload} />
        </div>
        <ExamCountdownCard exams={exams.data} loading={exams.loading} error={exams.error} onRetry={exams.reload} />

        <WeakTopicsCard progress={progress.data} loading={progress.loading} error={progress.error} onRetry={progress.reload} />
        <QuizPerformanceCard progress={progress.data} loading={progress.loading} error={progress.error} onRetry={progress.reload} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:gap-5">
          <StreakCard days={progress.data?.streakDays ?? student?.stats?.streakDays ?? 0} loading={progress.loading} />
          <SubjectsCard progress={progress.data} loading={progress.loading} error={progress.error} onRetry={progress.reload} />
        </div>
      </div>
    </>
  );
}