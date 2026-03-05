import { useRef, useEffect, useState } from 'react'

interface QRScannerProps {
  onScan: (data: string) => void
  onError?: (error: Error) => void
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    let stream: MediaStream | null = null

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setIsActive(true)
        }

        // QR detection using BarcodeDetector API (available in Chrome 83+)
        if ('BarcodeDetector' in window) {
          const detector = new (window as any).BarcodeDetector({
            formats: ['qr_code']
          })

          const detect = async () => {
            if (!videoRef.current || !isActive) return

            try {
              const barcodes = await detector.detect(videoRef.current)
              if (barcodes.length > 0) {
                onScan(barcodes[0].rawValue)
                return
              }
            } catch {
              // Detection failed, continue scanning
            }

            requestAnimationFrame(detect)
          }

          detect()
        } else {
          onError?.(new Error('QR scanning not supported on this browser'))
        }
      } catch (err) {
        onError?.(err as Error)
      }
    }

    startCamera()

    return () => {
      setIsActive(false)
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [onScan, onError, isActive])

  return (
    <div className="relative rounded-xl overflow-hidden bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-64 object-cover"
      />
      {/* Scan overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-48 h-48 border-2 border-white/50 rounded-lg">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary-400" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary-400" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary-400" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary-400" />
        </div>
      </div>
      <p className="absolute bottom-3 left-0 right-0 text-center text-white text-xs">
        Point camera at clinic QR code
      </p>
    </div>
  )
}
