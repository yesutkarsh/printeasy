import React from 'react'
import Link from 'next/link'
import { Printer, ChevronRight, Mail, Phone } from "lucide-react"
export default function Footer() {
  return (
    <footer className="p-12 border-t bg-muted/40">
        <div className="container flex flex-col gap-6 py-8 md:py-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Printer className="h-6 w-6 text-yellow-500" />
                <span className="text-lg font-bold">PrintEasy</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your one-stop print on demand service for all your printing needs.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-base font-medium">Company</h3>
              <Link href="/company-policy/about" className="text-sm text-muted-foreground hover:text-yellow-500 transition-colors">
                About
              </Link>
              <Link href="/careers" className="text-sm text-muted-foreground hover:text-yellow-500 transition-colors">
                Careers
              </Link>
              <Link href="/company-policy/contact" className="text-sm text-muted-foreground hover:text-yellow-500 transition-colors">
                Contact
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-base font-medium">Services</h3>
              <Link
                href="/services/tshirts"
                className="text-sm text-muted-foreground hover:text-yellow-500 transition-colors"
              >
                T-Shirts [NA]
              </Link>
              <Link
                href="/upload"
                className="text-sm text-muted-foreground hover:text-yellow-500 transition-colors"
              >
                Books 
              </Link>
              <Link
                href="/upload"
                className="text-sm text-muted-foreground hover:text-yellow-500 transition-colors"
              >
                Custom Printing
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-base font-medium">Legal</h3>
              <Link
                href="/company-policy/privacy-policy"
                className="text-sm text-muted-foreground hover:text-yellow-500 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/company-policy/terms-condition"
                className="text-sm text-muted-foreground hover:text-yellow-500 transition-colors"
              >
                Terms & Conditions
              </Link>
              <Link
                href="/company-policy/cookie-policy"
                className="text-sm text-muted-foreground hover:text-yellow-500 transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-base font-medium">Connect</h3>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">contactutkarshverma@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">+91 7985748915</span>
              </div>
              <div className="flex gap-2 mt-2">
                <Link href="#" className="rounded-full bg-muted p-2 hover:bg-yellow-100 transition-colors">
                  <svg
                    className="h-4 w-4 text-muted-foreground"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </Link>
                <Link href="#" className="rounded-full bg-muted p-2 hover:bg-yellow-100 transition-colors">
                  <svg
                    className="h-4 w-4 text-muted-foreground"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </Link>
                <Link href="#" className="rounded-full bg-muted p-2 hover:bg-yellow-100 transition-colors">
                  <svg
                    className="h-4 w-4 text-muted-foreground"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row items-center justify-between">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} PrintEasy. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link
                href="/company-policy/privacy-policy"
                className="text-xs text-muted-foreground hover:text-yellow-500 transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/company-policy/terms-condition"
                className="text-xs text-muted-foreground hover:text-yellow-500 transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/company-policy/cookie-policy"
                className="text-xs text-muted-foreground hover:text-yellow-500 transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
  )
}
