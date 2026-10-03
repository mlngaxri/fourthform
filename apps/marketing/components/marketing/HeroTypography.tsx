"use client";

import {useEffect, useRef} from "react";

// One message, three typographic expressions. The fixed slot keeps the
// surrounding composition still while native animation time changes the type.
export default function HeroTypography() {
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const element = heading.current;
    if (!element) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const tracks: Animation[] = [];
    let visible = true;
    let disposed = false;

    function sync() {
      const running = !preference.matches && visible && document.visibilityState === "visible";
      tracks.forEach(track => {
        if (running && track.playState !== "running") track.play();
        else if (!running && track.playState !== "paused") track.pause();
      });
      element!.dataset.typeRunning = String(running);
    }

    function start() {
      if (disposed || preference.matches || tracks.length) return;
      const frames: Keyframe[][] = [
        [{opacity:1, transform:"translateY(0)", offset:0}, {opacity:1, transform:"translateY(0)", offset:.28}, {opacity:0, transform:"translateY(-.08em)", offset:.33}, {opacity:0, transform:"translateY(.08em)", offset:.94}, {opacity:1, transform:"translateY(0)", offset:1}],
        [{opacity:0, transform:"translateY(.08em)", offset:0}, {opacity:0, transform:"translateY(.08em)", offset:.28}, {opacity:1, transform:"translateY(0)", offset:.33}, {opacity:1, transform:"translateY(0)", offset:.61}, {opacity:0, transform:"translateY(-.08em)", offset:.66}, {opacity:0, transform:"translateY(.08em)", offset:1}],
        [{opacity:0, transform:"translateY(.08em)", offset:0}, {opacity:0, transform:"translateY(.08em)", offset:.61}, {opacity:1, transform:"translateY(0)", offset:.66}, {opacity:1, transform:"translateY(0)", offset:.94}, {opacity:0, transform:"translateY(-.08em)", offset:1}],
      ];
      element!.querySelectorAll<HTMLElement>(".hero-typeface").forEach((layer, index) => {
        tracks.push(layer.animate(frames[index], {duration:12_000, iterations:Infinity, easing:"linear", fill:"both"}));
      });
      const time = document.timeline.currentTime;
      if (typeof time === "number") tracks.forEach(track => { track.startTime = time; });
      sync();
    }

    function updatePreference() {
      if (preference.matches) {
        tracks.splice(0).forEach(track => track.cancel());
        element!.dataset.typeRunning = "false";
      } else { start(); sync(); }
    }
    const observer = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      sync();
    });
    observer.observe(element);
    preference.addEventListener("change", updatePreference);
    document.addEventListener("visibilitychange", sync);
    void document.fonts.ready.then(start);

    return () => {
      disposed = true;
      observer.disconnect();
      tracks.forEach(track => track.cancel());
      preference.removeEventListener("change", updatePreference);
      document.removeEventListener("visibilitychange", sync);
      delete element.dataset.typeRunning;
    };
  }, []);

  return <h1 ref={heading} className="mk-display" id="hero-heading" aria-label="A website. All your own.">
    <span className="hero-line" data-intro aria-hidden="true">
      <span className="hero-connector">A</span>
      <span className="hero-word hero-type-slot">
        <span className="hero-typeface hero-type-impact">website.</span>
        <span className="hero-typeface hero-type-grotesk">website.</span>
        <span className="hero-typeface hero-type-editorial">website.</span>
      </span>
    </span>
    <span className="hero-line hero-line-second" data-intro aria-hidden="true">
      <span className="hero-connector">All your</span><span className="hero-word hero-own">own.</span>
    </span>
  </h1>;
}
