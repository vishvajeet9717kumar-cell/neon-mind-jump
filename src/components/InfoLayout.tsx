import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "Play" },
  { to: "/how-to-play", label: "How to Play" },
  { to: "/about", label: "About" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
] as const;

const LEGAL = [
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms & Conditions" },
] as const;

export function InfoLayout({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <div
      className="min-h-screen text-white"
      style={{
        background:
          "radial-gradient(1200px 600px at 50% -10%, rgba(34,197,94,0.18), transparent 60%), radial-gradient(900px 500px at 10% 110%, rgba(16,185,129,0.18), transparent 60%), #05070a",
      }}
    >
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-black/40 border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold tracking-tight">
            <span
              className="inline-block w-7 h-7 rounded-lg grid place-items-center text-sm"
              style={{
                background: "linear-gradient(135deg,#22c55e,#10b981)",
                boxShadow: "0 0 18px rgba(34,197,94,.45)",
              }}
              aria-hidden
            >
              ⚡
            </span>
            <span
              className="text-base"
              style={{ background: "linear-gradient(90deg,#a7f3d0,#22c55e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              MindRush IQ
            </span>
          </Link>
          <nav aria-label="Primary" className="hidden sm:flex gap-1 text-xs">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="px-3 py-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                activeProps={{ className: "px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <Link
            to="/"
            className="sm:hidden text-xs px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold"
          >
            ▶ Play
          </Link>
        </div>
      </header>

      {/* Mobile sub-nav */}
      <nav aria-label="Sections" className="sm:hidden border-b border-white/5 bg-black/30">
        <div className="max-w-3xl mx-auto px-2 py-2 flex gap-1 overflow-x-auto text-[11px]">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="shrink-0 px-3 py-1.5 rounded-full text-white/70 bg-white/5"
              activeProps={{ className: "shrink-0 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold" }}
            >
              {n.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <article className="prose prose-invert max-w-none">
          <h1
            className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2"
            style={{ background: "linear-gradient(90deg,#a7f3d0,#22c55e,#10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            {title}
          </h1>
          {intro && <p className="text-white/70 text-base sm:text-lg mb-6">{intro}</p>}
          <div className="text-white/80 leading-relaxed space-y-4 text-[15px]">{children}</div>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/40 mt-10">
        <div className="max-w-3xl mx-auto px-4 py-8 text-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div>
              <h2 className="text-white/90 font-semibold mb-2 text-xs uppercase tracking-wider">Explore</h2>
              <ul className="space-y-1.5 text-white/60">
                {NAV.map((n) => (
                  <li key={n.to}>
                    <Link to={n.to} className="hover:text-emerald-300">
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-white/90 font-semibold mb-2 text-xs uppercase tracking-wider">Legal</h2>
              <ul className="space-y-1.5 text-white/60">
                {LEGAL.map((n) => (
                  <li key={n.to}>
                    <Link to={n.to} className="hover:text-emerald-300">
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h2 className="text-white/90 font-semibold mb-2 text-xs uppercase tracking-wider">MindRush IQ</h2>
              <p className="text-white/55 text-xs leading-relaxed">
                A fast, modern brain-training arcade. Train your mind with math, vocabulary, and pattern challenges.
              </p>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-white/5 text-center text-[11px] text-white/40">
            © {new Date().getFullYear()} MindRush IQ. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export function CookieBanner() {
  if (typeof window === "undefined") return null;
  return <CookieBannerClient />;
}

import { useEffect, useState } from "react";

function CookieBannerClient() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      if (!localStorage.getItem("mriq_cookie_ok")) setShow(true);
    } catch {}
  }, []);
  if (!show) return null;
  return (
    <div className="fixed bottom-3 inset-x-3 z-[60] max-w-md mx-auto rounded-2xl border border-white/10 bg-black/80 backdrop-blur-md p-3 flex items-center gap-3 text-xs text-white/80 shadow-2xl">
      <span className="flex-1">
        We use local storage for game progress and minimal analytics. See our{" "}
        <Link to="/privacy" className="text-emerald-300 underline">
          Privacy Policy
        </Link>
        .
      </span>
      <button
        onClick={() => {
          try {
            localStorage.setItem("mriq_cookie_ok", "1");
          } catch {}
          setShow(false);
        }}
        className="px-3 py-1.5 rounded-full bg-emerald-500 text-black font-semibold"
      >
        OK
      </button>
    </div>
  );
}
