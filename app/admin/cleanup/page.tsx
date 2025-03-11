"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"

export default function AdminCleanup() {
  const { user, loading } = useAuth()
  const [filesToDelete, setFilesToDelete] = useState([])
  const [processingFiles, setProcessingFiles] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    // Load files marked for deletion
    const trackedFiles = JSON.parse(localStorage.getItem("cloudinary_files_to_delete") || "[]")
    setFilesToDelete(trackedFiles)
  }, [])

  const handleDeleteFiles = async () => {
    if (filesToDelete.length === 0) {
      setError("No files to delete.")
      return
    }

    if (!confirm(`Are you sure you want to delete ${filesToDelete.length} files from Cloudinary?`)) {
      return
    }

    setProcessingFiles(true)
    setError("")
    setResult(null)

    try {
      // Extract public IDs
      const publicIds = filesToDelete.map((file) => file.publicId)

      // Call the API to delete files
      const response = await fetch("/api/cloudinary/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ publicIds }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete files")
      }

      const data = await response.json()
      setResult(data)

      // Clear the tracked files
      localStorage.removeItem("cloudinary_files_to_delete")
      setFilesToDelete([])
    } catch (error) {
      console.error("Error deleting files:", error)
      setError(error.message || "Failed to delete files. Please try again.")
    } finally {
      setProcessingFiles(false)
    }
  }

  if (loading) {
    return (
      <main className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </main>
    )
  }

  // Only admin users should access this page
  // In a real app, you would check for admin role
  if (!user) {
    return (
      <main className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
          <h1 className="font-poppins text-2xl text-red-500 font-bold mb-4">Access Denied</h1>
          <p className="font-inter text-gray-700 mb-4">You must be logged in to access this page.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-gray-100 min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-poppins text-3xl text-gray-900 font-bold mb-6">Admin: Cloudinary Cleanup</h1>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="font-poppins text-xl font-semibold mb-4">Files Marked for Deletion</h2>

          {filesToDelete.length === 0 ? (
            <p className="font-inter text-gray-600">No files are currently marked for deletion.</p>
          ) : (
            <>
              <p className="font-inter text-gray-600 mb-4">{filesToDelete.length} file(s) are marked for deletion.</p>

              <div className="mb-6 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4">
                <ul className="space-y-2">
                  {filesToDelete.map((file, index) => (
                    <li key={index} className="font-mono text-sm text-gray-700">
                      {file.publicId}{" "}
                      <span className="text-gray-400">({new Date(file.markedAt).toLocaleString()})</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={handleDeleteFiles}
                disabled={processingFiles}
                className={`bg-red-500 text-white font-inter px-4 py-2 rounded-lg ${
                  processingFiles ? "opacity-70 cursor-not-allowed" : "hover:bg-red-600"
                } transition-colors`}
              >
                {processingFiles ? (
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
                    Processing...
                  </span>
                ) : (
                  "Delete All Files"
                )}
              </button>
            </>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg mb-6">
            <p className="font-inter text-sm text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="font-poppins text-xl font-semibold mb-4">Deletion Results</h2>
            <div className="mb-4">
              <p className="font-inter text-gray-600">
                {result.results.filter((r) => r.success).length} of {result.results.length} files were successfully
                deleted.
              </p>
            </div>
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4">
              <ul className="space-y-2">
                {result.results.map((item, index) => (
                  <li key={index} className={`font-mono text-sm ${item.success ? "text-green-600" : "text-red-600"}`}>
                    {item.publicId}: {item.success ? "Success" : "Failed"}
                    {item.error && <span className="block text-xs text-red-500 ml-4">{item.error}</span>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

