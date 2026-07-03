"use client";
import { useState, useEffect, createContext, useContext } from "react";

const ThemeContext = createContext({ theme: "sunrise", switchTheme: () => {} });

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("sunrise");

  useEffect(() => {
    const saved = localStorage.getItem("teachloop-theme");
    if (saved && ["sunrise", "chalkboard", "blue-hour"].includes(saved)) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  const switchTheme = (t) => {
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("teachloop-theme", t);
  };

  return (
    <ThemeContext.Provider value={{ theme, switchTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme() {
  return useContext(ThemeContext);
}

function useWheelColors() {
  const { theme } = useContext(ThemeContext);
  const [colors, setColors] = useState([
    { bg: "#C2410C", text: "#FFFFFF" },
    { bg: "#7C3AED", text: "#FFFFFF" },
    { bg: "#16A34A", text: "#FFFFFF" },
    { bg: "#B45309", text: "#FFFFFF" },
    { bg: "#6D28D9", text: "#FFFFFF" },
  ]);

  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    const get = (v) => style.getPropertyValue(v).trim();
    setColors([
      { bg: get("--wheel-1") || "#C2410C", text: "#FFFFFF" },
      { bg: get("--wheel-2") || "#7C3AED", text: "#FFFFFF" },
      { bg: get("--wheel-3") || "#16A34A", text: "#FFFFFF" },
      { bg: get("--wheel-4") || "#B45309", text: "#FFFFFF" },
      { bg: get("--wheel-5") || "#6D28D9", text: "#FFFFFF" },
    ]);
  }, [theme]);

  return colors;
}

const THEMES = [
  { id: "sunrise", label: "Sunrise Studio", dotClass: "theme-dot-sunrise" },
  { id: "chalkboard", label: "Chalkboard", dotClass: "theme-dot-chalkboard" },
  { id: "blue-hour", label: "Blue Hour", dotClass: "theme-dot-blue-hour" },
];

function ThemeSwitcher() {
  const { theme, switchTheme } = useContext(ThemeContext);

  return (
    <div className="theme-switcher" role="radiogroup" aria-label="Choose theme">
      <span className="theme-switcher-label">Theme</span>
      {THEMES.map((t) => (
        <button
          key={t.id}
          className={`theme-dot ${t.dotClass}`}
          role="radio"
          aria-checked={theme === t.id}
          aria-label={t.label}
          title={t.label}
          onClick={() => switchTheme(t.id)}
        />
      ))}
    </div>
  );
}

export { ThemeProvider, ThemeContext, useTheme, useWheelColors, THEMES, ThemeSwitcher };
