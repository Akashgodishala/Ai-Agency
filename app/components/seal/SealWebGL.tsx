"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { drawSeal } from "@/lib/design/guilloche";
import { paletteHex } from "@/lib/design/tokens";

/**
 * ============================================================================
 * THE STRUCK DISC — the site's entire 3D budget, spent on one object.
 * ============================================================================
 *
 * A minted disc: beveled rim, guilloché relief across its face, a single
 * sweeping rim light. Geometry and relief are generated in code from the same
 * maths as the 2D seal — no models, no downloaded HDRI, nothing generic.
 *
 * The relief is derived from the text the visitor types, so different words
 * genuinely produce different objects. The 3D is the product's output, not
 * decoration beside it.
 *
 * Cost control: one mesh, one draw call, DPR capped at 2, and the loop is
 * suspended whenever the canvas is off-screen or the tab is hidden.
 */
export function SealWebGL({
  text,
  strikeSignal,
  className = "",
}: {
  text: string;
  /** Increment to fire a strike. */
  strikeSignal: number;
  className?: string;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<{
    setText: (t: string) => void;
    strike: () => void;
  } | null>(null);

  // ---- scene lifecycle (built once) ----
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0, 6.2);

    // Procedural environment: gives the metal something to reflect without
    // shipping a single byte of texture.
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;

    // ---- relief map, drawn by the guilloché engine ----
    const reliefCanvas = document.createElement("canvas");
    reliefCanvas.width = reliefCanvas.height = 1024;
    const reliefTex = new THREE.CanvasTexture(reliefCanvas);
    reliefTex.colorSpace = THREE.NoColorSpace;
    reliefTex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());

    const paintRelief = (t: string) => {
      drawSeal(reliefCanvas, { text: t, chrome: false, steps: 1100 });
      reliefTex.needsUpdate = true;
    };
    paintRelief(text);

    // ---- the disc ----
    const group = new THREE.Group();
    scene.add(group);

    // The engraving reads through three channels at once: relief (bump),
    // how the grooves scatter light (roughness), and a faint mint glow sitting
    // in the cuts (emissive). Any one alone disappears into the metal.
    const faceMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x394a46),
      metalness: 0.92,
      roughness: 0.34,
      bumpMap: reliefTex,
      bumpScale: 1.6,
      roughnessMap: reliefTex,
      emissive: new THREE.Color(paletteHex.mint),
      emissiveMap: reliefTex,
      emissiveIntensity: 0.16,
      clearcoat: 0.5,
      clearcoatRoughness: 0.28,
      // Restrained reflections: at full strength the environment washes the
      // face into a pearl and the engraving disappears under the sheen.
      envMapIntensity: 0.4,
    });

    const rimMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x222e2b),
      metalness: 1,
      roughness: 0.38,
      envMapIntensity: 0.55,
      emissive: new THREE.Color(paletteHex.brass),
      emissiveIntensity: 0,
    });

    // A flat cylinder reads as a struck disc: faces take the relief, the
    // curved side becomes the milled edge.
    const disc = new THREE.Mesh(
      new THREE.CylinderGeometry(1.72, 1.72, 0.17, 160, 1),
      [rimMat, faceMat, faceMat]
    );
    disc.rotation.x = Math.PI / 2; // face the camera
    group.add(disc);

    // A few degrees off head-on, so the thickness shows and the object reads
    // as a struck disc rather than a printed circle.
    group.rotation.x = -0.16;
    group.rotation.y = 0.1;

    // Reeded edge: thin instanced teeth around the rim, like a coin's milling.
    const toothGeo = new THREE.BoxGeometry(0.022, 0.175, 0.05);
    const teeth = new THREE.InstancedMesh(toothGeo, rimMat, 132);
    const m4 = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const sc = new THREE.Vector3(1, 1, 1);
    for (let i = 0; i < 132; i++) {
      const a = (i / 132) * Math.PI * 2;
      const pos = new THREE.Vector3(Math.cos(a) * 1.715, Math.sin(a) * 1.715, 0);
      q.setFromEuler(new THREE.Euler(0, 0, a));
      m4.compose(pos, q, sc);
      teeth.setMatrixAt(i, m4);
    }
    teeth.instanceMatrix.needsUpdate = true;
    group.add(teeth);

    // Strike ring: expands outward once, on strike.
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(paletteHex.brass),
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.74, 1.79, 96), ringMat);
    group.add(ring);

    // Emissive endpoints, reused every frame during a strike.
    const mintCol = new THREE.Color(paletteHex.mint);
    const brassCol = new THREE.Color(paletteHex.brass);
    const REST_EMISSIVE = 0.16;

    // ---- lighting: one key raking across the relief, one rim, one fill ----
    // A low, raking key is what makes engraving visible: light across the
    // grooves rather than down into them.
    const key = new THREE.DirectionalLight(0xffffff, 3.4);
    key.position.set(-2.4, 3.0, 2.6);
    scene.add(key);

    const rim = new THREE.DirectionalLight(new THREE.Color(paletteHex.mint), 2.6);
    rim.position.set(3.4, -2.2, 1.2);
    scene.add(rim);

    // A warm kicker from below separates the disc's edge from the ground.
    const kick = new THREE.DirectionalLight(new THREE.Color(paletteHex.brass), 0.9);
    kick.position.set(0.6, -3.2, 1.8);
    scene.add(kick);

    scene.add(new THREE.AmbientLight(0xffffff, 0.22));

    // ---- interaction: the pointer moves the light, never the camera ----
    const pointer = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const onPointerMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    if (fine && !reduced) window.addEventListener("pointermove", onPointerMove);

    // ---- resize ----
    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    // ---- the loop, suspended when not visible ----
    let raf = 0;
    let visible = true;
    let spin = 0;
    let heat = 0;
    let ringT = -1;

    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;

      if (!reduced) spin += 0.0022;
      group.rotation.z = spin;

      // Light drifts toward the pointer — subtler than moving the camera and
      // never disorienting.
      pointer.x += (target.x - pointer.x) * 0.045;
      pointer.y += (target.y - pointer.y) * 0.045;
      key.position.x = -2.4 + pointer.x * 2.6;
      key.position.y = 3.0 - pointer.y * 2.2;
      group.rotation.x = -0.16 + pointer.y * 0.1;
      group.rotation.y = 0.1 + pointer.x * 0.12;

      if (heat > 0) {
        heat = Math.max(0, heat - 0.016);
        const e = heat * heat; // ease the cool-down
        // The engraving runs mint at rest and glows brass while hot.
        faceMat.emissive.copy(mintCol).lerp(brassCol, e);
        faceMat.emissiveIntensity = REST_EMISSIVE + e * 1.5;
        rimMat.emissiveIntensity = e * 1.4;
        rim.intensity = 2.2 + e * 3;
      }

      if (ringT >= 0) {
        ringT += 0.022;
        const s = 1 + ringT * 0.55;
        ring.scale.set(s, s, s);
        ringMat.opacity = Math.max(0, 0.85 - ringT);
        if (ringT > 1) {
          ringT = -1;
          ringMat.opacity = 0;
        }
      }

      renderer.render(scene, camera);
    };

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => (visible = e.isIntersecting)),
      { threshold: 0 }
    );
    io.observe(mount);
    const onVisibility = () => {
      visible = !document.hidden && visible;
    };
    document.addEventListener("visibilitychange", onVisibility);

    raf = requestAnimationFrame(frame);

    // ---- imperative API for React to poke ----
    apiRef.current = {
      setText: (t: string) => paintRelief(t),
      strike: () => {
        heat = 1;
        ringT = 0;
        ringMat.opacity = 0.85;
        ring.scale.set(1, 1, 1);
      },
    };

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointerMove);
      apiRef.current = null;

      // Dispose everything that holds GPU memory.
      disc.geometry.dispose();
      toothGeo.dispose();
      ring.geometry.dispose();
      faceMat.dispose();
      rimMat.dispose();
      ringMat.dispose();
      reliefTex.dispose();
      envRT.texture.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
    // Built once; text and strikes arrive through the imperative API below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-engrave when the description changes (debounced — repainting the
  // relief is the one expensive operation in the scene).
  useEffect(() => {
    const t = setTimeout(() => apiRef.current?.setText(text), 140);
    return () => clearTimeout(t);
  }, [text]);

  useEffect(() => {
    if (strikeSignal > 0) apiRef.current?.strike();
  }, [strikeSignal]);

  return <div ref={mountRef} className={className} aria-hidden="true" />;
}
