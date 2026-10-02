export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Contact from "../../components/marketing/Contact";
export const metadata: Metadata = { title: "Ask about your project", description: "Discuss your website scope, content and next steps with Fourthform." };
export default function ContactPage() {
  return <Contact available={Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_TO && process.env.EMAIL_FROM)} />;
}
