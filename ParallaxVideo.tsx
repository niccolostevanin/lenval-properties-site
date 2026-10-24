'use client';

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ParallaxVideoProps {
  src: string;
  poster?: string;
  className?: string;
  overlayGradient?: 'top' | 'bottom' | 'both' | 'none';
  parallaxAmount?: number;
}

export default function ParallaxVideo({
  src,
  poster,
  className = '',
  overlayGradient = 'none',
  parallaxAmount = 15,
}: ParallaxVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // GSAP parallax on scroll
  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        video,
        { yPercent: -parallaxAmount },
        {
          yPercent: parallaxAmount,
          ease: 'none',
          scrollTrigger: {
            trigger: container,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    }, container);

    return () => ctx.revert();
  }, [parallaxAmount]);

  // IntersectionObserver to play/pause video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const showTop = overlayGradient === 'top' || overlayGradient === 'both';
  const showBottom = overlayGradient === 'bottom' || overlayGradient === 'both';

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        autoPlay
        className="absolute inset-0 w-full h-full object-cover will-change-transform"
        style={{ top: `-${parallaxAmount}%`, height: `${100 + parallaxAmount * 2}%` }}
      />

      {/* Top gradient overlay */}
      {showTop && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1/3"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)',
          }}
        />
      )}

      {/* Bottom gradient overlay */}
      {showBottom && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/3"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
          }}
        />
      )}
    </div>
  );
}
