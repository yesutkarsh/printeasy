"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import FileUploader from "@/components/FileUploader"
import PdfPreviewModal from "@/components/PdfPreviewModal"
import { useAuth } from "@/contexts/AuthContext"
import { collection, addDoc, getDoc, updateDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
// Update the import to use the new function name
import { trackFileForDeletion } from "@/lib/cloudinary"

export default function Upload() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [files, setFiles] = useState([])
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, authLoading, router])

  const handleFilesAdded = (newFiles) => {
    // Keep existing files and add new ones
    setFiles((prevFiles) => [...prevFiles, ...newFiles])
    setError("") // Clear error when files are added
  }

  // Update the handleRemoveFile function
  const handleRemoveFile = async (index) => {
    try {
      const fileToRemove = files[index]

      // Mark file for deletion from Cloudinary if it has a publicId
      if (fileToRemove.publicId) {
        await trackFileForDeletion(fileToRemove.publicId)
      }

      // Remove file from state
      setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
    } catch (error) {
      console.error("Error removing file:", error)
      alert("Failed to remove file. Please try again.")
    }
  }

  const handlePreviewFile = (index) => {
    setCurrentPreviewIndex(index)
  }

  const closePreview = () => {
    setCurrentPreviewIndex(null)
  }

  // Update the handleContinue function to append files to existing session if it exists
  const handleContinue = async () => {
    if (files.length === 0) {
      setError("Please upload at least one file to continue.")
      return
    }

    setLoading(true)

    try {
      // Check if there's an existing session
      const sessionId = localStorage.getItem("currentUploadSession")

      if (sessionId) {
        // Get existing session data
        const sessionDoc = await getDoc(doc(db, "uploadSessions", sessionId))

        if (sessionDoc.exists()) {
          const sessionData = sessionDoc.data()
          const existingFiles = sessionData.files || []

          // Combine existing files with new files
          const updatedFiles = [
            ...existingFiles,
            ...files.map((file) => {
              // Create a base object with default values where needed
              const fileData = {
                name: file.name || "Unnamed file",
                type: file.type || "application/octet-stream",
                size: file.size || 0,
                pageCount: file.pageCount || 0,
                uploadTime: file.uploadTime || new Date().toISOString(),
              }

              // Only add properties that are defined
              if (file.downloadURL) fileData.downloadURL = file.downloadURL
              if (file.publicId) fileData.publicId = file.publicId

              return fileData
            }),
          ]

          // Update the session with combined files
          await updateDoc(doc(db, "uploadSessions", sessionId), {
            files: updatedFiles,
            updatedAt: new Date().toISOString(),
          })
        }
      } else {
        // No existing session, create a new one
        // Store files in Firestore
        const filesData = files.map((file) => {
          // Create a base object with default values where needed
          const fileData = {
            name: file.name || "Unnamed file",
            type: file.type || "application/octet-stream",
            size: file.size || 0,
            pageCount: file.pageCount || 0,
            uploadTime: file.uploadTime || new Date().toISOString(),
          }

          // Only add properties that are defined
          if (file.downloadURL) fileData.downloadURL = file.downloadURL
          if (file.publicId) fileData.publicId = file.publicId

          return fileData
        })

        const uploadSession = await addDoc(collection(db, "uploadSessions"), {
          userId: user.uid,
          files: filesData,
          createdAt: new Date().toISOString(),
          status: "pending",
        })

        // Store session ID in localStorage for the customize page
        localStorage.setItem("currentUploadSession", uploadSession.id)
      }

      router.push("/customize")
    } catch (error) {
      console.error("Error saving files:", error)
      setError("Failed to save your files. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <main className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </main>
    )
  }

  return (
    <main className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <section className="max-w-6xl mx-auto mb-12">
        <h1 className="font-poppins text-4xl md:text-5xl text-gray-900 text-center font-bold mb-4 tracking-tight">
          Upload Your Files
          <span className="block mt-2 w-16 h-2 bg-yellow-400 mx-auto rounded-full" />
        </h1>
        <p className="font-inter text-lg md:text-xl text-gray-600 text-center max-w-2xl mx-auto leading-relaxed">
          Drop your lecture notes, project reports, or posters here to get started!
        </p>
      </section>
      {/* Error Message */}
      {error && (
        <div className="max-w-6xl mx-auto mb-6">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <p className="font-inter text-sm text-red-700 flex items-center">{error}</p>
          </div>
        </div>
      )}
      {/* File Uploader */};
      <section className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors p-8 mb-8">
        <FileUploader onFilesAdded={handleFilesAdded} />
      </section>
      {/* Uploaded Files */}
      {files.length > 0 && (
        <section className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-8">
            <h2 className="font-poppins text-2xl text-gray-900 font-semibold mb-6 flex items-center">
              Uploaded Files
              <span className="ml-3 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-inter">
                {files.length} file{files.length > 1 ? "s" : ""}
              </span>
            </h2>
            <ul className="space-y-3">
              {files.map((file, index) => (
                <li
                  key={index}
                  className="group flex items-center justify-between bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-yellow-400 rounded-md flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <span className="font-inter text-gray-700">{file.name}</span>
                      <div className="text-xs text-gray-500">
                        {Math.round(file.size / 1024)} KB
                        {file.pageCount ? ` • ${file.pageCount} pages` : ""}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handlePreviewFile(index)}
                      className="font-inter text-sm px-3 py-1.5 rounded-md bg-white border border-gray-300 hover:border-blue-400 hover:text-blue-500 transition-all"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => handleRemoveFile(index)}
                      className="font-inter text-sm px-3 py-1.5 rounded-md bg-white border border-gray-300 hover:border-red-400 hover:text-red-500 transition-all"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      {/* Preview Modal */}
      {currentPreviewIndex !== null && <PdfPreviewModal file={files[currentPreviewIndex]} onClose={closePreview} />}
      {/* Continue Button */};
      <section className="max-w-6xl mx-auto flex justify-center mt-12">
        <button
          onClick={handleContinue}
          disabled={loading || files.length === 0}
          className={`font-inter text-lg px-8 py-4 rounded-xl shadow-lg transition-all transform ${
            loading || files.length === 0
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-yellow-400 text-gray-900 hover:bg-yellow-500 hover:scale-[1.02]"
          }`}
        >
          {loading ? (
            <span className="flex items-center">
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
            "Continue to Customization"
          )}
        </button>
      </section>
    </main>
  )
}

