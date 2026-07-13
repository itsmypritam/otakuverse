import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Float, MeshDistortMaterial } from "@react-three/drei"
import * as THREE from "three"

function SakuraPetal({ position, color, size }: { position: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const speed = 0.2 + Math.random() * 0.3
  const drift = Math.random() * 2 - 1
  const startY = position[1]

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime() * speed
    ref.current.position.y = startY + Math.sin(t) * 2 - t * 0.3
    ref.current.position.x = position[0] + Math.sin(t * 0.7 + drift) * 1.5
    ref.current.position.z = position[1] + Math.cos(t * 0.5 + drift) * 0.5
    ref.current.rotation.x += 0.01
    ref.current.rotation.z += 0.02
  })

  return (
    <mesh ref={ref} position={position}>
      <planeGeometry args={[size, size * 0.6]} />
      <meshBasicMaterial color={color} transparent opacity={0.7} side={THREE.DoubleSide} />
    </mesh>
  )
}

function Orb({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    ref.current.position.y = position[1] + Math.sin(t * 0.5 + position[0]) * 0.6
    ref.current.position.x = position[0] + Math.sin(t * 0.3 + position[2]) * 0.4
    ref.current.rotation.x = t * 0.2
    ref.current.rotation.y = t * 0.3
  })

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={ref} position={position} scale={scale}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <MeshDistortMaterial
          color={color}
          transparent
          opacity={0.6}
          emissive={color}
          emissiveIntensity={0.5}
          distort={0.3}
          speed={2}
        />
      </mesh>
    </Float>
  )
}

function ToriiGate() {
  return (
    <group position={[0, -1, -5]} scale={0.8}>
      <mesh position={[0, 2.2, 0]}>
        <boxGeometry args={[3.5, 0.2, 0.3]} />
        <meshBasicMaterial color="#cc785c" transparent opacity={0.25} />
      </mesh>
      <mesh position={[1.6, 1.2, 0]}>
        <boxGeometry args={[0.2, 2.2, 0.3]} />
        <meshBasicMaterial color="#cc785c" transparent opacity={0.2} />
      </mesh>
      <mesh position={[-1.6, 1.2, 0]}>
        <boxGeometry args={[0.2, 2.2, 0.3]} />
        <meshBasicMaterial color="#cc785c" transparent opacity={0.2} />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[2.8, 0.15, 0.25]} />
        <meshBasicMaterial color="#cc785c" transparent opacity={0.15} />
      </mesh>
    </group>
  )
}

function Particles() {
  const count = 80
  const positions = useMemo(() => {
    return Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2
      const radius = 3 + Math.random() * 5
      return [
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 6,
        Math.sin(angle) * radius - 3,
      ] as [number, number, number]
    })
  }, [])

  const colors = ["#cc785c", "#e8a55a", "#faf9f5", "#5db8a6"]
  const sizes = [0.06, 0.08, 0.1, 0.12]

  return (
    <>
      {positions.map((pos, i) => (
        <SakuraPetal
          key={i}
          position={pos}
          color={colors[i % colors.length]}
          size={sizes[i % sizes.length]}
        />
      ))}
    </>
  )
}

function Orbs() {
  const orbs = [
    { position: [-2.5, 0.5, -2] as [number, number, number], color: "#cc785c", scale: 1.2 },
    { position: [2.5, -0.5, -2.5] as [number, number, number], color: "#e8a55a", scale: 1 },
    { position: [-1.5, 1.5, -3.5] as [number, number, number], color: "#5db8a6", scale: 0.8 },
    { position: [3, 1, -1.5] as [number, number, number], color: "#cc785c", scale: 0.9 },
    { position: [0, -0.8, -4] as [number, number, number], color: "#faf9f5", scale: 0.6 },
  ]

  return orbs.map((orb, i) => <Orb key={i} {...orb} />)
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#cc785c" />
      <pointLight position={[-5, -5, -5]} intensity={0.3} color="#e8a55a" />
      <fog attach="fog" args={["#141413", 5, 12]} />
      <ToriiGate />
      <Particles />
      <Orbs />
    </>
  )
}

export function AnimeScene3D() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 1, 6], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
