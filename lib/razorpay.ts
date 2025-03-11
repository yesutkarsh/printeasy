

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

// Initialize Razorpay payment
export function initializeRazorpayPayment(paymentOptions) {
  return new Promise((resolve, reject) => {
    try {
      const rzp = new window.Razorpay({
        key: paymentOptions.key || "rzp_live_g1j3iHNHMO0tqk",
        amount: paymentOptions.amount,
        order_id: paymentOptions.order_id,
        name: "PrintEasy",
        description: "Print on Demand Service",
        prefill: {
          name: paymentOptions.customerName,
          email: paymentOptions.email,
          contact: paymentOptions.phone,
        },
        theme: {
          color: "#FFC107",
        },
        handler: (response) => {
          // This function is called when payment is successful
          resolve({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          })
        },
        modal: {
          ondismiss: () => {
            // This function is called when the payment modal is closed
            reject(new Error("Payment cancelled by user"))
          },
        },
      })

      rzp.on("payment.failed", (response) => {
        reject(new Error(response.error.description || "Payment failed"))
      })

      rzp.open()
    } catch (error) {
      reject(error)
    }
  })
}

