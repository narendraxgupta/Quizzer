<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/temp/1

# AI-Assisted Knowledge Quiz

A small React + TypeScript quiz app that generates multiple-choice questions using an AI service (Gemini) with a safe local mock fallback for offline or free development.

This repo is scaffolded with Vite and uses a lightweight client-side architecture. It's intentionally usable without a paid API key: when no `GEMINI_API_KEY` is provided the app falls back to a deterministic local mock generator so you can develop and test the UI.

## Features

- Generate quizzes from topics (built-in topic cards or custom topics)
- Difficulty selector (Easy / Medium / Hard)
- Language selector for question generation (14 languages supported)
- Per-question timer and progress bar
- Hints and per-question explanations (AI generated when key available)
- Save/restore quiz progress (localStorage)
- Analytics / Dashboard for past quizzes
- Theme toggle (light / dark) and accent color selector (CSS variable `--accent`)
- Export results (JSON) and print/PDF friendly styles
- Safe local mock fallback when no Gemini API key is present

## Quick Start (development)

Prerequisites:

- Node.js 18+ and npm
- Windows PowerShell (your default shell) — commands shown below are for PowerShell

1. Install dependencies

```powershell
npm install
```

2. (Optional) Provide a Gemini API key

If you have a Gemini (or other AI) API key and serverless proxy configured, set it as an environment variable. For local development with Vite create a `.env.local` file at the project root with:

```text
VITE_GEMINI_API_KEY=your_real_key_here
```

Important: The production app shouldn't expose private keys in client bundles. See the Deployment & Security section for how to use a serverless proxy.

If you do not set `VITE_GEMINI_API_KEY`, the frontend will automatically use the built-in deterministic mock generator so you can run and test the UI freely.

3. Run the dev server

```powershell
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`). The UI will show the Topic Selector; choose a topic, difficulty and language and press Start.

## Scripts

- `npm run dev` — start the Vite dev server (HMR)
- `npm run build` — produce a production build in `dist`
- `npm run preview` — preview the production build locally

## Configuration & Environment

- Environment variable used in dev: `VITE_GEMINI_API_KEY`
  - If present the app will attempt to call the configured AI service client in `services/geminiService.ts`.
  - If missing or empty, the app uses a deterministic local mock (no network calls required).

- Local persistence: `localStorage` keys used include `quiz_progress`, `analytics`, `theme`, and `accentColorKey`.

## Project structure (key files)

- `index.tsx`, `App.tsx` — application entry and top-level state
- `components/` — React components (Quiz flow, TopicSelector, Results, Dashboard, Footer, helpers)
- `services/geminiService.ts` — AI wrapper and mock fallback
- `types.ts` — shared TypeScript types and enums
- `index.css` — global styles and `--accent` CSS variables
- `vercel.json`, `.vercelignore` — helpful config for Vercel deployments

## Mock fallback behavior

This project intentionally includes a deterministic mock generator inside `services/geminiService.ts`. If you run without `VITE_GEMINI_API_KEY` the UI still behaves interactively: the mock returns consistent, readable quizzes that let you exercise all UI paths (hints, explanations, scoring, export, etc.). This makes it suitable for offline demos and free local development.

## Deployment (Vercel)

This project can be deployed as a static site built with Vite. Two important notes before deploying to production:

1. Do NOT put a real API key in the client bundle. If you need the real Gemini integration in production, implement a serverless proxy function that stores `GEMINI_API_KEY` as a server-only environment variable and forwards requests from the client to the Gemini API.

2. Vercel steps (static build):

- Build locally to confirm:

```powershell
npm run build
npm run preview
```

- Push the repo to GitHub and import it into Vercel (or connect the repo from your Vercel dashboard). Set environment variables in the Vercel project settings if you use a serverless proxy.

If you'd like, I can add an example Vercel serverless function (API route) that securely proxies AI calls from the frontend to Gemini. That function would live under `api/` (e.g. `api/gemini.ts`) and read `process.env.GEMINI_API_KEY` from the server environment.

## Security note: serverless proxy example (recommended)

The recommended production architecture:

- Create a serverless API route on your host (Vercel, Netlify Functions, Render, etc.) that accepts quiz generation requests from the client.
- The server function reads `GEMINI_API_KEY` from the host's secure environment variables and calls the Gemini API server-side.
- The client calls the server function (not Gemini directly). This prevents exposing the private API key.

If you want, I can implement this serverless route and wire the frontend to call it instead of calling the AI client directly.

## Troubleshooting

- "App doesn't generate real questions": make sure `VITE_GEMINI_API_KEY` is set and the serverless proxy (if used) is configured. Without a key the app intentionally uses the mock.
- "Timer auto-advances immediately": this was a known issue in earlier versions. If you see it, update to the latest branch; the timer is initialized to the correct difficulty-based value.
- TypeScript errors after editing: run `npm install` and verify `node` version >= 18. If problems persist, run `npm run dev` and read Vite output for the first failing file.

## Development notes & tips

- Accent color: the UI uses the CSS variable `--accent`. You can change the accent at runtime via the accent selector in the app. The selection is persisted to `localStorage`.
- Language: the language selector affects AI prompt generation and the mock generator; full UI localization is not implemented (only generation language is threaded through).
- Tests: this starter currently does not include automated tests. Adding a small test suite (Vitest + React Testing Library) is a recommended next step.

## Contributing

Contributions are welcome. If you add features that contact external APIs, follow the security pattern of keeping keys server-side.

- Fork the repo
- Create a feature branch
- Open a PR and describe changes

## Credits

- Project authored by narendraxgupta — https://github.com/narendraxgupta
- Built with React, TypeScript and Vite

## License

This repository does not include a license file. Add a `LICENSE` if you want to clarify reuse terms.

---

If you'd like, I can also:

- Add a small `api/gemini.ts` serverless example for Vercel to securely proxy requests
- Add Vitest unit tests for the core components and the `services/geminiService.ts` mock
- Provide a compact `README` that focuses only on commands and quick deploy instructions for sharing with non-technical users

Tell me which of the above you'd like next and I'll implement it.
