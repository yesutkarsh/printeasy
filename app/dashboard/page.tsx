"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = "/auth/login"
      return
    }
  }, [user, authLoading])

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return

      try {
        // Query orders from Firestore - only get paid orders
        // Instead of using multiple "!=" filters, use "in" with valid statuses
        const validStatuses = [
          "approved",
          "paid",
          "processing",
          "quality_check",
          "packaging",
          "shipped",
          "delivered",
          "cancelled",
        ]

        const ordersQuery = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
          where("status", "in", validStatuses),
          orderBy("createdAt", "desc"),
        )

        const querySnapshot = await getDocs(ordersQuery)
        const ordersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setOrders(ordersData)
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user && !authLoading) {
      fetchOrders()
    }
  }, [user, authLoading])

  if (authLoading) {
    return (
      <main className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </main>
    )
  }

  return (
    <main className="bg-gray-100 min-h-screen py-12 px-4">
      {/* Header Section */}
      <section className="max-w-6xl mx-auto mb-12">
        <h1 className="font-poppins text-4xl md:text-5xl text-gray-900 text-center font-semibold mb-4">
          Your Dashboard
        </h1>
        <p className="font-inter text-lg md:text-xl text-gray-700 text-center max-w-2xl mx-auto">
          Manage your print orders, upload new files, or check your cart—all in one place!
        </p>
      </section>

      {/* Action Buttons */}
      <section className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-6 justify-center mb-16">
        <Link
          href="/upload"
          className="bg-yellow-400 text-gray-900 font-inter text-lg px-8 py-4 rounded-lg hover:bg-opacity-80 transition-colors shadow-md text-center"
        >
          Create New Order
        </Link>
        <Link
          href="/cart"
          className="bg-transparent border-2 border-blue-400 text-blue-400 font-inter text-lg px-8 py-4 rounded-lg hover:bg-blue-400 hover:text-white transition-colors text-center"
        >
          View Cart
        </Link>
      </section>

      {/* Orders Section */}
      <section className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h2 className="font-poppins text-3xl text-gray-900 font-bold mb-6">Your Orders</h2>
        {loading ? (
          <p className="font-inter text-gray-600 text-center">Loading your orders...</p>
        ) : orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div>
                    <h3 className="font-poppins text-xl font-semibold">Order #{order.id.slice(0, 8)}</h3>
                    <p className="font-inter text-gray-600 text-sm">
                      {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} item(s)
                    </p>
                    {order.paymentId && (
                      <p className="font-inter text-xs text-gray-500">Payment ID: {order.paymentId}</p>
                    )}
                  </div>
                  <div className="mt-2 md:mt-0 flex items-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status === "processing"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <Link href={`/orders/${order.id}`} className="ml-4 text-blue-400 hover:text-blue-500 font-medium">
                      View Details
                    </Link>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="font-inter text-gray-900 font-medium">Total: ₹{order.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p className="font-inter text-gray-600 mb-4">
              You don't have any orders yet. Start by creating a new order!
            </p>
            <Link
              href="/upload"
              className="inline-block bg-blue-400 text-white font-inter text-lg px-6 py-2 rounded-lg hover:bg-blue-500 transition-colors shadow-md"
            >
              Upload Now
            </Link>
          </div>
        )}
      </section>
    </main>
  )
}

