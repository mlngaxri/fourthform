"use client";
import {useEffect, useRef, useState} from "react";
import {usePathname} from "next/navigation";
import {startHref, startLabel, clientSignInHref} from "../../lib/customer-flow";
import {TransitionLink} from "./SiteTransition";

const destinations = [["/", "Home"], ["/work", "Work"], ["/how-we-work", "How we work with you"], ["/pricing", "Pricing"]];
export default function NavigationHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null), menu = useRef<HTMLDivElement>(null);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    menu.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); button.current?.focus(); } };
    const outside = (event: PointerEvent) => { if (!menu.current?.contains(event.target as Node) && !button.current?.contains(event.target as Node)) setOpen(false); };
    const query = matchMedia("(min-width: 981px)");
    const resize = () => { if (query.matches) setOpen(false); };
    document.addEventListener("keydown", escape); document.addEventListener("pointerdown", outside); query.addEventListener("change", resize);
    return () => { document.removeEventListener("keydown", escape); document.removeEventListener("pointerdown", outside); query.removeEventListener("change", resize); };
  }, [open]);
  return <nav className="mk-nav ff-navigation" aria-label="Primary navigation">
    <TransitionLink className="mk-wordmark" href="/" aria-label="Fourthform home"><span className="ff-mark" aria-hidden="true"/>fourthform</TransitionLink>
    <div className="mk-nav-links">{destinations.map(([href, label]) => <TransitionLink key={href} href={href} aria-current={pathname === href ? "page" : undefined}>{label}</TransitionLink>)}</div>
    <button ref={button} className="mk-menu-toggle" type="button" aria-controls="mk-mobile-menu" aria-expanded={open} aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen(value => !value)}>{open ? "Close" : "Menu"}</button>
    <TransitionLink className="mk-button mk-button-dark" href={startHref()}>{startLabel}</TransitionLink>
    <div ref={menu} className="mk-mobile-menu" id="mk-mobile-menu" hidden={!open} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget) && event.relatedTarget !== button.current) setOpen(false); }}>
      {destinations.map(([href, label]) => <TransitionLink key={href} href={href} aria-current={pathname === href ? "page" : undefined} onClick={() => setOpen(false)}>{label}</TransitionLink>)}
      <TransitionLink className="ff-menu-brief" href={startHref()} onClick={() => setOpen(false)}>{startLabel} ↗</TransitionLink>
      <a className="ff-menu-signin" href={clientSignInHref}>Client sign-in ↗</a>
    </div>
  </nav>;
}
