import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <p className="site-footer-copy">
          Made with care by{" "}
          <a
            href="https://github.com/bmo1177"
            target="_blank"
            rel="noopener noreferrer"
            className="site-footer-author"
          >
            @bmo1177
          </a>
        </p>
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
