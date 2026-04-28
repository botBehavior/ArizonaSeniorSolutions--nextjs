// Detect the user's preferred maps provider and build directions URLs.
// Apple devices (iOS/iPadOS/macOS) get Apple Maps deep links via universal link,
// which open the native Maps app. Everyone else gets Google Maps.

export type MapsProvider = 'apple' | 'google'

export function detectMapsProvider(): MapsProvider {
  if (typeof navigator === 'undefined') return 'google'
  const ua = navigator.userAgent || ''
  // Modern iPadOS reports as Mac with touch — match both
  const isApple = /iPhone|iPad|iPod|Macintosh/i.test(ua)
  return isApple ? 'apple' : 'google'
}

export function buildSingleStopUrl(provider: MapsProvider, address: string): string {
  const a = address.trim()
  if (!a) return ''
  if (provider === 'apple') {
    // https://maps.apple.com/?daddr=...&dirflg=d
    return `https://maps.apple.com/?daddr=${encodeURIComponent(a)}&dirflg=d`
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(a)}`
}

// Build a multi-stop directions URL.
// `origin` is optional starting point (string address or "lat,lng").
// `stops` is the ordered list of intermediate + final addresses.
export function buildMultiStopUrl(
  provider: MapsProvider,
  stops: string[],
  origin: string | null,
): string | null {
  if (stops.length === 0) return null

  if (provider === 'apple') {
    // Apple Maps URL scheme: daddr accepts multiple addresses joined with "+to:"
    // Each address is URL-encoded; the literal "+to:" separator stays unencoded.
    const dest = stops.map(s => encodeURIComponent(s.trim())).join('+to:')
    const params: string[] = [`daddr=${dest}`, 'dirflg=d']
    if (origin) params.unshift(`saddr=${encodeURIComponent(origin.trim())}`)
    return `https://maps.apple.com/?${params.join('&')}`
  }

  // Google Maps: api=1 with destination + waypoints + optional origin
  const destination = stops[stops.length - 1]
  const waypoints = stops.slice(0, -1)
  const params = new URLSearchParams()
  params.set('api', '1')
  params.set('destination', destination)
  if (origin) params.set('origin', origin)
  if (waypoints.length > 0) params.set('waypoints', waypoints.join('|'))
  params.set('travelmode', 'driving')
  return `https://www.google.com/maps/dir/?${params.toString()}`
}
