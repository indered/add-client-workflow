# Project Notes

## Things that have broken before

- Vercel served an SSO login instead of the app -> SSO deployment protection was inherited from team defaults -> disable SSO protection for public bootstrap projects before live verification.
- Mobile Add Client became unnamed for assistive tech -> the visible text was hidden at the small breakpoint -> icon-only buttons need an `aria-label` before their text is visually removed.
