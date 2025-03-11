import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json()
    const { amount, orderId, name, email, phone } = body

    // Validate required fields
    if (!amount || !orderId || !name || !email || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Ensure amount is a number
    if (typeof amount !== 'number') {
      return NextResponse.json({ error: 'Amount must be a number' }, { status: 400 })
    }

    // Convert amount to paise (Razorpay expects smallest currency unit)
    const amountInPaise = Math.round(amount * 100)

    // Retrieve Razorpay credentials from environment variables
    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'Razorpay credentials not set' }, { status: 500 })
    }

    // Prepare Basic Auth header
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')

    // Make API request to Razorpay Orders endpoint
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: orderId,
        notes: {},
      }),
    })

    // Check if the request was successful
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.description || 'Failed to create Razorpay order')
    }

    // Parse the Razorpay order response
    const order = await response.json()

    // Prepare payment options for client-side
    const paymentOptions = {
      amount: amountInPaise.toString(), // Razorpay expects amount as string in paise
      order_id: order.id,
      customerName: name,
      email,
      phone,
    }

    // Return successful response
    return NextResponse.json({ paymentOptions }, { status: 200 })
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment options' },
      { status: 500 }
    )
  }
}
