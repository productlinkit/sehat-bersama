# UI/UX Evaluation (Baseline, Oct 2026): Compliance Matrix

Every finding from *SehatBersama_UIUXEvaluation_Baseline_LinkIT360.pdf*, where it is addressed, and how it was verified.

Verification:
- **axe** = `npm run test:a11y`: axe-core 4.10, WCAG 2.0/2.1/2.2 A+AA + best-practice, 88 page/state combinations (guest and signed-in, 390px and 1440px, open sheets/dialogs, error states), plus a Tab-walk on every mobile page checking visible focus and that focus is not obscured. Result: **0 violations**.
- **e2e** = `npm run test:e2e`: 36 scripted checks. Result: **36/36 pass**.

## Section 5: Issue priorities

| # | Issue | Implementation | Verified |
|---|---|---|---|
| P1 | Auth inputs unlabelled (4.1.2) | `Field` binds `<label for>`/id, helper + errors via `aria-describedby` (`src/components/form.tsx`) | axe, e2e "labels programmatically bound", "helper text linked" |
| P1 | Two "Sehat Harian", test values | Renamed **Sehat Harian Plus**; realistic quotas; "Paling Populer" badge (`src/lib/data.ts`) | e2e "no duplicate names", "no test values" |
| P1 | No consent at registration | Required checkbox linking S&K and Kebijakan Privasi (UU PDP 27/2022) | e2e "blocked without consent", "consent links" |
| P2 | Placeholder images / blank avatar | Branded `CategoryCover` per category; "Tim Medis Sehat Bersama" author + reviewer | e2e "article author + related" |
| P2 | Login gate dead end | Back button, Bantuan, bottom nav, "Kamu memilih … · Rp …" summary, redirect back to `/checkout?pkg=` | e2e "gate shows summary", "lands on checkout with package restored" |
| P2 | Carousel dots ~6px (2.5.8) | 32×32px dot buttons, pause/play control (`src/components/carousel.tsx`) | axe target-size, e2e "24px dots" |
| P2 | Inconsistent tags | Single `categories` label map used on list, detail, search | e2e "no raw slugs" |
| P3 | Mixed kamu/Anda | All copy in "kamu" (`docs/design-guide.md` §1) | grep: 0 "Anda" in `src/` |
| P3 | Weak selected state | Radio group, teal border + tint + "Dipilih" check | e2e "Dipilih", "arrow keys move selection" |
| P3 | Layout shift | Content is static and covers reserve fixed aspect ratios; carousel slides have fixed min-height | visual |
| P3 | No show/hide password | Eye toggle with `aria-pressed` on every password field | e2e "aria-pressed" |

## Section 5B: AN (UI)

| Enhancement | Implementation |
|---|---|
| Branded imagery system | `CategoryCover` + `categories` artwork per topic |
| Type floor 12/13/14px | Type scale in design guide; no text under 12px (e2e on 5 key pages) |
| Package card v2 | Selected fill + check, Paling Populer, Rekomendasi badge, per-day price |
| Logo in home header; branded success + consultation-start | Home header logo; `/payment/success`; `/consultation/start` |
| Bottom sheets | Package details, comparison table, doctor preview (`Sheet`) |
| Secondary/ghost/destructive buttons | Outline/ghost for secondary; `destructive` behind confirm dialogs (logout, delete account) |
| Spacing; fill empty Lega space | Guest Lega shows mood check-in preview + teaser card |
| Lega sub-brand bridge | "bagian dari Sehat Bersama" byline, teal safety card (design guide §5) |
| Desktop breakpoint ≥1024px | Sidebar nav, two-column home, 2-col packages, 4-col articles (e2e) |

## Section 5B: DS (UX)

