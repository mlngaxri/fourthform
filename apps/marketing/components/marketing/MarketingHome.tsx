"use client";
import {startHref, connectedPortal, startLabel, clientSignInHref} from "../../lib/customer-flow";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { demoSite } from "../../lib/preview/site";
import {heroProjects} from "../../lib/portfolio/projects";
import FeaturedWork from "../work/FeaturedWork";
import {previewSpaces} from "../../lib/preview/spaces";


export default function MarketingHome(){
  const [heroIndex,setHeroIndex]=useState(0);
  const heroProject=heroProjects[heroIndex];
  const usual=useMemo(()=>demoSite("/",false),[]);
  const evening=useMemo(()=>demoSite("/",true,"An evening,\nthoughtfully prepared."),[]);
  const [menuOpen,setMenuOpen]=useState(false);
  const [previewSpace,setPreviewSpace]=useState<string>('design');
  const [visitedSpaces,setVisitedSpaces]=useState<string[]>(['design']);
  const [previewViews,setPreviewViews]=useState<Record<string,string>>({design:'review',content:'pages',insight:'analytics',launch:'launch'});
  const activeSpace=previewSpaces.find(space=>space.id===previewSpace)!;
  const previewTask=previewViews[previewSpace];
  const portalFrames=useRef<Record<string,HTMLIFrameElement|null>>({});
  function openPreviewTask(view:string){
    setPreviewViews(previous=>({...previous,[previewSpace]:view}));
    portalFrames.current[previewSpace]?.contentWindow?.postMessage({type:'fourthform:preview-view',view},location.origin);
  }
  function openPreviewSpace(id:string){
    setPreviewSpace(id);setVisitedSpaces(previous=>previous.includes(id)?previous:[...previous,id]);
  }
  useEffect(()=>{const receive=(event:MessageEvent)=>{if(event.origin!==location.origin||event.data?.type!=='fourthform:preview-active')return;const space=previewSpaces.find(item=>portalFrames.current[item.id]?.contentWindow===event.source);if(!space)return;setPreviewViews(previous=>({...previous,[space.id]:event.data.view}));};addEventListener('message',receive);return()=>removeEventListener('message',receive);},[]);
  const menuButton=useRef<HTMLButtonElement|null>(null);
  const mobileMenu=useRef<HTMLDivElement|null>(null);
  const root=useRef<HTMLElement|null>(null);

  useEffect(()=>{if(!menuOpen)return;mobileMenu.current?.querySelector<HTMLAnchorElement>("a")?.focus();const close=(event:KeyboardEvent)=>{if(event.key==="Escape"){setMenuOpen(false);menuButton.current?.focus();}};const outside=(event:PointerEvent)=>{if(!mobileMenu.current?.contains(event.target as Node)&&!menuButton.current?.contains(event.target as Node))setMenuOpen(false);};const query=matchMedia("(min-width:761px)");const resize=()=>{if(query.matches)setMenuOpen(false);};document.addEventListener("keydown",close);document.addEventListener("pointerdown",outside);query.addEventListener("change",resize);return()=>{document.removeEventListener("keydown",close);document.removeEventListener("pointerdown",outside);query.removeEventListener("change",resize);};},[menuOpen]);
  useEffect(()=>{
    let cancelled=false,generation=0;
    const motion=matchMedia("(prefers-reduced-motion: reduce)");
    async function boot(run:number){
      if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;
      const [{default:gsap},{ScrollTrigger},{default:Lenis}]=await Promise.all([
        import("gsap"), import("gsap/ScrollTrigger"), import("lenis")
      ]);
      if(cancelled || run!==generation || motion.matches)return;

      gsap.registerPlugin(ScrollTrigger);
      const lenis=new Lenis({lerp:.09,smoothWheel:true,wheelMultiplier:.88,anchors:true,autoRaf:false});
      lenis.on("scroll",ScrollTrigger.update);
      const tick = (t: number) => lenis.raf(t*1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      const responsive=gsap.matchMedia();
      const ctx=gsap.context(()=>{
        root.current?.classList.add("mk-motion");
        const intro=gsap.timeline({defaults:{ease:"power4.out"}});
        if(scrollY<innerHeight*.5)intro.from(".mk-hero-line>span",{yPercent:112,duration:1.05,stagger:.07})
          .from(".mk-hero-copy .mk-body",{opacity:0,y:18,duration:.72},.24)
          .from(".mk-hero-actions",{opacity:0,y:14,duration:.62},.34)
          .from(".mk-hero-site",{opacity:0,y:52,scale:.955,duration:1.1,ease:"expo.out"},.12);

        responsive.add('(min-width:1051px)',()=>{
          gsap.timeline({scrollTrigger:{trigger:'.mk-hero-wrap',start:'top top',end:'bottom bottom',scrub:1.1}})
            .to('.mk-hero-design-image',{scale:1.06,ease:'none'},0).to('.mk-hero-site',{y:24,ease:'none'},0);
          gsap.timeline({scrollTrigger:{trigger:'.mk-states',start:'top top',end:'bottom bottom',scrub:1}})
            .fromTo('.mk-state-saturday',{clipPath:'inset(0 0 100% 0)'},{clipPath:'inset(0 0 0% 0)',ease:'none'},.12)
            .to('.mk-state-label span:first-child',{opacity:.28},.18).to('.mk-state-label span:last-child',{opacity:1},.18);
        });

        gsap.from(".work-featured .portfolio-card",{y:35,opacity:0,stagger:.12,duration:.9,ease:"power3.out",scrollTrigger:{trigger:".work-featured-grid",start:"top 84%"}});
        gsap.from(".mk-manifesto h2",{y:42,opacity:0,duration:1,ease:"power4.out",scrollTrigger:{trigger:".mk-manifesto",start:"top 72%"}});
        gsap.from(".mk-manifesto p",{y:22,opacity:0,duration:.8,ease:"power3.out",scrollTrigger:{trigger:".mk-manifesto",start:"top 64%"}});

        gsap.to(".mk-process-progress",{scaleX:1,ease:"none",scrollTrigger:{trigger:".mk-process",start:"top 62%",end:"bottom 58%",scrub:1}});
        gsap.from(".mk-process-step",{y:24,opacity:0,stagger:.08,duration:.72,ease:"power3.out",scrollTrigger:{trigger:".mk-process-rail",start:"top 80%"}});

        gsap.fromTo(".mk-preview-shell",{scale:.945,y:62,opacity:.45},{scale:1,y:0,opacity:1,ease:"none",scrollTrigger:{trigger:".mk-portal",start:"top 72%",end:"top 22%",scrub:1.05}});

        gsap.from(".mk-price-line",{y:20,duration:.8,ease:"power3.out",scrollTrigger:{trigger:".mk-pricing",start:"top 90%"}});
        gsap.from(".mk-final-grid>*",{y:32,opacity:0,stagger:.08,duration:.9,ease:"power4.out",scrollTrigger:{trigger:".mk-final",start:"top 70%"}});
      },root);
      const refresh=()=>{if(!cancelled&&run===generation)ScrollTrigger.refresh(true);};
      addEventListener("load",refresh,{once:true});
      addEventListener("pageshow",refresh);
      addEventListener("fourthform:layout",refresh);
      void document.fonts.ready.then(refresh);
      refresh();
      return ()=>{removeEventListener("load",refresh);removeEventListener("pageshow",refresh);removeEventListener("fourthform:layout",refresh);responsive.revert();ctx.revert();lenis.destroy();gsap.ticker.remove(tick);root.current?.classList.remove("mk-motion");};
    }
    let cleanup:(()=>void)|undefined;
    const start=()=>{const run=++generation;void boot(run).then(c=>{if(cancelled||run!==generation)c?.();else cleanup=c;}).catch(()=>{if(run===generation)root.current?.classList.remove('mk-motion');});};
    const preferenceChanged=()=>{generation++;cleanup?.();cleanup=undefined;if(!motion.matches)start();};
    motion.addEventListener('change',preferenceChanged);start();
    return()=>{cancelled=true;generation++;motion.removeEventListener('change',preferenceChanged);cleanup?.();};
  },[]);

  return <main ref={root} className="mk-site" id="top">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <nav className="mk-nav" aria-label="Primary navigation"><a className="mk-wordmark" href="#top"><span className="ff-mark" aria-hidden="true"/>fourthform</a><div className="mk-nav-links"><Link href="/work">Work</Link><a href="#process">Process</a><a href="#portal">Try the portal</a><a href="#states">States</a><a href={clientSignInHref}>Client sign-in ↗</a><a href="#pricing">Pricing</a></div><button ref={menuButton} className="mk-menu-toggle" type="button" aria-controls="mk-mobile-menu" aria-expanded={menuOpen} aria-label={menuOpen?"Close navigation":"Open navigation"} onClick={()=>setMenuOpen(open=>!open)}>{menuOpen?"Close":"Menu"}</button><a className="mk-button mk-button-dark" href={startHref()}>{startLabel}</a><div ref={mobileMenu} className="mk-mobile-menu" id="mk-mobile-menu" hidden={!menuOpen} onBlur={event=>{if(event.relatedTarget&&!event.currentTarget.contains(event.relatedTarget)&&event.relatedTarget!==menuButton.current)setMenuOpen(false);}}>{[["/work","Work"],["#process","Process"],["#portal","Portal preview"],["#states","States"],["#pricing","Pricing"],["#questions","Questions"],[clientSignInHref,"Client sign-in ↗"]].map(([href,label])=><a key={href} href={href} onClick={()=>{setMenuOpen(false);menuButton.current?.focus();}}>{label}</a>)}</div></nav>

    <section className="mk-hero-wrap" id="main-content" tabIndex={-1}>
      <div className="mk-hero"><div className="mk-container mk-hero-grid">
        <div className="mk-hero-copy">
          <p className="mk-kicker mk-hero-eyebrow">Custom websites for independent businesses</p>
          <h1 className="mk-display"><span className="mk-hero-line"><span>Websites,</span></span><span className="mk-hero-line"><span><em>brought into form.</em></span></span></h1>
          <p className="mk-body">We design and build a custom website that helps people understand your business and take the next step. Share ideas, review the design and manage updates in one simple workspace.</p>
          <p className="mk-included">A$1,500 · 3 revision rounds · Core included</p>
          <div className="mk-hero-actions"><a className="mk-button mk-button-dark" href={startHref()}>{startLabel}</a><Link className="mk-text-link" href="/work">Explore the work ↗</Link></div>
        </div>
        <div className="mk-hero-stage"><div className="mk-hero-site"><img className="mk-hero-design-image" src={heroProject.image} width={heroProject.width} height={heroProject.height} alt={`${heroProject.title} website design by Fourthform`} onLoad={()=>dispatchEvent(new Event("fourthform:layout"))} fetchPriority="high"/><Link className="mk-hero-design-link" href={`/work?project=${heroProject.id}`} aria-label={`Explore ${heroProject.title}`}><span>Explore design ↗</span></Link></div><div className="mk-hero-design-meta" aria-live="polite"><span>{heroProject.title} · {heroProject.sector}</span><span>{String(heroIndex+1).padStart(2,"0")} / 03</span></div><div className="mk-hero-designs" role="group" aria-label="Featured website designs">{heroProjects.map((project,i)=><button type="button" key={project.id} aria-pressed={heroIndex===i} onClick={()=>setHeroIndex(i)}><img src={project.thumbnail} width="39" height="30" alt=""/>{project.title}</button>)}</div><Link className="mk-hero-all-work" href="/work">20 Fourthform website concepts <span aria-hidden="true">↗</span></Link></div>
      </div></div>
    </section>

    <section className="mk-manifesto"><div className="mk-container mk-manifesto-grid">
      <span className="mk-kicker">Made for your business</span>
      <div><h2 className="mk-display">Clear to your visitors.<br/><em>Simple for you.</em></h2>
        <p className="mk-body">We design and build around what your business needs people to do. You bring the context, guide the refinements and approve the result. Your portal keeps the whole project in view.</p>
        <div className="mk-outcomes">{[
          ["01","Make the business clear","Give visitors the right words, images and details to understand what you offer."],
          ["02","Make the next step easy","Create a clear path to book, enquire, visit or explore your services."],
          ["03","Make updates manageable","Change everyday content in the portal while keeping the design consistent."],
        ].map(([n,title,copy])=><div key={n}><span>{n}</span><h3>{title}</h3><p>{copy}</p></div>)}</div>
      </div>
    </div></section>

    <FeaturedWork/>

    <section className="mk-process" id="process"><div className="mk-container">
      <div className="mk-section-head"><span className="mk-kicker">From brief to launch</span><h2 className="mk-display">Four stages.<br/><em>One clear next step.</em></h2></div>
      <div className="mk-process-rail"><div className="mk-process-line"><i className="mk-process-progress"/></div>{[
        ["01","Direction","Tell us about the business, your goals and the references you like. This becomes your Initial Direction."],
        ["02","Build","We design and build your website. Follow the project’s progress in your portal."],
        ["03","Review","Explore the working website and point to what you want changed. Send your Directions together as a revision round."],
        ["04","Launch","Approve the website, complete the balance and work through the domain and final checks. Then keep it current with Core."],
      ].map(([n,title,copy])=><div className="mk-process-step" key={n}><span>{n}</span><h3>{title}</h3><p>{copy}</p></div>)}</div>
    </div></section>

    <section className="mk-portal" id="portal"><div className="mk-container">
      <div className="mk-portal-head"><div><span className="mk-kicker">Your workspace, in four forms</span><h2 className="mk-display">A place for each part.<br/><em>Space to explore.</em></h2></div><p className="mk-body">From the first idea to everyday updates, everything has a place. Choose a preview space and try what interests you. Each keeps its own example draft. A Direction is a note for your designer; a State is a scheduled content variation.</p></div>
      <div className="mk-preview-tasks" role="group" aria-label="Choose a portal preview space">{previewSpaces.map(space=><button type="button" className="mk-preview-task" key={space.id} data-preview-space={space.id} aria-pressed={previewSpace===space.id} aria-controls={`marketing-portal-${space.id}`} onClick={()=>openPreviewSpace(space.id)}><span className="mk-task-number">{space.number}<span className="ff-mark" aria-hidden="true"/></span><strong>{space.title}</strong><span className="mk-task-copy">{space.copy}</span><span className="mk-space-features">{space.features.join(' · ')}</span></button>)}</div>
      <div className="mk-preview-features" role="group" aria-label={`Explore ${activeSpace.label}`}>{({design:[['direction','Direction'],['build','Build'],['review','Review']],content:[['pages','Pages'],['states','States']],insight:[['analytics','Analytics'],['seo','Search'],['connections','Connections']],launch:[['launch','Launch'],['domains','Domains'],['billing','Billing'],['settings','Settings']]} as Record<string,string[][]>)[previewSpace].map(([view,label])=><button type="button" key={view} data-preview-task={view} aria-pressed={previewTask===view} onClick={()=>openPreviewTask(view)}>{label}</button>)}<span>Explore in any order.</span></div>
      <div className="mk-preview-shell"><div className="mk-preview-top"><span>{activeSpace.label} · Interactive preview</span><span>Example data · <Link href={`/preview?space=${previewSpace}&view=${previewTask}`}>Open this space ↗</Link></span></div>{previewSpaces.filter(space=>visitedSpaces.includes(space.id)).map(space=><iframe key={space.id} ref={element=>{portalFrames.current[space.id]=element;}} hidden={previewSpace!==space.id} id={`marketing-portal-${space.id}`} className="mk-portal-frame" src={`/portal-preview/index.html?space=${space.id}&view=${space.view}&embed=1`} title={`${space.label}: interactive Fourthform portal preview`} loading="lazy" onLoad={()=>portalFrames.current[space.id]?.contentWindow?.postMessage({type:'fourthform:preview-view',view:previewViews[space.id]},location.origin)}/>)}</div>
      <div className="mk-preview-caption"><p>Try an edit, follow your curiosity and return when you like. Edits stay on this device. Sending, payments and launch are simulated.</p><Link className="mk-text-link" href={`/preview?view=${previewTask}&from=${previewSpace}`}>Explore a separate complete workspace ↗</Link></div>
    </div></section>

    <section className="mk-states" id="states"><div className="mk-states-pin"><div className="mk-container mk-states-grid">
      <div className="mk-states-copy"><span className="mk-kicker">States · Optional with Pro</span><h2 className="mk-display">Same design.<br/><em>Different moment.</em></h2><p className="mk-body">Welcome visitors differently when evening service begins. States are scheduled versions of selected website content. Choose the days and times; your usual content returns when the moment passes.</p><p className="mk-state-note">Included with Pro at A$39 / month.</p><Link className="mk-text-link mk-state-action" href="/preview?space=content&view=states">Try a scheduled State ↗</Link><div className="mk-state-label"><span>Usual content</span><span>Evening service</span></div></div>
      <div className="mk-state-object"><iframe tabIndex={-1} className="mk-state-frame mk-state-monday" title="Mori House with usual content" sandbox="allow-same-origin" srcDoc={usual}/><iframe tabIndex={-1} className="mk-state-frame mk-state-saturday" title="Mori House with an Evening service State" sandbox="allow-same-origin" srcDoc={evening}/></div>
    </div></div></section>

    <section className="mk-pricing" id="pricing"><div className="mk-container">
      <div className="mk-pricing-head"><h2 className="mk-display">A clear scope.<br/><em>A$1,500.</em></h2><p className="mk-body">Fourthform Site includes design, build and three revision rounds. A$200 starts the project. The A$1,300 balance is due when you approve the website for launch.</p></div>
      <div className="mk-price-line"><span>Fourthform Site</span><strong>A$1,500 <small>once</small></strong><div><p>Up to 5 custom pages, responsive design, forms, search setup, analytics and your client portal.</p><ul className="mk-scope-list"><li>3 revision rounds, with any number of Directions</li><li>Core, your everyday website tools, included after launch</li><li>Initial Direction uses no revision round</li></ul><a className="mk-button mk-button-dark mk-price-action" href={startHref()}>{connectedPortal ? "Start with Site ↗" : "Try the Site brief ↗"}</a></div></div>
      <div className="mk-price-secondary"><div><span>Core</span><strong>Included</strong><p>Your everyday portal toolkit: content updates, basic analytics, search details and domain management.</p></div><div><span>Pro</span><strong>A$39 / month</strong><p>An optional upgrade for scheduled content variations, 90-day analytics, comparisons and search insights.</p></div></div>
      <div className="mk-first"><span>Fourthform First</span><p>For businesses opened within the last six months. One page, around 6 to 7 sections and one revision round. Core included. <a className="mk-text-link" href={startHref({package:"first"})}>{connectedPortal ? "Start with First ↗" : "Try the First brief ↗"}</a></p><strong>A$199</strong></div>
      <div className="mk-scope-boundary"><p>Site and First are website build packages. Core and Pro are the tools you use after launch. Choose your build first; Pro is optional.</p><Link href="/contact">Discuss scope, content, timing and support before you begin ↗</Link></div>
      <p className="mk-pricing-note">All prices are in Australian dollars. Domain registration stays with your chosen provider. Additional revision rounds are A$150 each.</p>
    </div></section>

    <section className="mk-final"><div className="mk-container mk-final-grid"><h2 className="mk-display">Your business.<br/><em>In its own form.</em></h2><div><p className="mk-body">Start with a short brief. Tell us what you do, who the website is for and what you want people to do next.</p><a className="mk-button mk-button-dark" href={startHref()}>{startLabel}</a><p className="mk-start-note">{connectedPortal?"Create your account, save your brief and start when you are ready.":"Try the brief in this preview. No account or payment is required."}</p></div></div></section>
    <section className="mk-faq" id="questions"><div className="mk-container mk-faq-grid"><div><span className="mk-kicker">Before you begin</span><h2 className="mk-display">A few things,<br/><em>made clear.</em></h2></div><div className="mk-faq-list">
      <details><summary>What does Fourthform do?<span aria-hidden="true">+</span></summary><p>We design and build a custom website for your business. You share the brief, review the working website and approve it for launch through your client portal. After launch, Core helps you keep everyday content up to date.</p></details>
      <details><summary>What is a Direction?<span aria-hidden="true">+</span></summary><p>A Direction is your input for the website. Initial Direction brings together your brief and references. During Review, a Direction describes a change to a specific word, image or part of the page. You can write, upload, link or draw to explain it.</p></details>
      <details><summary>How do revision rounds work?<span aria-hidden="true">+</span></summary><p>Collect everything you want changed, then submit those Directions together as one round. Site includes three rounds. First includes one. Saving drafts and sending your Initial Direction use no revision round. Additional rounds are A$150 each.</p></details>
      <details><summary>What is the difference between Site and First?<span aria-hidden="true">+</span></summary><p>Site is A$1,500 for up to 5 custom pages, with A$200 to start and A$1,300 on approval. First is A$199 for one page with around 6 to 7 sections, for businesses opened within the last six months. Both include Core after launch.</p></details>
      <details><summary>What are Core and Pro?<span aria-hidden="true">+</span></summary><p>Core is the included toolkit for content updates, basic analytics, search details and domain management. Pro is optional at A$39 / month for scheduled States, deeper analytics and search insights. You can explore the Pro concept in the preview.</p></details>
      <details><summary>What should we agree before the build?<span aria-hidden="true">+</span></summary><p>Confirm the page and feature list, the words and images you will supply, the delivery schedule, hosting arrangements, ownership and support. Online shops, custom software and third-party booking systems need a separate scope. <Link href="/contact">Discuss your requirements</Link> before starting.</p></details>
      <details><summary>What can I try in the preview?<span aria-hidden="true">+</span></summary><p>Choose from four focused spaces for design, content, audience insights and launch. Explore in any order or open the complete workspace. Add feedback, update content and try the analytics and launch journey. Drafts stay on this device and can be exported from Settings. Accounts, team submissions, payments and publishing are simulated, so you can explore without signing up or entering card details.</p></details>
    </div></div></section>
    <section className="mk-practice"><div className="mk-container"><span className="mk-kicker">The practice behind the work</span><h2 className="mk-display">Independent thinking.<br/><em>A considered result.</em></h2><div><p>Fourthform is a Brisbane web design practice for independent businesses. The studio concepts show our approach to visual identity, clear content and useful interactions.</p><p>Your project begins with your business, your audience and a scope we agree together.</p><Link className="mk-text-link" href="/contact">Discuss your website ↗</Link></div></div></section>
    <footer className="mk-footer"><div className="mk-container"><b>fourthform</b><span>Websites, brought into form.</span><div className="mk-footer-links"><Link href="/work">Work</Link><Link href="/contact">Contact</Link><a href="#pricing">Pricing</a><a href="#questions">Questions</a><Link href="/preview">Try the portal ↗</Link></div><span>Brisbane, Australia</span></div></footer>
  </main>
}
