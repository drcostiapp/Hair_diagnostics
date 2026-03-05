import { useXR } from '@react-three/xr'
import { Html } from '@react-three/drei'

interface ARControlsProps {
  avatarPlaced: boolean
  onReset: () => void
}

export function ARControls({ avatarPlaced, onReset }: ARControlsProps) {
  const xrState = useXR()
  const isPresenting = !!xrState.session

  if (!isPresenting) return null

  return (
    <>
      {/* Instructions overlay in AR */}
      {!avatarPlaced && (
        <Html
          center
          position={[0, 1.2, -1.5]}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div className="bg-black/60 backdrop-blur text-white px-6 py-3 rounded-xl text-center whitespace-nowrap">
            <p className="text-sm font-medium">Point at a surface and tap to place Dr. Costi</p>
          </div>
        </Html>
      )}

      {/* Reset button in AR */}
      {avatarPlaced && (
        <Html position={[0, 0.5, -1]} center>
          <button
            onClick={onReset}
            className="bg-white/90 backdrop-blur text-gray-800 px-4 py-2 rounded-full text-sm font-medium shadow-lg"
          >
            Reposition Avatar
          </button>
        </Html>
      )}
    </>
  )
}
