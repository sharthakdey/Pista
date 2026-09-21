import { useEffect, useState } from "react";
import { Settings as SettingsIcon, Save, RotateCcw, Server, FlaskConical } from "lucide-react";
import { getExams, updateStudent, resetDemoData } from "../services/api.js";
import { useApi } from "../hooks/useApi.js";
import { useStudy } from "../context/StudyContext.jsx";
import { API_BASE_URL, setDemoModeOverride } from "../config.js";
import PageHeader from "../components/ui/PageHeader.jsx";
import Button from "../components/ui/Button.jsx";
import Avatar from "../components/ui/Avatar.jsx";
import Segmented from "../components/ui/Segmented.jsx";
import SubjectDot from "../components/ui/SubjectDot.jsx";
import Modal from "../components/ui/Modal.jsx";
import { CardSkeleton } from "../components/ui/Skeleton.jsx";
import { ErrorState } from "../components/ui/StateViews.jsx";
import { daysUntil, formatDate } from "../utils/dates.js";

const STYLES = [
  { value: "simple", label: "Simple" },
  { value: "detailed", label: "Detailed" },
  { value: "exam-focused", label: "Exam-focused" },
];

export default function Settings() {
  const { student, studentError, setStudent, invalidate, notify, demoMode } = useStudy();
  const exams = useApi(getExams);
  const [name, setName] = useState("");
  const [prefs, setPrefs] = useState(null);
  const [saving, setSaving] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  useEffect(() => {
    if (student && prefs === null) { setName(student.name); setPrefs(student.preferences); }
  }, [student, prefs]);

  if (studentError && !student) {
    return (<><PageHeader icon={SettingsIcon} title="Profile & Settings" /><ErrorState error={studentError} onRetry={invalidate} /></>);
  }
  if (!student || !prefs) {
    return (<><PageHeader icon={SettingsIcon} title="Profile & Settings" /><div className="grid gap-5 lg:grid-cols-2"><CardSkeleton lines={4} /><CardSkeleton lines={4} /></div></>);
  }

  const dirty = name.trim() !== student.name || JSON.stringify(prefs) !== JSON.stringify(student.preferences);

  const save = async () => {
    if (!name.trim()) return notify("Enter your name to save.", "error");
    setSaving(true);
    try {
      const updated = await updateStudent({ name: name.trim(), preferences: prefs });
      setStudent(updated);
      notify("Settings saved.", "success");
    } catch (e) {
      notify(e?.userMessage || "Settings couldn't be saved.", "error");
    } finally {
      setSaving(false);
    }
  };

  const doReset = async () => {
    await resetDemoData();
    localStorage.removeItem("pista:conversations:v1");
    setResetOpen(false);
    window.location.assign(import.meta.env.VITE_ROUTER === "hash" ? "#/dashboard" : "/dashboard");
  };

  const upcoming = (exams.data || []).filter((e) => daysUntil(e.date) >= 0).sort((a, b) => new Date(a.date) - new Date(b.date));
  const stats = [
    ["Study streak", `${student.stats.streakDays} days`],
    ["Hours studied", student.stats.studyHours],
    ["Quizzes taken", student.stats.quizzesTaken],
    ["Topics mastered", student.stats.topicsMastered],
  ];

  return (
    <>
      <PageHeader
        icon={SettingsIcon}
        title="Profile & Settings"
        subtitle={
          dirty
            ? "You have unsaved changes."
            : "Tell PISTA how you like to learn."
        }
        actions={
          <Button
            icon={Save}
            onClick={save}
            loading={saving}
            disabled={!dirty}
          >
            Save changes
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card p-6" aria-labelledby="profile-h">
          <h2 id="profile-h" className="text-lg font-bold">Profile</h2>
          <div className="mt-5 flex items-center gap-4">
            <Avatar name={name || student.name} size={64} />
            <div className="min-w-0 flex-1">
              <label htmlFor="student-name" className="label">Name</label>
              <input id="student-name" className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>
          <p className="mt-3 text-sm text-muted">{[student.program, student.semester].filter(Boolean).join(", ")}</p>

          <h3 className="mt-6 font-sans text-sm font-semibold text-ink-800">Subjects</h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {student.subjects.map((s) => (
              <li key={s.id} className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-sm font-medium">
                <SubjectDot subject={s.id} />{s.name}
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-6" aria-labelledby="prefs-h">
          <h2 id="prefs-h" className="text-lg font-bold">Learning preferences</h2>
          <div className="mt-5 space-y-5">
            <div>
              <span className="label">Explanation style</span>
              <Segmented label="Explanation style" options={STYLES} value={prefs.explanationStyle}
                onChange={(v) => setPrefs((p) => ({ ...p, explanationStyle: v }))} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="session-len" className="label">Study session length</label>
                <select id="session-len" className="input" value={prefs.sessionLength}
                  onChange={(e) => setPrefs((p) => ({ ...p, sessionLength: Number(e.target.value) }))}>
                  {[25, 45, 60, 90].map((m) => <option key={m} value={m}>{m} minutes</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="daily-goal" className="label">Daily goal</label>
                <select id="daily-goal" className="input" value={prefs.dailyGoalMinutes}
                  onChange={(e) => setPrefs((p) => ({ ...p, dailyGoalMinutes: Number(e.target.value) }))}>
                  {[30, 60, 90, 120, 180].map((m) => <option key={m} value={m}>{m >= 60 ? `${m / 60} hour${m > 60 ? "s" : ""}` : `${m} minutes`}</option>)}
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="card p-6" aria-labelledby="sched-h">
          <div className="flex items-center justify-between">
            <h2 id="sched-h" className="text-lg font-bold">Exam schedule</h2>
            <Button to="/exams" size="sm" variant="ghost">Manage</Button>
          </div>
          {exams.error ? <ErrorState compact error={exams.error} onRetry={exams.reload} className="mt-3" /> : (
            <ul className="mt-3 divide-y divide-line">
              {exams.loading && <li className="py-3 text-sm text-muted">Loading exams…</li>}
              {!exams.loading && upcoming.length === 0 && <li className="py-3 text-sm text-muted">No upcoming exams.</li>}
              {upcoming.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span className="flex items-center gap-2 font-medium"><SubjectDot subject={e.subjectId || e.subject} />{e.subject}</span>
                  <span className="text-muted">{formatDate(e.date, { month: "short", day: "numeric" })}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-6" aria-labelledby="stats-h">
          <h2 id="stats-h" className="text-lg font-bold">Study statistics</h2>
          <dl className="mt-4 grid grid-cols-2 gap-3">
            {stats.map(([k, v]) => (
              <div key={k} className="rounded-2xl bg-surface p-4">
                <dt className="text-sm text-muted">{k}</dt>
                <dd className="mt-1 font-display text-2xl font-bold">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="card p-6 lg:col-span-2" aria-labelledby="conn-h">
          <h2 id="conn-h" className="text-lg font-bold">Study service connection</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3 rounded-2xl bg-surface p-4">
              <Server className="mt-0.5 h-5 w-5 shrink-0 text-ink-400" aria-hidden />
              <div className="min-w-0">
                <p className="font-semibold">Backend</p>
                <p className="break-all text-sm text-muted">{API_BASE_URL || "Not configured. Set VITE_API_BASE_URL in your .env file."}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl bg-surface p-4">
              <FlaskConical className="mt-0.5 h-5 w-5 shrink-0 text-ink-400" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">Demo Mode is {demoMode ? "on" : "off"}</p>
                <p className="text-sm text-muted">
                  {demoMode ? "PISTA is using sample data for Harman." : "PISTA is using the live study service."}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {demoMode && API_BASE_URL && <Button size="sm" variant="secondary" onClick={() => setDemoModeOverride(false)}>Use live service</Button>}
                  {!demoMode && <Button size="sm" variant="secondary" onClick={() => setDemoModeOverride(true)}>Switch to Demo Mode</Button>}
                  {demoMode && <Button size="sm" variant="danger" icon={RotateCcw} onClick={() => setResetOpen(true)}>Reset demo data</Button>}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Modal open={resetOpen} onClose={() => setResetOpen(false)} title="Reset demo data?"
        footer={<><Button variant="secondary" onClick={() => setResetOpen(false)}>Cancel</Button><Button variant="danger" onClick={doReset}>Reset demo data</Button></>}>
        <p className="text-[15px] text-muted">This restores the sample progress, quiz history, materials and exams, and clears tutor conversations. Use it before presenting the demo.</p>
      </Modal>
    </>
  );
}