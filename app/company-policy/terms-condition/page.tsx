import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SupportButton } from "@/components/support-button"
import { Printer, ArrowLeft, FileText, Scale, Clock, ShieldCheck } from "lucide-react"

export default function TermsConditions() {
  return (
<div className="container mx-auto px-4 md:px-6">
      <main className="flex-1">
        <section className="py-12 md:py-16 bg-gradient-to-b from-yellow-50 to-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="rounded-full bg-yellow-100 p-3 animate-pulse">
                <Scale className="h-8 w-8 text-yellow-600" />
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Terms & Conditions</h1>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                The rules and guidelines for using our print on demand services.
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Last updated:</span>
                <span className="font-medium">March 10, 2025</span>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 md:grid-cols-3">
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-yellow-100 p-2">
                    <FileText className="h-5 w-5 text-yellow-600" />
                  </div>
                  <h2 className="text-xl font-bold">Agreement Terms</h2>
                </div>
                <div className="space-y-4">
                  <div className="relative overflow-hidden rounded-lg border bg-background p-6">
                    <div className="space-y-2">
                      <h3 className="font-medium">Acceptance of Terms</h3>
                      <p className="text-sm text-muted-foreground">
                        By accessing or using our services, you agree to be bound by these Terms and Conditions and all
                        applicable laws and regulations.
                      </p>
                    </div>
                    <div className="absolute right-4 top-4 opacity-15">
                      <FileText className="h-12 w-12 text-yellow-300" />
                    </div>
                  </div>
                  <div className="relative overflow-hidden rounded-lg border bg-background p-6">
                    <div className="space-y-2">
                      <h3 className="font-medium">Modifications</h3>
                      <p className="text-sm text-muted-foreground">
                        We reserve the right to modify these Terms and Conditions at any time. Changes will be effective
                        immediately upon posting.
                      </p>
                    </div>
                    <div className="absolute right-4 top-4 opacity-15">
                      <FileText className="h-12 w-12 text-yellow-300" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-yellow-100 p-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <h2 className="text-xl font-bold">Service Terms</h2>
                </div>
                <div className="space-y-4">
                  <div className="relative overflow-hidden rounded-lg border bg-background p-6">
                    <div className="space-y-2">
                      <h3 className="font-medium">Order Processing</h3>
                      <p className="text-sm text-muted-foreground">
                        Orders are typically processed within 1-3 business days. Production times vary depending on the
                        product and quantity ordered.
                      </p>
                    </div>
                    <div className="absolute right-4 top-4 opacity-15">
                      <FileText className="h-12 w-12 text-yellow-300" />
                    </div>
                  </div>
                  <div className="relative overflow-hidden rounded-lg border bg-background p-6">
                    <div className="space-y-2">
                      <h3 className="font-medium">Shipping & Delivery</h3>
                      <p className="text-sm text-muted-foreground">
                        Shipping times depend on the destination and shipping method selected. We are not responsible
                        for delays caused by customs or postal services.
                      </p>
                    </div>
                    <div className="absolute right-4 top-4 opacity-15">
                      <FileText className="h-12 w-12 text-yellow-300" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-yellow-100 p-2">
                    <ShieldCheck className="h-5 w-5 text-yellow-600" />
                  </div>
                  <h2 className="text-xl font-bold">User Responsibilities</h2>
                </div>
                <div className="space-y-4">
                  <div className="relative overflow-hidden rounded-lg border bg-background p-6">
                    <div className="space-y-2">
                      <h3 className="font-medium">Content Ownership</h3>
                      <p className="text-sm text-muted-foreground">
                        You must own or have the right to use any content you submit for printing. You are responsible
                        for ensuring your content does not infringe on any third-party rights.
                      </p>
                    </div>
                    <div className="absolute right-4 top-4 opacity-15">
                      <FileText className="h-12 w-12 text-yellow-300" />
                    </div>
                  </div>
                  <div className="relative overflow-hidden rounded-lg border bg-background p-6">
                    <div className="space-y-2">
                      <h3 className="font-medium">Prohibited Content</h3>
                      <p className="text-sm text-muted-foreground">
                        We reserve the right to refuse printing content that is illegal, offensive, or violates our
                        content policies.
                      </p>
                    </div>
                    <div className="absolute right-4 top-4 opacity-15">
                      <FileText className="h-12 w-12 text-yellow-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-24 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl space-y-8">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tighter md:text-3xl">Detailed Terms & Conditions</h2>
                <p className="text-muted-foreground">
                  Please read these terms and conditions carefully before using our services.
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-xl font-bold">1. Use of Services</h3>
                  <p className="text-muted-foreground">By using our services, you agree to:</p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Provide accurate and complete information when creating an account or placing an order.</li>
                    <li>Maintain the security of your account and password.</li>
                    <li>Not use our services for any illegal or unauthorized purpose.</li>
                    <li>Not attempt to access, modify, or interfere with our systems or their related technologies.</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-bold">2. Products and Services</h3>
                  <p className="text-muted-foreground">Our print on demand services include:</p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Custom printing on various products including t-shirts, books, mugs, and other items.</li>
                    <li>Design services for customers who need assistance creating print-ready files.</li>
                    <li>Shipping and fulfillment services for printed products.</li>
                  </ul>
                  <p className="text-muted-foreground">
                    We reserve the right to modify, suspend, or discontinue any product or service at any time without
                    notice.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-bold">3. Pricing and Payment</h3>
                  <p className="text-muted-foreground">
                    All prices are subject to change without notice. We accept payment through various methods including
                    credit cards, PayPal, and other electronic payment systems.
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>All prices are displayed in the currency specified on our website.</li>
                    <li>Payment must be received in full before we begin processing your order.</li>
                    <li>You agree to pay all charges at the prices then in effect for your purchases.</li>
                    <li>You are responsible for any taxes, duties, or fees that may apply to your purchase.</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-bold">4. Returns and Refunds</h3>
                  <p className="text-muted-foreground">
                    We want you to be completely satisfied with your purchase. If you are not satisfied, please contact
                    us within 14 days of receiving your order.
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Returns are accepted for defective products or printing errors.</li>
                    <li>Custom-designed products cannot be returned unless they are defective.</li>
                    <li>Refunds will be issued to the original payment method used for the purchase.</li>
                    <li>
                      Shipping costs for returns are the responsibility of the customer unless the return is due to our
                      error.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-center">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-yellow-600 hover:text-yellow-700 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Home</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-muted/40">
        <div className="container flex flex-col gap-6 py-8 md:py-12">
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
    </div>
  )
}

