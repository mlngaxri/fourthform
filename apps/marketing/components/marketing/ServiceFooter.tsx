import Link from "next/link";
import {clientSignInHref} from "../../lib/customer-flow";
export default function ServiceFooter() {
  return <footer className="mk-footer"><div className="mk-container"><span>Fourthform · Brisbane, Australia</span><div className="mk-footer-links"><Link href="/contact">Contact</Link><a href={clientSignInHref}>Client sign-in ↗</a></div></div></footer>;
}
