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

1. **Scan** — visitor scans the QR code or taps the NFC tag
2. **Register** — enters name and email (30 seconds max); phone, school, grad year, and area of interest are optional
3. **Play** — answers multiple-choice engineering questions under a 30-second timer; earns points for correct answers, speed bonuses, and streaks
4. **Compete** — live leaderboard updates in real time across all devices at the event
5. **Unlock** — at 500 points, a "Submit Resume" button unlocks; the PDF uploads directly to secure cloud storage
6. **Win** — prize campaigns reward top performers, creating ongoing engagement

---

## Scoring System

| Action | Points |
|---|---|
| Correct answer | 100–750 pts (varies by difficulty) |
| Speed bonus | +3 pts per second remaining |
| Streak bonus (3+ in a row) | +25% on top of base points |
| Level up (every 3 correct) | Unlocks harder questions |

Resume submission unlocks at **500 points**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v4 + inline styles |
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

All brand-facing copy and colors live in one file: [src/branding.ts](src/branding.ts)

```ts
export const BRAND = {
  appName: "Power Grid Challenge",
  tagline: "⚡ UTILITY POLE ENGINEERING ⚡",
  subtitle: "Learn. Solve. Win. Master the grid.",
  accentColor: "#fbbf24",
  bgColor: "#0a0f1e",
};

export const RESUME_UNLOCK_THRESHOLD = 500;
```

Change the name, colors, and threshold here and it propagates everywhere. No other files need touching for a basic rebrand.

---

## Recruiter View

The [Convex Dashboard](https://dashboard.convex.dev) is the recruiter view for the demo. You can see:

- Every registered player (name, email, school, grad year, role interest)
- Quiz attempt history per player
- Submitted resumes (downloadable from Convex Storage)
- Live score updates

A dedicated recruiter admin UI is a planned future phase.

---

## Roadmap

- [ ] Recruiter admin dashboard (filter/export leads, view resumes)
- [ ] Email notification on resume submission
- [ ] Magic-link return login (so students can continue on a different device)
- [ ] Anti-cheat detection
- [ ] Company rebrand pass (swap logo, colors, quiz content)
- [ ] Next.js migration (if SSR, SEO, or server actions become needed)
