"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { trackFileForDeletion } from "@/lib/cloudinary"

export default function Customize() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [customizations, setCustomizations] = useState({})
  const [totalPrice, setTotalPrice] = useState(0)
  const [sessionId, setSessionId] = useState(null)
  const [error, setError] = useState("")
  const [selectedFileIndex, setSelectedFileIndex] = useState(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchUploadSession = async () => {
      try {
        const sessionId = localStorage.getItem("currentUploadSession")

        if (!sessionId) {
          router.push("/upload")
          return
        }

        setSessionId(sessionId)

        const sessionDoc = await getDoc(doc(db, "uploadSessions", sessionId))

        if (!sessionDoc.exists()) {
          router.push("/upload")
          return
        }

        const sessionData = sessionDoc.data()
        const filesData = sessionData.files || []

        setFiles(filesData)

        // Initialize customizations for each file
        const initialCustomizations = {}
        filesData.forEach((file, index) => {
          initialCustomizations[index] = {
            copies: 1,
            paperType: "75GSM",
            paperSize: "A4",
            colorMode: "blackAndWhite",
            coverOption: "noCover",
            printingSides: "singleSided",
            bindingOption: "noBinding",
          }
        })

        setCustomizations(initialCustomizations)

        // Set the first file as selected by default if there are files
        if (filesData.length > 0) {
          setSelectedFileIndex(0)
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching upload session:", error)
        setError("Failed to load your files. Please try again.")
        setLoading(false)
      }
    }

    if (user && !authLoading) {
      fetchUploadSession()
    }
  }, [user, authLoading, router])

  useEffect(() => {
    // Calculate total price based on customizations
    let price = 0

    Object.keys(customizations).forEach((fileIndex) => {
      const file = files[fileIndex]
      const options = customizations[fileIndex]

      if (file && options) {
        // Base price per page
        let pricePerPage = 2 // Default price for 75GSM, B&W, single-sided

        // Adjust price based on paper type
        if (options.paperType === "85GSM") pricePerPage += 0.5

        // Adjust price based on color mode
        if (options.colorMode === "color") pricePerPage += 8

        // Adjust price based on printing sides
        if (options.printingSides === "doubleSided") pricePerPage += 1

        // Calculate price for this file
        const filePrice = file.pageCount * pricePerPage * options.copies

        // Add binding cost if applicable
        let bindingCost = 0
        if (options.bindingOption === "softCover") bindingCost = 30

        // Add cover cost if applicable
        let coverCost = 0
        if (options.coverOption === "thickColorCover") coverCost = 20

        price += filePrice + bindingCost + coverCost
      }
    })

    setTotalPrice(price)
  }, [customizations, files])

  const handleCustomizationChange = (fileIndex, field, value) => {
    setCustomizations((prev) => ({
      ...prev,
      [fileIndex]: {
        ...prev[fileIndex],
        [field]: value,
      },
    }))
  }

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel? All uploaded files will be deleted.")) {
      return
    }

    setLoading(true)

    try {
      // Mark files for deletion from Cloudinary
      for (const file of files) {
        if (file.publicId) {
          try {
            await trackFileForDeletion(file.publicId)
          } catch (error) {
            console.error(`Failed to mark file ${file.name} for deletion:`, error)
            // Continue with other files even if one fails
          }
        }
      }

      // Clear localStorage
      localStorage.removeItem("currentUploadSession")

      // Redirect to home
      router.push("/")
    } catch (error) {
      console.error("Error canceling order:", error)
      setError("Failed to cancel order. Please try again.")
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    setLoading(true)
    setError("")

    try {
      // Update the upload session with customizations
      await updateDoc(doc(db, "uploadSessions", sessionId), {
        customizations,
        totalPrice,
        updatedAt: new Date().toISOString(),
        status: "customized",
      })

      // Add to cart in Firestore
      const cartItem = {
        sessionId,
        files,
        customizations,
        totalPrice,
        timestamp: new Date().toISOString(),
      }

      // Store in localStorage for now (will be replaced with Firestore in cart page)
      const cart = JSON.parse(localStorage.getItem("cart") || "[]")
      cart.push(cartItem)
      localStorage.setItem("cart", JSON.stringify(cart))

      // Clear current upload session
      localStorage.removeItem("currentUploadSession")

      router.push("/cart")
    } catch (error) {
      console.error("Error adding to cart:", error)
      setError("Failed to add to cart. Please try again.")
      setLoading(false)
    }
  }

  const calculateFilePrice = (fileIndex) => {
    const file = files[fileIndex]
    const options = customizations[fileIndex]

    if (!file || !options) return 0

    // Base price per page
    let pricePerPage = 2

    // Adjust price based on paper type
    if (options.paperType === "85GSM") pricePerPage += 0.5

    // Adjust price based on color mode
    if (options.colorMode === "color") pricePerPage += 8

    // Adjust price based on printing sides
    if (options.printingSides === "doubleSided") pricePerPage += 1

    // Calculate price for this file
    const filePrice = file.pageCount * pricePerPage * options.copies

    // Add binding cost if applicable
    let bindingCost = 0
    if (options.bindingOption === "softCover") bindingCost = 30

    // Add cover cost if applicable
    let coverCost = 0
    if (options.coverOption === "thickColorCover") coverCost = 20

    return filePrice + bindingCost + coverCost
  }

  if (authLoading || loading) {
    return (
      <main className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
          <p className="font-inter text-gray-600 text-lg mt-4">Loading your files...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-gray-100 min-h-screen py-12 px-4">
      {/* Header Section */}
      <section className="max-w-6xl mx-auto mb-12">
        <h1 className="font-poppins text-4xl md:text-5xl text-gray-900 text-center font-semibold mb-4">
          Customize Your Order
        </h1>
        <p className="font-inter text-lg md:text-xl text-gray-700 text-center max-w-2xl mx-auto">
          Tailor your prints with options for paper, color, binding, and more!
        </p>
      </section>

      {/* Error Message */}
      {error && (
        <div className="max-w-6xl mx-auto mb-6">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <p className="font-inter text-sm text-red-700 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </p>
          </div>
        </div>
      )}

      {/* File Selection Section */}
      <section className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="font-poppins text-2xl text-gray-900 font-semibold mb-4">Your Files</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedFileIndex === index
                  ? "border-blue-400 bg-blue-50 shadow-md"
                  : "border-gray-200 hover:border-blue-300"
              }`}
              onClick={() => setSelectedFileIndex(index)}
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-yellow-400 rounded-md flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{file.name}</p>
                  <div className="flex items-center mt-1">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
                      {file.pageCount} {file.pageCount === 1 ? "page" : "pages"}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">{Math.round(file.size / 1024)} KB</span>
                  </div>
                  <p className="text-sm font-medium text-blue-600 mt-1">₹{calculateFilePrice(index).toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Customization Section */}
      {selectedFileIndex !== null && (
        <section className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="font-poppins text-2xl text-gray-900 font-semibold mb-1">
                Customize: {files[selectedFileIndex].name}
              </h2>
              <p className="font-inter text-gray-600">
                {files[selectedFileIndex].pageCount} pages • {Math.round(files[selectedFileIndex].size / 1024)} KB
              </p>
            </div>
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <p className="font-inter text-gray-900 font-semibold">
                File Price: ₹{calculateFilePrice(selectedFileIndex).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Copies */}
            <div>
              <label
                htmlFor={`copies-${selectedFileIndex}`}
                className="font-inter text-sm text-gray-700 font-medium block mb-1"
              >
                Number of Copies
              </label>
              <input
                id={`copies-${selectedFileIndex}`}
                type="number"
                min="1"
                value={customizations[selectedFileIndex]?.copies || 1}
                onChange={(e) =>
                  handleCustomizationChange(selectedFileIndex, "copies", Number.parseInt(e.target.value))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors font-inter text-gray-900"
              />
            </div>

            {/* Paper Type */}
            <div>
              <label
                htmlFor={`paperType-${selectedFileIndex}`}
                className="font-inter text-sm text-gray-700 font-medium block mb-1"
              >
                Paper Type
              </label>
              <select
                id={`paperType-${selectedFileIndex}`}
                value={customizations[selectedFileIndex]?.paperType || "75GSM"}
                onChange={(e) => handleCustomizationChange(selectedFileIndex, "paperType", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors font-inter text-gray-900"
              >
                <option value="75GSM">75 GSM</option>
                <option value="85GSM">85 GSM</option>
              </select>
            </div>

            {/* Paper Size */}
            <div>
              <label
                htmlFor={`paperSize-${selectedFileIndex}`}
                className="font-inter text-sm text-gray-700 font-medium block mb-1"
              >
                Paper Size
              </label>
              <select
                id={`paperSize-${selectedFileIndex}`}
                value={customizations[selectedFileIndex]?.paperSize || "A4"}
                onChange={(e) => handleCustomizationChange(selectedFileIndex, "paperSize", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors font-inter text-gray-900"
              >
                <option value="A4">A4</option>
                <option value="A5">A5</option>
                <option value="Letter">Letter</option>
              </select>
            </div>

            {/* Color Mode */}
            <div>
              <label
                htmlFor={`colorMode-${selectedFileIndex}`}
                className="font-inter text-sm text-gray-700 font-medium block mb-1"
              >
                Color Mode
              </label>
              <select
                id={`colorMode-${selectedFileIndex}`}
                value={customizations[selectedFileIndex]?.colorMode || "blackAndWhite"}
                onChange={(e) => handleCustomizationChange(selectedFileIndex, "colorMode", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors font-inter text-gray-900"
              >
                <option value="blackAndWhite">Black & White</option>
                <option value="color">Color</option>
              </select>
            </div>

            {/* Cover Option */}
            <div>
              <label
                htmlFor={`coverOption-${selectedFileIndex}`}
                className="font-inter text-sm text-gray-700 font-medium block mb-1"
              >
                Cover Option
              </label>
              <select
                id={`coverOption-${selectedFileIndex}`}
                value={customizations[selectedFileIndex]?.coverOption || "noCover"}
                onChange={(e) => handleCustomizationChange(selectedFileIndex, "coverOption", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors font-inter text-gray-900"
              >
                <option value="noCover">No Cover</option>
                <option value="thickColorCover">Thick Color Cover</option>
              </select>
            </div>

            {/* Printing Sides */}
            <div>
              <label
                htmlFor={`printingSides-${selectedFileIndex}`}
                className="font-inter text-sm text-gray-700 font-medium block mb-1"
              >
                Printing Sides
              </label>
              <select
                id={`printingSides-${selectedFileIndex}`}
                value={customizations[selectedFileIndex]?.printingSides || "singleSided"}
                onChange={(e) => handleCustomizationChange(selectedFileIndex, "printingSides", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors font-inter text-gray-900"
              >
                <option value="singleSided">Single-Sided</option>
                <option value="doubleSided">Double-Sided</option>
              </select>
            </div>

            {/* Binding Option */}
            <div>
              <label
                htmlFor={`bindingOption-${selectedFileIndex}`}
                className="font-inter text-sm text-gray-700 font-medium block mb-1"
              >
                Binding Option
              </label>
              <select
                id={`bindingOption-${selectedFileIndex}`}
                value={customizations[selectedFileIndex]?.bindingOption || "noBinding"}
                onChange={(e) => handleCustomizationChange(selectedFileIndex, "bindingOption", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors font-inter text-gray-900"
              >
                <option value="noBinding">No Binding</option>
                <option value="softCover">Soft Cover</option>
              </select>
            </div>
          </div>
        </section>
      )}

      {/* Order Summary Section */}
      <section className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="font-poppins text-2xl text-gray-900 font-semibold mb-4">Order Summary</h2>
        <div className="space-y-4">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0 last:pb-0"
            >
              <div>
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {customizations[index]?.copies || 1} {(customizations[index]?.copies || 1) > 1 ? "copies" : "copy"} •
                  {customizations[index]?.paperSize || "A4"} •
                  {customizations[index]?.colorMode === "color" ? "Color" : "B&W"}
                </p>
              </div>
              <p className="font-medium text-gray-900">₹{calculateFilePrice(index).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Total Price and Actions */}
      <section className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 flex flex-col sm:flex-row gap-6 justify-between items-center">
        <h2 className="font-poppins text-2xl text-gray-900 font-semibold">Total Price: ₹{totalPrice.toFixed(2)}</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleAddToCart}
            disabled={loading}
            className={`bg-yellow-400 text-gray-900 font-inter text-lg px-8 py-4 rounded-lg shadow-md transition-colors ${
              loading ? "opacity-70 cursor-not-allowed" : "hover:bg-opacity-80"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Add to Cart"
            )}
          </button>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link
              href="/upload"
              className="bg-transparent border-2 border-blue-400 text-blue-400 font-inter text-lg px-8 py-4 rounded-lg hover:bg-blue-400 hover:text-white transition-colors text-center"
            >
              Upload More Files
            </Link>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="bg-transparent border-2 border-red-400 text-red-400 font-inter text-lg px-8 py-4 rounded-lg hover:bg-red-400 hover:text-white transition-colors"
            >
              Cancel Order
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}

