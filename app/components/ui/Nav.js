"use client";

import { ThemeSwitcher } from "@/app/providers/ThemeProvider";
import { LogoMark } from "./LogoMark";

function Nav({ onHome, screen }) {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <button className="nav-back" onClick={onHome} aria-label="Go home">
          <LogoMark />
          <span className="nav-title">TeachLoop</span>
        </button>
        {screen !== "home" && (
          <div className="nav-actions">
            <ThemeSwitcher />
          </div>
        )}
      </div>
    </nav>
  );
}

export { Nav };
