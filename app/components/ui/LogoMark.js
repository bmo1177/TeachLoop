"use client";

function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="18" height="20" rx="3" stroke="var(--color-accent)" strokeWidth="2" fill="var(--color-accent-subtle)" />
      <rect x="8" y="2" width="18" height="20" rx="3" stroke="var(--color-accent)" strokeWidth="2" fill="var(--color-surface)" />
      <path d="M13 9h8M13 13h6M13 17h4" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="21" cy="19" r="5" fill="var(--color-accent)" />
      <path d="M19.5 19l1 1 2-2" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export { LogoMark };
