"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { registerUser } from "@/lib/firebase"
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function SignUp() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Register user with Firebase
      const userCredential = await registerUser(email, password)
      const user = userCredential.user

      // Store additional user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        phoneNumber,
        createdAt: new Date().toISOString(),
      })

      router.push("/dashboard")
    } catch (err: any) {
      console.error("Signup error:", err)
      setError(err.message || "Failed to create an account. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="bg-gray-100 min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        {/* Header */}
        <h1 className="font-poppins text-3xl text-gray-900 text-center font-bold mb-6">Create an Account</h1>

        {/* Error Message */}
        {error && <p className="font-inter text-sm text-red-500 text-center mb-4 bg-red-50 p-2 rounded-lg">{error}</p>}

        {/* Form */}
        <form onSubmit={handleSignUp} className="space-y-6">
          {/* Full Name */}
          <div>
            <label htmlFor="name" className="font-inter text-sm text-gray-700 font-medium block mb-1">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors font-inter text-gray-900"
              placeholder="Enter your full name"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="font-inter text-sm text-gray-700 font-medium block mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors font-inter text-gray-900"
              placeholder="Enter your email"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phone" className="font-inter text-sm text-gray-700 font-medium block mb-1">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors font-inter text-gray-900"
              placeholder="Enter your phone number"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="font-inter text-sm text-gray-700 font-medium block mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors font-inter text-gray-900"
              placeholder="Create a password"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-yellow-400 text-gray-900 font-inter text-lg px-8 py-3 rounded-lg shadow-md transition-colors ${
              loading ? "opacity-70 cursor-not-allowed" : "hover:bg-opacity-80"
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
                Creating Account...
              </span>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        {/* Login Link */}
        <p className="font-inter text-sm text-gray-600 text-center mt-6">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue-400 hover:text-blue-500 font-medium transition-colors">
            Login
          </Link>
        </p>
      </div>
    </main>
  )
}

