"use client";
import Link from "next/link";
import {useState} from "react";
import {featuredProjects,type PortfolioProject} from "../../lib/portfolio/projects";
import ProjectCard from "./ProjectCard";
import ProjectDialog from "./ProjectDialog";
export default function FeaturedWork(){
 const [selected,setSelected]=useState<PortfolioProject|null>(null),index=featuredProjects.findIndex(project=>project.id===selected?.id);
 return <section className="mk-selected-work work-featured" id="work"><div className="mk-container"><div className="work-featured-head" data-reveal><div><span className="mk-kicker">Selected design studies</span><h2 className="mk-display">A feel for<br/><em>what’s possible.</em></h2></div><div><p>Different businesses deserve different websites. Explore the original designs and find a direction you like.</p><Link className="work-collection-link" href="/work">View all 20 designs <span aria-hidden="true">↗</span></Link></div></div><div className="work-grid work-featured-grid">{featuredProjects.map((project,i)=><ProjectCard key={project.id} project={project} number={i+1} onOpen={setSelected}/>)}</div><p className="mk-work-context">Design studies, presented in their original form.</p></div><ProjectDialog project={selected} position={index} total={featuredProjects.length} onClose={()=>setSelected(null)} onNavigate={delta=>setSelected(featuredProjects[(index+delta+featuredProjects.length)%featuredProjects.length])}/></section>;
}
