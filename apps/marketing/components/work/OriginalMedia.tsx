"use client";
import {useEffect,useRef,useState} from "react";
import type {PortfolioProject} from "../../lib/portfolio/projects";
function isVisible(frame:HTMLElement){const box=frame.getBoundingClientRect();return box.width>0&&box.height>0&&box.bottom>0&&box.top<innerHeight&&box.right>0&&box.left<innerWidth;}
export default function OriginalMedia({project,motion=false,priority=false,className=""}:{project:PortfolioProject;motion?:boolean;priority?:boolean;className?:string}) {
  const wrapper=useRef<HTMLDivElement>(null),video=useRef<HTMLVideoElement>(null),manualPlay=useRef(false),pausedRef=useRef(false),failed=useRef(false);
  const synchronize=useRef<((refreshVisibility?:boolean)=>void)|null>(null);
  const [paused,setPaused]=useState(false),[playing,setPlaying]=useState(false),[unavailable,setUnavailable]=useState(false);
  function toggle(){
    if(playing||(video.current&&!video.current.paused)){manualPlay.current=false;pausedRef.current=true;setPaused(true);setPlaying(false);video.current?.pause();}
    else{
      manualPlay.current=true;pausedRef.current=false;setPaused(false);
      if(synchronize.current)synchronize.current(true);
      else if(wrapper.current&&isVisible(wrapper.current)&&document.visibilityState==="visible"){if(project.motionImage)setPlaying(true);else void video.current?.play().catch(()=>setPlaying(false));}
    }
  }
  function markUnavailable(){
    failed.current=true;setPlaying(false);setUnavailable(true);synchronize.current?.();
  }
  useEffect(()=>{
    const node=video.current,frame=wrapper.current;if(!frame||!motion||(!node&&!project.motionImage))return;
    const preference=matchMedia("(prefers-reduced-motion: reduce)");let visible=isVisible(frame),disposed=false;
    const sync=(refreshVisibility=false)=>{
      if(refreshVisibility)visible=isVisible(frame);
      const active=visible&&!failed.current&&(!preference.matches||manualPlay.current)&&!pausedRef.current&&document.visibilityState==="visible";
      if(node){if(active)void node.play().catch(()=>{if(!disposed&&node.paused)setPlaying(false);});else node.pause();}else setPlaying(active);
    };
    synchronize.current=sync;
    const observeVisibility=()=>sync(true),preferenceChanged=()=>sync();
    const observer=new IntersectionObserver(observeVisibility,{threshold:0});observer.observe(frame);
    preference.addEventListener("change",preferenceChanged);document.addEventListener("visibilitychange",observeVisibility);sync();
    return()=>{disposed=true;observer.disconnect();preference.removeEventListener("change",preferenceChanged);document.removeEventListener("visibilitychange",observeVisibility);if(synchronize.current===sync)synchronize.current=null;node?.pause();};
  },[project.id,project.video,project.motionImage,motion]);
  return <div ref={wrapper} className={`original-media ${className}`}>
    <img className="mk-hero-design-image" src={project.image} width={project.width} height={project.height} alt={`${project.title}, original website design`} loading={priority?"eager":"lazy"} fetchPriority={priority?"high":"auto"}/>
    {project.video&&motion&&<video ref={video} src={project.video} poster={project.image} muted loop playsInline preload="none" aria-label={`${project.title} original motion preview`} onPlaying={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onError={markUnavailable} data-playing={playing||paused}/>}
    {project.motionImage&&motion&&playing&&!unavailable&&<img className="original-motion-image" src={project.motionImage} alt={`${project.title} original motion preview`} onError={markUnavailable}/>}
    {motion&&(project.video||project.motionImage)&&!unavailable&&<button className="original-motion-toggle" type="button" aria-label={playing?"Pause original recording":"Play original recording"} onClick={toggle}>{playing?"Pause":"Play"}<span aria-hidden="true"> {playing?"Ⅱ":"▷"}</span></button>}
    {unavailable&&<p className="original-media-fallback" role="status">Motion preview is unavailable. The original image is shown.</p>}
  </div>;
}
