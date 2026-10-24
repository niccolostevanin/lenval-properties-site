'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const vertexShader = `
  attribute vec2 repairUv;
  attribute float repairId;
  varying vec2 vRepairUv;
  varying float vRepairId;
  varying vec3 vWorld;
  varying vec3 vNormal;
  varying vec4 vReference;
  uniform mat4 uReference;

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vRepairUv = repairUv;
    vRepairId = repairId;
    vWorld = world.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vReference = uReference * world;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragmentShader = `
  #include <packing>
  varying vec2 vRepairUv;
  varying float vRepairId;
  varying vec3 vWorld;
  varying vec3 vNormal;
  varying vec4 vReference;
  uniform sampler2D uRepairA;
  uniform sampler2D uRepairMaskA;
  uniform sampler2D uRepairB;
  uniform sampler2D uRepairMaskB;
  uniform float uRepairProgress;
  uniform sampler2D uImage;
  uniform sampler2D uVideo;
  uniform sampler2D uDepth;
  uniform float uUseVideo;
  uniform float uKind;

  const vec3 tint = vec3(248.0, 244.0, 238.0) / 255.0;
  const vec3 white = vec3(1.0);

  void main() {
    vec3 n = normalize(vNormal);
    vec2 pixel = vec2(859.0 + 1200.0 * vWorld.x / -vWorld.z, 800.0 - 1200.0 * vWorld.y / -vWorld.z);
    vec2 uv = vec2(pixel.x / 1718.0, 1.0 - pixel.y / 1258.0);
    vec3 ref = vReference.xyz / vReference.w * 0.5 + 0.5;
    float saved = unpackRGBAToDepth(texture2D(uDepth, ref.xy));
    float visible = step(ref.z - 0.000035, saved);
    float facing = smoothstep(0.015, 0.11, dot(n, normalize(-vWorld)));
    float inFrame = step(28.0, pixel.x) * step(pixel.x, 1718.0) * step(0.0, pixel.y) * step(pixel.y, 1258.0) * step(0.0, -vWorld.z);
    float use = visible * facing * inFrame;
    if (uKind == 6.0) use = 0.0;
    if (uKind == 5.0) use *= smoothstep(28.0, 90.0, pixel.x) * smoothstep(0.0, 70.0, 1718.0 - pixel.x) * smoothstep(0.0, 60.0, 1258.0 - pixel.y);
    vec3 ink = clamp(texture2D(uImage, uv).rgb / tint, 0.0, 1.0);

    vec2 videoPixel = pixel * vec2(1.15275, 1.15175) + vec2(-52.0, -116.0);
    vec2 videoUv = vec2(videoPixel.x / 1920.0, 1.0 - videoPixel.y / 1076.0);
    float insideVideo = step(0.0, videoPixel.x) * step(videoPixel.x, 1920.0) * step(0.0, videoPixel.y) * step(videoPixel.y, 1076.0);
    vec3 videoInk = clamp(texture2D(uVideo, clamp(videoUv, 0.0, 1.0)).rgb / 0.996, 0.0, 1.0);
    videoInk = mix(white, videoInk, insideVideo);
    ink = mix(ink, videoInk, uUseVideo);

    vec3 repair = white;
    float repairMask = 0.0;
    if (vRepairId > 0.5 && vRepairId < 1.5) {
      repair = texture2D(uRepairA, vRepairUv).rgb;
      repairMask = texture2D(uRepairMaskA, vRepairUv).r;
    } else if (vRepairId > 1.5) {
      repair = texture2D(uRepairB, vRepairUv).rgb;
      repairMask = texture2D(uRepairMaskB, vRepairUv).r;
    }
    repair = clamp(repair / tint, 0.0, 1.0);
    vec3 paper = mix(white, repair, repairMask * smoothstep(0.55, 0.98, uRepairProgress));
    gl_FragColor = vec4(mix(paper, ink, use), 1.0);
  }
`;

const SURFACE_RANGES: Record<string, [[number, number], [number, number], [number, number]]> = {
  plaster: [[0, 3447], [13788, 3447], [27576, 1704]],
  stone: [[30984, 666], [33648, 666], [36312, 318]],
  glass: [[36948, 384], [38484, 384], [40020, 144]],
  timber: [[40308, 309], [41544, 309], [42780, 147]],
  metal: [[43076, 2580], [53396, 2580], [63716, 1134]],
  ground: [[65984, 12], [66032, 12], [66080, 6]],
  foliage: [[66092, 7803], [97304, 7803], [128516, 2601]],
};

