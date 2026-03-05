import { Canvas } from '@react-three/fiber'
import { XR, createXRStore } from '@react-three/xr'
import { useState, useMemo } from 'react'
import { AvatarVideoPlane } from './AvatarVideoPlane'
import { PlacementHelper } from './PlacementHelper'
import { ARControls } from './ARControls'

interface ARSceneProps {
  isStreaming: boolean
  streamUrl: string | null
  onARSessionStart?: () => void
  onARSessionEnd?: () => void
}

export function ARScene({
  isStreaming,
  streamUrl,
  onARSessionStart,
  onARSessionEnd
}: ARSceneProps) {
  const [avatarPlaced, setAvatarPlaced] = useState(false)
  const [avatarPosition, setAvatarPosition] = useState<[number, number, number]>([0, 1.5, -2])

  const xrStore = useMemo(() => createXRStore({
    hand: { model: true },
    controller: { model: true }
  }), [])

  const handlePlace = (position: [number, number, number]) => {
    setAvatarPosition([position[0], position[1] + 0.35, position[2]])
    setAvatarPlaced(true)
  }

  const handleReset = () => {
    setAvatarPlaced(false)
    setAvatarPosition([0, 1.5, -2])
  }

  const handleEnterAR = () => {
    xrStore.enterAR().then(() => onARSessionStart?.()).catch(console.error)
  }

  return (
    <>
      {/* AR entry button outside canvas */}
      <button
        onClick={handleEnterAR}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-white border-2 border-primary-500 text-primary-500 rounded-xl font-semibold"
      >
        Enter AR Mode
      </button>

      <Canvas
        className="w-full h-full"
        camera={{ position: [0, 1.6, 0], fov: 70 }}
        gl={{ antialias: true, alpha: true }}
      >
        <XR store={xrStore}>
          {/* Environment lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />

          {/* Avatar video plane - shown when streaming */}
          {avatarPlaced && isStreaming && streamUrl && (
            <AvatarVideoPlane
              position={avatarPosition}
              scale={[0.5, 0.7, 1]}
              streamUrl={streamUrl}
            />
          )}

          {/* Placement helper - shown before avatar is placed */}
          {!avatarPlaced && <PlacementHelper onPlace={handlePlace} />}

          {/* AR interaction controls */}
          <ARControls
            avatarPlaced={avatarPlaced}
            onReset={handleReset}
          />
        </XR>

        {/* Non-AR fallback: show avatar as floating plane */}
        {!avatarPlaced && isStreaming && streamUrl && (
          <AvatarVideoPlane
            position={[0, 1.5, -2]}
            scale={[0.6, 0.85, 1]}
            streamUrl={streamUrl}
          />
        )}
      </Canvas>
    </>
  )
}
