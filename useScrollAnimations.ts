'use client';

import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Hook that animates elements with [data-scroll-reveal] inside a container
 * when they scroll into view.
 */
export function useScrollReveal(containerRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      // Heading reveals: data-scroll-reveal="h"
      container.querySelectorAll<HTMLElement>('[data-scroll-reveal="h"]').forEach((el) => {
        gsap.set(el, { visibility: 'visible' });

        // Split into words by wrapping each word
        const text = el.innerText || el.textContent || '';
        const words = text.split(/\s+/).filter(Boolean);
        el.innerHTML = words
          .map(
            (word) =>
              `<span class="inline-block overflow-hidden"><span class="inline-block translate-y-full opacity-0" data-word>${word}</span></span>`
          )
          .join(' ');

        const wordEls = el.querySelectorAll('[data-word]');

        ScrollTrigger.create({
          trigger: el,
          start: 'top 88%',
          once: true,
          onEnter: () => {
            gsap.to(wordEls, {
              y: 0,
              opacity: 1,
              duration: 1.0,
              ease: 'power4.out',
              stagger: 0.06,
            });
          },
        });
      });

      // Paragraph reveals: data-scroll-reveal="p"
      container.querySelectorAll<HTMLElement>('[data-scroll-reveal="p"]').forEach((el) => {
        gsap.set(el, { visibility: 'visible' });

        ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          once: true,
          onEnter: () => {
            gsap.fromTo(
              el,
              { y: 30, opacity: 0 },
              { y: 0, opacity: 1, duration: 1.0, ease: 'power3.out' }
            );
          },
        });
      });

      // Container reveals: data-scroll-reveal="ctn"
      container.querySelectorAll<HTMLElement>('[data-scroll-reveal="ctn"]').forEach((el) => {
        gsap.set(el, { visibility: 'visible' });

        ScrollTrigger.create({
          trigger: el,
          start: 'top 92%',
          once: true,
          onEnter: () => {
            gsap.fromTo(
              el,
              { y: 20, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.15 }
            );
          },
        });
      });

      // Image reveals: data-scroll-reveal="img"
      container.querySelectorAll<HTMLElement>('[data-scroll-reveal="img"]').forEach((el) => {
        gsap.set(el, { visibility: 'visible', clipPath: 'inset(100% 0 0 0)' });
        const inner = el.querySelector('img, video, canvas');
        if (inner) gsap.set(inner, { scale: 1.15 });

        ScrollTrigger.create({
          trigger: el,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            gsap.to(el, {
              clipPath: 'inset(0% 0 0 0)',
              duration: 1.2,
              ease: 'power4.inOut',
            });
            if (inner) {
              gsap.to(inner, {
                scale: 1,
                duration: 1.4,
                ease: 'power3.out',
              });
            }
          },
        });
      });

      // Card reveals: data-scroll-reveal="card"
      container.querySelectorAll<HTMLElement>('[data-scroll-reveal="card"]').forEach((el) => {
        gsap.set(el, { visibility: 'visible' });

        gsap.fromTo(
          el,
          { yPercent: 35 },
          {
            yPercent: 0,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top bottom' },
          }
        );
      });

      // Line decoration reveals: data-scroll-reveal="line"
      container.querySelectorAll<HTMLElement>('[data-scroll-reveal="line"]').forEach((el) => {
        gsap.set(el, { visibility: 'visible', scaleX: 0, transformOrigin: 'left center' });

        ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          once: true,
          onEnter: () => {
            gsap.to(el, { scaleX: 1, duration: 1.2, ease: 'power4.inOut' });
          },
        });
      });

      // Word reveals for large statement titles: data-scroll-reveal="w"
      container.querySelectorAll<HTMLElement>('[data-scroll-reveal="w"]').forEach((el) => {
        gsap.set(el, { visibility: 'visible' });

        ScrollTrigger.create({
          trigger: el,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            const children = el.children;
            gsap.fromTo(
              children,
              { y: 60, opacity: 0 },
              { y: 0, opacity: 1, duration: 1.2, ease: 'power4.out', stagger: 0.12 }
            );
          },
        });
      });
    }, container);

    return () => ctx.revert();
  }, [containerRef]);
}

/**
 * Hook for parallax image effects on scroll
 */
export function useParallax(containerRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      container.querySelectorAll<HTMLElement>('[data-parallax="w"]').forEach((wrapper) => {
        const inner = wrapper.querySelector<HTMLElement>('[data-parallax="img"]');
        if (!inner) return;

        gsap.fromTo(
          inner,
          { yPercent: -12 },
          {
            yPercent: 12,
            ease: 'none',
            scrollTrigger: {
              trigger: wrapper,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      });
    }, container);

    return () => ctx.revert();
  }, [containerRef]);
}
