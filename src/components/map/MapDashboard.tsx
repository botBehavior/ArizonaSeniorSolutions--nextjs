"use client"

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Search, Filter, Navigation, Plus, Loader2, Eye, EyeOff, ChevronUp, ChevronDown, ChevronRight } from 'lucide-react'
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

type FacilityWithMetrics = Facility & { distance?: number; driveTime?: number }

type SidebarTab = 'facilities' | 'tour'

const FACILITY_TYPE_OPTIONS = [
  'memory care',
  'assisted living home',
  'assisted living center',
  'independent living',
]


const DEFAULT_ADVANCED_FILTERS: SearchFiltersState = {
  facilityType: '',
  city: '',
  altcsAccepted: '',
  availabilityOnly: false,
  priceMin: '',
  priceMax: '',
}

// Improved drive time calculation with more realistic speed estimates
const URBAN_SPEED_MPH = 25  // City streets, traffic lights
const SUBURBAN_SPEED_MPH = 35  // Residential areas, some traffic
const HIGHWAY_SPEED_MPH = 45  // Major roads, limited access

function parseNumericInput(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

function parseFacilityNumber(value: Facility['price_min'] | Facility['price_max']): number | null {
  if (value === undefined || value === null || value === '') return null
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const cleaned = value.toString().replace(/[^0-9.]/g, '')
  if (!cleaned) return null
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : null
}

function hasAvailableBeds(facility: Facility): boolean {
  const value = facility.available_beds
  if (value === undefined || value === null || value === '') return false
  if (typeof value === 'number') return value > 0
  const parsed = Number(value.toString().replace(/[^0-9-]/g, ''))
  return Number.isFinite(parsed) && parsed > 0
}

function getFacilityCoordinates(facility: Facility): { lat: number; lng: number } {
  if (typeof facility.latitude === 'number' && typeof facility.longitude === 'number') {
    return { lat: facility.latitude, lng: facility.longitude }
  }
  const fallback = getFallbackCoordinates(facility.city, facility.zip)
  return { lat: fallback.lat, lng: fallback.lng }
}

function matchesPriceRange(facility: Facility, min: number | null, max: number | null): boolean {
  if (min === null && max === null) return true

  const facilityMin = parseFacilityNumber(facility.price_min)
  const facilityMax = parseFacilityNumber(facility.price_max)

  if (facilityMin === null && facilityMax === null) {
    return false
  }

  const effectiveMin = facilityMin ?? facilityMax ?? 0
  const effectiveMax = facilityMax ?? facilityMin ?? effectiveMin

  if (min !== null && effectiveMax < min) return false
  if (max !== null && effectiveMin > max) return false
  return true
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
  const [showFacilityPanel, setShowFacilityPanel] = useState(true)
  const [activeTab, setActiveTab] = useState<SidebarTab>('facilities')
  const [advancedFilters, setAdvancedFilters] = useState<SearchFiltersState>(DEFAULT_ADVANCED_FILTERS)
  const [filtersExpanded, setFiltersExpanded] = useState<string[]>(['filters'])

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
    const advancedMin = parseNumericInput(advancedFilters.priceMin)
    const advancedMax = parseNumericInput(advancedFilters.priceMax)

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

      if (!matchesPriceRange(facility, advancedMin, advancedMax)) return false

      if (
        advancedFilters.facilityType &&
        facility.facility_type.toLowerCase() !== advancedFilters.facilityType.toLowerCase()
      ) {
        return false
      }

      if (advancedFilters.city && facility.city !== advancedFilters.city) {
        return false
      }

      if (advancedFilters.altcsAccepted) {
        const status = facility.altcs_accepted?.toLowerCase() || ''
        if (status !== advancedFilters.altcsAccepted.toLowerCase()) {
          return false
        }
      }

      if (advancedFilters.availabilityOnly && !hasAvailableBeds(facility)) {
        return false
      }

      return true
    })

    return result
  }, [facilitiesList, nearbyFacilities, searchTerm, advancedFilters])

  useEffect(() => {
    if (selectedFacility && !filteredFacilities.some((facility) => facility.id === selectedFacility.id)) {
      setSelectedFacility(null)
    }
  }, [filteredFacilities, selectedFacility])

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
    <div className="min-h-screen relative overflow-hidden">
      <Accordion
        type="multiple"
        value={filtersExpanded}
        onValueChange={setFiltersExpanded}
        className="sticky top-0 z-50"
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
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
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

              <div className="relative mb-3">
                <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                <Input
                  placeholder="Enter ZIP code or address to find nearby facilities..."
                  value={clientLocation}
                  onChange={(event) => setClientLocation(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleLocationSearch()
                  }}
                  className="pl-10 pr-20 bg-brand-glass-light border-brand-blue-light/30 text-gray-800 placeholder:text-gray-600 backdrop-blur-sm focus:bg-brand-glass-medium focus:border-brand-blue-primary/50"
                />
                <Button
                  onClick={handleLocationSearch}
                  disabled={!clientLocation.trim()}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 px-3 bg-blue-500/30 text-white hover:bg-blue-500/40 disabled:opacity-50"
                >
                  Find
                </Button>
              </div>


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
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-gradient-to-r from-blue-500/30 to-blue-600/30 text-white hover:from-blue-500/40 hover:to-blue-600/40 backdrop-blur-sm border border-blue-400/30 hover:border-blue-400/40 transition-all duration-200"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">{resultsCount} {resultsLabel}</span>
                  <span className="sm:hidden">{resultsCount}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab((prev) => (prev === 'tour' ? 'facilities' : 'tour'))}
                  className="bg-gradient-to-r from-green-500/30 to-green-600/30 text-white hover:from-green-500/40 hover:to-green-600/40 backdrop-blur-sm border border-green-400/30 hover:border-green-400/40 transition-all duration-200"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
                  <span className="hidden sm:inline">Tour{tourList.length > 0 ? ` (${tourList.length})` : ''}</span>
                  <span className="sm:hidden">T{tourList.length > 0 ? `(${tourList.length})` : ''}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFacilityPanel((prev) => !prev)}
                  className="bg-gradient-to-r from-purple-500/30 to-purple-600/30 text-white hover:from-purple-500/40 hover:to-purple-600/40 backdrop-blur-sm border border-purple-400/30 md:hidden min-h-[44px] min-w-[44px] touch-manipulation transition-all duration-200"
                >
                  {showFacilityPanel ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </Button>
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
                    facilities={facilitiesList}
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

      <div className="flex flex-col md:flex-row h-[calc(100dvh-120px)] md:h-[calc(100dvh-80px)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`relative transition-all duration-300 ${
            showFacilityPanel ? 'h-[calc(100dvh-80px)] md:h-full md:flex-1' : 'h-[calc(100dvh-120px)] md:h-full md:flex-1'
          }`}
        >
          <Card className="h-full m-2 overflow-hidden glass-brand-light shadow-2xl">
            <MapErrorBoundary>
              <MapView
                facilities={filteredFacilities}
                selectedFacility={selectedFacility}
                onFacilitySelect={setSelectedFacility}
              />
            </MapErrorBoundary>
          </Card>
        </motion.div>

        <AnimatePresence>
          {showFacilityPanel && (
            <motion.div
              initial={{ x: 0, opacity: 0, height: 0 }}
              animate={{ x: 0, opacity: 1, height: 'auto' }}
              exit={{ x: 0, opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full md:w-96 md:max-w-md flex flex-col relative overflow-visible"
              style={{ maxHeight: showFacilityPanel ? 'calc(100dvh - 120px)' : 'calc(100dvh - 120px)' }}
            >
              <div className="md:hidden sticky top-0 z-10 bg-white/10 backdrop-blur-xl border-b border-white/20 p-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-medium">
                    {resultsCount} {resultsLabel}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFacilityPanel(false)}
                    className="text-white hover:bg-white/20 p-2 min-h-[44px] min-w-[44px] touch-manipulation"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="px-4 pt-2">
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

                  {filteredFacilities.map((facility) => (
                    <motion.div
                      key={facility.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FacilityCard
                        facility={facility}
                        isSelected={selectedFacility?.id === facility.id}
                        onClick={() => setSelectedFacility(facility)}
                        onAddToTour={addToTour}
                        isInTour={tourList.some((item) => item.id === facility.id)}
                      />
                    </motion.div>
                  ))}

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
            </motion.div>
          )}
        </AnimatePresence>

        {!showFacilityPanel && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 right-6 z-50 md:hidden"
          >
            <Button
              onClick={() => setShowFacilityPanel(true)}
              className="bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 backdrop-blur-sm shadow-2xl rounded-full w-14 h-14 flex items-center justify-center touch-manipulation active:scale-95 transition-all duration-200 border-2 border-white/20"
              title="Show facility panel"
            >
              <ChevronUp className="w-6 h-6" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
