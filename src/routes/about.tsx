import { createFileRoute } from "@tanstack/react-router";
import { InfoLayout, CookieBanner } from "@/components/InfoLayout";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About MindRush IQ — Brain Training Arcade Game" },
      { name: "description", content: "Learn about MindRush IQ, a fast and addictive brain-training arcade game built to sharpen focus, math, vocabulary, and pattern-recognition skills." },
      { property: "og:title", content: "About MindRush IQ" },
      { property: "og:description", content: "The story and mission behind MindRush IQ — a futuristic brain-training arcade." },
      { property: "og:url", content: "https://neon-mind-jump.lovable.app/about" },
    ],
    links: [{ rel: "canonical", href: "https://neon-mind-jump.lovable.app/about" }],
  }),
});

function AboutPage() {
  return (
    <>
      <InfoLayout
        title="About MindRush IQ"
        intro="MindRush IQ is a fast-paced brain-training arcade game designed to make daily mental practice fun, satisfying, and addictive."
      >
        <h2 className="text-xl font-bold text-white mt-6">Our Mission</h2>
        <p>
          We believe brain training should feel like a game, not a chore. MindRush IQ blends arcade-style reaction
          gameplay with bite-sized math, vocabulary, and pattern puzzles so you can sharpen your mind in short,
          rewarding sessions — perfect for a coffee break or a quick commute.
        </p>

        <h2 className="text-xl font-bold text-white mt-6">What Makes It Different</h2>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>One-tap controls optimized for mobile play.</li>
          <li>Three rotating brain modes: Math, Vocabulary, and Patterns.</li>
          <li>Adaptive difficulty that scales with your level.</li>
          <li>Daily challenges, missions, themes, and unlockable rewards.</li>
          <li>Lightweight, runs smoothly even on low-end devices, and works offline after first load.</li>
        </ul>

        <h2 className="text-xl font-bold text-white mt-6">Who We Are</h2>
        <p>
          MindRush IQ is built by a small independent team passionate about mobile games and cognitive science. We
          ship small, fast updates and listen closely to community feedback. If you have an idea or want to report a
          bug, drop us a line on the <a href="/contact" className="text-emerald-300 underline">Contact</a> page.
        </p>

        <h2 className="text-xl font-bold text-white mt-6">No Sign-Up, No Hassle</h2>
        <p>
          The game runs entirely in your browser. Your progress, coins, and unlocked themes are saved locally on your
          device — no accounts, no passwords, no friction. Just open the page and play.
        </p>
      </InfoLayout>
      <CookieBanner />
    </>
  );
}
