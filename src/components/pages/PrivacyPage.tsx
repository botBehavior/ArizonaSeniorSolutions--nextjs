"use client"

import React from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Lock, Eye, FileText, Users, Mail } from "lucide-react"

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
}

const sections = [
  {
    icon: Shield,
    title: "Information We Collect",
    content: [
      "Personal information you provide directly (name, phone, email, address)",
      "Information about your loved one's care needs and preferences",
      "Communication history and preferences",
      "Information necessary to coordinate facility tours and placements"
    ]
  },
  {
    icon: Eye,
    title: "How We Use Your Information",
    content: [
      "Match you with appropriate senior care facilities",
      "Coordinate tours and facility visits",
      "Communicate about available options and services",
      "Provide personalized guidance and support",
      "Improve our services and website functionality"
    ]
  },
  {
    icon: Lock,
    title: "Information Sharing",
    content: [
      "We share information only with your explicit permission",
      "Senior care facilities you authorize for tours or consideration",
      "Third-party service providers who help us operate (with confidentiality agreements)",
      "Legal requirements when required by law",
      "We do NOT sell your personal information to third parties"
    ]
  },
  {
    icon: FileText,
    title: "Data Security",
    content: [
      "Industry-standard encryption for all data transmission",
      "Secure storage systems with access controls",
      "Regular security audits and updates",
      "Limited access to personal information on a need-to-know basis",
      "Immediate notification if any security concerns arise"
    ]
  },
  {
    icon: Users,
    title: "Your Rights",
    content: [
      "Access your personal information we have collected",
      "Correct inaccurate or incomplete information",
      "Request deletion of your personal information",
      "Opt out of communications at any time",
      "File complaints with relevant privacy authorities"
    ]
  },
  {
    icon: Mail,
    title: "Contact Information",
    content: [
      "Email: care@senior-care-solutions.com",
      "Phone: (602) 565-6101",
      "Address: Serving the Greater Phoenix Area",
      "We respond to all privacy inquiries within 30 days"
    ]
  }
]

export default function PrivacyPage() {
  return (
    <motion.section
      className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-blue-50 py-20"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
    >
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div
          variants={sectionVariants}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold tracking-widest text-primary uppercase mb-4">Legal & Compliance</p>
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
            Privacy Policy
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Senior Care Solutions of Arizona is committed to protecting your privacy and handling your personal information with the utmost care and respect. This privacy policy explains how we collect, use, and protect your information.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2">
          {sections.map((section) => (
            <motion.div key={section.title} variants={sectionVariants}>
              <Card className="h-full shadow-lg border border-white/50 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/10 text-primary">
                      <section.icon className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-semibold text-foreground">
                      {section.title}
                    </h2>
                  </div>
                  <div className="space-y-3 text-sm md:text-base text-muted-foreground leading-relaxed">
                    {section.content.map((paragraph) => (
                      <p key={paragraph}>• {paragraph}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          variants={sectionVariants}
          className="mt-16 text-center text-sm text-muted-foreground max-w-3xl mx-auto space-y-4"
        >
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border border-primary/10">
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Additional Privacy Information</h3>
              <div className="space-y-3 text-left">
                <p>• We retain personal information only as long as necessary for our legitimate business purposes or as required by law.</p>
                <p>• We use reputable third-party tools for email communication and website analytics, all with appropriate privacy safeguards.</p>
                <p>• This privacy policy applies to information collected through our website and direct communications only.</p>
                <p>• We may update this privacy policy periodically. Significant changes will be communicated to you directly.</p>
              </div>
            </CardContent>
          </Card>

          <p>
            Questions about this privacy policy? Contact us at{" "}
            <a href="tel:6025656101" className="font-semibold text-primary">602-565-6101</a>{" "}
            or{" "}
            <a href="mailto:care@senior-care-solutions.com" className="font-semibold text-primary">care@senior-care-solutions.com</a>.
          </p>
        </motion.div>
      </div>
    </motion.section>
  )
}
