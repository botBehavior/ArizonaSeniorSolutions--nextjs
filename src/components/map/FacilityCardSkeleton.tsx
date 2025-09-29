"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'

export default function FacilityCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="animate-pulse"
    >
      <Card className="p-3 md:p-4 glass-brand-light border-white/20 shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-2 md:mb-3">
          <div className="flex-1 min-w-0">
            <div className="h-6 bg-white/20 rounded mb-1"></div>
            <div className="h-4 bg-white/10 rounded mb-1 w-3/4"></div>
            <div className="h-4 bg-white/10 rounded w-1/2"></div>
          </div>
        </div>

        {/* Facility Type Badge */}
        <div className="mb-2 md:mb-3">
          <div className="h-5 bg-white/20 rounded-full w-20"></div>
        </div>

        {/* Availability Status */}
        <div className="flex items-center mb-2 md:mb-3">
          <div className="w-4 h-4 bg-white/20 rounded mr-2"></div>
          <div className="h-4 bg-white/10 rounded w-24"></div>
        </div>

        {/* Price Range */}
        <div className="flex items-center mb-2 md:mb-3">
          <div className="w-4 h-4 bg-white/20 rounded mr-2"></div>
          <div className="h-4 bg-white/10 rounded w-32"></div>
        </div>

        {/* ALTCS Status */}
        <div className="flex items-center mb-2 md:mb-3">
          <div className="w-2 h-2 bg-white/20 rounded-full mr-2"></div>
          <div className="h-4 bg-white/10 rounded w-16"></div>
        </div>

        {/* Contact Person */}
        <div className="mb-2 md:mb-3">
          <div className="h-4 bg-white/10 rounded w-28"></div>
        </div>

        {/* Distance Info */}
        <div className="mb-2 md:mb-3 p-2 bg-white/10 rounded-lg">
          <div className="flex justify-between">
            <div className="h-4 bg-white/20 rounded w-20"></div>
            <div className="h-4 bg-white/20 rounded w-24"></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-3 md:mt-4">
          <div className="h-8 bg-white/20 rounded"></div>
          <div className="h-8 bg-white/20 rounded"></div>
        </div>

        {/* Add to Tour Button */}
        <div className="h-9 bg-white/20 rounded mt-3"></div>

        {/* Added By & Date */}
        <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-white/10 flex justify-between">
          <div className="h-3 bg-white/10 rounded w-20"></div>
          <div className="h-3 bg-white/10 rounded w-16"></div>
        </div>
      </Card>
    </motion.div>
  )
}
