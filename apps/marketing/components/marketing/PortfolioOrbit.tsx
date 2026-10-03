"use client";

import {useEffect, useRef, useState} from "react";
import {projects} from "../../lib/portfolio/projects";

const selection = ["monolith-hero", "playful-idea", "oyla", "keel", "nature-ritual", "golden-portal", "digital-epoch-hero", "orla-fashion"].map(id => projects.find(project => project.id === id)!);
const spacing = Math.PI * 2 / selection.length;
const duration = 80_000;
const samples = 96;

function position(index: number, angle: number) {
  const phase = index * spacing + angle;
  const depth = (Math.cos(phase) + 1) / 2;
  return {
    left: `${50 + Math.sin(phase) * 38}%`,
    top: `${50 - Math.cos(phase) * 42}%`,
    transform: `translate(-50%, -50%) perspective(900px) rotateX(${Math.sin(phase) * 9}deg) rotateY(${Math.sin(phase) * -19}deg) rotate(${Math.sin(phase * 2) * 13}deg) scale(${.74 + depth * .26})`,
    zIndex: Math.round(depth * 4) + 1,
  };
}

export default function PortfolioOrbit() {
  const stage = useRef<HTMLDivElement>(null);
  const players = useRef<Animation[]>([]);
  const pausedRef = useRef(false);
  const refresh = useRef<() => void>(() => {});
  const [paused, setPaused] = useState(false);
  const [automatic, setAutomatic] = useState(false);

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const hero = element.closest<HTMLElement>(".mk-orbit-hero");
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = matchMedia("(min-width: 900px)");
    const cards = Array.from(element.querySelectorAll<HTMLDivElement>(".orbit-card"));
    let visible = true;

    // Native animation time keeps moving without a JavaScript frame loop.
    // All cards share one start time so their spacing remains constant.
    players.current = cards.map((card, index) => card.animate(
      Array.from({length: samples + 1}, (_, sample) => ({
        ...position(index, spacing / 2 + sample / samples * Math.PI * 2),
        offset: sample / samples,
      })),
      {duration, iterations: Infinity, easing: "linear", fill: "both"},
    ));
    const start = document.timeline.currentTime;
    if (typeof start === "number") players.current.forEach(player => { player.startTime = start; });

    function sync() {
      setAutomatic(desktop.matches);
      const running = desktop.matches && visible && document.visibilityState === "visible" && !pausedRef.current;
      players.current.forEach(player => {
        if (running && player.playState !== "running") player.play();
        else if (!running && player.playState !== "paused") player.pause();
      });
      if (hero) hero.dataset.orbitRunning = String(running);
    }
    function motionPreference() {
      pausedRef.current = preference.matches;
      setPaused(preference.matches);
      sync();
    }
    refresh.current = sync;
    const observer = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      sync();
    });
    observer.observe(element);
    preference.addEventListener("change", motionPreference);
    desktop.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    motionPreference();
    return () => {
      observer.disconnect();
      players.current.forEach(player => player.cancel());
      players.current = [];
      preference.removeEventListener("change", motionPreference);
      desktop.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      refresh.current = () => {};
      if (hero) delete hero.dataset.orbitRunning;
    };
  }, []);

  function toggle() {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
    refresh.current();
  }
  return <>
    <div className="orbit-depth" aria-hidden="true"><div className="orbit-depth-glow"/><div className="orbit-depth-floor"/><div className="orbit-depth-horizon"/></div>
    <div ref={stage} className="mk-orbit" aria-hidden="true">
      {selection.map((project, index) => <div key={project.id} className="orbit-card" style={position(index, spacing / 2)}>
        <img src={project.thumbnail} width={560} height={Math.round(560 * project.height / project.width)} alt="" loading={index < 4 ? "eager" : "lazy"} fetchPriority={index === 0 ? "high" : "auto"}/>
      </div>)}
    </div>
    {automatic && <div className="mk-orbit-controls"><button className="mk-orbit-pause" type="button" onClick={toggle} aria-pressed={paused} aria-label={paused ? "Play motion" : "Pause motion"}><span className={paused ? "orbit-play-icon" : "orbit-pause-icon"} aria-hidden="true"/>{paused ? "Play" : "Pause"}</button></div>}
  </>;
}
