"use client";

import { useEffect, useRef, type RefObject } from "react";

const ease = "cubic-bezier(0.22, 0.68, 0, 1)";
const reduceQuery = "(prefers-reduced-motion: reduce)";

/** Reuse existing element geometry; content stays visible without JavaScript. */
export function MotionScope({ children, className, id, refreshKey }: {
  children: React.ReactNode; className?: string; id?: string; refreshKey?: string;
}) {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const scope = root.current;
    if (!scope || !window.IntersectionObserver || !scope.animate) return;
    const preference = window.matchMedia(reduceQuery);
    const seen = new WeakSet<Element>();
    const animations = new Set<Animation>();
    const targets = Array.from(scope.querySelectorAll<HTMLElement>("[data-reveal]"));
    const reveal = (target: HTMLElement, immediate = false) => {
      if (seen.has(target)) return;
      seen.add(target);
      target.dataset.revealed = "true";
      if (immediate || preference.matches || target.contains(document.activeElement)) return;
      const mobile = window.matchMedia("(max-width: 600px)").matches;
      const kind = target.dataset.reveal;
      const elements = kind === "stagger" ? Array.from(target.children) : kind === "chart"
        ? Array.from(target.querySelectorAll(".bar, .large-bar-cell > span")) : [target];
      elements.forEach((element, index) => {
        if (!(element instanceof HTMLElement)) return;
        const chart = kind === "chart";
        const animation = element.animate(chart ? [
          { transform: "scaleY(0.35)", opacity: 0.65 },
          { transform: "scaleY(1)", opacity: 1 },
        ] : [
          { transform: `translateY(${mobile ? 10 : 16}px)` },
          { transform: "translateY(0)" },
        ], { duration: mobile ? 360 : chart ? 520 : 480, delay: Math.min(index * (mobile ? 24 : 40), mobile ? 72 : 160), easing: ease });
        animations.add(animation);
        animation.addEventListener("finish", () => animations.delete(animation), { once: true });
      });
    };
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        reveal(entry.target as HTMLElement);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.12, rootMargin: "0px 0px -24px 0px" });
    const observe = () => {
      observer.disconnect();
      if (preference.matches) {
        animations.forEach(animation => animation.cancel());
        animations.clear();
        return;
      }
      targets.filter(target => !seen.has(target)).forEach(target => observer.observe(target));
    };
    const focus = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return;
      const target = event.target.closest<HTMLElement>("[data-reveal]");
      if (target) { reveal(target, true); observer.unobserve(target); }
      // Keyboard users should never have to follow a moving control.
      animations.forEach(animation => animation.cancel());
      animations.clear();
    };
    observe();
    preference.addEventListener("change", observe);
    scope.addEventListener("focusin", focus);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", observe);
      scope.removeEventListener("focusin", focus);
      animations.forEach(animation => animation.cancel());
    };
  }, [refreshKey]);
  return <main ref={root} className={className} id={id}>{children}</main>;
}

/** Change the visible panel in place without remounting its controls. */
export function usePanelMotion(ref: RefObject<HTMLElement | null>, value: string | number) {
  const previous = useRef(value);
  useEffect(() => {
    if (previous.current === value) return;
    previous.current = value;
    const element = ref.current;
    const preference = window.matchMedia(reduceQuery);
    if (!element?.animate || preference.matches) return;
    const animation = element.animate([
      { transform: "translateY(4px)" },
      { transform: "translateY(0)" },
    ], { duration: 180, easing: ease });
    const cancel = () => animation.cancel();
    preference.addEventListener("change", cancel);
    return () => { animation.cancel(); preference.removeEventListener("change", cancel); };
  }, [ref, value]);
}
