'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { Order } from '@/lib/types';
import AppHeader from '@/components/app/header';
import OrderCard from '@/components/app/order-card';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { collection, query, where, orderBy, doc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Button } from '@/components/ui/button';

const playNotificationSound = () => {
  try {
    const audio = new Audio('/notification.mp3');
    // We can only play audio after a user gesture. The fact that the user
    // toggled the sound switch counts as that gesture.
    audio.play().catch(e => console.error("Error playing notification sound:", e));
  } catch (error) {
    console.error("Could not play notification sound:", error);
  }
};


export default function TrackerPage() {
  const firestore = useFirestore();
  const [soundEnabled, setSoundEnabled] = useState(false);

  // We don't require user login for this page anymore.
  // We'll fetch data publicly if rules allow.

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'orders'),
      orderBy('createdAt', 'asc')
    );
  }, [firestore]);

  const { data: orders, isLoading: areOrdersLoading, error } = useCollection<Order>(ordersQuery);

  const prevOrdersRef = useRef<Order[] | null>(null);

  useEffect(() => {
    if (areOrdersLoading || !orders) {
      return;
    }

    const prevPreparingOrders = prevOrdersRef.current
      ? prevOrdersRef.current.filter(o => o.status === 'готовится')
      : [];

    const currentPreparingOrders = orders.filter(o => o.status === 'готовится');

    if (
      prevOrdersRef.current !== null && // Don't play on initial load
      currentPreparingOrders.length > prevPreparingOrders.length &&
      soundEnabled // Only play if user has enabled it
    ) {
      playNotificationSound();
    }

    prevOrdersRef.current = orders;
  }, [orders, areOrdersLoading, soundEnabled]);


  const completeOrder = useCallback((orderId: string) => {
    if (!firestore) return;
    const orderRef = doc(firestore, 'orders', orderId);
    updateDocumentNonBlocking(orderRef, { status: 'завершен', completedAt: Date.now() });
  }, [firestore]);
  
  const isLoading = areOrdersLoading;

  if (isLoading) {
    return (
        <div className="flex h-dvh w-full flex-col items-center justify-center bg-background">
            <div className="flex items-center gap-3">
                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-primary font-headline">
                Трекер
                </h1>
            </div>
            <p className="mt-4 text-muted-foreground">Загрузка заказов...</p>
        </div>
    );
  }
  
  if (error) {
     return (
      <div className="flex h-dvh w-full flex-col items-center justify-center bg-background p-4 text-center">
        <h1 className="text-2xl font-bold text-destructive">Ошибка загрузки данных</h1>
        <p className="mt-2 text-muted-foreground max-w-md">
          Не удалось загрузить заказы. Вероятно, есть проблема с правами доступа к базе данных. Проверьте правила безопасности Firestore.
        </p>
         <pre className="mt-4 text-xs bg-muted p-2 rounded-md text-left w-full max-w-md overflow-auto">
          <code>{error.message}</code>
        </pre>
      </div>
    );
  }


  const preparingOrders = orders ? orders.filter(o => o.status === 'готовится') : [];

  return (
    <div className="flex h-dvh w-full flex-col bg-background font-body text-foreground">
      <AppHeader 
        showSoundControl={true}
        soundEnabled={soundEnabled}
        onSoundToggle={setSoundEnabled}
      />
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
