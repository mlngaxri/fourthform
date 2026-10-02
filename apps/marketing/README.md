# Fourthform marketing website

Editorial marketing site with an animated website object, selected work, process, interactive client portal preview, scheduled States and clear Site/First/Core/Pro pricing. Includes preview onboarding, draft recovery and illustrative checkout.

## Local development

Requires Node.js 22.6+. Run `npm ci`, then `npm run dev`; open http://localhost:3000. Run `npm run typecheck` and `npm run build` for checks.

- `/`: marketing website
- `/preview`: full product preview
- `/preview/start`: example Site onboarding
- `/preview/start?package=first`: example First onboarding

Browser tests: set `PREVIEW_URL` to the running local URL and `TEST_CHROME` to a Chromium executable, then run `npm run test:browser`. Screenshot evidence is generated under `docs/preview-evidence`.

## Deployment

Import this repository into the Vercel project serving https://fourthform-marketing.vercel.app/. The framework is Next.js. No service credentials are required for this preview. This commit does not itself link or deploy the Vercel project.

The primary Client portal link uses https://fourthform-client-portal.vercel.app/. The embedded portal and onboarding handoff stay on the marketing origin for consistent browser-local data. Its source matches the standalone client portal repository.

## Preview boundary

Public demo onboarding and checkout are illustrations. They do not create accounts or charge cards. Password input is never persisted. The embedded portal uses example data and verified device storage. The separate client portal repository now implements the connected CMS, search inspection, analytics, accounts and payment reconciliation. Public demo actions remain simulated.

Local fonts, reduced-motion handling, image loading, responsive screens, keyboard dialogs and preview journey checks are included. See `docs/LOCAL_ACCEPTANCE.md` for the tested scope.

## Continuous validation

GitHub Actions compiles the production site, checks server-rendered structure and runs preview/detail browser journeys. A run uploads screenshot and result evidence. Run `npm run test:structure` for the server-rendered structural checks locally.

## Connected customer funnel

The portal repository now contains the real authenticated backend and website CMS. This marketing repository preserves the public demo spaces. `NEXT_PUBLIC_CONNECTED_PORTAL=true` switches start buttons to `/start`, which forwards valid design references and package selections to `NEXT_PUBLIC_CLIENT_PORTAL_URL`. Leave the switch false until the connected portal completes hosted provider acceptance. See the portal repository's `docs/ACTIVATION.md` for configuration and release steps.
