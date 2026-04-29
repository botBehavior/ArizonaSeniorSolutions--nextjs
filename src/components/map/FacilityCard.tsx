"use client"

import React, { useEffect, useRef } from 'react'
import { Phone, MapPin, Navigation, BedDouble } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Facility } from '@/types/facility'
import { buildSingleStopUrl, detectMapsProvider } from '@/utils/maps-provider'

interface FacilityCardProps {
  facility: Facility & { distance?: number, driveTime?: number }
  isSelected: boolean
  onClick: () => void
  clientLocation?: string
  onAddToTour?: (facility: Facility) => void
  isInTour?: boolean
}

const LICENSURE_NOTE_RE = /^\s*Licensed Capacity:\s*(\d+)\.\s*License:\s*[A-Z0-9]+\s*$/i

function parseLicensedCapacity(notes: string | undefined): number | null {
  if (!notes) return null
  const match = notes.match(/Licensed Capacity:\s*(\d+)/i)
  if (!match) return null
  const n = Number(match[1])
  return Number.isFinite(n) ? n : null
}

function isBoilerplateNotes(notes: string | undefined): boolean {
  if (!notes) return true
  return LICENSURE_NOTE_RE.test(notes)
}

function shouldShowAltcs(value: string | undefined): boolean {
  if (!value) return false
  const v = value.toLowerCase()
  return !(v === 'unknown' || v === 'contact facility' || v === '')
}

function altcsDot(value: string | undefined): string {
  const v = (value || '').toLowerCase()
  if (v === 'yes' || v === 'likely') return 'bg-green-400'
  if (v === 'no') return 'bg-red-400'
  return 'bg-yellow-400'
}

function isInformativeServices(services: string | undefined, type: string | undefined): boolean {
  if (!services) return false
  const s = services.trim().toLowerCase()
  if (!s) return false
  // Hide if services equals a substring of the facility type (no new info)
  const t = (type || '').toLowerCase()
  if (s === 'assisted living' && t.includes('assisted living')) return false
  if (s === 'independent living' && t.includes('independent living')) return false
  if (s === 'memory care' && t.includes('memory care')) return false
  return true
}

function getFacilityTypeColor(type: string) {
  const t = (type || '').toLowerCase()
  if (t.includes('memory care')) return 'bg-purple-500/20 text-purple-200 border-purple-400/30'
  if (t.includes('assisted living home')) return 'bg-blue-500/20 text-blue-200 border-blue-400/30'
  if (t.includes('assisted living center')) return 'bg-green-500/20 text-green-200 border-green-400/30'
  if (t.includes('independent living')) return 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30'
  return 'bg-gray-500/20 text-gray-200 border-gray-400/30'
}

export default function FacilityCard({
  facility,
  isSelected,
  onClick,
  onAddToTour,
  isInTour = false
}: FacilityCardProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isSelected) return
    const raf = window.requestAnimationFrame(() => {
      wrapperRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
    return () => window.cancelAnimationFrame(raf)
  }, [isSelected])

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (facility.phone) window.open(`tel:${facility.phone}`, '_self')
  }

  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation()
    const address = `${facility.address || ''}, ${facility.city}, AZ ${facility.zip}`
    const url = buildSingleStopUrl(detectMapsProvider(), address)
    if (url) window.open(url, '_blank')
  }

  const licensedBeds = parseLicensedCapacity(facility.notes)
  const showServices = isInformativeServices(facility.special_services, facility.facility_type)
  const showAltcs = shouldShowAltcs(facility.altcs_accepted)
  const showRawNotes = facility.notes && !isBoilerplateNotes(facility.notes)
  const showFooter =
    (facility.added_by && facility.added_by !== 'DataScraper') ||
    (facility.date_added && facility.date_added !== '2025-09-10' && facility.date_added !== '2025-09-10 00:00:00')

  return (
    <div ref={wrapperRef} className="scroll-mt-2">
    <Card
      className={`p-4 cursor-pointer transition-all duration-200 backdrop-blur-xl border shadow-xl ${
        isSelected
          ? 'bg-blue-500/20 border-blue-400/50 shadow-blue-500/20'
          : 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30'
      }`}
      onClick={onClick}
    >
      <h3 className="font-semibold text-white text-base md:text-lg leading-tight mb-1">
        {facility.name}
      </h3>
      <div className="flex items-center text-white/70 text-sm mb-1">
        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
        <span className="truncate">{facility.address || 'Address not available'}</span>
      </div>
      <p className="text-white/60 text-sm mb-3">{facility.city}, AZ {facility.zip}</p>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Badge variant="outline" className={`${getFacilityTypeColor(facility.facility_type)} text-xs`}>
          {facility.facility_type}
        </Badge>
        {licensedBeds !== null && (
          <Badge variant="outline" className="bg-white/10 text-white/80 border-white/20 text-xs flex items-center gap-1">
            <BedDouble className="w-3 h-3" /> {licensedBeds} licensed beds
          </Badge>
        )}
        {facility.available_beds && String(facility.available_beds).toLowerCase() === 'available' && (
          <Badge variant="outline" className="bg-green-500/20 text-green-200 border-green-400/30 text-xs">
            Beds available
          </Badge>
        )}
      </div>

      {showAltcs && (
        <div className="flex items-center mb-3">
          <div className={`w-2 h-2 rounded-full mr-2 ${altcsDot(facility.altcs_accepted)}`} />
          <span className="text-sm text-white/70">ALTCS: {facility.altcs_accepted}</span>
        </div>
      )}

      {facility.contact_person && (
        <div className="mb-3 text-white/70 text-sm">
          <strong>Contact:</strong> {facility.contact_person}
        </div>
      )}

      {showServices && (
        <div className="mb-3">
          <p className="text-xs text-white/60 mb-1">Services:</p>
          <p className="text-sm text-white/80 line-clamp-2">{facility.special_services}</p>
        </div>
      )}

      {showRawNotes && (
        <div className="mb-3">
          <p className="text-xs text-white/60 mb-1">Notes:</p>
          <p className="text-sm text-white/80 line-clamp-3">{facility.notes}</p>
        </div>
      )}

      {facility.distance != null && (
        <div className="mb-3 p-2 bg-blue-500/20 rounded-lg border border-blue-400/30">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-200">📍 {facility.distance.toFixed(1)} mi away</span>
            <span className="text-blue-200">🚗 ~{facility.driveTime} min</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 mt-3">
        <Button
          variant="ghost"
          onClick={handleCall}
          disabled={!facility.phone}
          className={`min-h-[48px] ${
            facility.phone
              ? 'bg-green-500/20 text-green-200 hover:bg-green-500/30 border border-green-400/30'
              : 'bg-gray-500/20 text-gray-400 border border-gray-400/30 cursor-not-allowed opacity-60'
          }`}
          title={facility.phone ? 'Call facility' : 'No phone on file — add to your sheet to enable'}
        >
          <Phone className="w-4 h-4 mr-1" />
          Call
        </Button>
        <Button
          variant="ghost"
          onClick={handleDirections}
          className="min-h-[48px] bg-blue-500/20 text-blue-200 hover:bg-blue-500/30 border border-blue-400/30"
        >
          <Navigation className="w-4 h-4 mr-1" />
          Drive
        </Button>
      </div>

      {onAddToTour && (
        <Button
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation()
            onAddToTour(facility)
          }}
          disabled={isInTour}
          className={`w-full mt-3 min-h-[48px] ${
            isInTour
              ? 'bg-green-500/20 text-green-300 border border-green-500/30 cursor-not-allowed'
              : 'bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 border border-purple-400/30'
          }`}
        >
          <div className={`w-2 h-2 rounded-full mr-2 ${isInTour ? 'bg-green-400' : 'bg-purple-400'}`} />
          {isInTour ? '✓ Added to Tour' : '+ Add to Tour'}
        </Button>
      )}

      {showFooter && (
        <div className="mt-3 pt-3 border-t border-white/10 flex justify-between text-xs text-white/50">
          <span>By: {facility.added_by}</span>
          <span>{facility.date_added}</span>
        </div>
      )}
    </Card>
    </div>
  )
}
