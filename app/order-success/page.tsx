"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function OrderSuccess() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("id")
  const [orderDetails, setOrderDetails] = useState(null)
  const [loadingOrder, setLoadingOrder] = useState(true)

  useEffect(() => {
    // Check if the user is authenticated
    if (!loading && !user) {
      router.push("/auth/login")
      return
    }

    // Fetch order details if we have an ID
    const fetchOrderDetails = async () => {
      if (!orderId || !user) return

      try {
        const orderDoc = await getDoc(doc(db, "orders", orderId))
        if (orderDoc.exists() && orderDoc.data().userId === user.uid) {
          setOrderDetails({
            id: orderDoc.id,
            ...orderDoc.data(),
          })
        }
      } catch (error) {
        console.error("Error fetching order:", error)
      } finally {
        setLoadingOrder(false)
      }
    }

    if (user && orderId) {
      fetchOrderDetails()
    } else {
      setLoadingOrder(false)
    }
  }, [user, loading, router, orderId])

  if (loading || loadingOrder) {
    return (
      <main className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
          <p className="font-inter text-gray-600 text-lg mt-4">Loading...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-gray-100 min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="font-poppins text-3xl text-gray-900 font-bold mb-4">Order Placed Successfully!</h1>

        {orderDetails ? (
          <div className="mb-6 text-left bg-gray-50 p-4 rounded-lg">
            <p className="font-medium text-gray-700 mb-2">Order Details:</p>
            <p className="text-sm text-gray-600">
              Order ID: <span className="font-medium">{orderDetails.id}</span>
            </p>
            <p className="text-sm text-gray-600">
              Amount: <span className="font-medium">₹{orderDetails.totalAmount.toFixed(2)}</span>
            </p>
            {orderDetails.paymentId && (
              <p className="text-sm text-gray-600">
                Payment ID: <span className="font-medium">{orderDetails.paymentId}</span>
              </p>
            )}
            <p className="text-sm text-gray-600 mt-2">
              We've sent a confirmation email to{" "}
              <span className="font-medium">{orderDetails.shippingDetails?.email}</span>
            </p>
          </div>
        ) : (
          <p className="font-inter text-gray-600 mb-6">
            Thank you for your order. We have received your payment and your order is being processed.
          </p>
        )}

        <p className="font-inter text-gray-600 mb-8">You can track your order status from your dashboard.</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="inline-block bg-yellow-400 text-gray-900 font-inter text-lg px-8 py-3 rounded-lg shadow-md hover:bg-opacity-80 transition-colors"
          >
            Go to Dashboard
          </Link>

          <Link
            href="/upload"
            className="inline-block bg-transparent border-2 border-blue-400 text-blue-400 font-inter text-lg px-8 py-3 rounded-lg hover:bg-blue-400 hover:text-white transition-colors"
          >
            Place Another Order
          </Link>
        </div>
      </div>
    </main>
  )
}

