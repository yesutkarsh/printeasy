"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User } from "firebase/auth"
import { auth, getCurrentUser } from "@/lib/firebase"
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)

        // Redirect logic
        const publicPaths = ["/", "/auth/login", "/auth/signup"]
        const isPublicPath = publicPaths.includes(pathname)

        if (!currentUser && !isPublicPath) {
          router.push("/auth/login")
        } else if (currentUser && (pathname === "/auth/login" || pathname === "/auth/signup")) {
          router.push("/dashboard")
        }
      } catch (error) {
        console.error("Auth check error:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [pathname, router])

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}

