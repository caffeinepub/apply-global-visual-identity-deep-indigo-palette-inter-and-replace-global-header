# Specification

## Summary
**Goal:** Apply the Deep Indigo visual identity (palette + Inter typography) across the app and replace the global header (Topbar) logo with the uploaded branding.

**Planned changes:**
- Add new, standardized logo assets under `frontend/public/assets/generated` (stable filenames suitable for UI references).
- Update the global header (Topbar) to render the new logo asset(s) instead of the current `firsty-logo-mark` and `firsty-wordmark` images, keeping the logo aligned within the existing 64px header height.
- Apply the provided color palette globally via Tailwind/Shadcn theme variables: Deep Indigo (`#1A2B4C`) as predominant, Slate Gray (`#3E4A59`) for body text, Ice White (`#F4F7F9`) for backgrounds, and Sage Green (`#7A918D`) only as an accent; maintain high contrast and avoid vibrant neon/pink/purple colors.
- Load and set Inter as the default sans-serif font across the app, enforcing the hierarchy: titles semibold, subtitles medium, body regular.

**User-visible outcome:** The app uses the new Deep Indigo visual identity and Inter typography throughout, and the global header displays the updated logo without layout overflow.
