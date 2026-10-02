# Fourthform

Fourthform’s marketing site and connected client portal, released together with one visual language and an explicit preview boundary.

| Application | Source | Intended destination |
| --- | --- | --- |
| Marketing, 20 original design studies and four independent product previews | `apps/marketing` | https://fourthform-marketing.vercel.app |
| Accounts, private project boards, review, CMS, SEO inspection, reporting, enquiries, billing and launch | `apps/portal` | https://fourthform-client-portal.vercel.app |

## Run locally

Use Node.js 22 or newer. Run `npm run install:apps`, then `npm run dev:marketing` and `npm run dev:portal` in separate terminals. Each application retains its own lockfile and can be deployed independently. The portal’s README describes local Supabase setup with Docker, private storage and environment configuration.

`npm test` checks shared preview parity and both source/backend suites. `npm run build` builds both applications. The root GitHub workflow exercises real isolated Supabase and the full browser journeys, including phone layouts, keyboard confirmation, portfolio history, published content and State activation.

## Product boundaries

Public previews use fictional sample content and device storage. They do not send messages, take payments or publish a real website. Connected functionality uses persisted accounts, authenticated server routes, database authorization, immutable receipts and version checks. Payments require Stripe configuration; Google, email notifications, document scanning and custom domains each have a separate capability boundary. Unavailable services are described before use.

The marketing purchase funnel stays in preview mode until connected production onboarding is configured and accepted. No live Stripe, Google, custom-domain or email acceptance is implied by passing local or CI tests. See `docs/RELEASE_NOTES.md`, `docs/PREVIEW_PARITY.md` and `docs/UX_RESOLUTION.md` for changes and remaining launch requirements.

## Deploy

Link each Vercel project to this repository, with the root directory set to its corresponding `apps/marketing` or `apps/portal` folder. Keep Next.js as the framework. Configure production environment variables using each app’s `.env.example`, apply the portal migrations in order, and validate the exact release before publishing. Do not commit credentials.

The source release and production deployment are distinct. Confirm the actual deployed commit and exercise the public URLs after deployment. A skipped deployment or an unavailable provider is never a successful launch.
