"use client"

import React from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Heart, Info, HeartPulse, FileText, Users } from "lucide-react"

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
    title: "Who We Are",
    content: [
      "Senior Care Solutions of Arizona is an independent senior living referral and advisory service. We guide families through evaluating and selecting assisted living, memory care, and other senior care communities that fit their needs and budget."
    ]
  },
  {
    icon: Heart,
    title: "Compensation & Affiliations",
    content: [
      "Our guidance is provided to families at no cost. We may receive standard industry referral fees from licensed senior living communities when a placement occurs. These payments do not change the rates you pay and never influence whether we recommend or exclude a provider.",
      "All suggested communities must meet our internal quality review. We are not owned or controlled by any community, hospital system, or agency."
    ]
  },
  {
    icon: Info,
    title: "Scope of Services",
    content: [
      "We share information based on interviews, facility tours, publicly available licensing data, and updates from community partners.",
      "Availability, staffing, pricing, and resident eligibility can change without notice. Families are encouraged to verify all details directly with each community before making decisions."
    ]
  },
  {
    icon: HeartPulse,
    title: "No Legal or Medical Advice",
    content: [
      "We do not provide medical diagnoses, nursing assessments, legal opinions, or financial planning. Families should consult licensed physicians, attorneys, or financial professionals for guidance specific to their situation.",
      "Emergency services and crisis interventions are outside the scope of our offering. Dial 911 for immediate assistance." 
    ]
  },
  {
    icon: FileText,
    title: "Privacy Practices",
    content: [
      "Information you share with us is used to match care options and coordinate tours. We do not sell personal information. We may share relevant details with communities you authorize so they can prepare accurate proposals.",
      "Electronic communications are transmitted using reputable third-party tools. Please avoid sending protected health information by unencrypted email." 
    ]
  },
  {
    icon: Users,
    title: "Client Responsibilities",
    content: [
      "Families are responsible for reviewing contracts, service plans, and licensing status for any selected community.",
      "Let us know if your needs change or if you encounter issues with a recommended community so we can update our guidance." 
    ]
  },
]

export default function DisclosurePage() {
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
          <p className="text-sm font-semibold tracking-widest text-primary uppercase mb-4">Transparency & Ethics</p>
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
            Disclosure Statement
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Senior Care Solutions of Arizona operates with integrity, kindness, and respect. This disclosure explains how we deliver our services, how we are compensated, and what families can expect while partnering with our team.
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
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          variants={sectionVariants}
          className="mt-16 text-center text-sm text-muted-foreground max-w-3xl mx-auto"
        >
          <p>
            Questions about this disclosure? Call us at <a href="tel:6025656101" className="font-semibold text-primary">602-565-6101</a> or email <a href="mailto:care@senior-care-solutions.com" className="font-semibold text-primary">care@senior-care-solutions.com</a>.
          </p>
        </motion.div>
      </div>
    </motion.section>
  )
}
