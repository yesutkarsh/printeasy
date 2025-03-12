"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FiHome, FiUpload, FiShoppingCart, FiUser } from "react-icons/fi"

export default function BottomNavigation() {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(true)

  // Don't show on admin pages
  useEffect(() => {
    if (pathname?.startsWith("/admin")) {
      setIsVisible(false)
    } else {
      setIsVisible(true)
    }
  }, [pathname])

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden">
      <div className="flex justify-around items-center h-16">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center w-full h-full ${
            pathname === "/" ? "text-yellow-400" : "text-gray-500"
          }`}
        >
          <FiHome size={20} />
          <span className="text-xs mt-1">Home</span>
        </Link>

        <Link
          href="/upload"
          className={`flex flex-col items-center justify-center w-full h-full ${
            pathname === "/upload" ? "text-yellow-400" : "text-gray-500"
          }`}
        >
          <FiUpload size={20} />
          <span className="text-xs mt-1">Upload</span>
        </Link>

        <Link
          href="/cart"
          className={`flex flex-col items-center justify-center w-full h-full ${
            pathname === "/cart" ? "text-yellow-400" : "text-gray-500"
          }`}
        >
          <FiShoppingCart size={20} />
          <span className="text-xs mt-1">Cart</span>
        </Link>

        <Link
          href="/profile"
          className={`flex flex-col items-center justify-center w-full h-full ${
            pathname === "/profile" ? "text-yellow-400" : "text-gray-500"
          }`}
        >
          <FiUser size={20} />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </div>
  )
}

