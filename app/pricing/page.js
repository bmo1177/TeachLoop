import Link from "next/link";
import { LogoMark } from "@/app/components/ui/LogoMark";
import { Footer } from "@/app/components/ui/Footer";

export const metadata = {
  title: "Pricing",
  description:
    "TeachLoop is free and open-source. Practice communication and system design coaching at zero cost.",
  openGraph: {
    title: "Pricing | TeachLoop",
    description:
      "TeachLoop is 100% free and open-source. Explore our features and future roadmap.",
  },
};

export default function PricingPage() {
  return (
    <>
      <header className="info-page-header">
        <div className="container info-page-header-inner">
          <Link href="/" className="nav-back" aria-label="TeachLoop Home">
            <LogoMark />
            <span className="nav-title">TeachLoop</span>
          </Link>
          <Link href="/" className="btn btn-secondary btn-sm">
            Back to App
          </Link>
        </div>
      </header>

      <main className="container info-page-content">
        <span className="info-eyebrow">Fair &amp; Transparent</span>
        <h1 className="info-title">Free Forever</h1>
        <p className="info-subtitle">
          TeachLoop is an open-source educational coaching tool. All practice modes and core features are free to use.
        </p>

        {/* Free Forever Plan Card */}
        <article className="info-card" style={{ borderColor: "var(--color-accent)", position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "var(--space-2)", marginBottom: "var(--space-4)" }}>
            <div>
              <span style={{ fontSize: "var(--font-size-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-accent)" }}>
                Current Plan
              </span>
              <h2 style={{ fontSize: "var(--font-size-2xl)", margin: "var(--space-1) 0" }}>Open Access</h2>
            </div>
            <div style={{ fontSize: "var(--font-size-3xl)", fontWeight: 800, color: "var(--color-text-primary)" }}>
              $0 <span style={{ fontSize: "var(--font-size-sm)", fontWeight: 400, color: "var(--color-text-secondary)" }}>/ month</span>
            </div>
          </div>

          <p>Full access to all current capabilities without artificial paywalls or credit cards:</p>

          <ul>
            <li><strong>All 4 Practice Modes:</strong> Teach Mode, System Design Interview Mode, Custom AI Topics, and Sketch Whiteboard Mode.</li>
            <li><strong>5 Target Audience Personas:</strong> Practice explaining to children, recruiters, junior developers, executives, or senior AI engineers.</li>
            <li><strong>Intelligent Voice Input:</strong> In-browser Web Speech API transcription with automatic filler removal and deduplication.</li>
            <li><strong>3-Tier Progressive Hints:</strong> Nudge, Concept Outline, and Full Breakdown scaffolds for every topic.</li>
            <li><strong>Configurable Session Lengths:</strong> Choose 3, 5, or 7 questions per practice loop.</li>
            <li><strong>Local Progress Tracking:</strong> Up to 20 past sessions with sparkline trends, saved locally in your browser.</li>
            <li><strong>Fair Rate Limits:</strong> 30 evaluation requests per minute per IP.</li>
          </ul>

          <div style={{ marginTop: "var(--space-6)" }}>
            <Link href="/" className="btn btn-primary btn-full btn-lg">
              Start Practicing Free
            </Link>
          </div>
        </article>

        {/* How It's Funded */}
        <article className="info-card">
          <h2>How Is It Free?</h2>
          <p>
            TeachLoop runs on lightweight serverless infrastructure and connects to free-tier model endpoints on <strong>OpenRouter</strong> (such as the NVIDIA Nemotron 120B model).
          </p>
          <p>
            Because we do not store voice recordings or maintain costly persistent databases, our hosting costs remain minimal. Anyone can also clone and self-host the repository with their own OpenRouter key.
          </p>
        </article>

        {/* Roadmap / Pro tier */}
        <article className="info-card" style={{ background: "var(--color-surface-raised)" }}>
          <span style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Roadmap · Possible Future
          </span>
          <h2 style={{ marginTop: "var(--space-2)" }}>Hosted Pro (Exploring)</h2>
          <p>
            As TeachLoop grows, we may introduce an optional hosted Pro tier for users and engineering teams who want deeper continuous learning infrastructure:
          </p>
          <ul>
            <li><strong>Cloud Account Sync:</strong> Multi-device session history and aggregate team analytics.</li>
            <li><strong>Custom Audience Creator:</strong> Build custom personas, grading criteria, and domain rubrics.</li>
            <li><strong>Premium Model Routing:</strong> Choose specific frontier models (such as Claude 3.5 Sonnet or GPT-4o) directly.</li>
            <li><strong>Export Packs:</strong> Clean PDF diagnostic reports and Markdown transcripts for coaching portfolios.</li>
          </ul>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", margin: 0 }}>
            Note: This is an exploratory roadmap concept. There is no active waitlist or billing system. The core open-source experience remains permanently free.
          </p>
        </article>

        <Footer />
      </main>
    </>
  );
}
