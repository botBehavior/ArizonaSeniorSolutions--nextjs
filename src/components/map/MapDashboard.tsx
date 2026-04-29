"use client"

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Search, Filter, Navigation, Plus, Loader2, ChevronUp, ChevronDown, ChevronRight, LocateFixed, Phone, X, RefreshCw, Route } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import MapView from './MapView'
import MapErrorBoundary from './MapErrorBoundary'
import FacilityCard from './FacilityCard'
import FacilityCardSkeleton from './FacilityCardSkeleton'
import SearchFilters, { type SearchFiltersState } from './SearchFilters'
import TourPlanner from './TourPlanner'
import { useFacilities } from '@/hooks/useFacilities'
import type { Facility } from '@/types/facility'
import { calculateDistanceMiles, resolveLocationInput, getFallbackCoordinates } from '@/utils/location'
import { buildSingleStopUrl, detectMapsProvider } from '@/utils/maps-provider'

type FacilityWithMetrics = Facility & { distance?: number; driveTime?: number }

type SidebarTab = 'facilities' | 'tour'

const TOUR_STORAGE_KEY = 'map.tourList.v1'
const LOCATION_STORAGE_KEY = 'map.clientLocation.v1'

function loadTourFromStorage(): FacilityWithMetrics[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(TOUR_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function loadLocationFromStorage(): { label: string; coords: { lat: number; lng: number } | null } {
  if (typeof window === 'undefined') return { label: '', coords: null }
  try {
    const raw = window.localStorage.getItem(LOCATION_STORAGE_KEY)
    if (!raw) return { label: '', coords: null }
    const parsed = JSON.parse(raw)
    return {
      label: typeof parsed.label === 'string' ? parsed.label : '',
      coords: parsed.coords && typeof parsed.coords.lat === 'number' ? parsed.coords : null,
    }
  } catch {
    return { label: '', coords: null }
  }
}

const DEFAULT_ADVANCED_FILTERS: SearchFiltersState = {
  facilityKind: '',
  availabilityOnly: false,
}

function matchesFacilityKind(facility: Facility, kind: SearchFiltersState['facilityKind']): boolean {
  if (!kind) return true
  const t = (facility.facility_type || '').toLowerCase()
  if (kind === 'memory-care') return t.includes('memory care')
  if (kind === 'al-home') return t.includes('assisted living home')
  if (kind === 'al-center') return t.includes('assisted living center')
  if (kind === 'other') {
    return !t.includes('assisted living') && !t.includes('memory care')
  }
  return true
}

// Improved drive time calculation with more realistic speed estimates
const URBAN_SPEED_MPH = 25  // City streets, traffic lights
const SUBURBAN_SPEED_MPH = 35  // Residential areas, some traffic
const HIGHWAY_SPEED_MPH = 45  // Major roads, limited access

function hasAvailableBeds(facility: Facility): boolean {
  const value = facility.available_beds
  if (value === undefined || value === null || value === '') return false
  if (typeof value === 'number') return value > 0
  const str = value.toString().trim().toLowerCase()
  if (str === 'available') return true
  if (str === 'full') return false
  const parsed = Number(str.replace(/[^0-9-]/g, ''))
  return Number.isFinite(parsed) && parsed > 0
}

function getFacilityCoordinates(facility: Facility): { lat: number; lng: number } {
  if (typeof facility.latitude === 'number' && typeof facility.longitude === 'number') {
    return { lat: facility.latitude, lng: facility.longitude }
  }
  const fallback = getFallbackCoordinates(facility.city, facility.zip)
  return { lat: fallback.lat, lng: fallback.lng }
}

function computeDriveTimeMinutes(distanceMiles: number): number {
  if (!Number.isFinite(distanceMiles) || distanceMiles <= 0) return 0

  // For senior care facility tours in Phoenix metro area:
  // - Most travel is suburban/residential (60% of time)
  // - Some urban city driving (30% of time)
  // - Limited highway travel (10% of time)
  const weightedSpeed = (SUBURBAN_SPEED_MPH * 0.6) + (URBAN_SPEED_MPH * 0.3) + (HIGHWAY_SPEED_MPH * 0.1)

  // Add time for traffic lights, turns, and parking (estimated 2 minutes per facility visit)
  const baseDriveTime = (distanceMiles / weightedSpeed) * 60

  // Minimum 5 minutes for very short distances, add buffer for realistic travel
  return Math.max(Math.round(baseDriveTime), 5)
}

export default function MapDashboard() {
  const { facilities, loading, error, refreshData } = useFacilities()
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null)
  const [clientLocation, setClientLocation] = useState('')
  const [clientCoords, setClientCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [nearbyFacilities, setNearbyFacilities] = useState<FacilityWithMetrics[]>([])
  const [tourList, setTourList] = useState<FacilityWithMetrics[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const saved = loadTourFromStorage()
    if (saved.length) setTourList(saved)
    const loc = loadLocationFromStorage()
    if (loc.label) setClientLocation(loc.label)
    if (loc.coords) setClientCoords(loc.coords)
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(tourList))
    } catch { /* quota or private mode — ignore */ }
  }, [tourList, hydrated])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(
        LOCATION_STORAGE_KEY,
        JSON.stringify({ label: clientLocation, coords: clientCoords })
      )
    } catch { /* ignore */ }
  }, [clientLocation, clientCoords, hydrated])
  const [showFacilityPanel, setShowFacilityPanel] = useState(true)
  const [activeTab, setActiveTab] = useState<SidebarTab>('facilities')
  const [advancedFilters, setAdvancedFilters] = useState<SearchFiltersState>(DEFAULT_ADVANCED_FILTERS)
  const [filtersExpanded, setFiltersExpanded] = useState<string[]>(['filters'])
  const [visibleLimit, setVisibleLimit] = useState(50)
  const [mapPinMode, setMapPinMode] = useState<'all' | 'tour'>('all')

  const facilitiesList = useMemo(() => facilities || [], [facilities])

  const computeNearbyFacilities = useCallback(
    (origin: { lat: number; lng: number }) => {
      if (!facilitiesList.length) return []

      return facilitiesList
        .map<FacilityWithMetrics>((facility) => {
          const coords = getFacilityCoordinates(facility)
          const distance = calculateDistanceMiles(origin, coords)
          return {
            ...facility,
            distance,
            driveTime: computeDriveTimeMinutes(distance),
          }
        })
        .filter((facility) => Number.isFinite(facility.distance))
        .sort((a, b) => (a.distance ?? Number.POSITIVE_INFINITY) - (b.distance ?? Number.POSITIVE_INFINITY))
    },
    [facilitiesList]
  )

  const handleLocationSearch = useCallback(() => {
    if (!clientLocation.trim()) return

    const coords = resolveLocationInput(clientLocation)
    if (!coords) {
      setNearbyFacilities([])
      setClientCoords(null)
      return
    }

    setClientCoords(coords)
    const nearby = computeNearbyFacilities(coords)
    setNearbyFacilities(nearby.slice(0, 100))
    setActiveTab('facilities')
  }, [clientLocation, computeNearbyFacilities])

  const [geolocating, setGeolocating] = useState(false)
  const [geolocationError, setGeolocationError] = useState<string | null>(null)

  const handleUseMyLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeolocationError('Geolocation not supported on this device')
      return
    }
    setGeolocating(true)
    setGeolocationError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setClientCoords(coords)
        setClientLocation('My current location')
        const nearby = computeNearbyFacilities(coords)
        setNearbyFacilities(nearby.slice(0, 100))
        setActiveTab('facilities')
        setGeolocating(false)
      },
      (err) => {
        const msg = err.code === err.PERMISSION_DENIED
          ? 'Location access denied. Allow it in your browser settings to use this feature.'
          : err.code === err.POSITION_UNAVAILABLE
            ? 'Location unavailable right now. Try again outside or with GPS on.'
            : 'Could not get your location.'
        setGeolocationError(msg)
        setGeolocating(false)
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    )
  }, [computeNearbyFacilities])

  useEffect(() => {
    if (clientCoords) {
      const refreshed = computeNearbyFacilities(clientCoords)
      setNearbyFacilities(refreshed.slice(0, 100))
    }
  }, [clientCoords, facilitiesList, computeNearbyFacilities])


  const filteredFacilities = useMemo(() => {
    const source = nearbyFacilities.length > 0 ? nearbyFacilities : facilitiesList
    if (!source.length) return []

    const loweredSearch = searchTerm.trim().toLowerCase()

    return source.filter((facility) => {
      const name = facility.name?.toLowerCase() || ''
      const city = facility.city?.toLowerCase() || ''
      const address = facility.address?.toLowerCase() || ''
      const zip = facility.zip?.toLowerCase() || ''

      if (
        loweredSearch &&
        !name.includes(loweredSearch) &&
        !city.includes(loweredSearch) &&
        !address.includes(loweredSearch) &&
        !zip.includes(loweredSearch)
      ) {
        return false
      }

      if (!matchesFacilityKind(facility, advancedFilters.facilityKind)) return false
      if (advancedFilters.availabilityOnly && !hasAvailableBeds(facility)) return false

      return true
    })
  }, [facilitiesList, nearbyFacilities, searchTerm, advancedFilters])

  useEffect(() => {
    if (selectedFacility && !filteredFacilities.some((facility) => facility.id === selectedFacility.id)) {
      setSelectedFacility(null)
    }
  }, [filteredFacilities, selectedFacility])

  useEffect(() => {
    setVisibleLimit(50)
  }, [searchTerm, advancedFilters, clientCoords])

  // Ensure the selected facility's card is mounted in the sidebar list
  // (otherwise the in-card auto-scroll has nothing to scroll to). Round
  // the bumped limit up to the next 50 so it's still a clean "Show more" step.
  useEffect(() => {
    if (!selectedFacility) return
    const idx = filteredFacilities.findIndex((f) => f.id === selectedFacility.id)
    if (idx === -1) return
    if (idx >= visibleLimit) {
      const next = Math.ceil((idx + 1) / 50) * 50
      setVisibleLimit(next)
    }
  }, [selectedFacility, filteredFacilities, visibleLimit])

  const visibleFacilities = useMemo(
    () => filteredFacilities.slice(0, visibleLimit),
    [filteredFacilities, visibleLimit]
  )

  const mapFacilities = useMemo(
    () => (mapPinMode === 'tour' ? tourList : filteredFacilities),
    [mapPinMode, tourList, filteredFacilities]
  )

  useEffect(() => {
    if (mapPinMode === 'tour' && tourList.length === 0) {
      setMapPinMode('all')
    }
  }, [mapPinMode, tourList.length])

  const addToTour = useCallback((facility: FacilityWithMetrics) => {
    setTourList((current) => {
      if (current.some((item) => item.id === facility.id)) {
        return current
      }
      return [...current, facility]
    })
  }, [])

  const removeFromTour = useCallback((facility: FacilityWithMetrics) => {
    setTourList((current) => current.filter((item) => item.id !== facility.id))
  }, [])

  const clearTour = useCallback(() => {
    setTourList([])
  }, [])

  // Improved route optimization using a more efficient algorithm
  const optimizeRoute = useCallback(() => {
    setTourList((current) => {
      if (current.length < 2) return current
      if (current.length === 2) {
        // For 2 facilities, just ensure starting from closest to client if available
        if (clientCoords) {
          const sorted = [...current].sort((a, b) => {
            const distA = calculateDistanceMiles(clientCoords, getFacilityCoordinates(a))
            const distB = calculateDistanceMiles(clientCoords, getFacilityCoordinates(b))
            return distA - distB
          })
          return sorted
        }
        return current
      }

      // For 3+ facilities, use an improved nearest neighbor with 2-opt improvement
      const bestRoute = [...current]

      // Start with the facility closest to the client (if client location available)
      if (clientCoords) {
        bestRoute.sort((a, b) => {
          const distA = calculateDistanceMiles(clientCoords, getFacilityCoordinates(a))
          const distB = calculateDistanceMiles(clientCoords, getFacilityCoordinates(b))
          return distA - distB
        })
      }

      // Apply nearest neighbor algorithm
      const route: FacilityWithMetrics[] = [bestRoute[0]]
      const remaining = bestRoute.slice(1)

      while (remaining.length > 0) {
        const last = route[route.length - 1]
        const lastCoords = getFacilityCoordinates(last)

        let nearestIndex = 0
        let nearestDistance = Number.POSITIVE_INFINITY

        remaining.forEach((candidate, index) => {
          const distance = calculateDistanceMiles(lastCoords, getFacilityCoordinates(candidate))
          if (distance < nearestDistance) {
            nearestDistance = distance
            nearestIndex = index
          }
        })

        route.push(remaining.splice(nearestIndex, 1)[0])
      }

      // For routes with 4-8 facilities, apply a simple 2-opt improvement
      if (route.length >= 4 && route.length <= 8) {
        let improved = true
        let iterations = 0
        const maxIterations = 10

        while (improved && iterations < maxIterations) {
          improved = false
          iterations++

          for (let i = 1; i < route.length - 1; i++) {
            for (let j = i + 1; j < route.length; j++) {
              // Try swapping edges between i and j
              const currentDistance =
                calculateDistanceMiles(getFacilityCoordinates(route[i-1]), getFacilityCoordinates(route[i])) +
                calculateDistanceMiles(getFacilityCoordinates(route[j]), getFacilityCoordinates(route[j+1] || route[0]))

              const swappedDistance =
                calculateDistanceMiles(getFacilityCoordinates(route[i-1]), getFacilityCoordinates(route[j])) +
                calculateDistanceMiles(getFacilityCoordinates(route[i]), getFacilityCoordinates(route[j+1] || route[0]))

              if (swappedDistance < currentDistance) {
                // Reverse the segment from i to j
                const segment = route.slice(i, j + 1).reverse()
                route.splice(i, j - i + 1, ...segment)
                improved = true
              }
            }
          }
        }
      }

      return route
    })
  }, [clientCoords])

  const resultsLabel = nearbyFacilities.length > 0 ? 'Nearby' : 'Found'
  const resultsCount = filteredFacilities.length

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden">
      <Accordion
        type="multiple"
        value={filtersExpanded}
        onValueChange={setFiltersExpanded}
        className="flex-shrink-0 z-50"
      >
        <AccordionItem value="filters" className="border-none">
          <div className="backdrop-blur-xl bg-brand-glass-light border-b border-brand-blue-light/30 shadow-2xl px-4 py-3">
            <div className="flex items-center justify-between w-full">
              <AccordionTrigger className="flex-1 hover:no-underline touch-manipulation md:touch-auto p-2 rounded-md bg-transparent border-none shadow-none min-h-[48px] flex items-center cursor-pointer hover:bg-white/5 transition-colors">
                <motion.div
                  className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 flex-1"
                  whileHover={{ scale: 1.02 }}
                >
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                  <MapPin className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
                  <span className="hidden sm:inline">Care Home Locator</span>
                  <span className="sm:hidden">Locator</span>
                </motion.div>
              </AccordionTrigger>
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshData}
                disabled={loading}
                className="text-white hover:bg-white/20 backdrop-blur-sm ml-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <AccordionContent className="backdrop-blur-xl bg-brand-glass-light border-b border-brand-blue-light/30 shadow-2xl">
            <div className="px-4 pb-3">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                <Input
                  placeholder="Search facilities or cities..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="pl-10 bg-brand-glass-light border-brand-blue-light/30 text-gray-800 placeholder:text-gray-600 backdrop-blur-sm focus:bg-brand-glass-medium focus:border-brand-blue-primary/50"
                />
              </div>

              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                  <Input
                    placeholder="ZIP or address — or tap GPS to use my location"
                    value={clientLocation}
                    onChange={(event) => setClientLocation(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') handleLocationSearch()
                    }}
                    className="pl-10 pr-16 bg-brand-glass-light border-brand-blue-light/30 text-gray-800 placeholder:text-gray-600 backdrop-blur-sm focus:bg-brand-glass-medium focus:border-brand-blue-primary/50"
                  />
                  <Button
                    onClick={handleLocationSearch}
                    disabled={!clientLocation.trim() || clientLocation === 'My current location'}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 px-3 bg-blue-500/30 text-white hover:bg-blue-500/40 disabled:opacity-50"
                  >
                    Find
                  </Button>
                </div>
                <Button
                  onClick={handleUseMyLocation}
                  disabled={geolocating}
                  title="Use my current location"
                  className="min-w-[44px] h-10 px-3 bg-blue-500/30 text-white hover:bg-blue-500/40 border border-blue-400/30 disabled:opacity-50"
                >
                  {geolocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
                </Button>
              </div>
              {geolocationError && (
                <div className="mb-3 px-3 py-2 rounded bg-red-500/20 border border-red-400/30 text-red-100 text-xs">
                  {geolocationError}
                </div>
              )}


              <div className="flex gap-3 flex-wrap items-stretch">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters((prev) => !prev)}
                  className="bg-gradient-to-r from-white/20 to-white/25 text-white hover:from-white/30 hover:to-white/35 backdrop-blur-sm border border-white/30 hover:border-white/40 transition-all duration-200"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Filters</span>
                </Button>

                {/* Map pin-mode toggle: All facilities ↔ Tour stops only */}
                <div
                  role="group"
                  aria-label="Map pin mode"
                  className="inline-flex items-stretch rounded-md overflow-hidden border border-white/25 backdrop-blur-sm"
                >
                  <button
                    type="button"
                    onClick={() => setMapPinMode('all')}
                    className={`px-3 text-xs md:text-sm flex items-center gap-1.5 transition ${
                      mapPinMode === 'all'
                        ? 'bg-blue-500/40 text-white'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                    title="Show all matching facilities on the map"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>{resultsCount}</span>
                    <span className="hidden sm:inline">{resultsLabel}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapPinMode('tour')}
                    disabled={tourList.length === 0}
                    className={`px-3 text-xs md:text-sm flex items-center gap-1.5 transition border-l border-white/25 ${
                      mapPinMode === 'tour'
                        ? 'bg-green-500/40 text-white'
                        : 'bg-white/10 text-white/80 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/10'
                    }`}
                    title={tourList.length === 0 ? 'No stops in your tour yet' : 'Show only your tour stops on the map'}
                  >
                    <Route className="w-4 h-4" />
                    <span>{tourList.length}</span>
                    <span className="hidden sm:inline">Tour</span>
                  </button>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <SearchFilters
                    filters={advancedFilters}
                    onFiltersChange={setAdvancedFilters}
                    onClearFilters={() => setAdvancedFilters(DEFAULT_ADVANCED_FILTERS)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex-1 min-h-0 flex flex-col md:flex-row">
        <div
          className={`relative md:flex-1 md:min-h-full ${
            showFacilityPanel ? 'hidden md:block' : 'flex-1 min-h-0'
          }`}
        >
          <Card className="h-full m-2 overflow-hidden glass-brand-light shadow-2xl">
            <MapErrorBoundary>
              <MapView
                facilities={mapFacilities}
                selectedFacility={selectedFacility}
                onFacilitySelect={setSelectedFacility}
                clientCoords={clientCoords}
              />
            </MapErrorBoundary>
          </Card>
        </div>

        {showFacilityPanel && (
            <div
              className="w-full md:w-96 md:max-w-md flex-1 min-h-0 md:flex-initial md:h-full flex flex-col relative overflow-hidden"
            >
              <div className="md:hidden flex-shrink-0 bg-white/10 backdrop-blur-xl border-b border-white/20 p-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-medium">
                    {resultsCount} {resultsLabel}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFacilityPanel(false)}
                    className="text-white hover:bg-white/20 p-2 min-h-[44px] min-w-[44px] touch-manipulation"
                    title="Show map"
                    aria-label="Show map"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="flex-shrink-0 px-4 pt-2">
                <div className="flex items-center gap-2 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-1.5 text-sm">
                  <button
                    type="button"
                    onClick={() => setActiveTab('facilities')}
                    className={`flex-1 rounded-xl py-3 px-4 transition-all duration-200 min-h-[48px] touch-manipulation ${
                      activeTab === 'facilities'
                        ? 'bg-gradient-to-r from-blue-500/40 to-blue-600/40 text-white border border-blue-400/30 shadow-lg shadow-blue-500/20'
                        : 'hover:bg-white/10 text-white/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>Facilities</span>
                      <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-blue-500/30 px-2 text-[10px] font-medium">
                        {resultsCount}
                      </span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('tour')}
                    className={`flex-1 rounded-xl py-3 px-4 transition-all duration-200 min-h-[48px] touch-manipulation ${
                      activeTab === 'tour'
                        ? 'bg-gradient-to-r from-green-500/40 to-green-600/40 text-white border border-green-400/30 shadow-lg shadow-green-500/20'
                        : 'hover:bg-white/10 text-white/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-400/60 flex items-center justify-center">
                        <div className="w-2 h-2 bg-green-300 rounded-full" />
                      </div>
                      <span>Itinerary</span>
                      <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-green-500/30 px-2 text-[10px] font-medium">
                        {tourList.length}
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {activeTab === 'tour' ? (
                <div className="flex-1 min-h-0">
                  <TourPlanner
                    tourList={tourList}
                    onRemoveFromTour={removeFromTour}
                    onClearTour={clearTour}
                    onOptimizeRoute={optimizeRoute}
                    clientCoords={clientCoords}
                  />
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-3 min-h-0">
                  {loading && (
                    <>
                      {/* Show skeleton cards while loading */}
                      {Array.from({ length: 6 }).map((_, index) => (
                        <FacilityCardSkeleton key={`skeleton-${index}`} />
                      ))}
                      <Card className="p-4 glass-brand-light shadow-xl mt-4">
                        <div className="flex items-center justify-center text-white">
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          <span className="text-sm">Loading facilities...</span>
                        </div>
                      </Card>
                    </>
                  )}

                  {error && (
                    <Card className="p-4 bg-red-500/20 backdrop-blur-xl border-red-400/30 shadow-xl">
                      <p className="text-red-200 text-sm">{error}</p>
                    </Card>
                  )}

                  {visibleFacilities.map((facility) => (
                    <FacilityCard
                      key={facility.id}
                      facility={facility}
                      isSelected={selectedFacility?.id === facility.id}
                      onClick={() => setSelectedFacility(facility)}
                      onAddToTour={addToTour}
                      isInTour={tourList.some((item) => item.id === facility.id)}
                    />
                  ))}

                  {filteredFacilities.length > visibleFacilities.length && (
                    <Button
                      variant="ghost"
                      onClick={() => setVisibleLimit((n) => n + 50)}
                      className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 min-h-[48px]"
                    >
                      Show more ({filteredFacilities.length - visibleFacilities.length} remaining)
                    </Button>
                  )}

                  {!loading && filteredFacilities.length === 0 && (
                    <Card className="p-6 glass-brand-light shadow-xl">
                      <div className="text-center text-white/80">
                        <MapPin className="w-12 h-12 mx-auto mb-3 text-white/60" />
                        <p className="text-lg font-medium mb-2">
                          {clientCoords ? 'No nearby facilities found' : 'No facilities found'}
                        </p>
                        <p className="text-sm text-white/60">
                          {clientCoords
                            ? 'Try expanding your search radius or adjusting filters'
                            : 'Enter a client address to find nearby facilities'}
                        </p>
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </div>
          )}

        {!showFacilityPanel && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className={`fixed right-6 z-50 md:hidden transition-[bottom] duration-300 ${
              selectedFacility ? 'bottom-44' : 'bottom-6'
            }`}
          >
            <Button
              onClick={() => setShowFacilityPanel(true)}
              className="bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 backdrop-blur-sm shadow-2xl rounded-full w-14 h-14 flex items-center justify-center touch-manipulation active:scale-95 transition-all duration-200 border-2 border-white/20"
              title="Show list"
              aria-label="Show list"
            >
              <ChevronUp className="w-6 h-6" />
            </Button>
          </motion.div>
        )}

        {/* Mobile peek card: appears when a marker is selected on the map view (panel collapsed) */}
        <AnimatePresence>
          {!showFacilityPanel && selectedFacility && (
            <motion.div
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 80 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-3 right-3 bottom-3 z-40 md:hidden"
            >
              <div className="rounded-2xl backdrop-blur-xl bg-slate-900/90 border border-white/15 shadow-2xl p-3 pr-12 relative">
                <button
                  type="button"
                  onClick={() => setSelectedFacility(null)}
                  className="absolute top-2 right-2 p-2 rounded-full text-white/70 hover:bg-white/10 hover:text-white"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>

                <h3 className="text-white font-semibold text-base leading-tight pr-2 mb-1">
                  {selectedFacility.name}
                </h3>
                <p className="text-white/70 text-xs mb-2">
                  {selectedFacility.facility_type}
                  {selectedFacility.city ? ` • ${selectedFacility.city}, AZ` : ''}
                </p>

                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    disabled={!selectedFacility.phone}
                    onClick={() => selectedFacility.phone && window.open(`tel:${selectedFacility.phone}`, '_self')}
                    className={`min-h-[44px] rounded-lg text-xs flex flex-col items-center justify-center gap-0.5 border ${
                      selectedFacility.phone
                        ? 'bg-green-500/25 text-green-100 border-green-400/40 hover:bg-green-500/35'
                        : 'bg-gray-500/15 text-gray-400 border-gray-400/20 cursor-not-allowed opacity-60'
                    }`}
                    title={selectedFacility.phone ? 'Call' : 'No phone on file'}
                  >
                    <Phone className="w-4 h-4" />
                    Call
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const a = `${selectedFacility.address || ''}, ${selectedFacility.city}, AZ ${selectedFacility.zip}`
                      const url = buildSingleStopUrl(detectMapsProvider(), a)
                      if (url) window.open(url, '_blank')
                    }}
                    className="min-h-[44px] rounded-lg text-xs flex flex-col items-center justify-center gap-0.5 bg-blue-500/25 text-blue-100 border border-blue-400/40 hover:bg-blue-500/35"
                  >
                    <Navigation className="w-4 h-4" />
                    Drive
                  </button>
                  <button
                    type="button"
                    disabled={tourList.some(t => t.id === selectedFacility.id)}
                    onClick={() => addToTour(selectedFacility as FacilityWithMetrics)}
                    className={`min-h-[44px] rounded-lg text-xs flex flex-col items-center justify-center gap-0.5 border ${
                      tourList.some(t => t.id === selectedFacility.id)
                        ? 'bg-green-500/25 text-green-100 border-green-400/40 cursor-not-allowed'
                        : 'bg-purple-500/25 text-purple-100 border-purple-400/40 hover:bg-purple-500/35'
                    }`}
                    title={tourList.some(t => t.id === selectedFacility.id) ? 'Already in tour' : 'Add to tour'}
                  >
                    <Plus className="w-4 h-4" />
                    {tourList.some(t => t.id === selectedFacility.id) ? 'Added' : 'Add'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFacilityPanel(true)}
                    className="min-h-[44px] rounded-lg text-xs flex flex-col items-center justify-center gap-0.5 bg-white/10 text-white border border-white/20 hover:bg-white/20"
                  >
                    <ChevronUp className="w-4 h-4" />
                    Details
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
