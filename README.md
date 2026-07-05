<div align="center">

# TeachLoop

**Train how you communicate, not just what you know.**

AI-powered communication coaching for technical professionals.
Practice explaining concepts to different audiences and get real-time feedback on clarity, analogies, and vocabulary fit.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![License](https://img.shields.io/badge/License-Private-red)](#license)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://vercel.com)

</div>

---

## Why TeachLoop?

Technical professionals often struggle to explain what they know. You can ace a code review but freeze when a PM asks "what does this actually do?" TeachLoop closes that gap.

- **Explain to real audiences** — not just other engineers. Try a curious 10-year-old, a non-technical recruiter, or a C-suite executive.
- **Get structured AI feedback** — scored on clarity, audience-fit, analogy quality, vocabulary, and confidence.
- **Track your growth** — see your communication scores trend over sessions with sparkline charts and session reports.
- **Practice in two modes** — Teach mode (explain concepts) or Interview mode (answer system design questions under pressure).

---

## How It Works

```
 Pick a Mode          Choose an Audience         Spin the Wheel
 ────────────         ──────────────────         ───────────────
 Teach or Interview   Student, PM, Executive…    Random topic selection

        │                    │                         │
        └────────────────────┴─────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Record Your Answer │
                    │  (Voice or Keyboard) │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   AI Evaluation      │
                    │  5-dimension scoring │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Session Report     │
                    │  Style · Patterns    │
                    │  · Growth Tips       │
                    └─────────────────────┘
```

---

## Features

### Two Practice Modes

| Mode | What You Do | Sample Topics |
|------|------------|---------------|
| **Teach** | Explain a technical concept to a chosen audience | Backpropagation, RAG, The Attention Mechanism, Mixture of Experts |
| **Interview** | Answer system design / behavioral questions | URL Shortener, CAP Theorem, Design a Rate Limiter |

### Five Audiences (Teach Mode)

Each audience comes with contextual coaching guidance:

- 🧒 **Curious 10-Year-Old** — Plain language, real-world analogies
- 👔 **Non-Technical Recruiter** — Business value, clear outcomes
- 🧑‍💻 **Junior Developer** — Technical depth with patience
- 🎩 **C-Suite Executive** — Strategic framing, ROI focus
- 🤖 **Senior AI Engineer** — Full technical precision

### Intelligent Voice Input

Built-in Web Speech API integration with automatic cleanup:

- Removes filler words ("um," "uh," "like," "you know")
- Deduplicates repeated words
- Fixes punctuation and capitalization
- Real-time word count with ideal range guidance (80–200 words)

### Progressive Hint System

Three levels of hints per question — start with a nudge, escalate to a full explanation if needed:

1. **Nudge** — A gentle push in the right direction
2. **Concept Outline** — Key ideas organized for clarity
3. **Full Explanation** — The complete technical breakdown

### Session Reports

After each 5-question session, receive a comprehensive report:

- **Communication style analysis** — How you naturally explain things
- **Recurring strengths** — What you consistently do well
- **Growth areas** — Patterns to work on
- **Weekly practice tip** — A concrete action to try
- **Per-question breakdown** — Review each answer with scores

### Progress Tracking

- Up to **20 past sessions** stored locally
- Color-coded scores with verdict badges: **Strong** · **Solid** · **Growing**
- **Sparkline charts** showing your score trajectory over time

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/teachloop.git
cd teachloop

# Install dependencies
npm install

# Set up environment
cp .env.local.example .env.local
# Add your OpenRouter API key to .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Prerequisites

- **Node.js** 18+
- **OpenRouter API Key** — Get one free at [openrouter.ai/keys](https://openrouter.ai/keys)

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | Yes | API key from [OpenRouter](https://openrouter.ai/keys) — uses the free NVIDIA Nemotron model |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint checks |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 15](https://nextjs.org) (App Router) |
| **UI** | [React 19](https://react.dev) |
| **Animations** | [Motion](https://motion.dev) (Framer Motion) |
| **Typography** | [Geist](https://vercel.com/font) font family |
| **Icons** | [Phosphor Icons](https://phosphoricons.com) |
| **AI Backend** | [OpenRouter](https://openrouter.ai) (NVIDIA Nemotron 120B, free tier) |
| **Voice** | Web Speech API (browser-native) |
| **Storage** | localStorage (sessions, theme, history) |

---

## Architecture

```
app/
  page.js                          # App shell, state machine, error boundary
  layout.js                        # Root layout, fonts, theme script
  globals.css                      # Design system, themes, all styles (~3k lines)
  api/eval/route.js                # AI evaluation endpoint (proxies to OpenRouter)
  components/
    screens/
      HomeScreen.js                # Hero, mode cards, features, past sessions
      AudienceScreen.js            # Audience selection with icons
      WheelScreen.js               # Animated spinning wheel
      SessionScreen.js             # Question card, textarea, voice input
      FeedbackScreen.js            # Session report, style analysis
      LoadingEval.js               # Skeleton loading state
    ui/
      LogoMark.js                  # SVG logo
      Nav.js                       # Glassmorphism navigation bar
      ProgressBar.js               # Session progress indicator
      ScoreRing.js                 # Animated circular score gauge
      Sparkline.js                 # Score trend chart
  data/
    questions.js                   # Teach + SWE question banks
    audiences.js                   # Audience definitions + icons
    hints.js                       # 3-level progressive hints
  hooks/
    useVoice.js                    # Web Speech API hook
  lib/
    api.js                         # API helpers, prompt builders
  providers/
    ThemeProvider.js               # Theme context + switcher
```

---

## Themes

Three built-in themes, persisted in localStorage:

| Theme | Vibe |
|-------|------|
| **Sunrise Studio** | Warm neutrals, burnt orange accent — like a teacher's notebook *(default)* |
| **Chalkboard** | Dark surface, yellow accent — a warm study room |
| **Blue Hour** | Cool slate, blue accent — professional and calm |

Switch themes from the navigation bar. Your choice persists across sessions.

---

## Design System

TeachLoop ships with a complete design system built into `globals.css`:

- **Typography** — Perfect Fourth (1.333) modular scale, 10 size steps, Geist family
- **Spacing** — 4pt base scale, 16 named steps (`--space-1` through `--space-32`)
- **Colors** — Theme-aware CSS custom properties with light/dark modes
- **Motion** — Custom easing curves (quart, expo, spring), 4 duration levels
- **Surfaces** — Grain texture overlay, glassmorphism navbar, gradient card hovers
- **Layout** — Content max-width 44rem, responsive breakpoints at 480px / 640px / 768px

---

## Accessibility

TeachLoop is built to be usable by everyone:

- **WCAG AA** contrast targets across all themes
- **Keyboard navigation** with visible focus indicators on every interactive element
- **Screen reader support** — ARIA labels, live regions, semantic HTML
- **Reduced motion** — Fully respected via `prefers-reduced-motion`
- **Voice + keyboard** — Input via Web Speech API with typed fallback
- **Skip links** — Jump directly to main content
- **Touch targets** — Minimum 44px on mobile
- **Safe area insets** — Proper padding on iOS devices
- **Print styles** — Clean output when printing session reports

---

## Security

- Rate limiting: 30 requests per minute per IP
- Origin validation on the API endpoint
- 15-second request timeout with exponential backoff retry
- Response schema validation before processing
- Security headers configured: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Powered-By` header disabled

---

## License

**Private** — not licensed for distribution.

---

<div align="center">

**Built with care for technical professionals who want to communicate as well as they code.**

</div>
