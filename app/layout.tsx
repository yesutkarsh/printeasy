import type React from "react"
import { Inter, Poppins, Roboto } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import Navbar from "@/components/Navbar"
import NextTopLoader from 'nextjs-toploader';
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const poppins = Poppins({
  weight: ["600"],
  subsets: ["latin"],
  variable: "--font-poppins",
})
const roboto = Roboto({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-roboto",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} ${roboto.variable} font-sans`}>
        <AuthProvider>
        <NextTopLoader
        color="#fdcb37"
        height={6}
  crawl={true}
  showSpinner={true}
        />
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}



import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };
