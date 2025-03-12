"use client"

import { useState, useEffect, useRef } from "react"
import { FiMessageCircle, FiX, FiSend, FiMail } from "react-icons/fi"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function ChatbotButton() {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi there! I'm your PrintEasy assistant. How can I help you today?",
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [streamingResponse, setStreamingResponse] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    // Hide on checkout and upload pages
    if (pathname?.includes("/checkout") || pathname?.includes("/upload")) {
      setIsVisible(false)
    } else {
      setIsVisible(true)
    }
  }, [pathname])

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, streamingResponse])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!input.trim()) return

    // Add user message
    const userMessage = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)
    setIsStreaming(true)
    setStreamingResponse("")

    try {
      // Comprehensive responses for a printing startup
      const responses = {
        // General queries
        hello: "Hello! Welcome to PrintEasy. How can I help you with your printing needs today?",
        hi: "Hi there! I'm your PrintEasy assistant. How can I assist you with your printing order?",
        help: "I can help you with information about our printing services, pricing, order process, file requirements, and more. What would you like to know about?",

        // Services
        services:
          "We offer a wide range of printing services including document printing, thesis binding, custom t-shirts, stationery, gift items, posters, banners, business cards, and more. What specific service are you interested in?",
        "what do you print":
          "We print almost everything! Documents, theses, reports, posters, banners, t-shirts, business cards, invitations, greeting cards, stationery, and custom gift items. What would you like to print?",

        // Pricing
        pricing:
          "Our pricing varies based on paper type, color options, and binding. For standard black and white printing, we charge ₹2 per page for 75GSM paper. Color printing starts at ₹10 per page. Premium paper options and binding are available at additional cost. Would you like a specific price quote?",
        cost: "Our pricing starts at ₹2 per page for black & white printing on 75GSM paper. Color printing costs ₹10 per page. Binding options range from ₹30-100 depending on the type. For custom items like t-shirts, prices start at ₹299. Can I help you calculate the cost for a specific order?",
        price:
          "Our basic pricing: B&W printing - ₹2/page, Color printing - ₹10/page, Soft cover binding - ₹30, Hard cover binding - ₹100, T-shirts - from ₹299. Would you like to know the price for something specific?",

        // Delivery
        delivery:
          "We typically deliver orders within 24-48 hours after payment confirmation. For larger orders, it might take up to 3-4 business days. You can track your order status from your dashboard. Express delivery is available for an additional fee.",
        shipping:
          "We offer doorstep delivery across the city. Standard delivery takes 24-48 hours and costs ₹40. Express delivery (same-day) is available for ₹100 within city limits. You can also pick up your order from our store at no extra cost.",
        "how long":
          "Most standard orders are ready within 24 hours. Larger orders or custom items may take 2-3 business days. Express service is available for urgent orders at an additional cost. Would you like to place an express order?",

        // Contact
        contact:
          "You can reach our customer support team at contactutkarshverma@gmail.com or call us at +91-9876543210. Our support hours are 9 AM to 8 PM, Monday through Saturday. Would you like me to redirect you to send an email?",
        support:
          "Our support team is available via email at contactutkarshverma@gmail.com, phone at +91-9876543210, or through this chat. For urgent matters, calling is recommended. How would you like to contact us?",
        location:
          "Our main store is located at 123 College Road, near University Campus. We're open from 9 AM to 8 PM, Monday through Saturday. You can also place orders online for delivery or pickup.",

        // File upload
        upload:
          "To upload your files, go to the Upload page from the navigation menu. You can upload PDF, JPG, or PNG files up to 10MB each. After uploading, you'll be able to customize your printing options like paper type, color, and binding.",
        "file format":
          "We accept PDF, JPG, PNG, DOCX, and PPTX files. For best results, we recommend converting your documents to PDF before uploading. This ensures your formatting remains consistent. Need help converting your files?",
        "file size":
          "You can upload files up to 10MB each. If your file is larger, consider compressing it or splitting it into multiple files. For very large files, please contact our support team for alternative upload options.",

        // Paper options
        paper:
          "We offer several paper options: 75GSM (standard), 85GSM (premium), 100GSM (high quality), and 300GSM (card stock). The GSM number refers to the paper weight - higher numbers mean thicker paper. What type of document are you printing?",
        "paper type":
          "Our paper options include: 75GSM (ideal for regular documents), 85GSM (better quality for double-sided printing), 100GSM (premium feel for important documents), and 300GSM (card stock for covers). Which would you prefer?",
        gsm: "GSM stands for 'grams per square meter' and measures paper thickness. We offer 75GSM (standard), 85GSM (premium), 100GSM (high quality), and 300GSM (card stock). Higher GSM means thicker, more premium paper.",

        // Color options
        color:
          "We offer both black & white and color printing. Black & white is ₹2 per page, while color printing is ₹10 per page. For documents with mixed pages, we can print specific pages in color and the rest in black & white to save costs.",
        "black and white":
          "Our black & white printing costs ₹2 per page on standard 75GSM paper. It's perfect for text-heavy documents like reports, assignments, and notes. Would you like to upload your document for black & white printing?",
        colored:
          "Our color printing costs ₹10 per page and provides vibrant, high-quality results. It's ideal for presentations, posters, and documents with images or charts. Would you like to see some samples of our color printing?",

        // Binding options
        binding:
          "We offer several binding options including no binding (loose sheets), stapling (free for up to 30 pages), spiral binding (₹50), soft cover binding (₹30), and hard cover binding (₹100). The best choice depends on your document type and usage.",
        "spiral binding":
          "Spiral binding costs ₹50 and is great for documents that need to lay flat when open. It's popular for manuals, cookbooks, and presentations. Available in black, white, or blue spiral colors.",
        "soft cover":
          "Soft cover binding costs ₹30 and gives your document a professional look with a flexible cover. It's perfect for reports, theses, and presentations. We offer various cover color options.",
        "hard cover":
          "Hard cover binding costs ₹100 and provides the most professional and durable finish. It's ideal for theses, important reports, and books. We offer embossing of title and name on the cover for an additional ₹50.",

        // Order management
        order:
          "You can check your order status by going to your Dashboard. There you'll see all your orders and their current status. You can also view order details, download your files, and contact support if needed.",
        track:
          "To track your order, log in to your account and go to the Dashboard. You'll see all your orders with their current status. We also send email notifications when your order status changes.",
        status:
          "Order statuses include: Pending (awaiting payment), Paid (payment received), Processing (preparing your order), Quality Check, Packaging, Shipped, and Delivered. You can see the current status in your Dashboard.",

        // Cancellation and refunds
        cancel:
          "You can cancel an order if it hasn't entered the processing stage. Go to your order details page and look for the cancel option. If your order is already in processing, please contact customer support for assistance.",
        refund:
          "Refunds are processed within 5-7 business days after a cancellation is approved. The amount will be credited back to your original payment method. For partial refunds or special cases, please contact our support team.",
        return:
          "We accept returns for quality issues within 3 days of delivery. Please take photos of the issue and submit them through the complaint section in your profile. Our team will review and process your return request promptly.",

        // Complaints
        complaint:
          "You can submit a complaint through your profile page. Click on your profile, then select 'Complaints' and follow the instructions to submit a new complaint. You can attach images and select the order related to your complaint.",
        "quality issue":
          "We're sorry to hear about quality issues. Please submit a complaint through your profile page with photos of the issue. Our quality team will review it and offer a solution, which may include reprinting or refunding your order.",
        "not satisfied":
          "Customer satisfaction is our priority. If you're not happy with your order, please submit a complaint with details about the issue. We'll work with you to make it right, whether through reprinting, partial refund, or other solutions.",

        // Special products
        tshirt:
          "Yes, we offer custom t-shirt printing! You can upload your design and choose from various t-shirt sizes and colors. Prices start at ₹299 per t-shirt. We use high-quality direct-to-garment printing for vibrant, long-lasting results.",
        gift: "We have a variety of personalized gift options including custom mugs (₹199), photo frames (₹249), personalized notebooks (₹149), and custom calendars (₹299). For Valentine's Day, we're currently offering a 20% discount on all gift items!",
        valentine:
          "For Valentine's Day, we have special customized gift options including photo books (₹499), custom cards (₹99), personalized mugs (₹199), and t-shirts with your design (₹299). All Valentine's items are currently 20% off!",
        stationery:
          "We offer custom stationery including notebooks (₹149), planners (₹199), geometry boxes (₹99), and school supplies. You can personalize them with names, designs, or school logos. Bulk orders for schools get a 15% discount.",

        // Handwritten notes
        handwritten:
          "Yes, we can print your handwritten notes! Simply scan or take clear photos of your notes and upload them through our Upload page. We recommend using our scanning tips for best results: ensure good lighting, flatten the pages, and capture the entire page. Would you like me to guide you through the upload process?",
        notes:
          "We can definitely print your handwritten notes! Just take clear photos or scan your notes and upload them through our Upload page. For best quality, make sure your images are well-lit and the text is clearly visible. We recommend using our black & white printing for notes to keep costs low. Would you like to start uploading now?",
        scan: "To scan handwritten notes, you can use your smartphone camera. Make sure you have good lighting, the paper is flat, and the camera is directly above the page. Several scanning apps like Adobe Scan or Microsoft Office Lens can help improve quality. Once scanned, save as PDF and upload to our site.",

        // Bulk orders
        bulk: "We offer special discounts for bulk orders: 10% off for 100+ pages, 15% off for 500+ pages, and 20% off for 1000+ pages. For very large orders, please contact us directly for a custom quote. Bulk orders may require additional processing time.",
        discount:
          "We offer various discounts: 10% for students (with ID), 10% for bulk orders (100+ pages), 15% for returning customers, and seasonal promotions like our current 20% Valentine's Day discount. Sign up for our newsletter to stay updated on special offers!",
        corporate:
          "We offer corporate printing services with volume discounts, invoicing options, and priority processing. We can print business cards, letterheads, brochures, presentation materials, and more. Please contact our corporate sales team for a customized quote.",

        // Payment
        payment:
          "We accept various payment methods including credit/debit cards, UPI, net banking, and wallet payments through our secure Razorpay gateway. All transactions are encrypted and secure. Payment must be completed before your order is processed.",
        razorpay:
          "We use Razorpay as our payment processor, which supports all major credit/debit cards, UPI, net banking, and popular wallets. It's completely secure and provides instant payment confirmation so we can start processing your order right away.",

        // Calculator
        calculator:
          "Our pricing calculator is simple: For documents, base price is ₹2 per page (B&W) or ₹10 per page (color). Add ₹0.50 per page for 85GSM paper. Binding costs ₹30 extra for soft cover. For a 100-page document in B&W with soft cover binding, that would be ₹2 × 100 + ₹30 = ₹230. Would you like to calculate a specific order?",

        // Printing process
        process:
          "Our printing process is simple: 1) Upload your files, 2) Customize options like paper type and binding, 3) Pay securely online, 4) We print and quality-check your order, 5) Your order is delivered or ready for pickup. You can track the status at each step through your dashboard.",
        quality:
          "We maintain high quality standards with commercial-grade printers and premium papers. Each order undergoes a quality check before packaging. If you're not satisfied with the quality, you can submit a complaint and we'll make it right.",

        // Print specific documents
        thesis:
          "We specialize in thesis printing and binding! We recommend 85GSM paper with hard cover binding for durability. We can print in color or B&W, and offer gold embossing for the cover. Standard turnaround time for thesis orders is 2-3 business days.",
        report:
          "For reports, we recommend 75GSM or 85GSM paper with spiral or soft cover binding. Black & white printing is cost-effective for text-heavy reports, with color pages for charts and graphs. We can help you set up your file for mixed color/B&W printing.",
        poster:
          "We print high-quality posters on 170GSM glossy or matte paper. Sizes range from A3 to A0, with prices starting at ₹199 for A3. For academic conference posters, we offer templates and design assistance if needed.",
        "business card":
          'Our business cards are printed on premium 300GSM card stock with options for matte or glossy finish. Standard size is 3.5" × 2". Prices start at ₹250 for 100 cards. We offer design services if you don\'t have a ready design.',
        invitation:
          "We create beautiful custom invitations for weddings, birthdays, and events. Printed on premium card stock with envelope options. Prices start at ₹15 per card with minimum order of 25 cards. Custom designs available for an additional fee.",
        book: "We can print and bind books with various binding options. For novels or text-heavy books, we recommend 75GSM paper with soft cover binding. For photo books or coffee table books, we use 170GSM glossy paper with hard cover binding.",

        // Print specific formats
        pdf: "PDF is our preferred format as it preserves your formatting exactly. Make sure your PDF is set to the correct page size (A4 is standard). If your PDF has security restrictions, please remove them before uploading.",
        word: "We accept Word documents (.docx). When uploading Word files, we'll convert them to PDF for printing. Please note that some formatting might change slightly during conversion. For precise control, consider converting to PDF yourself before uploading.",
        ppt: "We can print PowerPoint presentations. For best results, set your slide size to match the paper size you want (e.g., A4). You can choose to print 1, 2, 4, or 6 slides per page. Color printing is recommended for presentations.",
        jpg: "We accept JPG images for printing. For best quality, ensure your images are at least 300 DPI. Low-resolution images may appear pixelated when printed. We can print photos on glossy or matte photo paper for an additional fee.",

        // Specific printing questions
        "double sided":
          "Yes, we offer double-sided (duplex) printing. It's great for saving paper and reducing the weight of documents. There's no extra charge for double-sided printing. You can select this option during the customization step after uploading.",
        "page size":
          "Our standard printing is on A4 paper (210 × 297mm). We also offer A5, A3, and custom sizes for special requirements. Please specify your preferred size during the customization step after uploading your files.",
        margin:
          "We recommend at least 10mm margins on all sides of your document for best results. Very small margins might get cut off during printing or binding. If your document has important content near the edges, please adjust the margins before uploading.",

        // Default response for unmatched queries
        default:
          "I'd be happy to help with that. As your PrintEasy assistant, I can provide information about our printing services, pricing, file requirements, or order process. Could you provide more details about what you're looking to print or what information you need?",
      }

      // Find the best matching response
      let bestMatch = responses["default"]
      const userQuery = input.toLowerCase()

      // Check for exact matches first
      for (const [key, value] of Object.entries(responses)) {
        if (userQuery === key) {
          bestMatch = value
          break
        }
      }

      // If no exact match, check for partial matches
      if (bestMatch === responses["default"]) {
        for (const [key, value] of Object.entries(responses)) {
          if (userQuery.includes(key)) {
            bestMatch = value
            break
          }
        }
      }

      // Simulate streaming
      let currentResponse = ""
      for (let i = 0; i < bestMatch.length; i++) {
        currentResponse += bestMatch[i]
        setStreamingResponse(currentResponse)
        await new Promise((resolve) => setTimeout(resolve, 15)) // Adjust speed as needed
      }

      // Add assistant message after streaming completes
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: "assistant", content: bestMatch }])
        setIsStreaming(false)
        setStreamingResponse("")
      }, 500)
    } catch (error) {
      console.error("Error generating response:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I encountered an error. Please try again.",
        },
      ])
      setIsStreaming(false)
      setStreamingResponse("")
    } finally {
      setIsTyping(false)
    }
  }

  const handleStopResponse = () => {
    setIsStreaming(false)
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: streamingResponse || "I'll stop here. Is there anything else you'd like to know?",
      },
    ])
    setStreamingResponse("")
  }

  return (
    <>
      {isVisible && (
        <>
          {/* Chat Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`fixed bottom-[70px] right-4 z-50 rounded-full shadow-lg p-4 ${
              isOpen ? "bg-red-500 text-white" : "bg-yellow-400 text-gray-900"
            }`}
          >
            {isOpen ? <FiX size={24} /> : <FiMessageCircle size={24} />}
          </button>

          {/* Chat Window */}
          {isOpen && (
            <div className="fixed bottom-[110px] right-10 w-80 sm:w-96 h-[500px] bg-white rounded-xl shadow-xl z-40 flex flex-col">
              {/* Chat Header */}
              <div className="bg-yellow-400 text-gray-900 p-4 rounded-t-xl">
                <div className="flex justify-between items-center">
                  <h3 className="font-poppins font-bold">PrintEasy Assistant</h3>
                  <button onClick={() => setIsOpen(false)} className="text-gray-900">
                    <FiX size={20} />
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === "user"
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-gray-100 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}

                {/* Streaming Response */}
                {isStreaming && streamingResponse && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] p-3 rounded-lg bg-gray-100 text-gray-800 rounded-bl-none">
                      {streamingResponse}
                    </div>
                  </div>
                )}

                {/* Typing Indicator */}
                {isTyping && !streamingResponse && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] p-3 rounded-lg bg-gray-100 text-gray-800 rounded-bl-none">
                      <div className="flex space-x-2">
                        <div
                          className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              <div className="px-4 py-2 border-t border-gray-200">
                <div className="flex flex-wrap gap-2 mb-2">
                  <button
                    onClick={() => {
                      setInput("What are your pricing options?")
                      setTimeout(() => handleSubmit({ preventDefault: () => {} }), 100)
                    }}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded-full"
                  >
                    Pricing
                  </button>
                  <button
                    onClick={() => {
                      setInput("How long does delivery take?")
                      setTimeout(() => handleSubmit({ preventDefault: () => {} }), 100)
                    }}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded-full"
                  >
                    Delivery
                  </button>
                  <button
                    onClick={() => {
                      setInput("How do I upload files?")
                      setTimeout(() => handleSubmit({ preventDefault: () => {} }), 100)
                    }}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded-full"
                  >
                    Upload
                  </button>
                  <button
                    onClick={() => {
                      setInput("Can you print handwritten notes?")
                      setTimeout(() => handleSubmit({ preventDefault: () => {} }), 100)
                    }}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded-full"
                  >
                    Notes
                  </button>
                </div>
              </div>

              {/* Email Contact */}
              <div className="px-4 py-2 border-t border-gray-200">
                <Link
                  href="mailto:contactutkarshverma@gmail.com"
                  className="flex items-center justify-center text-sm text-blue-500 hover:text-blue-600"
                >
                  <FiMail className="mr-1" /> Contact via Email
                </Link>
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  disabled={isTyping}
                />
                {isStreaming ? (
                  <button
                    type="button"
                    onClick={handleStopResponse}
                    className="bg-red-500 text-white px-4 py-2 rounded-r-lg"
                  >
                    Stop
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className={`bg-yellow-400 text-gray-900 px-4 py-2 rounded-r-lg ${
                      !input.trim() || isTyping ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <FiSend />
                  </button>
                )}
              </form>
            </div>
          )}
        </>
      )}
    </>
  )
}

