"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { collection, query, where, getDocs, addDoc, doc, getDoc, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { FiChevronLeft, FiPlus, FiUpload, FiX } from "react-icons/fi"
import BottomNavigation from "@/components/BottomNavigation"
import ChatbotButton from "@/components/ChatbotButton"

export default function ComplaintsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [complaints, setComplaints] = useState([])
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showNewComplaintForm, setShowNewComplaintForm] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState("")
  const [complaintText, setComplaintText] = useState("")
  const [complaintImage, setComplaintImage] = useState(null)
  const [imagePreview, setImagePreview] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  // Fetch complaints and orders
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        // Fetch orders
        const ordersQuery = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
          where("status", "in", [
            "paid",
            "approved",
            "processing",
            "quality_check",
            "packaging",
            "shipped",
            "delivered",
          ]),
          orderBy("createdAt", "desc"),
        )

        const ordersSnapshot = await getDocs(ordersQuery)
        const ordersData = ordersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setOrders(ordersData)

        // Fetch complaints - don't filter by status to show all complaints including closed ones
        const complaintsQuery = query(
          collection(db, "complaints"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
        )

        const complaintsSnapshot = await getDocs(complaintsQuery)
        const complaintsData = complaintsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        // Fetch order details for each complaint
        const complaintsWithOrderDetails = await Promise.all(
          complaintsData.map(async (complaint) => {
            if (complaint.orderId) {
              try {
                const orderDoc = await getDoc(doc(db, "orders", complaint.orderId))
                if (orderDoc.exists()) {
                  return {
                    ...complaint,
                    orderDetails: {
                      id: orderDoc.id,
                      ...orderDoc.data(),
                    },
                  }
                }
              } catch (error) {
                console.error("Error fetching order details:", error)
              }
            }
            return complaint
          }),
        )

        setComplaints(complaintsWithOrderDetails)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setComplaintImage(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmitComplaint = async (e) => {
    e.preventDefault()

    if (!selectedOrder || !complaintText.trim() || !user) {
      alert("Please select an order and provide complaint details")
      return
    }

    setIsSubmitting(true)

    try {
      // In a real app, you would upload the image to Cloudinary here
      // For demo purposes, we'll just use a placeholder

      // Get order details
      const orderDoc = await getDoc(doc(db, "orders", selectedOrder))
      const orderData = orderDoc.exists() ? orderDoc.data() : {}

      // Create complaint
      const complaintData = {
        userId: user.uid,
        orderId: selectedOrder,
        orderAmount: orderData.totalAmount || 0,
        orderDate: orderData.createdAt || new Date().toISOString(),
        text: complaintText,
        imageUrl: imagePreview || "",
        status: "open",
        createdAt: new Date().toISOString(),
        responses: [],
        rating: null,
      }

      const docRef = await addDoc(collection(db, "complaints"), complaintData)

      // Add to local state
      setComplaints([
        {
          id: docRef.id,
          ...complaintData,
          orderDetails: {
            id: selectedOrder,
            ...orderData,
          },
        },
        ...complaints,
      ])

      // Reset form
      setShowNewComplaintForm(false)
      setSelectedOrder("")
      setComplaintText("")
      setComplaintImage(null)
      setImagePreview("")
    } catch (error) {
      console.error("Error submitting complaint:", error)
      alert("Failed to submit complaint. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "open":
        return "bg-yellow-100 text-yellow-800"
      case "responded":
        return "bg-blue-100 text-blue-800"
      case "closed":
        return "bg-green-100 text-green-800"
      case "reopened":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date)
  }

  if (loading || isLoading) {
    return (
      <main className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </main>
    )
  }

  return (
    <main className="bg-gray-100 min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link href="/profile" className="mr-4">
            <FiChevronLeft size={24} className="text-gray-700" />
          </Link>
          <h1 className="font-poppins text-2xl font-bold text-gray-900">My Complaints</h1>
        </div>

        {/* New Complaint Button */}
        {!showNewComplaintForm && (
          <button
            onClick={() => setShowNewComplaintForm(true)}
            className="w-full bg-yellow-400 text-gray-900 font-medium py-3 rounded-xl mb-6 flex items-center justify-center"
          >
            <FiPlus size={20} className="mr-2" /> Submit New Complaint
          </button>
        )}

        {/* New Complaint Form */}
        {showNewComplaintForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-poppins text-xl font-semibold text-gray-900">Submit New Complaint</h2>
              <button onClick={() => setShowNewComplaintForm(false)} className="text-gray-500 hover:text-gray-700">
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmitComplaint} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Order</label>
                <select
                  value={selectedOrder}
                  onChange={(e) => setSelectedOrder(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                >
                  <option value="">Select an order</option>
                  {orders.map((order) => (
                    <option key={order.id} value={order.id}>
                      Order #{order.id.slice(0, 8)} - ₹{order.totalAmount?.toFixed(2)} ({formatDate(order.createdAt)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Complaint Details</label>
                <textarea
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Describe your issue in detail..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attach Image (Optional)</label>
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50"
                >
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded-md"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setComplaintImage(null)
                          setImagePreview("")
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <FiUpload size={24} className="text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Click to upload an image</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewComplaintForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg font-medium"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Complaint"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Complaints List */}
        {complaints.length > 0 ? (
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <Link
                href={`/profile/complaints/${complaint.id}`}
                key={complaint.id}
                className="block bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">Order #{complaint.orderId.slice(0, 8)}</h3>
                    <p className="text-sm text-gray-500">{formatDate(complaint.createdAt)}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(complaint.status)}`}
                  >
                    {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                  </span>
                </div>
                <p className="text-gray-700 mb-3 line-clamp-2">{complaint.text}</p>
                {complaint.imageUrl && (
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100">
                    <img
                      src={complaint.imageUrl || "/placeholder.svg"}
                      alt="Complaint"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                {complaint.responses && complaint.responses.length > 0 && (
                  <div className="mt-3 text-sm text-gray-500">
                    {complaint.responses.length} response{complaint.responses.length !== 1 ? "s" : ""}
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-gray-600 mb-4">You don't have any complaints yet.</p>
            <button
              onClick={() => setShowNewComplaintForm(true)}
              className="inline-block bg-yellow-400 text-gray-900 px-6 py-2 rounded-lg hover:bg-yellow-500 transition-colors"
            >
              Submit Your First Complaint
            </button>
          </div>
        )}
      </div>

      {/* Bottom Navigation for Mobile */}
      <BottomNavigation />

      {/* Chatbot Button */}
      <ChatbotButton />
    </main>
  )
}

