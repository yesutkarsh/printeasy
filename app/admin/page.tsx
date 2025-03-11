"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminAuth() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/admin/manageorders")

    setLoading(true)
    setError("")

    // Simple password check - in production, use a more secure method
    if (password === "123") {
      // Store admin auth in session storage
      sessionStorage.setItem("adminAuth", "true")
      router.push("/admin/manageorders")
    } else {
      setError("Invalid password")
      setLoading(false)
    }
  }

  return (
    <main className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h1 className="font-poppins text-3xl text-gray-900 font-semibold mb-6 text-center">Admin Access</h1>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="font-inter text-sm text-gray-700 font-medium block mb-1">
              Admin Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors font-inter text-gray-900"
              placeholder="Enter admin password"
            />
          </div>

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
                Verifying...
              </span>
            ) : (
              "Access Admin Panel"
            )}
          </button>
        </form>
      </div>
    </main>
  )
}

