"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { trackFileForDeletion } from "@/lib/cloudinary"

export default function Cart() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalAmount, setTotalAmount] = useState(0)
  const [removingItem, setRemovingItem] = useState(null)

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
  }, [user, authLoading])

  const handleRemoveItem = async (index) => {
    try {
      setRemovingItem(index)
      const updatedCart = [...cartItems]
      const itemToRemove = updatedCart[index]

      // Mark files for deletion from Cloudinary
      for (const file of itemToRemove.files) {
        if (file.publicId) {
          try {
            await trackFileForDeletion(file.publicId)
          } catch (error) {
            console.error(`Failed to mark file ${file.name} for deletion:`, error)
            // Continue with other files even if one fails
          }
        }
      }

      // Remove item from cart
      updatedCart.splice(index, 1)
      setCartItems(updatedCart)

      // Update localStorage
      localStorage.setItem("cart", JSON.stringify(updatedCart))

      // Recalculate total
      const total = updatedCart.reduce((sum, item) => sum + item.totalPrice, 0)
      setTotalAmount(total)

      setRemovingItem(null)
    } catch (error) {
      console.error("Error removing item:", error)
      alert("Failed to remove item. Please try again.")
      setRemovingItem(null)
    }
  }

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!")
      return
    }

    router.push("/checkout")
  }

  if (authLoading || loading) {
    return (
      <main className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
          <p className="font-inter text-gray-600 text-lg mt-4">Loading your cart...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-gray-100 min-h-screen py-12 px-4">
      {/* Header Section */}
      <section className="max-w-6xl mx-auto mb-12">
        <h1 className="font-poppins text-4xl md:text-5xl text-gray-900 text-center font-semibold mb-4">Your Cart</h1>
        <p className="font-inter text-lg md:text-xl text-gray-700 text-center max-w-2xl mx-auto">
          Review your print orders before checking out!
        </p>
      </section>

      {/* Cart Content */}
      <section className="max-w-6xl mx-auto">
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="font-inter text-gray-600 mb-4">Your cart is empty.</p>
            <Link
              href="/upload"
              className="inline-block bg-blue-400 text-white font-inter text-lg px-6 py-2 rounded-lg hover:bg-blue-500 transition-colors shadow-md"
            >
              Start a New Order
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {cartItems.map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h2 className="font-poppins text-2xl text-gray-900 font-semibold mb-4">Order #{index + 1}</h2>
                <p className="font-inter text-gray-600 mb-2">Files: {item.files.length}</p>
                <ul className="space-y-4 mb-4">
                  {item.files.map((file, fileIndex) => (
                    <li key={fileIndex} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                      <p className="font-inter text-gray-700 font-medium">
                        {file.name} - {file.pageCount} pages
                      </p>
                      <ul className="font-inter text-gray-600 text-sm mt-2 space-y-1">
                        <li>Copies: {item.customizations[fileIndex]?.copies || 1}</li>
                        <li>Paper: {item.customizations[fileIndex]?.paperType || "75GSM"}</li>
                        <li>
                          Color: {item.customizations[fileIndex]?.colorMode === "color" ? "Color" : "Black & White"}
                        </li>
                        <li>
                          Binding:{" "}
                          {item.customizations[fileIndex]?.bindingOption === "softCover" ? "Soft Cover" : "None"}
                        </li>
                      </ul>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between">
                  <p className="font-inter text-gray-900 font-semibold">Price: ₹{item.totalPrice.toFixed(2)}</p>
                  <button
                    onClick={() => handleRemoveItem(index)}
                    disabled={removingItem === index}
                    className={`font-inter ${
                      removingItem === index ? "text-gray-400 cursor-not-allowed" : "text-red-400 hover:text-red-500"
                    } transition-colors`}
                  >
                    {removingItem === index ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                        Removing...
                      </span>
                    ) : (
                      "Remove"
                    )}
                  </button>
                </div>
              </div>
            ))}

            {/* Total and Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col sm:flex-row gap-6 justify-between items-center">
              <h2 className="font-poppins text-2xl text-gray-900 font-semibold">Total: ₹{totalAmount.toFixed(2)}</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleCheckout}
                  className="bg-yellow-400 text-gray-900 font-inter text-lg px-8 py-4 rounded-lg shadow-md hover:bg-opacity-80 transition-colors"
                >
                  Proceed to Checkout
                </button>
                <Link
                  href="/upload"
                  className="bg-transparent border-2 border-blue-400 text-blue-400 font-inter text-lg px-8 py-4 rounded-lg hover:bg-blue-400 hover:text-white transition-colors text-center"
                >
                  Add More Items
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}

