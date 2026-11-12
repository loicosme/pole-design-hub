// The 3D pole. Drag to orbit, pinch or scroll to zoom, two fingers to pan.
// Picking a component flies the camera in and plays that component's animation.
//
// Everything is built from primitives, so there are no model files to load.
// Units are roughly metres: the pole is 10 tall.

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const AMBER = "#fbbf24";
const NIGHT = "#0a0f1e";

type Vec3 = [number, number, number];

/** Where the camera sits and what it looks at for each component. */
const VIEWS: Record<string, { target: Vec3; pos: Vec3 }> = {
  overview: { target: [0, 5.4, 0], pos: [8.5, 7, 14] },
  insulator: { target: [0, 9.7, 0], pos: [2.6, 10.6, 3.0] },
  crossarm: { target: [0, 8.95, 0], pos: [1.2, 9.9, 5.2] },
  arrester: { target: [0.38, 8.3, 0.3], pos: [2.5, 9.0, 2.6] },
  fuse: { target: [0.38, 8.2, -0.3], pos: [2.7, 8.8, -2.3] },
  transformer: { target: [0.62, 6.9, 0], pos: [3.7, 7.7, 3.4] },
  neutral: { target: [0.2, 5.8, 1.2], pos: [3.6, 6.6, 4.6] },
  streetlight: { target: [-1.2, 6.9, 0], pos: [-3.4, 6.6, 4.6] },
  cablecom: { target: [0.2, 4.25, 1.2], pos: [3.4, 5.0, 4.6] },
  guy: { target: [-1.3, 4.2, -1.3], pos: [-7.5, 5.2, 3.2] },
};

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// ── Camera ────────────────────────────────────────────────────────────────

function CameraRig({ focus, onUserMove }: { focus: string | null; onUserMove: () => void }) {
  const controls = useRef<any>(null);
  const { camera } = useThree();
  const flying = useRef(false);
  const goalPos = useMemo(() => new THREE.Vector3(), []);
  const goalTarget = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const view = VIEWS[focus ?? "overview"] ?? VIEWS.overview;
    goalPos.set(...view.pos);
    goalTarget.set(...view.target);
    if (reducedMotion()) {
      camera.position.copy(goalPos);
      controls.current?.target.copy(goalTarget);
      controls.current?.update();
      return;
    }
    flying.current = true;
  }, [focus, camera, goalPos, goalTarget]);

  useFrame((_, dt) => {
    const c = controls.current;
    if (!c) return;
    if (flying.current) {
      // Ease in: fast at first, settling gently, like a documentary push-in.
      const k = 1 - Math.exp(-2.6 * dt);
      camera.position.lerp(goalPos, k);
      c.target.lerp(goalTarget, k);
      if (camera.position.distanceTo(goalPos) < 0.03 && c.target.distanceTo(goalTarget) < 0.03) flying.current = false;
    }
    // A slow drift around whatever is in focus keeps the shot alive.
    c.autoRotate = !flying.current && focus !== null && !reducedMotion();
    c.update();
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      autoRotateSpeed={0.7}
      minDistance={1.6}
      maxDistance={26}
      maxPolarAngle={Math.PI / 2 - 0.03}
      onStart={() => {
        flying.current = false;
        onUserMove();
      }}
    />
  );
}

// ── Building blocks ───────────────────────────────────────────────────────

/** Pulses amber while the part is selected. */
function Glow({ active, color, metal = 0.2, rough = 0.7 }: { active: boolean; color: string; metal?: number; rough?: number }) {
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (!mat.current) return;
    mat.current.emissiveIntensity = active ? 0.45 + 0.35 * Math.sin(clock.elapsedTime * 4) : 0;
  });
  return <meshStandardMaterial ref={mat} color={color} emissive={AMBER} emissiveIntensity={0} metalness={metal} roughness={rough} />;
}

function Part({
  id,
  onSelect,
  children,
}: {
  id: string;
  onSelect: (id: string) => void;
  children: React.ReactNode;
}) {
  return (
    <group
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onSelect(id);
      }}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "")}
    >
      {children}
    </group>
  );
}

/** A span of wire through this pole and out to its neighbours, with sag. */
function useSpan(x: number, y: number, sag = 0.5) {
  return useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(x, y, -9),
        new THREE.Vector3(x, y - sag, -4.5),
        new THREE.Vector3(x, y, 0),
        new THREE.Vector3(x, y - sag, 4.5),
        new THREE.Vector3(x, y, 9),
      ]),
    [x, y, sag],
  );
}

