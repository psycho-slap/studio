import type { Order, OrderStatus } from '@/lib/types';
import OrderColumn from '@/components/app/order-column';

interface OrderBoardProps {
  orders: Order[];
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  completeOrder: (orderId: string) => void;
  optimizeQueue: () => void;
}

export default function OrderBoard({
  orders,
  updateOrderStatus,
  completeOrder,
  optimizeQueue,
}: OrderBoardProps) {
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const inProgressOrders = orders.filter(o => o.status === 'in-progress');
  const readyOrders = orders.filter(o => o.status === 'ready');

  return (
    <div className="grid min-h-full w-full grid-cols-1 items-start gap-6 md:grid-cols-3 md:gap-8">
      <OrderColumn
        status="pending"
        orders={pendingOrders}
        updateOrderStatus={updateOrderStatus}
        completeOrder={completeOrder}
        optimizeQueue={optimizeQueue}
      />
      <OrderColumn
        status="in-progress"
        orders={inProgressOrders}
        updateOrderStatus={updateOrderStatus}
        completeOrder={completeOrder}
      />
      <OrderColumn
        status="ready"
        orders={readyOrders}
        updateOrderStatus={updateOrderStatus}
        completeOrder={completeOrder}
      />
    </div>
  );
}
