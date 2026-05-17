import { createFileRoute } from "@tanstack/react-router";
import { InfoLayout, CookieBanner } from "@/components/InfoLayout";

export const Route = createFileRoute("/how-to-play")({
  component: HowToPlayPage,
  head: () => ({
    meta: [
      { title: "How to Play MindRush IQ — Controls, Tips & Modes" },
      { name: "description", content: "Learn how to play MindRush IQ. Master the controls, understand Math, Vocabulary, and Pattern modes, and build longer combos." },
      { property: "og:title", content: "How to Play MindRush IQ" },
      { property: "og:description", content: "Master the controls and modes of MindRush IQ." },
      { property: "og:url", content: "https://neon-mind-jump.lovable.app/how-to-play" },
    ],
    links: [{ rel: "canonical", href: "https://neon-mind-jump.lovable.app/how-to-play" }],
  }),
});

function HowToPlayPage() {
  return (
    <>
      <InfoLayout
        title="How to Play"
        intro="MindRush IQ is built for one-tap play. Read a question, pick the correct answer by steering through the right gate, and chain combos for huge score multipliers."
      >
        <h2 className="text-xl font-bold text-white mt-2">The Basics</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong>Tap (or press space)</strong> to make your bird flap upward. Gravity pulls it down between taps.
          </li>
          <li>
            A <strong>question</strong> floats in the gap between two gates. Each gate is labeled with one answer —
            one is correct, the other is wrong.
          </li>
          <li>
            Steer your bird through the gate that matches the <strong>correct answer</strong> to score and continue.
          </li>
          <li>Hit the wrong gate or fall off the screen and your run ends. Tap retry to jump back in instantly.</li>
        </ol>

        <h2 className="text-xl font-bold text-white mt-6">Game Modes</h2>
        <div className="grid sm:grid-cols-3 gap-3 not-prose">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-emerald-300 font-bold">Math</div>
            <p className="text-white/70 text-sm mt-1">
              Quick arithmetic. Addition, subtraction, and multiplication scale up as you level.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-emerald-300 font-bold">Vocabulary</div>
            <p className="text-white/70 text-sm mt-1">
              Pick the right synonym. Tiers unlock harder vocabulary as your level climbs.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-emerald-300 font-bold">Patterns</div>
            <p className="text-white/70 text-sm mt-1">
              Spot the next number in a sequence. Sharpens logic and pattern recognition.
            </p>
          </div>
        </div>

        <h2 className="text-xl font-bold text-white mt-6">Combos & Scoring</h2>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Each correct answer adds to your combo multiplier.</li>
          <li>Higher combos = more points and bonus coins.</li>
          <li>One mistake resets your combo, so stay focused on tough streaks.</li>
        </ul>

        <h2 className="text-xl font-bold text-white mt-6">Progression</h2>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <strong>XP & Levels</strong> — every answer earns XP. Level up to unlock harder content and new themes.
          </li>
          <li>
            <strong>Coins</strong> — spend them in the shop on themes, bird skins, and trail effects.
          </li>
          <li>
            <strong>Daily Challenges</strong> — a fresh objective every day, with bonus rewards on completion.
          </li>
          <li>
            <strong>Missions & Badges</strong> — long-term goals that unlock titles to show off your skill.
          </li>
        </ul>

        <h2 className="text-xl font-bold text-white mt-6">Pro Tips</h2>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Read the question before you tap — gates slow down as they approach for breathing room.</li>
          <li>Short, controlled taps beat panic taps. Find your rhythm.</li>
          <li>Use the music volume slider in Settings to find a focus level that works for you.</li>
          <li>Play in short, focused sessions — three minutes a day beats one long burnout.</li>
        </ul>
      </InfoLayout>
      <CookieBanner />
    </>
  );
}
