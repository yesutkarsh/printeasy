"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { trackFileForDeletion } from "@/lib/cloudinary"
import { AlertCircle, Check, Info, Truck } from "lucide-react"

// Add the import for the FileUploadModal at the top of the file
import FileUploadModal from "@/components/FileUploadModal"

// Define preset configurations
const PRESETS = [
  {
    id: "preset1",
    name: "Economy B&W",
    description: "Double-sided B&W printing on A4 paper",
    icon: "💰",
    pricePerPage: 2.5,
    config: {
      paperType: "75GSM",
      paperSize: "A4",
      colorMode: "blackAndWhite",
      coverOption: "noCover",
      printingSides: "doubleSided",
      bindingOption: "noBinding",
    },
  },
  {
    id: "preset2",
    name: "Standard Color",
    description: "Double-sided color printing on A4 paper",
    icon: "🌈",
    pricePerPage: 5.5,
    config: {
      paperType: "75GSM",
      paperSize: "A4",
      colorMode: "color",
      coverOption: "noCover",
      printingSides: "doubleSided",
      bindingOption: "noBinding",
    },
  },
  {
    id: "preset3",
    name: "Premium B&W",
    description: "Single-sided B&W printing on A4 paper",
    icon: "✨",
    pricePerPage: 4.5,
    config: {
      paperType: "75GSM",
      paperSize: "A4",
      colorMode: "blackAndWhite",
      coverOption: "noCover",
      printingSides: "singleSided",
      bindingOption: "noBinding",
    },
  },
]

