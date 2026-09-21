import { useNavigate } from "react-router-dom";
import { ListChecks, ArrowRight } from "lucide-react";
import Button from "../ui/Button.jsx";

export default function QuizActionCard({ action }) {
  const navigate = useNavigate();
  if (action?.type !== "quiz") return null;
  const start = () => navigate("/quiz", { state: { autostart: action } });
  return (
    <div className="mt-4 flex flex-col gap-4 rounded-2xl bg-ink-900 p-4 text-white sm:flex-row sm:items-center">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10">
        <ListChecks className="h-5 w-5 text-violet-400" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display font-semibold">{action.topic} quiz</p>
        <p className="text-sm text-ink-300">
          {action.numQuestions} questions, {action.difficulty} difficulty, {action.subject}
        </p>
      </div>
      <Button variant="light" onClick={start} iconRight={ArrowRight}>Start Quiz</Button>
    </div>
  );
}
