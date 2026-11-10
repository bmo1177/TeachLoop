import Link from "next/link";
import { LogoMark } from "@/app/components/ui/LogoMark";
import { Footer } from "@/app/components/ui/Footer";

export const metadata = {
  title: "Page Not Found",
  description: "The requested page does not exist on TeachLoop.",
};

export default function NotFound() {
  return (
    <>
      <header className="info-page-header">
        <div className="container info-page-header-inner">
          <Link href="/" className="nav-back" aria-label="TeachLoop Home">
            <LogoMark />
            <span className="nav-title">TeachLoop</span>
          </Link>
          <Link href="/" className="btn btn-secondary btn-sm">
            Home
          </Link>
        </div>
      </header>

      <main className="container screen-center" style={{ minHeight: "65vh" }}>
        <div style={{ maxWidth: "28rem", textAlign: "center", width: "100%" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: "var(--color-accent-subtle)",
              color: "var(--color-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.75rem",
              fontWeight: 800,
              margin: "0 auto var(--space-4)",
              border: "1px solid var(--color-accent-strong)",
            }}
          >
            404
          </div>
          <span className="info-eyebrow">Lost in Orbit</span>
          <h1 className="info-title" style={{ fontSize: "var(--font-size-2xl)" }}>
            Page Not Found
          </h1>
          <p className="info-subtitle" style={{ marginBottom: "var(--space-6)" }}>
            Looks like you spun off the wheel. The page you are looking for doesn&rsquo;t exist or has moved.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "var(--space-3)" }}>
            <Link href="/" className="btn btn-primary btn-lg">
              Return to Practice
            </Link>
          </div>
        </div>
      </main>

      <div className="container">
        <Footer />
      </div>
    </>
  );
}
