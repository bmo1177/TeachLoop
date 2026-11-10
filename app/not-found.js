import Link from "next/link";
import { LogoMark } from "@/app/components/ui/LogoMark";
import { LoopMotif } from "@/app/components/ui/LoopMotif";
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
        <div style={{ maxWidth: "32rem", textAlign: "center", width: "100%" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "var(--space-5)",
              color: "var(--color-accent)",
            }}
          >
            <LoopMotif size={56} strokeWidth={1.75} />
          </div>
          <h1 className="info-title" style={{ fontSize: "var(--font-size-2xl)", marginBottom: "var(--space-3)" }}>
            You spun completely off the question wheel
          </h1>
          <p className="info-subtitle" style={{ marginBottom: "var(--space-6)" }}>
            The page you are looking for does not exist or has moved back to the home notebook.
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
