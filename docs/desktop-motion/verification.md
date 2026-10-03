# Desktop motion preference fix

Application commit: 285811b6576eb9232b833ba353a37b0c62392879

Verification: https://github.com/mlngaxri/fourthform/actions/runs/37101564014
Production deployment: https://github.com/mlngaxri/fourthform/actions/runs/37101778145

The orbit follows system reduced motion until a visitor explicitly starts it. The start option then disappears, and the saved choice enables automatic desktop motion on reload. Storage failures retain the choice for the current visit. Background motion uses a scoped override; other reduced-motion behavior remains unchanged.

All 12 marketing/preview browser suites passed. New tests verify visible movement after opt-in, background animation activation, automatic movement after reload, and operation with unavailable storage. Normal desktop, system preference changes, responsive layouts and staircase navigation remain covered. Portal verification also passed against isolated Supabase. Both production deployment jobs succeeded. The published homepage was checked for automatic movement and its motion-choice attribute.

The precise Windows/browser preference on the user's device has not been directly observed. The fixed regression reproduces the reported difference between automatic initialization and the previous button override.
