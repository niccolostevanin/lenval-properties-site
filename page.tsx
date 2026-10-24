'use client';

import React, { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { useLenis } from '@/hooks/useLenis';
import { useScrollReveal, useParallax } from '@/hooks/useScrollAnimations';

import Header from '@/components/Header';
import Preloader from '@/components/Preloader';
import ModalCTA from '@/components/ModalCTA';
import MobileMenu from '@/components/MobileMenu';

const WebGLSketchScene = dynamic(() => import('@/components/WebGLSketchScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] md:h-[750px] lg:h-[850px] bg-[#f8f4ee]" />
  ),
});

const ActiveFrameCanvas = dynamic(() => import('@/components/ActiveFrameCanvas'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-neutral-200" />,
});

const ParallaxVideo = dynamic(() => import('@/components/ParallaxVideo'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-neutral-900" />,
});

const ShadowVideo = dynamic(() => import('@/components/ShadowVideo'), {
  ssr: false,
});

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HomePage() {
  const [isCtaOpen, setIsCtaOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  useLenis();
  useScrollReveal(mainRef);
  useParallax(mainRef);

  return (
    <>
      <Preloader />

      <Header
        onOpenModal={() => setIsCtaOpen(true)}
        onOpenMenu={() => setIsMenuOpen(true)}
      />

      <ModalCTA isOpen={isCtaOpen} onClose={() => setIsCtaOpen(false)} />
      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onOpenCTA={() => setIsCtaOpen(true)}
      />

      <main ref={mainRef} data-barba="container" className="relative">
        {/* ============================================================
            SECTION 1: HERO
        ============================================================ */}
        <section
          id="hero"
          className="relative min-h-screen flex flex-col justify-end overflow-hidden bg-[#171816] text-[#f8f4ee]"
        >
          {/* Background Video with Parallax */}
          <div className="absolute inset-0 z-0">
            <div data-parallax="w" className="absolute inset-0 overflow-hidden">
              <video
                data-parallax="img"
                src="/videos/project-j_src.mp4"
                muted
                loop
                playsInline
                autoPlay
                preload="auto"
                className="hero-video-grade absolute left-0 top-[-7.5%] h-[115%] w-full object-cover"
              />
            </div>
            <div aria-hidden="true" className="hero-light absolute inset-0 z-10" />
          </div>

          {/* Hero Content */}
          <div className="relative z-20 px-6 pb-14 pt-36 md:px-12 md:pb-20 md:pt-44">
            <div className="mb-7 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.22em] text-[#e4c59d] md:mb-8">
              <span className="h-px w-9 bg-[#d4a373]" />
              Independent real estate developer · Abu Dhabi
            </div>
            <div className="max-w-5xl">
              <h1
                data-scroll-reveal="h"
                className="mb-8 max-w-[950px] font-serif text-[clamp(3rem,8vw,7.2rem)] font-light leading-[0.9] tracking-[-0.045em]"
              >
                Creators of Refined Living &amp; Iconic Spaces
              </h1>
              <div className="flex items-center gap-3" data-scroll-reveal="p">
                <a
                  href="#about"
                  className="group inline-flex items-center gap-2 text-xs uppercase tracking-widest font-medium"
                >
                  <span className="relative overflow-hidden h-5">
                    <span className="inline-block transition-transform duration-300 group-hover:-translate-y-full">
                      scroll to explore
                    </span>
                    <span className="absolute left-0 top-full inline-block transition-transform duration-300 group-hover:-translate-y-full">
                      scroll to explore
                    </span>
                  </span>
                  <svg
                    className="w-3 h-3 animate-bounce"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </a>
              </div>
            </div>

            {/* Project info overlay */}
            <div className="mt-9 max-w-44 border-l border-[#d4a373]/70 pl-3 text-left md:absolute md:bottom-20 md:right-12 md:mt-0 md:max-w-none md:pl-4 md:text-right">
              <div className="mb-1 text-[9px] uppercase tracking-[0.22em] text-white/65">
                Featured residence · P3
              </div>
              <div className="font-serif text-lg leading-tight md:text-xl">Project J</div>
              <div className="mt-1 text-[8px] uppercase tracking-[0.12em] text-white/65 md:text-[10px] md:tracking-[0.16em]">
                Jubail Island, Abu Dhabi
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            SECTION 2: ABOUT
        ============================================================ */}
        <section
          id="about"
          className="relative bg-[#121212] text-[#f8f4ee] py-24 md:py-32 overflow-hidden"
        >
          <div className="px-6 md:px-12 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
              {/* Left: Image */}
              <div data-scroll-reveal="img" className="overflow-hidden rounded-sm">
                <Image
                  src="/images/6a6f583c2c071c03352b3d5b_project-s-1.webp"
                  alt="Lenval Properties architectural detail"
                  width={1280}
                  height={1600}
                  className="w-full h-auto object-cover"
                  loading="eager"
                />
              </div>

              {/* Right: Content */}
              <div className="flex flex-col justify-center gap-8 lg:pt-20">
                <div className="text-xs uppercase tracking-widest text-[#d4a373] font-mono" data-scroll-reveal="p">
                  About Lenval Properties
                </div>
                <h2
                  data-scroll-reveal="h"
                  className="font-serif text-[clamp(2rem,4.5vw,3.5rem)] leading-[0.95] tracking-tight font-light"
                >
                  Building with Purpose, Delivering with Precision
                </h2>
                <p
                  data-scroll-reveal="p"
                  className="text-[15px] leading-relaxed text-neutral-300 max-w-lg"
                >
                  Lenval Properties is a boutique real estate developer based in Abu Dhabi,
                  specializing in creating refined residential communities. Each project is
                  thoughtfully designed to balance elegance, privacy, and a strong sense of place.
                </p>
                <p
                  data-scroll-reveal="p"
                  className="text-[15px] leading-relaxed text-neutral-300 max-w-lg"
                >
                  We operate with a commitment to transparency and long-term value, ensuring every
                  development reflects the highest standards of craftsmanship and integrity.
                </p>
                <div data-scroll-reveal="ctn">
                  <a
                    href="#architecture"
                    className="group inline-flex items-center gap-3 text-xs uppercase tracking-widest font-medium border border-white/20 rounded-full px-6 py-3 hover:bg-white/5 transition-all duration-300"
                  >
                    <span>Learn more</span>
                    <svg
                      className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path d="M10.6688 6.27614L4.93109 12.0139L3.98828 11.0711L9.72601 5.33333H4.66883V4H12.0021V11.3333H10.6688V6.27614Z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative shadow video */}
          <ShadowVideo
            src="/videos/shadow_home.webm"
            opacity={0.15}
            className="absolute inset-0 w-full h-full"
          />
        </section>

        {/* ============================================================
            SECTION 3: ARCHITECTURE (3D SKETCH SCENE)
        ============================================================ */}
        <section
          id="architecture"
          className="relative bg-[#121212] text-[#f8f4ee] overflow-hidden"
        >
          <div className="px-6 md:px-12 max-w-7xl mx-auto pt-24 md:pt-32">
            <div className="mb-6">
              <h2
                data-scroll-reveal="h"
                className="font-serif text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[0.9] tracking-tight font-light"
              >
                Architecture
                <br />
                for a Bespoke Life
              </h2>
            </div>
          </div>

          {/* WebGL 3D Scene */}
          <div data-parallax="w" className="section relative">
            <WebGLSketchScene />
          </div>

          {/* Description below sketch */}
          <div className="px-6 md:px-12 max-w-7xl mx-auto py-16 md:py-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
              <p
                data-scroll-reveal="p"
                className="text-[15px] leading-relaxed text-neutral-300"
              >
                We do not subscribe to a single architectural style. Instead, we act as
                curators—hand-picking the world&apos;s most visionary architects and designers,
                masters of form, and landscape visionaries to match the unique identity of each
                destination.
              </p>
              <p
                data-scroll-reveal="p"
                className="text-[15px] leading-relaxed text-neutral-300"
              >
                Whether crafting a private sanctuary, an inspiring workspace, or a monumental
                hospitality destination, we unite premier global talent to deliver structures of
                uncompromising distinction and enduring legacy.
              </p>
            </div>
            <div className="mt-8" data-scroll-reveal="ctn">
              <a
                href="#projects"
                className="group inline-flex items-center gap-3 text-xs uppercase tracking-widest font-medium border border-white/20 rounded-full px-6 py-3 hover:bg-white/5 transition-all duration-300"
              >
                <span>Learn more</span>
                <svg
                  className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M10.6688 6.27614L4.93109 12.0139L3.98828 11.0711L9.72601 5.33333H4.66883V4H12.0021V11.3333H10.6688V6.27614Z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Decorative shadow */}
          <ShadowVideo
            src="/videos/shadow_leaves.webm"
            flipH
            opacity={0.12}
            className="absolute bottom-0 right-0 w-1/2 h-1/2 pointer-events-none"
          />
        </section>

        {/* ============================================================
            SECTION 4: PURPOSE – Creating Generational Spaces
        ============================================================ */}
        <section
          id="purpose"
          className="relative bg-[#f8f4ee] text-[#121212] py-32 md:py-48"
        >
          <div className="px-6 md:px-12 max-w-7xl mx-auto">
            <div className="flex flex-col items-center text-center mb-16">
              <h3
                data-scroll-reveal="w"
                className="font-serif text-[clamp(3rem,8vw,6rem)] leading-[0.85] tracking-tight font-light"
              >
                <span className="block" data-scroll-reveal="h">Creating</span>
                <span className="block" data-scroll-reveal="h">Generational</span>
                <span className="block text-right" data-scroll-reveal="h">Spaces</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-3xl mx-auto">
              <div>
                <p data-scroll-reveal="p" className="text-[15px] leading-relaxed text-neutral-600">
                  Each project begins with a clear vision to create spaces that balance elegance,
                  privacy, and a strong sense of place. The result is architecture that feels
                  timeless and quietly distinctive.
                </p>
              </div>
              <div data-scroll-reveal="ctn">
                <a
                  href="#projects"
                  className="group inline-flex items-center gap-3 text-xs uppercase tracking-widest font-medium border border-black/20 rounded-full px-6 py-3 hover:bg-black/5 transition-all duration-300"
                >
                  <span>Learn more</span>
                  <svg
                    className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M10.6688 6.27614L4.93109 12.0139L3.98828 11.0711L9.72601 5.33333H4.66883V4H12.0021V11.3333H10.6688V6.27614Z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            SECTION 5: PROJECTS – Scroll-scrub ActiveFrame videos
        ============================================================ */}
        <section
          id="projects"
          className="relative bg-[#121212] py-24 text-[#f8f4ee] md:py-32"
        >
          <div className="px-6 md:px-12 max-w-7xl mx-auto">
            <div className="mb-16 md:mb-20">
              <div
                className="text-xs uppercase tracking-widest text-[#d4a373] font-mono mb-3"
                data-scroll-reveal="p"
              >
                Our Portfolio
              </div>
              <h2
                data-scroll-reveal="h"
                className="font-serif text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[0.9] tracking-tight font-light"
              >
                Featured Projects
              </h2>
            </div>

          </div>

          {/* Full-screen, scroll-pinned project films */}
          <div className="space-y-8 md:space-y-12">
            <ActiveFrameCanvas
              afSrc="/activeframe/project-s_short_1920_h264.af"
              pinned
              className="project-frame relative h-[100svh] min-h-[560px] w-full bg-[#191a18]"
            >
              <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,15,14,0.45)_0%,transparent_32%,rgba(14,15,14,0.18)_50%,rgba(14,15,14,0.82)_100%)]" />
              <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between px-6 pb-10 pt-28 md:px-12 md:pb-14 md:pt-36">
                <div className="flex items-center justify-between border-b border-white/30 pb-4 text-[9px] uppercase tracking-[0.22em] text-white/85 md:text-[10px]">
                  <span>Featured residence · P1</span>
                  <span className="hidden sm:block">Saadiyat Island · Abu Dhabi</span>
                </div>
                <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
                  <div className="max-w-3xl">
                    <h3 className="font-serif text-[clamp(3.5rem,9vw,8rem)] font-light leading-[0.84] tracking-[-0.045em] text-white">
                      Project S
                    </h3>
                    <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/85 md:mt-7 md:text-base">
                      A refined coastal residence in harmony with the serene natural beauty of Saadiyat Island.
                    </p>
                  </div>
                  <div className="flex items-end justify-between gap-6 md:min-w-52 md:flex-col md:items-end">
                    <span className="text-[10px] uppercase tracking-[0.17em] text-white/75">Saadiyat Island, Abu Dhabi</span>
                    <span className="text-[10px] uppercase tracking-[0.17em] text-[#e7c39a]">Scroll to discover ↓</span>
                  </div>
                </div>
              </div>
            </ActiveFrameCanvas>

            <ActiveFrameCanvas
              afSrc="/activeframe/project-j_short_1920_h264.af"
              pinned
              className="project-frame relative h-[100svh] min-h-[560px] w-full bg-[#191a18]"
            >
              <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,15,14,0.45)_0%,transparent_32%,rgba(14,15,14,0.18)_50%,rgba(14,15,14,0.82)_100%)]" />
              <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between px-6 pb-10 pt-28 md:px-12 md:pb-14 md:pt-36">
                <div className="flex items-center justify-between border-b border-white/30 pb-4 text-[9px] uppercase tracking-[0.22em] text-white/85 md:text-[10px]">
                  <span>Featured residence · P3</span>
                  <span className="hidden sm:block">Jubail Island · Abu Dhabi</span>
                </div>
                <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
                  <div className="max-w-3xl">
                    <h3 className="font-serif text-[clamp(3.5rem,9vw,8rem)] font-light leading-[0.84] tracking-[-0.045em] text-white">
                      Project J
                    </h3>
                    <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/85 md:mt-7 md:text-base">
                      Bespoke villas set within the nature reserve of Jubail Island, shaped by a deep respect for their landscape.
                    </p>
                  </div>
                  <div className="flex items-end justify-between gap-6 md:min-w-52 md:flex-col md:items-end">
                    <span className="text-[10px] uppercase tracking-[0.17em] text-white/75">Jubail Island, Abu Dhabi</span>
                    <span className="text-[10px] uppercase tracking-[0.17em] text-[#e7c39a]">Scroll to discover ↓</span>
                  </div>
                </div>
              </div>
            </ActiveFrameCanvas>
          </div>

          <div className="px-6 md:px-12 max-w-7xl mx-auto">
            <div className="pt-28 md:pt-40">
              {/* The Den */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                <div className="lg:col-span-7 relative" data-scroll-reveal="card">
                  <div data-scroll-reveal="img" className="overflow-hidden rounded-sm">
                    <Image
                      src="/images/6a6f7b5b2c071c033534008c_the-den-6.webp"
                      alt="The Den by Lenval Properties"
                      width={1920}
                      height={1080}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </div>
                <div className="lg:col-span-5 flex flex-col gap-4 lg:pt-12">
                  <div data-scroll-reveal="p" className="text-xs uppercase tracking-wider opacity-50 font-mono">
                    P2
                  </div>
                  <h3 data-scroll-reveal="p" className="text-sm uppercase tracking-wider font-medium">
                    The Den
                  </h3>
                  <div data-scroll-reveal="p" className="font-serif text-xl text-neutral-300">
                    Exclusive Members Club
                  </div>
                  <p data-scroll-reveal="p" className="text-[15px] text-neutral-400 leading-relaxed mt-2">
                    An intimate members-only space designed to foster connection and inspire
                    conversation among like-minded visionaries.
                  </p>
                  <div data-scroll-reveal="ctn" className="mt-4">
                    <a
                      href="#"
                      className="group inline-flex items-center gap-3 text-xs uppercase tracking-widest font-medium border border-white/20 rounded-full px-6 py-3 hover:bg-white/5 transition-all duration-300"
                    >
                      <span>View Project</span>
                      <svg
                        className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                      >
                        <path d="M10.6688 6.27614L4.93109 12.0139L3.98828 11.0711L9.72601 5.33333H4.66883V4H12.0021V11.3333H10.6688V6.27614Z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            SECTION 6: SERVICES / PHILOSOPHY
        ============================================================ */}
        <section
          id="services"
          className="relative bg-[#f8f4ee] text-[#121212] py-24 md:py-32 overflow-hidden"
        >
          <div className="px-6 md:px-12 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
              {/* Left: Services Content */}
              <div>
                <div
                  className="text-xs uppercase tracking-widest text-[#d4a373] font-mono mb-3"
                  data-scroll-reveal="p"
                >
                  Our Values
                </div>
                <h2
                  data-scroll-reveal="h"
                  className="font-serif text-[clamp(2rem,4vw,3.5rem)] leading-[0.95] tracking-tight font-light mb-10"
                >
                  Guided by Vision, Driven by Standards
                </h2>

                {/* Accordion-style values */}
                <div className="space-y-6">
                  {[
                    {
                      title: 'Land Acquisition',
                      desc: 'Strategic identification of prime sites across Abu Dhabi with optimal potential for creating extraordinary living experiences.',
                    },
                    {
                      title: 'Design & Architecture',
                      desc: 'Collaboration with world-class architects and designers to craft spaces that inspire and endure beyond generations.',
                    },
                    {
                      title: 'Development Management',
                      desc: 'End-to-end project oversight ensuring every detail meets our exacting quality benchmarks, from foundation to finish.',
                    },
                    {
                      title: 'Asset Management',
                      desc: 'Long-term stewardship and value preservation for completed developments and the communities they serve.',
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      data-scroll-reveal="p"
                      className="border-t border-black/10 pt-5 group cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs font-mono text-neutral-400">
                              0{idx + 1}
                            </span>
                            <h4 className="text-base font-medium tracking-tight">
                              {item.title}
                            </h4>
                          </div>
                          <p className="text-[14px] text-neutral-500 leading-relaxed max-w-md">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress indicator */}
                <div className="mt-12" data-scroll-reveal="line">
                  <div className="h-px bg-[#d4a373]" />
                </div>
              </div>

              {/* Right: Image stack */}
              <div className="relative">
                <div data-scroll-reveal="img" className="overflow-hidden rounded-sm mb-6">
                  <Image
                    src="/images/6a6f7b46f7fdfc3470ed2f3f_project-s-4.webp"
                    alt="Lenval development"
                    width={800}
                    height={1000}
                    className="w-full h-auto object-cover"
                  />
                </div>
                <div
                  data-scroll-reveal="img"
                  className="overflow-hidden rounded-sm w-3/4 ml-auto"
                >
                  <Image
                    src="/images/6a6f7b5b2c071c033534008c_the-den-6.webp"
                    alt="Lenval architecture"
                    width={800}
                    height={600}
                    className="w-full h-auto object-cover"
                  />
                </div>

                {/* Decorative shadow */}
                <ShadowVideo
                  src="/videos/shadow_services.webm"
                  opacity={0.15}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            SECTION 7: CTA / INTEGRITY
        ============================================================ */}
        <section
          id="contact"
          className="relative bg-[#f8f4ee] text-[#121212] py-32 md:py-48"
        >
          <div className="px-6 md:px-12 max-w-7xl mx-auto text-center">
            <h2
              data-scroll-reveal="h"
              className="font-serif text-[clamp(2rem,4.5vw,3.5rem)] leading-[1] tracking-tight font-light max-w-3xl mx-auto mb-10"
            >
              &quot;Every Lenval development begins and ends with the highest standards
              <br />
              of integrity&quot;
            </h2>

            <p
              data-scroll-reveal="p"
              className="text-[15px] leading-relaxed text-neutral-600 max-w-xl mx-auto mb-10"
            >
              Integrity is the foundation of every decision we make. From identifying
              opportunities and selecting partners to managing construction and delivering
              completed projects, we are guided by transparency and accountability.
            </p>

            <div data-scroll-reveal="ctn">
              <button
                onClick={() => setIsCtaOpen(true)}
                className="group inline-flex items-center gap-3 text-xs uppercase tracking-widest font-medium border border-black/20 rounded-full px-8 py-4 hover:bg-black hover:text-[#f8f4ee] transition-all duration-500"
              >
                <span>Let&apos;s Talk</span>
                <svg
                  className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M10.6688 6.27614L4.93109 12.0139L3.98828 11.0711L9.72601 5.33333H4.66883V4H12.0021V11.3333H10.6688V6.27614Z" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* ============================================================
            FOOTER
        ============================================================ */}
        <footer className="bg-[#121212] text-[#f8f4ee] py-16 md:py-24">
          <div className="px-6 md:px-12 max-w-7xl mx-auto">
            {/* Top row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
              <div>
                <div className="text-xs uppercase tracking-widest text-neutral-500 mb-4 font-mono">
                  Office
                </div>
                <p className="text-sm text-neutral-300">
                  Abu Dhabi,
                  <br />
                  United Arab Emirates
                </p>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-neutral-500 mb-4 font-mono">
                  Reach Us
                </div>
                <a
                  href="mailto:info@lenvalproperties.com"
                  className="text-sm text-neutral-300 hover:text-[#d4a373] transition-colors block mb-1"
                >
                  info@lenvalproperties.com
                </a>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-neutral-500 mb-4 font-mono">
                  Follow Us
                </div>
                <div className="flex gap-4">
                  <a
                    href="https://www.linkedin.com/company/lenval-properties/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-neutral-300 hover:text-[#d4a373] transition-colors"
                  >
                    LinkedIn
                  </a>
                  <a
                    href="https://www.instagram.com/lenvalproperties/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-neutral-300 hover:text-[#d4a373] transition-colors"
                  >
                    Instagram
                  </a>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/10 mb-8" />

            {/* Bottom row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-neutral-500">
              <div className="flex items-center gap-3">
                <span className="font-serif text-lg text-[#f8f4ee] italic">L</span>
                <span className="tracking-[0.3em] uppercase font-medium text-[#f8f4ee]">
                  Lenval
                </span>
              </div>
              <div>
                &copy; {new Date().getFullYear()}. Lenval Group. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
