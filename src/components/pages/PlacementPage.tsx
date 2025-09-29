"use client"

import React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Home, Brain, Shield } from "lucide-react"

const services = [
  {
    title: "Independent Living",
    image: "/assets/peeps-party.jpeg",
    icon: Home,
    description: "What does living independently actually entail? Independent living neighborhoods do not offer assistance with activities of daily life, in contrast to assisted living facilities. They are intended for independent, physically fit seniors who desire to interact socially with individuals their own age and have access to practical, pleasurable amenities.",
    gradient: "from-green-400 to-blue-500"
  },
  {
    title: "Assisted Living",
    image: "/assets/activities1.jpeg",
    icon: Heart,
    description: "Your loved one may maintain the healthy, active lifestyles they are accustomed to while receiving a little more help as needed thanks to our assisted living lifestyle. While we take care of the necessities of daily life, the residents here live fuller, happier lives. Receive the care you require in a home you enjoy.",
    gradient: "from-purple-400 to-pink-500"
  },
  {
    title: "Memory Care",
    image: "/assets/adobe-5.jpeg",
    icon: Brain,
    description: "Caregiving for an elderly loved one who has memory loss brings particular difficulties. Neurodegenerative illnesses like Alzheimer's and dementia include emotional, behavioral, and physical side effects that call for specialized treatment and close supervision. The majority of caregivers are unable to offer this caliber of care at home.",
    gradient: "from-blue-400 to-indigo-500"
  },
  {
    title: "Advocacy",
    image: "/assets/adobe-2.jpeg",
    icon: Shield,
    description: "An advocate can be a good friend to have on your side, especially when things get complicated. When navigating the healthcare system, sometimes there is so much information being offered that it is nearly impossible to hold it alone and sort out what you have been told. As your advocate and coach, we do our best to ensure that everyone understands the information being dispensed and that your questions are answered appropriately.",
    gradient: "from-orange-400 to-red-500"
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
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
}

export default function PlacementPage() {
  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <motion.section 
        className="relative py-20 overflow-hidden"
        variants={itemVariants}
      >
        <Image
          src="/assets/sky-bg.jpeg"
          alt="Background"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/50"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8">
            <motion.h1 
              className="text-4xl lg:text-6xl font-bold"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="text-white drop-shadow-2xl">
                <span className="bg-gradient-to-r from-secondary to-yellow-400 bg-clip-text text-transparent font-extrabold">
                  Placement
                </span>
                <span className="text-white ml-2 font-extrabold">Process</span>
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl text-white leading-relaxed max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Our comprehensive placement process ensures your loved one finds the perfect senior living community. 
              With over 15 years of experience, we guide you through every step with personalized care and expertise.
            </motion.p>
          </div>
        </div>
      </motion.section>

      {/* Introduction Section */}
      <motion.section 
        className="py-20 bg-gradient-to-br from-gray-50 to-blue-50"
        variants={itemVariants}
      >
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto shadow-2xl border-0 glass-brand-opaque">
            <CardHeader className="text-center pb-6 pt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <CardTitle className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  Finding Senior Living Options
                </CardTitle>
                <div className="w-24 h-1 bg-gradient-to-r from-brand-blue-primary to-brand-blue-primary-dark mx-auto rounded-full"></div>
              </motion.div>
            </CardHeader>
            <CardContent className="p-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <p className="text-xl text-gray-700 mb-6 leading-relaxed font-medium">
                  Making the right care decision for your loved one can be a daunting task.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  There are so many options; the terminology is often unfamiliar, and the terrain unknown.
                  Senior Care Solution of AZ will streamline the process to make it easier for you to make
                  informed choices and reduce the stress and pressure associated with such important
                  decisions.
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      {/* Services Grid */}
      <motion.section 
        className="py-20 bg-white"
        variants={itemVariants}
      >
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Our Care Options
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We offer comprehensive placement services for various levels of care, 
              ensuring your loved one receives the support they need in the right environment.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {services.map((service, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="h-full shadow-2xl border-0 overflow-hidden glass-brand-light hover:shadow-3xl transition-all duration-500">
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className={`absolute top-4 right-4 w-12 h-12 rounded-full bg-gradient-to-r ${service.gradient} flex items-center justify-center shadow-lg`}>
                      <service.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl lg:text-3xl font-bold text-gray-800">
                      {service.title}
                    </CardTitle>
                    <div className={`w-16 h-1 bg-gradient-to-r ${service.gradient} mx-auto rounded-full`}></div>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    <p className="text-gray-600 leading-relaxed">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </motion.div>
  )
}
