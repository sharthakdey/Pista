import { useRef, useState } from "react";
import { CalendarClock, Loader2, UploadCloud, CheckCircle2, XCircle } from "lucide-react";
import { API_BASE_URL } from "../../config.js";
import { getStudentId } from "../../services/http.js";

const BRANCHES = ["CSE", "CSE-AIML", "CSE-AIFT"];

export default function DatesheetUpload({ onExtracted }) {
    const inputRef = useRef(null);
    const [sem, setSem] = useState("");
    const [branch, setBranch] = useState("");
    const [state, setState] = useState(null);

    const onFile = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        setState({ kind: "busy", msg: "Reading datesheet…" });
        const form = new FormData();
        form.append("file", file);
        form.append("semester", sem);
        form.append("branch", branch);
        try {
            const res = await fetch(`${API_BASE_URL}/exams/extract`, {
                method: "POST",
                headers: { "X-Student-Id": getStudentId() || "student-001" },
                body: form,
            });
            if (!res.ok) throw new Error((await res.json())?.detail || "Extraction failed");
            const data = await res.json();
            setState({ kind: "ok", msg: `Saved ${data.saved} exam${data.saved === 1 ? "" : "s"} to your profile.` });
            onExtracted?.();
        } catch (err) {
            setState({ kind: "err", msg: err.message || "Couldn't read the datesheet." });
        }
    };

    return (
        <div className="card p-5">
            <h2 className="flex items-center gap-2 text-lg font-bold">
                <CalendarClock className="h-5 w-5 text-brand-600" /> Upload datesheet PDF
            </h2>
            <p className="mt-1 text-sm text-muted">PISTA reads the official datesheet and saves your exam dates automatically.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-[130px_170px_auto] sm:items-center">
                <input className="input" placeholder="Sem (e.g. 5)" value={sem} onChange={(e) => setSem(e.target.value)} aria-label="Your semester" />
                <select className="input" value={branch} onChange={(e) => setBranch(e.target.value)} aria-label="Your branch">
                    <option value="">All branches</option>
                    {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                <button
                    type="button"
                    disabled={state?.kind === "busy"}
                    onClick={() => inputRef.current?.click()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
                >
                    {state?.kind === "busy" ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                    {state?.kind === "busy" ? "Extracting…" : "Upload Datesheet"}
                </button>
                <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={onFile} />
            </div>
            {state && state.kind !== "busy" && (
                <p className={`mt-3 flex items-center gap-1.5 text-sm font-medium ${state.kind === "ok" ? "text-mint-600" : "text-coral-600"}`}>
                    {state.kind === "ok" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />} {state.msg}
                </p>
            )}
        </div>
    );
}