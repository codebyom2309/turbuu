'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

interface LiquidCrossHeroProps {
  theme: 'dark' | 'light';
}

const _raycaster = new THREE.Raycaster();
const _pointerNdc = new THREE.Vector2(99, 99);
const _hitPoint = new THREE.Vector3(0, 0, 10);
const _targetHit = new THREE.Vector3(0, 0, 10);
const _tmpVec = new THREE.Vector3();

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

function createLiquidCrossGroup(
  bodyMaterial: THREE.MeshPhysicalMaterial,
  capMaterial: THREE.MeshPhysicalMaterial,
  rimMaterial: THREE.MeshStandardMaterial,
  scale = 1
): THREE.Group {
  const group = new THREE.Group();
  const armGeo = new THREE.CylinderGeometry(0.42, 0.42, 2.35, 36, 24, false);
  const capGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 32);
  const collarGeo = new THREE.TorusGeometry(0.43, 0.045, 16, 36);
  const coreGeo = new THREE.SphereGeometry(0.68, 40, 40);

  // 1. Primary sculptural core + 3 orthogonal tubular axes (6 rounded arms)
  const core = new THREE.Mesh(coreGeo, bodyMaterial);
  group.add(core);

  const armY = new THREE.Mesh(armGeo, bodyMaterial);
  group.add(armY);

  const armX = new THREE.Mesh(armGeo, bodyMaterial);
  armX.rotation.z = Math.PI / 2;
  group.add(armX);

  const armZ = new THREE.Mesh(armGeo, bodyMaterial);
  armZ.rotation.x = Math.PI / 2;
  group.add(armZ);

  // 2. Secondary machined recessed endcaps on all 6 axes (varied roughness)
  const capOffsets: Array<{ pos: [number, number, number]; rot: [number, number, number] }> = [
    { pos: [0, 1.18, 0], rot: [0, 0, 0] },
    { pos: [0, -1.18, 0], rot: [Math.PI, 0, 0] },
    { pos: [1.18, 0, 0], rot: [0, 0, -Math.PI / 2] },
    { pos: [-1.18, 0, 0], rot: [0, 0, Math.PI / 2] },
    { pos: [0, 0, 1.18], rot: [Math.PI / 2, 0, 0] },
    { pos: [0, 0, -1.18], rot: [-Math.PI / 2, 0, 0] },
  ];

  for (const cfg of capOffsets) {
    const cap = new THREE.Mesh(capGeo, capMaterial);
    cap.position.set(...cfg.pos);
    cap.rotation.set(...cfg.rot);
    group.add(cap);

    const collar = new THREE.Mesh(collarGeo, rimMaterial);
    collar.position.set(cfg.pos[0] * 0.96, cfg.pos[1] * 0.96, cfg.pos[2] * 0.96);
    if (cfg.pos[1] !== 0) collar.rotation.x = Math.PI / 2;
    else if (cfg.pos[0] !== 0) collar.rotation.y = Math.PI / 2;
    group.add(collar);
  }

  group.scale.setScalar(scale);
  return group;
}

