# Production verification, 4 October 2026

Release: `1ae365d9c43c2b255ef32a6e561d2b1795ba1e28` on `main`.

Both production deployment jobs succeeded in GitHub Actions run 37196751498. Release validation run 37196475813 and the subsequent main validation run 37196751510 both passed. All 13 marketing browser suites passed, alongside the portal's isolated Supabase account, storage, CMS and customer workflow checks.

Public production checks:

- Homepage orbit moves automatically on desktop without a start button. Archivo, Schibsted Grotesk and Instrument Serif headline tracks advance automatically.
- Work navigation reveals the collection through the staircase transition. All 20 entries use the original designs and consistent descriptive or visible-brand titles.
- Keel's repaired 7-second original recording plays, pauses at its current position, and resumes. The container was repaired without re-encoding the captured audio/video packets.
- NeuralKinetics loads its recovered original application, animated artwork and below-fold content inside the portfolio iframe. Original source controls retain their original behaviour.
- The portal preview uses a flat sidebar and shared Fourthform typography. The complete 'Preview · local edits' status fits in the desktop top bar.

Portfolio limitation: only NeuralKinetics has recovered runnable source in this release. There are 19 original motion previews overall, including its recording; Prisma has an original still. The remaining designs are not presented as rebuilt interactive originals. Remote recordings depend on the source host and have bundled poster fallbacks.

These screenshots were captured from the public production URLs after the deployment above:

- `final-marketing-20261004.jpg`
- `final-portal-20261004.jpg`
- `final-original-20261004.jpg`
