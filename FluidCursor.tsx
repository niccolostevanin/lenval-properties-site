'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

export default function FluidCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const simRes = 128;
    const dyeRes = 512;
    const densityDissipation = 0.98;
    const velocityDissipation = 0.98;
    const splatRadius = 0.0035;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'low-power',
    });
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.setPixelRatio(1);

    const camera = new THREE.Camera();
    const quadGeom = new THREE.BufferGeometry();
    quadGeom.setAttribute(
      'position',
      new THREE.Float32BufferAttribute([-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0], 3)
    );
    quadGeom.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 1, 1], 2));
    quadGeom.setIndex([0, 1, 2, 2, 1, 3]);

    const baseVertex = `
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform vec2 texelSize;

      void main() {
        vUv = uv;
        vL = vUv - vec2(texelSize.x, 0.0);
        vR = vUv + vec2(texelSize.x, 0.0);
        vT = vUv + vec2(0.0, texelSize.y);
        vB = vUv - vec2(0.0, texelSize.y);
        gl_Position = vec4(position, 1.0);
      }
    `;

    const createFBO = (w: number, h: number) =>
      new THREE.WebGLRenderTarget(w, h, {
        type: THREE.HalfFloatType,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        depthBuffer: false,
        stencilBuffer: false,
      });

    const createDoubleFBO = (w: number, h: number) => {
      let fbo1 = createFBO(w, h);
      let fbo2 = createFBO(w, h);
      return {
        get read() {
          return fbo1;
        },
        get write() {
          return fbo2;
        },
        swap() {
          const temp = fbo1;
          fbo1 = fbo2;
          fbo2 = temp;
        },
      };
    };

    const density = createDoubleFBO(dyeRes, dyeRes);
    const velocity = createDoubleFBO(simRes, simRes);
    const divergence = createFBO(simRes, simRes);
    const pressure = createDoubleFBO(simRes, simRes);

    const quad = new THREE.Mesh(quadGeom);

    const createMat = (frag: string, uniforms: any) =>
      new THREE.ShaderMaterial({
        vertexShader: baseVertex,
        fragmentShader: frag,
        uniforms: {
          texelSize: { value: new THREE.Vector2(1 / simRes, 1 / simRes) },
          ...uniforms,
        },
        blending: THREE.NoBlending,
        depthTest: false,
        depthWrite: false,
      });

    // Splat
    const splatMat = createMat(
      `
      varying vec2 vUv;
      uniform sampler2D uTarget;
      uniform float uAspect;
      uniform vec3 uColor;
      uniform vec2 uPoint;
      uniform float uRadius;

      void main() {
        vec2 p = vUv - uPoint;
        p.x *= uAspect;
        vec3 splat = exp(-dot(p, p) / uRadius) * uColor;
        vec3 base = texture2D(uTarget, vUv).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
      }
    `,
      {
        uTarget: { value: null },
        uAspect: { value: window.innerWidth / window.innerHeight },
        uColor: { value: new THREE.Vector3() },
        uPoint: { value: new THREE.Vector2() },
        uRadius: { value: splatRadius },
      }
    );

    // Advection
    const advectMat = createMat(
      `
      varying vec2 vUv;
      uniform sampler2D uVelocity;
      uniform sampler2D uSource;
      uniform float uDt;
      uniform float uDissipation;
      uniform vec2 texelSize;

      void main() {
        vec2 coord = vUv - uDt * texture2D(uVelocity, vUv).xy * texelSize;
        gl_FragColor = vec4(uDissipation * texture2D(uSource, coord).xyz, 1.0);
      }
    `,
      {
        uVelocity: { value: null },
        uSource: { value: null },
        uDt: { value: 0.016 },
        uDissipation: { value: 0.98 },
      }
    );

    // Divergence
    const divMat = createMat(
      `
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      varying vec2 vUv;
      uniform sampler2D uVelocity;

      void main() {
        float L = texture2D(uVelocity, vL).x;
        float R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y;
        float B = texture2D(uVelocity, vB).y;
        vec2 C = texture2D(uVelocity, vUv).xy;
        if (vL.x < 0.0) L = -C.x;
        if (vR.x > 1.0) R = -C.x;
        if (vT.y > 1.0) T = -C.y;
        if (vB.y < 0.0) B = -C.y;
        gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
      }
    `,
      { uVelocity: { value: null } }
    );

    // Jacobi Pressure Solver
    const pressureMat = createMat(
      `
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uDivergence;
      varying vec2 vUv;

      void main() {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).y;
        float B = texture2D(uPressure, vB).y;
        float div = texture2D(uDivergence, vUv).x;
        gl_FragColor = vec4((L + R + B + T - div) * 0.25, 0.0, 0.0, 1.0);
      }
    `,
      {
        uPressure: { value: null },
        uDivergence: { value: null },
      }
    );

    // Gradient Subtraction
    const gradMat = createMat(
      `
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      varying vec2 vUv;
      uniform sampler2D uPressure;
      uniform sampler2D uVelocity;

      void main() {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).y;
        float B = texture2D(uPressure, vB).y;
        gl_FragColor = vec4(texture2D(uVelocity, vUv).xy - vec2(R - L, T - B), 0.0, 1.0);
      }
    `,
      {
        uPressure: { value: null },
        uVelocity: { value: null },
      }
    );

    // Output Display
    const displayMat = createMat(
      `
      varying vec2 vUv;
      uniform sampler2D uDensity;
      uniform vec3 uColor;
      uniform float uIntensity;

      void main() {
        float density = texture2D(uDensity, vUv).r;
        float a = clamp(density * uIntensity, 0.0, 0.4);
        gl_FragColor = vec4(uColor * a, a);
      }
    `,
      {
        uDensity: { value: null },
        uColor: { value: new THREE.Vector3(0.85, 0.82, 0.76) },
        uIntensity: { value: 1.2 },
      }
    );

    const pointers: Array<{ x: number; y: number; dx: number; dy: number }> = [];
    let lastX: number | null = null;
    let lastY: number | null = null;
    let idleCounter = 0;

    const renderPass = (mat: THREE.Material, target: THREE.WebGLRenderTarget | null) => {
      quad.material = mat;
      renderer.setRenderTarget(target);
      renderer.render(quad, camera);
    };

    const onPointerMove = (e: PointerEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      if (lastX !== null && lastY !== null) {
        pointers.push({
          x: x / window.innerWidth,
          y: 1 - y / window.innerHeight,
          dx: (x - lastX) * 5.0,
          dy: (lastY - y) * 5.0,
        });
        idleCounter = 0;
      }
      lastX = x;
      lastY = y;
    };

    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      splatMat.uniforms.uAspect.value = window.innerWidth / window.innerHeight;
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('resize', onResize);

    const ticker = () => {
      if (idleCounter++ > 240 && pointers.length === 0) return;

      // Splat input
      pointers.splice(0).forEach((p) => {
        // Velocity splat
        splatMat.uniforms.uTarget.value = velocity.read.texture;
        splatMat.uniforms.uPoint.value.set(p.x, p.y);
        splatMat.uniforms.uColor.value.set(p.dx, p.dy, 0.0);
        splatMat.uniforms.uRadius.value = splatRadius;
        renderPass(splatMat, velocity.write);
        velocity.swap();

        // Density splat
        splatMat.uniforms.uTarget.value = density.read.texture;
        splatMat.uniforms.uColor.value.set(1.0, 0.95, 0.9);
        splatMat.uniforms.uRadius.value = splatRadius * 1.5;
        renderPass(splatMat, density.write);
        density.swap();
      });

      // Advect Velocity
      advectMat.uniforms.uVelocity.value = velocity.read.texture;
      advectMat.uniforms.uSource.value = velocity.read.texture;
      advectMat.uniforms.uDissipation.value = velocityDissipation;
      renderPass(advectMat, velocity.write);
      velocity.swap();

      // Advect Density
      advectMat.uniforms.uVelocity.value = velocity.read.texture;
      advectMat.uniforms.uSource.value = density.read.texture;
      advectMat.uniforms.uDissipation.value = densityDissipation;
      renderPass(advectMat, density.write);
      density.swap();

      // Divergence
      divMat.uniforms.uVelocity.value = velocity.read.texture;
      renderPass(divMat, divergence);

      // Pressure Solve (16 Jacobi iterations)
      pressureMat.uniforms.uDivergence.value = divergence.texture;
      for (let i = 0; i < 16; i++) {
        pressureMat.uniforms.uPressure.value = pressure.read.texture;
        renderPass(pressureMat, pressure.write);
        pressure.swap();
      }

      // Gradient subtraction
      gradMat.uniforms.uPressure.value = pressure.read.texture;
      gradMat.uniforms.uVelocity.value = velocity.read.texture;
      renderPass(gradMat, velocity.write);
      velocity.swap();

      // Display to screen
      displayMat.uniforms.uDensity.value = density.read.texture;
      renderPass(displayMat, null);
    };

    gsap.ticker.add(ticker);

    return () => {
      gsap.ticker.remove(ticker);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      density.read.dispose();
      density.write.dispose();
      velocity.read.dispose();
      velocity.write.dispose();
      divergence.dispose();
      pressure.read.dispose();
      pressure.write.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-60"
    />
  );
}
