"use client";
import {startHref} from "../../lib/customer-flow";
import Link from "next/link";
import {useEffect,useRef,useState} from "react";
import {DESIGN_FILTERS, projects, findProject, type PortfolioProject} from "../../lib/portfolio/projects";
import ProjectCard from "./ProjectCard";
import NavigationHeader from "../marketing/NavigationHeader";
import ServiceFooter from "../marketing/ServiceFooter";
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
    <NavigationHeader/>
    <header className="work-intro mk-container"><div className="work-intro-eyebrow"><span className="mk-kicker">Work</span><span>20 original design studies.</span></div><h1>Selected <em>designs.</em><span className="work-intro-star ff-mark" aria-hidden="true"/></h1><div className="work-intro-bottom"><div><p>Explore the original designs. Find a direction for your website.</p></div></div></header>
    <section className="work-collection mk-container" id="work-collection" aria-label="Portfolio designs"><div className="work-filter-bar"><div className="work-filters" role="group" aria-label="Filter designs">{DESIGN_FILTERS.map(name=><button type="button" key={name} onClick={()=>updateFilters(name,sector)} aria-pressed={filter===name}>{name}<sup>{name==="All work"?projects.length:projects.filter(project=>project.group===name).length}</sup></button>)}</div><label className="work-sector-filter">Business type<select value={sector} onChange={e=>updateFilters(filter,e.target.value)}><option>All sectors</option>{sectors.map(name=><option key={name}>{name}</option>)}</select></label><span className="work-result-count" role="status" aria-live="polite">{String(visible.length).padStart(2,"0")} designs</span></div>
      {!visible.length&&<p className="work-no-results" role="status">No designs match these filters. <button type="button" onClick={()=>updateFilters("All work","All sectors")}>Show all 20 designs</button></p>}
      <div className="work-grid" data-filter={filter}>{visible.map((project,i)=><ProjectCard key={project.id} project={project} number={projects.indexOf(project)+1} onOpen={open} wide={filter==="All work"&&[0,7,14].includes(i)} priority={i===0}/>)}</div>
      <div className="work-collection-note"><span className="mk-kicker">A starting point, shaped around you</span><p>These are design studies and website previews. Your Fourthform website starts with your own business, words, images and a clear goal for your visitors.</p><Link href={startHref()}>Bring your own brief ↗</Link></div>
    </section>
    <ServiceFooter/>
    <ProjectDialog project={selected} position={activeIndex} total={visible.length} onClose={()=>open(null)} onNavigate={navigate}/>
  </main>;
}
