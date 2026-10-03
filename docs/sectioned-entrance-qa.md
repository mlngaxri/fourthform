# Fourthform sectioned entrance
Reviewed 3 October 2026.

Verified application commit: 91b352a7413d9fa3ee48599e127b3812b0215714.
Release validation: https://github.com/mlngaxri/fourthform/actions/runs/37087992122

## Content and hierarchy
The homepage now contains one headline, one service sentence and the original portfolio imagery. Pricing, process, portal demonstrations, FAQs, repeated calls to action and gallery controls have left the homepage.

The primary navigation opens three dedicated routes: Work, How we work with you, and Pricing. The existing brief action remains available. The Work page retains all 20 original designs, filters, original motion previews and reference selection. Its repeated closing sales section was removed. Typography, prices, package scope, original images and the portal application remain consistent.

## Motion and depth
The background combines violet radial light, a perspective floor, a faint horizon, a central vignette and card shadows. Desktop cards follow one synchronized native animation timeline around the headline. Hovering over the headline or decorative cards does not stop the circle.

Seven transition panels drop from left to right, cover the route change, then rise from right to left. The destination heading receives focus. The curtain has a recovery timeout and cannot remain permanently closed after a failed route change.

Pause and Play control the scene. Reduced motion starts still, bypasses the staircase and allows an explicit desktop Play choice. Small screens use four still cards with the same depth treatment. Hidden or offscreen scenes pause.

## Verification
Both production builds, marketing typecheck, six marketing structural tests, portal tests and all eleven marketing browser suites passed. The isolated connected portal system also passed. Browser suites reported no uncaught application errors.

The animation suite confirmed visible desktop motion at 1024, 1440 and 1920 pixels, progress after a blocked JavaScript thread, pause/resume, reduced-motion changes, staircase direction, route focus, readable navigation contrast and viewport fit through eight orbit phases.

Fit checks covered 320x568, 390x844, 768x1024, 844x390, 900x480, 1024x768, 1280x720, 1440x900, 1920x1080 and 2560x1440. No horizontal or vertical homepage overflow occurred in this matrix. Phone, tablet, landscape and desktop screenshots were reviewed. The built Vercel preview was also reviewed for homepage depth, service page hierarchy and the corrected Work navigation contrast.
