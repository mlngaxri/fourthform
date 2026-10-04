"use client";
import {useEffect,useRef,useState} from "react";
import type {PortfolioProject} from "../../lib/portfolio/projects";
export default function OriginalMedia({project,motion=false,priority=false,className=""}:{project:PortfolioProject;motion?:boolean;priority?:boolean;className?:string}) {
  const wrapper=useRef<HTMLDivElement>(null),video=useRef<HTMLVideoElement>(null),manualPlay=useRef(false);
  const [paused,setPaused]=useState(false),[playing,setPlaying]=useState(false),[unavailable,setUnavailable]=useState(false);
  function toggle(){
    if(playing){manualPlay.current=false;setPaused(true);setPlaying(false);video.current?.pause();}
    else{manualPlay.current=true;setPaused(false);if(project.motionImage)setPlaying(true);else void video.current?.play().catch(()=>setPlaying(false));}
  }
  useEffect(()=>{
    const node=video.current,frame=wrapper.current;if(!frame||!motion||unavailable||(!node&&!project.motionImage))return;
    const preference=matchMedia("(prefers-reduced-motion: reduce)");let visible=false;
    const sync=()=>{const active=visible&&(!preference.matches||manualPlay.current)&&!paused&&document.visibilityState==="visible";if(node){if(active)void node.play().catch(()=>setPlaying(false));else node.pause();}else setPlaying(active);};
    const observer=new IntersectionObserver(entries=>{visible=entries.some(entry=>entry.isIntersecting);sync();},{threshold:.15});observer.observe(frame);
    preference.addEventListener("change",sync);document.addEventListener("visibilitychange",sync);
    return()=>{observer.disconnect();preference.removeEventListener("change",sync);document.removeEventListener("visibilitychange",sync);node?.pause();};
  },[project.id,project.motionImage,motion,paused,unavailable]);
  return <div ref={wrapper} className={`original-media ${className}`}>
    <img className="mk-hero-design-image" src={project.image} width={project.width} height={project.height} alt={`${project.title}, original website design`} loading={priority?"eager":"lazy"} fetchPriority={priority?"high":"auto"}/>
    {project.video&&motion&&<video ref={video} src={project.video} poster={project.image} muted loop playsInline preload="none" aria-label={`${project.title} original motion preview`} onPlaying={()=>{setPlaying(true);setUnavailable(false);}} onPause={()=>setPlaying(false)} onError={()=>{setPlaying(false);setUnavailable(true);}} data-playing={playing||paused}/>}
    {project.motionImage&&motion&&playing&&!unavailable&&<img className="original-motion-image" src={project.motionImage} alt={`${project.title} original motion preview`} onError={()=>{setPlaying(false);setUnavailable(true);}}/>}
    {motion&&(project.video||project.motionImage)&&!unavailable&&<button className="original-motion-toggle" type="button" aria-label={playing?"Pause original recording":"Play original recording"} aria-pressed={paused} onClick={toggle}>{playing?"Pause":"Play"}<span aria-hidden="true"> {playing?"Ⅱ":"▷"}</span></button>}
    {unavailable&&<p className="original-media-fallback" role="status">Motion preview is unavailable. The original image is shown.</p>}
  </div>;
}
