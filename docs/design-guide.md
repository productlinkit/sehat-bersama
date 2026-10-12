# Sehat Bersama — Design & Voice Guide

The single reference for copy, naming, and visual tokens. If a screen disagrees with this guide, the guide wins.

## 1. Voice

- **One register: "kamu".** Never "Anda". Use "-mu" for possessives (kata sandimu, konsultasimu).
- Warm, short, plain Bahasa Indonesia. One idea per sentence.
- Say what happens next: "Setelah masuk, kamu langsung lanjut ke pembayaran."
- Errors say what went wrong **and** how to fix it: "Nomor HP harus diawali 08 dan berisi 10–13 angka."
- Safety copy is never hidden or shortened: emergency numbers (112, 119, 119 ext 8) appear on Lega, consultation start, help.
- System events in chat are written to the patient in second person ("Kamu dihubungkan ke dokter"), never about them ("Pasien…").
- **Indonesian labels first.** Use: Hadiah (not Reward), Kesehatan Mental (not Mental Health), Perawatan di Rumah (not Homecare), Lab di Rumah (not Home Lab), Panggilan Video/Suara (not Video/Voice Call), Cek Perasaan (not Check-in), Tanya Jawab (not FAQ), Layanan Pelanggan (not CS), dokter siap/aktif (not online).
- **Deliberate brand terms** (kept as-is, always explained): Lega, Lega Pass, AI Co-Pilot, Sehat Harian / Plus / Mingguan / Keluarga. Accepted loanwords: chat, voucher, promo, QRIS and wallet names.

## 2. Naming

| Thing | Rule | Example |
|---|---|---|
| Packages | Unique, plain names. A variant gets a suffix, never the same name. | Sehat Harian · **Sehat Harian Plus** |
| Quotas | Real numbers + unit + limit | 10x Chat Dokter Umum (maks. 30 menit/sesi) |
| Jargon | Explain on first use, on the same screen | AI Co-Pilot → explainer box on Pilih Paket, consultation start, FAQ |
| Article tags | Show the display label from `categories` in `src/lib/data.ts`, never the slug | `kesehatan-mental` → "Kesehatan Mental" |
| Prices | `Rp 15.000`, plus per-day price for multi-day packages | ≈ Rp 2.143/hari |

## 3. Color tokens

All text tokens meet WCAG 1.4.3 (≥4.5:1). Control borders meet 1.4.11 (≥3:1).

| Token | Value | Use | Contrast |
|---|---|---|---|
| `--primary` | `#0f766e` (teal-700) | CTAs, links, active nav, focus ring | 5.5:1 on white |
| `--muted-foreground` | `#475569` (slate-600) | Meta and helper text | 6.9:1 on slate-100 |
| `--input` | `#848ea0` | Input, checkbox, radio borders | 3.3:1 on white |
| Error | `#b91c1c` (red-700) | Inline errors, destructive text | ≥4.5:1 |
| Info | sky-50 / sky-900 | Neutral status ("Berlangsung", city chips) | ≥7:1 |
| Warning | amber-50 / amber-900 | **Warnings only** (never status, promo or info) | ≥7:1 |
| System note | slate-200 / slate-800 | Neutral chat events, centred | ≥7:1 |
| Lega accent | `#6d28d9` / `#7c3aed` (violet-700/600) | Lega surfaces only | 5.7:1 on white |

Do not use `emerald-600`, `red-600` text on tinted backgrounds, or white text below `teal-700`; they fail contrast.
**Never put white text on a translucent white chip** (`bg-white/20`) over teal or a gradient (measures ~3.7:1). Chips on coloured surfaces are solid white with teal-900/violet-900 text.

## 4. Type scale (floor)

| Role | Minimum |
|---|---|
| Meta (read time, timestamps, badges) | 12px (`text-xs`) |
| Helper and error text | 13px (`text-[13px]`) |
| Package features, body in cards | 14px (`text-sm`) |
| Body | 16px |

Nothing renders below 12px. Users can scale everything to 112.5% or 125% in **Akun → Tampilan & Ukuran Teks**, on **Bantuan**, or with the **Aa** button on Pilih Paket.

## 5. Lega sub-brand

Lega is purple so the mental-health space feels calmer and separate, but it always belongs to the teal parent:

- Every Lega screen shows the "bagian dari Sehat Bersama" byline with the teal logo.
- Safety and emergency notes on Lega use the **teal** system (teal-50 card, teal-800 icon), the bridge between the two palettes.
- Purple is for Lega actions and data only (mood picker, streak, chart, journal, send).

## 6. Icons

- One icon language: the Sehat Bersama duotone set in `src/components/icons.tsx` (48×48, 2.5px rounded strokes in `currentColor`, soft fill via `--icon-fill`) for services, packages, home services, Lega moods and success; Lucide line icons for UI chrome (nav, chevrons, actions).
- **No emoji as icons.** Emoji render differently per OS and break the stroke system.
- Tones live in `iconTones` (`src/lib/data.ts`): teal, rose, violet, sky, cyan. Amber is not an illustration colour.

## 7. Navigation

- One bottom-nav pattern: the active tab stays **inside** the bar (emerald pill behind the icon + bold teal-800 label). No raised/floating buttons, so the nav never covers content at any text size.
- The purchase flow (Pilih Paket → Pembayaran → success) hides the bottom nav so only the sticky CTA is fixed.
- Desktop ≥1024px: left sidebar replaces the bottom nav.
- Riwayat Medis is the single home for consultation notes, summaries and prescriptions (`/notes` redirects there).

## 8. Components

- **Buttons:** primary (filled teal) = one per screen; outline/ghost = secondary; `destructive` (red) = irreversible actions, always behind a confirm dialog.
- **Selection:** choice lists are radio groups (`role="radio"`, `aria-checked`, arrow keys). Selected = teal border + tint + "Dipilih" check badge, never colour alone.
- **Overlays:** bottom sheets for details and comparisons (package details, compare table, doctor preview); dialogs for confirmation. Every sheet/dialog sets `aria-modal="true"` and returns focus to the control that opened it (use `SheetTrigger`/`DialogTrigger`, or `onCloseAutoFocus` with a stored trigger ref when opened programmatically).
- **Empty states:** never a blank card. Show a labelled sample ("Contoh" weekly chart) or a target ("Kumpulkan 820 poin lagi").
- **Focus:** global 2px teal outline with 2px offset; `scroll-padding` keeps focus clear of sticky header and bottom bars.
- **Targets:** ≥24×24px everywhere; primary controls ≥44px tall.
- **Imagery:** article thumbnails use the category cover (`CategoryCover`). No placeholder or blank images ship.
