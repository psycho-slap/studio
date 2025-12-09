import { useState, useEffect, useCallback } from 'react';
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
import { Clock, CheckCircle2 } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';


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

export default function OrderCard({ order, onStatusChange, isCompletedView = false }: OrderCardProps) {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const firestore = useFirestore();

  useEffect(() => {
    if (!isCompletedView) {
      const timer = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isCompletedView]);

  const handleItemToggle = useCallback((itemId: string) => {
    if (!firestore || isCompletedView) return;

    const newItems = order.items.map(item =>
        item.id === itemId ? { ...item, isReady: !item.isReady } : item
    );
    
    const orderRef = doc(firestore, 'orders', order.id);
    updateDocumentNonBlocking(orderRef, { items: newItems });

  }, [firestore, order, isCompletedView]);


  const timeSinceOrder = formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: ru });
  const timeInPreparation = Math.floor((currentTime - order.createdAt) / 1000);

  const isOverdue = !isCompletedView && timeInPreparation > order.estimatedPrepTime;

  const cardClasses = cn(
    "transition-all duration-300 flex flex-col",
    isCompletedView
      ? "opacity-70 bg-card/50"
      : "hover:shadow-lg hover:border-primary/50",
    isOverdue && "animate-pulse border-destructive border-2"
  );


  return (
    <Card className={cardClasses}>
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
      <CardContent className="py-2 flex-1">
          <div className="space-y-2">
            {order.items.map((item) => (
                <div 
                    key={item.id}
                    onClick={() => handleItemToggle(item.id)}
                    className={cn(
                        "flex items-center justify-between rounded-md border p-3 transition-colors",
                        isCompletedView ? "cursor-default" : "cursor-pointer hover:bg-muted/50",
                        item.isReady && "bg-primary/10 border-primary/50"
                    )}
                >
                    <div className="flex flex-col">
                        <span className={cn("text-sm", item.isReady && "line-through text-muted-foreground")}>
                           {item.name}
                        </span>
                        {item.customizations && (
                             <span className={cn("text-xs text-muted-foreground", item.isReady && "line-through")}>
                                {item.customizations}
                            </span>
                        )}
                    </div>
                    {item.isReady && <CheckCircle2 className="h-5 w-5 text-primary" />}
                </div>
            ))}
          </div>
        </CardContent>
      <CardFooter className="pt-4 flex items-center justify-between">
         <Badge variant="outline" className="text-sm font-bold">{order.totalPrice} руб.</Badge>
        {!isCompletedView && (
            <button
                onClick={(e) => {
                    e.stopPropagation(); // prevent card click from firing
                    onStatusChange(order.id);
                }}
                className="text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-full px-3 py-1"
            >
                Завершить заказ
            </button>
        )}
      </CardFooter>
    </Card>
  );
}
