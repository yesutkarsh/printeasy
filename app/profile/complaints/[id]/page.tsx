"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { FiChevronLeft, FiSend, FiStar } from "react-icons/fi"
import BottomNavigation from "@/components/BottomNavigation"
import ChatbotButton from "@/components/ChatbotButton"

export default function ComplaintDetailPage({ params }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [complaint, setComplaint] = useState(null)
  const [order, setOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [newResponse, setNewResponse] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showRatingForm, setShowRatingForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  // Fetch complaint and order details
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        const complaintDoc = await getDoc(doc(db, "complaints", params.id))

        if (!complaintDoc.exists()) {
          router.push("/profile/complaints")
          return
        }

        const complaintData = {
          id: complaintDoc.id,
          ...complaintDoc.data(),
        }

        // Verify that the complaint belongs to the current user
        if (complaintData.userId !== user.uid) {
          router.push("/profile/complaints")
          return
        }

        setComplaint(complaintData)

        // Fetch order details
        if (complaintData.orderId) {
          const orderDoc = await getDoc(doc(db, "orders", complaintData.orderId))
          if (orderDoc.exists()) {
            setOrder({
              id: orderDoc.id,
              ...orderDoc.data(),
            })
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user, params.id, router])

  const handleSubmitResponse = async (e) => {
    e.preventDefault()

    if (!newResponse.trim() || !user || !complaint) return

    setIsSubmitting(true)

    try {
      const response = {
        text: newResponse,
        timestamp: new Date().toISOString(),
        isAdmin: false,
        userId: user.uid,
      }

      // Update complaint in Firestore
      await updateDoc(doc(db, "complaints", complaint.id), {
        responses: arrayUnion(response),
        status: "responded",
      })

      // Update local state
      setComplaint({
        ...complaint,
        responses: [...(complaint.responses || []), response],
        status: "responded",
      })

      // Reset form
      setNewResponse("")
    } catch (error) {
      console.error("Error submitting response:", error)
      alert("Failed to submit response. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReopenComplaint = async () => {
    if (!complaint) return

    try {
      // Update complaint in Firestore
      await updateDoc(doc(db, "complaints", complaint.id), {
        status: "reopened",
        reopenedAt: new Date().toISOString(),
      })

      // Update local state
      setComplaint({
        ...complaint,
        status: "reopened",
        reopenedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error reopening complaint:", error)
      alert("Failed to reopen complaint. Please try again.")
    }
  }

  const handleSubmitRating = async () => {
    if (!complaint || rating === 0) return

    try {
      // Update complaint in Firestore
      await updateDoc(doc(db, "complaints", complaint.id), {
        rating,
        ratedAt: new Date().toISOString(),
      })

      // Update local state
      setComplaint({
        ...complaint,
        rating,
        ratedAt: new Date().toISOString(),
      })

      setShowRatingForm(false)
    } catch (error) {
      console.error("Error submitting rating:", error)
      alert("Failed to submit rating. Please try again.")
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
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

  if (loading || isLoading) {
    return (
      <main className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </main>
    )
  }

  if (!complaint) {
    return (
      <main className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Complaint not found.</p>
          <Link
            href="/profile/complaints"
            className="inline-block bg-yellow-400 text-gray-900 px-6 py-2 rounded-lg hover:bg-yellow-500 transition-colors"
          >
            Back to Complaints
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-gray-100 min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link href="/profile/complaints" className="mr-4">
            <FiChevronLeft size={24} className="text-gray-700" />
          </Link>
          <div>
            <h1 className="font-poppins text-2xl font-bold text-gray-900">Complaint Details</h1>
            <p className="text-sm text-gray-500">Order #{complaint.orderId.slice(0, 8)}</p>
          </div>
        </div>

        {/* Complaint Status */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-poppins text-lg font-semibold text-gray-900">Status</h2>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeClass(complaint.status)}`}>
              {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 mt-4">
            {complaint.status === "closed" && !complaint.rating && (
              <button
                onClick={() => setShowRatingForm(true)}
                className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg font-medium"
              >
                Rate Resolution
              </button>
            )}

            {complaint.status === "closed" && (
              <button
                onClick={handleReopenComplaint}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium"
              >
                Reopen Complaint
              </button>
            )}

            {complaint.rating && (
              <div className="flex items-center">
                <span className="text-gray-700 mr-2">Your Rating:</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar
                      key={star}
                      size={18}
                      className={star <= complaint.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rating Form */}
        {showRatingForm && (
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <h2 className="font-poppins text-lg font-semibold text-gray-900 mb-3">Rate Your Experience</h2>
            <p className="text-gray-600 mb-4">How satisfied are you with the resolution of your complaint?</p>

            <div className="flex items-center mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  size={28}
                  className={`cursor-pointer ${
                    (hoverRating || rating) >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                  }`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                />
              ))}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRatingForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRating}
                className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg font-medium"
                disabled={rating === 0}
              >
                Submit Rating
              </button>
            </div>
          </div>
        )}

        {/* Order Details */}
        {order && (
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <h2 className="font-poppins text-lg font-semibold text-gray-900 mb-3">Order Information</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">₹{order.totalAmount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span>{order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || "N/A"}</span>
              </div>
              {order.paymentId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment ID:</span>
                  <span className="font-mono text-sm">{order.paymentId}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Original Complaint */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-poppins text-lg font-semibold text-gray-900">Complaint</h2>
            <span className="text-sm text-gray-500">{formatDate(complaint.createdAt)}</span>
          </div>
          <p className="text-gray-700 whitespace-pre-line mb-4">{complaint.text}</p>
          {complaint.imageUrl && (
            <div className="mt-3">
              <img
                src={complaint.imageUrl || "/placeholder.svg"}
                alt="Complaint"
                className="max-w-full max-h-96 rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Responses */}
        {complaint.responses && complaint.responses.length > 0 && (
          <div className="space-y-4 mb-6">
            <h2 className="font-poppins text-lg font-semibold text-gray-900">Responses</h2>

            {complaint.responses.map((response, index) => (
              <div key={index} className={`p-4 rounded-lg ${response.isAdmin ? "bg-blue-50 ml-4" : "bg-gray-50 mr-4"}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-sm font-medium ${response.isAdmin ? "text-blue-600" : "text-gray-700"}`}>
                    {response.isAdmin ? "Support Team" : "You"}
                  </span>
                  <span className="text-xs text-gray-500">{formatDate(response.timestamp)}</span>
                </div>
                <p className="text-gray-700 whitespace-pre-line">{response.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* Response Form */}
        {(complaint.status === "open" || complaint.status === "responded" || complaint.status === "reopened") && (
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="font-poppins text-lg font-semibold text-gray-900 mb-3">Add Response</h2>
            <form onSubmit={handleSubmitResponse}>
              <textarea
                value={newResponse}
                onChange={(e) => setNewResponse(e.target.value)}
                placeholder="Type your response here..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-3"
                rows={3}
                required
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !newResponse.trim()}
                  className={`flex items-center px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg font-medium ${
                    isSubmitting || !newResponse.trim() ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <FiSend className="mr-2" /> Send Response
                    </>
                  )}
                </button>
              </div>
            </form>
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

