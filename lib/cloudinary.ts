const CLOUDINARY_CLOUD_NAME = "dpcvcblbt"
const CLOUDINARY_UPLOAD_PRESET = "printify_uploads"

// Function to upload a file to Cloudinary using unsigned upload with preset
export const uploadToCloudinary = async (file: File): Promise<{ url: string; publicId: string }> => {
  try {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET)

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || "Failed to upload file to Cloudinary")
    }

    const data = await response.json()

    // Ensure we have valid values
    if (!data.secure_url || !data.public_id) {
      throw new Error("Invalid response from Cloudinary: Missing URL or public ID")
    }

    return {
      url: data.secure_url,
      publicId: data.public_id,
    }
  } catch (error) {
    console.error("Cloudinary upload error:", error)
    // Return empty strings instead of throwing to allow the process to continue
    // The UI will handle showing errors to the user
    return {
      url: "",
      publicId: "",
    }
  }
}

// Track files to be deleted - we'll store their public IDs
// Note: For security reasons, we can't directly delete files from the client
// We'll track them and handle deletion through a server function or admin process
export const trackFileForDeletion = async (publicId: string): Promise<void> => {
  try {
    // In a real app, you would store this in Firestore or another database
    // For now, we'll just log it
    console.log(`File marked for deletion: ${publicId}`)

    // Store in localStorage for demo purposes
    const filesToDelete = JSON.parse(localStorage.getItem("cloudinary_files_to_delete") || "[]")
    filesToDelete.push({
      publicId,
      markedAt: new Date().toISOString(),
    })
    localStorage.setItem("cloudinary_files_to_delete", JSON.stringify(filesToDelete))

    return
  } catch (error) {
    console.error("Error tracking file for deletion:", error)
    throw error
  }
}

