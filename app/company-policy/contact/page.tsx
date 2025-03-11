"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { SupportButton } from "@/components/support-button"
import { Printer, Mail, Phone, MapPin, CheckCircle2 } from "lucide-react"

export default function page() {
  const [formSubmitted, setFormSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate form submission
    setFormSubmitted(true)
    // Reset form after 5 seconds
    setTimeout(() => {
      setFormSubmitted(false)
    }, 5000)
  }

  return (
<div className="container mx-auto px-4 md:px-6">

      <main className="flex-1">
        <section className="py-12 md:py-16 bg-gradient-to-b from-yellow-50 to-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="rounded-full bg-yellow-100 p-3 animate-pulse">
                <Mail className="h-8 w-8 text-yellow-600" />
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Contact Us</h1>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Have questions or need assistance? We're here to help!
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2">
             

              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tighter md:text-3xl">Contact Information</h2>
                  <p className="text-muted-foreground">
                    You can also reach us using the following contact information.
                  </p>
                </div>

                <div className="grid gap-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-yellow-100 p-2 mt-1">
                      <Mail className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <p className="text-muted-foreground">contactutkarshverma@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-yellow-100 p-2 mt-1">
                      <Phone className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Phone</h3>
                      <p className="text-muted-foreground">+91 7985748915</p>
                      <p className="text-muted-foreground">Mon-Fri: 9AM - 6PM EST</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-yellow-100 p-2 mt-1">
                      <MapPin className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Office</h3>
                      <p className="text-muted-foreground">Awas Vikas Colony Gonda</p>
                      <p className="text-muted-foreground">Gonda, UP 271002</p>
                      <p className="text-muted-foreground">India</p>
                    </div>
                  </div>
                </div>

                <div className="relative h-[300px] w-full overflow-hidden rounded-lg border">
                  <Image
                    src="/placeholder.svg?height=300&width=600"
                    alt="Office Location Map"
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Business Hours</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="font-medium">Monday - Friday</p>
                      <p className="text-muted-foreground">9:00 AM - 6:00 PM EST</p>
                    </div>
                    <div>
                      <p className="font-medium">Saturday</p>
                      <p className="text-muted-foreground">10:00 AM - 4:00 PM EST</p>
                    </div>
                    <div>
                      <p className="font-medium">Sunday</p>
                      <p className="text-muted-foreground">Closed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-24 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tighter md:text-3xl">Frequently Asked Questions</h2>
                <p className="text-muted-foreground max-w-[700px]">
                  Find quick answers to common questions about our services.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-5xl mt-8">
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="font-bold mb-2">How long does shipping take?</h3>
                  <p className="text-sm text-muted-foreground">
                    Shipping times vary depending on your location. Standard shipping typically takes 5-7 business days,
                    while express shipping takes 2-3 business days.
                  </p>
                </div>

                <div className="rounded-lg border bg-card p-6">
                  <h3 className="font-bold mb-2">What file formats do you accept?</h3>
                  <p className="text-sm text-muted-foreground">
                    We accept PNG, JPG, PDF, and SVG files. For best results, we recommend high-resolution files (at
                    least 300 DPI).
                  </p>
                </div>

                <div className="rounded-lg border bg-card p-6">
                  <h3 className="font-bold mb-2">Can I cancel my order?</h3>
                  <p className="text-sm text-muted-foreground">
                    Orders can be canceled within 2 hours of placement. After that, the order enters production and
                    cannot be canceled.
                  </p>
                </div>
              </div>

              <Link href="/company-policy/faq" className="text-yellow-600 hover:text-yellow-700 transition-colors mt-6">
                View all FAQs
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-muted/40">
        <div className="container flex flex-col gap-6 py-8 md:py-12">
          <div className="flex flex-col gap-4 sm:flex-row items-center justify-between">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} PrintEasy. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link
                href="/company-policy/privacy-policy"
                className="text-xs text-muted-foreground hover:text-yellow-500 transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/company-policy/terms-condition"
                className="text-xs text-muted-foreground hover:text-yellow-500 transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/company-policy/cookie-policy"
                className="text-xs text-muted-foreground hover:text-yellow-500 transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

