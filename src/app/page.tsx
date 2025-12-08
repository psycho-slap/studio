'use client';

import { useState, useMemo, useCallback } from 'react';
import type { Order, OrderStatus } from '@/lib/types';
import { INITIAL_ORDERS, DRINKS } from '@/lib/data';
import AppHeader from '@/components/app/header';
import OrderBoard from '@/components/app/order-board';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const { toast } = useToast();

  const addOrder = useCallback((newOrderData: Omit<Order, 'id' | 'status' | 'createdAt'>) => {
    const order: Order = {
      ...newOrderData,
      id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      createdAt: Date.now(),
    };
    setOrders(prev => [order, ...prev]);
    toast({
      title: 'Order Added',
      description: `${order.customerName}'s order has been added to the queue.`,
    });
  }, [toast]);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders(prev =>
      prev.map(order => (order.id === orderId ? { ...order, status } : order))
    );
  }, []);

  const completeOrder = useCallback((orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    setOrders(prev => prev.filter(o => o.id !== orderId));
     toast({
      title: 'Order Completed',
      description: `${order?.customerName || 'An order'} has been served and removed.`,
    });
  }, [toast, orders]);

  const optimizeQueue = useCallback(() => {
    // This is a mock for the AI-powered reordering tool.
    // A real implementation would call a GenAI flow.
    // This mock sorts by preparation time (shortest first).
    setOrders(prev => {
      const pendingOrders = prev.filter(o => o.status === 'pending');
      const otherOrders = prev.filter(o => o.status !== 'pending');
      
      const drinksMap = new Map(DRINKS.map(d => [d.id, d]));
      
      const sortedPending = [...pendingOrders].sort((a, b) => {
        const prepTimeA = drinksMap.get(a.drinkId)?.prepTime || 99;
        const prepTimeB = drinksMap.get(b.drinkId)?.prepTime || 99;
        if (prepTimeA !== prepTimeB) {
            return prepTimeA - prepTimeB;
        }
        return a.createdAt - b.createdAt; // secondary sort by time
      });
      
      return [...sortedPending, ...otherOrders];
    });
    
    toast({
      title: 'Queue Optimized!',
      description: 'Pending orders have been re-sequenced for maximum efficiency.',
    });
  }, [toast]);
  
  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => a.createdAt - b.createdAt);
  }, [orders]);

  return (
    <div className="flex h-dvh w-full flex-col bg-background font-body text-foreground">
      <AppHeader addOrder={addOrder} />
      <main className="flex-1 overflow-x-auto p-4 md:p-6">
        <OrderBoard
          orders={sortedOrders}
          updateOrderStatus={updateOrderStatus}
          completeOrder={completeOrder}
          optimizeQueue={optimizeQueue}
        />
      </main>
    </div>
  );
}
