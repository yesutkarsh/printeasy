"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { logoutUser } from "@/lib/firebase"
import { useRouter } from "next/navigation"

export default function Navbar() {
  const { user, loading } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logoutUser()
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <nav className="bg-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="font-poppins text-xl font-bold text-gray-900">PrintEasy</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="font-inter text-gray-900 hover:text-blue-400 transition-colors">
              Home
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className="font-inter text-gray-900 hover:text-blue-400 transition-colors">
                  Dashboard
                </Link>
                <Link href="/upload" className="font-inter text-gray-900 hover:text-blue-400 transition-colors">
                  Upload
                </Link>
                <Link href="/cart" className="font-inter text-gray-900 hover:text-blue-400 transition-colors">
                  Cart
                </Link>
                <Link href="/profile" className="font-inter text-gray-900 hover:text-blue-400 transition-colors">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="font-inter text-gray-900 hover:text-blue-400 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="font-inter text-gray-900 hover:text-blue-400 transition-colors">
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-yellow-400 text-gray-900 font-inter px-4 py-2 rounded-lg hover:bg-opacity-80 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Navigation Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-900 focus:outline-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className="font-inter text-gray-900 hover:text-blue-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="font-inter text-gray-900 hover:text-blue-400 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/upload"
                    className="font-inter text-gray-900 hover:text-blue-400 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Upload
                  </Link>
                  <Link
                    href="/cart"
                    className="font-inter text-gray-900 hover:text-blue-400 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Cart
                  </Link>
                  <Link
                    href="/profile"
                    className="font-inter text-gray-900 hover:text-blue-400 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                    className="font-inter text-gray-900 hover:text-blue-400 transition-colors text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="font-inter text-gray-900 hover:text-blue-400 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="bg-yellow-400 text-gray-900 font-inter px-4 py-2 rounded-lg hover:bg-opacity-80 transition-colors inline-block"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

