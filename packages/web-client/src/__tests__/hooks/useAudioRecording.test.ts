import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAudioRecording } from '../../hooks/useAudioRecording'

class MockMediaRecorder {
  state = 'inactive'
  stream: MediaStream
  mimeType = 'audio/webm'
  ondataavailable: ((e: any) => void) | null = null
  onstop: (() => void) | null = null

  static isTypeSupported = vi.fn().mockReturnValue(true)

  constructor(stream: MediaStream, opts?: { mimeType: string }) {
    this.stream = stream
    if (opts?.mimeType) this.mimeType = opts.mimeType
  }

  start() {
    this.state = 'recording'
  }

  stop() {
    this.state = 'inactive'
    if (this.ondataavailable) {
      this.ondataavailable({ data: new Blob(['audio-data'], { type: this.mimeType }) })
    }
    if (this.onstop) this.onstop()
  }
}

const mockTrack = { stop: vi.fn() }
const mockStream = { getTracks: () => [mockTrack] } as unknown as MediaStream

const mockAnalyser = {
  fftSize: 0,
  frequencyBinCount: 32,
  getByteFrequencyData: vi.fn()
}

const mockAudioContext = {
  createAnalyser: () => mockAnalyser,
  createMediaStreamSource: () => ({ connect: vi.fn() }),
  close: vi.fn()
}

describe('useAudioRecording', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('MediaRecorder', MockMediaRecorder)
    vi.stubGlobal('AudioContext', vi.fn(() => mockAudioContext))
    vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1))
    vi.stubGlobal('cancelAnimationFrame', vi.fn())

    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream)
      },
      configurable: true
    })
  })

  it('starts in non-recording state', () => {
    const { result } = renderHook(() => useAudioRecording())

    expect(result.current.isRecording).toBe(false)
    expect(result.current.audioLevel).toBe(0)
    expect(result.current.error).toBeNull()
  })

  it('starts recording on startRecording()', async () => {
    const { result } = renderHook(() => useAudioRecording())

    await act(async () => {
      const p = result.current.startRecording()
      await p
    })

    expect(result.current.isRecording).toBe(true)
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
      audio: expect.objectContaining({ echoCancellation: true })
    })
  })

  it('stops recording and returns a blob', async () => {
    const { result } = renderHook(() => useAudioRecording())

    await act(async () => {
      await result.current.startRecording()
    })

    let blob: Blob | null = null
    await act(async () => {
      blob = await result.current.stopRecording()
    })

    expect(blob).toBeInstanceOf(Blob)
    expect(result.current.isRecording).toBe(false)
  })

  it('returns null when stopping without starting', async () => {
    const { result } = renderHook(() => useAudioRecording())

    let blob: Blob | null = null
    await act(async () => {
      blob = await result.current.stopRecording()
    })

    expect(blob).toBeNull()
  })

  it('sets error when getUserMedia fails', async () => {
    const err = new Error('Permission denied')
    vi.mocked(navigator.mediaDevices.getUserMedia).mockRejectedValueOnce(err)

    const { result } = renderHook(() => useAudioRecording())

    await act(async () => {
      await result.current.startRecording()
    })

    expect(result.current.error).toBe(err)
    expect(result.current.isRecording).toBe(false)
  })
})
