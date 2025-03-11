import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SupportButton } from "@/components/support-button"
import { Printer, ArrowLeft, Shield, Eye, Lock, Server, FileText } from "lucide-react"

export default function page() {
  return (
    <div className="container mx-auto px-4 md:px-6">    
      <main className="flex-1">
        <section className="py-12 md:py-16 bg-gradient-to-b from-yellow-50 to-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="rounded-full bg-yellow-100 p-3 animate-bounce">
                <Shield className="h-8 w-8 text-yellow-600" />
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Privacy Policy</h1>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                How we collect, use, and protect your personal information.
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
                    <Eye className="h-5 w-5 text-yellow-600" />
                  </div>
                  <h2 className="text-xl font-bold">Information We Collect</h2>
                </div>
                <div className="space-y-4">
                  <div className="relative overflow-hidden rounded-lg border bg-background p-6">
                    <div className="space-y-2">
                      <h3 className="font-medium">Personal Information</h3>
                      <p className="text-sm text-muted-foreground">
                        We collect information that you provide directly to us, such as when you create an account, make
                        a purchase, or contact customer support.
                      </p>
                    </div>
                    <div className="absolute right-4 top-4 opacity-15">
                      <FileText className="h-12 w-12 text-yellow-300" />
                    </div>
                  </div>
                  <div className="relative overflow-hidden rounded-lg border bg-background p-6">
                    <div className="space-y-2">
                      <h3 className="font-medium">Usage Information</h3>
                      <p className="text-sm text-muted-foreground">
                        We collect information about how you use our services, including your browsing history, search
                        queries, and interactions with our website.
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
                    <Server className="h-5 w-5 text-yellow-600" />
                  </div>
                  <h2 className="text-xl font-bold">How We Use Information</h2>
                </div>
                <div className="space-y-4">
                  <div className="relative overflow-hidden rounded-lg border bg-background p-6">
                    <div className="space-y-2">
                      <h3 className="font-medium">Provide Services</h3>
                      <p className="text-sm text-muted-foreground">
                        We use your information to provide, maintain, and improve our services, and to develop new
                        products and features.
                      </p>
                    </div>
                    <div className="absolute right-4 top-4 opacity-15">
                      <FileText className="h-12 w-12 text-yellow-300" />
                    </div>
                  </div>
                  <div className="relative overflow-hidden rounded-lg border bg-background p-6">
                    <div className="space-y-2">
                      <h3 className="font-medium">Communication</h3>
                      <p className="text-sm text-muted-foreground">
                        We use your information to communicate with you about our services, respond to your inquiries,
                        and send you promotional materials.
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
                    <Lock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <h2 className="text-xl font-bold">Information Security</h2>
                </div>
                <div className="space-y-4">
                  <div className="relative overflow-hidden rounded-lg border bg-background p-6">
                    <div className="space-y-2">
                      <h3 className="font-medium">Data Protection</h3>
                      <p className="text-sm text-muted-foreground">
                        We implement appropriate security measures to protect your personal information from
                        unauthorized access, alteration, or disclosure.
                      </p>
                    </div>
                    <div className="absolute right-4 top-4 opacity-15">
                      <FileText className="h-12 w-12 text-yellow-300" />
                    </div>
                  </div>
                  <div className="relative overflow-hidden rounded-lg border bg-background p-6">
                    <div className="space-y-2">
                      <h3 className="font-medium">Data Retention</h3>
                      <p className="text-sm text-muted-foreground">
                        We retain your information for as long as necessary to provide our services and fulfill the
                        purposes outlined in this Privacy Policy.
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
                <h2 className="text-2xl font-bold tracking-tighter md:text-3xl">Detailed Privacy Policy</h2>
                <p className="text-muted-foreground">
                  Please read this privacy policy carefully to understand our policies and practices regarding your
                  information.
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-xl font-bold">1. Information We Collect</h3>
                  <p className="text-muted-foreground">
                    We collect several types of information from and about users of our website, including:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>
                      Personal information such as name, postal address, email address, telephone number, and payment
                      information.
                    </li>
                    <li>
                      Information about your internet connection, the equipment you use to access our website, and usage
                      details.
                    </li>
                    <li>Information collected through cookies, web beacons, and other tracking technologies.</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-bold">2. How We Use Your Information</h3>
                  <p className="text-muted-foreground">
                    We use information that we collect about you or that you provide to us:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>To present our website and its contents to you.</li>
                    <li>To provide you with information, products, or services that you request from us.</li>
                    <li>To fulfill any other purpose for which you provide it.</li>
                    <li>
                      To carry out our obligations and enforce our rights arising from any contracts entered into
                      between you and us.
                    </li>
                    <li>
                      To notify you about changes to our website or any products or services we offer or provide through
                      it.
                    </li>
                    <li>In any other way we may describe when you provide the information.</li>
                    <li>For any other purpose with your consent.</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-bold">3. Disclosure of Your Information</h3>
                  <p className="text-muted-foreground">
                    We may disclose aggregated information about our users, and information that does not identify any
                    individual, without restriction. We may disclose personal information that we collect or you provide
                    as described in this privacy policy:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>To our subsidiaries and affiliates.</li>
                    <li>To contractors, service providers, and other third parties we use to support our business.</li>
                    <li>
                      To a buyer or other successor in the event of a merger, divestiture, restructuring,
                      reorganization, dissolution, or other sale or transfer of some or all of our assets.
                    </li>
                    <li>To fulfill the purpose for which you provide it.</li>
                    <li>For any other purpose disclosed by us when you provide the information.</li>
                    <li>With your consent.</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-bold">
                    4. Your Choices About Our Collection, Use, and Disclosure of Your Information
                  </h3>
                  <p className="text-muted-foreground">
                    We strive to provide you with choices regarding the personal information you provide to us. We have
                    created mechanisms to provide you with control over your information:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>
                      You can review and change your personal information by logging into the website and visiting your
                      account profile page.
                    </li>
                    <li>
                      You can opt-out of receiving promotional emails from us by following the unsubscribe link in each
                      email.
                    </li>
                    <li>You can choose to disable cookies through your browser settings.</li>
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

