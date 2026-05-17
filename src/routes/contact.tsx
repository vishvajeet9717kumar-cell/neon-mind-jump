import { createFileRoute } from "@tanstack/react-router";
import { InfoLayout, CookieBanner } from "@/components/InfoLayout";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact MindRush IQ — Support & Feedback" },
      { name: "description", content: "Get in touch with the MindRush IQ team. Send feedback, report bugs, or ask questions about the brain-training game." },
      { property: "og:title", content: "Contact MindRush IQ" },
      { property: "og:description", content: "Reach the MindRush IQ team for support, feedback, or partnership inquiries." },
      { property: "og:url", content: "https://neon-mind-jump.lovable.app/contact" },
    ],
    links: [{ rel: "canonical", href: "https://neon-mind-jump.lovable.app/contact" }],
  }),
});

function ContactPage() {
  return (
    <>
      <InfoLayout
        title="Contact Us"
        intro="We'd love to hear from you. Whether it's a bug, a feature request, or a kind word — your feedback shapes MindRush IQ."
      >
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-5">
          <h2 className="text-lg font-bold text-white mb-1">Email Support</h2>
          <p className="text-white/70 text-sm mb-3">
            For all inquiries — support, feedback, partnerships, or press — please reach us at:
          </p>
          <a
            href="mailto:support@mindrushiq.app"
            className="inline-block px-5 py-2.5 rounded-full bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition"
          >
            support@mindrushiq.app
          </a>
          <p className="text-white/50 text-xs mt-3">Typical response time: 24–72 hours, Monday to Friday.</p>
        </div>

        <h2 className="text-xl font-bold text-white mt-8">Before You Write</h2>
        <p>
          Many common questions are answered on our <a href="/faq" className="text-emerald-300 underline">FAQ</a>{" "}
          page. If you're stuck on gameplay, the{" "}
          <a href="/how-to-play" className="text-emerald-300 underline">How to Play</a> guide may also help.
        </p>

        <h2 className="text-xl font-bold text-white mt-6">Bug Reports</h2>
        <p>To help us fix issues quickly, please include in your email:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Your device model and browser (e.g. Chrome on Android 14).</li>
          <li>A short description of what happened and what you expected.</li>
          <li>A screenshot or screen recording, if possible.</li>
        </ul>

        <h2 className="text-xl font-bold text-white mt-6">Business & Press</h2>
        <p>
          For partnership, press, or advertising inquiries, please use the same email above with the subject line
          starting with “[Business]”.
        </p>
      </InfoLayout>
      <CookieBanner />
    </>
  );
}
