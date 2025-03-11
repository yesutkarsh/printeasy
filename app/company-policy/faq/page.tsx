"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SupportButton } from "@/components/support-button"
import { Printer, ArrowLeft, Search, HelpCircle, ChevronDown, ChevronUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function page() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const faqCategories = [
    {
      category: "General",
      icon: <HelpCircle className="h-5 w-5" />,
      questions: [
        {
          question: "What is PrintEasy?",
          answer:
            "PrintEasy is a print on demand service that allows you to create custom printed products including t-shirts, books, mugs, and more without having to maintain inventory or handle shipping.",
        },
        {
          question: "How does print on demand work?",
          answer:
            "Print on demand is a process where items are printed only when an order is placed. This eliminates the need for inventory and minimizes waste. When you or your customer places an order, we print the product and ship it directly to the specified address.",
        },
        {
          question: "What products can I print with PrintEasy?",
          answer:
            "We offer a wide range of products including t-shirts, hoodies, books, mugs, phone cases, posters, canvas prints, and much more. Check our product catalog for a complete list of available items.",
        },
      ],
    },
    {
      category: "Orders & Shipping",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
          />
        </svg>
      ),
      questions: [
        {
          question: "How long does it take to process an order?",
          answer:
            "Most orders are processed within 1-3 business days. Production time may vary depending on the product type and order quantity.",
        },
        {
          question: "What are the shipping options and costs?",
          answer:
            "We offer standard and express shipping options. Shipping costs depend on the destination and the weight of the package. You can calculate shipping costs during checkout before placing your order.",
        },
        {
          question: "Can I track my order?",
          answer:
            "Yes, once your order ships, you will receive a tracking number via email that you can use to track your package.",
        },
      ],
    },
    {
      category: "Design & Printing",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
          />
        </svg>
      ),
      questions: [
        {
          question: "What file formats do you accept for printing?",
          answer:
            "We accept PNG, JPG, PDF, and SVG files. For best results, we recommend high-resolution files (at least 300 DPI) with transparent backgrounds for designs.",
        },
        {
          question: "Can you help me design my product?",
          answer:
            "Yes, we offer design services for customers who need assistance creating print-ready files. Contact our design team for more information and pricing.",
        },
        {
          question: "What if I'm not satisfied with the print quality?",
          answer:
            "We stand behind our print quality. If you're not satisfied with your order due to a printing error or defect, please contact us within 14 days of receiving your order for a replacement or refund.",
        },
      ],
    },
    {
      category: "Account & Billing",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      ),
      questions: [
        {
          question: "How do I create an account?",
          answer:
            "You can create an account by clicking the 'Sign Up' button on our homepage and following the registration process. You'll need to provide your email address and create a password.",
        },
        {
          question: "What payment methods do you accept?",
          answer:
            "We accept major credit cards (Visa, Mastercard, American Express), PayPal, and other electronic payment methods. All payments are processed securely.",
        },
        {
          question: "How can I update my billing information?",
          answer:
            "You can update your billing information by logging into your account, navigating to the 'Account Settings' section, and selecting 'Payment Methods'.",
        },
      ],
    },
  ]

  // Filter questions based on search query and active category
  const filteredFAQs = faqCategories
    .filter((category) => activeCategory === "all" || category.category === activeCategory)
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (q) =>
          searchQuery === "" ||
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((category) => category.questions.length > 0)

  // Focus search input on page load
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [])

  // Handle question expansion
  const toggleQuestion = (questionId: string) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId)
  }

  return (
    <div className="container mx-auto px-4 md:px-6">

     
      <main className="flex-1">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="py-12 md:py-16 bg-gradient-to-b from-yellow-50 to-white"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.2,
                }}
                className="rounded-full bg-yellow-100 p-3"
              >
                <motion.div
                  animate={{
                    rotate: [0, 10, 0, -10, 0],
                  }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 2,
                    ease: "easeInOut",
                  }}
                >
                  <HelpCircle className="h-8 w-8 text-yellow-600" />
                </motion.div>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl"
              >
                Frequently Asked Questions
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="max-w-[700px] text-muted-foreground md:text-xl"
              >
                Find answers to common questions about our print on demand services.
              </motion.p>
            </div>
          </div>
        </motion.section>

        <section className="py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-4xl space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="relative"
              >
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search for answers..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
                  <TabsList className="w-full justify-start mb-8 overflow-x-auto flex-nowrap">
                    <TabsTrigger value="all" className="px-4">
                      All
                    </TabsTrigger>
                    {faqCategories.map((category, index) => (
                      <TabsTrigger key={index} value={category.category} className="px-4 flex items-center gap-2">
                        <span className="hidden sm:inline-flex">{category.icon}</span>
                        <span>{category.category}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <TabsContent value={activeCategory} className="mt-0">
                    {filteredFAQs.length > 0 ? (
                      <motion.div
                        className="space-y-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {filteredFAQs.map((category, categoryIndex) => (
                          <motion.div
                            key={categoryIndex}
                            className="space-y-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
                          >
                            {activeCategory === "all" && (
                              <h2 className="text-xl font-bold flex items-center gap-2">
                                <div className="rounded-full bg-yellow-100 p-1.5">{category.icon}</div>
                                {category.category}
                              </h2>
                            )}
                            <div className="space-y-3">
                              {category.questions.map((item, questionIndex) => {
                                const questionId = `${categoryIndex}-${questionIndex}`
                                const isExpanded = expandedQuestion === questionId

                                return (
                                  <motion.div
                                    key={questionIndex}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: questionIndex * 0.05 }}
                                    className="rounded-lg border overflow-hidden"
                                  >
                                    <div
                                      className={`p-4 cursor-pointer flex justify-between items-center ${isExpanded ? "bg-yellow-50" : "bg-background"}`}
                                      onClick={() => toggleQuestion(questionId)}
                                    >
                                      <h3 className="font-medium">{item.question}</h3>
                                      <div className="shrink-0 ml-2">
                                        {isExpanded ? (
                                          <ChevronUp className="h-5 w-5 text-yellow-500" />
                                        ) : (
                                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                        )}
                                      </div>
                                    </div>
                                    <AnimatePresence>
                                      {isExpanded && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: "auto", opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          transition={{ duration: 0.3 }}
                                          className="overflow-hidden"
                                        >
                                          <div className="p-4 pt-0 border-t">
                                            <p className="text-muted-foreground">{item.answer}</p>
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </motion.div>
                                )
                              })}
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center justify-center py-12 text-center"
                      >
                        <div className="rounded-full bg-yellow-100 p-3 mb-4">
                          <motion.div
                            animate={{
                              rotate: [0, 10, 0, -10, 0],
                            }}
                            transition={{
                              repeat: Number.POSITIVE_INFINITY,
                              duration: 2,
                              ease: "easeInOut",
                            }}
                          >
                            <HelpCircle className="h-6 w-6 text-yellow-600" />
                          </motion.div>
                        </div>
                        <h3 className="text-xl font-medium mb-2">No results found</h3>
                        <p className="text-muted-foreground max-w-md">
                          We couldn't find any FAQs matching your search. Try using different keywords or browse our
                          categories.
                        </p>
                        <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>
                          Clear Search
                        </Button>
                      </motion.div>
                    )}
                  </TabsContent>
                </Tabs>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="rounded-lg border bg-muted/50 p-6 hover:shadow-md transition-shadow"
                whileHover={{ y: -5 }}
              >
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="rounded-full bg-yellow-100 p-3 shrink-0">
                    <motion.div
                      animate={{
                        rotate: [0, 10, 0, -10, 0],
                      }}
                      transition={{
                        repeat: Number.POSITIVE_INFINITY,
                        duration: 2,
                        ease: "easeInOut",
                      }}
                    >
                      <HelpCircle className="h-6 w-6 text-yellow-600" />
                    </motion.div>
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg font-medium mb-1">Still have questions?</h3>
                    <p className="text-muted-foreground mb-4">
                      Can't find the answer you're looking for? Please chat with our friendly team.
                    </p>
                    <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">Contact Support</Button>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="flex justify-center"
              >
                <Link
                  href="/"
                  className="flex items-center gap-2 text-yellow-600 hover:text-yellow-700 transition-colors group"
                >
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  <span>Back to Home</span>
                </Link>
              </motion.div>
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

