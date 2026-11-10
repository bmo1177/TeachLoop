import Link from "next/link";
import { LogoMark } from "@/app/components/ui/LogoMark";
import { Footer } from "@/app/components/ui/Footer";

export const metadata = {
  title: "Privacy Policy",
  description:
    "How TeachLoop handles your voice audio, answer transcripts, AI evaluation requests, and local storage.",
  openGraph: {
    title: "Privacy Policy | TeachLoop",
    description:
      "Learn how TeachLoop respects your privacy with in-browser voice recognition and zero server-side storage.",
  },
};

export default function PrivacyPage() {
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
        <span className="info-eyebrow">Trust & Privacy</span>
        <h1 className="info-title">Privacy Policy</h1>
        <p className="info-subtitle">
          Last updated: November 10, 2026. Honest, transparent, and plain-English principles on how TeachLoop treats your data.
        </p>

        {/* Short Version Box */}
        <div className="info-summary-box">
          <div className="info-summary-title">
            <span>The Short Version</span>
          </div>
          <ul>
            <li><strong>Audio never leaves your browser:</strong> Speech-to-text recognition runs locally via the browser Web Speech API. We never record, stream, or store your raw voice audio on any server.</li>
            <li><strong>Only submitted text is evaluated:</strong> When you press &ldquo;Submit Answer,&rdquo; only the resulting text transcript is sent to our API route to be evaluated by an AI model.</li>
            <li><strong>Zero server-side persistence:</strong> We do not store your answers, user identities, or evaluation reports in any database.</li>
            <li><strong>History stays in your browser:</strong> Your practice sessions and scores reside exclusively in your device&rsquo;s <code>localStorage</code>.</li>
            <li><strong>No tracking or ads:</strong> No advertising networks, marketing pixels, or third-party behavioral trackers.</li>
            <li><strong>Complete control:</strong> Clear your browser storage anytime to permanently delete all local history.</li>
          </ul>
        </div>

        <article className="info-card">
          <h2>1. Voice Input and Microphone Access</h2>
          <p>
            When you grant microphone permission in TeachLoop, your browser activates the native <strong>Web Speech API</strong> (or <code>webkitSpeechRecognition</code> in Chromium browsers).
          </p>
          <p>
            Audio processing and transcription occur entirely within your client browser environment. TeachLoop servers never receive, intercept, process, or store raw microphone audio streams. If you prefer not to use voice input, you can type your answers directly: voice input is entirely optional.
          </p>
        </article>

        <article className="info-card">
          <h2>2. AI Evaluation Pipeline &amp; Data in Transit</h2>
          <p>
            When you submit a written or transcribed explanation, the text is transmitted over HTTPS to our Next.js API route (<code>/api/eval</code>).
          </p>
          <p>
            Our server proxies your prompt to <strong>OpenRouter</strong> to query an instruction-tuned language model (NVIDIA Nemotron 120B) for communication coaching, scoring, and style observation.
          </p>
          <p>
            The response is returned directly to your browser as structured JSON. We do not retain copies of your answers, scores, or generated feedback on our servers once the HTTP request lifecycle terminates.
          </p>
        </article>

        <article className="info-card">
          <h2>3. Demo Mode (When No API Key is Configured)</h2>
          <p>
            If TeachLoop is deployed or run locally without an <code>OPENROUTER_API_KEY</code>, our backend operates in <strong>Demo Mode</strong>.
          </p>
          <p>
            In Demo Mode, incoming requests receive deterministic simulated coaching feedback directly from the server. No external AI APIs are contacted, and no data leaves our deployment environment.
          </p>
        </article>

        <article className="info-card">
          <h2>4. Local Storage and Client-Side State</h2>
          <p>
            TeachLoop stores application state directly on your computer via browser <code>localStorage</code>, including:
          </p>
          <ul>
            <li><strong>teachloop-sessions:</strong> Your recent practice sessions, scores, and style reports (capped at the 20 most recent sessions).</li>
            <li><strong>teachloop-whiteboards:</strong> Saved sketches and diagram evaluation drafts (capped at 15 items).</li>
            <li><strong>teachloop-theme:</strong> Your preferred interface theme (Sunrise Studio, Chalkboard, or Blue Hour).</li>
            <li><strong>teachloop-onboarded:</strong> A simple boolean flag indicating whether you have dismissed the first-visit onboarding tour.</li>
          </ul>
        </article>

        <article className="info-card">
          <h2>5. Third-Party Services &amp; Infrastructure</h2>
          <p>TeachLoop relies on the following minimal infrastructure providers:</p>
          <ul>
            <li><strong>Vercel:</strong> Hosts the Next.js application frontend and serverless edge functions. Vercel may collect standard operational server access logs (such as IP addresses and user agents) for traffic routing and DDoS prevention.</li>
            <li><strong>OpenRouter:</strong> Serves AI model inference when an API key is configured. Please consult <a href="https://openrouter.ai/privacy" target="_blank" rel="noopener noreferrer">OpenRouter&rsquo;s Privacy Policy</a> for details on their data handling and zero-data-retention options.</li>
          </ul>
        </article>

        <article className="info-card">
          <h2>6. Data Deletion &amp; Your Rights</h2>
          <p>
            Because TeachLoop does not maintain user accounts or persistent server databases, you retain unilateral control over your data.
          </p>
          <p>
            To delete all saved session history, whiteboard drawings, and preferences, simply click the &ldquo;Delete&rdquo; icon next to past sessions on the Home screen or clear your browser&rsquo;s site data/cookies for TeachLoop.
          </p>
        </article>

        <article className="info-card">
          <h2>7. Open Source &amp; Inquiries</h2>
          <p>
            TeachLoop is open source under the MIT License. If you have questions about privacy practices or wish to inspect the exact data flows, you can view the complete source code or open a discussion on our official repository:
          </p>
          <p>
            <a href="https://github.com/bmo1177/TeachLoop" target="_blank" rel="noopener noreferrer">
              https://github.com/bmo1177/TeachLoop
            </a>
          </p>
        </article>

        <Footer />
      </main>
    </>
  );
}
