"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/AuthContext"
import { ORDER_STATUSES, ORDER_STATUS_COLORS, type OrderStatus } from "@/lib/orderStatuses"
import Link from "next/link"

type OrderItem = {
  files: Array<{
    name: string
    downloadURL: string
    publicId: string
    pageCount: number
  }>
  totalPrice: number
  quantity: number
  customizations?: Array<{
    copies?: number
    paperType?: string
    paperSize?: string
    colorMode?: string
    printingSides?: string
    bindingOption?: string
    coverOption?: string
  }>
}

type OrderNote = {
  text: string
  timestamp: string
  isAdminOnly: boolean
}

type OrderStatusLog = {
  status: OrderStatus
  timestamp: string
}

type Order = {
  id: string
  userId: string
  items: OrderItem[]
  totalAmount: number
  status: OrderStatus
  createdAt: string
  shippingDetails: {
    name: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    pincode: string
  }
  paymentId?: string
  paymentTime?: string
  statusLog?: OrderStatusLog[]
  notes?: OrderNote[]
}

export default function OrderDetail({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, authLoading, router])

  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      if (!user) return

      try {
        const orderDoc = await getDoc(doc(db, "orders", params.id))

        if (orderDoc.exists()) {
          const orderData = orderDoc.data()

          // Verify that the order belongs to the current user
          if (orderData.userId !== user.uid) {
            console.error("Unauthorized access to order")
            router.push("/dashboard")
            return
          }

          setOrder({
            id: orderDoc.id,
            ...orderData,
          } as Order)
        } else {
          console.error("Order not found")
          router.push("/dashboard")
        }
      } catch (error) {
        console.error("Error fetching order:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user && !authLoading) {
      fetchOrder()
    }
  }, [params.id, user, authLoading, router])

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

  if (authLoading || loading) {
    return (
      <main className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
          <p className="font-inter text-gray-600 text-lg mt-4">Loading order details...</p>
        </div>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Order Not Found</h2>
          <p className="text-gray-500 mb-4">The order you're looking for doesn't exist or has been removed.</p>
          <Link
            href="/dashboard"
            className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg shadow hover:bg-yellow-500 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-gray-100 min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 flex items-center mb-2">
              ← Back to Dashboard
            </Link>
            <h1 className="font-poppins text-3xl md:text-4xl text-gray-900 font-semibold">Order Details</h1>
          </div>
          <span
            className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${ORDER_STATUS_COLORS[order.status || "new"]}`}
          >
            {ORDER_STATUSES[order.status || "new"]}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="font-poppins text-xl text-gray-900 font-semibold mb-4">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-inter text-gray-600">Order ID:</span>
                  <span className="font-inter text-gray-900">{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-inter text-gray-600">Order Date:</span>
                  <span className="font-inter text-gray-900">{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-inter text-gray-600">Total Amount:</span>
                  <span className="font-inter text-gray-900 font-semibold">₹{order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-inter text-gray-600">Payment ID:</span>
                  <span className="font-inter text-gray-900">{order.paymentId || "N/A"}</span>
                </div>
                {order.paymentTime && (
                  <div className="flex justify-between">
                    <span className="font-inter text-gray-600">Payment Time:</span>
                    <span className="font-inter text-gray-900">{formatDate(order.paymentTime)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="font-poppins text-xl text-gray-900 font-semibold mb-4">Order Items</h2>
              <div className="space-y-6">
                {order.items.map((item, index) => (
                  <div key={index} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <p className="font-inter text-gray-700 font-medium mb-2">
                      Item #{index + 1}: {item.files.length} file(s)
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      {item.files.map((file, fileIndex) => (
                        <div key={fileIndex} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-start space-x-3 mb-3">
                            <div className="aspect-w-3 aspect-h-4 w-20 flex-shrink-0">
                              {file.downloadURL ? (
                                <img
                                  src={file.downloadURL || "/placeholder.svg"}
                                  alt={file.name}
                                  className="object-cover rounded-md"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full bg-gray-200 rounded-md">
                                  <p className="text-gray-500 text-xs text-center">No preview</p>
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">{file.pageCount} pages</p>

                              {/* File customization details */}
                              {item.customizations && item.customizations[fileIndex] && (
                                <div className="mt-2 text-xs text-gray-600 space-y-1">
                                  <p>Copies: {item.customizations[fileIndex].copies || 1}</p>
                                  <p>Paper: {item.customizations[fileIndex].paperType || "75GSM"}</p>
                                  <p>Size: {item.customizations[fileIndex].paperSize || "A4"}</p>
                                  <p>
                                    Color:{" "}
                                    {item.customizations[fileIndex].colorMode === "color" ? "Color" : "Black & White"}
                                  </p>
                                  <p>
                                    Sides:{" "}
                                    {item.customizations[fileIndex].printingSides === "doubleSided"
                                      ? "Double-sided"
                                      : "Single-sided"}
                                  </p>
                                  <p>
                                    Binding:{" "}
                                    {item.customizations[fileIndex].bindingOption === "softCover"
                                      ? "Soft Cover"
                                      : "None"}
                                  </p>
                                  <p>
                                    Cover:{" "}
                                    {item.customizations[fileIndex].coverOption === "thickColorCover"
                                      ? "Thick Color Cover"
                                      : "None"}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          {file.downloadURL && (
                            <a
                              href={file.downloadURL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 text-xs bg-blue-500 text-white px-2 py-1 rounded flex items-center justify-center"
                            >
                              Download
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Price:</span>
                      <span className="text-gray-900">₹{item.totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status History */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="font-poppins text-xl text-gray-900 font-semibold mb-4">Order Status</h2>

              {/* Status Timeline */}
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                {order.statusLog && order.statusLog.length > 0 ? (
                  <div className="space-y-6">
                    {order.statusLog.map((log, index) => (
                      <div key={index} className="relative flex items-start ml-5 pl-6">
                        <div className="absolute left-0 -translate-x-1/2 h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                          <span className="text-yellow-600 text-lg">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            <span
                              className={`inline-flex px-2 text-xs leading-5 font-semibold rounded-full ${ORDER_STATUS_COLORS[log.status]}`}
                            >
                              {ORDER_STATUSES[log.status]}
                            </span>
                          </p>
                          <p className="text-sm text-gray-500">{formatDate(log.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="relative flex items-start ml-5 pl-6">
                    <div className="absolute left-0 -translate-x-1/2 h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <span className="text-yellow-600 text-lg">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        <span
                          className={`inline-flex px-2 text-xs leading-5 font-semibold rounded-full ${ORDER_STATUS_COLORS[order.status || "new"]}`}
                        >
                          {ORDER_STATUSES[order.status || "new"]}
                        </span>
                      </p>
                      <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Notes (visible to customer) */}
            {order.notes && order.notes.filter((note) => !note.isAdminOnly).length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="font-poppins text-xl text-gray-900 font-semibold mb-4">Order Notes</h2>
                <div className="space-y-4">
                  {order.notes
                    .filter((note) => !note.isAdminOnly)
                    .map((note, index) => (
                      <div key={index} className="p-3 rounded-lg bg-blue-50">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-medium text-blue-600">Note</span>
                          <span className="text-xs text-gray-500">{formatDate(note.timestamp)}</span>
                        </div>
                        <p className="text-gray-800">{note.text}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Shipping Info */}
          <div className="space-y-6">
            {/* Shipping Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="font-poppins text-xl text-gray-900 font-semibold mb-4">Shipping Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{order.shippingDetails.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{order.shippingDetails.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{order.shippingDetails.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{order.shippingDetails.address}</p>
                  <p className="font-medium">
                    {order.shippingDetails.city}, {order.shippingDetails.state} - {order.shippingDetails.pincode}
                  </p>
                </div>
              </div>
            </div>

            {/* Need Help */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="font-poppins text-xl text-gray-900 font-semibold mb-4">Need Help?</h2>
              <p className="text-gray-600 mb-4">
                If you have any questions or concerns about your order, please contact our customer support.
              </p>
              <a
                href="mailto:support@printeasy.com"
                className="block w-full text-center bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg shadow hover:bg-yellow-500 transition-colors"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

