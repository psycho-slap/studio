import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Order } from '@/lib/types';
import { DRINKS } from '@/lib/data';
import { Coffee } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface OrderCardProps {
  order: Order;
  onStatusChange: (orderId: string) => void;
  isCompletedView?: boolean;
}

export default function OrderCard({ order, onStatusChange, isCompletedView = false }: OrderCardProps) {
  const drink = DRINKS.find(d => d.id === order.drinkId);

  const timeAgo = formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: ru });
  
  const cardClasses = isCompletedView 
    ? "opacity-70 bg-card/50"
    : "cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-200";

  return (
    <Card 
        className={cardClasses}
        onClick={!isCompletedView ? () => onStatusChange(order.id) : undefined}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2 font-headline">
              <Coffee className="h-5 w-5 text-primary" /> {drink?.name || 'Неизвестный напиток'}
            </CardTitle>
            <CardDescription>Для: {order.customerName}</CardDescription>
          </div>
        </div>
      </CardHeader>
      {order.customizations && (
        <CardContent className="py-0">
          <p className="text-sm text-muted-foreground italic">"{order.customizations}"</p>
        </CardContent>
      )}
      <CardFooter className="pt-4 flex items-center justify-between">
        <Badge variant="outline" className="text-xs">{timeAgo}</Badge>
        {!isCompletedView && (
            <Badge variant="secondary">Нажмите, чтобы завершить</Badge>
        )}
      </CardFooter>
    </Card>
  );
}
