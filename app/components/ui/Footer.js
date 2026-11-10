import Link from "next/link";
import { LoopMotif } from "./LoopMotif";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <LoopMotif size={28} strokeWidth={2.2} />
          <p className="site-footer-copy">
            TeachLoop <span className="site-footer-sep" aria-hidden="true">·</span> Built with deliberate craft by{" "}
            <a
              href="https://github.com/bmo1177"
              target="_blank"
              rel="noopener noreferrer"
              className="site-footer-author"
            >
              @bmo1177
            </a>
          </p>
        </div>
        <nav className="site-footer-nav" aria-label="Footer navigation">
          <Link href="/privacy" className="site-footer-link">
            Privacy
          </Link>
          <span className="site-footer-sep" aria-hidden="true">·</span>
          <Link href="/terms" className="site-footer-link">
            Terms
          </Link>
          <span className="site-footer-sep" aria-hidden="true">·</span>
          <Link href="/pricing" className="site-footer-link">
            Pricing
          </Link>
          <span className="site-footer-sep" aria-hidden="true">·</span>
          <a
            href="https://github.com/bmo1177/TeachLoop"
            target="_blank"
            rel="noopener noreferrer"
            className="site-footer-link"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
