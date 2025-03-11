"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function PendingOrdersNotification() {
  const { user, loading } = useAuth()
  const [pendingOrders, setPendingOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [cancelingOrders, setCancelingOrders] = useState(false)

  useEffect(() => {
    const fetchPendingOrders = async () => {
      if (!user) return

      setLoadingOrders(true)
      try {
        // Check for items in cart from localStorage
        const cartItems = JSON.parse(localStorage.getItem("cart") || "[]")

        // Check for pending upload sessions in Firestore
        const sessionsQuery = query(
          collection(db, "uploadSessions"),
          where("userId", "==", user.uid),
          where("status", "==", "pending"),
        )

        const querySnapshot = await getDocs(sessionsQuery)
        const pendingSessions = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          type: "session",
        }))

        // Combine cart items and pending sessions
        const allPending = [...cartItems.map((item) => ({ ...item, type: "cart" })), ...pendingSessions]

        setPendingOrders(allPending)
      } catch (error) {
        console.error("Error fetching pending orders:", error)
      } finally {
        setLoadingOrders(false)
      }
    }

    if (user && !loading) {
      fetchPendingOrders()
    }
  }, [user, loading])

  const handleCancelAllOrders = async () => {
    if (!confirm("Are you sure you want to cancel all pending orders? This will delete all uploaded files.")) {
      return
    }

    setCancelingOrders(true)

    try {
      // Get all files that need to be deleted
      const filesToDelete = []

      // Get files from cart items
      const cartItems = JSON.parse(localStorage.getItem("cart") || "[]")
      cartItems.forEach((item) => {
        item.files.forEach((file) => {
          if (file.publicId) {
            filesToDelete.push(file.publicId)
          }
        })
      })

      // Get files from pending sessions
      pendingOrders
        .filter((order) => order.type === "session")
        .forEach((session) => {
          session.files.forEach((file) => {
            if (file.publicId) {
              filesToDelete.push(file.publicId)
            }
          })
        })

      // Mark files for deletion
      if (filesToDelete.length > 0) {
        // Store in localStorage for tracking
        const trackedFiles = JSON.parse(localStorage.getItem("cloudinary_files_to_delete") || "[]")
        filesToDelete.forEach((publicId) => {
          trackedFiles.push({
            publicId,
            markedAt: new Date().toISOString(),
          })
        })
        localStorage.setItem("cloudinary_files_to_delete", JSON.stringify(trackedFiles))

        // In a real app, you would call the API to delete files
        // For now, we'll just log it
        console.log(`Marked ${filesToDelete.length} files for deletion`)
      }

      // Clear cart and current upload session
      localStorage.removeItem("cart")
      localStorage.removeItem("currentUploadSession")

      // Reload page to refresh state
      window.location.reload()
    } catch (error) {
      console.error("Error canceling orders:", error)
      alert("Failed to cancel orders. Please try again.")
    } finally {
      setCancelingOrders(false)
    }
  }

  if (loadingOrders || pendingOrders.length === 0) {
    return null
  }

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <p className="font-inter text-sm text-blue-700">
            You have {pendingOrders.length} pending order{pendingOrders.length > 1 ? "s" : ""}.
            {pendingOrders.some((order) => order.type === "cart") && (
              <Link href="/cart" className="font-medium underline ml-1">
                Complete your checkout
              </Link>
            )}
            {pendingOrders.some((order) => order.type === "session") && (
              <Link href="/customize" className="font-medium underline ml-1">
                Continue customization
              </Link>
            )}
            {" or "}
            <button
              className="font-medium underline text-red-500"
              onClick={handleCancelAllOrders}
              disabled={cancelingOrders}
            >
              {cancelingOrders ? "Canceling..." : "cancel all pending orders"}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