| Enhancement | Implementation |
|---|---|
| Guest→login handoff | Package summary on login/register; return to checkout |
| Voice & naming guide | `docs/design-guide.md`; AI Co-Pilot explained on Pilih Paket, consultation start, FAQ |
| Unified tiles + tags | Every service tile is a link with the same guest/user routing; one tag set |
| Comparison + "Rekomendasi untukmu" | "Bandingkan semua paket" sheet; `?for=` preselects a recommended package |
| Inline validation, OTP recovery | Blur/submit validation with `role="alert"`; 3-step OTP flow on `/forgot-password` |
| Article search + chips | `/articles` search + category radio chips; global `/search` |
| Help centre + WhatsApp CS | Public `/help` (FAQ, CS, text size, emergency), linked from login gate, home, sidebar, Akun |
| "Dokter online sekarang" | `DoctorsOnline` on home, packages, consultation start |
| Usability tests | `docs/usability-test-plan.md`: needs real participants, not done in code |

## Section 5B: RP (A11y)

| Enhancement | Implementation |
|---|---|
| Labels + describedby (4.1.2, 3.3.2) | `Field` component |
| 24×24 targets + pause (2.5.8, 2.2.2) | Carousel; all icon buttons ≥32px |
| Contrast tokens (1.4.3, 1.4.11) | Design guide §3; axe color-contrast passes |
| Focus ring + scroll-padding (2.4.7, 2.4.11) | Global `:focus-visible` outline; `scroll-padding` in `index.css`; Tab-walk check |
| Package radio group (1.4.1, 4.1.2) | Radix radio group with `aria-checked` + arrow keys |
| `aria-current` nav; one h1 per page (1.3.1) | NavLink `aria-current="page"`; axe `page-has-heading-one` passes on all pages |
| Errors announced (3.3.1) | `role="alert"` + `aria-invalid` + `aria-describedby` |
| Full axe + keyboard + screen reader audit | axe + keyboard automated across all routes; **TalkBack/NVDA session still to be run by a person** |

## Persona wishlist

| Wish | Done |
|---|---|
| Side-by-side comparison (Rina) | Comparison sheet |
| See doctors online before paying (Rina) | Doctor preview sheet on Pilih Paket |
| Try Lega for one message without an account (Bagas) | Guest 1-message chat, then sign-up prompt |
| Search/filter articles (Bagas) | Search + category chips |
| Larger text option (Pak Hendra) | Text size: Normal / Besar / Sangat besar |
| Help/CS button (Pak Hendra) | Bantuan on home, login gate, sidebar, Akun |

---

# v1.1 Evaluation (Revamp, 8.1 / 10): Compliance Matrix

Verification for this round:
- **audit** = `npm run test:a11y`: axe-core + custom checks for exactly what axe missed in v1.1: composited contrast over translucent/gradient backgrounds (including `oklch` colours), focus return + `aria-modal` on every sheet/dialog, exactly one `<h1>`, emoji/English-label scan, nav-overlap at all 3 text sizes, Tab-walk. **102 page/overlay states, 0 issues.**
- **selftest** = `npm run test:a11y:selftest`: re-introduces each v1.1 defect on purpose (translucent "ONLINE 24/7" chip, translucent quota chip, focus dropped to `<body>` after closing the comparison sheet, two `<h1>`, emoji icon, English label, raised nav tab) and confirms the audit **flags all 7**, so a 0-issue audit result is meaningful.
- **e2e** = `npm run test:e2e`: **62/62 pass**.

## Section 5: Issue priorities

