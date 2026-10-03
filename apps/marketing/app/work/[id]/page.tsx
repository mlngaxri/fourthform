import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {findProject,projects} from '../../../lib/portfolio/projects';
import {startHref} from '../../../lib/customer-flow';
import ConceptSite from '../../../components/concepts/ConceptSite';
import {findConcept} from '../../../lib/portfolio/concepts';
import OriginalMedia from '../../../components/work/OriginalMedia';
export function generateStaticParams(){return projects.map(({id})=>({id}));}
export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{const {id}=await params,p=findProject(id);return {title:p?`${p.title} | Original design study`:'Design study',description:p?.description,alternates:{canonical:`/work/${id}`},openGraph:{images:[{url:`/work/${id}.webp`,alt:p?.title||'Fourthform design'}]}};}
export default async function OriginalDesignPage({params,searchParams}:{params:Promise<{id:string}>,searchParams:Promise<{view?:string}>}){const p=findProject((await params).id);if(!p)notFound();const concept=findConcept(p.id);if((await searchParams).view!=="original"&&concept)return <ConceptSite concept={concept}/>;return <main className="original-design-page"><header><Link className="mk-wordmark" href="/work"><span className="ff-mark" aria-hidden="true"/>fourthform</Link><Link href={`/work/${p.id}`}>Explore interactive study ↗</Link></header><div className="original-design-intro"><div><span className="mk-kicker">Original design study · {p.sector}</span><h1>{p.title}</h1></div><Link className="mk-button mk-button-dark" href={startHref({reference:p.id})}>Use this reference ↗</Link></div><OriginalMedia project={p} motion priority/><footer><p>{p.description}</p><p>Original visual preview. This study is a reference for your custom website.</p></footer></main>;}
