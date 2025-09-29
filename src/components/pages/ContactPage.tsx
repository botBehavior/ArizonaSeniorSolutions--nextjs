"use client"

import React, { useState } from "react"
import Image from "next/image"
import emailjs from "@emailjs/browser"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Phone, MessageSquare, Send, CheckCircle, AlertCircle, Heart, User, Building } from "lucide-react"

interface FormData {
  from_name: string
  phone: string
  user_email: string
  message: string
  relationship?: string
  urgency?: string
}

export default function ContactPage() {
  const [formType, setFormType] = useState<'contact' | 'testimonial'>('contact')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [formData, setFormData] = useState<FormData>({
    from_name: '',
    phone: '',
    user_email: '',
    message: '',
    relationship: '',
    urgency: ''
  })

  const serviceIdContact = 'service_yu1omg9'
  const templateIdContact = 'template_q64ztcq'
  const userIdContact = 'fyejM9DucPV2ID0UG'
  const serviceIdTestimonial = 'service_yu1omg9'
  const templateIdTestimonial = 'template_aekk8md'
  const userIdTestimonial = 'fyejM9DucPV2ID0UG'

  const switchForm = (type: 'contact' | 'testimonial') => {
    setFormType(type)
    setSubmitStatus('idle')
    setFormData({
      from_name: '',
      phone: '',
      user_email: '',
      message: '',
      relationship: '',
      urgency: ''
    })
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const sendEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    const serviceId = formType === 'contact' ? serviceIdContact : serviceIdTestimonial
    const templateId = formType === 'contact' ? templateIdContact : templateIdTestimonial
    const userId = formType === 'contact' ? userIdContact : userIdTestimonial

    try {
      const result = await emailjs.sendForm(serviceId, templateId, e.currentTarget, userId)
      console.log('Email sent successfully:', result.text)
      setSubmitStatus('success')
      setFormData({
        from_name: '',
        phone: '',
        user_email: '',
        message: '',
        relationship: '',
        urgency: ''
      })
      // Reset form
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      console.error('Error sending email:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div 
      className="min-h-screen py-20 bg-gradient-to-b from-accent to-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl lg:text-6xl font-display font-bold text-foreground mb-6">
            Get In{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Touch
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Ready to find the perfect care community for your loved one? 
            We&apos;re here to help with expert guidance and personalized service.
          </p>
          <div className="w-24 h-1 gradient-primary mx-auto rounded-full" />
        </motion.div>

        {/* Form Type Selection */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <Card className="p-1 bg-muted/50 backdrop-blur-sm">
            <RadioGroup
              value={formType}
              onValueChange={(value) => switchForm(value as 'contact' | 'testimonial')}
              className="flex"
            >
              <div className="flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-white/50">
                <RadioGroupItem value="contact" id="contact" />
                <Label
                  htmlFor="contact"
                  className="flex items-center gap-2 cursor-pointer text-sm font-medium"
                >
                  <User className="w-4 h-4" />
                  Get Started
                </Label>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-white/50">
                <RadioGroupItem value="testimonial" id="testimonial" />
                <Label
                  htmlFor="testimonial"
                  className="flex items-center gap-2 cursor-pointer text-sm font-medium"
                >
                  <Heart className="w-4 h-4" />
                  Share Your Story
                </Label>
              </div>
            </RadioGroup>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="order-2 lg:order-1"
          >
            <Card className="shadow-2xl border-0 glass-card relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-secondary/5 rounded-full blur-3xl" />

              <CardHeader className="text-center relative z-10 pb-6">
                <div className="flex justify-center mb-6">
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg ${
                    formType === 'contact' ? 'gradient-primary' : 'gradient-secondary'
                  }`}>
                    {formType === 'contact' ? (
                      <Mail className="h-10 w-10 text-white" />
                    ) : (
                      <Heart className="h-10 w-10 text-white" />
                    )}
                  </div>
                </div>
                <CardTitle className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-2">
                  {formType === 'contact' ? 'Let\'s Start Your Journey' : 'Share Your Experience'}
                </CardTitle>
                <p className="text-muted-foreground text-lg">
                  {formType === 'contact'
                    ? 'We\'re here to guide you through finding the perfect care solution for your loved one.'
                    : 'Your feedback helps us serve families better. Thank you for sharing your story.'
                  }
                </p>
              </CardHeader>

              <CardContent className="relative z-10 px-8 pb-8">
                <form onSubmit={sendEmail} className="space-y-6">
                  {/* Name Field */}
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-base font-semibold text-foreground flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Full Name *
                    </Label>
                    <Input
                      type="text"
                      id="name"
                      name="from_name"
                      required
                      value={formData.from_name}
                      onChange={(e) => handleInputChange('from_name', e.target.value)}
                      placeholder="Enter your full name"
                      className="h-12 text-base border-2 focus:border-primary transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    />
                  </div>

                  {/* Contact Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {formType === 'contact' && (
                      <div className="space-y-3">
                        <Label htmlFor="phone" className="text-base font-semibold text-foreground flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Phone Number *
                        </Label>
                        <Input
                          type="tel"
                          id="phone"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="(602) 555-0123"
                          className="h-12 text-base border-2 focus:border-primary transition-all duration-300 bg-white/50 backdrop-blur-sm"
                        />
                      </div>
                    )}

                    <div className={`space-y-3 ${formType === 'testimonial' ? 'md:col-span-2' : ''}`}>
                      <Label htmlFor="email" className="text-base font-semibold text-foreground flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email Address *
                      </Label>
                      <Input
                        type="email"
                        id="email"
                        name="user_email"
                        required
                        value={formData.user_email}
                        onChange={(e) => handleInputChange('user_email', e.target.value)}
                        placeholder="your.email@example.com"
                        className="h-12 text-base border-2 focus:border-primary transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      />
                    </div>
                  </div>

                  {/* Additional Fields for Contact Form */}
                  {formType === 'contact' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="relationship" className="text-base font-semibold text-foreground flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          Your Relationship
                        </Label>
                        <Select value={formData.relationship} onValueChange={(value) => handleInputChange('relationship', value)}>
                          <SelectTrigger className="h-12 text-base border-2 focus:border-primary transition-all duration-300 bg-white/50 backdrop-blur-sm">
                            <SelectValue placeholder="Select relationship" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="family-member">Family Member</SelectItem>
                            <SelectItem value="caregiver">Caregiver</SelectItem>
                            <SelectItem value="professional">Healthcare Professional</SelectItem>
                            <SelectItem value="friend">Friend</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="urgency" className="text-base font-semibold text-foreground flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Timeline
                        </Label>
                        <Select value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
                          <SelectTrigger className="h-12 text-base border-2 focus:border-primary transition-all duration-300 bg-white/50 backdrop-blur-sm">
                            <SelectValue placeholder="How soon do you need help?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="asap">As soon as possible</SelectItem>
                            <SelectItem value="within-week">Within a week</SelectItem>
                            <SelectItem value="within-month">Within a month</SelectItem>
                            <SelectItem value="planning-ahead">Planning ahead</SelectItem>
                            <SelectItem value="just-researching">Just researching</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Message Field */}
                  <div className="space-y-3">
                    <Label htmlFor="message" className="text-base font-semibold text-foreground flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      {formType === 'contact' ? 'How can we help you?' : 'Share your experience'} *
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      rows={6}
                      required
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder={
                        formType === 'contact'
                          ? "Tell us about your loved one's care needs, preferred location, budget, and any specific requirements..."
                          : "Share your experience working with Senior Care Solutions. What did we do well? How can we improve?"
                      }
                      className="text-base border-2 focus:border-primary transition-all duration-300 resize-none bg-white/50 backdrop-blur-sm"
                    />
                  </div>

                  {/* Submit Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="pt-4"
                  >
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-14 text-lg font-semibold gradient-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                          Sending your message...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <Send className="mr-3 h-6 w-6" />
                          {formType === 'contact' ? 'Send Message' : 'Share Feedback'}
                        </div>
                      )}
                    </Button>
                  </motion.div>

                  {/* Status Messages */}
                  {submitStatus === 'success' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Alert className="border-green-200 bg-green-50/80 backdrop-blur-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800 font-medium">
                          Thank you! Your {formType === 'contact' ? 'message' : 'feedback'} has been sent successfully. We&apos;ll get back to you within 24 hours.
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}

                  {submitStatus === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Alert variant="destructive" className="bg-red-50/80 backdrop-blur-sm">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="font-medium">
                          We apologize, but there was an error sending your message. Please try again or contact us directly at (602) 565-6101.
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Image Section */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="order-1 lg:order-2"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-2xl opacity-20"></div>
              <Image
                src="/assets/contact.jpeg"
                alt="Contact Us"
                width={600}
                height={400}
                className="relative z-10 w-full rounded-2xl shadow-2xl object-cover"
              />

              {/* Floating Info Cards */}
              <div className="absolute -bottom-6 -left-6 z-20">
                <Card className="glass-brand-opaque p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">100% Free</p>
                      <p className="text-xs text-gray-600">No obligation</p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="absolute -top-6 -right-6 z-20">
                <Card className="glass-brand-opaque p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Phone className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">24/7 Support</p>
                      <p className="text-xs text-gray-600">Always available</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <Card className="glass-brand-light p-4 text-center">
                <div className="text-2xl font-bold text-primary mb-1">15+</div>
                <div className="text-xs text-muted-foreground">Years Experience</div>
              </Card>
              <Card className="glass-brand-light p-4 text-center">
                <div className="text-2xl font-bold text-primary mb-1">500+</div>
                <div className="text-xs text-muted-foreground">Happy Families</div>
              </Card>
            </div>
          </motion.div>
        </div>

        {/* Contact Info */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-20 text-center"
        >
          <Card className="max-w-2xl mx-auto shadow-xl border-0 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Other Ways to Reach Us</h3>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-8">
                <motion.a
                  href="tel:602-565-6101"
                  className="flex items-center text-lg text-blue-600 hover:text-blue-800 transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  <Phone className="mr-2 h-6 w-6" />
                  (602) 565-6101
                </motion.a>
                <motion.a
                  href="mailto:info@arizonaseniorsolutions.com"
                  className="flex items-center text-lg text-purple-600 hover:text-purple-800 transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  <Mail className="mr-2 h-6 w-6" />
                  info@arizonaseniorsolutions.com
                </motion.a>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
