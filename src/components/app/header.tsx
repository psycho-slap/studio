import type { Order } from '@/lib/types';
import { Coffee } from 'lucide-react';
import { AddOrderDialog } from '@/components/app/add-order-dialog';

interface AppHeaderProps {
  addOrder: (order: Omit<Order, 'id' | 'status' | 'createdAt'>) => void;
}

export default function AppHeader({ addOrder }: AppHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 shadow-sm md:px-6">
      <div className="flex items-center gap-3">
        <Coffee className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight text-primary font-headline">
          БаристаТрек
        </h1>
      </div>
      <AddOrderDialog addOrder={addOrder} />
    </header>
  );
}
