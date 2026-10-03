"use client";

import {useEffect, useRef} from "react";
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
    transform: `translate(-50%, -50%) perspective(900px) rotateX(${Math.sin(phase) * 6}deg) rotateY(${Math.sin(phase) * -16}deg) rotate(${Math.sin(phase * 2) * 8}deg) scale(${.74 + depth * .26})`,
    zIndex: Math.round(depth * 4) + 1,
    opacity: .88 + depth * .12,
  };
}

export default function PortfolioOrbit() {
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const hero = element.closest<HTMLElement>(".mk-orbit-hero");
    const desktop = matchMedia("(min-width: 900px)");
    const cards = Array.from(element.querySelectorAll<HTMLElement>(".orbit-card"));
    let visible = true;

    // Native animation time keeps moving without a JavaScript frame loop.
    // All cards share one start time so their spacing remains constant.
    const players = cards.map((card, index) => card.animate(
      Array.from({length: samples + 1}, (_, sample) => ({
        ...position(index, spacing / 2 + sample / samples * Math.PI * 2),
        offset: sample / samples,
      })),
      {duration, iterations: Infinity, easing: "linear", fill: "both"},
    ));
    // The photograph drifts inside its frame as the frame turns, giving the
    // circular composition a gentle sense of physical depth. Both tracks share
    // one native timeline, including when the scene leaves the viewport.
    const photographs = cards.map((card, index) => card.querySelector("img")!.animate(
      Array.from({length: samples + 1}, (_, sample) => {
        const phase = index * spacing + spacing / 2 + sample / samples * Math.PI * 2;
        return {transform: `translate3d(${Math.sin(phase) * .7}%, ${Math.cos(phase) * .7}%, 0) scale(1.035)`, offset: sample / samples};
      }),
      {duration, iterations: Infinity, easing: "linear", fill: "both"},
    ));
    const tracks = [...players, ...photographs];
    const start = document.timeline.currentTime;
    if (typeof start === "number") tracks.forEach(player => { player.startTime = start; });

    function sync() {
      const running = desktop.matches && visible && document.visibilityState === "visible";
      const heldTime = Number(players[0]?.currentTime ?? 0);
      tracks.forEach(player => {
        if (running && player.playState !== "running") player.play();
        else if (!running && player.playState !== "paused") { player.pause(); player.currentTime = heldTime; }
      });
      if (hero) {
        hero.dataset.orbitRunning = String(running);
      }
    }
    const observer = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      sync();
    });
    observer.observe(element);
    desktop.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      observer.disconnect();
      tracks.forEach(player => player.cancel());
      desktop.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      if (hero) delete hero.dataset.orbitRunning;
    };
  }, []);

  return <>
    <div className="orbit-depth" aria-hidden="true"><div className="orbit-depth-glow"/><div className="orbit-depth-floor"/><div className="orbit-depth-horizon"/></div>
    <div ref={stage} className="mk-orbit" aria-label="Explore selected website studies">
      {selection.map((project, index) => <a key={project.id} href={`/work/${project.id}`} aria-label={`Explore ${project.title} website`} className="orbit-card" style={position(index, spacing / 2)}>
        <img src={project.thumbnail} width={560} height={Math.round(560 * project.height / project.width)} alt="" loading={index < 4 ? "eager" : "lazy"} fetchPriority={index === 0 ? "high" : "auto"}/>
        <span className="orbit-card-label"><span>{project.title}</span><span aria-hidden="true">Explore ↗</span></span>
      </a>)}
    </div>
  </>;
}
