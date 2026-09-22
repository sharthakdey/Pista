import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Plus, Sparkles } from "lucide-react";
import { addExam, getExams } from "../services/api.js";
import { useApi } from "../hooks/useApi.js";
import { useStudy } from "../context/StudyContext.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import Button from "../components/ui/Button.jsx";
import Modal from "../components/ui/Modal.jsx";
import ProgressBar from "../components/ui/ProgressBar.jsx";
import SubjectDot from "../components/ui/SubjectDot.jsx";
import { CardSkeleton } from "../components/ui/Skeleton.jsx";
import { EmptyState, ErrorState } from "../components/ui/StateViews.jsx";
import { daysUntil, formatDate, formatTime } from "../utils/dates.js";
import DatesheetUpload from "../components/exams/DatesheetUpload.jsx";
import { Download } from "lucide-react";
import { API_BASE_URL } from "../config.js";

function urgencyOf(days) {
  if (days <= 5) {
    return {
      label: "Urgent",
      chip: "bg-coral-50 text-coral-600",
      rail: "bg-coral-500",
      num: "text-coral-500",
    };
  }

  if (days <= 10) {
    return {
      label: "Coming up",
      chip: "bg-amber-50 text-amber-600",
      rail: "bg-amber-500",
      num: "text-amber-600",
    };
  }

  return {
    label: "Plenty of time",
    chip: "bg-mint-50 text-mint-600",
    rail: "bg-mint-500",
    num: "text-ink-900",
  };
}