function Wire({
  curve,
  radius = 0.02,
  color,
  active = false,
}: {
  curve: THREE.Curve<THREE.Vector3>;
  radius?: number;
  color: string;
  active?: boolean;
}) {
  const geo = useMemo(() => new THREE.TubeGeometry(curve, 80, radius, 6), [curve, radius]);
  const hit = useMemo(() => new THREE.TubeGeometry(curve, 24, 0.16, 5), [curve]);
  return (
    <>
      <mesh geometry={geo}>
        <Glow active={active} color={color} metal={0.6} rough={0.4} />
      </mesh>
      {/* Fat invisible tube so thin wires are easy to tap. */}
      <mesh geometry={hit}>
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </>
  );
}

/** Dots of light running along a wire: current, or data. */
function Pulses({
  curve,
  count = 4,
  speed = 0.08,
  color = AMBER,
  size = 0.05,
  reverse = false,
}: {
  curve: THREE.Curve<THREE.Vector3>;
  count?: number;
  speed?: number;
  color?: string;
  size?: number;
  reverse?: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const p = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ clock }) => {
    if (!group.current) return;
    const still = reducedMotion();
    group.current.children.forEach((child, i) => {
      let t = ((still ? 0 : clock.elapsedTime * speed) + i / count) % 1;
      if (reverse) t = 1 - t;
      curve.getPointAt(t, p);
      child.position.copy(p);
    });
  });
  return (
    <group ref={group}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[size, 10, 10]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function Insulator({ position, active }: { position: Vec3; active: boolean }) {
  return (
    <group position={position}>
      {[
        [0.11, 0.05],
        [0.09, 0.12],
        [0.07, 0.19],
      ].map(([r, y]) => (
        <mesh key={y} position={[0, y, 0]}>
          <cylinderGeometry args={[r * 0.75, r, 0.06, 16]} />
          <Glow active={active} color="#38bdf8" metal={0.1} rough={0.25} />
        </mesh>
      ))}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.26, 8]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
    </group>
  );
}

function NeighbourPole({ z }: { z: number }) {
  return (
    <group position={[0, 0, z]}>
      <mesh position={[0, 5, 0]}>
        <cylinderGeometry args={[0.13, 0.18, 10, 10]} />
        <meshStandardMaterial color="#5b3413" roughness={0.9} />
      </mesh>
      <mesh position={[0, 8.9, 0]}>
        <boxGeometry args={[2.6, 0.12, 0.14]} />
        <meshStandardMaterial color="#5b3413" roughness={0.9} />
      </mesh>
    </group>
  );
}

// ── Component animations ──────────────────────────────────────────────────

/** The fuse barrel drops open, hangs, then is closed again. */
function Cutout({ active }: { active: boolean }) {
  const barrel = useRef<THREE.Group>(null);
  useFrame(({ clock }, dt) => {
    if (!barrel.current) return;
    const cycle = clock.elapsedTime % 4;
    const open = active && !reducedMotion() && cycle > 1.2 && cycle < 3.2;
    const goal = open ? 2.5 : 0;
    barrel.current.rotation.x += (goal - barrel.current.rotation.x) * Math.min(1, dt * (open ? 7 : 4));
  });
  return (
    <group position={[0.38, 8.0, -0.3]}>
      <mesh position={[-0.15, 0.22, 0]}>
        <boxGeometry args={[0.3, 0.04, 0.04]} />
        <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.5, 10]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.3} />
      </mesh>
      {/* Hinge at the bottom of the barrel. */}
      <group ref={barrel} position={[0.09, -0.02, 0]}>
        <mesh position={[0, 0.24, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.48, 10]} />
          <Glow active={active} color="#ef4444" />
        </mesh>
      </group>
    </group>
  );
}

