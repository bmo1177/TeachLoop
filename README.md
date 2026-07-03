# TeachLoop

AI-powered communication coaching for technical professionals. Practice explaining concepts to different audiences and get feedback on clarity, analogies, and vocabulary fit.

## Quick Start

```bash
npm install
cp .env.local.example .env.local
# Add your OpenRouter API key to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | Yes | API key from [openrouter.ai/keys](https://openrouter.ai/keys) |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |

## How It Works

1. **Pick a mode** — Teach (explain a concept) or SWE (answer a behavioral question)
2. **Choose your audience** — Student, PM, executive, or custom
3. **Spin the wheel** — Randomly selects a topic
4. **Record your answer** — Voice input via Web Speech API (or type)
5. **Get AI feedback** — Scored on structure, clarity, audience-fit, and more

## Project Structure

```
app/
  page.js                    # App shell, state machine, error boundary
  layout.js                  # Root layout, fonts, theme script
  globals.css                # Design system, themes, all styles
  api/eval/route.js          # AI evaluation endpoint (proxies to OpenRouter)
  components/
    Screens.js               # Home, Audience, Wheel, Session, Feedback screens
    UIComponents.js           # ScoreRing, ProgressBar, Nav, Sparkline, LogoMark
  providers/
    ThemeProvider.js          # Theme context, switcher (sunrise/chalkboard/blue-hour)
  hooks/
    useVoice.js               # Web Speech API hook
  _hooks/
    useSessionHistory.js      # LocalStorage session persistence
  lib/
    api.js                    # API helpers, prompts, question shuffling
  data/
    questions.js              # Teach + SWE question banks
    hints.js                  # Per-topic hints
    audiences.js              # Audience definitions + icons
```

## Themes

Three built-in themes, persisted in localStorage:

- **Sunrise Studio** — Warm neutrals, burnt orange accent (default)
- **Chalkboard** — Dark surface, yellow accent
- **Blue Hour** — Cool slate, blue accent

## Tech Stack

- Next.js 15 (App Router)
- React 19
- Motion (Framer Motion) for animations
- Geist font family
- Phosphor Icons
- OpenRouter API (NVIDIA Nemotron model, free tier)

## Accessibility

- WCAG AA contrast targets
- Keyboard navigation with visible focus indicators
- Screen reader support (ARIA labels, live regions)
- Reduced motion respected via `prefers-reduced-motion`
- Voice input with fallback to keyboard

## License

Private — not licensed for distribution.
