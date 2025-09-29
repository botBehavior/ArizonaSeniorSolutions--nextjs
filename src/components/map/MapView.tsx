"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Loader2, MapPin } from 'lucide-react'
import type { Facility } from '@/types/facility'


interface MapViewProps {
  facilities: Facility[]
  selectedFacility: Facility | null
  onFacilitySelect: (facility: Facility) => void
  clientLocation?: string
}

export default function MapView({ 
  facilities, 
  selectedFacility, 
  onFacilitySelect
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [markers, setMarkers] = useState<google.maps.Marker[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fallback coordinates for when geocoding is unavailable (client-side fallback)
  const getFallbackCoordinates = useCallback((city: string, zip: string) => {
    // City coordinates mapping
    const cityCoords: { [key: string]: { lat: number, lng: number } } = {
      'Phoenix': { lat: 33.4484, lng: -112.0740 },
      'Scottsdale': { lat: 33.4942, lng: -111.9261 },
      'Mesa': { lat: 33.4152, lng: -111.8315 },
      'Tempe': { lat: 33.4255, lng: -111.9400 },
      'Chandler': { lat: 33.3062, lng: -111.8413 },
      'Gilbert': { lat: 33.3528, lng: -111.7890 },
      'Glendale': { lat: 33.5387, lng: -112.1860 },
      'Peoria': { lat: 33.5806, lng: -112.2374 },
      'Surprise': { lat: 33.6292, lng: -112.3679 },
      'Avondale': { lat: 33.4356, lng: -112.3496 },
      'Goodyear': { lat: 33.4355, lng: -112.3576 },
      'Buckeye': { lat: 33.3703, lng: -112.5838 },
    }
    
    // ZIP code to city mapping for major areas
    const zipToCity: { [key: string]: string } = {
      // Gilbert ZIP codes
      '85233': 'Gilbert', '85234': 'Gilbert', '85295': 'Gilbert', '85296': 'Gilbert',
      '85297': 'Gilbert', '85298': 'Gilbert',
      // Phoenix ZIP codes
      '85001': 'Phoenix', '85002': 'Phoenix', '85003': 'Phoenix', '85004': 'Phoenix',
      '85006': 'Phoenix', '85007': 'Phoenix', '85008': 'Phoenix', '85009': 'Phoenix',
      '85012': 'Phoenix', '85013': 'Phoenix', '85014': 'Phoenix', '85015': 'Phoenix',
      '85016': 'Phoenix', '85017': 'Phoenix', '85018': 'Phoenix', '85019': 'Phoenix',
      '85020': 'Phoenix', '85021': 'Phoenix', '85022': 'Phoenix', '85023': 'Phoenix',
      '85024': 'Phoenix', '85027': 'Phoenix', '85028': 'Phoenix', '85029': 'Phoenix',
      '85032': 'Phoenix', '85033': 'Phoenix', '85034': 'Phoenix', '85035': 'Phoenix',
      '85037': 'Phoenix', '85040': 'Phoenix', '85041': 'Phoenix', '85042': 'Phoenix',
      '85043': 'Phoenix', '85044': 'Phoenix', '85045': 'Phoenix', '85048': 'Phoenix',
      '85051': 'Phoenix', '85053': 'Phoenix', '85054': 'Phoenix', '85083': 'Phoenix',
      // Scottsdale ZIP codes
      '85250': 'Scottsdale', '85251': 'Scottsdale', '85252': 'Scottsdale', '85253': 'Scottsdale',
      '85254': 'Scottsdale', '85255': 'Scottsdale', '85256': 'Scottsdale', '85257': 'Scottsdale',
      '85258': 'Scottsdale', '85259': 'Scottsdale', '85260': 'Scottsdale', '85261': 'Scottsdale',
      '85262': 'Scottsdale', '85266': 'Scottsdale', '85267': 'Scottsdale', '85268': 'Scottsdale',
      // Mesa ZIP codes  
      '85201': 'Mesa', '85202': 'Mesa', '85203': 'Mesa', '85204': 'Mesa',
      '85205': 'Mesa', '85206': 'Mesa', '85207': 'Mesa', '85208': 'Mesa',
      '85209': 'Mesa', '85210': 'Mesa', '85211': 'Mesa', '85212': 'Mesa',
      '85213': 'Mesa', '85214': 'Mesa', '85215': 'Mesa', '85216': 'Mesa',
      // Tempe ZIP codes
      '85281': 'Tempe', '85282': 'Tempe', '85283': 'Tempe', '85284': 'Tempe', '85285': 'Tempe',
      // Chandler ZIP codes
      '85224': 'Chandler', '85225': 'Chandler', '85226': 'Chandler', '85248': 'Chandler', '85249': 'Chandler',
      // Glendale ZIP codes
      '85301': 'Glendale', '85302': 'Glendale', '85303': 'Glendale', '85304': 'Glendale',
      '85305': 'Glendale', '85306': 'Glendale', '85307': 'Glendale', '85308': 'Glendale', '85309': 'Glendale',
      // Peoria ZIP codes
      '85345': 'Peoria', '85381': 'Peoria', '85382': 'Peoria', '85383': 'Peoria', '85385': 'Peoria',
      // Surprise ZIP codes  
      '85374': 'Surprise', '85378': 'Surprise', '85387': 'Surprise', '85388': 'Surprise',
      // Avondale ZIP codes
      '85323': 'Avondale', '85392': 'Avondale', '85393': 'Avondale',
      // Goodyear ZIP codes
      '85338': 'Goodyear', '85395': 'Goodyear',
      // Buckeye ZIP codes
      '85326': 'Buckeye', '85396': 'Buckeye'
    }
    
    // Check if it's a ZIP code first, then convert to city
    const cityName = zipToCity[zip] || city
    const baseCoords = cityCoords[cityName] || { lat: 33.4484, lng: -112.0740 } // Default to Phoenix
    
    // Add small random offset to avoid overlapping markers
    const hash = city.length + zip.length
    const latOffset = ((hash % 100) / 1000) * 0.02 // Small offset within city bounds
    const lngOffset = (((hash >> 4) % 100) / 1000) * 0.02
    
    return {
      lat: baseCoords.lat + latOffset,
      lng: baseCoords.lng + lngOffset
    }
  }, [])

  // Get coordinates from facility data (now geocoded server-side)
  const getCoordinates = useCallback((facility: Facility) => {
    // Use geocoded coordinates if available
    if (facility.latitude && facility.longitude) {
      return {
        lat: facility.latitude,
        lng: facility.longitude
      }
    }
    
    // Fallback to city-based coordinates if geocoding failed
    return getFallbackCoordinates(facility.city, facility.zip)
  }, [getFallbackCoordinates])

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      try {
        // Check if Google Maps is already loaded
        if (typeof window.google !== 'undefined' && window.google.maps) {
          createMap()
          return
        }

        // Check if script is already being loaded
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
        if (existingScript) {
          existingScript.addEventListener('load', createMap)
          return
        }

        // Load Google Maps script
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
        script.async = true
        script.defer = true

        script.onload = () => {
          createMap()
        }

        script.onerror = () => {
          setError('Failed to load Google Maps')
          setIsLoading(false)
        }

        document.head.appendChild(script)
      } catch (err) {
        console.error('Error initializing map:', err)
        setError('Error initializing map')
        setIsLoading(false)
      }
    }

    const createMap = () => {
      if (!mapRef.current) return

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat: 33.4942, lng: -111.9261 }, // Scottsdale center
        zoom: 11,
        styles: [
          // Hide all POI labels and icons that create visual clutter
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'poi',
            elementType: 'geometry',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'transit',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'transit',
            elementType: 'geometry',
            stylers: [{ visibility: 'off' }]
          },
          // Style the base map
          {
            featureType: 'all',
            elementType: 'geometry.fill',
            stylers: [{ color: '#1a1a2e' }]
          },
          {
            featureType: 'all',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#ffffff' }]
          },
          {
            featureType: 'all',
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#1a1a2e' }, { weight: 2 }]
          },
          {
            featureType: 'water',
            elementType: 'geometry.fill',
            stylers: [{ color: '#16213e' }]
          },
          {
            featureType: 'road',
            elementType: 'geometry.fill',
            stylers: [{ color: '#2d3748' }]
          },
          {
            featureType: 'road',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#4a5568' }]
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry.fill',
            stylers: [{ color: '#3182ce' }]
          },
          {
            featureType: 'administrative',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#4a5568' }, { weight: 0.5 }]
          }
        ],
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        zoomControl: true,
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_BOTTOM
        },
        gestureHandling: 'greedy' // Changed from 'cooperative' for better mobile experience
      })

      setMap(mapInstance)
      setIsLoading(false)
    }

    initMap()

    // Cleanup function
    return () => {
      // Clean up markers when component unmounts
      markers.forEach(marker => marker.setMap(null))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update markers when facilities change
  useEffect(() => {
    if (!map || !facilities) return

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null))
    
    const newMarkers: google.maps.Marker[] = []
    const bounds = new window.google.maps.LatLngBounds()

    // Get facility type color function
    const getFacilityColor = (type: string) => {
      const lowerType = type.toLowerCase()
      if (lowerType.includes('memory care')) return '#9333ea' // Purple
      if (lowerType.includes('assisted living home')) return '#3b82f6' // Blue
      if (lowerType.includes('assisted living center')) return '#10b981' // Green
      if (lowerType.includes('independent living')) return '#f59e0b' // Yellow
      return '#6b7280' // Gray default
    }

    facilities.forEach((facility) => {
      // Get coordinates from geocoded facility data
      const coords = getCoordinates(facility)
      
      const facilityColor = getFacilityColor(facility.facility_type)
      const isSelected = selectedFacility?.id === facility.id

      // Create custom marker with better visibility
      const marker = new window.google.maps.Marker({
        position: coords,
        map: map,
        title: facility.name,
        icon: {
          path: 'M12,2C8.13,2 5,5.13 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9C19,5.13 15.87,2 12,2M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5Z',
          fillColor: isSelected ? '#ff6b6b' : facilityColor,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
          scale: isSelected ? 2.2 : 1.8,
          anchor: new window.google.maps.Point(12, 24)
        },
        zIndex: isSelected ? 1000 : 100,
        animation: isSelected ? window.google.maps.Animation.BOUNCE : undefined
      })

      // Add info window on hover
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="color: #1f2937; font-family: system-ui; max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">${facility.name}</h3>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280;">${facility.address}</p>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280;">${facility.city}, AZ ${facility.zip}</p>
            <div style="margin-top: 8px; padding: 4px 8px; background: ${facilityColor}20; border-radius: 4px; font-size: 11px; color: ${facilityColor}; font-weight: 500;">
              ${facility.facility_type}
            </div>
            ${facility.geocoded === false ? '<div style="margin-top: 4px; font-size: 10px; color: #9ca3af;">⚠ Approximate location</div>' : ''}
          </div>
        `
      })

      marker.addListener('mouseover', () => {
        infoWindow.open(map, marker)
      })

      marker.addListener('mouseout', () => {
        infoWindow.close()
      })

      marker.addListener('click', () => {
        onFacilitySelect(facility)
        // Smooth pan to marker
        map.panTo(coords)
      })

      newMarkers.push(marker)
      bounds.extend(coords)
    })

    setMarkers(newMarkers)
    
    // Only fit bounds if we have facilities and this is the initial load
    if (facilities.length > 0 && markers.length === 0) {
      map.fitBounds(bounds)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, facilities, selectedFacility, onFacilitySelect, getCoordinates])

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-800/50 backdrop-blur-sm p-6">
        <div className="text-center text-white max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
            <MapPin className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Map Unavailable</h3>
          <p className="text-white/70 mb-4 leading-relaxed">
            {error.includes('Google Maps')
              ? 'Google Maps could not be loaded. Please check your internet connection and API configuration.'
              : 'An error occurred while loading the map. This might be temporary.'
            }
          </p>
          <div className="bg-black/20 p-3 rounded text-sm text-white/60 mb-4">
            <strong>Error:</strong> {error}
          </div>
          <div className="space-y-2 text-xs text-white/50">
            <p>• Check your internet connection</p>
            <p>• Verify Google Maps API key is configured</p>
            <p>• Try refreshing the page</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-800/50 backdrop-blur-sm">
          <div className="text-center text-white">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-full mb-4">
              <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">Loading Map</h3>
            <p className="text-white/70 text-sm">Initializing Google Maps and facility markers...</p>
            <div className="mt-4 space-y-1 text-xs text-white/50">
              <p>• Connecting to Google Maps</p>
              <p>• Loading facility data</p>
              <p>• Setting up interactive markers</p>
            </div>
          </div>
        </div>
      )}
      <div ref={mapRef} className="h-full w-full rounded-lg" />
    </div>
  )
}
