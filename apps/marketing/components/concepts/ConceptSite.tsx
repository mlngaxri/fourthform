"use client";
import {experiences} from "../../lib/portfolio/experience";
import {startHref} from "../../lib/customer-flow";
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import Link from 'next/link';
import type {Concept} from '../../lib/portfolio/concepts';

export default function ConceptSite({concept:c}:{concept:Concept}){
 const dialog=useRef<HTMLDialogElement>(null),trigger=useRef<HTMLButtonElement>(null);
 const [sent,setSent]=useState(false);
 const [interest,setInterest]=useState("");
 const experience=experiences[c.id];
 const contactAction=/^(Discuss|Start|Make|Share|Talk)/.test(c.action);
 const style={'--concept-bg':c.background,'--concept-ink':c.ink,'--concept-accent':c.accent} as CSSProperties;
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');if(media.matches)return;const nodes=document.querySelectorAll('.concept-reveal');const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-in-view');observer.unobserve(entry.target);}});},{threshold:.08});nodes.forEach(node=>observer.observe(node));return()=>observer.disconnect();},[]);
 function close(){dialog.current?.close();trigger.current?.focus();}
 function enquire(interest:string,element?:HTMLButtonElement){setInterest(interest);setSent(false);if(element)trigger.current=element;dialog.current?.showModal();}
 return <main className={`concept-site concept-${c.layout}`} style={style} data-concept={c.id}>
  <div className="concept-studio-bar"><Link href="/work" target="_top" className="concept-studio-brand"><span className="ff-mark" aria-hidden="true"/>fourthform</Link><span>Studio concept · Fictional business</span><Link href={startHref({reference:c.id})} target="_top">Use this direction ↗</Link></div>
  <a className="skip-link" href="#concept-content">Skip to content</a>
  <nav className="concept-nav" aria-label={`${c.brand} navigation`}><a href="#concept-content" className="concept-brand">{c.brand}<span aria-hidden="true">.</span></a><div><a href="#explore">Explore</a><a href="#approach">Approach</a><a href="#contact">Get in touch ↗</a></div></nav>
  <section className="concept-hero" id="concept-content" tabIndex={-1}>
   <div className="concept-art"><img src={c.art} alt={`${c.brand} visual direction`} fetchPriority="high"/><span className="concept-art-index" aria-hidden="true">A study in {c.layout==='landscape'?'atmosphere':c.layout==='editorial'?'character':c.layout==='product'?'clarity':'expression'}</span></div>
   <div className="concept-hero-copy"><p className="concept-eyebrow">{c.eyebrow}</p><h1>{c.headline}</h1><p className="concept-body">{c.body}</p>{contactAction?<button type="button" className="concept-action" onClick={event=>enquire("",event.currentTarget)}>{c.action}<span aria-hidden="true">↗</span></button>:<a className="concept-action" href="#explore">{c.action}<span aria-hidden="true">↘</span></a>}</div>
   <div className="concept-hero-foot"><span>{c.brand} · Independent perspective</span><a href="#approach">Discover the approach <span aria-hidden="true">↓</span></a></div>
  </section>
  <section className="concept-intro concept-reveal" id="approach"><span className="concept-eyebrow">01 / A point of view</span><h2>{c.intro}</h2><span className="concept-form" aria-hidden="true"><i/><i/><i/><i/></span></section>
  <section className="concept-offers" id="explore"><div className="concept-section-head"><span className="concept-eyebrow">02 / Explore {c.brand}</span><span>{c.layout==="product"?"Follow the idea through.":c.layout==="editorial"?"A closer look.":c.layout==="expressive"?"Explore a point of view.":"Find your starting point."}</span></div><div className="concept-offer-grid">{c.offers.map((offer,i)=><article className="concept-reveal" key={offer.title}><span>0{i+1}</span><h3>{offer.title}</h3><p>{offer.body}</p><button type="button" onClick={event=>enquire(offer.title,event.currentTarget)}>Ask about {offer.title.toLowerCase()} <span aria-hidden="true">↗</span></button></article>)}</div></section>
  {experience&&<section className={`concept-depth concept-depth-${c.layout} concept-reveal`}><span className="concept-eyebrow">A useful place to start</span><h2>{experience.section}</h2><div className="concept-considerations"><h3>{experience.question}</h3><ol>{experience.prompts.map((prompt,i)=><li key={prompt}><span>0{i+1}</span>{prompt}</li>)}</ol></div></section>}
  <section id="contact" className="concept-contact concept-reveal"><span className="concept-eyebrow">03 / Your next step</span><h2>{c.endTitle}</h2><div><p>{c.endBody}</p><button ref={trigger} type="button" className="concept-action" onClick={event=>enquire("",event.currentTarget)}>Try an enquiry <span aria-hidden="true">↗</span></button><small>Example interaction. No message is sent.</small></div></section>
  <footer className="concept-footer"><b>{c.brand}.</b><span>A Fourthform studio concept.</span><Link href="/work" target="_top">Back to all 20 designs ↗</Link></footer>
  <dialog ref={dialog} className="concept-enquiry" aria-labelledby="concept-enquiry-title" onCancel={event=>{event.preventDefault();close();}} onClick={event=>{if(event.target===event.currentTarget)close();}} data-lenis-prevent><button type="button" onClick={close} className="concept-close" aria-label="Close enquiry">×</button>{sent?<div role="status"><p className="concept-eyebrow">Example complete</p><h2 id="concept-enquiry-title">A clear next step.</h2><p>This is how an enquiry could feel on your website. Your details have not been saved or sent.</p><button type="button" className="concept-action" onClick={close}>Return to the concept ↗</button></div>:<form onSubmit={event=>{event.preventDefault();setSent(true);}}><p className="concept-eyebrow">An enquiry to {c.brand}</p><h2 id="concept-enquiry-title">Start with a little context.</h2><p>Try the form with example details. Nothing leaves this page.</p><label>Your interest<select value={interest} onChange={event=>setInterest(event.target.value)}><option value="">A general enquiry</option>{c.offers.map(offer=><option key={offer.title}>{offer.title}</option>)}</select></label><label>Your name<input required name="name" autoComplete="off" maxLength={100}/></label><label>Email address<input required name="email" type="email" autoComplete="off" maxLength={200}/></label><label>What do you have in mind?<textarea required name="message" rows={3} maxLength={2000}/></label><button className="concept-action" type="submit">Preview the response ↗</button></form>}</dialog>
 </main>;
}
