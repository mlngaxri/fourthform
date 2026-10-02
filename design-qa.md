# Fourthform landing page and portal branding review

Source visual truth: the two user supplied references, image(9).png (1318 x 775 pixels) and image(10).png (938 x 715 pixels), supplied on 2 October 2026. The request is a combination of their visual techniques, with new Fourthform typography, rather than a literal reproduction of their Figma Motion branding.

The first reference supplies the dark canvas, floating gallery and central focus. The second supplies the circular arrangement, tilted cards and depth. The implementation uses original Fourthform portfolio previews, a clear business offer and useful navigation.

## Evidence and normalization

- Full composition: `docs/hero-refinement/reference-comparison.jpg`, with both references and the browser rendered implementation together. Each image is fit proportionally into a 660 x 480 comparison panel. No image is stretched.
- Desktop browser viewport: 1363 x 936 CSS pixels. The browser supplied JPEG raster is 1348 x 926 pixels. The minor capture density difference is normalized by proportional fitting for comparison.
- First desktop pass: `docs/hero-refinement/desktop-first.jpg`.
- Revised desktop composition: `docs/hero-refinement/desktop-final.jpg`. State: desktop orbit, inspected in automatic, paused and manually rotated states.
- Portal branding: `docs/hero-refinement/portal-single-brand.jpg`.
- Responsive browser captures: 320 x 900, 390 x 900, 768 x 900 CSS pixels, with reduced motion. PNG raster dimensions match the CSS viewport.

## Comparison history

1. [P1] A floating card crossed the service description above the headline. The first browser screenshot showed light artwork behind small light text. Increased the vertical radius, adjusted the orbit bounds and kept the headline visible from first paint. The revised screenshot shows clear space around the service description, headline, body and actions at both the initial and a manually rotated position.
2. [P2] The tablet navigation placed the brief action in a second row and left the How it works link above the baseline. The 768 pixel browser capture showed the action overlapping a portfolio card. Removed inherited grid placement, used a single flex row and aligned every navigation link. Applied the same alignment to the portfolio page.

## Required fidelity surfaces

- Fonts and typography: Clash Display from the Awwwards Free Fonts collection is the Fourthform display and identity face. Geist remains the reading and control face. The hero uses a stronger 600 display weight. Original portfolio artwork and the example customer website retain their typography. Browser checks confirm the local font loads in both the marketing page and the focused portal preview.
- Spacing and layout rhythm: the central message and actions have clear space; the peripheral gallery uses a consistent rotation and depth treatment. Phones use four static previews and a two line headline. Native scrolling remains available.
- Colors and tokens: dark neutral hero, cream text and the existing violet accent connect the portfolio hero to portal controls. Pale backgrounds remain in the practical service sections and portal. The references have different backgrounds; the dark reference is the intentional palette source.
- Image quality: original portfolio thumbnails are used, with an intentional top crop in the hero. Links open the original design in the gallery. Full portfolio media are unchanged. Edge cropping in the hero is intentional and follows the references.
- Copy and content: the headline introduces a website made for the client. Supporting text states the audience, service, package price, page count and revisions. Main product copy contains no em dashes. The preview wrapper uses Back to website, leaving one Fourthform wordmark in the portal.

## Interactions

Browser verified: automatic desktop rotation, pause, manual rotation, the See the work route, portfolio navigation, portal preview loading and Pages navigation. Existing browser suites cover small viewports, keyboard and focus behavior, reduced motion, locally hosted typography, saved preview drafts and package consistency. The orbit suspends animation offscreen, in background tabs, during pointer or keyboard interaction, and under reduced motion.

Console review found no application error. Cloud browser extension metadata errors were present and are unrelated to the application. The local preview service was unavailable, so visual review used the Vercel preview of the same GitHub revision and GitHub Actions browser artifacts.

## Final verification

Focused comparisons: `docs/hero-refinement/message-comparison.jpg` shows the earlier obstructed service description beside the corrected composition. `docs/hero-refinement/navigation-comparison.jpg` shows the earlier tablet wrapping beside the corrected single row navigation. The final 320, 390 and 768 pixel screenshots have readable headings, clear actions and no horizontal overflow. There are no remaining actionable P0, P1 or P2 visual findings.

Both app production builds, all ten marketing and portal preview browser suites, and the connected portal browser suite passed in [Validate Fourthform release, run 36983410676](https://github.com/mlngaxri/fourthform/actions/runs/36983410676), for source revision `8636d4a81ffbfbd92c64378e8b3efeb800e2710b`. The desktop and phone evidence is also available in that run's preview-verification artifact. This documentation does not change the verified application code.

No backend feature or production payment configuration was changed in this visual revision. No follow-up visual fix is required for this pass.

final result: passed
