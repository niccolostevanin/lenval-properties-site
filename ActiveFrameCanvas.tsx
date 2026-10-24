'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ActiveFrame } from '@/lib/ActiveFrame';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ActiveFrameCanvasProps {
  afSrc: string;
  videoFallback?: string;
  className?: string;
  pinned?: boolean;
  children?: React.ReactNode;
}

export default function ActiveFrameCanvas({
  afSrc,
  videoFallback,
  className = '',
  pinned = false,
  children,
}: ActiveFrameCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let activeFrameInstance: ActiveFrame | null = null;
    let trigger: ScrollTrigger | null = null;
    let resizeObserver: ResizeObserver | null = null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const createScrollTrigger = (onUpdate: (progress: number) => void) =>
      ScrollTrigger.create({
        trigger: container,
        start: pinned ? 'top top' : 'top 75%',
        end: pinned ? () => `+=${window.innerHeight * 2}` : 'bottom 35%',
        scrub: pinned ? 1.2 : 1.6,
        pin: pinned ? container : false,
        pinSpacing: true,
        anticipatePin: pinned ? 1 : 0,
        invalidateOnRefresh: true,
        onUpdate: (self) => onUpdate(self.progress),
      });

    const isWebCodecsSupported =
      typeof window !== 'undefined' && 'VideoDecoder' in window;

    if (isWebCodecsSupported && afSrc) {
      const resizeCanvas = () => {
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(canvas.clientWidth * pixelRatio);
        canvas.height = Math.round(canvas.clientHeight * pixelRatio);
      };
      resizeCanvas();
      resizeObserver = new ResizeObserver(resizeCanvas);
      resizeObserver.observe(container);

      const drawFrame = (frame: VideoFrame) => {
        const w = frame.displayWidth ?? frame.codedWidth;
        const h = frame.displayHeight ?? frame.codedHeight;
        const scale = Math.max(canvas.width / w, canvas.height / h);
        const nw = w * scale;
        const nh = h * scale;
        const ox = (canvas.width - nw) / 2;
        const oy = (canvas.height - nh) / 2;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(frame, 0, 0, w, h, ox, oy, nw, nh);
      };

      activeFrameInstance = new ActiveFrame(afSrc, {
        process: (frame) => drawFrame(frame),
      });

      activeFrameInstance.loading
        .then(() => {
          if (!activeFrameInstance || !activeFrameInstance.manifest) return;
          activeFrameInstance.setFrame(0);

          trigger = createScrollTrigger((progress) => {
            if (activeFrameInstance && activeFrameInstance.manifest) {
              const total = activeFrameInstance.manifest.totalFrames - 1;
              activeFrameInstance.setFrame(Math.round(progress * total));
            }
          });
        })
        .catch(() => {
          // fallback to video element if error
        });
    } else if (videoRef.current) {
      const vid = videoRef.current;
      trigger = createScrollTrigger((progress) => {
        if (vid.duration) {
          vid.currentTime = progress * vid.duration;
        }
      });
    }

    return () => {
      trigger?.kill();
      resizeObserver?.disconnect();
      activeFrameInstance?.destroy();
    };
  }, [afSrc]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        data-activeframe="canvas"
        className="w-full h-full object-cover"
      />
      {children}
      {videoFallback && (
        <video
          ref={videoRef}
          src={videoFallback}
          muted
          playsInline
          preload="auto"
          className="hidden"
        />
      )}
    </div>
  );
}
