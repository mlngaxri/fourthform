"use client";
import {useRef} from "react";
import Link from "next/link";
import ServiceFooter from "./ServiceFooter";
import PortfolioOrbit from "./PortfolioOrbit";
import NavigationHeader from "./NavigationHeader";
import {usePageMotion} from "../../lib/use-page-motion";

export default function MarketingHome(){
 const root=useRef<HTMLElement>(null);usePageMotion(root);
 return <main ref={root} className="mk-site mk-simple mk-orbit-site" id="top">
  <a className="skip-link" href="#main-content">Skip to content</a><NavigationHeader/>
  <section className="mk-hero-wrap" id="main-content" tabIndex={-1} aria-labelledby="hero-heading"><div className="mk-hero mk-orbit-hero">
   <PortfolioOrbit/>
   <div className="mk-hero-copy mk-orbit-copy"><h1 className="mk-display" id="hero-heading" aria-label="A website. All your own."><span className="hero-line" data-intro aria-hidden="true"><span className="hero-connector">A</span><span className="hero-word"><span className="hero-initial">w</span>ebsite.</span></span><span className="hero-line hero-line-second" data-intro aria-hidden="true"><span className="hero-connector">All your</span><span className="hero-word">own.</span></span></h1><p className="mk-body" data-intro>Custom websites for independent businesses,<br className="ff-desktop-break"/> designed around you.</p></div>
  </div><a className="ff-scroll-cue" href="#your-website">A little more about Fourthform ↓</a></section>
  <section className="ff-home-continuation" id="your-website" aria-labelledby="home-next-heading"><div className="mk-container"><div className="ff-home-intro"><div><span className="mk-kicker">From your first idea to everyday use</span><h2 id="home-next-heading">A good website makes your business clear.</h2></div><div><p>We design and build custom websites for independent businesses. Your words, your work and the things your visitors need to do come first.</p><p>You’ll review the design with us in one client workspace, then keep your content current after launch.</p><Link className="mk-text-link" href="/brief">Start with your website brief ↗</Link></div></div><div className="ff-home-paths"><Link href="/work"><span>Explore the work <b aria-hidden="true">↗</b></span><p>Open the studies, navigate the pages and find a direction you like.</p></Link><Link href="/how-we-work"><span>How we work with you <b aria-hidden="true">↗</b></span><p>See the process and try the client workspace before you begin.</p></Link><Link href="/pricing"><span>A clear starting price <b aria-hidden="true">↗</b></span><p>See what’s included, the payment stages and support after launch.</p></Link></div></div></section><ServiceFooter/>
 </main>;
}
