import type { Metadata } from "next";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "@fontsource/instrument-serif/400.css";
import "./brand-font.css";
import "./tokens.css";
import "./globals.css";
import "./product.css";
import "./marketing.css";
import "./work.css";
import "./concepts.css";
import "./refinements.css";
import "./declutter.css";
import "./brand-type.css";
import "./orbit.css";
import "./sectioned.css";
import "../../../shared/portal-atmosphere.css";
import {SiteTransition} from "../components/marketing/SiteTransition";

export const metadata: Metadata = {
  metadataBase: new URL("https://fourthform-marketing.vercel.app/"),
  title: { default: "Fourthform | Custom websites for independent businesses", template: "%s | Fourthform" },
  description: "Custom websites from brief to launch. Design, review and everyday updates in one client portal. Site is A$1,500 with Core included.",
  openGraph: { title: "Fourthform | Custom websites for independent businesses", description: "A custom business website, a clear process and one client portal from brief to everyday updates.", type: "website", locale: "en_AU" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><SiteTransition>{children}</SiteTransition></body>
    </html>
  );
}
