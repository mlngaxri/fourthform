# Systematic marketing and preview review

| Area | Reviewed and changed |
| --- | --- |
| Marketing navigation | Mobile navigation now exposes all major sections and the client portal; Escape restores focus; outside clicks and wide-screen changes close the menu. |
| Motion | A complete static layout shows both States when motion is unavailable. Reduced-motion users skip animation module loading. Load listeners, font refresh and animation cleanup remain scoped to the page. |
| Accessibility | Correct focus and section-offset selectors; business validation names, error associations and focus; duplicate skip links remain removed. |
| Onboarding | Resume a saved brief without entering simulated credentials; trim saved values; show the brief before checkout; distinguish a new example from saved content; warn before leaving unsaved details through browser or SPA navigation. Passwords are never stored. |
| Search metadata | Homepage canonical, social image, sitemap and crawl exclusions for the previews. Decorative website snapshots cannot accidentally navigate inside their frames. |
| Embedded portal | Matches the standalone portal byte for byte, including recovery, upload, revision and failed-save fixes documented in its review. |
| Verification | Typecheck and rendered structure tests locally; production build and 44 browser regressions in GitHub validation. Screenshots and JSON results are retained as workflow artifacts. |

This remains an interactive product preview with example data and local browser persistence. No real account, checkout or live-site mutation is implemented in this pass.

## Integration review follow-up

Direct website edits now survive CMS history, navigation and reload. Restored and cross-tab snapshots paint their incoming content before capture. CMS saving writes one consistent page-and-fields snapshot and rolls it back on failure. Consent settings persist, sample integrations can disconnect/reconnect, and launch checks use current form/search readiness. Paid receipts and three-page analytics exports agree with the sample project. Onboarding reset preserves original references; stored briefs respect field limits; marketing responds to changes in the reduced-motion preference.

Fifteen isolated integration regressions extend the existing 44 browser checks to 59. Node tests and TypeScript/structure checks run locally; production build and browser checks run in GitHub validation.
