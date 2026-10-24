'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function Preloader() {
  const [isFinished, setIsFinished] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsFinished(true);
      return;
    }

    const timeline = gsap.timeline({
      onComplete: () => setIsFinished(true),
    });

    timeline
      .fromTo(
        element.querySelector('[data-intro-mark]'),
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out' }
      )
      .to(element.querySelector('[data-intro-line]'), {
        scaleX: 1,
        duration: 0.45,
        ease: 'power2.inOut',
      }, '-=0.2')
      .to(element, {
        yPercent: -100,
        duration: 0.7,
        ease: 'power4.inOut',
      }, '+=0.05');

    return () => {
      timeline.kill();
    };
  }, []);

  if (isFinished) return null;

  return (
    <div
      ref={containerRef}
      data-preloader
      className="site-intro fixed inset-0 z-[9999] flex flex-col justify-between bg-[#171816] px-6 py-8 text-[#f8f4ee] md:px-12 md:py-10"
      aria-label="Lenval Properties"
    >
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-white/55">
        <span>Lenval Properties</span>
        <span>Abu Dhabi · UAE</span>
      </div>

      <div data-intro-mark className="mx-auto flex flex-col items-center gap-5 opacity-0">
        <span className="font-serif text-5xl italic leading-none text-[#d4a373]">L</span>
        <span className="text-[10px] uppercase tracking-[0.28em] text-white/70">
          Crafted with intention
        </span>
      </div>

      <div className="h-px w-full origin-left scale-x-0 bg-white/20" data-intro-line />
    </div>
  );
}
