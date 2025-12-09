'use client';

import { useMemo } from 'react';
import type { Order } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, History, Loader2 } from 'lucide-react';
import OrderCard from '@/components/app/order-card';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';

export default function CompletedOrdersPage() {
    const firestore = useFirestore();
    const { user } = useUser();

    const oneHourAgo = Date.now() - (60 * 60 * 1000);

    const completedOrdersQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null; // Wait for user
        return query(
            collection(firestore, 'orders'),
            where('status', '==', 'завершен'),
            where('createdAt', '>', oneHourAgo),
            orderBy('createdAt', 'desc')
        );
    }, [firestore, oneHourAgo, user]);

    const { data: completedOrders, isLoading } = useCollection<Order>(completedOrdersQuery);

    if (isLoading) {
        return (
            <div className="flex h-dvh w-full flex-col items-center justify-center bg-background">
                <div className="flex items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <h1 className="text-3xl font-bold tracking-tight text-primary font-headline">
                    БаристаТрек
                    </h1>
                </div>
                <p className="mt-4 text-muted-foreground">Загрузка истории...</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-dvh flex-col bg-background">
            <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 shadow-sm md:px-6">
                <div className="flex items-center gap-3">
                    <History className="h-7 w-7 text-primary" />
                    <h1 className="text-2xl font-bold tracking-tight text-primary font-headline">
                    Завершенные заказы (за час)
                    </h1>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="mx-auto max-w-6xl">
                    {completedOrders && completedOrders.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {completedOrders.map(order => (
                                <OrderCard
                                    key={order.id}
                                    order={order}
                                    onStatusChange={() => {}} // No action needed
                                    isCompletedView={true}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-border">
                            <p className="text-lg text-muted-foreground">За последний час не было завершенных заказов.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
