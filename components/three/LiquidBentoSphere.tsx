'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

interface LiquidBentoSphereProps {
  theme: 'dark' | 'light';
}

function detectSoftwareGl(): boolean {
  if (typeof document === 'undefined') return true;
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export default function LiquidBentoSphere({ theme }: LiquidBentoSphereProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const themeRef = useRef<'dark' | 'light'>(theme);
  const matsRef = useRef<{
    outer: THREE.MeshPhysicalMaterial;
    inner: THREE.MeshStandardMaterial;
  } | null>(null);

  useEffect(() => {
    themeRef.current = theme;
    if (!matsRef.current) return;
    if (theme === 'dark') {
      matsRef.current.outer.color.set('#141418');
      matsRef.current.inner.color.set('#282830');
    } else {
      matsRef.current.outer.color.set('#1c1c22');
      matsRef.current.inner.color.set('#3a3a45');
    }
  }, [theme]);

  useEffect(() => {
    const mount = containerRef.current;
    if (!mount) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSoftwareGl = detectSoftwareGl();

    const scene = new THREE.Scene();
    const width = mount.clientWidth || 520;
    const height = mount.clientHeight || 420;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 50);
    camera.position.set(0, 0, 5.1);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(width, height);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    mount.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmrem.dispose();

    scene.add(new THREE.HemisphereLight(0xdbe6ff, 0x101014, 1.1));
    const key = new THREE.DirectionalLight(0xffffff, 2.8);
    key.position.set(3, 4, 5);
    scene.add(key);

    const uniforms = {
      uTime: { value: 0 },
      uHover: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    };

    const outerMat = new THREE.MeshPhysicalMaterial({
      color: themeRef.current === 'dark' ? '#141418' : '#1c1c22',
      roughness: 0.24,
      metalness: 0.32,
      clearcoat: 0.85,
      clearcoatRoughness: 0.18,
    });

    outerMat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uniforms.uTime;
      shader.uniforms.uHover = uniforms.uHover;
      shader.uniforms.uMouse = uniforms.uMouse;

      shader.vertexShader =
        `
        uniform float uTime;
        uniform float uHover;
        uniform vec2 uMouse;
        ` + shader.vertexShader;

      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        float freq = 2.6 + uHover * 1.4;
        float amp = 0.22 + uHover * 0.16;
        float n1 = sin(transformed.x * freq + uTime * 1.3 + uMouse.x * 2.0)
                 * cos(transformed.y * freq - uTime * 1.1 + uMouse.y * 2.0)
                 * sin(transformed.z * freq + uTime * 0.9);
        float n2 = cos((transformed.x + transformed.z) * 4.2 - uTime * 1.9) * 0.08;
        transformed += normalize(normal) * (n1 * amp + n2);
        `
      );
    };

    const innerMat = new THREE.MeshStandardMaterial({
      color: themeRef.current === 'dark' ? '#282830' : '#3a3a45',
      roughness: 0.65,
      metalness: 0.1,
      transparent: true,
      opacity: 0.42,
      wireframe: false,
    });
    matsRef.current = { outer: outerMat, inner: innerMat };

    // Composite organic multi-layer sphere group
    const group = new THREE.Group();
    const outerMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.42, 5), outerMat);
    const haloMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.68, 3), innerMat);
    const ringMesh = new THREE.Mesh(
      new THREE.TorusGeometry(1.85, 0.014, 12, 72),
      new THREE.MeshStandardMaterial({ color: '#0033FF', roughness: 0.3, metalness: 0.7 })
    );
    ringMesh.rotation.set(Math.PI / 2.6, 0.35, 0);
    group.add(outerMesh, haloMesh, ringMesh);
    scene.add(group);

    let isHover = false;
    let hoverVal = 0;
    let mx = 0;
    let my = 0;
    let isVisible = true;
    let frameId = 0;
    let disposed = false;

    const onMove = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      mx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      my = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      isHover = true;
    };
    const onLeave = () => {
      isHover = false;
    };

    mount.addEventListener('pointermove', onMove, { passive: true });
    mount.addEventListener('pointerleave', onLeave);

    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.05 }
    );
    observer.observe(mount);

    const onResize = () => {
      if (!mount || disposed) return;
      const w = mount.clientWidth || 520;
      const h = mount.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      if (disposed) return;
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 8);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 95);
        }
      };
      frameId = window.setTimeout(poll, 8);
    }

    function tick() {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      if (isVisible) {
        hoverVal = THREE.MathUtils.damp(hoverVal, isHover ? 1 : 0, 4, delta);
        uniforms.uTime.value = reducedMotion ? 0 : elapsed;
        uniforms.uHover.value = hoverVal;
        uniforms.uMouse.value.set(mx, my);

        group.rotation.y = THREE.MathUtils.damp(
          group.rotation.y,
          (reducedMotion ? 0 : elapsed * 0.22) + mx * 0.5,
          3.5,
          delta
        );
        group.rotation.x = THREE.MathUtils.damp(group.rotation.x, -my * 0.35, 3.5, delta);
        haloMesh.rotation.y = -(reducedMotion ? 0 : elapsed * 0.14);
        haloMesh.scale.setScalar(1 + Math.sin(elapsed * 1.1) * 0.04);

        renderer.render(scene, camera);
      }

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      observer.disconnect();
      mount.removeEventListener('pointermove', onMove);
      mount.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('resize', onResize);
      envTex.dispose();
      outerMat.dispose();
      innerMat.dispose();
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          (obj as THREE.Mesh).geometry.dispose();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      data-testid="bento-liquid-sphere-canvas"
      className="h-full w-full min-h-[300px] cursor-crosshair"
    />
  );
}
