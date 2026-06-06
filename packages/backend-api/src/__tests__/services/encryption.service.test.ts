import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('EncryptionService', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  async function loadService(envKey?: string) {
    if (envKey) {
      vi.stubEnv('ENCRYPTION_KEY', envKey)
    } else {
      vi.stubEnv('ENCRYPTION_KEY', '')
    }
    const mod = await import('../../services/encryption.service.js')
    return mod.encryptionService
  }

  it('encrypts and decrypts a string roundtrip', async () => {
    const key = 'a'.repeat(64)
    const svc = await loadService(key)
    const plaintext = 'Hello, Dr. Costi!'

    const encrypted = svc.encrypt(plaintext)
    const decrypted = svc.decrypt(encrypted)

    expect(decrypted).toBe(plaintext)
    expect(encrypted).not.toBe(plaintext)
  })

  it('produces iv:tag:encrypted format', async () => {
    const key = 'b'.repeat(64)
    const svc = await loadService(key)

    const encrypted = svc.encrypt('test')
    const parts = encrypted.split(':')

    expect(parts).toHaveLength(3)
    expect(parts[0]).toHaveLength(32) // 16-byte IV in hex
    expect(parts[1]).toHaveLength(32) // 16-byte tag in hex
    expect(parts[2].length).toBeGreaterThan(0)
  })

  it('generates unique ciphertexts for the same plaintext (random IV)', async () => {
    const key = 'c'.repeat(64)
    const svc = await loadService(key)

    const enc1 = svc.encrypt('same-text')
    const enc2 = svc.encrypt('same-text')

    expect(enc1).not.toBe(enc2)
  })

  it('throws on invalid ciphertext format', async () => {
    const key = 'd'.repeat(64)
    const svc = await loadService(key)

    expect(() => svc.decrypt('not-valid-format')).toThrow('Invalid encrypted data format')
    expect(() => svc.decrypt('a:b')).toThrow('Invalid encrypted data format')
  })

  it('throws on tampered ciphertext', async () => {
    const key = 'e'.repeat(64)
    const svc = await loadService(key)

    const encrypted = svc.encrypt('secret')
    const parts = encrypted.split(':')
    parts[2] = 'ff' + parts[2].slice(2) // tamper with encrypted data

    expect(() => svc.decrypt(parts.join(':'))).toThrow()
  })

  it('uses a dev fallback key when ENCRYPTION_KEY is missing', async () => {
    const svc = await loadService()
    const encrypted = svc.encrypt('dev-mode')
    const decrypted = svc.decrypt(encrypted)

    expect(decrypted).toBe('dev-mode')
  })
})
