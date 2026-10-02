import type { Metadata } from "next";
export const metadata: Metadata = { title: "Start your site", robots: { index: false, follow: false } };
import OnboardingPreview from "../../../components/preview/OnboardingPreview";
export default function PreviewStart() { return <OnboardingPreview />; }
