import type { Metadata } from "next";
import Link from "next/link";
import {findSpace} from "../../lib/preview/spaces";
export const metadata: Metadata = { title: "Portal preview", robots: { index: false, follow: false } };
export default async function Preview({searchParams}:{searchParams:Promise<{view?:string|string[];space?:string|string[]}>}) {
  const params=await searchParams,space=findSpace(params.space);
  const views=["overview","direction","build","review","pages","analytics","seo","domains","connections","states","billing","launch","settings"];
  const view=typeof params.view==="string"&&views.includes(params.view)?params.view:space?.view||"review";
  return <main className="standalone-preview"><header><Link className="preview-back" href="/">← Back to website</Link><span>{space?space.label:'Complete workspace'} · Edits stay on this device</span>{space?<Link href={`/preview?view=${view}`}>Complete workspace ↗</Link>:<Link href="/#portal">About the portal ↗</Link>}<Link href="/preview/start">Start a site ↗</Link></header><iframe src={`/portal-preview/index.html?view=${view}${space?`&space=${space.id}`:''}`} title={`${space?.label||'Fourthform client portal'} interactive preview`} /></main>;
}
