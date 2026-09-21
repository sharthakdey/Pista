import { useMemo, useRef, useState } from "react";
import { BookOpen, UploadCloud, FileText, Presentation, File, Loader2, CheckCircle2, XCircle, Search } from "lucide-react";
import { getMaterials, getProgress, uploadMaterial } from "../services/api.js";
import { useApi } from "../hooks/useApi.js";
import { useStudy } from "../context/StudyContext.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import Button from "../components/ui/Button.jsx";
import ProgressBar from "../components/ui/ProgressBar.jsx";
import SubjectDot from "../components/ui/SubjectDot.jsx";
import { Skeleton } from "../components/ui/Skeleton.jsx";
import { EmptyState, ErrorState } from "../components/ui/StateViews.jsx";
import { formatBytes, uid, validateUpload } from "../utils/format.js";
import { formatDate } from "../utils/dates.js";
import { BookOpen, UploadCloud, FileText, Presentation, File, Loader2, CheckCircle2, XCircle, Search, Trash2 } from "lucide-react";
import { getMaterials, getProgress, uploadMaterial, deleteMaterial } from "../services/api.js";
const ACCEPT = ".pdf,.ppt,.pptx,.doc,.docx,.txt";

function TypeIcon({ type }) {
  const t = (type || "").toLowerCase();
  const Icon = t.startsWith("ppt") ? Presentation : t === "pdf" ? FileText : File;
  const tone = t.startsWith("ppt") ? "bg-amber-50 text-amber-600" : t === "pdf" ? "bg-coral-50 text-coral-600" : "bg-electric-500/10 text-electric-600";
  return <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tone}`}><Icon className="h-5 w-5" aria-hidden /></span>;
}

function StatusChip({ status }) {
  if (status === "processed") {
    return <span className="inline-flex items-center gap-1.5 rounded-full bg-mint-50 px-2.5 py-1 text-xs font-semibold text-mint-600"><CheckCircle2 className="h-3.5 w-3.5" aria-hidden />Processed</span>;
  }
  if (status === "failed") {
    return <span className="inline-flex items-center gap-1.5 rounded-full bg-coral-50 px-2.5 py-1 text-xs font-semibold text-coral-600"><XCircle className="h-3.5 w-3.5" aria-hidden />Failed</span>;
  }
  return <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600"><Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />Processing...</span>;
}

function Searchable({ yes }) {
  return <span className={`text-sm ${yes ? "font-medium text-ink-800" : "text-muted"}`}>{yes ? "Ready for questions" : "Not yet"}</span>;
}

export default function Materials() {
  const { notify } = useStudy();
  const pollWhile = useMemo(() => (list) => Array.isArray(list) && list.some((m) => m.status === "processing"), []);
  const materials = useApi(getMaterials, [], { pollMs: 4000, pollWhile });
  const progress = useApi(getProgress);
  const subjects = progress.data?.subjects || [];

  const [subject, setSubject] = useState("");
  const [uploads, setUploads] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const selectedSubject = subject || subjects[0]?.id || "";

  const startUploads = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const all = files.map((f) => {
      const invalid = validateUpload(f);
      return { id: uid("up"), file: f, progress: 0, status: invalid ? "error" : "uploading", error: invalid };
    });
    setUploads((u) => [...all, ...u]);
    const items = all.filter((x) => !x.error);
    for (const item of items) {
      try {
        await uploadMaterial(item.file, { subject: selectedSubject }, (p) =>
          setUploads((u) => u.map((x) => (x.id === item.id ? { ...x, progress: p } : x))));
        setUploads((u) => u.map((x) => (x.id === item.id ? { ...x, status: "done", progress: 100 } : x)));
        notify(`${item.file.name} uploaded. PISTA is processing it now.`, "success");
        materials.reload();
        setTimeout(() => setUploads((u) => u.filter((x) => x.id !== item.id)), 2500);
      } catch (e) {
        setUploads((u) => u.map((x) => (x.id === item.id ? { ...x, status: "error", error: e?.userMessage || "Upload failed. Please try again." } : x)));
      }
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    startUploads(e.dataTransfer.files);
  };

  const list = (materials.data || []).filter((m) =>
    (filter === "all" || (m.subjectId || m.subject) === filter) &&
    (!query || m.fileName.toLowerCase().includes(query.toLowerCase())));

  return (
    <>
      <PageHeader icon={BookOpen} title="Course Materials" subtitle="Give PISTA the knowledge you learn from." />

      <section className="card p-5 sm:p-6" aria-labelledby="upload-title">
        <h2 id="upload-title" className="sr-only">Upload material</h2>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`relative flex flex-col items-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition sm:py-12
            ${dragging ? "border-brand-500 bg-brand-50" : "border-ink-300/60 bg-surface/60"}`}
        >
          <span className={`grid h-16 w-16 place-items-center rounded-3xl bg-white shadow-card transition ${dragging ? "scale-110" : ""}`}>
            <UploadCloud className="h-8 w-8 text-brand-600" aria-hidden />
          </span>
          <p className="mt-4 font-display text-xl font-bold">Drop your files here</p>
          <p className="mt-1 text-sm font-medium text-muted">PDF • PPT • PPTX • DOC • DOCX • TXT, up to 50 MB</p>

          <div className="mt-6 flex w-full max-w-md flex-col items-stretch gap-2 sm:flex-row">
            <label htmlFor="upload-subject" className="sr-only">Subject for uploaded files</label>
            <select id="upload-subject" className="input sm:flex-1" value={selectedSubject} onChange={(e) => setSubject(e.target.value)} disabled={!subjects.length}>
              {!subjects.length && <option>Loading subjects…</option>}
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <Button icon={UploadCloud} onClick={() => inputRef.current?.click()} disabled={!selectedSubject}>Upload Material</Button>
          </div>
          <input ref={inputRef} type="file" accept={ACCEPT} multiple className="sr-only" tabIndex={-1}
            onChange={(e) => { startUploads(e.target.files); e.target.value = ""; }} />
        </div>

        {uploads.length > 0 && (
          <ul className="mt-4 space-y-2" aria-live="polite">
            {uploads.map((u) => (
              <li key={u.id} className="flex animate-fade-in items-center gap-3 rounded-2xl border border-line p-3">
                <TypeIcon type={u.file.name.split(".").pop()} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate font-medium">{u.file.name}</span>
                    <span className="shrink-0 text-muted">
                      {u.status === "uploading" && `${u.progress}%`}
                      {u.status === "done" && <span className="font-semibold text-mint-600">Uploaded</span>}
                    </span>
                  </div>
                  {u.status === "error" ? (
                    <p className="mt-1 text-sm text-coral-600">{u.error}</p>
                  ) : (
                    <>
                      <ProgressBar value={u.progress} size="sm" tone={u.status === "done" ? "mint" : "brand"} className="mt-2" label={`Uploading ${u.file.name}`} />
                      {u.status === "uploading" && <p className="mt-1 text-xs text-muted">Uploading material... {formatBytes(u.file.size)}</p>}
                    </>
                  )}
                </div>
                {u.status === "error" && (
                  <button onClick={() => setUploads((x) => x.filter((y) => y.id !== u.id))} className="text-sm font-semibold text-muted hover:text-ink-900">Dismiss</button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8" aria-labelledby="my-materials">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="my-materials" className="text-2xl font-bold">My Materials</h2>
          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden />
            <label htmlFor="mat-search" className="sr-only">Search materials</label>
            <input id="mat-search" className="input pl-9" placeholder="Search files" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>

        {subjects.length > 0 && (
          <div className="-mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-thin" role="tablist" aria-label="Filter by subject">
            {[{ id: "all", name: "All subjects" }, ...subjects].map((s) => (
              <button key={s.id} role="tab" aria-selected={filter === s.id} onClick={() => setFilter(s.id)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold transition
                  ${filter === s.id ? "bg-ink-900 text-white" : "bg-white text-ink-700 ring-1 ring-line hover:ring-brand-200"}`}>
                {s.id !== "all" && <SubjectDot subject={s.id} />}{s.name}
              </button>
            ))}
          </div>
        )}

        {materials.error ? (
          <ErrorState error={materials.error} onRetry={materials.reload} title="Your materials didn't load" />
        ) : materials.loading ? (
          <div className="card divide-y divide-line">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 p-4"><Skeleton className="h-10 w-10" /><div className="flex-1"><Skeleton className="h-4 w-1/2" /><Skeleton className="mt-2 h-3 w-1/4" /></div></div>
            ))}
            <p className="sr-only">Loading materials…</p>
          </div>
        ) : (materials.data || []).length === 0 ? (
          <EmptyState emoji="📚" title="Your study library is empty"
            message="Upload your notes, presentations or syllabus and let PISTA learn from them."
            action={<Button icon={UploadCloud} onClick={() => inputRef.current?.click()}>Upload Material</Button>} />
        ) : list.length === 0 ? (
          <EmptyState emoji="🔎" title="No matching files" message="Try another subject or search term." />
        ) : (
          <>
            {/* Table (tablet/desktop) */}
            <div className="card hidden overflow-hidden md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface/70 text-xs text-muted">
                  <tr>
                    <th className="px-5 py-3 font-semibold">File</th>
                    <th className="px-3 py-3 font-semibold">Subject</th>
                    <th className="px-3 py-3 font-semibold">Uploaded</th>
                    <th className="px-3 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Searchable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {list.map((m) => (
                    <tr key={m.id} className="transition hover:bg-surface/50">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <TypeIcon type={m.fileType} />
                          <div className="min-w-0">
                            <p className="max-w-[260px] truncate font-semibold lg:max-w-[340px]" title={m.fileName}>{m.fileName}</p>
                            <p className="text-xs uppercase text-muted">{m.fileType}{m.sizeBytes ? `, ${formatBytes(m.sizeBytes)}` : ""}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5"><span className="flex items-center gap-2"><SubjectDot subject={m.subjectId || m.subject} />{m.subject}</span></td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-muted">{formatDate(m.uploadedAt, { month: "short", day: "numeric" })}</td>
                      <td className="px-3 py-3.5"><StatusChip status={m.status} /></td>
                      <td className="px-5 py-3.5"><Searchable yes={m.searchable} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards (mobile) */}
            <ul className="space-y-3 md:hidden">
              {list.map((m) => (
                <li key={m.id} className="card p-4">
                  <div className="flex items-start gap-3">
                    <TypeIcon type={m.fileType} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold" title={m.fileName}>{m.fileName}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                        <SubjectDot subject={m.subjectId || m.subject} />{m.subject}, {formatDate(m.uploadedAt, { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
                    <StatusChip status={m.status} />
                    <Searchable yes={m.searchable} />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </>
  );
}
