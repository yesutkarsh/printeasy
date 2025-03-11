export type OrderStatus =
  | "new"
  | "pending"
  | "paid"
  | "payment_failed"
  | "approved"
  | "processing"
  | "quality_check"
  | "packaging"
  | "shipped"
  | "delivered"
  | "cancelled"

export const ORDER_STATUSES: Record<OrderStatus, string> = {
  new: "New",
  pending: "Pending Payment",
  paid: "Payment Received",
  payment_failed: "Payment Failed",
  approved: "Approved",
  processing: "Processing",
  quality_check: "Quality Check",
  packaging: "Packaging",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  new: "bg-blue-100 text-blue-800",
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  payment_failed: "bg-red-100 text-red-800",
  approved: "bg-purple-100 text-purple-800",
  processing: "bg-yellow-100 text-yellow-800",
  quality_check: "bg-indigo-100 text-indigo-800",
  packaging: "bg-teal-100 text-teal-800",
  shipped: "bg-green-100 text-green-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

export const getNextStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
  const statusFlow: OrderStatus[] = [
    "new",
    "pending",
    "paid",
    "approved",
    "processing",
    "quality_check",
    "packaging",
    "shipped",
    "delivered",
  ]

  const currentIndex = statusFlow.indexOf(currentStatus)

  if (currentIndex === -1 || currentStatus === "cancelled" || currentStatus === "payment_failed") {
    return []
  }

  // Return current and next possible statuses
  return [
    currentStatus,
    ...statusFlow.slice(currentIndex + 1),
    "cancelled", // Always allow cancellation
  ]
}

