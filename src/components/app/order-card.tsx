import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Order, OrderItem } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface OrderCardProps {
  order: Order;
  onStatusChange: (orderId: string) => void;
  isCompletedView?: boolean;
}

const renderOrderItem = (item: OrderItem) => {
    let description = item.name;
    if (item.customizations) {
        description += ` (${item.customizations})`
    }
    return description;
}

export default function OrderCard({ order, onStatusChange, isCompletedView = false }: OrderCardProps) {

  const timeAgo = formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: ru });
  
  const cardClasses = isCompletedView 
    ? "opacity-70 bg-card/50"
    : "cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-200";

  return (
    <Card 
        className={cardClasses}
        onClick={!isCompletedView ? () => onStatusChange(order.id) : undefined}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-headline">
          Заказ для: {order.customerName}
        </CardTitle>
        <CardDescription>{timeAgo}</CardDescription>
      </CardHeader>
        <CardContent className="py-2">
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {order.items.map((item, index) => (
                <li key={index}>{renderOrderItem(item)}</li>
            ))}
          </ul>
        </CardContent>
      <CardFooter className="pt-4 flex items-center justify-between">
         <Badge variant="outline" className="text-sm font-bold">{order.totalPrice} руб.</Badge>
        {!isCompletedView && (
            <Badge variant="secondary">Нажмите, чтобы завершить</Badge>
        )}
      </CardFooter>
    </Card>
  );
}
