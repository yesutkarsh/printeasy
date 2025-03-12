"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import PendingOrdersNotification from "@/components/PendingOrdersNotification"
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { ORDER_STATUS_COLORS, ORDER_STATUSES } from "@/lib/orderStatuses"
import { ComingSoonMarker } from "@/components/ComingSoonMarker"
import Footer from "@/components/Footer"

export default function Home() {
  const { user, loading } = useAuth()
  const [recentOrders, setRecentOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)

  // Fetch recent orders for authenticated users
  useEffect(() => {
    const fetchRecentOrders = async () => {
      if (!user) return

      setLoadingOrders(true)
      try {
        const ordersQuery = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
          where("status", "in", [
            "paid",
            "approved",
            "processing",
            "quality_check",
            "packaging",
            "shipped",
            "delivered",
          ]),
          orderBy("createdAt", "desc"),
          limit(3),
        )

        const querySnapshot = await getDocs(ordersQuery)
        const ordersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setRecentOrders(ordersData)
      } catch (error) {
        console.error("Error fetching recent orders:", error)
      } finally {
        setLoadingOrders(false)
      }
    }

    if (user) {
      fetchRecentOrders()
    }
  }, [user])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date)
  }

  // Show loading state while auth is being checked
  if (loading) {
    return (
      <main className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </main>
    )
  }

  // Authenticated user view
  if (user) {
    return (
      <main className="bg-gray-100 min-h-screen">
        {/* Welcome Section */}
        <section className="bg-gradient-to-b from-gray-50 to-gray-100 py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-8 md:mb-0">
                <h1 className="font-poppins text-3xl md:text-4xl text-gray-900 font-bold mb-3">
                  Welcome back, <span className="text-blue-400">{user.displayName || "there"}!</span>
                </h1>
                <p className="font-inter text-lg text-gray-700 mb-6 max-w-xl">
                  Ready to create something amazing? Explore our printing services or check your recent orders.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/upload"
                    className="bg-yellow-400 text-gray-900 font-inter text-lg px-6 py-3 rounded-xl shadow-lg hover:bg-opacity-80 transition-colors"
                  >
                    Start New Order
                  </Link>
                  <Link
                    href="/dashboard"
                    className="bg-transparent border-2 border-blue-400 text-blue-400 font-inter text-lg px-6 py-3 rounded-xl hover:bg-blue-400 hover:text-white transition-colors"
                  >
                    View All Orders
                  </Link>
                </div>
              </div>
              <div className="w-full md:w-1/3 lg:w-2/5">
                <img
                  src="https://m.media-amazon.com/images/I/71RMCXc1YLS.jpg"
                  alt="Printing Services"
                  className="w-full h-auto rounded-xl shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Pending Orders Notification */}
        <section className="max-w-6xl mx-auto px-4 py-6">
          <PendingOrdersNotification />
        </section>

        {/* Recent Orders Section */}
        <section className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-poppins text-2xl text-gray-900 font-bold">Recent Orders</h2>
            <Link href="/dashboard" className="text-blue-400 hover:text-blue-500 font-medium">
              View All Orders →
            </Link>
          </div>

          {loadingOrders ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentOrders.map((order) => (
                <Link href={`/orders/${order.id}`} key={order.id} className="block">
                  <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 border border-gray-100">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-medium text-gray-900">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${ORDER_STATUS_COLORS[order.status]}`}
                      >
                        {ORDER_STATUSES[order.status]}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">
                        {order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""}
                      </p>
                      <p className="font-medium text-gray-900">₹{order.totalAmount?.toFixed(2) || "0.00"}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <p className="text-gray-600 mb-4">You don't have any orders yet.</p>
              <Link
                href="/upload"
                className="inline-block bg-yellow-400 text-gray-900 px-6 py-2 rounded-lg hover:bg-yellow-500 transition-colors"
              >
                Create Your First Order
              </Link>
            </div>
          )}
        </section>

        {/* Product Categories */}
        <section className="py-12 bg-white">
          <ComingSoonMarker/>
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="font-poppins text-3xl text-gray-900 font-bold text-center mb-10">Explore Our Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Books & Documents */}
              <div className="bg-gray-50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="h-48 overflow-hidden">
                  <img
                    src="https://www.thebearandthefox.com/wp-content/uploads/2019/08/Preview-Books-About-Colours-1.jpg"
                    alt="Books & Documents"
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-poppins text-xl font-semibold mb-2">Books & Documents</h3>
                  <p className="font-inter text-gray-600 text-sm mb-4">
                    Print your thesis, reports, and books with premium binding options.
                  </p>
                  <Link
                    href="/upload?category=books"
                    className="inline-block bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg text-sm hover:bg-yellow-500 transition-colors"
                  >
                    Start Printing
                  </Link>
                </div>
              </div>

              {/* Custom T-Shirts */}
              <div className="bg-gray-50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="h-48 overflow-hidden">
                  <img
                    src="https://images.vexels.com/media/users/3/348569/raw/384ec3d620a317d8087bc9cc0f01b06d-vibrant-skull-t-shirt-design.jpg"
                    alt="Custom T-Shirts"
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-poppins text-xl font-semibold mb-2">Custom T-Shirts</h3>
                  <p className="font-inter text-gray-600 text-sm mb-4">
                    Design your own t-shirts with our easy-to-use customization tools.
                  </p>
                  <Link
                    href="/upload?category=tshirts"
                    className="inline-block bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg text-sm hover:bg-yellow-500 transition-colors"
                  >
                    Design Now
                  </Link>
                </div>
              </div>

              {/* Stationery */}
              <div className="bg-gray-50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="h-48 overflow-hidden">
                  <img
                    src="https://th.bing.com/th/id/OIP.5FsYTHgylSoAsIz0w3ZVywHaEu?rs=1&pid=ImgDetMain"
                    alt="Stationery"
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-poppins text-xl font-semibold mb-2">Stationery</h3>
                  <p className="font-inter text-gray-600 text-sm mb-4">
                    Geometry boxes, notebooks, and custom stationery for students.
                  </p>
                  <Link
                    href="/upload?category=stationery"
                    className="inline-block bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg text-sm hover:bg-yellow-500 transition-colors"
                  >
                    Explore Options
                  </Link>
                </div>
              </div>

              {/* Gift Items */}
              <div className="bg-gray-50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="h-48 overflow-hidden">
                  <img
                    src="https://cdn.dribbble.com/users/336757/screenshots/17247155/dribbble_gift_4x.png"
                    alt="Gift Items"
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-poppins text-xl font-semibold mb-2">Gift Items</h3>
                  <p className="font-inter text-gray-600 text-sm mb-4">
                    Personalized gifts for Valentine's Day, birthdays, and special occasions.
                  </p>
                  <Link
                    href="/upload?category=gifts"
                    className="inline-block bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg text-sm hover:bg-yellow-500 transition-colors"
                  >
                    Customize Gifts
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Special Offers */}
        <section className="py-12 bg-gradient-to-r from-blue-50 to-blue-100">
        <ComingSoonMarker/>

          <div className="max-w-6xl mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                  <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                    Limited Time Offer
                  </span>
                  <h2 className="font-poppins text-3xl font-bold text-gray-900 mb-4">
                    20% Off on Valentine's Day Gifts
                  </h2>
                  <p className="font-inter text-gray-600 mb-6">
                    Create personalized gifts for your loved ones. Order now and get 20% off on all Valentine's Day
                    items.
                  </p>
                  <div>
                    <Link
                      href="https://img.freepik.com/free-vector/watercolor-background-valentines-day-celebration_23-2151165466.jpg"
                      className="inline-block bg-blue-400 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-500 transition-colors"
                    >
                      Shop Now
                    </Link>
                  </div>
                </div>
                <div className="md:w-1/2">
                  <img
                    src="https://img.freepik.com/free-vector/watercolor-background-valentines-day-celebration_23-2151165466.jpg"
                    alt="Valentine's Day Offer"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="font-poppins text-3xl text-gray-900 font-bold text-center mb-12">What Our Customers Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4">
                    <img className="rounded-full w-12 h-12" src="data:image/jpeg;base64,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" alt="" />
                  </div>
                  <div>
                    <h3 className="font-poppins text-lg font-semibold">Priya Sharma</h3>
                    <p className="text-gray-500 text-sm">Delhi University</p>
                  </div>
                </div>
                <p className="font-inter text-gray-600">
                  "I needed my thesis printed urgently and PrintEasy delivered it within 24 hours. The quality was
                  excellent and the binding was perfect!"
                </p>
                <div className="flex mt-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4">
                    <img className="rounded-full w-12 h-12" src="data:image/jpeg;base64,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" alt="" />

                  </div>
                  <div>
                    <h3 className="font-poppins text-lg font-semibold">Rahul Verma</h3>
                    <p className="text-gray-500 text-sm">IIT Bombay</p>
                  </div>
                </div>
                <p className="font-inter text-gray-600">
                  "The custom t-shirts I ordered for our college fest were amazing! Everyone loved the design and the
                  print quality was top-notch."
                </p>
                <div className="flex mt-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4">
                    <img className="rounded-full" src="https://cdn-prod-static.heartfulness.org/Ananya_Patel_3583afaf01.jpg" alt="" />
                  </div>
                  <div>
                    <h3 className="font-poppins text-lg font-semibold">Ananya Patel</h3>
                    <p className="text-gray-500 text-sm">Entrepreneur</p>
                  </div>
                </div>
                <p className="font-inter text-gray-600">
                  "I ordered personalized notebooks for my startup team and they turned out beautiful. The customer
                  service was excellent and delivery was prompt."
                </p>
                <div className="flex mt-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        
      <Footer/>

      </main>
    )
  }

  // Non-authenticated user view (original landing page)
  return (
    <main className="bg-gray-100 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-gray-100 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="font-poppins text-4xl md:text-6xl text-gray-900 font-bold mb-6 leading-tight">
            Print Your Documents <br className="hidden md:block" />
            <span className="text-blue-400">Quickly</span> and <span className="text-yellow-400">Easily</span>
          </h1>
          <p className="font-inter text-lg md:text-xl text-gray-700 mb-10 max-w-3xl mx-auto">
            Upload your lecture notes, project reports, or posters and get them printed and delivered to your doorstep!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/upload"
              className="bg-yellow-400 text-gray-900 font-inter text-lg px-8 py-4 rounded-xl shadow-lg hover:bg-opacity-80 transition-colors"
            >
              Start Printing Now
            </Link>
            <Link
              href="/auth/signup"
              className="bg-transparent border-2 border-blue-400 text-blue-400 font-inter text-lg px-8 py-4 rounded-xl hover:bg-blue-400 hover:text-white transition-colors"
            >
              Create an Account
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-poppins text-3xl md:text-4xl text-gray-900 font-bold text-center mb-12">
            Why Choose PrintEasy?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-poppins text-xl font-semibold mb-2">Fast Turnaround</h3>
              <p className="font-inter text-gray-600">
                Get your documents printed and delivered within 24-48 hours of placing your order.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-poppins text-xl font-semibold mb-2">Affordable Pricing</h3>
              <p className="font-inter text-gray-600">
                Competitive pricing with special discounts for students and bulk orders.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="font-poppins text-xl font-semibold mb-2">Quality Guaranteed</h3>
              <p className="font-inter text-gray-600">
                High-quality printing with various paper options and binding styles to choose from.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-poppins text-3xl md:text-4xl text-gray-900 font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-poppins text-xl font-bold">
                1
              </div>
              <h3 className="font-poppins text-xl font-semibold mb-2">Upload</h3>
              <p className="font-inter text-gray-600">
                Upload your PDF or image files through our easy-to-use interface.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-poppins text-xl font-bold">
                2
              </div>
              <h3 className="font-poppins text-xl font-semibold mb-2">Customize</h3>
              <p className="font-inter text-gray-600">
                Choose paper type, size, color options, and binding preferences.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-poppins text-xl font-bold">
                3
              </div>
              <h3 className="font-poppins text-xl font-semibold mb-2">Pay</h3>
              <p className="font-inter text-gray-600">
                Securely pay for your order using our integrated payment system.
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-poppins text-xl font-bold">
                4
              </div>
              <h3 className="font-poppins text-xl font-semibold mb-2">Receive</h3>
              <p className="font-inter text-gray-600">
                Get your printed documents delivered to your doorstep or pick them up.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="font-poppins text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="font-inter text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Join thousands of students who trust PrintEasy for their printing needs.
          </p>
          <Link
            href="/upload"
            className="bg-yellow-400 text-gray-900 font-inter text-lg px-8 py-4 rounded-xl shadow-lg hover:bg-opacity-80 transition-colors inline-block"
          >
            Upload Your Files Now
          </Link>
        </div>
      </section>


      <Footer/>
    </main>
  )
}

