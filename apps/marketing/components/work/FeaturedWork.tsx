"use client";
import Link from "next/link";
import {useState} from "react";
import {featuredProjects, type PortfolioProject} from "../../lib/portfolio/projects";
import ProjectCard from "./ProjectCard";
import ProjectDialog from "./ProjectDialog";

export default function FeaturedWork() {
  const [selected,setSelected]=useState<PortfolioProject|null>(null);
  const index=featuredProjects.findIndex(project=>project.id===selected?.id);
  return <section className="mk-selected-work work-featured" id="work"><div className="mk-container">
    <div className="work-featured-head"><div><span className="mk-kicker">Selected website designs · Fourthform studio concepts</span><h2 className="mk-display">Different businesses.<br/><em>Distinctive forms.</em></h2></div><div><p>Quiet and refined. Bold and unexpected. Explore 20 design studies to see the range, then choose what feels right for your business.</p><Link className="work-collection-link" href="/work">Explore all 20 designs <span aria-hidden="true">↗</span></Link></div></div>
    <div className="work-grid work-featured-grid">{featuredProjects.map((project,i)=><ProjectCard key={project.id} project={project} number={i+1} onOpen={setSelected}/>)}</div>
    <div className="mk-work-context work-featured-foot"><p>Your website should feel like your business. These studies are a starting point for that conversation.</p><div><span className="mk-kicker">From inspiration to a working website</span><p>See how a restaurant concept becomes a project you can review and manage.</p><Link className="mk-text-link" href="/preview">Explore Mori House in the portal ↗</Link></div></div>
  </div><ProjectDialog project={selected} position={index} total={featuredProjects.length} onClose={()=>setSelected(null)} onNavigate={delta=>setSelected(featuredProjects[(index+delta+featuredProjects.length)%featuredProjects.length])}/></section>;
}
