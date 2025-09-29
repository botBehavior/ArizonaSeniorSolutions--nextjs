"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { Menu, X, Phone, Heart } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useNavigation } from "@/contexts/NavigationContext"
import { cn } from "@/lib/utils"

const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'placement', label: 'Placement' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
]

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { currentPage, setCurrentPage, setIsLoading } = useNavigation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavigation = (page: typeof currentPage) => {
    if (page !== currentPage) {
      setIsLoading(true)
      setTimeout(() => {
        setCurrentPage(page)
        setIsLoading(false)
      }, 150)
    }
    setIsMenuOpen(false)
  }

  return (
    <>
      {/* Top Trust Banner */}
      <motion.div 
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        className="gradient-primary text-white py-3 px-4 relative overflow-hidden shadow-md"
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto flex items-center justify-center relative z-10">
          <motion.a 
            href="tel:602-565-6101" 
            className="group flex items-center gap-3 text-sm md:text-base font-semibold px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/15 focus-visible-ring transition-all duration-300"
            whileHover={{ scale: 1.02 }}
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="relative flex items-center justify-center"
            >
              <Phone className="h-4 w-4 text-white" />
              <div className="absolute inset-0 rounded-full bg-white/40 opacity-70 blur-[2px]"></div>
            </motion.div>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/50 bg-black/30 px-3 py-1 text-xs sm:text-sm font-semibold uppercase tracking-wide">
              <Heart className="h-3 w-3 text-white" aria-hidden="true" />
              100% Free Service
            </span>
            <span className="hidden sm:inline text-white/90">Call 602-565-6101 Today</span>
          </motion.a>
        </div>
      </motion.div>

      {/* Main Navbar */}
      <motion.nav 
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          isScrolled 
            ? "glass shadow-lg border-b border-white/10" 
            : "bg-white/95 backdrop-blur-sm"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo Section */}
            <motion.div 
              className="flex items-center gap-4 cursor-pointer group"
              onClick={() => handleNavigation('home')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative">
                <motion.div
                  className="absolute -inset-2 gradient-primary rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                  initial={false}
                />
                <Image 
                  src="/assets/logo.png" 
                  alt="Senior Care Solutions of AZ" 
                  width={60} 
                  height={60} 
                  className="w-14 h-14 object-contain relative z-10 transition-transform duration-300 group-hover:scale-110" 
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                  Senior Care Solutions
                </h1>
                <p className="text-sm text-muted-foreground">of Arizona</p>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavigation(item.id as typeof currentPage)}
                  className={cn(
                    "relative px-6 py-3 rounded-xl font-medium transition-all duration-300 group accessible-button",
                    currentPage === item.id 
                      ? 'text-primary-foreground shadow-lg' 
                      : 'text-foreground hover:text-primary'
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={`Navigate to ${item.label} page`}
                  aria-current={currentPage === item.id ? 'page' : undefined}
                >
                  {currentPage === item.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 gradient-primary rounded-xl"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                  {currentPage !== item.id && (
                    <div className="absolute inset-0 bg-accent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="relative glass-card border-white/20 hover:bg-white/20 accessible-button"
                aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={isMenuOpen}
              >
                <motion.div
                  animate={{ rotate: isMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </motion.div>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden border-t border-white/10 glass"
            >
              <div className="container mx-auto px-4 py-6 space-y-2">
                {navItems.map((item, index) => (
                  <motion.button
                    key={item.id}
                    onClick={() => handleNavigation(item.id as typeof currentPage)}
                    className={cn(
                      "w-full text-left px-6 py-4 rounded-xl font-medium transition-all duration-300 relative group",
                      currentPage === item.id 
                        ? 'gradient-primary text-primary-foreground shadow-lg' 
                        : 'text-foreground hover:bg-accent hover:text-primary'
                    )}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 8 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10">{item.label}</span>
                    {currentPage !== item.id && (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    )}
                  </motion.button>
                ))}
                
                {/* Mobile CTA */}
                <motion.div 
                  className="pt-4 border-t border-white/10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button 
                    asChild
                    className="w-full gradient-primary text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <a href="tel:602-565-6101" className="flex items-center justify-center gap-2">
                      <Phone className="h-4 w-4" />
                      Call Now - Free Consultation
                    </a>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  )
}
