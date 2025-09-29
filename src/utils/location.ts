const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  phoenix: { lat: 33.4484, lng: -112.074 },
  scottsdale: { lat: 33.4942, lng: -111.9261 },
  mesa: { lat: 33.4152, lng: -111.8315 },
  tempe: { lat: 33.4255, lng: -111.94 },
  chandler: { lat: 33.3062, lng: -111.8413 },
  gilbert: { lat: 33.3528, lng: -111.789 },
  glendale: { lat: 33.5387, lng: -112.186 },
  peoria: { lat: 33.5806, lng: -112.2374 },
  surprise: { lat: 33.6292, lng: -112.3679 },
  avondale: { lat: 33.4356, lng: -112.3496 },
  goodyear: { lat: 33.4355, lng: -112.3576 },
  buckeye: { lat: 33.3703, lng: -112.5838 },
}

const ZIP_TO_CITY: Record<string, string> = {
  '85233': 'gilbert',
  '85234': 'gilbert',
  '85295': 'gilbert',
  '85296': 'gilbert',
  '85297': 'gilbert',
  '85298': 'gilbert',
  '85001': 'phoenix',
  '85002': 'phoenix',
  '85003': 'phoenix',
  '85004': 'phoenix',
  '85006': 'phoenix',
  '85007': 'phoenix',
  '85008': 'phoenix',
  '85009': 'phoenix',
  '85012': 'phoenix',
  '85013': 'phoenix',
  '85014': 'phoenix',
  '85015': 'phoenix',
  '85016': 'phoenix',
  '85017': 'phoenix',
  '85018': 'phoenix',
  '85019': 'phoenix',
  '85020': 'phoenix',
  '85021': 'phoenix',
  '85022': 'phoenix',
  '85023': 'phoenix',
  '85024': 'phoenix',
  '85027': 'phoenix',
  '85028': 'phoenix',
  '85029': 'phoenix',
  '85032': 'phoenix',
  '85033': 'phoenix',
  '85034': 'phoenix',
  '85035': 'phoenix',
  '85037': 'phoenix',
  '85040': 'phoenix',
  '85041': 'phoenix',
  '85042': 'phoenix',
  '85043': 'phoenix',
  '85044': 'phoenix',
  '85045': 'phoenix',
  '85048': 'phoenix',
  '85051': 'phoenix',
  '85053': 'phoenix',
  '85054': 'phoenix',
  '85083': 'phoenix',
  '85250': 'scottsdale',
  '85251': 'scottsdale',
  '85252': 'scottsdale',
  '85253': 'scottsdale',
  '85254': 'scottsdale',
  '85255': 'scottsdale',
  '85256': 'scottsdale',
  '85257': 'scottsdale',
  '85258': 'scottsdale',
  '85259': 'scottsdale',
  '85260': 'scottsdale',
  '85261': 'scottsdale',
  '85262': 'scottsdale',
  '85266': 'scottsdale',
  '85267': 'scottsdale',
  '85268': 'scottsdale',
  '85201': 'mesa',
  '85202': 'mesa',
  '85203': 'mesa',
  '85204': 'mesa',
  '85205': 'mesa',
  '85206': 'mesa',
  '85207': 'mesa',
  '85208': 'mesa',
  '85209': 'mesa',
  '85210': 'mesa',
  '85211': 'mesa',
  '85212': 'mesa',
  '85213': 'mesa',
  '85214': 'mesa',
  '85215': 'mesa',
  '85216': 'mesa',
  '85281': 'tempe',
  '85282': 'tempe',
  '85283': 'tempe',
  '85284': 'tempe',
  '85285': 'tempe',
  '85224': 'chandler',
  '85225': 'chandler',
  '85226': 'chandler',
  '85248': 'chandler',
  '85249': 'chandler',
  '85301': 'glendale',
  '85302': 'glendale',
  '85303': 'glendale',
  '85304': 'glendale',
  '85305': 'glendale',
  '85306': 'glendale',
  '85307': 'glendale',
  '85308': 'glendale',
  '85309': 'glendale',
  '85345': 'peoria',
  '85381': 'peoria',
  '85382': 'peoria',
  '85383': 'peoria',
  '85385': 'peoria',
  '85374': 'surprise',
  '85378': 'surprise',
  '85387': 'surprise',
  '85388': 'surprise',
  '85323': 'avondale',
  '85392': 'avondale',
  '85393': 'avondale',
  '85338': 'goodyear',
  '85395': 'goodyear',
  '85326': 'buckeye',
  '85396': 'buckeye',
}

const PHOENIX_DEFAULT = { lat: 33.4484, lng: -112.074 }

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return hash
}

function normaliseKey(value: string): string {
  return value.trim().toLowerCase()
}

function getCityCoordinates(city: string): { lat: number; lng: number } {
  if (!city) return PHOENIX_DEFAULT
  const key = normaliseKey(city)
  return CITY_COORDINATES[key] || PHOENIX_DEFAULT
}

export function getFallbackCoordinates(city: string, zip: string): { lat: number; lng: number; geocoded: boolean } {
  const normalisedZip = zip.trim()
  const cityFromZip = ZIP_TO_CITY[normalisedZip]
  const baseCity = cityFromZip || city
  const baseCoords = getCityCoordinates(baseCity)

  const hashInput = normaliseKey(`${city}-${zip}`)
  const hash = hashString(hashInput)

  const latOffset = (((hash & 0xffff) / 0xffff) - 0.5) * 0.02
  const lngOffset = ((((hash >> 16) & 0xffff) / 0xffff) - 0.5) * 0.02

  return {
    lat: baseCoords.lat + latOffset,
    lng: baseCoords.lng + lngOffset,
    geocoded: false,
  }
}

export function resolveLocationInput(input: string): { lat: number; lng: number } | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  const zipMatch = trimmed.match(/\b\d{5}\b/)
  if (zipMatch) {
    const coords = getFallbackCoordinates('', zipMatch[0])
    return { lat: coords.lat, lng: coords.lng }
  }

  const [cityCandidate] = trimmed.split(',')
  const coords = getCityCoordinates(cityCandidate)
  return { lat: coords.lat, lng: coords.lng }
}

export function calculateDistanceMiles(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  // Input validation
  if (!a || !b || typeof a.lat !== 'number' || typeof a.lng !== 'number' ||
      typeof b.lat !== 'number' || typeof b.lng !== 'number') {
    return 0
  }

  // Handle identical coordinates
  if (Math.abs(a.lat - b.lat) < 0.000001 && Math.abs(a.lng - b.lng) < 0.000001) {
    return 0
  }

  const toRad = (deg: number) => (deg * Math.PI) / 180
  const earthRadiusMiles = 3958.8 // Mean radius of Earth in miles

  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)

  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)

  const sinLat = Math.sin(dLat / 2)
  const sinLng = Math.sin(dLng / 2)

  const haversine = sinLat * sinLat + sinLng * sinLng * Math.cos(lat1) * Math.cos(lat2)
  const c = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))

  const distance = earthRadiusMiles * c

  // Round to 2 decimal places for practical use
  return Math.round(distance * 100) / 100
}
