"use client"

import React from "react"
import Image from "next/image"
import { Phone, CheckCircle, ArrowRight, Star, Users, Clock, Award, Heart, Shield, Home } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Reviews from "@/components/Reviews"
import { useNavigation } from "@/contexts/NavigationContext"

const steps = [
  { 
    title: "Call Us", 
    description: "Free consultation to understand your needs",
    icon: Phone,
    completed: true 
  },
  { 
    title: "Expert Guidance", 
    description: "Personalized recommendations backed by 15+ years of experience",
    icon: Award,
    completed: true 
  },
  { 
    title: "Tour & Select", 
    description: "Visit our recommended communities together",
    icon: Users,
    completed: false 
  },
  { 
    title: "Move In", 
    description: "Seamless transition with ongoing support",
    icon: Home,
    completed: false 
  },
]

const stats = [
  { number: "15+", label: "Years Experience", icon: Award },
  { number: "500+", label: "Successful Placements", icon: Users },
  { number: "100%", label: "Free Service", icon: Heart },
  { number: "5", label: "Day Placement Average", icon: Clock },
]

const trustFeatures = [
  {
    icon: Shield,
    title: "Vetted Network",
    description: "Every recommended community is pre-screened for safety and quality"
  },
  {
    icon: Heart,
    title: "Family-Centered Care",
    description: "We treat your family like our own family"
  },
  {
    icon: Clock,
    title: "Quick Placement",
    description: "Most placements completed within five days"
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
}

export default function HomePage() {
  const { setCurrentPage, setIsLoading } = useNavigation()

  const handleNavigation = (page: 'contact' | 'about' | 'placement') => {
    setIsLoading(true)
    setTimeout(() => {
      setCurrentPage(page)
      setIsLoading(false)
    }, 150)
  }

  return (
    <motion.div 
      className="min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <section className="relative min-h-[60vh] md:min-h-[70vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src="/assets/field-bg.jpeg"
            alt="Senior Care Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>

        {/* Floating Elements - Hidden on mobile */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
          <motion.div 
            className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-32 right-16 w-32 h-32 bg-primary/20 rounded-full blur-2xl"
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-12 md:py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <motion.div 
              className="text-center lg:text-left"
              variants={itemVariants}
            >
              <motion.h1 
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-white mb-6 md:mb-8 leading-tight"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                We Are{" "}
                <span className="bg-gradient-to-r from-secondary to-yellow-400 bg-clip-text text-transparent">
                  Committed
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-lg md:text-xl lg:text-2xl text-white mb-6 md:mb-8 leading-relaxed"
                variants={itemVariants}
              >
                To providing the best possible service through{" "}
                <span className="bg-white/20 text-white font-semibold px-2 py-1 rounded border border-white/30">
                  integrity, kindness, and respect
                </span>
              </motion.p>

              <Card className="glass-brand-solid mb-6 md:mb-8">
                <CardContent className="p-4 md:p-6 lg:p-8">
                  <p className="text-base md:text-lg text-gray-800 leading-relaxed mb-4 md:mb-6">
                    We&apos;re here to help you find the right senior living community for your aging parent 
                    or spouse. Allow us to guide you through the process with expert advice based on 
                    your unique needs.
                  </p>
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      asChild
                      size="lg" 
                      className="w-full gradient-primary text-white shadow-lg hover:shadow-xl accessible-button h-12 md:h-14"
                    >
                      <a 
                        href="tel:6025656101" 
                        className="flex items-center justify-center text-sm md:text-base"
                        aria-label="Call Senior Care Solutions at 602-565-6101 for free consultation"
                      >
                        <Phone className="mr-2 h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
                        <span className="hidden sm:inline">Call for Free Consultation: </span>602-565-6101
                      </a>
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>

              {/* Stats */}
              <motion.div 
                className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
                variants={itemVariants}
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="glass-brand-opaque hover:glass-brand-semi-opaque transition-all duration-300">
                      <CardContent className="p-3 md:p-4 text-center">
                        <stat.icon className="h-5 w-5 md:h-6 md:w-6 text-brand-blue-primary-dark mx-auto mb-2" />
                        <div className="text-xl md:text-2xl font-bold text-gray-900 mb-1">{stat.number}</div>
                        <div className="text-xs md:text-sm text-gray-800 font-medium">{stat.label}</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="flex justify-center mt-8 lg:mt-0"
              variants={itemVariants}
            >
              <div className="relative w-full max-w-sm md:max-w-md lg:max-w-lg">
                <motion.div 
                  className="absolute inset-0 gradient-primary rounded-3xl blur-3xl opacity-30 hidden md:block"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="relative z-10">
                  <Image
                    src="/assets/carol.jpg"
                    alt="Carol - Senior Care Solutions"
                    width={400}
                    height={400}
                    className="rounded-3xl shadow-2xl object-cover w-full h-auto md:animate-float"
                  />
                  {/* Trust Badge */}
                  <div className="absolute -bottom-3 -right-3 md:-bottom-6 md:-right-6 z-20">
                    <Card className="glass-brand-opaque">
                      <CardContent className="p-2 md:p-4">
                        <div className="flex items-center gap-1 md:gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <span className="text-xs md:text-sm font-bold text-gray-900">5.0</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  {/* Experience Badge */}
                  <div className="absolute -top-2 -left-2 md:-top-4 md:-left-4 z-20">
                    <Card className="glass-brand-opaque">
                      <CardContent className="p-2 md:p-3">
                        <div className="text-center">
                          <div className="text-sm md:text-lg font-bold text-gray-900">15+</div>
                          <div className="text-xs text-gray-800 font-medium">Years</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Features Bar */}
      <motion.section 
        className="py-6 md:py-8 bg-white border-b"
        variants={itemVariants}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {trustFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-3 md:gap-4 text-center md:text-left"
                whileHover={{ scale: 1.02 }}
                variants={itemVariants}
              >
                <div className="w-10 h-10 md:w-12 md:h-12 gradient-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1 text-sm md:text-base">{feature.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How Our Service Works */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-white to-accent">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12 md:mb-16"
            variants={itemVariants}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-display font-bold text-foreground mb-4 md:mb-6">
              How Our Service Works
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-3xl mx-auto">
              Our complimentary service is designed to make finding the perfect senior living 
              community as smooth and stress-free as possible.
            </p>
            <div className="w-24 h-1 gradient-primary mx-auto rounded-full" />
          </motion.div>
          
          <div className="max-w-6xl mx-auto mb-12 md:mb-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  className="relative"
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                >
                  <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden group">
                    <CardContent className="p-8 text-center relative">
                      {/* Background gradient on hover */}
                      <div className="absolute inset-0 gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                      
                      <div className={`
                        w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 
                        transition-all duration-300 relative z-10
                        ${step.completed 
                          ? 'gradient-primary text-white shadow-lg' 
                          : 'bg-muted text-muted-foreground group-hover:bg-primary/10'
                        }
                      `}>
                        <step.icon className="h-8 w-8" />
                      </div>
                      
                      <h3 className="text-xl font-semibold mb-3 relative z-10">{step.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed relative z-10">
                        {step.description}
                      </p>
                      
                      {step.completed && (
                        <div className="absolute -top-2 -right-2">
                          <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Connection line */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-px bg-border z-10" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Process Details */}
          <motion.div 
            className="max-w-4xl mx-auto"
            variants={itemVariants}
          >
            <Card className="shadow-2xl border-0 overflow-hidden">
              <CardContent className="p-8">
                <Accordion type="single" collapsible defaultValue="item-1">
                  {[
                    {
                      id: "item-1",
                      title: "Initial Consultation",
                      content: (
                        <div className="space-y-4">
                          <p className="text-muted-foreground">During our free consultation, we&apos;ll discuss:</p>
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                              <span>Care level needs (Independent Living, Assisted Living, Memory Care)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                              <span>Budget considerations and payment options</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                              <span>Preferred locations and amenities</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                              <span>Timeline for placement</span>
                            </li>
                          </ul>
                        </div>
                      )
                    },
                    {
                      id: "item-2",
                      title: "Personalized Recommendations",
                      content: (
                        <div className="space-y-4">
                          <p className="text-muted-foreground">Based on our 15+ years of experience, we provide:</p>
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                              <span>Curated list of communities that match your specific needs</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                              <span>Insider knowledge about each community&apos;s strengths</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                              <span>Honest assessments based on our relationships with facilities</span>
                            </li>
                          </ul>
                        </div>
                      )
                    },
                    {
                      id: "item-3",
                      title: "Guided Tours & Support",
                      content: (
                        <div className="space-y-4">
                          <p className="text-muted-foreground">We accompany you throughout the process:</p>
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                              <span>Schedule and attend tours with you</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                              <span>Help you ask the right questions</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                              <span>Assist with paperwork and move-in coordination</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                              <span>Provide ongoing support during the transition</span>
                            </li>
                          </ul>
                        </div>
                      )
                    }
                  ].map((item) => (
                    <AccordionItem key={item.id} value={item.id} className="border-border">
                      <AccordionTrigger className="text-xl font-semibold text-foreground">
                        {item.title}
                      </AccordionTrigger>
                      <AccordionContent className="leading-relaxed">
                        {item.content}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </motion.div>

          {/* Call to Action */}
          <motion.div 
            className="text-center mt-16"
            variants={itemVariants}
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => handleNavigation('contact')}
                size="lg"
                className="gradient-primary text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                onClick={() => handleNavigation('about')}
                variant="outline" 
                size="lg"
                className="border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300"
              >
                Learn More About Us
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Reviews Section */}
      <motion.div variants={itemVariants}>
        <Reviews />
      </motion.div>
    </motion.div>
  )
}
