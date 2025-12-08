'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Order, OrderStatus } from '@/lib/types';
import { INITIAL_ORDERS, DRINKS } from '@/lib/data';
import AppHeader from '@/components/app/header';
import OrderBoard from '@/components/app/order-board';
import { useToast } from '@/hooks/use-toast';
import { prioritizeOrders } from '@/ai/ai-priority-reordering';
import { type Order as AiOrder } from '@/ai/ai-priority-reordering';
import { Coffee } from 'lucide-react';

export default function Home() {
  const [orders, setOrders] = useState<Order[]>([]);
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // This effect runs once on the client to initialize orders from localStorage
    const initializeOrders = () => {
      try {
        const storedOrders = localStorage.getItem('orders');
        if (storedOrders) {
          setOrders(JSON.parse(storedOrders));
        } else {
          // If nothing in localStorage, use initial data and set it
          setOrders(INITIAL_ORDERS);
          localStorage.setItem('orders', JSON.stringify(INITIAL_ORDERS));
        }
      } catch (error) {
        // If parsing fails, fall back to initial orders
        console.error("Could not parse orders from localStorage:", error);
        setOrders(INITIAL_ORDERS);
      }
      setIsInitialized(true);
    };

    initializeOrders();
    
    // Listen for storage changes from other tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'orders' && event.newValue) {
        try {
          setOrders(JSON.parse(event.newValue));
        } catch (error) {
          console.error("Could not parse orders from storage event:", error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };

  }, []);

  useEffect(() => {
    // This effect syncs changes back to localStorage whenever orders state changes
    if (isInitialized) {
      localStorage.setItem('orders', JSON.stringify(orders));
    }
  }, [orders, isInitialized]);


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
    
    if (pendingOrders.length < 2) {
      toast({
        title: 'Нечего оптимизировать',
        description: 'Нужно как минимум два заказа в очереди для оптимизации.',
      });
      return;
    }

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
      toast({
        title: 'Оптимизация...',
        description: 'ИИ анализирует очередь для лучшей последовательности...',
      });
      const { prioritizedOrderIds, reasoning } = await prioritizeOrders(aiOrders);
      
      const prioritizedMap = new Map(prioritizedOrderIds.map((id, index) => [id, index]));
      
      const sortedPending = [...pendingOrders].sort((a, b) => {
        const aPrio = prioritizedMap.get(a.id) ?? Infinity;
        const bPrio = prioritizedMap.get(b.id) ?? Infinity;
        return aPrio - bPrio;
      });

      setOrders([...sortedPending, ...otherOrders]);

      toast({
        title: 'Очередь оптимизирована!',
        description: reasoning,
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
  
  if (!isInitialized) {
    return (
        <div className="flex h-dvh w-full flex-col items-center justify-center bg-background">
            <div className="flex items-center gap-3">
                <Coffee className="h-10 w-10 animate-pulse text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-primary font-headline">
                БаристаТрек
                </h1>
            </div>
            <p className="mt-4 text-muted-foreground">Загрузка заказов...</p>
        </div>
    );
  }

  return (
    <div className="flex h-dvh w-full flex-col bg-background font-body text-foreground">
      <AppHeader />
      <main className="flex-1 overflow-x-auto p-4 md:p-6">
        <OrderBoard
          orders={orders}
          updateOrderStatus={updateOrderStatus}
          completeOrder={completeOrder}
          optimizeQueue={optimizeQueue}
        />
      </main>
    </div>
  );
}
