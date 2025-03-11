"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { ORDER_STATUSES, ORDER_STATUS_COLORS, type OrderStatus } from "@/lib/orderStatuses"
import Link from "next/link"

type Order = {
  id: string
  userId: string
  totalAmount: number
  status: OrderStatus
  createdAt: string
  shippingDetails: {
    name: string
    email: string
    phone: string
  }
}

export default function SearchOrders() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchType, setSearchType] = useState<"email" | "orderId">("email")
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const router = useRouter()

  // Check admin auth on component mount
  useEffect(() => {
    const adminAuth = sessionStorage.getItem("adminAuth")
    if (adminAuth !== "true") {
      router.push("/admin")
    }
  }, [router])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchTerm.trim()) return

    setLoading(true)
    setOrders([])

    try {
      let ordersQuery

      if (searchType === "email") {
        // Search by customer email
        ordersQuery = query(
          collection(db, "orders"),
          where("shippingDetails.email", "==", searchTerm.trim()),
          orderBy("createdAt", "desc"),
        )
      } else {
        // Search by order ID
        // Since we can't do a direct ID search with Firestore query,
        // we'll fetch the specific document if it exists
        const orderDoc = await getDocs(collection(db, "orders"))
        const matchingOrders = orderDoc.docs.filter((doc) => doc.id.includes(searchTerm.trim()))

        if (matchingOrders.length > 0) {
          const fetchedOrders: Order[] = matchingOrders.map(
            (doc) =>
              ({
                id: doc.id,
                ...doc.data(),
              }) as Order,
          )

          setOrders(fetchedOrders)
          setSearched(true)
          setLoading(false)
          return
        } else {
          setOrders([])
          setSearched(true)
          setLoading(false)
          return
        }
      }

      const querySnapshot = await getDocs(ordersQuery)
      const fetchedOrders: Order[] = []

      querySnapshot.forEach((doc) => {
        fetchedOrders.push({
          id: doc.id,
          ...doc.data(),
        } as Order)
      })

      setOrders(fetchedOrders)
    } catch (error) {
      console.error("Error searching orders:", error)
    } finally {
      setLoading(false)
      setSearched(true)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <main className="bg-gray-100 min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link href="/admin/manageorders" className="text-blue-600 hover:text-blue-800 flex items-center mb-2">
              ← Back to Orders
            </Link>
            <h1 className="font-poppins text-3xl text-gray-900 font-semibold">Search Orders</h1>
          </div>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 mb-1">
                  Search Term
                </label>
                <input
                  id="searchTerm"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchType === "email" ? "Customer email address" : "Order ID"}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>
              <div className="md:w-48">
                <label htmlFor="searchType" className="block text-sm font-medium text-gray-700 mb-1">
                  Search By
                </label>
                <select
                  id="searchType"
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value as "email" | "orderId")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="email">Customer Email</option>
                  <option value="orderId">Order ID</option>
                </select>
              </div>
              <div className="md:w-32 md:self-end">
                <button
                  type="submit"
                  disabled={loading || !searchTerm.trim()}
                  className={`w-full px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg ${
                    loading || !searchTerm.trim() ? "opacity-50 cursor-not-allowed" : "hover:bg-yellow-500"
                  }`}
                >
                  {loading ? "Searching..." : "Search"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Search Results */}
        {searched && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <h2 className="font-poppins text-xl text-gray-900 font-semibold p-6 border-b border-gray-200">
              Search Results
            </h2>

            {loading ? (
              <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center p-12">
                <p className="font-inter text-gray-500">No orders found matching your search criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Order ID
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Customer
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Amount
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.id.slice(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>{order.shippingDetails.name}</div>
                          <div className="text-xs text-gray-400">{order.shippingDetails.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{order.totalAmount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ORDER_STATUS_COLORS[order.status || "new"]}`}
                          >
                            {ORDER_STATUSES[order.status || "new"]}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link href={`/admin/orders/${order.id}`} className="text-blue-600 hover:text-blue-900">
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

