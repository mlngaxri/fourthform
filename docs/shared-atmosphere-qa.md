# Fourthform shared atmosphere release

Tested application commit: 7c645411c00a495e991934cb5a38056d4f85aa98

Release verification: https://github.com/mlngaxri/fourthform/actions/runs/37098233915
Preview deployment: https://github.com/mlngaxri/fourthform/actions/runs/37098233971

## Changes

- Removed the visible orbit pause/play control and its obsolete styles. Native desktop motion still respects system reduced-motion preferences and suspends when hidden.
- Applied a canonical atmosphere stylesheet to marketing pages, account screens, the real portal and both preview copies. Dark violet frames, cream editing surfaces and existing shared display typography remain consistent.
- Added a perspective floor beneath website previews, finite panel reveals, a line reveal and restrained hover depth. Customer website styling and portfolio assets are unchanged.
- Matched mobile navigation and account dashboards to the same design.

## Verification

Both release jobs passed: application type checks and builds, marketing structural tests, portal tests, 17-file preview parity, all 12 marketing/preview browser suites, and connected browser flows against isolated real Supabase.

Motion coverage includes desktop widths 1024, 1440 and 1920, a 10-viewport matrix from 320 to 2560 pixels, reduced-motion changes, background-thread interruption, route staircase order and cleanup. Brand checks cover text contrast, mobile overflow, edited draft retention and finite editing animations. Connected checks cover heading/progress/card contrast, dashboard layout and phone editing screens.

Final screenshots reviewed: marketing routes, desktop review canvas, mobile preview Pages, real account dashboard and real phone Settings. Evidence is attached to the successful validation run.

Live external payment/provider setup is outside this visual release. Connected verification uses disposable accounts and explicit test receipts; it does not claim a live Stripe settlement.
