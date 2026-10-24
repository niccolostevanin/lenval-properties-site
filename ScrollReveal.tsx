'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Attempt to import SplitText (GSAP Club plugin — may not be available)
let SplitText: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  SplitText = require('gsap/SplitText').SplitText;
} catch {
  // SplitText not available — fallback animations will be used
}

gsap.registerPlugin(ScrollTrigger);
if (SplitText) gsap.registerPlugin(SplitText);

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ScrollRevealProps {
  /** Animation variant */
  type: 'h' | 'p' | 'ctn' | 'img' | 'card' | 'line';
  children: React.ReactNode;
  className?: string;
  /** Extra delay in seconds before the animation starts */
  delay?: number;
  /** Override default duration (1.2 s) */
  duration?: number;
  /** If true the animation plays only once (default: true) */
  once?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Defaults                                                           */
/* ------------------------------------------------------------------ */

const DEFAULT_DURATION = 1.2;
const DEFAULT_EASE = 'power4.out';
const DEFAULT_STAGGER = 0.1;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  type,
  children,
  className = '',
  delay = 0,
  duration = DEFAULT_DURATION,
  once = true,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  /* ---- animation builder (memoised to avoid stale closures) ---- */
  const buildAnimation = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const triggerDefaults: ScrollTrigger.Vars = {
      trigger: el,
      start: 'top 90%',
      toggleActions: once ? 'play none none none' : 'play none none reverse',
    };

    /* ------------------------------------------------------------ */
    /*  HEADING  — word-by-word slide-up                             */
    /* ------------------------------------------------------------ */
    if (type === 'h') {
      if (SplitText) {
        const split = new SplitText(el, {
          type: 'lines,words',
          linesClass: 'sr-line',
          wordsClass: 'sr-word',
        });

        // Overflow hidden on each line wrapper
        gsap.set(split.lines, { overflow: 'hidden' });

        gsap.fromTo(
          split.words,
          { yPercent: 100, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration,
            ease: DEFAULT_EASE,
            stagger: DEFAULT_STAGGER,
            delay,
            scrollTrigger: triggerDefaults,
          },
        );
      } else {
        // Fallback: animate the whole element
        gsap.fromTo(
          el,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration,
            ease: DEFAULT_EASE,
            delay,
            scrollTrigger: triggerDefaults,
          },
        );
      }
      return;
    }

    /* ------------------------------------------------------------ */
    /*  PARAGRAPH  — line-by-line slide-up                           */
    /* ------------------------------------------------------------ */
    if (type === 'p') {
      if (SplitText) {
        const split = new SplitText(el, {
          type: 'lines',
          linesClass: 'sr-line',
        });

        gsap.fromTo(
          split.lines,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration,
            ease: DEFAULT_EASE,
            stagger: DEFAULT_STAGGER,
            delay,
            scrollTrigger: triggerDefaults,
          },
        );
      } else {
        gsap.fromTo(
          el,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration,
            ease: DEFAULT_EASE,
            delay,
            scrollTrigger: triggerDefaults,
          },
        );
      }
      return;
    }

    /* ------------------------------------------------------------ */
    /*  CONTAINER  — simple fade-up                                  */
    /* ------------------------------------------------------------ */
    if (type === 'ctn') {
      gsap.fromTo(
        el,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration,
          ease: DEFAULT_EASE,
          delay,
          scrollTrigger: triggerDefaults,
        },
      );
      return;
    }

    /* ------------------------------------------------------------ */
    /*  IMAGE  — clipPath wipe + inner scale                         */
    /* ------------------------------------------------------------ */
    if (type === 'img') {
      const inner = el.querySelector('img, video, picture, [data-sr-inner]');

      gsap.fromTo(
        el,
        { clipPath: 'inset(100% 0 0 0)' },
        {
          clipPath: 'inset(0% 0 0 0)',
          duration,
          ease: DEFAULT_EASE,
          delay,
          scrollTrigger: triggerDefaults,
        },
      );

      if (inner) {
        gsap.fromTo(
          inner,
          { scale: 1.15 },
          {
            scale: 1,
            duration: duration * 1.2,
            ease: DEFAULT_EASE,
            delay,
            scrollTrigger: triggerDefaults,
          },
        );
      }
      return;
    }

    /* ------------------------------------------------------------ */
    /*  CARD  — yPercent slide-up                                    */
    /* ------------------------------------------------------------ */
    if (type === 'card') {
      gsap.fromTo(
        el,
        { yPercent: 35 },
        {
          yPercent: 0,
          duration,
          ease: DEFAULT_EASE,
          delay,
          scrollTrigger: triggerDefaults,
        },
      );
      return;
    }

    /* ------------------------------------------------------------ */
    /*  LINE  — horizontal scale reveal                              */
    /* ------------------------------------------------------------ */
    if (type === 'line') {
      gsap.fromTo(
        el,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration,
          ease: DEFAULT_EASE,
          delay,
          scrollTrigger: triggerDefaults,
        },
      );
      return;
    }
  }, [type, delay, duration, once]);

  /* ---- lifecycle ---- */
  useEffect(() => {
    // Small rAF deferral so DOM is painted & measurable
    const id = requestAnimationFrame(() => {
      buildAnimation();
    });

    return () => {
      cancelAnimationFrame(id);
      // Kill any ScrollTriggers attached to this element
      ScrollTrigger.getAll()
        .filter((st) => st.trigger === wrapperRef.current)
        .forEach((st) => st.kill());
    };
  }, [buildAnimation]);

  /* ---- initial inline styles (pre-animation state) ---- */
  const initialStyle: React.CSSProperties = (() => {
    switch (type) {
      case 'h':
      case 'p':
        // When SplitText is available the words/lines start hidden;
        // without it the wrapper itself starts hidden.
        return SplitText ? {} : { opacity: 0 };
      case 'ctn':
        return { opacity: 0 };
      case 'img':
        return { clipPath: 'inset(100% 0 0 0)', overflow: 'hidden' };
      case 'card':
        return {};
      case 'line':
        return { transformOrigin: 'left center', scaleX: 0 };
      default:
        return {};
    }
  })();

  return (
    <div ref={wrapperRef} className={className} style={initialStyle}>
      {children}
    </div>
  );
};

export default ScrollReveal;
