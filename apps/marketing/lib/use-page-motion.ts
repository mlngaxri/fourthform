"use client";
import {useEffect, type RefObject} from "react";

// Content starts visible. Late hydration and restored scroll positions stay safe.
export function usePageMotion(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = root.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = matchMedia("(min-width: 900px)");
    let observer: IntersectionObserver | undefined;
    const animations = new Set<Animation>();
    function animate(target: Element, delay = 0) {
      if (typeof target.animate !== "function") return;
      const animation = target.animate([{transform:"translateY(26px)",opacity:.3},{transform:"translateY(0)",opacity:1}], {duration:750,delay,easing:"cubic-bezier(.22,1,.36,1)",fill:"none"});
      animations.add(animation);
      void animation.finished.then(() => animations.delete(animation), () => animations.delete(animation));
    }
    function stop() { observer?.disconnect(); animations.forEach(animation => animation.cancel()); animations.clear(); element?.classList.remove("mk-motion"); }
    function start() {
      stop();
      if (preference.matches && !desktop.matches) return;
      element?.classList.add("mk-motion");
      element?.querySelectorAll("[data-intro]").forEach((target,index) => {const box=target.getBoundingClientRect();if(box.bottom>0 && box.top<innerHeight) animate(target,index*65);});
      observer=new IntersectionObserver(entries => {for(const entry of entries) if(entry.isIntersecting) {animate(entry.target);observer?.unobserve(entry.target);}}, {threshold:.12});
      element?.querySelectorAll("[data-reveal]").forEach(target => observer?.observe(target));
    }
    preference.addEventListener("change",start);
    desktop.addEventListener("change",start);
    start();
    return () => { preference.removeEventListener("change",start); desktop.removeEventListener("change",start); stop(); };
  }, [root]);
}
