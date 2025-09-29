"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Phone, MapPin, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Facility } from '@/types/facility'

interface FacilityCardProps {
  facility: Facility & { distance?: number, driveTime?: number }
  isSelected: boolean
  onClick: () => void
  clientLocation?: string
  onAddToTour?: (facility: Facility) => void
  isInTour?: boolean
}

export default function FacilityCard({ 
  facility, 
  isSelected, 
  onClick, 
  // clientLocation,
  onAddToTour,
  isInTour = false
}: FacilityCardProps) {
  
  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (facility.phone) {
      window.open(`tel:${facility.phone}`, '_self')
    }
  }

  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation()
    const address = encodeURIComponent(`${facility.address || 'Address not available'}, ${facility.city}, AZ ${facility.zip}`)
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank')
  }

  const getFacilityTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'memory care':
        return 'bg-purple-500/20 text-purple-200 border-purple-400/30'
      case 'assisted living home':
        return 'bg-blue-500/20 text-blue-200 border-blue-400/30'
      case 'assisted living center':
        return 'bg-green-500/20 text-green-200 border-green-400/30'
      case 'independent living':
        return 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30'
      default:
        return 'bg-gray-500/20 text-gray-200 border-gray-400/30'
    }
  }


  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className={`p-3 md:p-4 cursor-pointer transition-all duration-200 backdrop-blur-xl border shadow-xl ${
          isSelected
            ? 'bg-blue-500/20 border-blue-400/50 shadow-blue-500/20'
            : 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30'
        }`}
        onClick={onClick}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2 md:mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-base md:text-lg leading-tight mb-1">
              {facility.name}
            </h3>
            <div className="flex items-center text-white/70 text-sm mb-1 md:mb-2">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span>{facility.address || 'Address not available'}</span>
            </div>
            <p className="text-white/60 text-sm">{facility.city}, AZ {facility.zip}</p>
          </div>
        </div>

        {/* Facility Type Badge */}
        <div className="mb-2 md:mb-3">
          <Badge
            variant="outline"
            className={`${getFacilityTypeColor(facility.facility_type)} text-xs`}
          >
            {facility.facility_type}
          </Badge>
        </div>

        {/* ALTCS Status */}
        <div className="flex items-center mb-2 md:mb-3">
          <div className={`w-2 h-2 rounded-full mr-2 ${
            facility.altcs_accepted === 'Yes' ? 'bg-green-400' :
            facility.altcs_accepted === 'No' ? 'bg-red-400' : 'bg-yellow-400'
          }`} />
          <span className="text-sm text-white/70">
            ALTCS: {facility.altcs_accepted || 'Unknown'}
          </span>
        </div>

        {/* Contact Person */}
        {facility.contact_person && (
          <div className="mb-2 md:mb-3 text-white/70 text-sm">
            <strong>Contact:</strong> {facility.contact_person}
          </div>
        )}

        {/* Special Services */}
        {facility.special_services && (
          <div className="mb-2 md:mb-3">
            <p className="text-xs text-white/60 mb-1">Services:</p>
            <p className="text-sm text-white/80 line-clamp-2">
              {facility.special_services}
            </p>
          </div>
        )}

        {/* Notes */}
        {facility.notes && (
          <div className="mb-2 md:mb-3">
            <p className="text-xs text-white/60 mb-1">Notes:</p>
            <p className="text-sm text-white/80 line-clamp-2">
              {facility.notes}
            </p>
          </div>
        )}

        {/* Distance Info */}
        {facility.distance && (
          <div className="mb-2 md:mb-3 p-2 bg-blue-500/20 rounded-lg border border-blue-400/30">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-200">
                📍 {facility.distance.toFixed(1)} miles away
              </span>
              <span className="text-blue-200">
                🚗 ~{facility.driveTime} min drive
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-3 md:mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCall}
            disabled={!facility.phone}
            className={`${
              facility.phone
                ? 'bg-green-500/20 text-green-200 hover:bg-green-500/30 border border-green-400/30'
                : 'bg-gray-500/20 text-gray-400 border border-gray-400/30 cursor-not-allowed opacity-60'
            }`}
            title={facility.phone ? "Call facility" : "Add contact to Google Sheet"}
          >
            <Phone className="w-4 h-4 mr-1" />
            Call
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDirections}
            className="bg-blue-500/20 text-blue-200 hover:bg-blue-500/30 border border-blue-400/30"
          >
            <Navigation className="w-4 h-4 mr-1" />
            Directions
          </Button>
        </div>

        {/* Add to Tour Button */}
        {onAddToTour && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onAddToTour(facility)
            }}
            disabled={isInTour}
            className={`w-full mt-3 py-2.5 ${
              isInTour
                ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300 border border-green-500/30 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-200 hover:from-purple-500/30 hover:to-purple-600/30 border border-purple-400/30 hover:border-purple-400/50 transition-all duration-200'
            }`}
          >
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isInTour ? 'bg-green-400' : 'bg-purple-400'
            }`} />
            {isInTour ? '✓ Added to Tour' : '+ Add to Tour'}
          </Button>
        )}

        {/* Added By & Date */}
        <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-white/10 flex justify-between text-xs text-white/50">
          <span>Added by: {facility.added_by || 'Unknown'}</span>
          <span>{facility.date_added || 'No date'}</span>
        </div>
      </Card>
    </motion.div>
  )
}
