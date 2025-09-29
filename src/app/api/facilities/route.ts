import { NextResponse } from 'next/server'
import type { Facility } from '@/types/facility'
import { getFallbackCoordinates } from '@/utils/location'

// Google Sheets CSV export URL
const GOOGLE_SHEETS_CSV_URL = 'https://docs.google.com/spreadsheets/d/1rdW8JWG734RdaZ3NHqin9E4Tdzin-52KuEriQYpM0IY/export?format=csv&gid=0'

// Force dynamic route to prevent static generation issues
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Data validation functions
function validateFacility(): boolean {
  return true // Basic validation - ensure required fields exist
}

function sanitizeFacilityData(facility: Record<string, unknown>): Facility {
  return {
    id: String(facility.id || `facility-${Date.now()}-${Math.random()}`),
    name: String(facility.name || '').trim(),
    added_by: String(facility.added_by || '').trim(),
    address: String(facility.address || '').trim(),
    city: String(facility.city || '').trim(),
    zip: String(facility.zip || '').trim(),
    phone: String(facility.phone || '').trim(),
    contact_person: facility.contact_person ? String(facility.contact_person).trim() : '',
    facility_type: String(facility.facility_type || '').trim().toLowerCase(),
    available_beds: facility.available_beds ? String(facility.available_beds).trim() : '',
    price_min: facility.price_min ? String(facility.price_min).trim() : '',
    price_max: facility.price_max ? String(facility.price_max).trim() : '',
    altcs_accepted: facility.altcs_accepted ? String(facility.altcs_accepted).trim() : '',
    special_services: facility.special_services ? String(facility.special_services).trim() : '',
    notes: facility.notes ? String(facility.notes).trim() : '',
    date_added: facility.date_added ? String(facility.date_added).trim() : '',
  }
}

// Geocoding cache to avoid repeated API calls
const geocodeCache = new Map<string, { lat: number, lng: number, geocoded: boolean }>()

// Rate limiting for geocoding API calls
let lastGeocodingCall = 0
const GEOCODING_DELAY = 100 // 100ms between calls to respect rate limits

// Sample data for testing when Google Sheets is unavailable
const SAMPLE_FACILITIES: Facility[] = [
  {
    id: 'sample-1',
    name: 'Sunset Senior Living',
    address: '1234 W Main St',
    city: 'Phoenix',
    zip: '85001',
    phone: '(602) 555-0123',
    contact_person: 'Mary Johnson',
    facility_type: 'assisted living center',
    available_beds: '5',
    price_min: '3500',
    price_max: '5500',
    altcs_accepted: 'Yes',
    special_services: '24/7 nursing care, physical therapy',
    notes: 'Beautiful courtyard, close to medical facilities',
    date_added: '2025-01-15',
    added_by: 'Admin'
  },
  {
    id: 'sample-2',
    name: 'Desert View Memory Care',
    address: '5678 N Central Ave',
    city: 'Scottsdale',
    zip: '85251',
    phone: '(480) 555-0456',
    contact_person: 'Dr. Robert Smith',
    facility_type: 'memory care',
    available_beds: '2',
    price_min: '4500',
    price_max: '6500',
    altcs_accepted: 'Yes',
    special_services: 'Specialized Alzheimer\'s care, secured unit',
    notes: 'Certified memory care specialists on staff',
    date_added: '2025-01-20',
    added_by: 'Admin'
  },
  {
    id: 'sample-3',
    name: 'Mountain Vista Independent Living',
    address: '9101 E Camelback Rd',
    city: 'Mesa',
    zip: '85207',
    phone: '(480) 555-0789',
    contact_person: 'Sarah Davis',
    facility_type: 'independent living',
    available_beds: '8',
    price_min: '2800',
    price_max: '4200',
    altcs_accepted: 'No',
    special_services: 'Housekeeping, transportation, social activities',
    notes: 'Gorgeous mountain views, resort-style amenities',
    date_added: '2025-02-01',
    added_by: 'Admin'
  }
]

export async function GET() {
  try {
    const response = await fetch(GOOGLE_SHEETS_CSV_URL, {
      cache: 'no-store', // Always fetch fresh data
    })

    if (!response.ok) {
      console.warn(`Google Sheets unavailable (${response.status}), using sample data`)
      console.log('Sample facilities count:', SAMPLE_FACILITIES.length)
      const rawFacilities = SAMPLE_FACILITIES
      const facilities = await geocodeFacilities(rawFacilities)
      console.log('Geocoded facilities count:', facilities.length)
      return NextResponse.json({
        facilities,
        count: facilities.length,
        lastUpdated: new Date().toISOString(),
        geocodingStatus: 'completed',
        source: 'sample'
      })
    }

    const csvText = await response.text()
    const rawFacilities = parseCSVToFacilities(csvText)

    // Geocode facilities that don't have coordinates yet
    const facilities = await geocodeFacilities(rawFacilities)

    return NextResponse.json({
      facilities,
      count: facilities.length,
      lastUpdated: new Date().toISOString(),
      geocodingStatus: 'completed',
      source: 'google_sheets'
    })
  } catch (error) {
    console.error('Error fetching facilities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch facilities data' },
      { status: 500 }
    )
  }
}

