'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { Order } from '@/lib/types';
import OrderCard from '@/components/app/order-card';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { Loader2, Volume2, LogIn } from 'lucide-react';
import { collection, query, where, orderBy, doc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Button } from '@/components/ui/button';
import AppHeader from '@/components/app/header';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Helper function to play sound
const playNotificationSound = (audio: HTMLAudioElement | null) => {
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(e => console.error("Error playing notification sound:", e));
  }
};

export default function TrackerPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [userHasInteracted, setUserHasInteracted] = useState(false);

  // Ref to hold the single Audio object
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // This effect runs only once on the client to initialize the Audio object
  useEffect(() => {
    // This ensures the Audio object is created only on the client side
    audioRef.current = new Audio('/notification.mp3');
  }, []);

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null; // Wait for user to be authenticated
    return query(
      collection(firestore, 'orders'),
      orderBy('createdAt', 'asc')
    );
  }, [firestore, user]);

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
      prevOrdersRef.current !== null &&
      currentPreparingOrders.length > prevPreparingOrders.length &&
      userHasInteracted
    ) {
      playNotificationSound(audioRef.current);
    }

    prevOrdersRef.current = orders;
  }, [orders, areOrdersLoading, userHasInteracted]);

  // This function is called when the user clicks the initial sound activation button.
  const handleUserInteraction = () => {
    if (audioRef.current) {
      // Play and immediately pause to "unlock" audio in the browser
      audioRef.current.play().then(() => {
        audioRef.current?.pause();
        audioRef.current!.currentTime = 0;
      }).catch(e => {});
    }
    setUserHasInteracted(true);
  };

  const completeOrder = useCallback((orderId: string) => {
    if (!firestore) return;
    const orderRef = doc(firestore, 'orders', orderId);
    updateDocumentNonBlocking(orderRef, { status: 'завершен', completedAt: Date.now() });
  }, [firestore]);

  const isLoading = isUserLoading || (user && areOrdersLoading);

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

  if (!user) {
    return (
      <div className="flex h-dvh w-full flex-col items-center justify-center bg-background p-4 text-center">
        <h1 className="text-2xl font-bold text-destructive">Доступ запрещен</h1>
        <p className="mt-2 text-muted-foreground">
            Для использования трекера необходимо войти в систему.
        </p>
        <Button asChild className="mt-4">
          <Link href="/su/login">
            <LogIn className="mr-2" />
            Перейти ко входу
          </Link>
        </Button>
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
      <AppHeader title="Трекер" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mx-auto max-w-6xl">
            {!userHasInteracted && (
                <div className="mb-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary/50 bg-card p-6 text-center">
                    <h3 className="text-lg font-semibold">Активация рабочего места</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Нажмите, чтобы начать работу и включить звуковые оповещения о новых заказах.
                    </p>
                    <Button onClick={handleUserInteraction} className="mt-4">
                        <Volume2 className="mr-2 h-4 w-4" />
                        Активировать трекер
                    </Button>
                </div>
            )}
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
