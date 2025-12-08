import { Button } from '@/components/ui/button';
import type { Order, OrderStatus } from '@/lib/types';
import { Hourglass, Loader2, CheckCircle2, Wand2 } from 'lucide-react';
import OrderCard from './order-card';
import { ScrollArea } from '../ui/scroll-area';

interface OrderColumnProps {
  status: OrderStatus;
  orders: Order[];
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  completeOrder: (orderId: string) => void;
  optimizeQueue?: () => void;
}

const statusConfig = {
  pending: { title: 'В ожидании', icon: Hourglass, iconColor: 'text-chart-4' },
  'in-progress': { title: 'В процессе', icon: Loader2, iconColor: 'text-chart-1' },
  ready: { title: 'Готово', icon: CheckCircle2, iconColor: 'text-chart-2' },
};

export default function OrderColumn({
  status,
  orders,
  updateOrderStatus,
  completeOrder,
  optimizeQueue,
}: OrderColumnProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const isOptimizable = status === 'pending' && optimizeQueue;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className={`h-6 w-6 ${config.iconColor} ${status === 'in-progress' ? 'animate-spin' : ''}`} />
          <h2 className="text-lg font-semibold font-headline">{config.title}</h2>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {orders.length}
          </span>
        </div>
        {isOptimizable && orders.length > 1 && (
          <Button variant="ghost" size="sm" onClick={optimizeQueue} className="text-accent-foreground bg-accent hover:bg-accent/90">
            <Wand2 className="mr-2 h-4 w-4" />
            Оптимизировать
          </Button>
        )}
      </div>
      <ScrollArea className="h-full">
        <div className="space-y-4 rounded-lg bg-card/50 p-2 min-h-[calc(100dvh-14rem)] pr-4">
          {orders.length > 0 ? (
            orders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                updateOrderStatus={updateOrderStatus}
                completeOrder={completeOrder}
              />
            ))
          ) : (
            <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-border">
              <p className="text-sm text-muted-foreground">{`Нет заказов в статусе "${config.title.toLowerCase()}".`}</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
