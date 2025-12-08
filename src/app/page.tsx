'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Order } from '@/lib/types';
import { INITIAL_ORDERS } from '@/lib/data';
import AppHeader from '@/components/app/header';
import OrderCard from '@/components/app/order-card';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [orders, setOrders] = useState<Order[]>([]);
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);

  const updateOrders = useCallback((newOrders: Order[]) => {
    try {
      const sortedOrders = newOrders.sort((a, b) => a.createdAt - b.createdAt);
      setOrders(sortedOrders);
      localStorage.setItem('orders', JSON.stringify(sortedOrders));
    } catch (error) {
      console.error("Could not save orders to localStorage:", error);
    }
  }, []);
  
  useEffect(() => {
    const initializeOrders = () => {
      try {
        const storedOrders = localStorage.getItem('orders');
        const initialData = storedOrders ? JSON.parse(storedOrders) : INITIAL_ORDERS;
        const currentOrders = initialData.sort((a: Order, b: Order) => a.createdAt - b.createdAt);
        setOrders(currentOrders);
        if (!storedOrders) {
            localStorage.setItem('orders', JSON.stringify(currentOrders));
        }
      } catch (error) {
        console.error("Could not parse orders from localStorage:", error);
        setOrders(INITIAL_ORDERS);
      }
      setIsInitialized(true);
    };

    initializeOrders();
  }, []);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'orders' && event.newValue) {
        try {
          const newOrders = JSON.parse(event.newValue);
          setOrders(newOrders.sort((a: Order, b: Order) => a.createdAt - b.createdAt));
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


  const completeOrder = useCallback((orderId: string) => {
    const orderToComplete = orders.find(o => o.id === orderId);
    if (!orderToComplete) return;

    const updatedOrders = orders.map(order => 
        order.id === orderId ? { ...order, status: 'завершен' as const } : order
    );
    updateOrders(updatedOrders);
     
    toast({
      title: 'Заказ выполнен',
      description: `${orderToComplete.customerName || 'Заказ'} был отмечен как завершенный.`,
    });
  }, [orders, toast, updateOrders]);
  
  if (!isInitialized) {
    return (
        <div className="flex h-dvh w-full flex-col items-center justify-center bg-background">
            <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-primary font-headline animate-pulse">
                Трекер
                </h1>
            </div>
            <p className="mt-4 text-muted-foreground">Загрузка заказов...</p>
        </div>
    );
  }

  const preparingOrders = orders.filter(o => o.status === 'готовится');

  return (
    <div className="flex h-dvh w-full flex-col bg-background font-body text-foreground">
      <AppHeader />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl font-bold font-headline mb-4">Активные заказы ({preparingOrders.length})</h2>
            {preparingOrders.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {preparingOrders.map(order => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            onStatusChange={() => completeOrder(order.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-border mt-4">
                    <p className="text-lg text-muted-foreground">Нет активных заказов.</p>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}
