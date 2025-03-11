"use client"

import { useState, useEffect, useRef } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/esm/Page/AnnotationLayer.css"
import "react-pdf/dist/esm/Page/TextLayer.css"

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

export default function PdfPreviewModal({ file, onClose }) {
  const [pdfUrl, setPdfUrl] = useState("")
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [loading, setLoading] = useState(true)
  const modalRef = useRef(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (file) {
      // Check if file is a File object or just has a downloadURL
      if (file instanceof File) {
        const url = URL.createObjectURL(file)
        setPdfUrl(url)
        setLoading(false)

        return () => {
          URL.revokeObjectURL(url)
        }
      } else if (file.downloadURL) {
        // If it's an object with downloadURL, use that directly
        setPdfUrl(file.downloadURL)
        setLoading(false)
      } else {
        setLoading(false)
        setError("Invalid file format")
      }
    }
  }, [file])

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
    setLoading(false)
  }

  const changePage = (offset) => {
    setPageNumber((prevPageNumber) => {
      const newPageNumber = prevPageNumber + offset
      return Math.min(Math.max(1, newPageNumber), numPages || 1)
    })
  }

  const previousPage = () => changePage(-1)
  const nextPage = () => changePage(1)

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  if (!file) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className="bg-white rounded-xl shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-poppins text-2xl text-gray-900 font-semibold">Preview: {file.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
            <p className="font-inter text-gray-600 text-center mt-4">Loading preview...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 font-inter">{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {file.type === "application/pdf" || (file.name && file.name.endsWith(".pdf")) ? (
              <div className="flex flex-col items-center">
                <Document
                  file={pdfUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
                      <p className="font-inter text-gray-600 text-center mt-4">Loading PDF...</p>
                    </div>
                  }
                  error={
                    <div className="text-center py-12">
                      <p className="text-red-500 font-inter">Failed to load PDF. Please try again.</p>
                    </div>
                  }
                >
                  <Page
                    pageNumber={pageNumber}
                    width={Math.min(window.innerWidth * 0.8, 600)}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                  />
                </Document>

                {numPages && (
                  <div className="flex items-center justify-between w-full mt-4">
                    <button
                      onClick={previousPage}
                      disabled={pageNumber <= 1}
                      className={`px-4 py-2 rounded-lg ${pageNumber <= 1 ? "bg-gray-200 text-gray-500" : "bg-blue-400 text-white hover:bg-blue-500"} transition-colors`}
                    >
                      Previous
                    </button>
                    <p className="font-inter text-gray-700">
                      Page {pageNumber} of {numPages}
                    </p>
                    <button
                      onClick={nextPage}
                      disabled={pageNumber >= numPages}
                      className={`px-4 py-2 rounded-lg ${pageNumber >= numPages ? "bg-gray-200 text-gray-500" : "bg-blue-400 text-white hover:bg-blue-500"} transition-colors`}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <img
                src={pdfUrl || "/placeholder.svg"}
                alt="Preview"
                className="max-w-full max-h-[500px] mx-auto rounded-lg border border-gray-200"
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

