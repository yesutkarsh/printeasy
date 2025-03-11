import { ORDER_STATUS_COLORS, ORDER_STATUSES, type OrderStatus } from "@/lib/orderStatuses"

interface OrderStatusBadgeProps {
  status: OrderStatus
  className?: string
}

export function OrderStatusBadge({ status, className = "" }: OrderStatusBadgeProps) {
  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ORDER_STATUS_COLORS[status]} ${className}`}
    >
      {ORDER_STATUSES[status]}
    </span>
  )
}

