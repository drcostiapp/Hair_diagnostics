/**
 * Check if WebXR immersive-ar is supported on this device/browser
 */
export function checkWebXRSupport(): boolean {
  if (typeof navigator === 'undefined') return false
  return 'xr' in navigator
}

/**
 * Check specifically if AR sessions are supported
 */
export async function checkARSupport(): Promise<boolean> {
  if (!checkWebXRSupport()) return false
  try {
    return await navigator.xr!.isSessionSupported('immersive-ar')
  } catch {
    return false
  }
}

/**
 * Get device info for analytics and compatibility checking
 */
export function getDeviceInfo() {
  const ua = navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/.test(ua)
  const isAndroid = /Android/.test(ua)
  const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua)
  const isChrome = /Chrome/.test(ua) && !/Edge/.test(ua)

  return {
    isIOS,
    isAndroid,
    isSafari,
    isChrome,
    isMobile: isIOS || isAndroid,
    userAgent: ua,
    // WebXR AR is supported on Android Chrome, not iOS Safari
    arLikelySupported: isAndroid && isChrome
  }
}
