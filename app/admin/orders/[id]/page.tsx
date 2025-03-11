"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { ORDER_STATUSES, ORDER_STATUS_COLORS, getNextStatuses, type OrderStatus } from "@/lib/orderStatuses"
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
  refundStatus?: "pending" | "processed"
  refundTransactionId?: string
  cancellationReason?: string
}

export default function OrderDetail({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusLoading, setStatusLoading] = useState(false)
  const [noteLoading, setNoteLoading] = useState(false)
  const [refundLoading, setRefundLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("")
  const [newNote, setNewNote] = useState("")
  const [isAdminOnly, setIsAdminOnly] = useState(true)
  const [refundTransactionId, setRefundTransactionId] = useState("")
  const router = useRouter()

  // Check admin auth on component mount
  useEffect(() => {
    const adminAuth = sessionStorage.getItem("adminAuth")
    if (adminAuth !== "true") {
      router.push("/admin")
    }
  }, [router])

  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderDoc = await getDoc(doc(db, "orders", params.id))

        if (orderDoc.exists()) {
          const orderData = {
            id: orderDoc.id,
            ...orderDoc.data(),
          } as Order

          setOrder(orderData)
          setSelectedStatus(orderData.status || "new")
        } else {
          console.error("Order not found")
          router.push("/admin/manageorders")
        }
      } catch (error) {
        console.error("Error fetching order:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [params.id, router])

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

  const handleStatusUpdate = async () => {
    if (!order || !selectedStatus || selectedStatus === order.status) return

    setStatusLoading(true)

    try {
      const orderRef = doc(db, "orders", order.id)
      const timestamp = new Date().toISOString()

      await updateDoc(orderRef, {
        status: selectedStatus,
        statusLog: arrayUnion({
          status: selectedStatus,
          timestamp,
        }),
      })

      // Update local state
      setOrder({
        ...order,
        status: selectedStatus,
        statusLog: [...(order.statusLog || []), { status: selectedStatus, timestamp }],
      })
    } catch (error) {
      console.error("Error updating status:", error)
      alert("Failed to update status. Please try again.")
    } finally {
      setStatusLoading(false)
    }
  }

  const handleAddNote = async () => {
    if (!order || !newNote.trim()) return

    setNoteLoading(true)

    try {
      const orderRef = doc(db, "orders", order.id)
      const timestamp = new Date().toISOString()

      const noteData = {
        text: newNote.trim(),
        timestamp,
        isAdminOnly,
      }

      await updateDoc(orderRef, {
        notes: arrayUnion(noteData),
      })

      // Update local state
      setOrder({
        ...order,
        notes: [...(order.notes || []), noteData],
      })

      // Reset form
      setNewNote("")
    } catch (error) {
      console.error("Error adding note:", error)
      alert("Failed to add note. Please try again.")
    } finally {
      setNoteLoading(false)
    }
  }

  const handleRefundUpdate = async () => {
    if (!order || !refundTransactionId.trim() || order.refundStatus === "processed") return

    setRefundLoading(true)

    try {
      const orderRef = doc(db, "orders", order.id)

      await updateDoc(orderRef, {
        refundStatus: "processed",
        refundTransactionId: refundTransactionId.trim(),
        refundProcessedAt: new Date().toISOString(),
      })

      // Update local state
      setOrder({
        ...order,
        refundStatus: "processed",
        refundTransactionId: refundTransactionId.trim(),
      })

      // Reset form
      setRefundTransactionId("")
    } catch (error) {
      console.error("Error updating refund status:", error)
      alert("Failed to update refund status. Please try again.")
    } finally {
      setRefundLoading(false)
    }
  }

  if (loading) {
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
            href="/admin/manageorders"
            className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg shadow hover:bg-yellow-500 transition-colors"
          >
            Back to Orders
          </Link>
        </div>
      </main>
    )
  }

  const nextPossibleStatuses = getNextStatuses(order.status || "new")

  return (
    <main className="bg-gray-100 min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link href="/admin/manageorders" className="text-blue-600 hover:text-blue-800 flex items-center mb-2">
              ← Back to Orders
            </Link>
            <h1 className="font-poppins text-3xl text-gray-900 font-semibold">Order #{order.id.slice(0, 8)}</h1>
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
              <h2 className="font-poppins text-xl text-gray-900 font-semibold mb-4">Status History</h2>
              {order.statusLog && order.statusLog.length > 0 ? (
                <div className="space-y-4">
                  {order.statusLog.map((log, index) => (
                    <div key={index} className="flex items-start">
                      <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
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
                <p className="text-gray-500">No status updates yet.</p>
              )}
            </div>

            {/* Order Notes */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="font-poppins text-xl text-gray-900 font-semibold mb-4">Order Notes</h2>

              {/* Notes List */}
              {order.notes && order.notes.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {order.notes.map((note, index) => (
                    <div key={index} className={`p-3 rounded-lg ${note.isAdminOnly ? "bg-yellow-50" : "bg-blue-50"}`}>
                      <div className="flex justify-between mb-1">
                        <span
                          className={`text-xs font-medium ${note.isAdminOnly ? "text-yellow-600" : "text-blue-600"}`}
                        >
                          {note.isAdminOnly ? "Admin Only" : "Visible to Customer"}
                        </span>
                        <span className="text-xs text-gray-500">{formatDate(note.timestamp)}</span>
                      </div>
                      <p className="text-gray-800">{note.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 mb-6">No notes added yet.</p>
              )}

              {/* Add Note Form */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-medium text-gray-900 mb-2">Add Note</h3>
                <div className="space-y-3">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Enter note text..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    rows={3}
                  />
                  <div className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAdminOnly}
                        onChange={() => setIsAdminOnly(!isAdminOnly)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Admin only (not visible to customer)</span>
                    </label>
                  </div>
                  <button
                    onClick={handleAddNote}
                    disabled={noteLoading || !newNote.trim()}
                    className={`px-4 py-2 bg-blue-600 text-white rounded-md ${
                      noteLoading || !newNote.trim() ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
                    }`}
                  >
                    {noteLoading ? "Adding..." : "Add Note"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Customer Info & Actions */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="font-poppins text-xl text-gray-900 font-semibold mb-4">Customer Information</h2>
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

            {/* Update Status */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="font-poppins text-xl text-gray-900 font-semibold mb-4">Update Status</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="" disabled>
                      Select status
                    </option>
                    {nextPossibleStatuses.map((status) => (
                      <option key={status} value={status}>
                        {ORDER_STATUSES[status]}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleStatusUpdate}
                  disabled={statusLoading || !selectedStatus || selectedStatus === order.status}
                  className={`w-full px-4 py-2 bg-yellow-400 text-gray-900 rounded-md ${
                    statusLoading || !selectedStatus || selectedStatus === order.status
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-yellow-500"
                  }`}
                >
                  {statusLoading ? "Updating..." : "Update Status"}
                </button>
              </div>
            </div>

            {/* Refund Status (for cancelled orders) */}
            {order.status === "cancelled" && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="font-poppins text-xl text-gray-900 font-semibold mb-4">Refund Status</h2>

                {order.cancellationReason && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Cancellation Reason:</p>
                    <p className="text-gray-700 bg-gray-50 p-2 rounded">{order.cancellationReason}</p>
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Status:</p>
                  <p
                    className={`font-medium ${order.refundStatus === "processed" ? "text-green-600" : "text-red-600"}`}
                  >
                    {order.refundStatus === "processed" ? "Refund Processed" : "Refund Pending"}
                  </p>

                  {order.refundStatus === "processed" && order.refundTransactionId && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">Transaction ID:</p>
                      <p className="font-medium">{order.refundTransactionId}</p>
                    </div>
                  )}
                </div>

                {order.refundStatus !== "processed" && (
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="refundId" className="block text-sm font-medium text-gray-700 mb-1">
                        Refund Transaction ID
                      </label>
                      <input
                        id="refundId"
                        type="text"
                        value={refundTransactionId}
                        onChange={(e) => setRefundTransactionId(e.target.value)}
                        placeholder="Enter transaction ID"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    <button
                      onClick={handleRefundUpdate}
                      disabled={refundLoading || !refundTransactionId.trim()}
                      className={`w-full px-4 py-2 bg-green-600 text-white rounded-md ${
                        refundLoading || !refundTransactionId.trim()
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-green-700"
                      }`}
                    >
                      {refundLoading ? "Processing..." : "Mark as Refunded"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

