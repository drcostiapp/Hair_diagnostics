import { describe, it, expect, vi } from 'vitest'

describe('audioUtils', () => {
  describe('getAudioDuration', () => {
    it('resolves with audio duration', async () => {
      let loadedmetadataHandler: (() => void) | null = null
      const mockAudio = {
        duration: 5.5,
        src: '',
        addEventListener: vi.fn((event: string, handler: () => void) => {
          if (event === 'loadedmetadata') loadedmetadataHandler = handler
        })
      }
      vi.stubGlobal('Audio', vi.fn(() => mockAudio))
      vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:test') })

      const { getAudioDuration } = await import('../../utils/audioUtils')
      const blob = new Blob(['audio'], { type: 'audio/wav' })
      const promise = getAudioDuration(blob)

      // Simulate metadata loaded
      loadedmetadataHandler!()

      const duration = await promise
      expect(duration).toBe(5.5)
      expect(mockAudio.src).toBe('blob:test')
    })
  })
})
