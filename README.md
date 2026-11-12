# Power Grid Challenge

A gamified engineering quiz web app designed for career fairs, university bootcamps, and student recruitment events. Visitors scan a QR code or tap an NFC tag, register in seconds, and compete in a real-time leaderboard — all from their phone.

---

## What It Is

Power Grid Challenge turns passive booth visits into an engaging, competitive experience. Students answer utility pole and electrical engineering questions to earn points, climb a live leaderboard, and — once they hit a score threshold — unlock the ability to submit their resume directly to the recruiting team.

It's a talent funnel disguised as a game.

---

## Why It Was Built

Traditional career fair booths rely on paper sign-up sheets, badge scans, or business card drops. These create friction for students and produce low-quality leads for recruiters. Power Grid Challenge flips the dynamic:

- **Students are motivated** to engage because there's a game, a leaderboard, and a prize mechanic
- **Recruiters get richer data** — not just a name and email, but a signal of genuine interest and domain knowledge (how well did they do on the quiz?)
- **The experience is self-serve** — no recruiter needs to stand there and manually collect info; the booth runs itself
- **It's mobile-first by design** — built for the exact moment someone scans a QR code on their phone

---

## Use Cases

### Career Fair Booth
Set up a tablet or screen at the booth showing the QR code. Students scan it, sign up, and start playing on their own phones. The live leaderboard on the screen creates a social dynamic — people watch, compete, and linger longer at the booth.

### University Bootcamp or Workshop
Run it as a warm-up activity at the start of a technical workshop or bootcamp session. Students compete on the leaderboard in real time while the instructor can see engagement and self-reported skill levels via the Convex dashboard.

### Campus Recruitment Drive
Share the link via email or a campus digital screen campaign before an event. Students can pre-register and start earning points before even arriving at the booth, creating buzz and a warm audience.

### Networking Event
Use it as an icebreaker — project the leaderboard on a screen at a mixer or info session. The top scorers become natural conversation starters for recruiters.

---

## How It Works

1. **Scan**: the visitor scans the QR code or taps the NFC tag
2. **Sign up**: name, email and one consent tick. Nothing else is asked up front
3. **Play**: rounds of 5 multiple-choice questions, 30 seconds each
4. **Profile**: after the first round, school, program, grad year and what they're looking for, for a 100 point bonus
5. **Unlock**: at 500 points, résumé drop-off and the prize draw open
6. **Follow-up**: an explicit yes or no to being contacted, plus optional LinkedIn and phone

Each ask shows up when the player has a reason to answer it, one at a time. The Rewards tab lists all of them.

---

## Scoring System

All scoring runs on the server (`convex/attempts.ts`, rules in `src/data/scoring.ts`). The browser sends the answer, never the points.

| Action | Points |
|---|---|
| Correct answer | 100 to 750 pts by difficulty |
| Speed bonus | +3 pts per second remaining (not with a hint) |
| Streak bonus (3+ in a row) | +25% of base points |
| Completed profile | +100 pts, once |
| Repeat of a solved question | 0 pts (practice) |

---

## 3D Pole Explorer

The Explore tab is a 3D pole built from three.js primitives (`src/components/Pole3D.tsx`, no model files). Drag to orbit, pinch or scroll to zoom, two fingers to pan. Tapping a part flies the camera in and plays its animation: the cutout drops open, lightning hits the arrester, current runs through the transformer. "Play tour" visits every part in turn. The 3D code loads only when the tab is opened, and falls back to a 2D drawing if WebGL isn't available.

---

## What Gets Captured

| Data | When | Where |
|---|---|---|
| Name, email | Sign-up | `players` |
| Consent timestamp and wording version | Sign-up | `players.consentAt`, `consentVersion` |
| Event and entry point | From the link: `?e=usask-fair&src=qr` | `players.eventCode`, `source` |
| School, program, grad year, looking for | After round 1 | `players` |
| Interest area, LinkedIn, phone, follow-up yes/no | Follow-up step | `players` |
| Every answer: question, category, right or wrong, time, hint used | During play | `quizAttempts` |
| Résumé file | At 500 pts | `resumes` + Convex Storage |
| Prize draw entry code | At 500 pts | `drawEntries` |

Signing up twice with the same email returns the same player, so one person is one lead.

Other players only ever see a first name and last initial. Emails, phone numbers and player ids are never sent to another browser.

---

## Pages

| URL | What it is |
|---|---|
| `/` | The game, built for phones |
| `/#/screen` | Booth TV: QR code and live board. Add `?e=your-event` before the `#` to tag sign-ups |
| `/#/recruiter` | Leads table with search, filters and CSV export |

The recruiter page needs a passcode. Set it once:

```bash
npx convex env set ADMIN_KEY "pick-a-long-passcode"
```

With no `ADMIN_KEY` set, the page returns nothing. This is booth-grade protection. Put real auth in front of it before the data set gets big or long-lived.

---

## Before an Event

- [ ] Edit `src/branding.ts`: company name in the consent line, privacy contact, prize draw details (or `enabled: false`)
- [ ] If you change the consent wording, bump `CONSENT_VERSION`
- [ ] Have an engineer read through `src/data/puzzles.ts`
- [ ] Print a QR link per entry point, e.g. `?e=usask-fair&src=qr` and `?e=usask-fair&src=nfc`
- [ ] Set `ADMIN_KEY`, open `/#/recruiter` and export once as a test
- [ ] If there is a prize, write the draw rules and check contest requirements for your province

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v4 |
| Backend / DB | Convex (real-time, serverless) |
| File storage | Convex Storage (resume uploads) |
| Hosting | Vercel (auto-deploy from GitHub) |

---

## Local Development

```bash
# Install dependencies
npm install

# Start Convex dev backend (in one terminal)
npx convex dev

# Start Vite dev server (in another terminal)
npm run dev
```

No Convex account handy? `npm run demo` runs the whole app against sample data kept in the browser (`src/demo/convexReact.tsx`). The recruiter passcode in demo mode is `demo`.

Open `http://localhost:5173`.

## Production Deploy

```bash
# Deploy Convex schema + functions to cloud
npx convex deploy

# Add VITE_CONVEX_URL to Vercel environment variables
# Then push to GitHub — Vercel auto-deploys
```

---

## Customising for a Specific Company

Copy, consent wording, thresholds, prize draw and the profile choices live in [src/branding.ts](src/branding.ts). Colours and type live at the top of [src/index.css](src/index.css). Questions and pole items live in [src/data/puzzles.ts](src/data/puzzles.ts).

---

## Roadmap

- [x] Recruiter view (filter and export leads, open résumés)
- [x] Server-side scoring
- [ ] Real sign-in for the recruiter view
- [ ] Email notification on résumé submission
- [ ] Magic-link return login. Today, entering a registered email resumes that player with no verification
- [ ] Keep the answer key off the client
- [ ] Company rebrand pass (swap logo, colors, quiz content)
- [ ] Next.js migration (if SSR, SEO, or server actions become needed)
