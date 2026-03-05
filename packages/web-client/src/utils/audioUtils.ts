/**
 * Convert audio blob to WAV format for broader compatibility
 */
export async function convertToWav(audioBlob: Blob): Promise<Blob> {
  const audioContext = new OfflineAudioContext(1, 44100 * 10, 44100)
  const arrayBuffer = await audioBlob.arrayBuffer()
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

  const wavBuffer = audioBufferToWav(audioBuffer)
  return new Blob([wavBuffer], { type: 'audio/wav' })
}

function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numChannels = 1
  const sampleRate = buffer.sampleRate
  const format = 1 // PCM
  const bitDepth = 16
  const channelData = buffer.getChannelData(0)
  const dataLength = channelData.length * (bitDepth / 8)
  const headerLength = 44
  const totalLength = headerLength + dataLength

  const wav = new ArrayBuffer(totalLength)
  const view = new DataView(wav)

  // WAV header
  writeString(view, 0, 'RIFF')
  view.setUint32(4, totalLength - 8, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, format, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true)
  view.setUint16(32, numChannels * (bitDepth / 8), true)
  view.setUint16(34, bitDepth, true)
  writeString(view, 36, 'data')
  view.setUint32(40, dataLength, true)

  // Audio data
  const offset = 44
  for (let i = 0; i < channelData.length; i++) {
    const sample = Math.max(-1, Math.min(1, channelData[i]))
    view.setInt16(offset + i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
  }

  return wav
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i))
  }
}

/**
 * Calculate audio duration from a blob
 */
export async function getAudioDuration(audioBlob: Blob): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio()
    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration)
    })
    audio.src = URL.createObjectURL(audioBlob)
  })
}