| # | Issue | Implementation | Verified |
|---|---|---|---|
| P1 | White text on `bg-white/20` chips (~3.7:1) | Solid white chips with teal-900 / violet-900 text (home promo, consultation-start quota) | audit contrast; selftest flags the old chip; e2e "promo chip is solid white" |
| P1 | Comparison sheet drops focus to `<body>`; no `aria-modal` | `onCloseAutoFocus` → trigger ref (comparison + details sheets); `aria-modal="true"` on all Sheet/Dialog content; journal dialog now uses `DialogTrigger` | audit focus-return on 8 overlays; selftest; e2e |
| P2 | Raised active tab overlaps content | Single in-bar pattern (pill + bold label) | audit nav-overlap ×3 text sizes; selftest; e2e |
| P2 | "Bayar" enabled with no method; error far away, no focus | Last-used method (QRIS default) pre-selected with "Terakhir dipakai"; error rendered directly above the method list, `aria-invalid` + `aria-describedby` on the radiogroup, focus moves to it | e2e "QRIS pre-selected", "pays without any error" |
| P2 | Triage hand-off in patient bubble, amber system notes | Neutral centred `role="note"` system messages in second person | e2e "neutral system note" |
| P2 | Emoji as primary icons | Owned duotone SVG set (`src/components/icons.tsx`, 18 icons) across tiles, triage, packages, home services, Lega moods, success | audit emoji scan; e2e |
| P3 | Empty Reward catalogue | 4 vouchers tied to packages (3 redeemable + "Segera hadir" with point target), redeem dialog, Voucher Saya, apply at checkout | e2e redeem → Rp 12.000 at checkout |
| P3 | Catatan duplicates Riwayat | Merged: `/notes` → `/history`; Catatan buttons removed | e2e redirect |
| P3 | Sticky CTA + nav ~24% of viewport; Lega subtitle truncates; empty weekly card | Nav hidden in purchase flow; header subtitles/titles wrap; labelled sample chart ("Contoh") | e2e |
| P3 | Two `<h1>` on article detail; search pill 1.2:1 | `PageHeader titleAs="p"`; search pill border `#848ea0` (3.3:1) | audit one-h1; e2e |

## Section 5B

| Owner | Enhancement | Implementation |
|---|---|---|
| AN | Custom icon set | `icons.tsx`, design guide §6 |
| AN | Single nav pattern, hide nav in purchase flow | `BottomNav`; `nav={false}` on Pilih Paket / Pembayaran / success |
| AN | Designed empty states | Lega sample chart (guest + first-time user); Reward targets + "Segera hadir" |
| AN | Colour roles | amber = warning only; `info` (sky) for "Berlangsung"/cities; slate system notes; "Paling Populer" teal-800; tier chip violet |
| AN | Branded payment-success + consultation-start | Success: logo, duotone check, summary, +50 poin; start: hero, doctors, 3 steps, emergency line |
| AN | Desktop ≥1024px verified | e2e: sidebar + 2-col home, 2-col packages; screenshots in `audit-results/` |
| DS | Pre-select method + inline error with focus | Checkout |
| DS | Chat system-message component | Consultation |
| DS | IA cleanup + one nav pattern | `/notes` merged; single nav |
| DS | Indonesian labels / deliberate brand terms | Hadiah, Kesehatan Mental, Perawatan/Lab di Rumah, Panggilan Video/Suara, Cek Perasaan, Tanya Jawab; brand-term list in design guide §1 |
| DS | Redeemable Reward catalogue | `voucherCatalogue` + `useRewards` |
| DS | Usability tests + funnel metrics | Funnel events + `/internal/funnel`; test plan. **Sessions need real participants.** |
| RP | Chip contrast | Done (P1) |
| RP | Focus return + aria-modal | Done (P1) |
| RP | Payment radiogroup aria-invalid/describedby | Done |
| RP | One h1; search pill border | Done |
| RP | prefers-reduced-motion for autoplay | Off at load and stops when the setting changes mid-session; e2e verifies |
| RP | NVDA + TalkBack audit | **Needs a person with a screen reader.** Automated proxies (axe, focus-return, names/roles, live regions) all pass. |

## Persona wishlist (v1.1)

| Wish | Done |
|---|---|
| Rina: QRIS / last-used method pre-selected | Yes |
| Rina: vouchers she can redeem | Yes, and apply at checkout |
| Bagas: weekly summary preview before first check-in | Sample chart for guests and first-time users |
| Bagas: less English | Indonesian labels throughout |
| Pak Hendra: nav never overlaps content | In-bar nav, checked at 3 text sizes |
| Pak Hendra: WhatsApp CS on payment screen | "Ada kendala saat membayar?" block |
