import { useXRHitTest } from '@react-three/xr'
import { Interactive } from '@react-three/xr'
import { useState, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface PlacementHelperProps {
  onPlace: (position: [number, number, number]) => void
}

export function PlacementHelper({ onPlace }: PlacementHelperProps) {
  const [reticlePosition, setReticlePosition] = useState<THREE.Vector3 | null>(null)
  const reticleRef = useRef<THREE.Mesh>(null)

  // WebXR hit test - detects floor and surfaces (v6 API)
  // getWorldMatrix signature: (target: Matrix4, result: XRHitTestResult) => boolean
  useXRHitTest((results, getWorldMatrix) => {
    if (results.length > 0) {
      const matrix = new THREE.Matrix4()
      getWorldMatrix(matrix, results[0])
      const position = new THREE.Vector3()
      position.setFromMatrixPosition(matrix)
      setReticlePosition(position)
    }
  }, 'viewer')

  // Animate reticle rotation
  useFrame((_, delta) => {
    if (reticleRef.current) {
      reticleRef.current.rotation.y += delta * 0.5
    }
  })

  const handleSelect = () => {
    if (reticlePosition) {
      onPlace([reticlePosition.x, reticlePosition.y, reticlePosition.z])
    }
  }

  if (!reticlePosition) return null

  return (
    <Interactive onSelect={handleSelect}>
      <group position={reticlePosition} rotation={[-Math.PI / 2, 0, 0]}>
        {/* Outer ring */}
        <mesh ref={reticleRef}>
          <ringGeometry args={[0.18, 0.22, 32]} />
          <meshBasicMaterial color="#667eea" opacity={0.8} transparent />
        </mesh>

        {/* Inner indicator */}
        <mesh position={[0, 0, 0.001]}>
          <circleGeometry args={[0.08, 32]} />
          <meshBasicMaterial color="#667eea" opacity={0.4} transparent />
        </mesh>

        {/* Crosshair lines */}
        {[0, Math.PI / 2].map((rotation, i) => (
          <mesh key={i} rotation={[0, 0, rotation]} position={[0, 0, 0.001]}>
            <planeGeometry args={[0.35, 0.01]} />
            <meshBasicMaterial color="white" opacity={0.5} transparent />
          </mesh>
        ))}
      </group>
    </Interactive>
  )
}
