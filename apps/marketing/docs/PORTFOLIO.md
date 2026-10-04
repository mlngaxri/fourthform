# Portfolio presentation

The 20 original full-page poster files under `public/work` are unchanged. `original-assets.json` records their dimensions and SHA256 hashes; the structural test checks those hashes against every delivered poster. Three existing local recordings are retained unchanged. Keel uses the complete captured original, remuxed into a finalized fast-start MP4 without re-encoding; its audio/video packet hashes are unchanged.

`/work/[id]` shows the original website when runnable original source has been recovered. Otherwise it shows the exact original recording, or the original full-page image when no recording exists. Reconstructed `ConceptSite` pages and sample enquiry forms are no longer used by these routes. `/work/[id]?view=original` always shows the original full-page image, with an option to return to its preview.

The restored collection contains 19 original motion previews: 16 MP4 recordings, two source GIFs and one animated WebP. The four existing MP4 files stay local; the remaining recordings use their exact public source URLs. Prisma is presented as a still image. If a remote recording fails, the original poster remains visible with a clear status message. Reduced motion stops automatic playback, while visitors can still request Play, Pause and Resume.

NeuralKinetics is the genuinely explorable original, recovered from the public repository linked by the source catalogue: https://github.com/vikod3/handstouch, commit `0eeb9daea41569c0af3ac6b5e1a12773d69b1ef4`. Its compiled application, hands renderer, moving background and below-fold content are preserved under `public/original-sites/neuralkinetics`. Only asset paths were adapted for that subdirectory. `original-sources.json` records every restored file and checksum. An iframe isolates the original site's typography and artwork from Fourthform's interface.

The full source for the other designs was not recovered. Public source copying reached the site's free-copy limit during an earlier pass. After the workspace rollback, a visible public copy attempt produced no clipboard content. Source views, recordings and public repository files were used without bypassing account access or copy limits. Unavailable source is disclosed in each preview, and no replacement website is presented as an original.

The source GIF URLs were verified through the visible public previews for Velorah and Digital Epoch. OYLA's public original video also loaded and played in the source browser. Source-host availability remains an external dependency; poster fallbacks are bundled with Fourthform.

Display titles use the original visible brand where available. The character artwork has a placeholder Logoipsum wordmark, so its descriptive title is Character Studio. Each immutable `sourceTitle` retains the catalogue name. IDs and saved reference URLs remain unchanged across marketing and the portal.

| Stable ID | Display title | Original catalogue title | Default preview |
| --- | --- | --- | --- |
| `monolith-hero` | Stratum | Monolith Hero | Original recording |
| `oyla` | OYLA | OYLA | Original recording |
| `keel` | Keel | Keel | Original recording |
| `playful-idea` | Character Studio | Playful Idea | Original recording |
| `nature-ritual` | Mossary | Nature Ritual | Original recording |
| `performance-eyewear` | Orven | Performance Eyewear | Original recording |
| `velorah-hero` | Velorah | Velorah | Original recording |
| `prisma-landing` | Prisma | Prisma Creative Studio | Original full-page image |
| `custom-spaces` | Bespoke Architecture | Custom Spaces | Original recording |
| `obsidian` | Obsidian | Obsidian | Original recording |
| `human-machine` | NeuralKinetics | Human Machine | Original website |
| `veyra-electric` | Veyra Electric | Veyra Electric | Original recording |
| `vintage-care` | Art.Car | Vintage Care | Original recording |
| `nature-portfolio` | Ethan Vale | Nature Portfolio | Original recording |
| `anchor-ai` | Anchor AI | Anchor AI | Original recording |
| `vectrus-energy` | Vectrus Energy | Vectrus Energy | Original recording |
| `golden-portal` | Digital Archive | Golden Portal | Original recording |
| `digital-epoch-hero` | Digital Epoch | Digital Epoch | Original recording |
| `peakline-redshift` | Apogee | Peakline Redshift | Original recording |
| `orla-fashion` | Orla | Orla Fashion | Original recording |

The homepage's eight orbit cards link to these original preview routes. Reference actions lead to `/brief`, the visitor's own blank brief with save, reload and plain-text download. `/preview/start` remains the separately labelled portal onboarding example. Browser checks retain the saved-brief regression and wait for restoration to finish after reload before reading controlled inputs.