export default function LiquidCrossHero({ theme }: LiquidCrossHeroProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const themeRef = useRef<'dark' | 'light'>(theme);
  const materialRefs = useRef<{
    body: THREE.MeshPhysicalMaterial;
    cap: THREE.MeshPhysicalMaterial;
    rim: THREE.MeshStandardMaterial;
    keyLight: THREE.DirectionalLight;
    hemiLight: THREE.HemisphereLight;
  } | null>(null);

  useEffect(() => {
    themeRef.current = theme;
    const refs = materialRefs.current;
    if (!refs) return;
    if (theme === 'dark') {
      refs.body.color.set('#101014');
      refs.body.roughness = 0.22;
      refs.body.metalness = 0.28;
      refs.body.clearcoat = 0.9;
      refs.cap.color.set('#202026');
      refs.cap.roughness = 0.55;
      refs.rim.color.set('#303038');
      refs.keyLight.intensity = 2.6;
      refs.hemiLight.intensity = 1.15;
    } else {
      refs.body.color.set('#f4f4f1');
      refs.body.roughness = 0.28;
      refs.body.metalness = 0.08;
      refs.body.clearcoat = 0.65;
      refs.cap.color.set('#dadad4');
      refs.cap.roughness = 0.62;
      refs.rim.color.set('#e5e5df');
      refs.keyLight.intensity = 2.1;
      refs.hemiLight.intensity = 1.5;
    }
  }, [theme]);

  useEffect(() => {
    const mount = containerRef.current;
    if (!mount) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSoftwareGl = detectSoftwareGl();

    const scene = new THREE.Scene();
    const width = mount.clientWidth || 1280;
    const height = mount.clientHeight || 760;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(width, height);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    mount.appendChild(renderer.domElement);

    // Studio RoomEnvironment reflection map
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmremGenerator.dispose();

    // Warm key + Cool Hemisphere + Rim lighting
    const hemiLight = new THREE.HemisphereLight(0xdce6ff, 0x1a1a20, themeRef.current === 'dark' ? 1.15 : 1.5);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e8, themeRef.current === 'dark' ? 2.6 : 2.1);
    keyLight.position.set(4.5, 6.5, 6);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x6d8cff, 1.35);
    rimLight.position.set(-5, 3, -4);
    scene.add(rimLight);

    // Liquid-Cursor GLSL displacement shader injected into MeshPhysicalMaterial
    const liquidUniforms = {
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector3(0, 0, 10) },
      uVelocity: { value: 0 },
    };

    const isDarkInit = themeRef.current === 'dark';
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: isDarkInit ? '#101014' : '#f4f4f1',
      roughness: isDarkInit ? 0.22 : 0.28,
      metalness: isDarkInit ? 0.28 : 0.08,
      clearcoat: isDarkInit ? 0.9 : 0.65,
      clearcoatRoughness: 0.14,
      reflectivity: 0.9,
    });

    bodyMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = liquidUniforms.uTime;
      shader.uniforms.uPointer = liquidUniforms.uPointer;
      shader.uniforms.uVelocity = liquidUniforms.uVelocity;

      shader.vertexShader =
        `
        uniform float uTime;
        uniform vec3 uPointer;
        uniform float uVelocity;
        varying float vSplash;
        ` + shader.vertexShader;

      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        vec4 tbWorldPos = modelMatrix * vec4(transformed, 1.0);
        float tbDist = distance(tbWorldPos.xyz, uPointer);
        float tbFalloff = exp(-tbDist * 1.45);
        float tbRipple = sin(tbDist * 9.0 - uTime * 7.5) * 0.11 * tbFalloff * (0.35 + uVelocity * 2.2);
        float tbAmbientWave = sin(transformed.x * 3.0 + uTime * 1.1) * cos(transformed.y * 3.0 - uTime * 0.9) * 0.015;
        transformed += normalize(normal) * (tbRipple + tbAmbientWave);
        vSplash = clamp(tbFalloff * (0.25 + uVelocity * 2.4), 0.0, 1.0);
        `
      );

      shader.fragmentShader =
        `
        varying float vSplash;
        ` + shader.fragmentShader;

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <color_fragment>',
        `
        #include <color_fragment>
        vec3 chromeTint = vec3(0.76, 0.84, 1.0);
        diffuseColor.rgb = mix(diffuseColor.rgb, chromeTint, vSplash * 0.26);
        `
      );
    };

    const capMaterial = new THREE.MeshPhysicalMaterial({
      color: isDarkInit ? '#202026' : '#dadad4',
      roughness: isDarkInit ? 0.55 : 0.62,
      metalness: 0.18,
      clearcoat: 0.25,
    });

    const rimMaterial = new THREE.MeshStandardMaterial({
      color: isDarkInit ? '#303038' : '#e5e5df',
      roughness: 0.45,
      metalness: 0.6,
    });

    materialRefs.current = { body: bodyMaterial, cap: capMaterial, rim: rimMaterial, keyLight, hemiLight };

    // Center hero sculptural cross + upper-left & upper-right floating parallax nodes
    const centerCross = createLiquidCrossGroup(bodyMaterial, capMaterial, rimMaterial, 1.52);
    centerCross.position.set(0, 0.05, 0);
    centerCross.rotation.set(0.32, -0.45, 0.18);
    scene.add(centerCross);

    const leftNode = createLiquidCrossGroup(bodyMaterial, capMaterial, rimMaterial, 0.46);
    leftNode.position.set(-3.75, 1.75, -1.2);
    leftNode.rotation.set(0.6, 0.4, 0.3);
    scene.add(leftNode);

    const rightNode = createLiquidCrossGroup(bodyMaterial, capMaterial, rimMaterial, 0.78);
    rightNode.position.set(3.85, 1.55, -0.6);
    rightNode.rotation.set(-0.25, -0.55, 0.42);
    scene.add(rightNode);

    // Invisible proxy sphere for fast cursor raycasting
    const hitProxy = new THREE.Mesh(
      new THREE.SphereGeometry(2.1, 16, 16),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    scene.add(hitProxy);

    let mouseX = 0;
    let mouseY = 0;
    let velocity = 0;
    let lastClientX = 0;
    let lastClientY = 0;
    let isVisible = true;
    let frameId = 0;
    let disposed = false;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = THREE.MathUtils.clamp(nx, -1, 1);
      mouseY = THREE.MathUtils.clamp(ny, -1, 1);
      _pointerNdc.set(mouseX, mouseY);

      const dx = e.clientX - lastClientX;
      const dy = e.clientY - lastClientY;
      lastClientX = e.clientX;
      lastClientY = e.clientY;
      const speed = Math.min(Math.hypot(dx, dy) / 36, 1.5);
      velocity = Math.max(velocity, speed);

      _raycaster.setFromCamera(_pointerNdc, camera);
      const hits = _raycaster.intersectObject(hitProxy, false);
      if (hits.length > 0) {
        _targetHit.copy(hits[0].point);
      } else {
        _tmpVec.set(mouseX * 3.2, mouseY * 2.1, 1.2);
        _targetHit.copy(_tmpVec);
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.05 }
    );
    observer.observe(mount);

    const handleResize = () => {
      if (!mount || disposed) return;
      const w = mount.clientWidth || 1280;
      const h = mount.clientHeight || 760;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

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
          frameId = window.setTimeout(cb, 90);
        }
      };
      frameId = window.setTimeout(poll, 8);
    }

    function tick() {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      if (isVisible) {
        velocity = THREE.MathUtils.damp(velocity, 0, 4.5, delta);
        _hitPoint.lerp(_targetHit, 1 - Math.exp(-8 * delta));
        liquidUniforms.uTime.value = reducedMotion ? 0 : elapsed;
        liquidUniforms.uPointer.value.copy(_hitPoint);
        liquidUniforms.uVelocity.value = reducedMotion ? 0 : velocity;

        const targetRotY = -0.45 + mouseX * 0.42 + (reducedMotion ? 0 : Math.sin(elapsed * 0.35) * 0.12);
        const targetRotX = 0.32 - mouseY * 0.32 + (reducedMotion ? 0 : Math.cos(elapsed * 0.28) * 0.08);

        centerCross.rotation.y = THREE.MathUtils.damp(centerCross.rotation.y, targetRotY, 3.2, delta);
        centerCross.rotation.x = THREE.MathUtils.damp(centerCross.rotation.x, targetRotX, 3.2, delta);
        centerCross.rotation.z = THREE.MathUtils.damp(
          centerCross.rotation.z,
          0.18 + mouseX * 0.14,
          3.0,
          delta
        );

        leftNode.rotation.y += reducedMotion ? 0 : delta * 0.25;
        leftNode.rotation.x += reducedMotion ? 0 : delta * 0.14;
        leftNode.position.y = 1.75 + (reducedMotion ? 0 : Math.sin(elapsed * 0.8) * 0.12) - mouseY * 0.22;
        leftNode.position.x = -3.75 - mouseX * 0.25;

        rightNode.rotation.y -= reducedMotion ? 0 : delta * 0.2;
        rightNode.rotation.z += reducedMotion ? 0 : delta * 0.1;
        rightNode.position.y = 1.55 + (reducedMotion ? 0 : Math.cos(elapsed * 0.7) * 0.14) + mouseY * 0.26;
        rightNode.position.x = 3.85 + mouseX * 0.3;

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
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      envTex.dispose();
      bodyMaterial.dispose();
      capMaterial.dispose();
      rimMaterial.dispose();
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
      data-testid="hero-liquid-3d-canvas"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
}
