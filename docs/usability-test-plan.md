# Quarterly Moderated Usability Test Plan

Runs every quarter. 5–8 participants per persona, 45 minutes each, moderated remote (Zoom + phone screen share) or in person.

## Personas and recruiting

| Persona | Recruit | Focus |
|---|---|---|
| Rina, 32, working mother | Parents with a child under 10, use e-wallet weekly | Package choice for a child, comparison, checkout |
| Bagas, 24, first job | 20–28, has tried a mental-health or journaling app | Lega guest message, sign-up, mood check-in |
| Pak Hendra, 58, retiree | 50+, uses WhatsApp daily, reading glasses | Text size, help/CS, login gate, readability |

Include at least 1 screen-reader (TalkBack) user and 1 keyboard-only user per round.

## Tasks

1. "Your child has a fever. Find a way to talk to a children's doctor and pay." (success: lands on checkout with Sehat Harian Plus or Keluarga)
2. "Which package is cheapest per day for a week of consultations?" (uses comparison or per-day price)
3. "You pressed pay but aren't logged in yet. Finish the purchase." (login gate → returns to checkout)
4. "Try talking to Lega without creating an account."
5. "You forgot your password. Get back into your account." (OTP flow)
6. "Make the text bigger." / "Find how to contact customer service."
7. "Find an article about children's growth."

## Metrics (tracked per round)

- Task success rate (target ≥90% per task)
- Time on task for tasks 1 and 3
- SUS questionnaire (target ≥80)
- Funnel: package-select → payment-success conversion. Events are tracked by `src/lib/analytics.ts` (`package_view`, `package_select`, `checkout_view`, `payment_success`, `consultation_start`) and visible at `/internal/funnel`; connect `send()` to the production analytics SDK.
- Errors: wrong package chosen, dead-ends, back-button use on gate

## Output

Findings ranked P0–P3 within 1 week of the round, fed into the next sprint, and re-scored against `docs/uiux-compliance.md`.
