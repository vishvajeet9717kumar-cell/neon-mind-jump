import { createFileRoute } from "@tanstack/react-router";
import { InfoLayout, CookieBanner } from "@/components/InfoLayout";

export const Route = createFileRoute("/faq")({
  component: FaqPage,
  head: () => ({
    meta: [
      { title: "FAQ — MindRush IQ Brain Training Game" },
      { name: "description", content: "Frequently asked questions about MindRush IQ: progress, devices, accounts, ads, and more." },
      { property: "og:title", content: "MindRush IQ FAQ" },
      { property: "og:description", content: "Answers to common questions about MindRush IQ." },
      { property: "og:url", content: "https://neon-mind-jump.lovable.app/faq" },
    ],
    links: [{ rel: "canonical", href: "https://neon-mind-jump.lovable.app/faq" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
});

const FAQS = [
  {
    q: "Is MindRush IQ free to play?",
    a: "Yes. MindRush IQ is completely free. The game is supported by non-intrusive advertising and does not require any purchases.",
  },
  {
    q: "Do I need an account?",
    a: "No. There's no sign-up, login, or password. Your progress, coins, and themes are saved locally on your device using browser storage.",
  },
  {
    q: "Does the game work on mobile?",
    a: "Yes. MindRush IQ is built mobile-first and runs smoothly in any modern mobile browser, including Chrome, Safari, Edge, and Firefox.",
  },
  {
    q: "Can I play offline?",
    a: "After the first load, most of the game runs offline. A network connection may be needed for advertising and updates.",
  },
  {
    q: "Will I lose my progress if I clear my browser?",
    a: "Yes. Because we don't use accounts, clearing your browser's site data will reset progress, coins, and unlocked themes.",
  },
  {
    q: "Does the game collect personal data?",
    a: "No personal data is collected directly. We use local storage for progress and may use anonymous analytics and advertising cookies. See our Privacy Policy for full details.",
  },
  {
    q: "How do I unlock new themes?",
    a: "Themes unlock as you level up, or you can spend coins in the Themes & Shop section to unlock them early.",
  },
  {
    q: "I found a bug — what should I do?",
    a: "Please email support@mindrushiq.app with your device, browser, and a short description. Screenshots are very helpful.",
  },
];

function FaqPage() {
  return (
    <>
      <InfoLayout title="Frequently Asked Questions" intro="Quick answers to the most common questions about MindRush IQ.">
        <div className="space-y-3 not-prose">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-white/10 bg-white/5 p-4 open:bg-white/10 transition-colors"
            >
              <summary className="cursor-pointer list-none flex items-center justify-between gap-3">
                <span className="font-semibold text-white">{f.q}</span>
                <span className="text-emerald-300 text-xl leading-none transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-white/75 text-[15px] leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>

        <p className="mt-8 text-white/70">
          Still stuck? Visit the <a href="/contact" className="text-emerald-300 underline">Contact</a> page and
          we'll get back to you.
        </p>
      </InfoLayout>
      <CookieBanner />
    </>
  );
}
