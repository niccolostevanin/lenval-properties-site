'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface FooterProps {
  onOpenCTA: () => void;
}

export default function Footer({ onOpenCTA }: FooterProps) {
  const footerRef = useRef<HTMLElement>(null);
  const ctaHeadingRef = useRef<HTMLHeadingElement>(null);
  const ctaParaRef = useRef<HTMLParagraphElement>(null);
  const ctaBtnRef = useRef<HTMLButtonElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // CTA heading reveal
      if (ctaHeadingRef.current) {
        const words = ctaHeadingRef.current.querySelectorAll('.word');
        gsap.set(words, { yPercent: 110, opacity: 0 });
        gsap.to(words, {
          yPercent: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          stagger: 0.04,
          scrollTrigger: {
            trigger: ctaHeadingRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        });
      }

      // CTA paragraph reveal
      if (ctaParaRef.current) {
        gsap.set(ctaParaRef.current, { y: 30, opacity: 0 });
        gsap.to(ctaParaRef.current, {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: ctaParaRef.current,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        });
      }

      // Button reveal
      if (ctaBtnRef.current) {
        gsap.set(ctaBtnRef.current, { y: 20, opacity: 0 });
        gsap.to(ctaBtnRef.current, {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: ctaBtnRef.current,
            start: 'top 92%',
            toggleActions: 'play none none none',
          },
        });
      }

      // Divider line animation
      if (dividerRef.current) {
        gsap.set(dividerRef.current, { scaleX: 0, transformOrigin: 'left center' });
        gsap.to(dividerRef.current, {
          scaleX: 1,
          duration: 1.2,
          ease: 'power3.inOut',
          scrollTrigger: {
            trigger: dividerRef.current,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        });
      }

      // Bottom section columns
      if (bottomRef.current) {
        const cols = bottomRef.current.querySelectorAll('.footer-col');
        gsap.set(cols, { y: 30, opacity: 0 });
        gsap.to(cols, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          stagger: 0.12,
          scrollTrigger: {
            trigger: bottomRef.current,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        });
      }
    }, footerRef);

    return () => ctx.revert();
  }, []);

  // Split heading text into wrapped words for animation
  const headingText =
    'Every Lenval development begins and ends with the highest standards of integrity';
  const headingWords = headingText.split(' ');

  return (
    <footer
      ref={footerRef}
      className="relative bg-[#121212] text-[#f8f4ee] overflow-hidden"
    >
      {/* Decorative video overlay */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover opacity-[0.06] mix-blend-lighten pointer-events-none"
        src="/videos/shadow_services.webm"
        autoPlay
        loop
        muted
        playsInline
      />

      {/* ── CTA Section ── */}
      <div className="relative z-10 px-6 md:px-12 lg:px-20 pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="max-w-[1400px] mx-auto">
          <h1
            ref={ctaHeadingRef}
            className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[1.1] tracking-tight max-w-[1100px]"
          >
            {headingWords.map((word, i) => (
              <span key={i} className="inline-block overflow-hidden mr-[0.28em]">
                <span className="word inline-block">{word}</span>
              </span>
            ))}
          </h1>

          <p
            ref={ctaParaRef}
            className="mt-10 md:mt-14 max-w-[600px] font-sans text-sm md:text-base leading-relaxed text-[#f8f4ee]/70"
          >
            Integrity is the foundation upon which every Lenval property is built.
            From the first conversation to the final handover, our commitment to
            transparency, quality, and trust defines who we are and everything we
            deliver.
          </p>

          <button
            ref={ctaBtnRef}
            onClick={onOpenCTA}
            className="group mt-10 md:mt-14 inline-flex items-center gap-3 border border-[#f8f4ee]/30 hover:border-[#d4a373] rounded-full px-8 py-4 font-sans text-sm uppercase tracking-[0.15em] transition-colors duration-500 hover:bg-[#d4a373]/10"
          >
            <span>Let&apos;s Talk</span>
            <svg
              className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="relative z-10 px-6 md:px-12 lg:px-20">
        <div
          ref={dividerRef}
          className="max-w-[1400px] mx-auto h-px bg-[#f8f4ee]/15"
        />
      </div>

      {/* ── Bottom Section ── */}
      <div
        ref={bottomRef}
        className="relative z-10 px-6 md:px-12 lg:px-20 py-16 md:py-20"
      >
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row justify-between gap-12 lg:gap-8">
          {/* Info Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-16">
            {/* Office */}
            <div className="footer-col">
              <span className="block font-sans text-[11px] uppercase tracking-[0.2em] text-[#888888] mb-4">
                Office
              </span>
              <address className="not-italic font-sans text-sm leading-relaxed text-[#f8f4ee]/80">
                Abu Dhabi,
                <br />
                United Arab Emirates
              </address>
            </div>

            {/* Reach Us */}
            <div className="footer-col">
              <span className="block font-sans text-[11px] uppercase tracking-[0.2em] text-[#888888] mb-4">
                Reach us
              </span>
              <div className="font-sans text-sm leading-relaxed space-y-2">
                <a
                  href="mailto:info@lenvalproperties.com"
                  className="block text-[#f8f4ee]/80 hover:text-[#d4a373] transition-colors duration-300"
                >
                  info@lenvalproperties.com
                </a>
                <a
                  href="tel:+97124410100"
                  className="block text-[#f8f4ee]/80 hover:text-[#d4a373] transition-colors duration-300"
                >
                  +971 2 441 0100
                </a>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="footer-col flex flex-col justify-between">
            <div className="flex items-center gap-8">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-sm text-[#f8f4ee]/60 hover:text-[#d4a373] transition-colors duration-300 uppercase tracking-[0.1em]"
              >
                LinkedIn
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-sm text-[#f8f4ee]/60 hover:text-[#d4a373] transition-colors duration-300 uppercase tracking-[0.1em]"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>

        {/* Secondary Divider */}
        <div className="max-w-[1400px] mx-auto mt-14 mb-8 h-px bg-[#f8f4ee]/10" />

        {/* Copyright */}
        <div className="max-w-[1400px] mx-auto">
          <p className="footer-col font-sans text-[11px] uppercase tracking-[0.15em] text-[#888888]">
            &copy; {currentYear}. Lenval group. All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
