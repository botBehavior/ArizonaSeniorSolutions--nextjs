"use client"

import React from 'react'
import { Card } from '@/components/ui/card'

export interface SearchFiltersState {
  facilityKind: '' | 'al-home' | 'al-center' | 'memory-care' | 'other'
  availabilityOnly: boolean
}

interface SearchFiltersProps {
  filters: SearchFiltersState
  onFiltersChange: (filters: SearchFiltersState) => void
  onClearFilters: () => void
}

const KIND_CHIPS: { value: SearchFiltersState['facilityKind']; label: string; sub: string }[] = [
  { value: 'al-home', label: 'AL Home', sub: 'Residential, ≤10 beds' },
  { value: 'al-center', label: 'AL Center', sub: 'Larger community' },
  { value: 'memory-care', label: 'Memory Care', sub: 'Specialized' },
  { value: 'other', label: 'Other', sub: 'Foster, BH, etc.' },
]

export default function SearchFilters({ filters, onFiltersChange, onClearFilters }: SearchFiltersProps) {
  const hasActive = filters.facilityKind !== '' || filters.availabilityOnly

  const setKind = (kind: SearchFiltersState['facilityKind']) => {
    onFiltersChange({ ...filters, facilityKind: filters.facilityKind === kind ? '' : kind })
  }

  return (
    <Card className="m-4 p-4 glass-brand-light shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-white text-sm uppercase tracking-wide">Type</h3>
        {hasActive && (
          <button
            type="button"
            onClick={onClearFilters}
            className="text-xs text-white/70 hover:text-white underline"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {KIND_CHIPS.map((chip) => {
          const active = filters.facilityKind === chip.value
          return (
            <button
              key={chip.value}
              type="button"
              onClick={() => setKind(chip.value)}
              className={`min-h-[44px] px-4 py-2 rounded-full text-sm border transition-all ${
                active
                  ? 'bg-blue-500/40 border-blue-300 text-white shadow-md shadow-blue-500/30'
                  : 'bg-white/10 border-white/20 text-white/85 hover:bg-white/20'
              }`}
              title={chip.sub}
            >
              {chip.label}
            </button>
          )
        })}
      </div>

      <label className="flex items-center gap-3 min-h-[44px] cursor-pointer select-none">
        <input
          type="checkbox"
          checked={filters.availabilityOnly}
          onChange={(e) => onFiltersChange({ ...filters, availabilityOnly: e.target.checked })}
          className="w-5 h-5 accent-blue-500"
        />
        <span className="text-white/85 text-sm">Show only facilities with available beds</span>
      </label>
    </Card>
  )
}
