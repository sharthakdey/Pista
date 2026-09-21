import { subjectStyle } from "../../utils/subjects.js";

export default function SubjectDot({ subject, className = "" }) {
  return <span className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${subjectStyle(subject).dot} ${className}`} aria-hidden />;
}
