"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { deleteUser } from "firebase/auth"
import {
  FiSettings,
  FiShoppingCart,
  FiUpload,
  FiAlertCircle,
  FiLogOut,
  FiTrash2,
  FiEdit2,
  FiLock,
} from "react-icons/fi"
import BottomNavigation from "@/components/BottomNavigation"
import ChatbotButton from "@/components/ChatbotButton"
// Import the NotificationPermission component

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [bio, setBio] = useState("")
  const [profileImage, setProfileImage] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const DEFAULT_PROFILE_IMAGE =
    "https://imgcdn.stablediffusionweb.com/2024/9/25/f38f097f-cc26-4c81-8cb4-5f4129683c38.jpg"

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid))

        if (userDoc.exists()) {
          const data = userDoc.data()
          setUserData(data)
          setName(data.name || "")
          setPhone(data.phoneNumber || "")
          setBio(data.bio || "")
          setProfileImage(data.profileImage || DEFAULT_PROFILE_IMAGE)
        } else {
          // Set defaults if user doc doesn't exist
          setName(user.displayName || "")
          setProfileImage(DEFAULT_PROFILE_IMAGE)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setUserLoading(false)
      }
    }

    if (user) {
      fetchUserData()
    }
  }, [user])

  const handleProfileImageClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setIsUploading(true)

    try {
      // For demo purposes, we'll just use the default image
      // In a real app, you would upload to Cloudinary here

      // Update user profile in Firestore
      await updateDoc(doc(db, "users", user.uid), {
        profileImage: DEFAULT_PROFILE_IMAGE,
      })

      setProfileImage(DEFAULT_PROFILE_IMAGE)
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("Failed to upload image. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return

    try {
      await updateDoc(doc(db, "users", user.uid), {
        name,
        phoneNumber: phone,
        bio,
        updatedAt: new Date().toISOString(),
      })

      setUserData({
        ...userData,
        name,
        phoneNumber: phone,
        bio,
      })

      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Failed to update profile. Please try again.")
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return

    try {
      // Delete user document from Firestore
      await deleteDoc(doc(db, "users", user.uid))

      // Delete Firebase Auth user
      await deleteUser(auth.currentUser!)

      router.push("/")
    } catch (error) {
      console.error("Error deleting account:", error)
      alert("Failed to delete account. Please try again.")
    }
  }

  if (loading || userLoading) {
    return (
      <main className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </main>
    )
  }

  return (
    <main className="bg-gray-100 min-h-screen pb-20">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 h-32 md:h-48"></div>

      <div className="max-w-4xl mx-auto px-4 relative -mt-16">
        {/* Profile Image and Edit Button */}
        <div className="flex justify-between items-end mb-4">
          <div className="relative cursor-pointer" onClick={handleProfileImageClick}>
            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white">
              {isUploading ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                </div>
              ) : (
                <img src={profileImage || DEFAULT_PROFILE_IMAGE} alt="Profile" className="w-full h-full object-cover" />
              )}
            </div>
            {isEditing && (
              <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 text-white">
                <FiEdit2 size={16} />
              </div>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-full font-medium flex items-center"
            >
              <FiEdit2 className="mr-2" /> Edit Profile
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-full font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-full font-medium"
              >
                Save
              </button>
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
          ) : (
            <div>
              <h1 className="font-poppins text-2xl font-bold text-gray-900">{name || "User"}</h1>
              <p className="text-gray-500">{user?.email}</p>
              {phone && <p className="text-gray-700 mt-1">{phone}</p>}
              {bio && <p className="text-gray-700 mt-4">{bio}</p>}
              <div className="mt-4 text-sm text-gray-500">
                Member since {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : "recently"}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Link
            href="/cart"
            className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <FiShoppingCart className="text-yellow-400 mb-2" size={24} />
            <span className="font-medium text-gray-900">My Cart</span>
          </Link>

          <Link
            href="/upload"
            className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <FiUpload className="text-yellow-400 mb-2" size={24} />
            <span className="font-medium text-gray-900">Upload</span>
          </Link>

          <Link
            href="/profile/complaints"
            className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <FiAlertCircle className="text-yellow-400 mb-2" size={24} />
            <span className="font-medium text-gray-900">Complaints</span>
          </Link>

          <Link
            href="/company-policy/privacy-policy"
            className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <FiLock className="text-yellow-400 mb-2" size={24} />
            <span className="font-medium text-gray-900">Privacy</span>
          </Link>
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="font-poppins text-xl font-semibold text-gray-900 mb-4">Account Settings</h2>

          {/* Add notification permission button */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900">Push Notifications</span>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => router.push("/auth/change-password")}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <FiSettings className="text-gray-500 mr-3" size={20} />
                <span className="font-medium text-gray-900">Change Password</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>

            <button
              onClick={() => {
                auth.signOut()
                router.push("/")
              }}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <FiLogOut className="text-gray-500 mr-3" size={20} />
                <span className="font-medium text-gray-900">Logout</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-between px-4 py-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <FiTrash2 className="text-red-500 mr-3" size={20} />
                <span className="font-medium text-red-600">Delete Account</span>
              </div>
              <span className="text-red-400">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
            <h3 className="font-poppins text-xl font-bold text-gray-900 mb-4">Delete Account</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete your account? This action cannot be undone and all your data will be
              permanently removed.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button onClick={handleDeleteAccount} className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation for Mobile */}
      <BottomNavigation />

      {/* Chatbot Button */}
      <ChatbotButton />
    </main>
  )
}

