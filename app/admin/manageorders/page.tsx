"use client"

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
  items: any[]
  paymentId?: string
}

export default function ManageOrders() {
  const [activeTab, setActiveTab] = useState<"new" | "pending" | "processing" | "completed" | "cancelled">("new")
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Check admin auth on component mount
  useEffect(() => {
    const adminAuth = sessionStorage.getItem("adminAuth")
    if (adminAuth !== "true") {
      router.push("/admin")
    }
  }, [router])

  // Fetch orders based on active tab
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      try {
        let ordersQuery

        switch (activeTab) {
          case "new":
            // Orders created today that are paid
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            // For today's orders, we'll first get all orders from today
            // and then filter out the pending ones in JavaScript
            ordersQuery = query(
              collection(db, "orders"),
              where("createdAt", ">=", today.toISOString()),
              orderBy("createdAt", "desc"),
            )
            break
          case "pending":
            ordersQuery = query(
              collection(db, "orders"),
              where("status", "in", ["approved", "paid"]),
              orderBy("createdAt", "desc"),
            )
            break
          case "processing":
            ordersQuery = query(
              collection(db, "orders"),
              where("status", "in", ["processing", "quality_check", "packaging", "shipped"]),
              orderBy("createdAt", "desc"),
            )
            break
          case "completed":
            ordersQuery = query(
              collection(db, "orders"),
              where("status", "==", "delivered"),
              orderBy("createdAt", "desc"),
            )
            break
          case "cancelled":
            ordersQuery = query(
              collection(db, "orders"),
              where("status", "==", "cancelled"),
              orderBy("createdAt", "desc"),
            )
            break
          default:
            ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"))
        }

        const querySnapshot = await getDocs(ordersQuery)
        let fetchedOrders: Order[] = []

        querySnapshot.forEach((doc) => {
          fetchedOrders.push({
            id: doc.id,
            ...doc.data(),
          } as Order)
        })

        // For the "new" tab, filter out pending orders in JavaScript
        if (activeTab === "new") {
          fetchedOrders = fetchedOrders.filter(
            (order) => order.status !== "pending" && order.status !== "payment_failed",
          )
        }

        setOrders(fetchedOrders)
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [activeTab])

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
          <h1 className="font-poppins text-3xl text-gray-900 font-semibold">Order Management</h1>
          <div className="flex space-x-2">
            <Link
              href="/admin/search"
              className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow hover:bg-gray-50 transition-colors"
            >
              Search Orders
            </Link>
            <button
              onClick={() => {
                sessionStorage.removeItem("adminAuth")
                document.cookie = "adminAuth=; Max-Age=0; path=/;"
                router.push("/admin")
              }}
              className="bg-red-50 text-red-600 px-4 py-2 rounded-lg shadow hover:bg-red-100 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-xl shadow-sm mb-6">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab("new")}
              className={`px-6 py-3 font-inter text-sm font-medium whitespace-nowrap ${
                activeTab === "new" ? "border-b-2 border-yellow-400 text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              New Orders
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-6 py-3 font-inter text-sm font-medium whitespace-nowrap ${
                activeTab === "pending"
                  ? "border-b-2 border-yellow-400 text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Pending Orders
            </button>
            <button
              onClick={() => setActiveTab("processing")}
              className={`px-6 py-3 font-inter text-sm font-medium whitespace-nowrap ${
                activeTab === "processing"
                  ? "border-b-2 border-yellow-400 text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Processing Orders
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-6 py-3 font-inter text-sm font-medium whitespace-nowrap ${
                activeTab === "completed"
                  ? "border-b-2 border-yellow-400 text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Completed Orders
            </button>
            <button
              onClick={() => setActiveTab("cancelled")}
              className={`px-6 py-3 font-inter text-sm font-medium whitespace-nowrap ${
                activeTab === "cancelled"
                  ? "border-b-2 border-yellow-400 text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Cancelled Orders
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-b-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center p-12">
              <p className="font-inter text-gray-500">No orders found in this category.</p>
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
                      Payment ID
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.paymentId || "N/A"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link href={`/admin/orders/${order.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
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
      </div>
    </main>
  )
}

