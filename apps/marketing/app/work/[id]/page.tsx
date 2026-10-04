import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {findProject,projects} from '../../../lib/portfolio/projects';
import {startHref} from '../../../lib/customer-flow';
import OriginalMedia from '../../../components/work/OriginalMedia';
import '../../original-previews.css';

export function generateStaticParams(){return projects.map(({id})=>({id}));}
export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{
  const {id}=await params,p=findProject(id);
  return {title:p?`${p.title} | Original website design`:'Website design',description:p?.description,alternates:{canonical:`/work/${id}`},openGraph:{images:[{url:`/work/${id}.webp`,alt:p?.title||'Fourthform design'}]}};
}
export default async function OriginalDesignPage({params,searchParams}:{params:Promise<{id:string}>,searchParams:Promise<{view?:string}>}){
  const p=findProject((await params).id);if(!p)notFound();
  const imageOnly=(await searchParams).view==='original',live=!!p.originalSite&&!imageOnly;
  return <main className={`original-design-page${live?' original-site-page':''}`} data-preview-kind={live?'website':imageOnly||(!p.video&&!p.motionImage)?'image':'recording'}>
    <header><Link className="mk-wordmark" href="/work"><span className="ff-mark" aria-hidden="true"/>fourthform</Link><Link href="/work">Back to all work ↗</Link></header>
    <div className="original-design-intro"><div><span className="mk-kicker">{live?'Original website':imageOnly||(!p.video&&!p.motionImage)?'Original design':'Original recording'} · {p.sector}</span><h1>{p.title}</h1></div><Link className="mk-button mk-button-dark" href={startHref({reference:p.id})}>Use this reference ↗</Link></div>
    {live?<div className="original-site-stage"><iframe className="original-site-frame" src={p.originalSite} title={`${p.title} original website`} allow="autoplay; fullscreen" sandbox="allow-scripts allow-same-origin" referrerPolicy="no-referrer"/><p className="original-site-caption">Explore the original design. <a href={p.originalSite} target="_blank" rel="noopener noreferrer">Open full screen ↗</a></p></div>:<OriginalMedia key={p.id} project={p} motion={!imageOnly} priority/>}
    <footer><div><p>{p.description}</p><p className="original-source-note">{live?'Original layout, artwork and interactions, restored from the supplied source.':imageOnly?'The original visual design, preserved at full size.':p.video||p.motionImage?'This is the original motion recording. Interactive source is not available for this design yet.':'This design is available as an original full-page image.'}</p></div><Link href={imageOnly?`/work/${p.id}`:`/work/${p.id}?view=original`}>{imageOnly?'Return to the original preview ↗':'View the original image ↗'}</Link></footer>
  </main>;
}
