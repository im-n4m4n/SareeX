"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useProgress, useTexture } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import * as THREE from "three";

type Props = {
  image: string;
  /** 0..1 scroll progress — drives camera dolly/orbit and wave intensity */
  progress?: MutableRefObject<number>;
  /** enables drag-to-orbit (product 3D viewer) */
  interactive?: boolean;
  /** plane width / height */
  ratio?: number;
};

function Cloth({ image, progress, ratio = 0.75, mobile }: Props & { mobile: boolean }) {
  const tex = useTexture(image);
  const geo = useRef<THREE.PlaneGeometry>(null);
  const base = useRef<Float32Array | null>(null);
  const reduce = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
  }, [tex]);

  const H = 4.6;
  const W = H * ratio;
  const segX = mobile ? 48 : 110;
  const segY = mobile ? 40 : 90;

  useFrame((state) => {
    const g = geo.current;
    if (!g) return;
    const pos = g.attributes.position as THREE.BufferAttribute;
    if (!base.current || base.current.length !== pos.array.length) base.current = (pos.array as Float32Array).slice();
    const b = base.current;
    const t = reduce ? 0.6 : state.clock.elapsedTime;
    const p = progress?.current ?? 0.35;
    const a = 0.55 + p * 1.1;
    for (let i = 0; i < pos.count; i++) {
      const x = b[i * 3];
      const y = b[i * 3 + 1];
      const z =
        Math.sin(x * 1.25 + t * 0.9) * 0.24 * a +
        Math.sin(y * 1.8 + t * 0.6 + x * 0.5) * 0.13 * a +
        Math.cos((x + y) * 0.8 - t * 0.45) * 0.08 * a;
      pos.setZ(i, z);
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();

    if (progress) {
      const cam = state.camera;
      const ang = THREE.MathUtils.lerp(-0.7, 0.7, progress.current);
      const r = THREE.MathUtils.lerp(8.5, 5.2, progress.current);
      cam.position.x += (Math.sin(ang) * r - cam.position.x) * 0.08;
      cam.position.z += (Math.cos(ang) * r - cam.position.z) * 0.08;
      cam.position.y += (THREE.MathUtils.lerp(1.2, -0.3, progress.current) - cam.position.y) * 0.08;
      cam.lookAt(0, 0, 0);
    }
  });

  return (
    <mesh>
      <planeGeometry ref={geo} args={[W, H, segX, segY]} />
      <meshPhysicalMaterial
        map={tex}
        side={THREE.DoubleSide}
        roughness={0.36}
        metalness={0.05}
        sheen={1}
        sheenColor={new THREE.Color("#ffdf9a")}
        sheenRoughness={0.4}
        clearcoat={0.15}
      />
    </mesh>
  );
}

function LoadingBar() {
  const { progress, active } = useProgress();
  if (!active && progress >= 100) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-8 mx-auto w-48 text-center text-[10px] uppercase tracking-[0.3em] text-ivory/70">
      Weaving… {Math.round(progress)}%
      <div className="mt-2 h-px w-full bg-ivory/20">
        <div className="h-full bg-gold transition-all" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

export default function SilkCanvas(props: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    setMobile(window.innerWidth < 768);
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "100px" });
    if (wrap.current) io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas
        dpr={[1, mobile ? 1.5 : 2]}
        camera={{ position: [0, 0.8, 8.5], fov: 34 }}
        frameloop={inView ? "always" : "never"}
        gl={{ antialias: !mobile, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 4, 5]} intensity={2.4} color="#ffe3b0" />
        <pointLight position={[-5, -2, 3]} intensity={18} color="#ff9a8a" />
        <Suspense fallback={null}>
          <Cloth {...props} mobile={mobile} />
        </Suspense>
        {props.interactive && (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minAzimuthAngle={-0.9}
            maxAzimuthAngle={0.9}
            minPolarAngle={Math.PI / 2 - 0.5}
            maxPolarAngle={Math.PI / 2 + 0.5}
            rotateSpeed={0.6}
          />
        )}
      </Canvas>
      <LoadingBar />
    </div>
  );
}
