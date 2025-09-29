import { NextResponse } from 'next/server'

interface GoogleReview {
  author_name: string
  rating: number
  text: string
  time: number
  profile_photo_url?: string
  author_url?: string
  language?: string
}

interface GooglePlaceDetails {
  result: {
    reviews: GoogleReview[]
    rating: number
    user_ratings_total: number
  }
}

interface TransformedReview {
  name: string
  rating: number
  text: string
  location: string
  relationship: string
  time: number
}

// Google Places API configuration
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY
const PLACE_ID = process.env.GOOGLE_PLACE_ID // You'll need to set this in your environment

// Fallback reviews for when API fails or during development
const fallbackReviews: TransformedReview[] = [
  {
    name: "Robert L.",
    rating: 5,
    text: "CaroleLynne is the perfect advocate for finding placement for you and or your beloved family member. She has years of experience helping families bringing a multitude of success stories finding the right match for the needs at hand. You can't go wrong with Senior Care Solutions of Arizona.",
    location: "Phoenix, AZ",
    relationship: "Family Member",
    time: Date.now() - 86400000 * 30 // 30 days ago
  },
  {
    name: "Len B.",
    rating: 5,
    text: "CaroleLynne was a tremendous help to our family when we needed to get my mother into a care facility. Senior Care Solutions of AZ provided us with answers and suggestions that we needed to make good decisions. I highly recommend asking CaroleLynne for assistance when caring for your loved one.",
    location: "Scottsdale, AZ",
    relationship: "Son",
    time: Date.now() - 86400000 * 45 // 45 days ago
  },
  {
    name: "Sharin D.",
    rating: 5,
    text: "As a SNF case manager, I have worked with Carol-Lynne for years. I have seen her work tirelessly to find safe placement for many patients. I can always count on her to do what's right for her clients regardless of the time spent or the compensation. Her work ethic and kindness is a rarity in todays world.",
    location: "Tempe, AZ",
    relationship: "Healthcare Professional",
    time: Date.now() - 86400000 * 60 // 60 days ago
  }
]

// Transform Google review data to match our component structure
function transformGoogleReview(review: GoogleReview): TransformedReview {
  // Extract location from review text or use default
  const extractLocation = (text: string): string => {
    const cities = ['Phoenix', 'Scottsdale', 'Tempe', 'Mesa', 'Chandler', 'Gilbert', 'Glendale', 'Peoria']
    for (const city of cities) {
      if (text.toLowerCase().includes(city.toLowerCase())) {
        return `${city}, AZ`
      }
    }
    return "Greater Phoenix Area, AZ"
  }

  // Determine relationship type based on review content
  const determineRelationship = (text: string): string => {
    const lowerText = text.toLowerCase()

    if (lowerText.includes('case manager') || lowerText.includes('healthcare') || lowerText.includes('professional')) {
      return "Healthcare Professional"
    }
    if (lowerText.includes('mother') || lowerText.includes('father') || lowerText.includes('parent') ||
        lowerText.includes('wife') || lowerText.includes('husband') || lowerText.includes('spouse') ||
        lowerText.includes('son') || lowerText.includes('daughter') || lowerText.includes('family')) {
      return "Family Member"
    }
    return "Client"
  }

  return {
    name: review.author_name,
    rating: review.rating,
    text: review.text,
    location: extractLocation(review.text),
    relationship: determineRelationship(review.text),
    time: review.time * 1000 // Convert to milliseconds
  }
}

async function fetchGoogleReviews(): Promise<TransformedReview[]> {
  // If no API key or place ID, return fallback reviews
  if (!GOOGLE_PLACES_API_KEY || !PLACE_ID) {
    console.warn('Google Places API credentials not configured, using fallback reviews')
    return fallbackReviews
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=reviews,rating,user_ratings_total&key=${GOOGLE_PLACES_API_KEY}`

    const response = await fetch(url, {
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`)
    }

    const data: GooglePlaceDetails = await response.json()

    if (!data.result?.reviews) {
      console.warn('No reviews found in Google Places response')
      return fallbackReviews
    }

    // Transform and filter reviews (only 5-star reviews, limit to 10 most recent)
    const transformedReviews = data.result.reviews
      .filter(review => review.rating === 5) // Only show 5-star reviews
      .sort((a, b) => b.time - a.time) // Sort by most recent
      .slice(0, 10) // Limit to 10 reviews
      .map(transformGoogleReview)

    // If we have fewer than 3 reviews, supplement with fallback reviews
    if (transformedReviews.length < 3) {
      const remainingSlots = 3 - transformedReviews.length
      const supplementalReviews = fallbackReviews.slice(0, remainingSlots)
      return [...transformedReviews, ...supplementalReviews]
    }

    // Return up to 6 reviews for the carousel
    return transformedReviews.slice(0, 6)

  } catch (error) {
    console.error('Error fetching Google reviews:', error)
    // Return fallback reviews on error
    return fallbackReviews
  }
}

export async function GET() {
  try {
    const reviews = await fetchGoogleReviews()

    return NextResponse.json({
      reviews,
      success: true
    })
  } catch (error) {
    console.error('Error in Google reviews API:', error)

    return NextResponse.json({
      reviews: fallbackReviews,
      success: false,
      error: 'Failed to fetch reviews'
    }, { status: 500 })
  }
}
