import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

/** The shield: a breathing liquid core wrapped in a rotating lattice and signal rings. */
function Core() {
  const lattice = useRef();
  const ringA = useRef();
  const ringB = useRef();

  useFrame((_, dt) => {
    lattice.current.rotation.y += dt * 0.18;
    lattice.current.rotation.x += dt * 0.06;
    ringA.current.rotation.z += dt * 0.35;
    ringB.current.rotation.z -= dt * 0.22;
  });

  return (
    <group>
      <mesh>
        <icosahedronGeometry args={[1.15, 12]} />
        <MeshDistortMaterial
          color="#16244d"
          emissive="#2ee6c5"
          emissiveIntensity={0.22}
          roughness={0.12}
          metalness={0.85}
          distort={0.3}
          speed={1.8}
        />
      </mesh>
      <mesh ref={lattice} scale={1.6}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color="#2ee6c5" wireframe transparent opacity={0.28} />
      </mesh>
      <mesh ref={ringA} rotation={[Math.PI / 2.3, 0, 0]}>
        <torusGeometry args={[2.15, 0.014, 16, 200]} />
        <meshBasicMaterial color="#ffb020" transparent opacity={0.85} />
      </mesh>
      <mesh ref={ringB} rotation={[Math.PI / 1.7, 0.5, 0]}>
        <torusGeometry args={[2.5, 0.009, 16, 200]} />
        <meshBasicMaterial color="#7c9cff" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

/** Red "threats" swoop toward the shield and get pushed back out. */
function Threats({ count = 22 }) {
  const meshes = useRef([]);
  const orbits = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        radius: 2.7 + Math.random() * 1.5,
        speed: 0.18 + Math.random() * 0.45,
        phase: Math.random() * Math.PI * 2,
        tilt: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
        size: 0.035 + Math.random() * 0.055,
        color: i % 4 === 0 ? '#ffb020' : '#ff4d6d',
      })),
    [count],
  );
  const v = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    orbits.forEach((o, i) => {
      const mesh = meshes.current[i];
      if (!mesh) return;
      const a = t * o.speed + o.phase;
      const repel = 1 - 0.32 * Math.max(0, Math.sin(a * 2.6)) ** 4;
      v.set(Math.cos(a) * o.radius * repel, Math.sin(a) * o.radius * repel, 0).applyEuler(o.tilt);
      mesh.position.copy(v);
    });
  });

  return orbits.map((o, i) => (
    <mesh key={i} ref={(el) => { meshes.current[i] = el; }}>
      <sphereGeometry args={[o.size, 16, 16]} />
      <meshBasicMaterial color={o.color} toneMapped={false} />
    </mesh>
  ));
}

function PointerRig({ children }) {
  const group = useRef();
  useFrame((state, dt) => {
    const g = group.current;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, state.pointer.x * 0.45, 3, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -state.pointer.y * 0.3, 3, dt);
  });
  return <group ref={group}>{children}</group>;
}

export default function Hero3D() {
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 7.2], fov: 45 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.35} />
      <pointLight position={[5, 5, 5]} intensity={80} color="#2ee6c5" />
      <pointLight position={[-5, -3, 2]} intensity={55} color="#ff4d6d" />
      <pointLight position={[0, 4, -4]} intensity={40} color="#7c9cff" />
      <PointerRig>
        <Float speed={1.4} rotationIntensity={0.35} floatIntensity={0.9}>
          <Core />
        </Float>
        <Threats />
      </PointerRig>
      <Sparkles count={70} scale={10} size={2.2} speed={0.35} color="#9fb4ff" />
    </Canvas>
  );
}
