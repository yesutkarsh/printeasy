"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MessageSquare, CheckCircle2 } from "lucide-react"

export function SupportButton() {
  const [activeTab, setActiveTab] = useState("support")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false)
    }, 3000)
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative group">
          <MessageSquare className="h-5 w-5 text-yellow-500 group-hover:text-yellow-600 transition-colors" />
          <span className="sr-only">Open support</span>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-yellow-500" />
            <span>Customer Support</span>
          </SheetTitle>
          <SheetDescription>Get help or submit a complaint. Our team is here to assist you.</SheetDescription>
        </SheetHeader>
        <div className="py-6">
          <Tabs defaultValue="support" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="support">Support</TabsTrigger>
              <TabsTrigger value="complaint">Complaint</TabsTrigger>
            </TabsList>
            <TabsContent value="support" className="mt-4">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <div className="rounded-full bg-green-100 p-3">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-medium">Support Request Sent!</h3>
                  <p className="text-center text-muted-foreground">
                    Thank you for reaching out. Our team will get back to you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Enter your name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="Enter your email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="Enter subject" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" placeholder="How can we help you?" className="min-h-[120px]" required />
                  </div>
                  <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-black">
                    Submit Request
                  </Button>
                </form>
              )}
            </TabsContent>
            <TabsContent value="complaint" className="mt-4">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <div className="rounded-full bg-green-100 p-3">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-medium">Complaint Submitted!</h3>
                  <p className="text-center text-muted-foreground">
                    We take your concerns seriously. Our team will investigate and respond promptly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="complaint-name">Name</Label>
                    <Input id="complaint-name" placeholder="Enter your name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="complaint-email">Email</Label>
                    <Input id="complaint-email" type="email" placeholder="Enter your email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="order-id">Order ID (if applicable)</Label>
                    <Input id="order-id" placeholder="Enter order ID" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="complaint-type">Complaint Type</Label>
                    <select
                      id="complaint-type"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value="">Select complaint type</option>
                      <option value="product-quality">Product Quality</option>
                      <option value="shipping">Shipping & Delivery</option>
                      <option value="customer-service">Customer Service</option>
                      <option value="billing">Billing Issue</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="complaint-details">Complaint Details</Label>
                    <Textarea
                      id="complaint-details"
                      placeholder="Please describe your complaint in detail"
                      className="min-h-[120px]"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-black">
                    Submit Complaint
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

