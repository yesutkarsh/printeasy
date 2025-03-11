import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: Request) {
  try {
    const { publicIds } = await request.json()

    if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
      return NextResponse.json({ error: "Invalid request. Expected an array of publicIds." }, { status: 400 })
    }

    // Delete files from Cloudinary
    const results = await Promise.all(
      publicIds.map(async (publicId) => {
        try {
          const result = await cloudinary.uploader.destroy(publicId)
          return { publicId, success: result.result === "ok", result }
        } catch (error) {
          console.error(`Error deleting ${publicId}:`, error)
          return { publicId, success: false, error: error.message }
        }
      }),
    )

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Error in delete API route:", error)
    return NextResponse.json({ error: "Failed to process deletion request." }, { status: 500 })
  }
}
