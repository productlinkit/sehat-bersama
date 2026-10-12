# Sehat Bersama (web)

Mobile-first telehealth web app: doctor chat, child consults, Lega (mental-health companion), home services, packages, rewards.
React 19 · Vite · TypeScript · Tailwind CSS v4 · shadcn/ui · React Router.

> **Demo build.** Login, payments, doctor/Lega replies and doctor availability are mocked (`src/lib/data.ts`, `src/lib/auth.tsx`).
> Any valid Indonesian phone number with a 6+ character password signs in. Nothing is charged.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build
```

Demo login: `08123456789` / `08123456789`. OTP code on the password-reset flow: `123456`.

Optional: set `VITE_CS_WHATSAPP` (e.g. `62811xxxxxxx`) to enable the WhatsApp customer-service links.

## Quality checks

Needs Google Chrome and the dev server running (`BASE` defaults to `http://localhost:5173`).

```bash
npm run test:a11y           # axe-core WCAG 2.2 AA + contrast, focus-return, one-h1, nav-overlap, keyboard checks on every route
npm run test:a11y:selftest  # proves the audit catches each known defect
npm run test:e2e            # end-to-end checks for the UI/UX evaluation findings
```

Set `CHROME_PATH` if Chrome isn't at the default macOS location.

## Docs

- [docs/design-guide.md](docs/design-guide.md): voice, naming, colour tokens, type scale, icons, navigation, components
- [docs/uiux-compliance.md](docs/uiux-compliance.md): every evaluation finding mapped to its fix and verification
- [docs/usability-test-plan.md](docs/usability-test-plan.md): quarterly moderated test plan and funnel metrics

## Deploy

`vercel.json` configures Vercel (Vite build, SPA rewrites to `index.html`).
