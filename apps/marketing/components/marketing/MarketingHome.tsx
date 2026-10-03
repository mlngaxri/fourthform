"use client";
import {useRef} from "react";
import PortfolioOrbit from "./PortfolioOrbit";
import NavigationHeader from "./NavigationHeader";
import {usePageMotion} from "../../lib/use-page-motion";

export default function MarketingHome(){
 const root=useRef<HTMLElement>(null);usePageMotion(root);
 return <main ref={root} className="mk-site mk-simple mk-orbit-site" id="top">
  <a className="skip-link" href="#main-content">Skip to content</a><NavigationHeader/>
  <section className="mk-hero-wrap" id="main-content" tabIndex={-1} aria-labelledby="hero-heading"><div className="mk-hero mk-orbit-hero">
   <PortfolioOrbit/>
   <div className="mk-hero-copy mk-orbit-copy"><h1 className="mk-display" id="hero-heading" aria-label="A website. All your own."><span className="hero-line" aria-hidden="true"><span className="hero-connector">A</span><span className="hero-word"><span className="hero-initial">w</span>ebsite.</span></span><span className="hero-line hero-line-second" aria-hidden="true"><span className="hero-connector">All your</span><span className="hero-word">own.</span></span></h1><p className="mk-body" data-intro>Custom websites for independent businesses,<br className="ff-desktop-break"/> designed around you.</p></div>
  </div></section>
 </main>;
}
