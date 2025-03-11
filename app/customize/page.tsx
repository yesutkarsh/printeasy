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
  const [subtotal, setSubtotal] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)
  const [sessionId, setSessionId] = useState(null)
  const [error, setError] = useState("")
  const [selectedFileIndex, setSelectedFileIndex] = useState(null)

  const DELIVERY_FEE = 70

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, authLoading, router])

  // Fetch upload session data
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

        // Initialize customizations with defaults
        const initialCustomizations = {}
        filesData.forEach((file, index) => {
          initialCustomizations[index] = {
            copies: 1,
            paperType: "standard",
            paperSize: "A4",
            colorMode: "blackAndWhite",
            coverOption: "noCover",
            printingSides: "singleSided",
            bindingOption: "noBinding",
          }
        })
        setCustomizations(initialCustomizations)
        if (filesData.length > 0) setSelectedFileIndex(0)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching upload session:", error)
        setError("Failed to load your files. Please try again.")
        setLoading(false)
      }
    }
    if (user && !authLoading) fetchUploadSession()
  }, [user, authLoading, router])

  // Calculate subtotal and total price
  useEffect(() => {
    let calculatedSubtotal = 0
    files.forEach((file, index) => {
      calculatedSubtotal += calculateFilePrice(index)
    })
    setSubtotal(calculatedSubtotal)
    setTotalPrice(calculatedSubtotal + DELIVERY_FEE)
  }, [customizations, files])

  // Function to calculate price per page based on options
  const getPricePerPage = (options) => {
    let pricePerPage = 2.5
    if (options.colorMode === "color") pricePerPage += 2.4
    if (options.paperType === "premium") pricePerPage += 3
    else if (options.paperType === "ultraPremium") pricePerPage += 6
    if (options.paperSize === "A3") pricePerPage += 2
    if (options.printingSides === "doubleSided") pricePerPage += 1
    return pricePerPage
  }

  // Calculate total price for a file
  const calculateFilePrice = (fileIndex) => {
    const file = files[fileIndex]
    const options = customizations[fileIndex]
    if (!file || !options) return 0

    const pricePerPage = getPricePerPage(options)
    const filePrice = file.pageCount * pricePerPage * options.copies
    let bindingCost = options.bindingOption === "staplerBinding" ? 30 : options.bindingOption === "softCover" ? 120 : 0
    let coverCost = options.coverOption === "customCover" ? 30 : 0

    return filePrice + bindingCost + coverCost
  }

  // Handle changes to customization options
  const handleCustomizationChange = (fileIndex, field, value) => {
    if (field === "copies") {
      const numValue = Number.parseInt(value)
      value = isNaN(numValue) ? 1 : Math.max(1, numValue)
    }
    setCustomizations((prev) => ({
      ...prev,
      [fileIndex]: { ...prev[fileIndex], [field]: value },
    }))
  }

  // Apply preset options to a file
  const applyPreset = (fileIndex, options) => {
    setCustomizations((prev) => ({
      ...prev,
      [fileIndex]: {
        copies: prev[fileIndex]?.copies || 1,
        ...options,
      },
    }))
  }

  // Handle order cancellation
  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel? All uploaded files will be deleted.")) return
    setLoading(true)
    try {
      for (const file of files) {
        if (file.publicId) await trackFileForDeletion(file.publicId)
      }
      localStorage.removeItem("currentUploadSession")
      router.push("/")
    } catch (error) {
      console.error("Error canceling order:", error)
      setError("Failed to cancel order. Please try again.")
      setLoading(false)
    }
  }

  // Handle adding to cart
  const handleAddToCart = async () => {
    setLoading(true)
    setError("")
    try {
      await updateDoc(doc(db, "uploadSessions", sessionId), {
        customizations,
        totalPrice: subtotal,
        updatedAt: new Date().toISOString(),
        status: "customized",
      })
      const cartItem = {
        sessionId,
        files,
        customizations,
        totalPrice: subtotal,
        timestamp: new Date().toISOString(),
      }
      const cart = JSON.parse(localStorage.getItem("cart") || "[]")
      cart.push(cartItem)
      localStorage.setItem("cart", JSON.stringify(cart))
      localStorage.removeItem("currentUploadSession")
      router.push("/cart")
    } catch (error) {
      console.error("Error adding to cart:", error)
      setError("Failed to add to cart. Please try again.")
      setLoading(false)
    }
  }

  // Define preset options
  const presets = [
    {
      name: "Basic B&W",
      description: "Normal paper, Black & White, A4, Single-sided",
      options: {
        paperType: "standard",
        colorMode: "blackAndWhite",
        paperSize: "A4",
        printingSides: "singleSided",
        coverOption: "noCover",
        bindingOption: "noBinding",
      },
    },
    {
      name: "Color Print",
      description: "Normal paper, Color, A4, Single-sided",
      options: {
        paperType: "standard",
        colorMode: "color",
        paperSize: "A4",
        printingSides: "singleSided",
        coverOption: "noCover",
        bindingOption: "noBinding",
      },
    },
    {
      name: "Premium Color",
      description: "Premium paper, Color, A4, Single-sided",
      options: {
        paperType: "premium",
        colorMode: "color",
        paperSize: "A4",
        printingSides: "singleSided",
        coverOption: "noCover",
        bindingOption: "noBinding",
      },
    },
  ].map(preset => ({
    ...preset,
    pricePerPage: getPricePerPage(preset.options)
  }))

  // Loading state
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
      {/* Header */}
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

      {/* Files List */}
      <section className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="font-poppins text-2xl text-gray-900 font-semibold mb-4">Your Files</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedFileIndex === index ? "border-blue-400 bg-blue-50 shadow-md" : "border-gray-200 hover:border-blue-300"
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
                  <p className="text-sm text-gray-500">{file.pageCount} pages • {Math.round(file.size / 1024)} KB</p>
                  <p className="text-sm font-medium text-blue-600 mt-1">₹{calculateFilePrice(index).toFixed(2)}</p>
                  <p className="text-sm text-gray-500">₹{getPricePerPage(customizations[index]).toFixed(2)} per page</p>
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

          {/* Presets */}
          <div className="mb-8">
            <h3 className="font-poppins text-xl text-gray-900 font-semibold mb-4">Quick Presets</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {presets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => applyPreset(selectedFileIndex, preset.options)}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-colors text-left shadow-sm hover:shadow-md"
                >
                  <h4 className="font-medium text-gray-900">{preset.name}</h4>
                  <p className="text-sm text-gray-600">{preset.description}</p>
                  <p className="text-sm font-semibold text-blue-600 mt-2">₹{preset.pricePerPage.toFixed(1)} per page</p>
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4">Select a preset or customize manually below.</p>
          </div>

          {/* Customization Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor={`copies-${selectedFileIndex}`} className="font-inter text-sm text-gray-700 font-medium block mb-1">
                Number of Copies
              </label>
              <input
                id={`copies-${selectedFileIndex}`}
                type="number"
                min="1"
                value={customizations[selectedFileIndex]?.copies || 1}
                onChange={(e) => handleCustomizationChange(selectedFileIndex, "copies", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors font-inter text-gray-900"
              />
            </div>
            <div>
              <label htmlFor={`paperType-${selectedFileIndex}`} className="font-inter text-sm text-gray-700 font-medium block mb-1">
                Paper Type
              </label>
              <select
                id={`paperType-${selectedFileIndex}`}
                value={customizations[selectedFileIndex]?.paperType || "standard"}
                onChange={(e) => handleCustomizationChange(selectedFileIndex, "paperType", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors font-inter text-gray-900"
              >
                <option value="standard">Standard (75 GSM)</option>
                <option value="premium">Premium (85 GSM)</option>
                <option value="ultraPremium">Ultra-Premium (100 GSM)</option>
              </select>
            </div>
            <div>
              <label htmlFor={`paperSize-${selectedFileIndex}`} className="font-inter text-sm text-gray-700 font-medium block mb-1">
                Paper Size
              </label>
              <select
                id={`paperSize-${selectedFileIndex}`}
                value={customizations[selectedFileIndex]?.paperSize || "A4"}
                onChange={(e) => handleCustomizationChange(selectedFileIndex, "paperSize", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors font-inter text-gray-900"
              >
                <option value="A4">A4</option>
                <option value="A3">A3 (+2 rs per page)</option>
                <option value="A5">A5</option>
                <option value="Letter">Letter</option>
              </select>
            </div>
            <div>
              <label htmlFor={`colorMode-${selectedFileIndex}`} className="font-inter text-sm text-gray-700 font-medium block mb-1">
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
            <div>
              <label htmlFor={`coverOption-${selectedFileIndex}`} className="font-inter text-sm text-gray-700 font-medium block mb-1">
                Cover Option
              </label>
              <select
                id={`coverOption-${selectedFileIndex}`}
                value={customizations[selectedFileIndex]?.coverOption || "noCover"}
                onChange={(e) => handleCustomizationChange(selectedFileIndex, "coverOption", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors font-inter text-gray-900"
              >
                <option value="noCover">No Cover</option>
                <option value="customCover">Custom Cover (30 rs)</option>
              </select>
              {customizations[selectedFileIndex]?.coverOption === "customCover" && (
                <p className="text-sm text-gray-500 mt-1">The custom cover will be the first page of your PDF.</p>
              )}
            </div>
            <div>
              <label htmlFor={`printingSides-${selectedFileIndex}`} className="font-inter text-sm text-gray-700 font-medium block mb-1">
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
            <div>
              <label htmlFor={`bindingOption-${selectedFileIndex}`} className="font-inter text-sm text-gray-700 font-medium block mb-1">
                Binding Option
              </label>
              <select
                id={`bindingOption-${selectedFileIndex}`}
                value={customizations[selectedFileIndex]?.bindingOption || "noBinding"}
                onChange={(e) => handleCustomizationChange(selectedFileIndex, "bindingOption", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors font-inter text-gray-900"
              >
                <option value="noBinding">No Binding</option>
                <option value="staplerBinding">Stapler Binding (30 rs)</option>
                <option value="softCover">Soft Cover (120 rs)</option>
              </select>
            </div>
          </div>
        </section>
      )}

      {/* Order Summary */}
      <section className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="font-poppins text-2xl text-gray-900 font-semibold mb-4">Order Summary</h2>
        <div className="space-y-4">
          {files.map((file, index) => (
            <div key={index} className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0 last:pb-0">
              <div>
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {customizations[index]?.copies || 1} {customizations[index]?.copies > 1 ? "copies" : "copy"} •
                  {customizations[index]?.paperSize || "A4"} •
                  {customizations[index]?.colorMode === "color" ? "Color" : "B&W"}
                </p>
              </div>
              <p className="font-medium text-gray-900">₹{calculateFilePrice(index).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Total and Actions */}
      <section className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 flex flex-col sm:flex-row gap-6 justify-between items-center">
        <div>
          <h2 className="font-poppins text-2xl text-gray-900 font-semibold">Subtotal: ₹{subtotal.toFixed(2)}</h2>
          <p className="font-inter text-lg text-gray-700">Delivery Fee: ₹{DELIVERY_FEE.toFixed(2)}</p>
          <h2 className="font-poppins text-2xl text-gray-900 font-semibold">Total: ₹{totalPrice.toFixed(2)}</h2>
        </div>
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
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
            {/* <Link
              href="/upload"
              className="bg-transparent border-2 border-blue-400 text-blue-400 font-inter text-lg px-8 py-4 rounded-lg hover:bg-blue-400 hover:text-white transition-colors text-center"
            >
              Upload More Files
            </Link> */}
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