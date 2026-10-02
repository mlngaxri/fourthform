"use client";
import {startHref, startLabel} from "../../lib/customer-flow";
import Link from "next/link";
import {useEffect,useRef,useState} from "react";
import {DESIGN_FILTERS, projects, findProject, type PortfolioProject} from "../../lib/portfolio/projects";
import ProjectCard from "./ProjectCard";
import ProjectDialog from "./ProjectDialog";

export default function WorkGallery() {
  const [filter,setFilter]=useState<typeof DESIGN_FILTERS[number]>("All work");
  const [sector,setSector]=useState("All sectors");
  const sectors=[...new Set(projects.map(project=>project.sector))].sort();
  const modalEntry=useRef(false);
  const [selected,setSelected]=useState<PortfolioProject|null>(null);
  const visible=projects.filter(project=>(filter==="All work"||project.group===filter)&&(sector==="All sectors"||project.sector===sector));
  const activeIndex=visible.findIndex(project=>project.id===selected?.id);
  useEffect(()=>{const sync=()=>{const query=new URLSearchParams(location.search),requested=query.get("filter"),requestedSector=query.get("sector"),project=findProject(query.get("project"));setFilter(DESIGN_FILTERS.includes(requested as typeof filter)?requested as typeof filter:"All work");setSector(sectors.includes(requestedSector||"")?requestedSector!:"All sectors");setSelected(project??null);if(project && ((requested && requested!=="All work" && project.group!==requested)||(requestedSector && requestedSector!=="All sectors" && project.sector!==requestedSector))){setFilter("All work");setSector("All sectors");}if(!project&&typeof history.state?.workScrollY==="number")requestAnimationFrame(()=>scrollTo({top:history.state.workScrollY,behavior:"instant"}));};sync();addEventListener("popstate",sync);return()=>removeEventListener("popstate",sync);},[]);
  function updateFilters(nextFilter:typeof filter,nextSector:string){setFilter(nextFilter);setSector(nextSector);const url=new URL(location.href);if(nextFilter==="All work")url.searchParams.delete("filter");else url.searchParams.set("filter",nextFilter);if(nextSector==="All sectors")url.searchParams.delete("sector");else url.searchParams.set("sector",nextSector);url.searchParams.delete("project");history.replaceState(history.state,"",url);}
  function open(project:PortfolioProject|null){
    const url=new URL(location.href);
    if(project){url.searchParams.set("project",project.id);if(!selected){const top=scrollY;history.replaceState({...history.state,workScrollY:top},"",location.href);history.pushState({...history.state,fourthformProject:true,workScrollY:top},"",url);modalEntry.current=true;}else history.replaceState(history.state,"",url);setSelected(project);}
    else if(modalEntry.current&&history.state?.fourthformProject){modalEntry.current=false;history.back();}
    else {url.searchParams.delete("project");history.replaceState(history.state,"",url);setSelected(null);}
  }
  function navigate(delta:number){open(visible[(activeIndex+delta+visible.length)%visible.length]);}
  return <main className="mk-site work-site" id="top"><a className="skip-link" href="#work-collection">Skip to designs</a>
    <nav className="mk-nav work-nav" aria-label="Primary navigation"><Link className="mk-wordmark" href="/"><span className="ff-mark" aria-hidden="true"/>fourthform</Link><div className="mk-nav-links"><Link href="/work" aria-current="page">Work</Link><Link href="/#process">Process</Link><Link href="/#portal">Portal</Link><Link href="/#pricing">Pricing</Link></div><Link className="mk-button mk-button-dark" href={startHref()}>{startLabel}</Link></nav>
    <header className="work-intro mk-container"><div className="work-intro-eyebrow"><span className="mk-kicker">Fourthform · Selected website designs</span><span>20 studies. Many possibilities.</span></div><h1>Forms of<br/><em>possibility.</em><span className="work-intro-star ff-mark" aria-hidden="true"/></h1><div className="work-intro-bottom"><p>From quiet confidence<br/>to a world of its own.</p><div><p>Twenty website concepts, designed by Fourthform. Explore the visual ideas, find a feeling you like and bring it into your website brief.</p><a href="#work-collection">Explore the collection <span aria-hidden="true">↓</span></a></div></div></header>
    <section className="work-collection mk-container" id="work-collection" aria-label="Portfolio designs"><div className="work-filter-bar"><div className="work-filters" role="group" aria-label="Filter designs">{DESIGN_FILTERS.map(name=><button type="button" key={name} onClick={()=>updateFilters(name,sector)} aria-pressed={filter===name}>{name}<sup>{name==="All work"?projects.length:projects.filter(project=>project.group===name).length}</sup></button>)}</div><label className="work-sector-filter">Business type<select value={sector} onChange={e=>updateFilters(filter,e.target.value)}><option>All sectors</option>{sectors.map(name=><option key={name}>{name}</option>)}</select></label><span className="work-result-count" role="status" aria-live="polite">{String(visible.length).padStart(2,"0")} designs</span></div>
      {!visible.length&&<p className="work-no-results" role="status">No designs match these filters. <button type="button" onClick={()=>updateFilters("All work","All sectors")}>Show all 20 designs</button></p>}
      <div className="work-grid" data-filter={filter}>{visible.map((project,i)=><ProjectCard key={project.id} project={project} number={projects.indexOf(project)+1} onOpen={open} wide={filter==="All work"&&[0,7,14].includes(i)} priority={i===0}/>)}</div>
      <div className="work-collection-note"><span className="mk-kicker">A starting point, shaped around you</span><p>These are design studies and website previews. Your Fourthform website starts with your own business, words, images and a clear goal for your visitors.</p><Link href={startHref()}>Bring your own brief ↗</Link></div>
    </section>
    <section className="work-end"><div className="mk-container"><span className="mk-kicker">Found your direction?</span><h2>A feeling you like.<br/><em>A website of your own.</em></h2><div><p>Open any design and add it to your brief. We’ll use it to understand the atmosphere, detail and character you’re drawn to.</p><Link className="mk-button mk-button-dark" href={startHref()}>Start your website brief ↗</Link><Link className="work-end-secondary" href="/#pricing">See the scope and pricing</Link></div></div></section>
    <footer className="mk-footer"><div className="mk-container"><Link href="/" className="mk-wordmark">fourthform</Link><span>Websites, brought into form.</span><div className="mk-footer-links"><Link href="/#pricing">Pricing</Link><Link href="/#questions">Questions</Link><Link href="/preview">Try the portal ↗</Link></div><span>Brisbane, Australia</span></div></footer>
    <ProjectDialog project={selected} position={activeIndex} total={visible.length} onClose={()=>open(null)} onNavigate={navigate}/>
  </main>;
}
