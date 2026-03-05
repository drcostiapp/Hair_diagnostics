import { useState, useCallback, useRef, useEffect } from 'react'

interface UseVoiceActivationOptions {
  threshold?: number
  silenceDuration?: number
}

export function useVoiceActivation(options: UseVoiceActivationOptions = {}) {
  const { threshold = 0.1, silenceDuration = 1500 } = options

  const [isSpeaking, setIsSpeaking] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)

  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const startListening = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    streamRef.current = stream

    const audioContext = new AudioContext()
    const analyser = audioContext.createAnalyser()
    const source = audioContext.createMediaStreamSource(stream)
    analyser.fftSize = 256
    source.connect(analyser)

    audioContextRef.current = audioContext
    analyserRef.current = analyser

    const dataArray = new Uint8Array(analyser.frequencyBinCount)

    const checkLevel = () => {
      if (!analyserRef.current) return
      analyserRef.current.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
      const normalized = average / 255

      setAudioLevel(normalized)

      if (normalized > threshold) {
        setIsSpeaking(true)
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current)
        }
        silenceTimerRef.current = setTimeout(() => {
          setIsSpeaking(false)
        }, silenceDuration)
      }

      animationFrameRef.current = requestAnimationFrame(checkLevel)
    }

    checkLevel()
  }, [threshold, silenceDuration])

  const stopListening = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
    }
    analyserRef.current?.disconnect()
    audioContextRef.current?.close()
    streamRef.current?.getTracks().forEach((t) => t.stop())

    analyserRef.current = null
    audioContextRef.current = null
    streamRef.current = null
    setIsSpeaking(false)
    setAudioLevel(0)
  }, [])

  useEffect(() => {
    return () => stopListening()
  }, [stopListening])

  return { isSpeaking, audioLevel, startListening, stopListening }
}
