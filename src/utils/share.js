import LZString from 'lz-string'

export function encodeAgreement(config) {
  return LZString.compressToEncodedURIComponent(JSON.stringify(config))
}

export function decodeAgreement(value) {
  try {
    const compressed = LZString.decompressFromEncodedURIComponent(value)
    if (compressed) return JSON.parse(compressed)

    // Preserve compatibility with links generated before compression was added.
    const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4)
    const binary = atob(padded)
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    return JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    return null
  }
}
