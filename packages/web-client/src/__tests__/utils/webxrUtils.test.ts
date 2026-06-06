import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkWebXRSupport, checkARSupport, getDeviceInfo } from '../../utils/webxrUtils'

describe('webxrUtils', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('checkWebXRSupport', () => {
    it('returns true when navigator.xr exists', () => {
      Object.defineProperty(navigator, 'xr', {
        value: { isSessionSupported: vi.fn() },
        configurable: true
      })

      expect(checkWebXRSupport()).toBe(true)
    })

    it('returns false when navigator.xr is missing', () => {
      // Delete the property to truly remove it
      delete (navigator as any).xr
      expect(checkWebXRSupport()).toBe(false)
    })
  })

  describe('checkARSupport', () => {
    it('returns true when immersive-ar is supported', async () => {
      Object.defineProperty(navigator, 'xr', {
        value: { isSessionSupported: vi.fn().mockResolvedValue(true) },
        configurable: true
      })

      expect(await checkARSupport()).toBe(true)
    })

    it('returns false when immersive-ar is not supported', async () => {
      Object.defineProperty(navigator, 'xr', {
        value: { isSessionSupported: vi.fn().mockResolvedValue(false) },
        configurable: true
      })

      expect(await checkARSupport()).toBe(false)
    })

    it('returns false when xr is not available', async () => {
      Object.defineProperty(navigator, 'xr', {
        value: undefined,
        configurable: true
      })

      expect(await checkARSupport()).toBe(false)
    })

    it('returns false when isSessionSupported throws', async () => {
      Object.defineProperty(navigator, 'xr', {
        value: { isSessionSupported: vi.fn().mockRejectedValue(new Error('fail')) },
        configurable: true
      })

      expect(await checkARSupport()).toBe(false)
    })
  })

  describe('getDeviceInfo', () => {
    it('detects Android Chrome', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 13) Chrome/120.0.0.0 Mobile Safari/537.36',
        configurable: true
      })

      const info = getDeviceInfo()
      expect(info.isAndroid).toBe(true)
      expect(info.isChrome).toBe(true)
      expect(info.isMobile).toBe(true)
      expect(info.arLikelySupported).toBe(true)
    })

    it('detects iOS Safari', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) AppleWebKit/605.1.15 Safari/604.1',
        configurable: true
      })

      const info = getDeviceInfo()
      expect(info.isIOS).toBe(true)
      expect(info.isSafari).toBe(true)
      expect(info.isMobile).toBe(true)
      expect(info.arLikelySupported).toBe(false)
    })

    it('detects desktop Chrome', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0) Chrome/120.0.0.0 Safari/537.36',
        configurable: true
      })

      const info = getDeviceInfo()
      expect(info.isAndroid).toBe(false)
      expect(info.isChrome).toBe(true)
      expect(info.isMobile).toBe(false)
      expect(info.arLikelySupported).toBe(false)
    })
  })
})