/** A strike comes down the line, the arrester flashes and dumps it to ground. */
function Arrester({ active }: { active: boolean }) {
  const bolt = useRef<THREE.Mesh>(null);
  const flash = useRef<THREE.PointLight>(null);
  const boltGeo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 9; i++) {
      const y = 14 - (i / 9) * 5.4;
      const j = i === 0 || i === 9 ? 0 : 0.35;
      pts.push(new THREE.Vector3(0.38 + (Math.sin(i * 12.9) * j), y, 0.3 + Math.cos(i * 7.3) * j));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0), 40, 0.025, 5);
  }, []);
  const ground = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.38, 8.05, 0.3),
        new THREE.Vector3(0.17, 7.6, 0.12),
        new THREE.Vector3(0.19, 0.1, 0.1),
      ]),
    [],
  );
  useFrame(({ clock }) => {
    const cycle = clock.elapsedTime % 3;
    const striking = active && !reducedMotion() && cycle < 0.35 && Math.sin(clock.elapsedTime * 70) > -0.3;
    if (bolt.current) bolt.current.visible = striking;
    if (flash.current) flash.current.intensity = striking ? 40 : 0;
  });
  return (
    <>
      <group position={[0.38, 8.05, 0.3]}>
        <mesh position={[-0.15, 0.2, 0]}>
          <boxGeometry args={[0.3, 0.04, 0.04]} />
          <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.4} />
        </mesh>
        {[0.06, 0.16, 0.26, 0.36, 0.46].map((y) => (
          <mesh key={y} position={[0, y, 0]}>
            <cylinderGeometry args={[0.05, 0.085, 0.08, 14]} />
            <Glow active={active} color="#d97706" rough={0.4} />
          </mesh>
        ))}
      </group>
      <mesh ref={bolt} geometry={boltGeo} visible={false}>
        <meshBasicMaterial color="#e0f2fe" toneMapped={false} />
      </mesh>
      <pointLight ref={flash} position={[0.38, 9.2, 0.3]} color="#bae6fd" intensity={0} distance={12} />
      <Wire curve={ground} radius={0.012} color="#b45309" active={active} />
      {active && <Pulses curve={ground} count={5} speed={0.9} color="#7dd3fc" size={0.045} />}
    </>
  );
}

function Transformer({ active }: { active: boolean }) {
  const primary = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.47, 7.98, -0.3),
        new THREE.Vector3(0.5, 7.7, -0.2),
        new THREE.Vector3(0.52, 7.52, -0.12),
      ]),
    [],
  );
  const secondary = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.62, 6.42, 0.3),
        new THREE.Vector3(0.5, 6.1, 0.34),
        new THREE.Vector3(0.24, 5.62, 0.2),
      ]),
    [],
  );
  return (
    <>
      <group position={[0.62, 6.9, 0]}>
        <mesh>
          <cylinderGeometry args={[0.36, 0.36, 0.95, 28]} />
          <Glow active={active} color="#b45309" metal={0.6} rough={0.45} />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.38, 0.38, 0.06, 28]} />
          <meshStandardMaterial color="#92400e" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Cooling fins */}
        {Array.from({ length: 10 }).map((_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.38, 0, Math.sin(a) * 0.38]} rotation={[0, -a, 0]}>
              <boxGeometry args={[0.08, 0.7, 0.015]} />
              <meshStandardMaterial color="#92400e" metalness={0.6} roughness={0.5} />
            </mesh>
          );
        })}
        {/* Primary bushing */}
        <mesh position={[-0.1, 0.62, -0.12]}>
          <cylinderGeometry args={[0.035, 0.06, 0.2, 10]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.3} />
        </mesh>
        {/* Hanger */}
        <mesh position={[-0.45, 0.2, 0]}>
          <boxGeometry args={[0.3, 0.08, 0.12]} />
          <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.4} />
        </mesh>
      </group>
      <Wire curve={primary} radius={0.012} color="#fbbf24" active={active} />
      <Wire curve={secondary} radius={0.018} color="#475569" active={active} />
      {active && (
        <>
          {/* High voltage in: few, slow, amber. Low voltage out: many, quick, blue. */}
          <Pulses curve={primary} count={2} speed={0.5} color={AMBER} size={0.05} />
          <Pulses curve={secondary} count={5} speed={0.8} color="#38bdf8" size={0.035} />
        </>
      )}
    </>
  );
}

