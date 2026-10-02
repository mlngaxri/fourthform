# Fourthform typography

Cabinet Grotesk is selected from [Awwwards Free Fonts](https://www.awwwards.com/awwwards/collections/free-fonts/) for Fourthform headings and wordmarks. Geist remains the reading and interface face. Both apps and the static portal preview share that pairing. The original portfolio media and example customer website retain their own typography.

The unmodified variable WOFF2 comes directly from [Fontshare](https://www.fontshare.com/fonts/cabinet-grotesk). `npm run dev` and `npm run build` prepare a verified local copy automatically. The browser serves it from our own site, with `font-display: swap` and a sans-serif fallback. No external font request is needed while visitors browse.

The font is governed by the [ITF Free Font License](Cabinet-Grotesk-FFL.txt), version 2.0. It permits our websites and apps to host the font, but prohibits redistribution through repositories. Accordingly, the binary is ignored by Git. The setup script obtains it directly from the foundry and verifies its SHA256 before saving it. It never modifies or subsets the font. A changed download fails the build so it can be reviewed.
