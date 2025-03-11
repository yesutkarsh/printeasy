"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { collection, addDoc, doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { loadRazorpayScript, initializeRazorpayPayment } from "@/lib/razorpay"

export default function Checkout() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalAmount, setTotalAmount] = useState(0)
  const [paymentLoading, setPaymentLoading] = useState(false)

  // Form state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [pincode, setPincode] = useState("")

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchCart = async () => {
      try {
        // For now, we'll use localStorage
        // In a production app, you'd fetch from Firestore
        const storedCart = localStorage.getItem("cart")
        if (storedCart) {
          const cart = JSON.parse(storedCart)
          setCartItems(cart)

          // Calculate total amount
          const total = cart.reduce((sum, item) => sum + item.totalPrice, 0)
          setTotalAmount(total)

          // Pre-fill user data if available
          if (user) {
            const userDoc = await getDoc(doc(db, "users", user.uid))
            if (userDoc.exists()) {
              const userData = userDoc.data()
              setName(userData.name || "")
              setEmail(userData.email || "")
              setPhone(userData.phoneNumber || "")
            }
          }
        } else {
          router.push("/cart")
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching cart:", error)
        setLoading(false)
      }
    }

    if (user && !authLoading) {
      fetchCart()
    }
  }, [user, authLoading, router])

  // Add state for payment error
  const [paymentError, setPaymentError] = useState("")

  // Update the handleSubmit function to handle payment success/failure better
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (cartItems.length === 0) {
      alert("Your cart is empty!")
      return
    }
    setPaymentLoading(true)

    try {
      // Create order in Firestore
      const orderData = {
        userId: user.uid,
        items: cartItems,
        totalAmount,
        shippingDetails: {
          name,
          email,
          phone,
          address,
          city,
          state,
          pincode,
        },
        status: "pending", // Start with pending status
        createdAt: new Date().toISOString(),
      }

      const orderRef = await addDoc(collection(db, "orders"), orderData)

      // Load Razorpay script
      const isScriptLoaded = await loadRazorpayScript()
      if (!isScriptLoaded) throw new Error("Failed to load Razorpay script")

      // Create payment options via API
      const response = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalAmount,
          orderId: orderRef.id,
          name,
          email,
          phone,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create payment options")
      }

      const { paymentOptions } = await response.json()

      try {
        // Initialize Razorpay payment
        const paymentResponse = await initializeRazorpayPayment(paymentOptions)

        // Payment successful
        await updateDoc(doc(db, "orders", orderRef.id), {
          status: "paid",
          paymentId: paymentResponse.razorpay_payment_id,
          paymentTime: new Date().toISOString(),
          statusLog: [
            {
              status: "paid",
              timestamp: new Date().toISOString(),
            },
          ],
        })

        // Clear cart
        localStorage.removeItem("cart")

        // Redirect to success page
        router.push("/order-success?id=" + orderRef.id)
      } catch (paymentError) {
        // Payment failed or was cancelled
        console.error("Payment failed:", paymentError)

        // Update order status to payment_failed
        await updateDoc(doc(db, "orders", orderRef.id), {
          status: "payment_failed",
          paymentError: paymentError.message || "Payment was cancelled or failed",
        })

        // Show payment failure UI
        setPaymentLoading(false)
        setPaymentError(paymentError.message || "Payment failed. Please try again.")
      }
    } catch (error) {
      console.error("Checkout error:", error)
      setPaymentLoading(false)
      setPaymentError(error.message || "Failed to process checkout. Please try again.")
    }
  }

  if (authLoading || loading) {
    return (
      <main className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
          <p className="font-inter text-gray-600 text-lg mt-4">Loading checkout...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-gray-100 min-h-screen py-12 px-4">
      {/* Header Section */}
      <section className="max-w-6xl mx-auto mb-12">
        <h1 className="font-poppins text-4xl md:text-5xl text-gray-900 text-center font-semibold mb-4">Checkout</h1>
        <p className="font-inter text-lg md:text-xl text-gray-700 text-center max-w-2xl mx-auto">
          Complete your order with shipping details and payment!
        </p>
      </section>

      <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="font-poppins text-2xl text-gray-900 font-semibold mb-4">Order Summary</h2>
          <p className="font-inter text-gray-600 mb-2">Items: {cartItems.length}</p>
          <div className="mt-4 space-y-4">
            {cartItems.map((item, index) => (
              <div key={index} className="border-b border-gray-100 pb-4">
                <p className="font-inter text-gray-700 font-medium">
                  Order #{index + 1}: {item.files.length} file(s)
                </p>
                <p className="font-inter text-gray-600 text-sm">Price: ₹{item.totalPrice.toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="font-inter text-gray-900 font-semibold text-xl">Total: ₹{totalAmount.toFixed(2)}</p>
          </div>
        </div>

        {/* Shipping Form */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="font-poppins text-2xl text-gray-900 font-semibold mb-4">Shipping Information</h2>

            {/* Full Name */}
            <div>
              <label htmlFor="name" className="font-inter text-sm text-gray-700 font-medium block mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors font-inter text-gray-900"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="font-inter text-sm text-gray-700 font-medium block mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors font-inter text-gray-900"
                placeholder="Enter your email"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="font-inter text-sm text-gray-700 font-medium block mb-1">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors font-inter text-gray-900"
                placeholder="Enter your phone number"
              />
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="font-inter text-sm text-gray-700 font-medium block mb-1">
                Address
              </label>
              <textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors font-inter text-gray-900"
                placeholder="Enter your address"
                rows={3}
              />
            </div>

            {/* City */}
            <div>
              <label htmlFor="city" className="font-inter text-sm text-gray-700 font-medium block mb-1">
                City
              </label>
              <input
                id="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors font-inter text-gray-900"
                placeholder="Enter your city"
              />
            </div>

            {/* State */}
            <div>
              <label htmlFor="state" className="font-inter text-sm text-gray-700 font-medium block mb-1">
                State
              </label>
              <input
                id="state"
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors font-inter text-gray-900"
                placeholder="Enter your state"
              />
            </div>

            {/* Pincode */}
            <div>
              <label htmlFor="pincode" className="font-inter text-sm text-gray-700 font-medium block mb-1">
                Pincode
              </label>
              <input
                id="pincode"
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors font-inter text-gray-900"
                placeholder="Enter your pincode"
              />
            </div>

            {/* Payment */}
            <div>
              <h2 className="font-poppins text-2xl text-gray-900 font-semibold mb-2">Payment</h2>
              <p className="font-inter text-gray-600 mb-4">Payment will be processed securely via Razorpay.</p>
              {paymentError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{paymentError}</p>
                    </div>
                  </div>
                </div>
              )}
              <button
                type="submit"
                disabled={paymentLoading}
                className={`w-full bg-yellow-400 text-gray-900 font-inter text-lg px-8 py-4 rounded-lg shadow-md transition-colors ${
                  paymentLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-opacity-80"
                }`}
              >
                {paymentLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing Payment...
                  </span>
                ) : (
                  "Pay Now"
                )}
              </button>
              {paymentError && (
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white font-inter text-lg px-8 py-4 rounded-lg shadow-md hover:bg-blue-600 transition-colors mt-4"
                >
                  Retry Payment
                </button>
              )}
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}