function StreetLight({ active }: { active: boolean }) {
  const arm = useMemo(
    () =>
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-0.14, 6.9, 0),
        new THREE.Vector3(-0.8, 7.75, 0),
        new THREE.Vector3(-1.7, 7.45, 0),
      ),
    [],
  );
  const armGeo = useMemo(() => new THREE.TubeGeometry(arm, 24, 0.035, 8), [arm]);
  const lens = useRef<THREE.MeshStandardMaterial>(null);
  const lamp = useRef<THREE.SpotLight>(null);
  const cone = useRef<THREE.MeshBasicMaterial>(null);
  const target = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(-1.8, 0, 0);
    return o;
  }, []);
  useFrame(({ clock }) => {
    // Flickers on like a real lamp warming up, then holds.
    const t = clock.elapsedTime % 6;
    const on = active ? (t < 0.6 && !reducedMotion() ? (Math.sin(t * 60) > 0 ? 1 : 0.2) : 1) : 0.15;
    if (lens.current) lens.current.emissiveIntensity = on * 2.5;
    if (lamp.current) lamp.current.intensity = active ? on * 60 : 0;
    if (cone.current) cone.current.opacity = active ? on * 0.12 : 0;
  });
  return (
    <>
      <mesh geometry={armGeo}>
        <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.4} />
      </mesh>
      <group position={[-1.85, 7.42, 0]}>
        <mesh>
          <boxGeometry args={[0.5, 0.09, 0.24]} />
          <Glow active={active} color="#475569" metal={0.6} rough={0.4} />
        </mesh>
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[0.36, 0.02, 0.16]} />
          <meshStandardMaterial ref={lens} color="#fde68a" emissive="#fde68a" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0, -3.75, 0]}>
          <coneGeometry args={[2.2, 7.4, 32, 1, true]} />
          <meshBasicMaterial ref={cone} color="#fde68a" transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </group>
      <primitive object={target} />
      <spotLight ref={lamp} position={[-1.85, 7.35, 0]} target={target} angle={0.5} penumbra={0.6} color="#fde68a" intensity={0} distance={14} />
    </>
  );
}

function Guy({ active }: { active: boolean }) {
  const top = useMemo(() => new THREE.Vector3(-0.08, 8.5, -0.08), []);
  const anchor = useMemo(() => new THREE.Vector3(-2.9, 0, -2.9), []);
  const strand = useMemo(() => new THREE.LineCurve3(top, anchor), [top, anchor]);
  const guard = useMemo(() => {
    const a = anchor.clone().lerp(top, 0.02);
    const b = anchor.clone().lerp(top, 0.26);
    return new THREE.TubeGeometry(new THREE.LineCurve3(a, b), 2, 0.05, 8);
  }, [top, anchor]);
  return (
    <>
      <Wire curve={strand} radius={0.022} color="#cbd5e1" active={active} />
      {/* The yellow guard that keeps people from walking into the guy. */}
      <mesh geometry={guard}>
        <meshStandardMaterial color={AMBER} roughness={0.6} />
      </mesh>
      <mesh position={[anchor.x, 0.06, anchor.z]}>
        <cylinderGeometry args={[0.12, 0.2, 0.12, 12]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      {/* Tension travels down the strand into the anchor. */}
      {active && <Pulses curve={strand} count={6} speed={0.25} color={AMBER} size={0.04} />}
    </>
  );
}

function Stars() {
  const geo = useMemo(() => {
    const pts = new Float32Array(360 * 3);
    for (let i = 0; i < 360; i++) {
      // Deterministic scatter over the upper dome.
      const u = (Math.sin(i * 127.1) * 43758.5453) % 1;
      const v = (Math.sin(i * 311.7) * 43758.5453) % 1;
      const theta = Math.abs(u) * Math.PI * 2;
      const phi = Math.abs(v) * (Math.PI / 2.2);
      pts[i * 3] = 60 * Math.sin(phi) * Math.cos(theta);
      pts[i * 3 + 1] = 60 * Math.cos(phi) + 4;
      pts[i * 3 + 2] = 60 * Math.sin(phi) * Math.sin(theta);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pts, 3));
    return g;
  }, []);
  return (
    <points geometry={geo}>
      <pointsMaterial color="#ffffff" size={0.22} sizeAttenuation transparent opacity={0.55} fog={false} />
    </points>
  );
}

// ── Scene ─────────────────────────────────────────────────────────────────

