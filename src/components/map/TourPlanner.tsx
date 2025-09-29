"use client"

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Navigation, X, Route, Calendar, Target, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Facility } from '@/types/facility'

interface TourPlannerProps {
  tourList: Facility[]
  onRemoveFromTour: (facility: Facility) => void
  onClearTour: () => void
  onOptimizeRoute: () => void
}

// Helper function to get short facility type
const getShortFacilityType = (facilityType: string): string => {
  const type = facilityType.toLowerCase()
  if (type.includes('assisted living center')) return 'ALC'
  if (type.includes('assisted living home')) return 'ALH'
  if (type.includes('memory care')) return 'MC'
  if (type.includes('independent living')) return 'IL'
  // Return first 3 characters of type as fallback
  return facilityType.substring(0, 3).toUpperCase()
}

export default function TourPlanner({
  tourList,
  onRemoveFromTour,
  onClearTour,
  onOptimizeRoute
}: TourPlannerProps) {

  if (tourList.length === 0) {
    return (
      <Card className="h-full glass-brand-light shadow-xl text-center relative overflow-hidden flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5" />
        <div className="relative z-10 flex-1 flex flex-col justify-center px-4 pb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full mb-3 md:mb-4">
            <Route className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />
          </div>
          <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3">Plan Your Tour</h3>
          <p className="text-white/80 text-sm mb-4 md:mb-6 leading-relaxed px-2 md:px-0">
            Build a customized route for your client by adding facilities from the list or map.
            We&apos;ll help optimize the most efficient path.
          </p>
          <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-green-500/20 rounded-full mb-1 md:mb-2">
                <Target className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
              </div>
              <p className="text-xs text-white/70">Select Facilities</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-blue-500/20 rounded-full mb-1 md:mb-2">
                <Route className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
              </div>
              <p className="text-xs text-white/70">Optimize Route</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-purple-500/20 rounded-full mb-1 md:mb-2">
                <Calendar className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
              </div>
              <p className="text-xs text-white/70">Plan Visit</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-full text-sm text-white/80 border border-white/20 mx-2 md:mx-0">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span className="font-medium">Tap &quot;Add to Tour&quot; on any facility above to get started</span>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="h-full glass-brand-light shadow-xl relative flex flex-col overflow-visible">
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 rounded-lg" />
      <div className="relative z-10 flex-1 flex flex-col overflow-visible">
        {/* Fixed Header */}
        <div className="flex-shrink-0 px-4 pt-3 md:pt-4">
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full">
                <Route className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-white">Tour Itinerary</h3>
                <p className="text-xs md:text-sm text-white/70">{tourList.length} facilit{tourList.length === 1 ? 'y' : 'ies'} selected</p>
              </div>
            </div>
            <div className="flex gap-1 md:gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onOptimizeRoute}
                className="text-blue-200 hover:bg-blue-500/20 border border-blue-400/30 hover:border-blue-400/50 transition-all duration-200 text-xs md:text-sm px-2 md:px-3"
              >
                <Navigation className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Optimize Route</span>
                <span className="sm:hidden">Optimize</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearTour}
                className="text-red-200 hover:bg-red-500/20 border border-red-400/30 hover:border-red-400/50 transition-all duration-200 text-xs md:text-sm px-2 md:px-3"
              >
                <X className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                Clear All
              </Button>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-4 h-64 md:h-auto md:flex-1 md:min-h-0">
          {/* Tour List */}
          <div className="space-y-3 md:space-y-4 px-1">
          <AnimatePresence>
            {tourList.map((facility, index) => (
              <motion.div
                key={facility.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="group flex items-start gap-2 md:gap-4 p-3 md:p-4 bg-gradient-to-r from-white/5 to-white/10 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300"
              >
                <div className="flex-shrink-0 relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-base font-bold shadow-lg border-2 border-white/20 relative">
                    {index + 1}
                    {/* Action indicator dot */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-white/30 opacity-80"></div>
                  </div>
                  {index < tourList.length - 1 && (
                    <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gradient-to-b from-blue-400 to-transparent" />
                  )}
                </div>

                <div className="flex-1 min-w-0 py-1">
                  <h4 className="font-semibold text-white text-sm leading-tight mb-1">
                    {facility.name}
                  </h4>
                  <div
                    className="mb-2 cursor-pointer hover:text-white transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      const fullAddress = `${facility.address || 'Address not available'}, ${facility.city}, AZ ${facility.zip}`
                      navigator.clipboard.writeText(fullAddress)
                      // Optional: could add a toast notification here
                    }}
                    title="Click to copy full address"
                  >
                    <p className="text-xs text-white/80 mb-1">{facility.address || 'Address not available'}</p>
                    <p className="text-xs text-white/60">{facility.city}, AZ {facility.zip}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30 px-2 py-0.5">
                      {getShortFacilityType(facility.facility_type)}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (facility.phone) {
                        window.open(`tel:${facility.phone}`, '_self')
                      }
                    }}
                    className={`text-xs px-2 h-7 transition-all duration-200 ${
                      facility.phone
                        ? 'text-green-200 hover:bg-green-500/20 border border-green-400/30 hover:border-green-400/50'
                        : 'text-gray-400 bg-gray-500/20 border border-gray-400/30 cursor-not-allowed opacity-60'
                    }`}
                    title={facility.phone ? "Call facility" : "Add contact to Google Sheet"}
                    disabled={!facility.phone}
                  >
                    <Phone className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const address = encodeURIComponent(`${facility.address || 'Address not available'}, ${facility.city}, AZ`)
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank')
                    }}
                    className="text-blue-200 hover:bg-blue-500/20 border border-blue-400/30 hover:border-blue-400/50 transition-all duration-200 text-xs px-2 h-7"
                    title="Get directions"
                  >
                    <Navigation className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveFromTour(facility)}
                    className="text-red-200 hover:bg-red-500/20 border border-red-400/30 hover:border-red-400/50 transition-all duration-200 text-xs px-2 h-7"
                    title="Remove from tour"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          </div>
        </div>

        {/* Fixed Export Options */}
        <div className="flex-shrink-0 mt-2 md:mt-4 pt-3 md:pt-4 border-t border-white/20 px-4 pb-2 md:pb-4">
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2 px-1">
            <Calendar className="w-4 h-4 text-blue-400" />
            Export & Share
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const tourData = tourList.map((f, i) =>
                  `${i + 1}. ${f.name}\n   📍 ${f.address}, ${f.city}\n   📞 ${f.phone || 'No phone listed'}\n   💰 $${f.price_min} - $${f.price_max}/month\n   🏢 ${f.facility_type}\n`
                ).join('\n')

                const subject = `🏥 Tour Itinerary - ${tourList.length} Senior Care Facilities`
                const body = `Here's a customized tour itinerary for senior care facilities:\n\n${tourData}\n💡 Route optimized for efficiency\n\nGenerated by CareNext Senior Solutions`

                window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
              }}
              className="flex items-center gap-2 text-white hover:bg-blue-500/20 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-200 h-9 md:h-11"
            >
              <div className="w-2 h-2 bg-blue-400 rounded-full" />
              Email Tour
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const tourData = tourList.map((f, i) =>
                  `${i + 1}. ${f.name} - ${f.address}, ${f.city} - $${f.price_min}-$${f.price_max}`
                ).join('\n')

                navigator.clipboard.writeText(tourData)
                // You could add a toast notification here
              }}
              className="flex items-center gap-2 text-white hover:bg-green-500/20 border border-green-500/30 hover:border-green-400/50 transition-all duration-200 h-9 md:h-11"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              Copy List
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
