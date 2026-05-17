import { createFileRoute } from "@tanstack/react-router";
import { InfoLayout, CookieBanner } from "@/components/InfoLayout";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy — MindRush IQ" },
      { name: "description", content: "Read the MindRush IQ Privacy Policy. Learn how we handle local storage, analytics, advertising, and your data." },
      { property: "og:title", content: "Privacy Policy — MindRush IQ" },
      { property: "og:description", content: "How MindRush IQ handles your data, cookies, and advertising." },
      { property: "og:url", content: "https://neon-mind-jump.lovable.app/privacy" },
    ],
    links: [{ rel: "canonical", href: "https://neon-mind-jump.lovable.app/privacy" }],
  }),
});

function PrivacyPage() {
  return (
    <>
      <InfoLayout title="Privacy Policy" intro={`Last updated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`}>
        <p>
          This Privacy Policy explains how MindRush IQ (“we”, “us”, “the game”) collects, uses, and protects
          information when you play the game at this website. By using MindRush IQ, you agree to the practices
          described below.
        </p>

        <h2 className="text-xl font-bold text-white mt-6">1. Information We Collect</h2>
        <p>
          MindRush IQ does not require an account, email, or password. We do not collect personally identifiable
          information directly. The game stores gameplay data (score, level, coins, unlocked themes, settings) in
          your browser's <strong>local storage</strong> so your progress persists between sessions. This data never
          leaves your device unless you choose to share it.
        </p>

        <h2 className="text-xl font-bold text-white mt-6">2. Cookies & Local Storage</h2>
        <p>
          We use local storage to remember game state and preferences. We may also use minimal anonymous analytics
          cookies to understand which features are used most so we can improve the game. You can clear these at any
          time from your browser settings.
        </p>

        <h2 className="text-xl font-bold text-white mt-6">3. Third-Party Advertising</h2>
        <p>
          MindRush IQ may display advertisements served by third-party ad networks such as Google AdSense. These
          partners may use cookies, web beacons, and similar technologies to serve ads based on your prior visits to
          this and other websites. Google's use of advertising cookies enables it and its partners to serve ads
          based on your visit to our site and/or other sites on the Internet.
        </p>
        <p>
          You may opt out of personalized advertising by visiting{" "}
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-emerald-300 underline">
            Google Ads Settings
          </a>
          , or opt out of a third-party vendor's use of cookies for personalized advertising by visiting{" "}
          <a href="https://www.aboutads.info/" target="_blank" rel="noopener noreferrer" className="text-emerald-300 underline">
            aboutads.info
          </a>
          .
        </p>

        <h2 className="text-xl font-bold text-white mt-6">4. Third-Party Services</h2>
        <p>
          We may use third-party services for hosting, analytics, and advertising. These services may collect
          information sent by your browser as part of a web page request, such as cookies or your IP address. They
          have their own privacy policies governing their use of such information.
        </p>

        <h2 className="text-xl font-bold text-white mt-6">5. Children's Privacy</h2>
        <p>
          MindRush IQ is suitable for general audiences. We do not knowingly collect personal information from
          children under 13. If you believe a child has provided us with personal information, please contact us so
          we can remove it.
        </p>

        <h2 className="text-xl font-bold text-white mt-6">6. Your Rights</h2>
        <p>
          You can clear all stored game data at any time by clearing your browser's site data. You may also reach
          out via our <a href="/contact" className="text-emerald-300 underline">Contact</a> page for any
          privacy-related requests.
        </p>

        <h2 className="text-xl font-bold text-white mt-6">7. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Material changes will be reflected by updating the
          “Last updated” date above. Continued use of the game after changes constitutes acceptance.
        </p>

        <h2 className="text-xl font-bold text-white mt-6">8. Contact</h2>
        <p>
          For privacy questions, email{" "}
          <a href="mailto:support@mindrushiq.app" className="text-emerald-300 underline">
            support@mindrushiq.app
          </a>
          .
        </p>
      </InfoLayout>
      <CookieBanner />
    </>
  );
}
