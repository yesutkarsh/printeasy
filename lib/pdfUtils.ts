/**
 * Utility functions for handling PDF files
 */

/**
 * Estimates the number of pages in a PDF based on file size
 * This is a reliable estimation method when PDF.js is not available
 *
 * @param fileSize Size of the PDF file in bytes
 * @returns Estimated number of pages
 */
export function estimatePdfPageCount(fileSize: number): number {
    // Average PDF page sizes based on content type
    // These values are based on empirical observations and may need adjustment
    const averageTextPageBytes = 30 * 1024 // ~30KB for text-only pages
    const averageImagePageBytes = 100 * 1024 // ~100KB for pages with images
    const averageMixedPageBytes = 60 * 1024 // ~60KB for mixed content
  
    // Use the mixed content estimate as default
    const estimatedPageSize = averageMixedPageBytes
  
    // Calculate estimated pages (minimum 1)
    // For very small files, ensure at least 1 page
    if (fileSize < estimatedPageSize) {
      return 1
    }
  
    // For larger files, estimate based on size
    // Add a small factor to account for PDF overhead
    const overhead = 50 * 1024 // ~50KB for PDF structure
    const estimatedPages = Math.max(1, Math.round((fileSize - overhead) / estimatedPageSize))
  
    return estimatedPages
  }
  
  /**
   * Formats the page count for display
   *
   * @param count Number of pages
   * @returns Formatted string
   */
  export function formatPageCount(count: number): string {
    return `${count} ${count === 1 ? "page" : "pages"}`
  }
  
  