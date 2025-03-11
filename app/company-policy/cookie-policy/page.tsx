import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SupportButton } from "@/components/support-button"
import { Printer, ArrowLeft, Cookie } from "lucide-react"

export default function page() {
  return (
    <div className="container mx-auto px-4 md:px-6">
      <main className="flex-1">
        <section className="py-12 md:py-16 bg-gradient-to-b from-yellow-50 to-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="rounded-full bg-yellow-100 p-3 animate-spin">
                <Cookie className="h-8 w-8 text-yellow-600" />
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Cookie Policy</h1>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                How we use cookies and similar technologies on our website.
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
            <div className="mx-auto max-w-3xl space-y-8">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tighter md:text-3xl">What Are Cookies?</h2>
                <p className="text-muted-foreground">
                  Cookies are small text files that are placed on your device when you visit a website. They are widely
                  used to make websites work more efficiently and provide information to the website owners.
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-xl font-bold">Types of Cookies We Use</h3>
                  <p className="text-muted-foreground">We use different types of cookies for various purposes:</p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border bg-card p-4">
                      <h4 className="font-medium mb-2">Essential Cookies</h4>
                      <p className="text-sm text-muted-foreground">
                        These cookies are necessary for the website to function properly. They enable basic functions
                        like page navigation and access to secure areas of the website.
                      </p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                      <h4 className="font-medium mb-2">Preference Cookies</h4>
                      <p className="text-sm text-muted-foreground">
                        These cookies allow the website to remember choices you make and provide enhanced, personalized
                        features.
                      </p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                      <h4 className="font-medium mb-2">Analytics Cookies</h4>
                      <p className="text-sm text-muted-foreground">
                        These cookies help us understand how visitors interact with our website by collecting and
                        reporting information anonymously.
                      </p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                      <h4 className="font-medium mb-2">Marketing Cookies</h4>
                      <p className="text-sm text-muted-foreground">
                        These cookies are used to track visitors across websites. The intention is to display ads that
                        are relevant and engaging for the individual user.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-bold">How to Control Cookies</h3>
                  <p className="text-muted-foreground">
                    You can control and/or delete cookies as you wish. You can delete all cookies that are already on
                    your computer and you can set most browsers to prevent them from being placed. However, if you do
                    this, you may have to manually adjust some preferences every time you visit a site and some services
                    and functionalities may not work.
                  </p>
                  <p className="text-muted-foreground">
                    Most web browsers allow some control of most cookies through the browser settings. To find out more
                    about cookies, including how to see what cookies have been set, visit{" "}
                    <Link href="https://www.aboutcookies.org" className="text-yellow-600 hover:underline">
                      www.aboutcookies.org
                    </Link>{" "}
                    or{" "}
                    <Link href="https://www.allaboutcookies.org" className="text-yellow-600 hover:underline">
                      www.allaboutcookies.org
                    </Link>
                    .
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-bold">Third-Party Cookies</h3>
                  <p className="text-muted-foreground">
                    In addition to our own cookies, we may also use various third-party cookies to report usage
                    statistics of the website, deliver advertisements on and through the website, and so on.
                  </p>
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <h4 className="font-medium mb-2">Third-Party Services We Use</h4>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                      <li>Google Analytics (for website analytics)</li>
                      <li>Google Ads (for advertising)</li>
                      <li>Facebook Pixel (for advertising and analytics)</li>
                      <li>Stripe (for payment processing)</li>
                      <li>Hotjar (for user behavior analytics)</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-bold">Changes to Our Cookie Policy</h3>
                  <p className="text-muted-foreground">
                    We may update our Cookie Policy from time to time. We will notify you of any changes by posting the
                    new Cookie Policy on this page and updating the "Last updated" date at the top of this page.
                  </p>
                  <p className="text-muted-foreground">
                    You are advised to review this Cookie Policy periodically for any changes. Changes to this Cookie
                    Policy are effective when they are posted on this page.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-bold">Contact Us</h3>
                  <p className="text-muted-foreground">
                    If you have any questions about our Cookie Policy, please contact us:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>By email: privacy@printeasy.com</li>
                    <li>By phone: +1 (555) 123-4567</li>
                    <li>By mail: 123 Print Street, New York, NY 10001, United States</li>
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

