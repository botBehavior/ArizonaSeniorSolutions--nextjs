"use client"

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Navigation, X, Route, Calendar, Target, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Facility } from '@/types/facility'
import { buildMultiStopUrl, detectMapsProvider } from '@/utils/maps-provider'

interface TourPlannerProps {
  tourList: Facility[]
  onRemoveFromTour: (facility: Facility) => void
  onClearTour: () => void
  onOptimizeRoute: () => void
  clientCoords?: { lat: number; lng: number } | null
}

const START_FROM_STORAGE_KEY = 'map.tourStartFrom.v1'
const MAX_WAYPOINTS = 9 // Google Maps cap for free multi-stop URLs

type StartMode = 'my-location' | 'custom'

const getShortFacilityType = (facilityType: string): string => {
  const type = facilityType.toLowerCase()
  if (type.includes('memory care')) return 'MC'
  if (type.includes('assisted living center')) return 'ALC'
  if (type.includes('assisted living home')) return 'ALH'
  if (type.includes('independent living')) return 'IL'
  return facilityType.substring(0, 3).toUpperCase()
}

function fullAddress(f: Facility): string {
  return `${f.address || ''}, ${f.city}, AZ ${f.zip}`.trim()
}

function buildTourMapsUrl(stops: Facility[], origin: string | null): string | null {
  if (stops.length === 0) return null
  const limited = stops.slice(0, MAX_WAYPOINTS + 1)
  const addresses = limited.map(fullAddress)
  return buildMultiStopUrl(detectMapsProvider(), addresses, origin)
}

function buildCleanEmailBody(stops: Facility[], originLabel: string | null): string {
  const lines: string[] = []
  if (originLabel) lines.push(`Start: ${originLabel}`, '')
  stops.forEach((f, i) => {
    lines.push(`${i + 1}. ${f.name}`)
    lines.push(`   ${fullAddress(f)}`)
    if (f.phone) lines.push(`   ${f.phone}`)
    if (f.facility_type) lines.push(`   ${f.facility_type}`)
    lines.push('')
  })
  return lines.join('\n').trim()
}

function buildCleanCopyText(stops: Facility[]): string {
  return stops.map((f, i) => `${i + 1}. ${f.name} — ${fullAddress(f)}`).join('\n')
}

