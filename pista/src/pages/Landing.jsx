import { Link } from "react-router-dom";
import {
  ArrowRight, Sparkles, Compass, FileSearch, ListChecks, TrendingUp, CalendarClock, Gauge, Target, UploadCloud, CalendarPlus, BookOpenCheck,
} from "lucide-react";
import Logo from "../components/ui/Logo.jsx";
import Button from "../components/ui/Button.jsx";
import PistaOrb from "../components/chat/PistaOrb.jsx";

/* The hero path: drawn once on load, passing through study milestones. */
function HeroPath() {
  return (
    <svg viewBox="0 0 1200 520" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="hero-path" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2F7BFF" stopOpacity="0" />
          <stop offset=".25" stopColor="#2F7BFF" stopOpacity=".7" />
          <stop offset="1" stopColor="#A78BFA" />
        </linearGradient>
      </defs>
      <path
        d="M-20 470 C 180 470, 240 330, 420 330 S 640 420, 760 300 S 960 90, 1220 110"
        fill="none" stroke="url(#hero-path)" strokeWidth="3" strokeLinecap="round"
        className="path-draw" style={{ "--len": 1500, animationDuration: "2.4s" }}
      />
      <circle
        r="5"
        fill="#ffffff"
        className="path-glow"
      >
        <animateMotion
          dur="5s"
          repeatCount="indefinite"
          path="M-20 470 C 180 470, 240 330, 420 330 S 640 420, 760 300 S 960 90, 1220 110"
        />
      </circle>
      <path
        d="M-20 470 C 180 470, 240 330, 420 330 S 640 420, 760 300 S 960 90, 1220 110"
        fill="none" stroke="#fff" strokeOpacity=".04" strokeWidth="26" strokeLinecap="round"
      />
    </svg>
  );
}

function Milestone({ className, icon: Icon, label, tone, delay }) {
  return (
    <div className={`absolute hidden animate-pop-in items-center gap-2 rounded-full bg-ink-800/90 py-1.5 pl-1.5 pr-3 text-xs font-semibold text-white ring-1 ring-white/10 backdrop-blur transition duration-200 hover:-translate-y-1 hover:bg-ink-700 ${className}`}
      style={{ animationDelay: delay }} aria-hidden>
      <span className={`grid h-6 w-6 place-items-center rounded-full ${tone}`}><Icon className="h-3.5 w-3.5" /></span>
      {label}
    </div>
  );
}

function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[500px]" aria-label="Preview of the PISTA dashboard and AI tutor" role="img">
      <div className="animate-fade-in overflow-hidden rounded-[28px] bg-white shadow-[0_40px_80px_-30px_rgba(0,0,0,.6)] ring-1 ring-white/10">
        <div className="flex">
          <div className="hidden w-14 shrink-0 flex-col items-center gap-3 bg-ink-900 py-4 sm:flex">
            <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-electric-500 to-violet-500" />
            {[0, 1, 2, 3, 4].map((i) => <span key={i} className={`h-2 w-6 rounded-full ${i === 0 ? "bg-electric-400" : "bg-white/15"}`} />)}
          </div>
          <div className="min-w-0 flex-1 bg-surface p-4 pb-14">
            <p className="font-display text-base font-bold text-ink-900">Good morning👋</p>
            <div className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-brand-600">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-600" />
              PISTA is personalizing your study path
            </div>
            <div
              className="mt-3 animate-fade-in rounded-2xl bg-ink-900 p-4 text-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_15px_40px_-20px_rgba(47,123,255,.5)]"
              style={{ animationDelay: ".25s" }}
            >
              <p className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-300"><Sparkles className="h-3 w-3 text-violet-400" />Today's Study Recommendation</p>
              <p className="mt-2 font-display text-[17px] font-bold leading-tight">Focus on Computer Networks — ARQ Protocols</p>
              <div className="mt-3 grid grid-cols-2 gap-1.5 text-[11px]">
                {[[CalendarClock, "Exam in 4 days", "text-electric-400"], [Gauge, "Progress 48%", "text-violet-400"], [ListChecks, "Quiz accuracy 55%", "text-amber-500"], [Target, "Weak topic", "text-coral-500"]].map(([I, t, c]) => (
                  <span key={t} className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2 py-1.5"><I className={`h-3 w-3 ${c}`} />{t}</span>
                ))}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[["4 days", "CN exam"], ["72%", "Last quiz"], ["🔥 6", "Day streak"]].map(([v, l]) => (
                <div
                  key={l}
                  className="rounded-xl bg-white p-2.5 ring-1 ring-line transition duration-200 hover:-translate-y-1 hover:shadow-card"
                >
                  <p className="font-display text-base font-bold text-ink-900">{v}</p>
                  <p className="text-[10px] text-muted">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating tutor message */}
      <div
        className="relative -mt-10 ml-auto w-[84%] animate-fade-in rounded-2xl bg-white p-4 shadow-lift ring-1 ring-line transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,.35)] sm:-mr-6"
        style={{ animationDelay: ".9s" }}
      >
        <div className="flex items-start gap-2.5">
          <PistaOrb size={28} />
          <div className="min-w-0 text-[13px] leading-relaxed text-ink-800">
            <p>
              <span className="font-semibold text-ink-900">Go-Back-N</span> explained simply: if frame 3 is lost, the sender resends frame 3 and the following frames.
            </p>
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-electric-500/10 px-2 py-0.5 text-[11px] font-semibold text-electric-600">AI Tutor • Course Material</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const FEATURES = [
  { icon: Sparkles, title: "AI Tutor", text: "Ask questions and learn difficult concepts with personalized explanations." },
  { icon: Compass, title: "Smart Recommendations", text: "PISTA analyzes exams, progress and weak topics to recommend what you should study." },
  { icon: FileSearch, title: "Course-Aware AI", text: "Ask questions directly from your uploaded notes, PDFs and course material." },
  { icon: ListChecks, title: "Intelligent Quizzes", text: "Generate quizzes and receive explanations and performance feedback." },
  { icon: TrendingUp, title: "Progress Tracking", text: "See your learning progress and identify topics that need attention." },
];

