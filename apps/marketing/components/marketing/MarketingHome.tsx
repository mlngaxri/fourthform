"use client";
import {useRef} from "react";
import Link from "next/link";
import ServiceFooter from "./ServiceFooter";
import PortfolioOrbit from "./PortfolioOrbit";
import NavigationHeader from "./NavigationHeader";
import HeroTypography from "./HeroTypography";
import {usePageMotion} from "../../lib/use-page-motion";

export default function MarketingHome(){
 const root=useRef<HTMLElement>(null);usePageMotion(root);
 return <main ref={root} className="mk-site mk-simple mk-orbit-site" id="top">
  <a className="skip-link" href="#main-content">Skip to content</a><NavigationHeader/>
  <section className="mk-hero-wrap" id="main-content" tabIndex={-1} aria-labelledby="hero-heading"><div className="mk-hero mk-orbit-hero">
   <PortfolioOrbit/>
   <div className="mk-hero-copy mk-orbit-copy"><HeroTypography/><p className="mk-body" data-intro>Custom websites for independent businesses,<br className="ff-desktop-break"/> designed around you.</p></div>
  </div><a className="ff-scroll-cue" href="#your-website">A little more about Fourthform ↓</a></section>
  <section className="ff-home-continuation" id="your-website" aria-labelledby="home-next-heading"><div className="mk-container"><div className="ff-home-intro"><div><span className="mk-kicker">From your first idea to everyday use</span><h2 id="home-next-heading">A good website makes your <em>business clear.</em></h2></div><div className="ff-home-description"><p>We design and build your website around what your business needs. Your words, your work and the things your visitors need to do come first.</p><p>Review the design with us in your client portal, then update everyday content after launch.</p><Link className="mk-text-link" href="/brief">Start with your website brief ↗</Link></div></div><div className="ff-home-paths"><Link href="/work"><small aria-hidden="true">01 / Work</small><span>Find your direction <b aria-hidden="true">↗</b></span><p>Explore the original designs and find a direction you like.</p></Link><Link href="/how-we-work"><small aria-hidden="true">02 / Process</small><span>Made with you <b aria-hidden="true">↗</b></span><p>See the process and try the client portal before you begin.</p></Link><Link href="/pricing"><small aria-hidden="true">03 / Pricing</small><span>A clear starting price <b aria-hidden="true">↗</b></span><p>See what’s included, the payment stages and support after launch.</p></Link></div></div></section><ServiceFooter/>
 </main>;
}
