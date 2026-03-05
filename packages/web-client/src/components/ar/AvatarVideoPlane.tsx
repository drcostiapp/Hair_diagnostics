import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface AvatarVideoPlaneProps {
  position: [number, number, number]
  scale: [number, number, number]
  streamUrl: string
}

export function AvatarVideoPlane({ position, scale, streamUrl }: AvatarVideoPlaneProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    if (!streamUrl) return

    const video = document.createElement('video')
    video.src = streamUrl
    video.crossOrigin = 'anonymous'
    video.autoplay = true
    video.playsInline = true
    video.muted = false
    video.loop = false

    const handleCanPlay = () => {
      video.play().catch(console.error)
    }
    video.addEventListener('canplay', handleCanPlay)

    const texture = new THREE.VideoTexture(video)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.format = THREE.RGBAFormat
    texture.colorSpace = THREE.SRGBColorSpace

    videoRef.current = video
    setVideoTexture(texture)

    return () => {
      video.removeEventListener('canplay', handleCanPlay)
      video.pause()
      video.src = ''
      texture.dispose()
      videoRef.current = null
    }
  }, [streamUrl])

  // Update texture every frame for smooth video
  useFrame(() => {
    if (videoTexture) {
      videoTexture.needsUpdate = true
    }
  })

  // Billboard effect: avatar always faces the camera
  useFrame(({ camera }) => {
    if (meshRef.current) {
      meshRef.current.quaternion.copy(camera.quaternion)
    }
  })

  if (!videoTexture) {
    // Loading placeholder
    return (
      <mesh position={position} scale={scale}>
        <planeGeometry args={[1, 1.4]} />
        <meshBasicMaterial color="#e5e7eb" opacity={0.7} transparent />
      </mesh>
    )
  }

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <planeGeometry args={[1, 1.4]} />
      <meshBasicMaterial
        map={videoTexture}
        transparent
        side={THREE.DoubleSide}
        alphaTest={0.1}
        toneMapped={false}
      />
    </mesh>
  )
}
