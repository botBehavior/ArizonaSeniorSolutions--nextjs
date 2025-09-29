"use client"

import { useState, useEffect } from 'react'
import type { Facility } from '@/types/facility'

export function useFacilities() {
  const [facilities, setFacilities] = useState<Facility[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFacilities = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/facilities')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch facilities: ${response.status}`)
      }
      
      const data = await response.json()
      setFacilities(data.facilities || [])
    } catch (err) {
      console.error('Error fetching facilities:', err)

      let errorMessage = 'Failed to load facilities'

      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Unable to connect to the facility database. Please check your internet connection and try again.'
        } else if (err.message.includes('500')) {
          errorMessage = 'Server error while loading facilities. The data source may be temporarily unavailable.'
        } else if (err.message.includes('404')) {
          errorMessage = 'Facility data source not found. Please contact support.'
        } else {
          errorMessage = err.message
        }
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    fetchFacilities()
  }

  useEffect(() => {
    fetchFacilities()
  }, [])

  return {
    facilities,
    loading,
    error,
    refreshData
  }
}
