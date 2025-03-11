"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { SupportButton } from "@/components/support-button"
import { Printer, Users, Award, TrendingUp, Clock, Heart, ChevronRight } from "lucide-react"
import { motion, useInView, useAnimation } from "framer-motion"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function About() {
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.3 })

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [controls, isInView])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  }

  const teamMembers = [
    {
      name: "Utkarsh Verma",
      role: "Founder & CEO",
      image: "/placeholder.svg?height=100&width=100",
      bio: "Utkarsh founded PrintEasy with a vision to make custom printing accessible to everyone.",
    }
  ]

  const testimonials = [
    {
      name: "Ashutosh",
      company: "Delhi University Student",
      image: "/placeholder.svg?height=40&width=40",
      quote:
        "PrintEasy has transformed how we handle merchandise for our clients. The quality is exceptional and the turnaround time is impressive.",
    },
    {
      name: "Ansh Singh",
      company: "Trader",
      image: "/placeholder.svg?height=40&width=40",
      quote:
        "As a self-published author, I needed a reliable printing service for my books. PrintEasy delivered beyond my expectations with beautiful print quality.",
    },
    {
      name: "Robert Chen",
      company: "Event Organizer",
      image: "/placeholder.svg?height=40&width=40",
      quote:
        "We've used PrintEasy for all our event merchandise and promotional materials. Their service is consistently excellent.",
    },
  ]

  return (
    <div className="container mx-auto px-4 md:px-6">
      <main className="flex-1">
        <section className="py-12 md:py-24 bg-muted/30">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center space-y-4 mb-12"
            >
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Our Journey</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Small Startup with AIM to simplify all your printing Needs.
              </p>
            </motion.div>

            <div className="relative">
              <div className="absolute left-1/2 -ml-px h-full w-0.5 bg-yellow-200"></div>

              <div className="space-y-12">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="flex items-center">
                    <div className="absolute left-1/2 -ml-3 h-6 w-6 rounded-full bg-yellow-500"></div>
                    <div className="w-1/2 pr-8 text-right">
                      <div className="p-4 rounded-lg bg-card shadow-sm border">
                        <h3 className="text-lg font-bold">2023</h3>
                        <h4 className="font-medium">The Beginning</h4>
                        <p className="text-sm text-muted-foreground mt-2">
                        PrintEasy was founded with a clear mission: to make high-quality printing accessible to school students. What began as a side project during end-semester board exams has now evolved into a startup.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="flex items-center">
                    <div className="absolute left-1/2 -ml-3 h-6 w-6 rounded-full bg-yellow-500"></div>
                    <div className="w-1/2"></div>
                    <div className="w-1/2 pl-8">
                      <div className="p-4 rounded-lg bg-card shadow-sm border">
                        <h3 className="text-lg font-bold">2024</h3>
                        <h4 className="font-medium">Orders</h4>
                        <p className="text-sm text-muted-foreground mt-2">
                        Having delivered offline orders worth more than ₹5,000, I realized for the first time that I could take this business online and expand it across India.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="flex items-center">
                    <div className="absolute left-1/2 -ml-3 h-6 w-6 rounded-full bg-yellow-500"></div>
                    <div className="w-1/2 pr-8 text-right">
                      <div className="p-4 rounded-lg bg-card shadow-sm border">
                        <h3 className="text-lg font-bold">2025</h3>
                        <h4 className="font-medium">Innovation</h4>
                        <p className="text-sm text-muted-foreground mt-2">
                        I built this platform, integrating a payment gateway and an upload button to seamlessly take orders from users.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center space-y-4 mb-12"
            >
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Meet Our Team</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                The passionate people behind PrintEasy who make it all happen.
              </p>
            </motion.div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10, transition: { duration: 0.3 } }}
                >
                  <Card className="overflow-hidden h-full">
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={member.image || "/placeholder.svg"}
                        alt={member.name}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-110"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle>{member.name}</CardTitle>
                      <CardDescription>{member.role}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{member.bio}</p>
                    </CardContent>
                    <CardFooter className="flex justify-center gap-4">
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <svg
                          className="h-5 w-5 text-muted-foreground"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                        </svg>
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <svg
                          className="h-5 w-5 text-muted-foreground"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 md:py-24 bg-muted/30">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center space-y-4 mb-12"
            >
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">What Our Customers Say</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Don't just take our word for it. Here's what our customers have to say.
              </p>
            </motion.div>

            <Carousel className="w-full max-w-4xl mx-auto">
              <CarouselContent>
                {testimonials.map((testimonial, index) => (
                  <CarouselItem key={index}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      viewport={{ once: true }}
                      className="p-6 rounded-lg bg-card shadow-sm border text-center"
                    >
                      <div className="mb-6">
                        <svg
                          className="h-8 w-8 text-yellow-500 mx-auto"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                        </svg>
                      </div>
                      <p className="text-lg mb-6 italic">{testimonial.quote}</p>
                      <div className="flex items-center justify-center gap-3">
                        <Avatar>
                          <AvatarImage src={testimonial.image} alt={testimonial.name} />
                          <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                          <p className="font-medium">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                        </div>
                      </div>
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-center mt-6 gap-2">
                <CarouselPrevious className="relative inset-0 translate-y-0" />
                <CarouselNext className="relative inset-0 translate-y-0" />
              </div>
            </Carousel>
          </div>
        </section>

        <section className="py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row gap-8 md:gap-12 items-center"
            >
            
             
            </motion.div>
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

