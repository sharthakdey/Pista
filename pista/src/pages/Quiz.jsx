import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ListChecks } from "lucide-react";
import { createQuiz, getProgress, submitQuiz } from "../services/api.js";
import { useApi } from "../hooks/useApi.js";
import { useStudy } from "../context/StudyContext.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import { ErrorState, LoadingState } from "../components/ui/StateViews.jsx";
import QuizSetup from "../components/quiz/QuizSetup.jsx";
import QuizRunner from "../components/quiz/QuizRunner.jsx";
import QuizResults from "../components/quiz/QuizResults.jsx";

/** stage: setup → generating → running → results (errors can happen in generating/submitting) */
export default function Quiz() {
  const location = useLocation();
  const navigate = useNavigate();
  const { invalidate, notify } = useStudy();
  const progress = useApi(getProgress);

  const [stage, setStage] = useState("setup");
  const [params, setParams] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const autoStarted = useRef(false);

  const generate = useCallback(async (p) => {
    setParams(p);
    setStage("generating");
    setError(null);
    setAnswers({});
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
    try {
      const q = await createQuiz(p);
      if (!q?.questions?.length) throw Object.assign(new Error("empty"), { userMessage: "PISTA couldn't write questions for this topic yet. Try another topic." });
      setQuiz(q);
      setStage("running");
    } catch (e) {
      setError(e);
      setStage("generate-error");
    }
  }, []);

  // Started from the AI Tutor's quiz card.
  useEffect(() => {
    const auto = location.state?.autostart;
    if (auto && !autoStarted.current) {
      autoStarted.current = true;
      navigate(location.pathname, { replace: true, state: null });
      generate({ subject: auto.subject, topic: auto.topic, difficulty: auto.difficulty || "medium", numQuestions: auto.numQuestions || 5 });
    }
  }, [location.state, location.pathname, navigate, generate]);

  const onAnswer = useCallback((qid, idx) => setAnswers((a) => ({ ...a, [qid]: idx })), []);

  const submit = async () => {
    setSubmitting(true);
    try {
      const r = await submitQuiz(quiz.quizId, answers);
      setResult(r);
      setStage("results");
      invalidate(); // progress, weak topics and recommendation all changed
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      notify(e?.userMessage || "PISTA couldn't grade this quiz. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const quit = () => { setStage("setup"); setQuiz(null); setAnswers({}); };

  return (
    <>
      <PageHeader
        icon={ListChecks}
        title="Test Your Knowledge"
        subtitle={stage === "results" ? "Here's how you did, and what to do next." : "Generate a quiz on any topic and get instant feedback."}
      />

      {stage === "setup" && (
        <QuizSetup progress={progress.data} loading={progress.loading} error={progress.error} onRetry={progress.reload} onGenerate={generate} />
      )}

      {stage === "generating" && (
        <div className="card">
          <LoadingState message="Generating your personalized quiz..." sub={params ? `${params.numQuestions} ${params.difficulty} questions on ${params.topic}` : undefined} />
        </div>
      )}

      {stage === "generate-error" && (
        <ErrorState error={error} title="Your quiz couldn't be generated" onRetry={() => generate(params)} />
      )}

      {stage === "running" && quiz && (
        <QuizRunner quiz={quiz} answers={answers} onAnswer={onAnswer} onSubmit={submit} submitting={submitting} onQuit={quit} />
      )}

      {stage === "results" && result && (
        <QuizResults result={result} onRetake={() => generate(params)} onNewQuiz={quit} />
      )}
    </>
  );
}