export default function WebGLSketchScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isDisposed = false;
    const durM = 0.8;
    const sketchDir = '/sketch/';

    const s = { width: 1718, height: 1258, focal: 1200, cx: 859, cy: 800, crop: 28 };

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setClearColor(0xffffff, 1);
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const g = 0.1;
    const refCamera = new THREE.PerspectiveCamera();
    refCamera.projectionMatrix.makePerspective(
      (-(s.cx - s.crop) / s.focal) * g,
      ((s.width - s.cx) / s.focal) * g,
      (s.cy / s.focal) * g,
      (-(s.height - s.cy) / s.focal) * g,
      g,
      180
    );
    refCamera.projectionMatrixInverse.copy(refCamera.projectionMatrix).invert();
    refCamera.updateMatrixWorld();

    const camera = refCamera.clone();
    const scene = new THREE.Scene();

    const depthTarget = new THREE.WebGLRenderTarget(1690, 1258, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
    });

    const video = document.createElement('video');
    Object.assign(video, {
      crossOrigin: 'anonymous',
      muted: true,
      defaultMuted: true,
      playsInline: true,
      preload: 'auto',
      hidden: true,
      src: sketchDir + 'sketch-drawing.mp4',
    });

    const textureLoader = new THREE.TextureLoader();
    const loadTex = (name: string) =>
      textureLoader.loadAsync(sketchDir + name).then((tex) => {
        tex.colorSpace = THREE.NoColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        return tex;
      });

    const coords = { x: 0, y: 0, scroll: 0 };
    const quickToX = gsap.quickTo(coords, 'x', { duration: durM, ease: 'power2.out' });
    const quickToY = gsap.quickTo(coords, 'y', { duration: durM, ease: 'power2.out' });

    const targetLook = new THREE.Vector3(0, 0, -24);
    const cameraOffset = new THREE.Vector3();
    const axisY = new THREE.Vector3(0, 1, 0);
    const axisX = new THREE.Vector3(1, 0, 0);

    let uniformsObj: any = null;
    let needsRender = true;
    let lastKey = '';

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') {
        quickToX((e.clientX / window.innerWidth) * 2 - 1);
        quickToY((e.clientY / window.innerHeight) * 2 - 1);
      }
    };

    const handleMouseLeave = () => {
      quickToX(0);
      quickToY(0);
    };

    const renderLoop = () => {
      if (isDisposed) return;

      const key = `${coords.x}/${coords.y}/${coords.scroll}`;
      if (!needsRender && video.paused && key === lastKey) {
        return;
      }
      needsRender = false;
      lastKey = key;

      const angleX = (coords.x * Math.PI) / 90;
      const angleY = (coords.y * Math.PI) / 135 + (5 * coords.scroll * Math.PI) / 180;

      cameraOffset.set(0, 0, 24).applyAxisAngle(axisY, angleX).applyAxisAngle(axisX, angleY);
      camera.position.copy(targetLook).add(cameraOffset);
      camera.lookAt(targetLook);
      camera.updateMatrixWorld();

      if (uniformsObj && uniformsObj.uRepairProgress) {
        uniformsObj.uRepairProgress.value =
          uniformsObj.uUseVideo.value && video.duration ? video.currentTime / video.duration : 1;
      }

      renderer.render(scene, camera);
    };

    gsap.ticker.add(renderLoop);

    // Load binary surface data and repair layout
    Promise.all([
      fetch(sketchDir + 'sketch-surfaces.bin').then((r) => r.arrayBuffer()),
      fetch(sketchDir + 'sketch-repair-layout.json').then((r) => r.json()),
      loadTex('architecture-sketch.png'),
      loadTex('repair-004.png'),
      loadTex('repair-004-mask.png'),
      loadTex('repair-058.png'),
      loadTex('repair-058-mask.png'),
    ])
      .then(([buffer, layout, sketchTex, r4, r4m, r58, r58m]) => {
        if (isDisposed) return;

        sketchTex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

        const refMatrix = new THREE.Matrix4().multiplyMatrices(
          refCamera.projectionMatrix,
          refCamera.matrixWorldInverse
        );

        uniformsObj = {
          uImage: { value: sketchTex },
          uVideo: { value: sketchTex },
          uUseVideo: { value: 0 },
          uDepth: { value: depthTarget.texture },
          uReference: { value: refMatrix },
          uRepairA: { value: r4 },
          uRepairMaskA: { value: r4m },
          uRepairB: { value: r58 },
          uRepairMaskB: { value: r58m },
          uRepairProgress: { value: 1 },
        };

        const patchMap = new Map<number, { id: number; uv: number[] }>();
        layout.patches.forEach((p: any, pIdx: number) => {
          p.triangles.forEach((triIdx: number, subIdx: number) => {
            patchMap.set(triIdx, {
              id: pIdx + 1,
              uv: p.uv.slice(6 * subIdx, 6 * subIdx + 6),
            });
          });
        });

        Object.entries(SURFACE_RANGES).forEach(([name, [posRange, normRange, idxRange]], kindIdx) => {
          const posRaw = new Float32Array(buffer, posRange[0], posRange[1]);
          const normRaw = new Float32Array(buffer, normRange[0], normRange[1]);
          const idxRaw = new Uint16Array(buffer, idxRange[0], idxRange[1]);

          const positions: number[] = [];
          const normals: number[] = [];
          const repairUvs: number[] = [];
          const repairIds: number[] = [];
          const indices: number[] = [];
          const dedup = new Map<string, number>();

          idxRaw.forEach((vertIdx, faceIdx) => {
            const patch = name === layout.kind && patchMap.get(Math.floor(faceIdx / 3));
            const pId = patch ? patch.id : 0;
            const keyStr = `${vertIdx}/${pId}`;

            if (!dedup.has(keyStr)) {
              dedup.set(keyStr, positions.length / 3);
              positions.push(posRaw[3 * vertIdx], posRaw[3 * vertIdx + 1], posRaw[3 * vertIdx + 2]);
              normals.push(normRaw[3 * vertIdx], normRaw[3 * vertIdx + 1], normRaw[3 * vertIdx + 2]);
              if (patch) {
                const sub = (faceIdx % 3) * 2;
                repairUvs.push(patch.uv[sub], patch.uv[sub + 1]);
              } else {
                repairUvs.push(0, 0);
              }
              repairIds.push(pId);
            }
            indices.push(dedup.get(keyStr)!);
          });

          const geom = new THREE.BufferGeometry();
          geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
          geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
          geom.setAttribute('repairUv', new THREE.Float32BufferAttribute(repairUvs, 2));
          geom.setAttribute('repairId', new THREE.Float32BufferAttribute(repairIds, 1));
          geom.setIndex(indices);

          const mat = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
              ...uniformsObj,
              uKind: { value: kindIdx },
            },
          });

          scene.add(new THREE.Mesh(geom, mat));
        });

        // Depth pre-pass
        scene.overrideMaterial = new THREE.MeshDepthMaterial({
          depthPacking: THREE.RGBADepthPacking,
        });
        renderer.setRenderTarget(depthTarget);
        renderer.render(scene, refCamera);
        renderer.setRenderTarget(null);
        scene.overrideMaterial.dispose();
        scene.overrideMaterial = null;

        // Video texture setup
        video.addEventListener(
          'loadeddata',
          () => {
            if (isDisposed) return;
            const videoTex = new THREE.VideoTexture(video);
            videoTex.colorSpace = THREE.NoColorSpace;
            videoTex.minFilter = THREE.LinearFilter;
            videoTex.magFilter = THREE.LinearFilter;
            videoTex.needsUpdate = true;
            uniformsObj.uVideo.value = videoTex;
            uniformsObj.uUseVideo.value = 1;
            needsRender = true;

            gsap.to(canvas, { opacity: 1, duration: durM, ease: 'power2.out' });

            const playVideo = () => {
              video.currentTime = 0;
              needsRender = true;
              video.play().catch(() => {
                uniformsObj.uUseVideo.value = 0;
              });
            };

            ScrollTrigger.create({
              trigger: canvas,
              start: 'top bottom',
              end: 'bottom top',
              onEnter: playVideo,
              onEnterBack: playVideo,
              onLeave: () => video.pause(),
              onLeaveBack: () => video.pause(),
            });
          },
          { once: true }
        );

        // Resize observer
        const resizeObserver = new ResizeObserver(() => {
          if (!canvas) return;
          const w = canvas.clientWidth;
          const h = canvas.clientHeight;
          renderer.setSize(w, h, false);
          needsRender = true;
        });
        resizeObserver.observe(canvas);

        // Scroll scrub parallax
        gsap.fromTo(
          coords,
          { scroll: -1 },
          {
            scroll: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: canvas.closest('.section') || canvas,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );

        window.addEventListener('pointermove', handlePointerMove);
        document.documentElement.addEventListener('mouseleave', handleMouseLeave);
      })
      .catch((err) => {
        console.error('WebGL Sketch Scene init error:', err);
      });

    return () => {
      isDisposed = true;
      gsap.ticker.remove(renderLoop);
      window.removeEventListener('pointermove', handlePointerMove);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      video.pause();
      renderer.dispose();
      depthTarget.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[600px] md:h-[750px] lg:h-[850px] flex items-center justify-center overflow-hidden">
      <canvas
        ref={canvasRef}
        data-skech-scene
        className="w-full h-full object-contain cursor-crosshair opacity-0 transition-opacity"
      />
    </div>
  );
}
