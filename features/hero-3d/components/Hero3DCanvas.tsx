'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function readColor(name: string): THREE.Color {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (!raw) return new THREE.Color('#ededed');
  try {
    return new THREE.Color(raw);
  } catch {
    return new THREE.Color('#ededed');
  }
}

export function Hero3DCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ----- bootstrap renderer / scene / camera ----------------------------
    let width = container.clientWidth;
    let height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // ----- read theme colors from CSS variables ---------------------------
    const readThemeColors = () => ({
      ink: readColor('--color-ink'),
      amber: readColor('--color-amber'),
      inkdim: readColor('--color-inkdim'),
    });
    let colors = readThemeColors();

    // ----- geometry: outer wireframe icosahedron --------------------------
    const outerGeo = new THREE.IcosahedronGeometry(1.35, 1);
    const outerEdges = new THREE.EdgesGeometry(outerGeo);
    const outerMat = new THREE.LineBasicMaterial({
      color: colors.ink,
      transparent: true,
      opacity: 0.55,
    });
    const outerMesh = new THREE.LineSegments(outerEdges, outerMat);
    scene.add(outerMesh);

    // ----- vertex points (amber) ------------------------------------------
    // Dedupe positions so we don't get triple-stacked points at shared verts
    const seen = new Set<string>();
    const dedupedPositions: number[] = [];
    const posArr = outerGeo.attributes['position']!.array as Float32Array;
    for (let i = 0; i < posArr.length; i += 3) {
      const key = `${posArr[i]!.toFixed(3)},${posArr[i + 1]!.toFixed(3)},${posArr[i + 2]!.toFixed(3)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      dedupedPositions.push(posArr[i]!, posArr[i + 1]!, posArr[i + 2]!);
    }
    const dotsGeo = new THREE.BufferGeometry();
    dotsGeo.setAttribute('position', new THREE.Float32BufferAttribute(dedupedPositions, 3));
    const dotsMat = new THREE.PointsMaterial({
      color: colors.amber,
      size: 0.07,
      transparent: true,
      opacity: 0.95,
      sizeAttenuation: true,
    });
    const dots = new THREE.Points(dotsGeo, dotsMat);
    scene.add(dots);

    // ----- inner ghost sphere --------------------------------------------
    const innerGeo = new THREE.IcosahedronGeometry(0.62, 0);
    const innerEdges = new THREE.EdgesGeometry(innerGeo);
    const innerMat = new THREE.LineBasicMaterial({
      color: colors.inkdim,
      transparent: true,
      opacity: 0.25,
    });
    const innerMesh = new THREE.LineSegments(innerEdges, innerMat);
    scene.add(innerMesh);

    // ----- mouse + theme + resize handlers --------------------------------
    let mouseX = 0,
      mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      mouseX = (e.clientX / w - 0.5) * 2; // -1..1
      mouseY = (e.clientY / h - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const onResize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      if (width === 0 || height === 0) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);

    // React to theme changes — repaint materials with new CSS-var colors
    const themeObserver = new MutationObserver(() => {
      colors = readThemeColors();
      outerMat.color.copy(colors.ink);
      dotsMat.color.copy(colors.amber);
      innerMat.color.copy(colors.inkdim);
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    // ----- animation loop -------------------------------------------------
    const clock = new THREE.Clock();
    let raf = 0;
    let visible = true; // paused when out of view to save battery

    const tick = () => {
      const t = clock.getElapsedTime();

      // Continuous rotation — intentionally slow + asymmetric
      outerMesh.rotation.y += 0.0024;
      outerMesh.rotation.x = Math.sin(t * 0.28) * 0.16;
      dots.rotation.copy(outerMesh.rotation);

      innerMesh.rotation.y -= 0.005;
      innerMesh.rotation.x += 0.0034;

      // Mouse parallax via camera offset (lerped)
      const targetCamX = mouseX * 0.55;
      const targetCamY = -mouseY * 0.55;
      camera.position.x += (targetCamX - camera.position.x) * 0.045;
      camera.position.y += (targetCamY - camera.position.y) * 0.045;
      camera.lookAt(0, 0, 0);

      // Subtle "breathing" on inner ghost
      const breathe = 1 + Math.sin(t * 0.7) * 0.04;
      innerMesh.scale.set(breathe, breathe, breathe);

      renderer.render(scene, camera);
      if (visible) raf = requestAnimationFrame(tick);
    };
    tick();

    // Pause loop when scrolled out of view
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e) return;
        if (e.isIntersecting && !visible) {
          visible = true;
          raf = requestAnimationFrame(tick);
        } else if (!e.isIntersecting && visible) {
          visible = false;
        }
      },
      { threshold: 0 },
    );
    io.observe(container);

    // ----- cleanup --------------------------------------------------------
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      themeObserver.disconnect();
      outerGeo.dispose();
      outerEdges.dispose();
      outerMat.dispose();
      innerGeo.dispose();
      innerEdges.dispose();
      innerMat.dispose();
      dotsGeo.dispose();
      dotsMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0" />;
}
