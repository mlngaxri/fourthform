"use client";
import {createContext, useCallback, useContext, useEffect, useRef, useState, type ComponentProps, type ReactNode} from "react";
import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";

const Navigation = createContext<((href: string) => void) | null>(null);
const count = 7;

export function SiteTransition({children}: {children: ReactNode}) {
  const router = useRouter(), pathname = usePathname();
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  const animations = useRef<Animation[]>([]);
  const busy = useRef(false), expected = useRef("");
  const phase = useRef("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [state, setState] = useState("idle");

  const reveal = useCallback(async () => {
    if (!busy.current || phase.current === "revealing") return;
    clearTimeout(timer.current);
    phase.current = "revealing"; setState("revealing");
    const opening = panels.current.flatMap((panel, index) => panel ? [panel.animate(
      [{transform: "translateY(0)"}, {transform: "translateY(-102%)"}],
      {duration: 380, delay: (count - 1 - index) * 45, easing: "cubic-bezier(.76,0,.24,1)", fill: "both"},
    )] : []);
    animations.current.push(...opening);
    await Promise.all(opening.map(animation => animation.finished.catch(() => {})));
    animations.current.forEach(animation => animation.cancel()); animations.current = [];
    busy.current = false; phase.current = "idle"; setState("idle");
    const heading = document.querySelector<HTMLElement>("main h1");
    if (heading) { heading.tabIndex = -1; heading.focus({preventScroll: true}); }
  }, []);

  const navigate = useCallback(async (href: string) => {
    if (busy.current) return;
    const target = href.split(/[?#]/)[0] || "/";
    if (target === pathname || (matchMedia("(prefers-reduced-motion: reduce)").matches && !matchMedia("(min-width: 900px)").matches)) { router.push(href); return; }
    busy.current = true; expected.current = target; phase.current = "covering"; setState("covering");
    router.prefetch(href);
    const closing = panels.current.flatMap((panel, index) => panel ? [panel.animate(
      [{transform: "translateY(-102%)"}, {transform: "translateY(0)"}],
      {duration: 400, delay: index * 45, easing: "cubic-bezier(.76,0,.24,1)", fill: "both"},
    )] : []);
    animations.current = closing;
    await Promise.all(closing.map(animation => animation.finished.catch(() => {})));
    if (!busy.current) return;
    phase.current = "covered"; setState("covered");
    // A failed route must never leave the site behind a permanent curtain.
    timer.current = setTimeout(() => { void reveal(); }, 6000);
    router.push(href);
  }, [pathname, router, reveal]);

  useEffect(() => {
    if (phase.current === "covered" && pathname === expected.current) void reveal();
  }, [pathname, state, reveal]);
  useEffect(() => () => {
    busy.current = false; clearTimeout(timer.current);
    animations.current.forEach(animation => animation.cancel());
  }, []);

  return <Navigation.Provider value={navigate}>
    <div className="ff-route-root" aria-busy={state !== "idle"}>{children}</div>
    <div className="ff-staircase" data-state={state} aria-hidden="true">
      {Array.from({length: count}, (_, index) => <div key={index} ref={element => { panels.current[index] = element; }}/>) }
    </div>
  </Navigation.Provider>;
}

export function TransitionLink({href, onClick, ...props}: Omit<ComponentProps<typeof Link>, "href"> & {href: string}) {
  const navigate = useContext(Navigation);
  return <Link {...props} href={href} onClick={event => {
    onClick?.(event);
    if (!navigate || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || props.target === "_blank" || !href.startsWith("/") || href.startsWith("//")) return;
    event.preventDefault(); navigate(href);
  }}/>;
}