export default function TourPlanner({
  tourList,
  onRemoveFromTour,
  onClearTour,
  onOptimizeRoute,
  clientCoords,
}: TourPlannerProps) {
  const [startMode, setStartMode] = useState<StartMode>('my-location')
  const [customStart, setCustomStart] = useState('')
  const [hydrated, setHydrated] = useState(false)
  const [copied, setCopied] = useState(false)
  const [recentlyOptimized, setRecentlyOptimized] = useState(false)

  const handleOptimize = () => {
    onOptimizeRoute()
    setRecentlyOptimized(true)
    window.setTimeout(() => setRecentlyOptimized(false), 1500)
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(START_FROM_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.mode === 'my-location' || parsed?.mode === 'custom') setStartMode(parsed.mode)
        if (typeof parsed?.customStart === 'string') setCustomStart(parsed.customStart)
      }
    } catch { /* ignore */ }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(
        START_FROM_STORAGE_KEY,
        JSON.stringify({ mode: startMode, customStart })
      )
    } catch { /* ignore */ }
  }, [startMode, customStart, hydrated])

  // Resolve the origin string for the Maps URL
  const resolvedOrigin: string | null =
    startMode === 'my-location'
      ? clientCoords ? `${clientCoords.lat},${clientCoords.lng}` : null
      : customStart.trim() || null

  const originLabel: string | null =
    startMode === 'my-location' ? (clientCoords ? 'My current location' : null) : customStart.trim() || null

  const tooManyStops = tourList.length > MAX_WAYPOINTS + 1

  if (tourList.length === 0) {
    return (
      <Card className="h-full glass-brand-light shadow-xl text-center flex flex-col">
        <div className="flex-1 flex flex-col justify-center px-4 py-6">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-purple-500/20 rounded-full mb-3 mx-auto">
            <Route className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />
          </div>
          <h3 className="text-lg md:text-xl font-bold text-white mb-2">Plan Your Tour</h3>
          <p className="text-white/80 text-sm mb-4 leading-relaxed px-2">
            Add facilities from the list and we&apos;ll route them in one click for turn-by-turn navigation.
          </p>
          <div className="grid grid-cols-3 gap-2 md:gap-4 text-xs text-white/70">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-green-500/20 rounded-full mb-1 mx-auto">
                <Target className="w-4 h-4 text-green-400" />
              </div>
              Add stops
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-blue-500/20 rounded-full mb-1 mx-auto">
                <Route className="w-4 h-4 text-blue-400" />
              </div>
              Optimize
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-purple-500/20 rounded-full mb-1 mx-auto">
                <Navigation className="w-4 h-4 text-purple-400" />
              </div>
              Drive
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="h-full glass-brand-light shadow-xl relative flex flex-col overflow-hidden">
      <div className="relative z-10 flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="flex-shrink-0 px-4 pt-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-green-500/20 rounded-full">
                <Route className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-white">Tour Itinerary</h3>
                <p className="text-xs md:text-sm text-white/70">{tourList.length} facilit{tourList.length === 1 ? 'y' : 'ies'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={handleOptimize}
                disabled={tourList.length < 2}
                className={`min-h-[44px] border text-xs md:text-sm px-3 transition ${
                  recentlyOptimized
                    ? 'text-green-100 bg-green-500/30 border-green-400/50'
                    : 'text-blue-200 hover:bg-blue-500/20 border-blue-400/30'
                }`}
                title="Reorder stops by shortest driving distance"
              >
                <Navigation className="w-4 h-4 mr-1" />
                {recentlyOptimized ? 'Optimized ✓' : 'Optimize'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  if (tourList.length > 1) {
                    if (!window.confirm(`Clear all ${tourList.length} stops from this tour?`)) return
                  }
                  onClearTour()
                }}
                title="Clear all stops"
                className="min-h-[44px] text-red-200 hover:bg-red-500/20 border border-red-400/30 text-xs md:text-sm px-3 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                <span className="hidden md:inline">Clear</span>
              </Button>
            </div>
          </div>

          {/* Start-from picker */}
          <div className="mb-3 p-3 bg-white/5 border border-white/15 rounded-lg">
            <p className="text-xs uppercase tracking-wide text-white/60 mb-2">Start from</p>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setStartMode('my-location')}
                className={`flex-1 min-h-[40px] px-3 rounded-md text-sm border transition ${
                  startMode === 'my-location'
                    ? 'bg-blue-500/40 border-blue-300 text-white'
                    : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10'
                }`}
                disabled={!clientCoords}
                title={clientCoords ? 'Use my current location' : 'Tap GPS in the header to set your location first'}
              >
                My location
              </button>
              <button
                type="button"
                onClick={() => setStartMode('custom')}
                className={`flex-1 min-h-[40px] px-3 rounded-md text-sm border transition ${
                  startMode === 'custom'
                    ? 'bg-blue-500/40 border-blue-300 text-white'
                    : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10'
                }`}
              >
                Custom
              </button>
            </div>
            {startMode === 'custom' && (
              <input
                type="text"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                placeholder="Address or ZIP to start from"
                className="w-full min-h-[40px] px-3 rounded-md bg-white/10 border border-white/20 text-white placeholder:text-white/50 text-base md:text-sm"
              />
            )}
            {startMode === 'my-location' && !clientCoords && (
              <p className="text-xs text-yellow-300/90 mt-1">Tap GPS in the header to set your location.</p>
            )}
          </div>

          {tooManyStops && (
            <div className="mb-3 px-3 py-2 rounded bg-yellow-500/15 border border-yellow-400/30 text-yellow-100 text-xs">
              Google Maps allows up to {MAX_WAYPOINTS + 1} stops in one route. Only the first {MAX_WAYPOINTS + 1} will open.
            </div>
          )}
        </div>

        {/* Tour list */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4">
          <div className="space-y-3 px-1">
            <AnimatePresence>
              {tourList.map((facility, index) => (
                <motion.div
                  key={facility.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ layout: { duration: 0.35, ease: 'easeOut' } }}
                  className="group flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition"
                >
                  <div className="flex-shrink-0 relative">
                    <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold border-2 border-white/20">
                      {index + 1}
                    </div>
                    {index < tourList.length - 1 && (
                      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-blue-400/40" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white text-sm leading-tight mb-1 truncate">
                      {facility.name}
                    </h4>
                    <p className="text-xs text-white/70 truncate">{facility.address}</p>
                    <p className="text-xs text-white/50 mb-1">{facility.city}, AZ {facility.zip}</p>
                    <Badge variant="outline" className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30">
                      {getShortFacilityType(facility.facility_type)}
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      onClick={() => facility.phone && window.open(`tel:${facility.phone}`, '_self')}
                      disabled={!facility.phone}
                      className={`min-h-[36px] min-w-[36px] p-0 ${
                        facility.phone
                          ? 'text-green-200 hover:bg-green-500/20 border border-green-400/30'
                          : 'text-gray-400 bg-gray-500/10 border border-gray-400/20 opacity-60'
                      }`}
                      title={facility.phone ? 'Call' : 'No phone on file'}
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => onRemoveFromTour(facility)}
                      className="min-h-[36px] min-w-[36px] p-0 text-red-200 hover:bg-red-500/20 border border-red-400/30"
                      title="Remove"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Sticky actions */}
        <div className="flex-shrink-0 mt-2 pt-3 border-t border-white/20 px-4 pb-3">
          <Button
            variant="ghost"
            onClick={() => {
              const url = buildTourMapsUrl(tourList, resolvedOrigin)
              if (url) window.open(url, '_blank')
            }}
            className="w-full min-h-[52px] mb-3 bg-blue-500/30 text-white hover:bg-blue-500/40 border border-blue-400/40 text-base font-semibold"
            title={resolvedOrigin ? 'Open all stops in Google Maps' : 'Set a starting point first'}
            disabled={!resolvedOrigin}
          >
            <Navigation className="w-5 h-5 mr-2" />
            Drive this tour
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                const subject = `Tour itinerary — ${tourList.length} senior care facilit${tourList.length === 1 ? 'y' : 'ies'}`
                const body = buildCleanEmailBody(tourList, originLabel)
                window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
              }}
              className="min-h-[44px] text-white hover:bg-blue-500/20 border border-blue-500/30"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Email
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                navigator.clipboard.writeText(buildCleanCopyText(tourList))
                setCopied(true)
                setTimeout(() => setCopied(false), 1500)
              }}
              className="min-h-[44px] text-white hover:bg-green-500/20 border border-green-500/30"
            >
              <MapPin className="w-4 h-4 mr-2" />
              {copied ? 'Copied!' : 'Copy list'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
