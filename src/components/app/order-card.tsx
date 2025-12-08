import { useState, useEffect } from 'react';
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
import { formatDistanceToNow, intervalToDuration } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

interface OrderCardProps {
  order: Order;
  onStatusChange: (orderId: string) => void;
  isCompletedView?: boolean;
}

const formatDuration = (seconds: number) => {
    const duration = intervalToDuration({ start: 0, end: seconds * 1000 });
    const zeroPad = (num: number | undefined) => String(num || 0).padStart(2, '0');
    return `${zeroPad(duration.minutes)}:${zeroPad(duration.seconds)}`;
};


const renderOrderItem = (item: OrderItem) => {
    let description = item.name;
    if (item.customizations) {
        description += ` (${item.customizations})`
    }
    return description;
}

export default function OrderCard({ order, onStatusChange, isCompletedView = false }: OrderCardProps) {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    if (!isCompletedView) {
      const timer = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isCompletedView]);

  const timeSinceOrder = formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: ru });
  const timeInPreparation = Math.floor((currentTime - order.createdAt) / 1000);

  const isOverdue = !isCompletedView && timeInPreparation > order.estimatedPrepTime;

  const cardClasses = cn(
    "transition-all duration-300",
    isCompletedView
      ? "opacity-70 bg-card/50"
      : "cursor-pointer hover:shadow-lg hover:border-primary/50",
    isOverdue && "animate-pulse border-destructive border-2"
  );


  return (
    <Card 
        className={cardClasses}
        onClick={!isCompletedView ? () => onStatusChange(order.id) : undefined}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-headline">
            Заказ для: {order.customerName}
            </CardTitle>
            {!isCompletedView && (
                <div className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
                    <Clock className={cn("h-4 w-4", isOverdue && "text-destructive")} />
                    <span className={cn(isOverdue && "text-destructive")}>{formatDuration(timeInPreparation)}</span>
                </div>
            )}
        </div>
        <CardDescription>{timeSinceOrder}</CardDescription>
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