function AddExamModal({ open, onClose }) {
  const { invalidate, notify } = useStudy();

  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [semester, setSemester] = useState("");
  const [branch, setBranch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  const reset = () => {
    setSubject("");
    setTitle("");
    setDate("");
    setTime("10:00");
    setSemester("");
    setBranch("");
    setError("");
  };

  const save = async (e) => {
    e.preventDefault();

    if (!subject.trim()) {
      return setError("Enter the subject name.");
    }

    if (!date) {
      return setError("Pick the exam date.");
    }

    setSaving(true);
    setError("");

    try {
      await addExam({
        subject: subject.trim(),
        title: title.trim() || "Exam",
        date: new Date(
          `${date}T${time || "10:00"}`
        ).toISOString(),
        sem: semester.trim(),
        branch: branch.trim(),
      });

      notify(`${subject} exam added.`, "success");

      invalidate();
      reset();
      onClose();
    } catch (err) {
      setError(
        err?.userMessage ||
        "The exam couldn't be added. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Exam Manually"
    >
      <form onSubmit={save} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="exam-subject"
              className="label"
            >
              Subject Name
            </label>

            <input
              id="exam-subject"
              className="input"
              value={subject}
              onChange={(e) =>
                setSubject(e.target.value)
              }
              placeholder="e.g. Computer Networks"
            />
          </div>

          <div>
            <label
              htmlFor="exam-title"
              className="label"
            >
              Exam Title{" "}
              <span className="font-normal text-muted">
                (optional)
              </span>
            </label>

            <input
              id="exam-title"
              className="input"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="e.g. End Term Exam"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="exam-sem"
              className="label"
            >
              Semester
            </label>

            <input
              id="exam-sem"
              className="input"
              value={semester}
              onChange={(e) =>
                setSemester(e.target.value)
              }
              placeholder="e.g. 5"
            />
          </div>

          <div>
            <label
              htmlFor="exam-branch"
              className="label"
            >
              Branch
            </label>

            <input
              id="exam-branch"
              className="input"
              value={branch}
              onChange={(e) =>
                setBranch(e.target.value)
              }
              placeholder="e.g. CSE-AIML"
            />
          </div>
        </div>

        <div className="grid grid-cols-[1fr_120px] gap-3">
          <div>
            <label
              htmlFor="exam-date"
              className="label"
            >
              Date
            </label>

            <input
              id="exam-date"
              type="date"
              min={today}
              className="input"
              value={date}
              onChange={(e) =>
                setDate(e.target.value)
              }
            />
          </div>

          <div>
            <label
              htmlFor="exam-time"
              className="label"
            >
              Time
            </label>

            <input
              id="exam-time"
              type="time"
              className="input"
              value={time}
              onChange={(e) =>
                setTime(e.target.value)
              }
            />
          </div>
        </div>

        {error && (
          <p
            className="text-sm font-medium text-coral-600"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            loading={saving}
          >
            Add Exam
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function Exams() {
  const navigate = useNavigate();
  const { student } = useStudy();

  const exams = useApi(getExams);
  const {
    data,
    loading,
    error,
    reload,
  } = exams;

  const [open, setOpen] = useState(false);

  const subjects = student?.subjects || [];

  const sorted = [...(data || [])].sort(
    (a, b) =>
      new Date(a.date) - new Date(b.date)
  );

  const upcoming = sorted.filter(
    (e) => daysUntil(e.date) >= 0
  );

  const past = sorted.filter(
    (e) => daysUntil(e.date) < 0
  );

  return (
    <>
      <PageHeader
        icon={CalendarDays}
        title="Upcoming Exams"
        subtitle="PISTA plans your study sessions around these dates."
        actions={
          <div className="flex gap-2">
            <Button
              icon={Download}
              variant="secondary"
              onClick={() => window.open(`${API_BASE_URL}/exams/export-ics`, '_blank')}
            >
              Export Calendar
            </Button>
            <Button icon={Plus} onClick={() => setOpen(true)}>Add Exam</Button>
          </div>
        }
      />

      <DatesheetUpload onExtracted={reload} />

      {error ? (
        <ErrorState
          error={error}
          onRetry={reload}
          title="Your exams didn't load"
        />
      ) : loading ? (
        <div className="space-y-4">
          <CardSkeleton lines={2} />
          <CardSkeleton lines={2} />
        </div>
      ) : upcoming.length === 0 &&
        past.length === 0 ? (
        <EmptyState
          emoji="📅"
          title="No exams yet"
          message="Upload your datesheet PDF above, or add exam dates manually so PISTA can prioritise what to study."
          action={
            <Button
              icon={Plus}
              onClick={() => setOpen(true)}
            >
              Add Exam
            </Button>
          }
        />
      ) : upcoming.length === 0 ? (
        <EmptyState
          emoji="📅"
          title="No upcoming exams"
          message="All your saved exams are in the past. Add new dates below or upload a fresh datesheet."
          action={
            <Button
              icon={Plus}
              onClick={() => setOpen(true)}
            >
              Add Exam
            </Button>
          }
        />
      ) : (
        <ol className="relative space-y-4 sm:pl-8">
          <span
            className="absolute bottom-4 left-[11px] top-4 hidden w-px bg-line sm:block"
            aria-hidden
          />

          {upcoming.map((e) => {
            const days = daysUntil(e.date);
            const u = urgencyOf(days);

            return (
              <li
                key={e.id}
                className="relative animate-fade-in"
              >
                <span
                  className={`absolute -left-8 top-7 hidden h-[23px] w-[23px] rounded-full border-4 border-surface sm:block ${u.rail}`}
                  aria-hidden
                />

                <article className="card overflow-hidden">
                  <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${u.chip}`}
                        >
                          {u.label}
                        </span>

                        <span className="text-sm text-muted">
                          {e.title}
                        </span>
                      </div>

                      <h2 className="mt-2 flex items-center gap-2.5 text-xl font-bold sm:text-2xl">
                        <SubjectDot
                          subject={
                            e.subjectId ||
                            e.subject
                          }
                          className="h-3 w-3"
                        />
                        {e.subject}
                      </h2>

                      <p className="mt-1 text-[15px] text-muted">
                        <span aria-hidden>
                          📅
                        </span>{" "}
                        {formatDate(e.date, {
                          weekday: "short",
                          month: "long",
                          day: "numeric",
                        })}
                        {e.date?.includes("T")
                          ? `, ${formatTime(e.date)}`
                          : ""}
                      </p>

                      <div className="mt-4 max-w-md">
                        <div className="mb-1.5 flex justify-between text-sm">
                          <span className="text-muted">
                            Progress
                          </span>

                          <span className="font-semibold">
                            {e.preparedness}%
                            prepared
                          </span>
                        </div>

                        <ProgressBar
                          value={e.preparedness}
                          label={`${e.subject} preparedness`}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 border-t border-line pt-4 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                      <p className="sm:text-right">
                        <span
                          className={`block font-display text-[44px] font-extrabold leading-none ${u.num}`}
                        >
                          {days}
                        </span>

                        <span className="text-sm font-medium text-muted">
                          {days === 1
                            ? "day remaining"
                            : "days remaining"}
                        </span>
                      </p>

                      <Button
                        size="sm"
                        variant="secondary"
                        icon={Sparkles}
                        className="hover:-translate-y-0.5"
                        onClick={() =>
                          navigate("/tutor", {
                            state: {
                              prompt: `Create a study plan for my ${e.subject} exam. My exam is in ${days} days and my current preparedness is ${e.preparedness}%. The exam is "${e.title}". Help me decide what I should study today and prioritize the most important topics.`,
                            },
                          })
                        }
                      >
                        Plan study
                      </Button>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      )}

      {past.length > 0 && (
        <details className="mt-8">
          <summary className="cursor-pointer text-sm font-semibold text-muted hover:text-ink-900">
            Past exams ({past.length})
          </summary>

          <ul className="mt-3 space-y-2">
            {past.map((e) => (
              <li
                key={e.id}
                className="flex justify-between rounded-xl bg-white px-4 py-3 text-sm ring-1 ring-line"
              >
                <span className="font-medium">
                  {e.subject}
                </span>

                <span className="text-muted">
                  {formatDate(e.date)}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}

      <AddExamModal
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}