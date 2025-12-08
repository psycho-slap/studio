'use client';

import { useState, useMemo, useCallback } from 'react';
import type { Order, OrderStatus } from '@/lib/types';
import { INITIAL_ORDERS, DRINKS } from '@/lib/data';
import AppHeader from '@/components/app/header';
import OrderBoard from '@/components/app/order-board';
import { useToast } from '@/hooks/use-toast';
import { prioritizeOrders } from '@/ai/ai-priority-reordering';
import { type Order as AiOrder } from '@/ai/ai-priority-reordering';

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
      title: 'Заказ добавлен',
      description: `Заказ ${order.customerName} был добавлен в очередь.`,
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
      title: 'Заказ выполнен',
      description: `${order?.customerName || 'Заказ'} был подан и удален.`,
    });
  }, [toast, orders]);

  const optimizeQueue = useCallback(async () => {
    const pendingOrders = orders.filter(o => o.status === 'pending');
    const otherOrders = orders.filter(o => o.status !== 'pending');
    
    const drinksMap = new Map(DRINKS.map(d => [d.id, d]));

    const aiOrders: AiOrder[] = pendingOrders.map(order => ({
      orderId: order.id,
      items: [drinksMap.get(order.drinkId)?.name || 'Неизвестный напиток'],
      prepTime: drinksMap.get(order.drinkId)?.prepTime || 5,
      ingredients: [], // This can be enhanced if ingredient data is available
      customerName: order.customerName,
      orderTime: new Date(order.createdAt).toISOString(),
    }));

    try {
      const { prioritizedOrderIds } = await prioritizeOrders(aiOrders);
      
      const prioritizedMap = new Map(prioritizedOrderIds.map((id, index) => [id, index]));
      
      const sortedPending = [...pendingOrders].sort((a, b) => {
        const aPrio = prioritizedMap.get(a.id) ?? Infinity;
        const bPrio = prioritizedMap.get(b.id) ?? Infinity;
        return aPrio - bPrio;
      });

      setOrders([...sortedPending, ...otherOrders]);

      toast({
        title: 'Очередь оптимизирована!',
        description: 'Ожидающие заказы были пересортированы для максимальной эффективности.',
      });
    } catch (error) {
      console.error("Failed to optimize queue:", error);
      toast({
        variant: "destructive",
        title: "Ошибка оптимизации",
        description: "Не удалось оптимизировать очередь. Пожалуйста, попробуйте еще раз.",
      });
    }
  }, [orders, toast]);
  
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
