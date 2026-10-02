import Link from "next/link";
export default function NotFound() {
  return <main className="route-state"><Link className="wordmark" href="/">fourthform</Link><p className="overline">404</p><h1>We couldn’t find this page.</h1><p>Check the address, return to Fourthform or explore the portal preview.</p><div><Link className="primary" href="/">Back to Fourthform</Link><Link href="/preview">Open portal preview ↗</Link></div></main>;
}
