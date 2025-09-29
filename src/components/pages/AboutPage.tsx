"use client"

import React from "react"
import Image from "next/image"
import { Phone, Heart, Award, Users, Clock } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useNavigation } from "@/contexts/NavigationContext"

const features = [
  {
    icon: Heart,
    title: "Compassionate Care",
    description: "Every decision made with love and understanding"
  },
  {
    icon: Award,
    title: "15+ Years Experience",
    description: "Proven track record in senior care placement"
  },
  {
    icon: Users,
    title: "Family-Centered Approach",
    description: "Working closely with families every step"
  },
  {
    icon: Clock,
    title: "Quick Placement",
    description: "Successful placements typically within a week"
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

export default function AboutPage() {
  const { setCurrentPage, setIsLoading } = useNavigation()

  const handleNavigation = (page: 'contact') => {
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
      <section className="py-20 bg-gradient-to-b from-accent to-white">
        <div className="container mx-auto px-4">
          <Card className="shadow-2xl border-0 overflow-hidden glass-card">
            <CardContent className="p-12 text-center relative">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-secondary/5 rounded-full blur-3xl" />
              
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10"
              >
                <h1 className="text-4xl lg:text-6xl font-display font-bold text-foreground mb-8">
                  Our <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Commitment</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed mb-8 max-w-4xl mx-auto">
                  Our team will work closely with you and your family every step of the way, 
                  touring homes and providing expert guidance to help you find a care facility 
                  that fits your unique needs. Our personalized approach sets us apart from 
                  other placement agencies.
                </p>
                <div className="w-24 h-1 gradient-primary mx-auto rounded-full mb-8" />
                <p className="text-lg text-muted-foreground mb-8">
                  We believe that every story deserves individualized attention and care, 
                  and we&apos;re committed to finding the perfect fit for your family.
                </p>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    size="lg" 
                    className="gradient-primary text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <a href="tel:6025656101" className="flex items-center">
                      <Phone className="mr-2 h-5 w-5" />
                      Get A Personalized Care Strategy
                    </a>
                  </Button>
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full shadow-lg border-0 bg-white hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-8 text-center relative overflow-hidden">
                    {/* Hover background */}
                    <div className="absolute inset-0 gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                    
                    <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 relative z-10">
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-4 relative z-10">{feature.title}</h3>
                    <p className="text-muted-foreground relative z-10">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Carole-Lynne Section */}
      <motion.section 
        className="py-20 bg-white"
        variants={itemVariants}
      >
        <div className="container mx-auto px-4">
          <Card className="shadow-2xl border-0 overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <motion.div 
                className="relative h-96 lg:h-auto"
                whileHover={{ scale: 1.02 }}
              >
                <Image
                  src="/assets/about.jpeg"
                  alt="Carole-Lynne"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </motion.div>
              
              <div className="p-12">
                <motion.div
                  variants={itemVariants}
                >
                  <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
                    About{" "}
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Carole-Lynne
                    </span>
                  </h2>
                  
                  <div className="mb-6">
                    <p className="text-2xl text-gray-600 font-light">
                      <span className="font-bold text-blue-600">C</span>aring{" "}
                      <span className="font-bold text-blue-600">A</span>ssistance{" "}
                      <span className="font-bold text-blue-600">R</span>esource{" "}
                      <span className="font-bold text-blue-600">E</span>xpert
                    </p>
                  </div>

                  <p className="text-sm font-semibold tracking-widest text-blue-600 uppercase mb-6">
                    CDC&reg; Certified · B.A.
                  </p>
                  
                  <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-8"></div>
                  
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Navigating resources and researching senior living options can be very overwhelming. 
                    With over 15 years of experience, Carole-Lynne has the vast knowledge of all resources 
                    and placement options available for when the need arises. She will save your time and 
                    energy, by recommending top quality options, and give you peace of mind that all of 
                    the details are taken care of. She then in turn educates you and negotiates for you 
                    so that you can make informed decisions for yourself or your loved one.
                  </p>
                </motion.div>
              </div>
            </div>
          </Card>
        </div>
      </motion.section>

      {/* Expectations Section */}
      <motion.section 
        className="py-20 bg-gradient-to-br from-blue-50 to-purple-50"
        variants={itemVariants}
      >
        <div className="container mx-auto px-4">
          <Card className="shadow-2xl border-0 overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <div className="p-12 order-2 lg:order-1">
                <motion.div variants={itemVariants}>
                  <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-8">
                    What to{" "}
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Expect
                    </span>
                  </h2>
                  
                  <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-8"></div>
                  
                  <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                    <p>
                      We will be with you, helping you tour our recommended communities, learning 
                      about what they offer, and helping them learn about your needs as well. 
                      Successful placement in a senior community depends on factors such as the 
                      personal living space, level of social interaction, and attentiveness of 
                      the staff and medical professionals.
                    </p>
                    <p>
                      Our services are <span className="font-bold text-green-600">100% free to you</span>, 
                      and we will be with you every step of the way. Our expert knowledge of local 
                      communities in the valley allows us to find successful placements in under a week.
                    </p>
                  </div>
                  
                  <motion.div 
                    className="mt-8"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      onClick={() => handleNavigation('contact')}
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      Contact us today!
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
              
              <motion.div 
                className="relative h-96 lg:h-auto order-1 lg:order-2"
                whileHover={{ scale: 1.02 }}
              >
                <Image
                  src="/assets/adobe-3.jpeg"
                  alt="Senior care community"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </motion.div>
            </div>
          </Card>
        </div>
      </motion.section>
    </motion.div>
  )
}
