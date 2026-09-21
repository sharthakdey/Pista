import Button from "../components/ui/Button.jsx";
import { LogoMark } from "../components/ui/Logo.jsx";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center bg-ink-900 px-6 text-center text-white">
      <div>
        <LogoMark size={56} className="mx-auto" />
        <h1 className="mt-6 text-4xl font-bold">This path doesn't exist</h1>
        <p className="mt-2 text-ink-300">The page you opened isn't part of PISTA.</p>
        <Button to="/dashboard" variant="light" className="mt-6">Go to Dashboard</Button>
      </div>
    </div>
  );
}
