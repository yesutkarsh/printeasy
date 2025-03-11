"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { loginUser } from "@/lib/firebase"

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      console.log("Firebase API Key:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
      await loginUser(email, password)
      router.push("/dashboard")
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.message || "Failed to log in. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="bg-gray-100 min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        {/* Header */}
        <h1 className="font-poppins text-3xl text-gray-900 text-center font-bold mb-6">Login to Your Account</h1>

        {/* Error Message */}
        {error && <p className="font-inter text-sm text-red-500 text-center mb-4 bg-red-50 p-2 rounded-lg">{error}</p>}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
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
              placeholder="Enter your password"
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
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Links */}
        <p className="font-inter text-sm text-gray-600 text-center mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-blue-400 hover:text-blue-500 font-medium transition-colors">
            Sign Up
          </Link>
        </p>
        <p className="font-inter text-sm text-gray-600 text-center mt-2">
          <Link
            href="/auth/forgot-password"
            className="text-blue-400 hover:text-blue-500 font-medium transition-colors"
          >
            Forgot Password?
          </Link>
        </p>
      </div>
    </main>
  )
}

