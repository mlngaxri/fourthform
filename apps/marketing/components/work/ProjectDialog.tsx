"use client";
import {startHref} from "../../lib/customer-flow";
import Link from "next/link";
import {useEffect,useRef,useState} from "react";
import type {PortfolioProject} from "../../lib/portfolio/projects";

export default function ProjectDialog({project,onClose,onNavigate,position,total}:{project:PortfolioProject|null;onClose:()=>void;onNavigate:(delta:number)=>void;position:number;total:number}){
  const ref=useRef<HTMLDialogElement>(null),media=useRef<HTMLDivElement>(null),video=useRef<HTMLVideoElement>(null);
  const [pane,setPane]=useState("website"),[preview,setPreview]=useState("original"),[autoplay,setAutoplay]=useState(false),[unavailable,setUnavailable]=useState(false),open=!!project;
  useEffect(()=>{
    const dialog=ref.current;if(!dialog)return;if(!open){if(dialog.open)dialog.close();return;}
    const previous=document.documentElement.style.overflow;document.documentElement.style.overflow="hidden";if(!dialog.open)dialog.showModal();
    return()=>{document.documentElement.style.overflow=previous;if(dialog.open)dialog.close();};
  },[open]);
  useEffect(()=>{
    setPreview("original");setPane("website");setUnavailable(false);media.current?.scrollTo({top:0});
    const preference=matchMedia("(prefers-reduced-motion: reduce)");const sync=()=>setAutoplay(!preference.matches);sync();preference.addEventListener("change",sync);
    return()=>preference.removeEventListener("change",sync);
  },[project?.id]);
  useEffect(()=>{if(pane==="website"&&(autoplay||preview==="motion"))void video.current?.play().catch(()=>{});else video.current?.pause();},[preview,project?.id,autoplay,pane]);
  useEffect(()=>{let resume=false;const sync=()=>{const node=video.current;if(document.visibilityState!=="visible"){resume=!!node&&!node.paused;node?.pause();}else if(resume&&pane==="website"&&(autoplay||preview==="motion")){resume=false;void node?.play().catch(()=>{});}};document.addEventListener("visibilitychange",sync);return()=>document.removeEventListener("visibilitychange",sync);},[pane,autoplay,preview,project?.id]);
  const live=!!project?.originalSite&&preview==="original";
  const recording=!!project?.video&&preview!=="image"&&!live&&!unavailable;
  const animation=!!project?.motionImage&&preview!=="image"&&(autoplay||preview==="motion")&&!unavailable;
  return <dialog ref={ref} className="work-dialog work-original-dialog" aria-labelledby="work-dialog-title" aria-describedby="work-dialog-description" onCancel={event=>{event.preventDefault();onClose();}} onClick={event=>{if(event.target===event.currentTarget)onClose();}} onKeyDown={event=>{if((event.target as Element).closest("iframe,video,input,textarea,select,[contenteditable=true]"))return;if(event.key==="ArrowRight"||event.key==="ArrowLeft"){event.preventDefault();onNavigate(event.key==="ArrowRight"?1:-1);}}}>
    {project&&<div className="work-dialog-layout">
      <header className="work-dialog-top"><span>Design study · {String(position+1).padStart(2,"0")} / {String(total).padStart(2,"0")}</span><button type="button" onClick={onClose} autoFocus aria-label="Close design preview">Close <span aria-hidden="true">×</span></button></header>
      <div className="work-dialog-tabs" role="group" aria-label="Design preview view"><button type="button" aria-pressed={pane==="website"} onClick={()=>setPane("website")}>Preview</button><button type="button" aria-pressed={pane==="about"} onClick={()=>setPane("about")}>About this design</button></div>
      <div data-pane={pane} className="work-dialog-media" ref={media}>
        {live?<iframe key={project.id} src={project.originalSite} title={`${project.title} original website`} allow="autoplay; fullscreen" sandbox="allow-scripts allow-same-origin" referrerPolicy="no-referrer"/>:recording?<video ref={video} key={project.id} src={project.video} poster={project.image} controls autoPlay={autoplay||preview==="motion"} muted loop playsInline preload="metadata" aria-label={`${project.title} original recording`} onError={()=>setUnavailable(true)}/>:<img src={animation?project.motionImage:project.image} width={project.width} height={project.height} alt={`${project.title}, original website design`} onError={()=>{if(animation)setUnavailable(true);}}/>}
        {unavailable&&preview!=="image"&&<p className="work-recording-unavailable" role="status">Motion preview is unavailable. The original image is shown.</p>}
      </div>
      <div data-pane={pane} className="work-dialog-copy"><span className="mk-kicker">{project.sector}</span><h2 id="work-dialog-title">{project.title}</h2><p className="work-dialog-line">{project.line}</p><p id="work-dialog-description">{project.description}</p><span className="work-preview-label">{project.originalSite?'Interactive original':project.video||project.motionImage?'Original motion recording':'Original full-page image'}</span><div className="work-dialog-techniques"><ul>{project.techniques.map(technique=><li key={technique}>{technique}</li>)}</ul></div>
        {(project.originalSite||project.video||project.motionImage)&&<button type="button" className="work-play" onClick={()=>{setPreview(value=>value==="image"?"original":"image");setPane("website");}}>{preview==="image"?project.originalSite?'Show original website':'Show original recording':'Show original image'}<span aria-hidden="true">↗</span></button>}
        {(project.video||project.motionImage)&&!unavailable&&<button type="button" className="work-play" onClick={()=>{setPreview("motion");setPane("website");void video.current?.play().catch(()=>{});}}>Watch original recording<span aria-hidden="true">↗</span></button>}
        <a className="work-source work-explore" href={`/work/${project.id}`} target="_blank" rel="noopener noreferrer">{project.originalSite?'Explore original website':project.video||project.motionImage?'Watch original preview':'View original design'} ↗</a>
        <a className="work-source" href={`/work/${project.id}?view=original`} target="_blank" rel="noopener noreferrer">View the original image at full size ↗</a>
        <p className="work-dialog-disclosure">{project.originalSite?'Original artwork, layout and interactions, restored from the supplied source.':project.video||project.motionImage?'The original design in motion. Interactive source is not available for this design yet.':'The original full-page design. A motion preview is not available for this study.'}</p>
      </div>
      <footer className="work-dialog-bottom"><button type="button" onClick={()=>onNavigate(-1)} aria-label="Previous design">←<span className="work-navigation-label"> Previous</span></button><span className="work-keyboard-hint">← → to browse · Esc to close</span><Link className="mk-button mk-button-dark work-reference" href={startHref({reference:project.id})}>Use this reference ↗</Link><button type="button" onClick={()=>onNavigate(1)} aria-label="Next design"><span className="work-navigation-label">Next </span>→</button></footer>
    </div>}
  </dialog>;
}
