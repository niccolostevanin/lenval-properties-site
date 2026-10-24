'use client';

import { useRef, useEffect } from 'react';

interface ShadowVideoProps {
  src: string;
  poster?: string;
  className?: string;
  flipH?: boolean;
  opacity?: number;
}

export default function ShadowVideo({
  src,
  poster,
  className = '',
  flipH = false,
  opacity = 0.3,
}: ShadowVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

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

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      autoPlay
      className={`absolute pointer-events-none will-change-transform ${className}`}
      style={{
        opacity,
        mixBlendMode: 'multiply',
        transform: flipH ? 'scaleX(-1)' : undefined,
      }}
    />
  );
}
