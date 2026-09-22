import { useState } from "react";
import { Navigate } from "react-router-dom";
import { LogIn, UserPlus, Sparkles } from "lucide-react";
import { login, register } from "../services/api.js";
import Button from "../components/ui/Button.jsx";

export default function Login() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (localStorage.getItem("pista:token")) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const res = mode === "login"
        ? await login({ email, password })
        : await register({ name, email, password });
      localStorage.setItem("pista:token", res.token);
      localStorage.setItem("pista:student-id", res.studentId);
      window.location.href = "/";
    } catch (err) {
      setError(err?.userMessage || err?.details?.detail || "Couldn't sign in. Check details and try again.");
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-surface p-6">
      <form onSubmit={submit} className="card w-full max-w-md p-7">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-600 text-white"><Sparkles className="h-5 w-5" /></span>
          <div>
            <h1 className="font-display text-2xl font-extrabold">PISTA</h1>
            <p className="text-sm text-muted">Your AI study path</p>
          </div>
        </div>

        <div className="mt-6 flex rounded-xl bg-surface p-1 ring-1 ring-line">
          {["login", "register"].map((m) => (
            <button key={m} type="button" onClick={() => { setMode(m); setError(""); }}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${mode === m ? "bg-white shadow-card" : "text-muted"}`}>
              {m === "login" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-4">
          {mode === "register" && (
            <div>
              <label htmlFor="auth-name" className="label">Full name</label>
              <input id="auth-name" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sail Sharma" required />
            </div>
          )}
          <div>
            <label htmlFor="auth-email" className="label">Email</label>
            <input id="auth-email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" required />
          </div>
          <div>
            <label htmlFor="auth-pass" className="label">Password</label>
            <input id="auth-pass" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" required />
          </div>
        </div>

        {error && <p className="mt-3 text-sm font-medium text-coral-600" role="alert">{error}</p>}

        <Button type="submit" size="lg" className="mt-5 w-full" loading={busy} icon={mode === "login" ? LogIn : UserPlus}>
          {mode === "login" ? "Sign in" : "Create my account"}
        </Button>

        <button type="button"
          onClick={() => { setMode("login"); setEmail("demo@pista.app"); setPassword("demo123"); setError(""); }}
          className="mt-3 w-full rounded-xl border border-dashed border-line px-3 py-2 text-xs font-semibold text-muted hover:bg-surface">
          Use demo account (demo@pista.app / demo123)
        </button>
      </form>
    </div>
  );
}