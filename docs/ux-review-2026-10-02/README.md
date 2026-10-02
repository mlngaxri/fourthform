# Fourthform: skeptical visitor review

Reviewed the existing Vercel preview in a desktop browser on 2 October 2026. The production marketing URL still displayed a build placeholder. The review used the actual protected preview after obtaining access through the connected Vercel account.

1. **Understand the service.** The hero explains the service, but its abstract headline, six navigation choices, three artwork selectors and three additional work links compete for attention. A 170vh pinned hero prolongs the introduction. [Screenshot](01-hero-before.jpg).
2. **Understand the portal.** Four large space selectors, nested feature selectors, an embedded application and several explanatory notes create a second onboarding journey inside the sales page. Visitors must learn the internal terms before they can judge the service. [Screenshot](02-portal-before.jpg).
3. **Judge the work.** The portfolio introduces a giant headline before showing work. More seriously, the previews replace original designs with invented layouts, names and content. These replacements weaken the evidence of the studio's actual visual range. [Screenshot](03-work-before.jpg).
4. **Scroll and watch motion.** Motion initializes in the preview, but the hero effect is a small zoom on a static poster. Native anchor navigation is delayed by the smooth-scroll layer. Scroll animation and long sticky sections do not deliver the original portfolio's motion.

## Changes

- Put a concise service statement, scope, price and work link in the first screen.
- Show original portfolio studies immediately after the hero. Restore all 20 original images and the four saved original recordings. Remove the generated substitute concepts and artwork.
- Shorten the portfolio introduction so original designs appear in the first screen.
- Shorten navigation to Work, How it works and Pricing. Move client sign-in to the footer and mobile menu.
- Remove the repeated manifesto, standalone States sales section and practice statement. Keep one short process explanation, a portal introduction, the main price, four useful FAQ answers and a final brief link.
- Replace the nested homepage application with a real screenshot and direct links to the functioning focused portal preview. All focused spaces and the complete preview remain available.
- Keep the smaller package and optional Pro tools in a native disclosure, with the same pricing and scope used by the portal.
- Replace GSAP/Lenis scroll interception and pinned timelines on the homepage with native scrolling, progressive reveal animation and inline original video. Content begins visible and remains accessible with reduced motion or JavaScript disabled.
- Preserve keyboard closure and focus restoration for navigation and portfolio dialogs. Separate original image and requested motion modes.

- Apply Cabinet Grotesk from the requested Awwwards collection to headings and identity, with Geist for reading and controls. Share the pairing across both apps and the portal preview while retaining the original portfolio typography.

## Verification boundary

Screenshots establish the visual and hierarchy findings; they do not establish full accessibility compliance. The managed local interactive preview was unavailable. Production build and browser-flow checks run in GitHub Actions, including actual video time progression, pause/resume, reduced motion, responsive reflow, original media dimensions, reference handoff and portal flows. Production Vercel publication still requires a working deployment connection.