const STEPS = [
  { icon: UploadCloud, title: "Upload your material", text: "Notes, slides and syllabus become searchable knowledge." },
  { icon: CalendarPlus, title: "Add your exams", text: "PISTA knows how much time you have for each subject." },
  { icon: BookOpenCheck, title: "Learn and quiz", text: "Explanations from your notes, then questions that check what stuck." },
  { icon: Compass, title: "Follow your path", text: "Every result updates tomorrow's recommendation." },
];

export default function Landing() {
  return (
    <div className="min-h-dvh bg-surface">
      {/* Hero */}
      <div className="relative overflow-hidden bg-ink-900 text-white">
        <div
          className="pointer-events-none absolute -left-40 top-20 h-[420px] w-[420px] animate-pulse rounded-full bg-electric-500/15 blur-[100px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-[460px] w-[460px] animate-pulse rounded-full bg-violet-500/20 blur-[110px]"
          aria-hidden
        />

        <header className="relative z-10 mx-auto flex h-20 max-w-[1200px] items-center justify-between px-5 sm:px-8">
          <Logo size={38} />
          <nav className="flex items-center gap-1 sm:gap-2" aria-label="Site">
            <a
              href="#features"
              className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-ink-300 transition-colors duration-150 hover:text-white sm:block"
            >
              Features
            </a>

            <a
              href="#how"
              className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-ink-300 transition-colors duration-150 hover:text-white sm:block"
            >
              How it works
            </a>  
            <Button to="/dashboard" variant="glass" size="sm">Open app</Button>
          </nav>
        </header>

        <section className="relative mx-auto max-w-[1200px] px-5 pb-16 pt-6 sm:px-8 lg:pb-28 lg:pt-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[580px]">
            <HeroPath />
          </div>
          <Milestone
            className="left-[28%] top-[250px]"
            icon={FileSearch}
            label="Lecture 5 notes"
            tone="bg-electric-500"
            delay=".8s"
          />

          <Milestone
            className="left-[52%] top-[330px]"
            icon={CalendarClock}
            label="Exam in 4 days"
            tone="bg-amber-500"
            delay="1.5s"
          />

          <Milestone
            className="right-[8%] top-[48px]"
            icon={Target}
            label="ARQ Protocols"
            tone="bg-violet-500"
            delay="2.2s"
          />

          <div className="relative z-10 grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <p className="font-display text-[64px] font-extrabold leading-[.85] tracking-[-0.05em] sm:text-[100px] lg:text-[140px]">
                <span className="bg-gradient-to-br from-white via-white to-brand-200 bg-clip-text text-transparent">PISTA</span>
              </p>
              <h1 className="mt-6 max-w-xl text-[30px] font-bold leading-[1.08] sm:text-[42px] lg:text-[46px]">
                Your Personalized Intelligent Study Tutoring Agent.
              </h1>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button to="/dashboard" variant="light" size="lg" iconRight={ArrowRight}>Start Studying</Button>
                <Button variant="glass" size="lg" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>
                  Explore PISTA
                </Button>
              </div>
              <p className="mt-6 text-sm text-ink-400">
                Learn smarter. Practice better. Stay on track.
              </p>
            </div>
            <ProductPreview />
          </div>
        </section>
      </div>

      {/* Features */}
      <section
        id="features"
        className="mx-auto max-w-[1200px] scroll-mt-4 px-5 py-16 sm:px-8 lg:py-28"
      >
        <div className="max-w-2xl">
          <h2 className="text-[34px] font-bold leading-tight sm:text-[44px]">Everything you need to stay on track</h2>
          <p className="mt-3 text-[17px] text-muted">PISTA connects what you study, when your exams are and how your quizzes went, so every answer and suggestion fits you.</p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-6">
          {/* AI Tutor: the large tile */}
          <article className="group relative overflow-hidden rounded-3xl bg-ink-900 p-7 text-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_25px_60px_-25px_rgba(47,123,255,.35)] md:col-span-4 md:row-span-2">
            <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-violet-500/25 blur-3xl" aria-hidden />
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 transition duration-300 group-hover:scale-105 group-hover:rotate-6">
              <Sparkles className="h-6 w-6 text-violet-400" aria-hidden />
            </span>
            <h3 className="mt-5 text-2xl font-bold">{FEATURES[0].title}</h3>
            <p className="mt-2 max-w-md text-ink-300">{FEATURES[0].text}</p>
            <div className="relative mt-8 space-y-3" aria-hidden>
              <div className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-tr-md bg-brand-600 px-4 py-2.5 text-sm">Teach me ARQ protocols</div>
              <div className="flex max-w-[90%] items-start gap-2.5">
                <PistaOrb size={30} />
                <div className="rounded-2xl rounded-tl-md bg-white/[.07] px-4 py-3 text-sm leading-relaxed text-ink-300 ring-1 ring-white/10">
                  <span className="font-semibold text-white">ARQ</span> makes a noisy link reliable: send a frame, wait for an ACK, and resend it if the timer runs out.
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-electric-500/15 px-2 py-0.5 text-[11px] font-semibold text-electric-400">📚 Course Material</span>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-ink-300">CNDC_Lecture_5.pptx</span>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {FEATURES.slice(1).map(({ icon: Icon, title, text }, i) => (
            <article
              key={title}
              className={`group card p-6 transition duration-200 hover:-translate-y-1 hover:shadow-lift ${i < 2 ? "md:col-span-2" : "md:col-span-3"
                }`}
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-600 transition duration-200 group-hover:scale-105 group-hover:rotate-2">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-lg font-bold transition-colors duration-200 group-hover:text-brand-600">
                {title}
              </h3>
              <div className="mt-1.5">
                <p className="text-[15px] leading-relaxed text-muted">{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* How it works (a real sequence) */}
      <section id="how" className="border-y border-line bg-white">
        <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8">
          <h2 className="text-[30px] font-bold leading-tight sm:text-[38px]">
            How PISTA works
          </h2>

          <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-muted">
            Add your material, exams and learning activity. PISTA connects them into a personalized study path.
          </p>
          <ol className="relative mt-8 grid gap-8 md:grid-cols-4 md:gap-6">
            <span className="absolute left-6 right-6 top-6 hidden h-px bg-gradient-to-r from-electric-500 to-violet-500 md:block" aria-hidden />
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <li
                key={title}
                className="group relative flex gap-4 transition duration-200 hover:-translate-y-1 md:block"
              >
                <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ink-900 text-white ring-4 ring-white transition duration-200 group-hover:scale-110 group-hover:bg-brand-600">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-600 md:mt-5">
                    Step {i + 1}
                  </p>
                  <h3 className="mt-1 text-lg font-bold">{title}</h3>
                  <p className="mt-1 text-[15px] text-muted">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 lg:py-20">
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-brand-700 via-brand-600 to-violet-600 px-6 py-14 text-center text-white shadow-[0_30px_80px_-35px_rgba(79,70,229,.6)] sm:px-12">
          <div
            className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl"
            aria-hidden
          />

          <div
            className="pointer-events-none absolute -bottom-28 -right-16 h-72 w-72 rounded-full bg-violet-300/20 blur-3xl"
            aria-hidden
          />
          <h2 className="relative z-10 mx-auto max-w-2xl text-[32px] font-bold leading-tight sm:text-[42px]">
            Your next study step starts here.
          </h2>
          <p className="relative z-10 mx-auto mt-3 max-w-lg text-white/80">
            Let PISTA turn your courses, exams and progress into your next study step.
          </p>
          <Button
            to="/dashboard"
            variant="light"
            size="lg"
            className="relative z-10 mt-8"
            iconRight={ArrowRight}
          >
            Start Studying
          </Button>
        </div>
      </section>

      <footer className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-3 px-5 pb-12 text-sm text-muted sm:flex-row sm:px-8">
        <Logo light={false} size={30} />
        <p>Personalized Intelligent Study Tutoring Agent.</p>
        <Link to="/settings" className="font-semibold transition-colors duration-150 hover:text-brand-600">Settings</Link>
      </footer>
    </div>
  );
}
