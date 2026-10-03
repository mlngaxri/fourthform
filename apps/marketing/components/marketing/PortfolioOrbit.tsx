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
  const enableMotion = useRef<() => void>(() => {});
  const [showStart, setShowStart] = useState(false);

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const hero = element.closest<HTMLElement>(".mk-orbit-hero");
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = matchMedia("(min-width: 900px)");
    const cards = Array.from(element.querySelectorAll<HTMLDivElement>(".orbit-card"));
    let visible = true;
    let optedIn = false;
    try { optedIn = localStorage.getItem("fourthform.orbit-motion") === "enabled"; } catch { /* The current visit still works without storage. */ }


    // Native animation time keeps moving without a JavaScript frame loop.
    // All cards share one start time so their spacing remains constant.
    const players = cards.map((card, index) => card.animate(
      Array.from({length: samples + 1}, (_, sample) => ({
        ...position(index, spacing / 2 + sample / samples * Math.PI * 2),
        offset: sample / samples,
      })),
      {duration, iterations: Infinity, easing: "linear", fill: "both"},
    ));
    const start = document.timeline.currentTime;
    if (typeof start === "number") players.forEach(player => { player.startTime = start; });

    function sync() {
      const running = desktop.matches && visible && document.visibilityState === "visible" && (!preference.matches || optedIn);
      const heldTime = Number(players[0]?.currentTime ?? 0);
      players.forEach(player => {
        if (running && player.playState !== "running") player.play();
        else if (!running && player.playState !== "paused") { player.pause(); player.currentTime = heldTime; }
      });
      setShowStart(desktop.matches && preference.matches && !optedIn);
      if (hero) {
        hero.dataset.orbitRunning = String(running);
        hero.dataset.motionChoice = optedIn ? "enabled" : "system";
      }
    }
    enableMotion.current = () => {
      optedIn = true;
      try { localStorage.setItem("fourthform.orbit-motion", "enabled"); } catch { /* Apply the explicit choice for this visit. */ }
      sync();
    };
    const observer = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      sync();
    });
    observer.observe(element);
    preference.addEventListener("change", sync);
    desktop.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      enableMotion.current = () => {};
      observer.disconnect();
      players.forEach(player => player.cancel());
      preference.removeEventListener("change", sync);
      desktop.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      if (hero) { delete hero.dataset.orbitRunning; delete hero.dataset.motionChoice; }
    };
  }, []);

  return <>
    <div className="orbit-depth" aria-hidden="true"><div className="orbit-depth-glow"/><div className="orbit-depth-floor"/><div className="orbit-depth-horizon"/></div>
    <div ref={stage} className="mk-orbit" aria-hidden="true">
      {selection.map((project, index) => <div key={project.id} className="orbit-card" style={position(index, spacing / 2)}>
        <img src={project.thumbnail} width={560} height={Math.round(560 * project.height / project.width)} alt="" loading={index < 4 ? "eager" : "lazy"} fetchPriority={index === 0 ? "high" : "auto"}/>
      </div>)}
    </div>
    {showStart && <div className="orbit-motion-start"><button type="button" onClick={() => enableMotion.current()}>Start animation <span aria-hidden="true">↗</span></button><span>Your device has reduced motion enabled.</span></div>}
  </>;
}
