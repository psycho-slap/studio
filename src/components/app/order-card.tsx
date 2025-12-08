import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Order, OrderStatus } from '@/lib/types';
import { DRINKS } from '@/lib/data';
import { MoreVertical, Coffee, Play, Check, Trash2, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface OrderCardProps {
  order: Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  completeOrder: (orderId: string) => void;
}

export default function OrderCard({ order, updateOrderStatus, completeOrder }: OrderCardProps) {
  const drink = DRINKS.find(d => d.id === order.drinkId);

  const timeAgo = formatDistanceToNow(new Date(order.createdAt), { addSuffix: true });
  
  const moveToAction = () => {
    if (order.status === 'pending') {
      return (
        <Button size="sm" variant="secondary" onClick={() => updateOrderStatus(order.id, 'in-progress')}>
          <Play className="mr-2 h-4 w-4" /> Start Prep
        </Button>
      );
    }
    if (order.status === 'in-progress') {
      return (
        <Button size="sm" variant="secondary" onClick={() => updateOrderStatus(order.id, 'ready')}>
          <Check className="mr-2 h-4 w-4" /> Mark Ready
        </Button>
      );
    }
    if (order.status === 'ready') {
      return (
        <Button size="sm" onClick={() => completeOrder(order.id)} className="bg-[hsl(var(--accent))] text-accent-foreground hover:bg-accent/90">
          Serve Order
        </Button>
      );
    }
    return null;
  };

  return (
    <Card className="animate-in fade-in-50 duration-500">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2 font-headline">
              <Coffee className="h-5 w-5 text-primary" /> {drink?.name || 'Unknown Drink'}
            </CardTitle>
            <CardDescription>For: {order.customerName}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {order.status === 'in-progress' && (
                <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'pending')}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Move to Pending
                </DropdownMenuItem>
              )}
              {order.status === 'ready' && (
                <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'in-progress')}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Move to In Progress
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive-foreground focus:bg-destructive" onClick={() => completeOrder(order.id)}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete Order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      {order.customizations && (
        <CardContent className="py-0">
          <p className="text-sm text-muted-foreground italic">"{order.customizations}"</p>
        </CardContent>
      )}
      <CardFooter className="pt-4 flex items-center justify-between">
        <Badge variant="outline" className="text-xs">{timeAgo}</Badge>
        {moveToAction()}
      </CardFooter>
    </Card>
  );
}
