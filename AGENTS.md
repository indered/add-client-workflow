# Project Notes

## Things that have broken before

- Vercel served an SSO login instead of the app -> SSO deployment protection was inherited from team defaults -> disable SSO protection for public bootstrap projects before live verification.
- Mobile Add Client became unnamed for assistive tech -> the visible text was hidden at the small breakpoint -> icon-only buttons need an `aria-label` before their text is visually removed.
- Quick Plan appeared as a client status -> intake type and workflow status were mixed together -> keep statuses limited to workflow state and store Quick Plan under `intakeType`.
- Login collapsed email and OTP into one form -> the requested OTP flow was skipped -> model auth as send-code then verify-code even when mocked.
- Logout used a text glyph that rendered as an emoji -> platform emoji broke the HeroUI style -> use HeroUI line icons for navigation actions.
- Add Client modal expanded into an empty full-screen canvas -> shared ModalShell used HeroUI `size="full"` for a popover flow -> keep add-client steps as a bounded large dialog and scale inner layouts instead.
- Mobile dashboard cards and chips became oversized -> desktop spacing leaked into mobile card layouts -> define compact mobile sizes first and only scale up at larger breakpoints.
- Client detail page showed redundant onboarding and response blocks -> copied dashboard planning sections duplicated status information -> keep detail pages focused on client info, status, actions, and timeline.
- Intake form navigation controls drifted off-center -> a two-column action grid left the primary button hanging in the middle -> right-align footer actions and only show Back when it can be used.
- Share actions were flattened into one menu -> in-app email and external share destinations got mixed together -> keep email compose in-app and reserve the share menu for mailto, WhatsApp, SMS, and copy.
- Share triggers and sidebar identity drifted out of sync -> dropdown wrappers fought the button layout and the profile subtitle was hardcoded -> keep shared actions on simple full-width buttons when alignment matters and render the sidebar role line from the signed-in auth state.
- `/email-connect` and intake deep links 404ed on Vercel -> the SPA rewrite was not present in the deployed build -> keep `vercel.json` rewrites deployed with every release.
- Duplicate intake-link copy action kept showing in the client "More" menu -> the detail dropdown exposed the same action already available elsewhere -> keep the detail menu focused on resend and launch actions only.
- Settings kept splitting into separate desktop cards -> the page header and profile controls were rendered in different containers -> keep the signed-in settings screen inside one desktop card and pin the theme toggle to the top-right of that card.
