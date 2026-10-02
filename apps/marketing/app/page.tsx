import type { Metadata } from "next";
import MarketingHome from "../components/marketing/MarketingHome";
export const metadata: Metadata = { alternates: { canonical: "/" }, openGraph: { url: "/", images: [{ url: "/work/monolith-hero.webp", alt: "Stratum, a selected website design by Fourthform" }] } };
export default function Home() { return <MarketingHome />; }