// Constants
const DELIVERY_CHARGE = 70
const MIN_ORDER_VALUE = 199

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
  const [selectedPreset, setSelectedPreset] = useState(null)
  const [customMode, setCustomMode] = useState(false)

  // Add a new state for the modal visibility after the other state declarations
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  const [priceBreakdown, setPriceBreakdown] = useState({
    subtotal: 0,
    deliveryCharge: DELIVERY_CHARGE,
    total: 0,
    items: [],
  })

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
            pricePerPage: 2, // Default price
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
    let subtotalPrice = 0
    const itemBreakdown = []

    Object.keys(customizations).forEach((fileIndex) => {
      const file = files[fileIndex]
      const options = customizations[fileIndex]

      if (file && options) {
        // Base price per page
        const pricePerPage = options.pricePerPage || 2 // Use preset price if available

        // Calculate price for this file
        const copies = options.copies || 1
        const pageCount = file.pageCount || 1
        const filePrice = pageCount * pricePerPage * copies

        // Add binding cost if applicable
        let bindingCost = 0
        if (options.bindingOption === "softCover") bindingCost = 30

        // Add cover cost if applicable
        let coverCost = 0
        if (options.coverOption === "thickColorCover") coverCost = 20

        const itemTotal = filePrice + bindingCost + coverCost
        subtotalPrice += itemTotal

        // Add to breakdown
        itemBreakdown.push({
          name: file.name,
          pageCount,
          copies,
          pricePerPage,
          bindingCost,
          coverCost,
          total: itemTotal,
        })
      }
    })

    // Update price breakdown
    const breakdown = {
      subtotal: subtotalPrice,
      deliveryCharge: DELIVERY_CHARGE,
      total: subtotalPrice + DELIVERY_CHARGE,
      items: itemBreakdown,
    }

    setPriceBreakdown(breakdown)
    setSubtotal(subtotalPrice)
    setTotalPrice(subtotalPrice + DELIVERY_CHARGE)
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

  const applyPresetToFile = (fileIndex, preset) => {
    setCustomizations((prev) => ({
      ...prev,
      [fileIndex]: {
        ...prev[fileIndex],
        ...preset.config,
        pricePerPage: preset.pricePerPage,
      },
    }))
  }

  const applyPresetToAll = (preset) => {
    const updatedCustomizations = {}

    files.forEach((_, index) => {
      updatedCustomizations[index] = {
        ...customizations[index],
        ...preset.config,
        pricePerPage: preset.pricePerPage,
        copies: customizations[index]?.copies || 1, // Preserve copies
      }
    })

    setCustomizations(updatedCustomizations)
    setSelectedPreset(preset.id)
    setCustomMode(false)
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

  // Add a new function to handle adding more files after the other handler functions
  const handleAddMoreFiles = (newFiles) => {
    // Combine existing files with new files
    setFiles((prevFiles) => [...prevFiles, ...newFiles])

    // Initialize customizations for new files
    const updatedCustomizations = { ...customizations }
    newFiles.forEach((_, index) => {
      const newIndex = files.length + index
      updatedCustomizations[newIndex] = {
        copies: 1,
        paperType: "75GSM",
        paperSize: "A4",
        colorMode: "blackAndWhite",
        coverOption: "noCover",
        printingSides: "singleSided",
        bindingOption: "noBinding",
        pricePerPage: 2, // Default price
      }
    })

    setCustomizations(updatedCustomizations)
  }

  const handleAddToCart = async () => {
    // Check minimum order value
    if (subtotal < MIN_ORDER_VALUE) {
      setError(
        `Minimum order value is ₹${MIN_ORDER_VALUE} (excluding delivery charges). Please add more items or copies.`,
      )
      return
    }

    setLoading(true)
    setError("")

    try {
      // Update the upload session with customizations
      await updateDoc(doc(db, "uploadSessions", sessionId), {
        customizations,
        subtotal,
        deliveryCharge: DELIVERY_CHARGE,
        totalPrice,
        updatedAt: new Date().toISOString(),
        status: "customized",
      })

      // Add to cart in Firestore
      const cartItem = {
        sessionId,
        files,
        customizations,
        subtotal,
        deliveryCharge: DELIVERY_CHARGE,
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

    // Use preset price if available
    const pricePerPage = options.pricePerPage || 2

    // Calculate price for this file
    const filePrice = file.pageCount * pricePerPage * (options.copies || 1)

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
          Choose a preset or customize your prints with options for paper, color, binding, and more!
        </p>
      </section>

      {/* Error Message */}
      {error && (
        <div className="max-w-6xl mx-auto mb-6">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <p className="font-inter text-sm text-red-700 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Minimum Order Value Notice */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
          <p className="font-inter text-sm text-blue-700 flex items-center">
            <Info className="w-5 h-5 mr-2" />
            Minimum order value is ₹{MIN_ORDER_VALUE} (excluding delivery charges).
          </p>
        </div>
      </div>

      {/* File Selection Section */}
      <section className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="font-poppins text-2xl text-gray-900 font-semibold mb-4">Your Files</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedFileIndex === index
                  ? "border-blue-400 bg-blue-50 shadow-md transform scale-[1.02]"
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
              {selectedFileIndex === index && (
                <div className="mt-2 text-xs text-blue-600 flex items-center justify-center">
                  <span className="bg-blue-100 px-2 py-1 rounded-full">Currently Editing</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Preset Selection Section */}
      <section className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="font-poppins text-2xl text-gray-900 font-semibold mb-4">Choose a Preset</h2>
        <p className="text-gray-600 mb-6">Select a preset configuration or customize your own settings.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {PRESETS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => applyPresetToAll(preset)}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedPreset === preset.id && !customMode
                  ? "border-yellow-400 bg-yellow-50 shadow-md"
                  : "border-gray-200 hover:border-yellow-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-2xl mr-2">{preset.icon}</span>
                  <h3 className="font-medium text-gray-900">{preset.name}</h3>
                </div>
                {selectedPreset === preset.id && !customMode && (
                  <span className="bg-yellow-400 rounded-full p-1">
                    <Check className="w-4 h-4 text-white" />
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">{preset.description}</p>
              <p className="text-sm font-medium text-yellow-600">₹{preset.pricePerPage} per page</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => {
              setCustomMode(true)
              setSelectedPreset(null)
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              customMode ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-blue-100"
            }`}
          >
            {customMode ? "Custom Mode (Active)" : "I want to customize"}
          </button>
        </div>
      </section>

      {/* Customization Section - Only show if custom mode is active */}
      {customMode && selectedFileIndex !== null && (
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
                onChange={(e) => {
                  handleCustomizationChange(selectedFileIndex, "colorMode", e.target.value)
                  // Update price per page based on color mode
                  const newPricePerPage = e.target.value === "color" ? 10 : 2
                  handleCustomizationChange(selectedFileIndex, "pricePerPage", newPricePerPage)
                }}
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

          {/* Apply to all files button */}
          {files.length > 1 && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => {
                  const currentConfig = customizations[selectedFileIndex]
                  const updatedCustomizations = {}

                  files.forEach((_, index) => {
                    updatedCustomizations[index] = {
                      ...currentConfig,
                      copies: customizations[index]?.copies || 1, // Preserve copies
                    }
                  })

                  setCustomizations(updatedCustomizations)
                }}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Apply these settings to all files
              </button>
            </div>
          )}
        </section>
      )}

      {/* Price Breakdown Section */}
      <section className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="font-poppins text-2xl text-gray-900 font-semibold mb-4">Price Breakdown</h2>

        <div className="space-y-6">
          {/* Items breakdown */}
          <div className="space-y-4">
            {priceBreakdown.items.map((item, index) => (
              <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900 truncate max-w-md">{item.name}</p>
                    <div className="text-sm text-gray-600 mt-1 space-y-1">
                      <p>
                        {item.pageCount} pages × {item.copies} {item.copies > 1 ? "copies" : "copy"} × ₹
                        {item.pricePerPage.toFixed(2)}/page = ₹
                        {(item.pageCount * item.copies * item.pricePerPage).toFixed(2)}
                      </p>
                      {item.bindingCost > 0 && <p>Binding: ₹{item.bindingCost.toFixed(2)}</p>}
                      {item.coverCost > 0 && <p>Cover: ₹{item.coverCost.toFixed(2)}</p>}
                    </div>
                  </div>
                  <p className="font-medium text-gray-900">₹{item.total.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Subtotal */}
          <div className="flex justify-between border-t border-gray-200 pt-4">
            <p className="font-medium text-gray-700">Subtotal</p>
            <p className="font-medium text-gray-900">₹{priceBreakdown.subtotal.toFixed(2)}</p>
          </div>

          {/* Delivery charge */}
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Truck className="w-5 h-5 text-gray-500 mr-2" />
              <p className="font-medium text-gray-700">Delivery Charge</p>
            </div>
            <p className="font-medium text-gray-900">₹{priceBreakdown.deliveryCharge.toFixed(2)}</p>
          </div>

          {/* Total */}
          <div className="flex justify-between border-t border-gray-200 pt-4">
            <p className="font-bold text-lg text-gray-900">Total</p>
            <p className="font-bold text-lg text-gray-900">₹{priceBreakdown.total.toFixed(2)}</p>
          </div>

          {/* Minimum order warning */}
          {subtotal < MIN_ORDER_VALUE && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Your order subtotal (₹{subtotal.toFixed(2)}) is below the minimum order value of ₹{MIN_ORDER_VALUE}.
                    Please add more items or copies to proceed.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Total Price and Actions */}
      <section className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 flex flex-col sm:flex-row gap-6 justify-between items-center">
        <div>
          <h2 className="font-poppins text-2xl text-gray-900 font-semibold">Total: ₹{totalPrice.toFixed(2)}</h2>
          <p className="text-sm text-gray-600">Including ₹{DELIVERY_CHARGE} delivery charge</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleAddToCart}
            disabled={loading || subtotal < MIN_ORDER_VALUE}
            className={`bg-yellow-400 text-gray-900 font-inter text-lg px-8 py-4 rounded-lg shadow-md transition-colors ${
              loading || subtotal < MIN_ORDER_VALUE ? "opacity-70 cursor-not-allowed" : "hover:bg-opacity-80"
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
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-transparent border-2 border-blue-400 text-blue-400 font-inter text-lg px-8 py-4 rounded-lg hover:bg-blue-400 hover:text-white transition-colors text-center"
            >
              Upload More Files
            </button>
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
      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onFilesAdded={handleAddMoreFiles}
      />
    </main>
  )
}