function Scene({ selectedId, onSelect }: { selectedId: string | null; onSelect: (id: string) => void }) {
  const is = (id: string) => selectedId === id;

  const phaseA = useSpan(-1.1, 9.22);
  const phaseB = useSpan(0, 10.27);
  const phaseC = useSpan(1.1, 9.22);
  const neutral = useSpan(0.2, 6.0, 0.45);
  const secondary = useSpan(0.22, 5.6, 0.45);
  const comm1 = useSpan(0.2, 4.4, 0.4);
  const comm2 = useSpan(0.2, 4.1, 0.4);

  return (
    <>
      <color attach="background" args={[NIGHT]} />
      <fog attach="fog" args={[NIGHT, 16, 34]} />
      <ambientLight intensity={0.75} />
      <hemisphereLight args={["#93c5fd", "#0d1f35", 0.6]} />
      <directionalLight position={[6, 12, 8]} intensity={1.6} />
      <directionalLight position={[-6, 4, -6]} intensity={0.4} color="#fbbf24" />
      <Stars />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[30, 48]} />
        <meshStandardMaterial color="#0d1f35" roughness={1} />
      </mesh>
      <gridHelper args={[40, 40, "#1e3a5f", "#13243d"]} position={[0, 0.01, 0]} />

      <NeighbourPole z={-9} />
      <NeighbourPole z={9} />

      {/* Pole */}
      <mesh position={[0, 5, 0]}>
        <cylinderGeometry args={[0.13, 0.18, 10, 18]} />
        <meshStandardMaterial color="#92400e" roughness={0.9} />
      </mesh>

      <Part id="crossarm" onSelect={onSelect}>
        <mesh position={[0, 8.9, 0]}>
          <boxGeometry args={[2.6, 0.12, 0.14]} />
          <Glow active={is("crossarm")} color="#7c3aed" rough={0.8} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.42, 8.6, 0.09]} rotation={[0, 0, side * 0.62]}>
            <boxGeometry args={[0.03, 0.95, 0.02]} />
            <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.4} />
          </mesh>
        ))}
      </Part>

      <Part id="insulator" onSelect={onSelect}>
        <Insulator position={[-1.1, 8.96, 0]} active={is("insulator")} />
        <Insulator position={[1.1, 8.96, 0]} active={is("insulator")} />
        <Insulator position={[0, 10.0, 0]} active={is("insulator")} />
        <Wire curve={phaseA} color="#fbbf24" />
        <Wire curve={phaseB} color="#fbbf24" />
        <Wire curve={phaseC} color="#fbbf24" />
      </Part>
      <Pulses curve={phaseA} count={3} speed={0.05} />
      <Pulses curve={phaseB} count={3} speed={0.05} />
      <Pulses curve={phaseC} count={3} speed={0.05} />

      <Part id="arrester" onSelect={onSelect}>
        <Arrester active={is("arrester")} />
      </Part>

      <Part id="fuse" onSelect={onSelect}>
        <Cutout active={is("fuse")} />
      </Part>

      <Part id="transformer" onSelect={onSelect}>
        <Transformer active={is("transformer")} />
      </Part>

      <Part id="neutral" onSelect={onSelect}>
        <Wire curve={neutral} color="#94a3b8" active={is("neutral")} />
        <Wire curve={secondary} radius={0.035} color="#475569" active={is("neutral")} />
      </Part>
      {is("neutral") && <Pulses curve={neutral} count={8} speed={0.07} color="#e2e8f0" size={0.045} reverse />}

      <Part id="streetlight" onSelect={onSelect}>
        <StreetLight active={is("streetlight")} />
      </Part>

      <Part id="cablecom" onSelect={onSelect}>
        <Wire curve={comm1} radius={0.03} color="#16a34a" active={is("cablecom")} />
        <Wire curve={comm2} radius={0.022} color="#15803d" active={is("cablecom")} />
      </Part>
      {is("cablecom") && (
        <>
          <Pulses curve={comm1} count={14} speed={0.22} color="#4ade80" size={0.04} />
          <Pulses curve={comm2} count={14} speed={0.18} color="#4ade80" size={0.035} reverse />
        </>
      )}

      <Part id="guy" onSelect={onSelect}>
        <Guy active={is("guy")} />
      </Part>
    </>
  );
}

export default function Pole3D({
  selectedId,
  onSelect,
  onUserMove,
  className,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** Fires when the player grabs the camera, so a running tour can stop. */
  onUserMove: () => void;
  className?: string;
}) {
  return (
    <Canvas
      className={className}
      dpr={[1, 2]}
      camera={{ position: VIEWS.overview.pos, fov: 40, near: 0.1, far: 200 }}
      style={{ touchAction: "none" }}
      aria-label="3D model of a distribution pole. Drag to rotate, pinch to zoom."
      role="img"
    >
      <Scene selectedId={selectedId} onSelect={onSelect} />
      <CameraRig focus={selectedId} onUserMove={onUserMove} />
    </Canvas>
  );
}
