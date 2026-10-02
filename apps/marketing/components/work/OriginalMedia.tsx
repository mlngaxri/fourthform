"use client";
import {useEffect, useRef, useState} from "react";
import type {PortfolioProject} from "../../lib/portfolio/projects";

export default function OriginalMedia({project,motion=false,priority=false,className=""}:{project:PortfolioProject;motion?:boolean;priority?:boolean;className?:string}) {
  const video=useRef<HTMLVideoElement>(null);
  const [paused,setPaused]=useState(false),[playing,setPlaying]=useState(false);
  function toggle(){if(playing){setPaused(true);video.current?.pause();}else{setPaused(false);void video.current?.play().catch(()=>setPlaying(false));}}
  useEffect(() => {
    const node=video.current;
    if(!node||!motion)return;
    const preference=matchMedia("(prefers-reduced-motion: reduce)");
    let visible=false;
    const sync=()=>{if(visible&&!preference.matches&&!paused&&document.visibilityState==="visible") void node.play().catch(()=>setPlaying(false));else node.pause();};
    const observer=new IntersectionObserver(entries=>{visible=entries.some(entry=>entry.isIntersecting);sync();},{threshold:.15});
    observer.observe(node);
    preference.addEventListener("change",sync);
    document.addEventListener("visibilitychange",sync);
    return()=>{observer.disconnect();preference.removeEventListener("change",sync);document.removeEventListener("visibilitychange",sync);node.pause();};
  },[project.id,motion,paused]);
  return <div className={`original-media ${className}`}>
    <img className="mk-hero-design-image" src={project.image} width={project.width} height={project.height} alt={`${project.title}, original website design`} loading={priority?"eager":"lazy"} fetchPriority={priority?"high":"auto"}/>
    {project.video&&motion&&<><video ref={video} src={project.video} poster={project.image} muted loop playsInline preload="none" aria-label={`${project.title} original motion preview`} onPlaying={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onError={()=>setPlaying(false)} data-playing={playing||paused}/><button className="original-motion-toggle" type="button" aria-label={playing?"Pause design animation":"Play design animation"} aria-pressed={paused} onClick={toggle}>{playing?"Pause":"Play"}<span aria-hidden="true"> {playing?"Ⅱ":"▷"}</span></button></>}
  </div>;
}
