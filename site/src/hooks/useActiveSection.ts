import { useEffect, useState } from 'react';

/**
 * Which section is currently being read. On a long single-page site the nav is
 * the only orientation the reader gets; without this it is a static list of
 * words that never acknowledges where they are.
 */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const ratios = new Map<string, number>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          ratios.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
        }
        let best: string | null = null;
        let bestRatio = 0;
        for (const id of ids) {
          const r = ratios.get(id) ?? 0;
          if (r > bestRatio) { bestRatio = r; best = id; }
        }
        setActive(best);
      },
      { rootMargin: '-12% 0px -55% 0px', threshold: [0, 0.15, 0.4, 0.8] },
    );

    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((n): n is HTMLElement => Boolean(n));
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [ids]);

  return active;
}

/** True once the page has scrolled past `offset`. */
export function useScrolled(offset = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > offset);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [offset]);
  return scrolled;
}
