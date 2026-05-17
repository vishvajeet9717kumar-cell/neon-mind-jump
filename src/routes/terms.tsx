import { createFileRoute } from "@tanstack/react-router";
import { InfoLayout, CookieBanner } from "@/components/InfoLayout";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Terms & Conditions — MindRush IQ" },
      { name: "description", content: "The Terms and Conditions for using MindRush IQ, a free browser-based brain-training arcade game." },
      { property: "og:title", content: "Terms & Conditions — MindRush IQ" },
      { property: "og:description", content: "Rules and conditions for using MindRush IQ." },
      { property: "og:url", content: "https://neon-mind-jump.lovable.app/terms" },
    ],
    links: [{ rel: "canonical", href: "https://neon-mind-jump.lovable.app/terms" }],
  }),
});

function TermsPage() {
  return (
    <>
      <InfoLayout title="Terms & Conditions" intro={`Last updated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`}>
        <p>
          Welcome to MindRush IQ. By accessing or playing this game, you agree to these Terms & Conditions. If you do
          not agree, please do not use the game.
        </p>

        <h2 className="text-xl font-bold text-white mt-6">1. Use of the Game</h2>
        <p>
          MindRush IQ is provided free of charge for personal, non-commercial entertainment use. You agree not to
          misuse the service, attempt to bypass security, or use it in any unlawful manner.
        </p>

        <h2 className="text-xl font-bold text-white mt-6">2. Intellectual Property</h2>
        <p>
          All content, including the game name, logo, design, graphics, code, and original text on this site, is
          owned by MindRush IQ unless otherwise noted. You may not copy, redistribute, or create derivative works
          without prior written permission.
        </p>

        <h2 className="text-xl font-bold text-white mt-6">3. User Conduct</h2>
        <p>You agree not to:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Attempt to reverse engineer, decompile, or tamper with the game.</li>
          <li>Use automated tools, bots, or scripts to interact with the game.</li>
          <li>Use the game in a way that disrupts or harms other users or third parties.</li>
        </ul>

        <h2 className="text-xl font-bold text-white mt-6">4. Advertising</h2>
        <p>
          MindRush IQ may display advertisements from third parties such as Google AdSense. We are not responsible
          for the content of third-party ads or for any transactions you make with advertisers.
        </p>

        <h2 className="text-xl font-bold text-white mt-6">5. Disclaimer</h2>
        <p>
          MindRush IQ is provided “as is” without warranties of any kind. We do not guarantee that the game will be
          uninterrupted, error-free, or that any specific learning or cognitive outcomes will be achieved. The game
          is for entertainment and is not a substitute for professional educational or medical advice.
        </p>

        <h2 className="text-xl font-bold text-white mt-6">6. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, MindRush IQ and its creators shall not be liable for any indirect,
          incidental, or consequential damages arising from your use of the game.
        </p>

        <h2 className="text-xl font-bold text-white mt-6">7. Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time. Changes will be reflected by updating the “Last updated”
          date. Continued use of the game after changes means you accept the revised Terms.
        </p>

        <h2 className="text-xl font-bold text-white mt-6">8. Contact</h2>
        <p>
          Questions about these Terms? Email{" "}
          <a href="mailto:support@mindrushiq.app" className="text-emerald-300 underline">
            support@mindrushiq.app
          </a>{" "}
          or visit our <a href="/contact" className="text-emerald-300 underline">Contact</a> page.
        </p>
      </InfoLayout>
      <CookieBanner />
    </>
  );
}
