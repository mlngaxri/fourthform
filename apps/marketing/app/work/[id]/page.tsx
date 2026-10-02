import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {findConcept,websiteConcepts} from '../../../lib/portfolio/concepts';
import ConceptSite from '../../../components/concepts/ConceptSite';
export function generateStaticParams(){return websiteConcepts.map(({id})=>({id}));}
export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{const {id}=await params;const c=findConcept(id);return {title:c?`${c.brand} | Studio concept`:'Studio concept',description:c?.body,alternates:{canonical:`/work/${id}`},openGraph:{images:[{url:`/work/${id}.webp`,alt:`${c?.brand||'Fourthform'} website concept`}]}};}
export default async function ConceptPage({params}:{params:Promise<{id:string}>}){const c=findConcept((await params).id);if(!c)notFound();return <ConceptSite key={c.id} concept={c}/>;}
