"use client";

import {useEffect, useRef, useState, type CSSProperties} from "react";
import Link from "next/link";
import {projects} from "../../lib/portfolio/projects";

const selection = ["monolith-hero", "playful-idea", "oyla", "keel", "nature-ritual", "golden-portal", "digital-epoch-hero", "orla-fashion"].map(id => projects.find(project => project.id === id)!);
const spacing = Math.PI * 2 / selection.length;

function position(index: number, angle: number): CSSProperties {
  const phase = index * spacing + angle;
  const depth = (Math.cos(phase) + 1) / 2;
  return {
    left: `${50 + Math.sin(phase) * 44}%`,
    top: `${50 - Math.cos(phase) * 45}%`,
    transform: `translate(-50%, -50%) perspective(900px) rotateX(${Math.sin(phase) * 9}deg) rotateY(${Math.sin(phase) * -19}deg) rotate(${Math.sin(phase * 2) * 13}deg) scale(${.74 + depth * .26})`,
    zIndex: Math.round(depth * 4) + 1,
  };
}

export default function PortfolioOrbit() {
  const stage = useRef<HTMLDivElement>(null);
  const angle = useRef(spacing / 2);
  const destination = useRef(spacing / 2);
  const pausedRef = useRef(false);
  const interacting = useRef(false);
  const refresh = useRef<() => void>(() => {});
  const [paused, setPaused] = useState(false);
  const [automatic, setAutomatic] = useState(false);

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = matchMedia("(min-width: 900px)");
    const cards = Array.from(element.querySelectorAll<HTMLAnchorElement>(".orbit-card"));
    let frame = 0, last = 0, visible = true, disposed = false;
    function paint() {
      cards.forEach((card, index) => Object.assign(card.style, position(index, angle.current)));
    }
    function moving() { return !preference.matches && desktop.matches && visible && document.visibilityState === "visible"; }
    function tick(time: number) {
      frame = 0;
      if (disposed || !moving()) return;
      const delta = last ? Math.min((time - last) / 1000, .05) : 0;
      last = time;
      if (!pausedRef.current && !interacting.current) destination.current += delta * .045;
      angle.current += (destination.current - angle.current) * (1 - Math.exp(-delta * 8));
      if (Math.abs(destination.current - angle.current) < .00001) angle.current = destination.current;
      paint();
      if ((!pausedRef.current && !interacting.current) || angle.current !== destination.current) frame = requestAnimationFrame(tick);
    }
    function sync() {
      setAutomatic(!preference.matches && desktop.matches);
      last = 0;
      if (!moving()) { cancelAnimationFrame(frame); frame = 0; angle.current = destination.current; paint(); }
      else if (!frame) frame = requestAnimationFrame(tick);
    }
    refresh.current = sync;
    const observer = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      sync();
    });
    observer.observe(element);
    preference.addEventListener("change", sync);
    desktop.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    paint(); sync();
    return () => {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect();
      preference.removeEventListener("change", sync); desktop.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync); refresh.current = () => {};
    };
  }, []);

  function toggle() { pausedRef.current = !pausedRef.current; setPaused(pausedRef.current); refresh.current(); }
  function step(direction: number) {
    pausedRef.current = true; setPaused(true);
    destination.current += direction * spacing;
    refresh.current();
  }

  return <>
    <div ref={stage} className="mk-orbit" role="group" aria-label="Selected original website designs"
      onPointerEnter={() => { interacting.current = true; }} onPointerLeave={() => { interacting.current = false; refresh.current(); }}
      onFocusCapture={() => { interacting.current = true; }} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) { interacting.current = false; refresh.current(); } }}>
      {selection.map((project, index) => <Link key={project.id} className="orbit-card" href={`/work?project=${project.id}`} style={position(index, spacing / 2)} aria-label={`Explore ${project.title}`}>
        <img src={project.thumbnail} width={560} height={Math.round(560 * project.height / project.width)} alt={`${project.title}, original website design`} loading={index < 4 ? "eager" : "lazy"} fetchPriority={index === 0 ? "high" : "auto"}/>
        <span className="orbit-card-label">{project.title}<span aria-hidden="true">↗</span></span>
      </Link>)}
    </div>
    <div className="mk-orbit-foot">
      <span>20 original design studies</span>
      <span className="mk-orbit-foot-note">A different form for every business.</span>
      <div className="mk-orbit-controls" aria-label="Portfolio motion controls">
        <button type="button" onClick={() => step(-1)} aria-label="Rotate portfolio backwards">Previous</button>
        {automatic && <button className="mk-orbit-pause" type="button" onClick={toggle} aria-pressed={paused}>{paused ? "Play motion" : "Pause motion"}</button>}
        <button type="button" onClick={() => step(1)} aria-label="Rotate portfolio forwards">Next</button>
      </div>
    </div>
  </>;
}
