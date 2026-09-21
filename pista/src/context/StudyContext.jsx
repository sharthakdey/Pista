import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getStudent } from "../services/api.js";
import { DEMO_MODE } from "../config.js";

const StudyContext = createContext(null);

/**
 * App-wide state: the student profile, a `dataVersion` counter that tells
 * data hooks to refetch after something changes (e.g. a quiz is submitted),
 * and a small toast queue.
 */
export function StudyProvider({ children }) {
  const [dataVersion, setDataVersion] = useState(0);
  const [student, setStudent] = useState(null);
  const [studentError, setStudentError] = useState(null);
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  const invalidate = useCallback(() => setDataVersion((v) => v + 1), []);

  const notify = useCallback((message, tone = "info") => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);
  const dismissToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  useEffect(() => {
    let alive = true;
    getStudent()
      .then((s) => { if (alive) { setStudent(s); setStudentError(null); } })
      .catch((e) => { if (alive) setStudentError(e); });
    return () => { alive = false; };
  }, [dataVersion]);

  const value = useMemo(
    () => ({ dataVersion, invalidate, student, setStudent, studentError, toasts, notify, dismissToast, demoMode: DEMO_MODE }),
    [dataVersion, invalidate, student, studentError, toasts, notify, dismissToast]
  );
  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy() {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error("useStudy must be used inside <StudyProvider>");
  return ctx;
}
