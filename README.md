# The Room — AI DSA Mock Interview Agent

A self-hosted mock interview simulator for Data Structures & Algorithms
practice. Pick a topic, difficulty, and target company tier — it generates a
fresh, Striver-sheet-style problem, drops you into a live "interview room"
with a code editor and a real interviewer, and grades your answer with
feedback, follow-up questions, and session analytics over time.

Built to prepare for on-campus placements (3 LPA to 30+ LPA tier calibration),
and structured as a small full-stack project: a static frontend, a
serverless API layer, and an LLM doing the actual interviewing.

## Features

- **Live question generation** — no static question bank; every problem is
  generated fresh per session, in the spirit of a well-known DSA sheet,
  calibrated to the chosen difficulty and hiring-tier rigor
- **Three-pane interview room** — question panel, a real code editor, and an
  interviewer feed running side by side, not a linear chat
- **In-browser code execution** — JavaScript solutions run for real, in a
  sandboxed Web Worker with a timeout, against generated test cases
- **AI grading** — correctness score, what was missed, a complexity note,
  and an interviewer-style follow-up question after every answer
- **Confidence calibration** — you rate your own confidence before seeing
  the verdict, and session analytics show the gap between confidence and
  actual performance
- **Adaptive practice** — cumulative mode weights question selection toward
  topics you're scoring lower on, based on stored history
- **Session history & trends** — every session is saved locally with a
  topic-wise score trend view

## Tech stack

- **Frontend**: vanilla HTML/CSS/JS, no build step, no framework
- **Backend**: a single serverless function (`api/interview.js` for Vercel,
  `netlify/functions/interview.js` for Netlify) that proxies structured
  prompts to the Anthropic API
- **AI**: Claude (Haiku by default — fast and inexpensive per request)
- **Storage**: browser `localStorage` (per-device; no database required)
- **Execution sandbox**: a Web Worker + Blob URL, with a hard timeout, so
  in-browser JS execution can't hang the page

## Getting an API key

Create one at https://console.anthropic.com/settings/keys. Keep an eye on
usage at https://console.anthropic.com/settings/billing — the app defaults
to Claude Haiku with a capped `max_tokens`, which keeps per-session cost
small, but usage still scales with how much you and anyone you share it
with actually use it.

## Deploy

### Vercel
1. Push this repo to GitHub.
2. Import it at https://vercel.com/new.
3. In **Settings → Environment Variables**, add `ANTHROPIC_API_KEY`.
4. Deploy — the `api/` function is auto-detected, no extra config.

### Netlify
1. Push this repo to GitHub (or drag-and-drop the folder at
   https://app.netlify.com/drop for a quick test).
2. In **Site settings → Environment variables**, add `ANTHROPIC_API_KEY`.
3. `netlify.toml` already routes `/api/*` to the function — no frontend
   changes needed.

### Local dev
```
npm i -g vercel      # or: npm i -g netlify-cli
cp .env.example .env # fill in your key
vercel dev            # or: netlify dev
```

## Project structure

```
index.html                     — the entire frontend (UI + app logic)
api/interview.js               — Vercel serverless function
netlify/functions/interview.js — same function, Netlify Functions format
netlify.toml                   — routes /api/* to the Netlify function
package.json                   — project metadata
.env.example                   — documents the required env var
LICENSE                        — MIT
```

## Notes

- Your Anthropic API key stays server-side in the function's environment —
  it's never exposed to the browser.
- Storage is per-browser (`localStorage`), so history doesn't sync across
  devices unless a real database is added later.
- Live code execution is currently JavaScript-only; other languages are
  still fully reviewed by the AI on submit, just not compiled.

## License

MIT — see [LICENSE](./LICENSE).
