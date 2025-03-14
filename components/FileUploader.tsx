"use client"

import { useState, useRef } from "react"
import { estimatePdfPageCount } from "@/lib/pdfUtils"

export default function FileUploader({ onFilesAdded }) {
  const fileInputRef = useRef(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  const [uploadErrors, setUploadErrors] = useState({})

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = async (files) => {
    setUploading(true)
    setUploadErrors({})

    // Initialize progress for each file
    const initialProgress = {}
    files.forEach((file) => {
      initialProgress[file.name] = 0
    })
    setUploadProgress(initialProgress)

    // Process each file
    const processedFiles = []
    const errors = {}

    for (const file of files) {
      try {
        // Validate file type
        if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
          errors[file.name] = "Unsupported file type. Please upload PDF, JPG, or PNG files."
          continue
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          errors[file.name] = "File too large. Maximum size is 10MB."
          continue
        }

        // For PDF files, estimate page count based on file size
        let pageCount = 1 // Default to 1 for non-PDF files
        if (file.type === "application/pdf") {
          pageCount = estimatePdfPageCount(file.size)
          console.log(`Estimated ${pageCount} pages for ${file.name} (${Math.round(file.size / 1024)} KB)`)
        }

        // Simulate upload progress
        let progress = 0
        const progressInterval = setInterval(() => {
          progress += Math.floor(Math.random() * 10) + 1
          if (progress > 90) {
            clearInterval(progressInterval)
            progress = 90
          }
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: progress,
          }))
        }, 300)

        // Simulate Cloudinary upload
        // In a real app, you would use the uploadToCloudinary function
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock successful upload
        const mockUploadResult = {
          url: URL.createObjectURL(file),
          publicId: `mock-public-id-${Date.now()}`,
        }

        // Clear interval and set progress to 100%
        clearInterval(progressInterval)
        setUploadProgress((prev) => ({
          ...prev,
          [file.name]: 100,
        }))

        // Add file to processed files
        processedFiles.push({
          ...file,
          pageCount: pageCount,
          downloadURL: mockUploadResult.url,
          publicId: mockUploadResult.publicId,
          uploadTime: new Date().toISOString(),
        })
      } catch (error) {
        console.error("Error processing file:", error)
        errors[file.name] = error.message || "Failed to upload file. Please try again."
      }
    }

    setUploading(false)
    setUploadProgress({})
    setUploadErrors(errors)

    // Pass processed files to parent component
    if (processedFiles.length > 0) {
      onFilesAdded(processedFiles)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current.click()
  }

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
        dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-gray-50"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleChange}
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        disabled={uploading}
      />

      <div className="space-y-4">
        {uploading ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
              <p className="font-inter text-gray-700 text-lg mt-4">Uploading files...</p>
            </div>

            {/* Progress bars */}
            <div className="space-y-3 max-w-md mx-auto">
              {Object.entries(uploadProgress).map(([fileName, progress]) => (
                <div key={fileName} className="space-y-1">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span className="truncate max-w-[200px]">{fileName}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <p className="font-inter text-gray-700 text-lg">Drag & drop your files here or</p>
            <button
              onClick={handleButtonClick}
              className="bg-yellow-400 text-gray-900 font-inter text-lg px-6 py-2 rounded-lg hover:bg-yellow-500 transition-colors shadow-md"
            >
              Select Files
            </button>
            <p className="font-inter text-sm text-gray-500">Supported formats: PDF, JPG, PNG (Max 10MB)</p>
          </>
        )}

        {/* Error messages */}
        {Object.keys(uploadErrors).length > 0 && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
            <p className="font-inter text-red-500 font-medium mb-2">Failed to upload some files:</p>
            <ul className="text-sm text-red-500 space-y-1">
              {Object.entries(uploadErrors).map(([fileName, error]) => (
                <li key={fileName} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    <span className="font-medium">{fileName}</span>: {error}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

