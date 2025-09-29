"use client"

import React, { useState, useEffect } from "react"
import { Star, Quote, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"
import Autoplay from "embla-carousel-autoplay"
import { fallbackReviews, SharedReview } from "@/data/reviews"

type Review = SharedReview

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>(fallbackReviews)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  )

  useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await fetch('/api/google-reviews')
        const data = await response.json()

        if (data.success && data.reviews) {
          setReviews(data.reviews)
        } else {
          // Use fallback reviews if API fails
          setReviews(fallbackReviews)
        }
      } catch (err) {
        console.error('Failed to fetch reviews:', err)
        setError('Failed to load reviews')
        // Use fallback reviews
        setReviews(fallbackReviews)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [])

  return (
    <section className="py-20 bg-gradient-to-b from-accent to-white relative overflow-hidden" aria-labelledby="reviews-heading">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-16 w-40 h-40 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 id="reviews-heading" className="text-4xl lg:text-6xl font-display font-bold text-foreground mb-6">
            What Families Say
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Don&apos;t just take our word for it. Here&apos;s what families and healthcare professionals 
            have to say about our services.
          </p>
          <div className="w-24 h-1 gradient-primary mx-auto rounded-full" />
        </motion.div>
        
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Card className="p-8 glass-brand-light shadow-xl">
                <div className="flex items-center gap-4">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="text-muted-foreground">Loading reviews...</span>
                </div>
              </Card>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16">
              <Card className="p-8 glass-brand-light shadow-xl border-red-200">
                <div className="text-center text-red-600">
                  <p className="font-medium mb-2">Unable to load reviews</p>
                  <p className="text-sm text-red-500">Showing our featured testimonials</p>
                </div>
              </Card>
            </div>
          ) : (
            <Carousel
              plugins={[plugin.current]}
              className="w-full"
              onMouseEnter={plugin.current.stop}
              onMouseLeave={plugin.current.reset}
              opts={{
                align: "start",
                loop: true,
              }}
            >
              <CarouselContent>
                {reviews.map((review, index) => (
                  <CarouselItem key={`${review.name}-${index}`} className="md:basis-1/2 lg:basis-1/3">
                    <motion.div
                      className="p-4 h-full"
                      whileHover={{ y: -8 }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden group">
                        <CardContent className="p-8 text-center h-full flex flex-col relative">
                          {/* Hover background */}
                          <div className="absolute inset-0 gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300" />

                          {/* Quote Icon */}
                          <div className="mb-6 relative z-10">
                            <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center mx-auto">
                              <Quote className="h-6 w-6 text-white" />
                            </div>
                          </div>

                          {/* Rating */}
                          <div className="flex items-center justify-center gap-1 mb-6 relative z-10">
                            {[...Array(review.rating)].map((_, i) => (
                              <motion.div
                                key={i}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: i * 0.1, duration: 0.2 }}
                              >
                                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                              </motion.div>
                            ))}
                          </div>

                          {/* Review Text */}
                          <blockquote className="text-gray-700 leading-relaxed mb-6 flex-grow relative z-10 italic">
                            &ldquo;{review.text}&rdquo;
                          </blockquote>

                          {/* Author Info */}
                          <div className="mt-auto relative z-10">
                            <div className="w-16 h-px bg-border mx-auto mb-4" />
                            <div className="font-semibold text-foreground text-lg mb-1">{review.name}</div>
                            <div className="text-sm text-primary font-medium mb-1">{review.relationship}</div>
                            <div className="text-xs text-muted-foreground">{review.location}</div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex items-center justify-center gap-4 mt-8">
                <CarouselPrevious
                  className="static translate-y-0 hover:bg-primary hover:text-white transition-colors accessible-button"
                  aria-label="Previous review"
                />
                <CarouselNext
                  className="static translate-y-0 hover:bg-primary hover:text-white transition-colors accessible-button"
                  aria-label="Next review"
                />
              </div>
            </Carousel>
          )}
        </div>
        
        {/* Trust indicators */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="inline-block glass border-white/20">
            <CardContent className="px-8 py-4">
              <div className="flex items-center gap-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="text-sm">
                  <span className="font-semibold">5.0 out of 5</span>
                  <span className="text-muted-foreground ml-1">from 50+ reviews</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Additional trust elements */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <div className="trust-badge">
              <Star className="h-4 w-4" />
              Trusted by 500+ Families
            </div>
            <div className="trust-badge">
              <Quote className="h-4 w-4" />
              15+ Years Experience
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