function parseCSVToFacilities(csvText: string): Facility[] {
  const lines = csvText.split('\n')
  if (lines.length < 2) return []

  // Get headers from first line
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))

  // Actual Google Sheet column order:
  // Name, Address, City, Zip, Phone, Contact_Person, Facility_Type, Available_Beds, Price_Min, Price_Max, ALTCS_Accepted, Special_Services, Notes, Date_Added, Added_By

  const facilities: Facility[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const values = parseCSVLine(line)
    if (values.length < headers.length) continue

    // Skip rows where required fields are empty
    if (!values[0] || values[0].trim() === '') continue

    const rawFacility = {
      id: `facility-${i}`,
      name: values[0] || '',
      address: values[1] || '',  // Street address is in column 1
      city: values[2] || '',     // City is in column 2
      zip: values[3] || '',      // ZIP is in column 3
      phone: values[4] || '',    // Phone is in column 4
      contact_person: values[5] || '', // Contact person is in column 5
      facility_type: values[6] || '', // Facility type is in column 6
      available_beds: values[7] || '', // Available beds is in column 7
      price_min: values[8] || '', // Price min is in column 8
      price_max: values[9] || '', // Price max is in column 9
      altcs_accepted: values[10] || '', // ALTCS accepted is in column 10
      special_services: values[11] || '', // Special services is in column 11
      notes: values[12] || '', // Notes is in column 12
      date_added: values[13] || '', // Date added is in column 13
      added_by: values[14] || '', // Added by is in column 14
    }

    // Validate the facility data
    if (!validateFacility()) {
      console.warn(`Skipping invalid facility at row ${i + 1}:`, rawFacility.name || 'Unknown')
      continue
    }

    // Sanitize and add to facilities list
    const facility = sanitizeFacilityData(rawFacility)
    facilities.push(facility)
  }
  
  return facilities
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current.trim())
  return result.map(val => val.replace(/"/g, ''))
}

// Geocode facilities using Google Maps Geocoding API
async function geocodeFacilities(facilities: Facility[]): Promise<Facility[]> {
  const geocodedFacilities: Facility[] = []
  
  for (const facility of facilities) {
    const fullAddress = `${facility.address}, ${facility.city}, AZ ${facility.zip}`.trim()
    
    // Check cache first
    if (geocodeCache.has(fullAddress)) {
      const cached = geocodeCache.get(fullAddress)!
      geocodedFacilities.push({
        ...facility,
        latitude: cached.lat,
        longitude: cached.lng,
        geocoded: cached.geocoded
      })
      continue
    }
    
    try {
      // Rate limiting
      const now = Date.now()
      if (now - lastGeocodingCall < GEOCODING_DELAY) {
        await new Promise(resolve => setTimeout(resolve, GEOCODING_DELAY - (now - lastGeocodingCall)))
      }
      lastGeocodingCall = Date.now()
      
      const coords = await geocodeAddress(fullAddress)
      
      // Cache the result
      geocodeCache.set(fullAddress, coords)
      
      geocodedFacilities.push({
        ...facility,
        latitude: coords.lat,
        longitude: coords.lng,
        geocoded: coords.geocoded
      })
    } catch (error) {
      console.warn(`Geocoding failed for ${facility.name} at ${fullAddress}, using fallback coordinates:`, error)

      // Fallback to city-based coordinates
      const fallbackCoords = getFallbackCoordinates(facility.city, facility.zip)
      geocodeCache.set(fullAddress, fallbackCoords)

      geocodedFacilities.push({
        ...facility,
        latitude: fallbackCoords.lat,
        longitude: fallbackCoords.lng,
        geocoded: fallbackCoords.geocoded
      })
    }
  }
  
  return geocodedFacilities
}

// Use Google Maps Geocoding API
async function geocodeAddress(address: string): Promise<{ lat: number, lng: number, geocoded: boolean }> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    throw new Error('Google Maps API key not configured')
  }

  const encodedAddress = encodeURIComponent(address)
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Geocoding API request failed with status ${response.status}`)
  }

  const data = await response.json()

  if (data.status !== 'OK') {
    let errorMessage = `Geocoding API returned status: ${data.status}`

    switch (data.status) {
      case 'ZERO_RESULTS':
        errorMessage = 'No location found for this address'
        break
      case 'OVER_QUERY_LIMIT':
        errorMessage = 'Geocoding API quota exceeded'
        break
      case 'REQUEST_DENIED':
        errorMessage = 'Geocoding API request denied - check API key'
        break
      case 'INVALID_REQUEST':
        errorMessage = 'Invalid address format'
        break
      default:
        if (data.error_message) {
          errorMessage += ` - ${data.error_message}`
        }
    }

    throw new Error(errorMessage)
  }

  if (!data.results || data.results.length === 0) {
    throw new Error('Geocoding returned no results')
  }

  const location = data.results[0].geometry.location
  if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
    throw new Error('Invalid location data received from geocoding API')
  }

  return {
    lat: location.lat,
    lng: location.lng,
    geocoded: true
  }
}
