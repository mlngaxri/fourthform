"use client";
import type { PointerEvent } from "react";
import type { PortfolioProject } from "../../lib/portfolio/projects";

export default function ProjectCard({project, number, onOpen, wide=false, priority=false}: {project:PortfolioProject;number:number;onOpen:(project:PortfolioProject)=>void;wide?:boolean;priority?:boolean}) {
  function move(event:PointerEvent<HTMLButtonElement>) {
    if(event.pointerType!=="mouse"||matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    const box=event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--work-x",`${((event.clientX-box.left)/box.width-.5)*5}deg`);
    event.currentTarget.style.setProperty("--work-y",`${-((event.clientY-box.top)/box.height-.5)*5}deg`);
  }
  function reset(event:PointerEvent<HTMLButtonElement>) {event.currentTarget.style.setProperty("--work-x","0deg");event.currentTarget.style.setProperty("--work-y","0deg");}
  return <article className={`portfolio-card${wide?" portfolio-card-wide":""}`} data-project={project.id}>
    <button type="button" className="portfolio-card-open" onClick={()=>onOpen(project)} aria-haspopup="dialog" aria-label={`Explore ${project.title}`} onPointerMove={move} onPointerLeave={reset}>
      <span className="portfolio-card-media"><img src={project.image} srcSet={`${project.thumbnail} ${project.thumbnailWidth}w, ${project.image} ${project.width}w`} sizes={wide?"(max-width:760px) 94vw, 90vw":"(max-width:760px) 94vw, 46vw"} alt={`${project.title} website design preview`} width={project.width} height={project.height} loading={priority?"eager":"lazy"} fetchPriority={priority?"high":"auto"}/><span className="portfolio-card-reveal"><span>Explore design</span><span aria-hidden="true">↗</span></span><span className="work-motion-label">Live concept <span aria-hidden="true">↗</span></span></span>
      <span className="portfolio-card-info"><span className="portfolio-card-number">{String(number).padStart(2,"0")}</span><span><strong>{project.title}</strong><span className="portfolio-card-sector">{project.sector} · {project.group}</span></span><span className="portfolio-card-arrow" aria-hidden="true">↗</span></span>
    </button>
  </article>;
}
