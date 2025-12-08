'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Order } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, History } from 'lucide-react';
import OrderCard from '@/components/app/order-card';

export default function CompletedOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);
    
    const updateOrders = useCallback((newOrders: Order[]) => {
        setOrders(newOrders.sort((a, b) => b.createdAt - a.createdAt)); // Show newest first
    }, []);

    useEffect(() => {
        const initializeOrders = () => {
            try {
                const storedOrders = localStorage.getItem('orders');
                const allOrders = storedOrders ? JSON.parse(storedOrders) : [];
                updateOrders(allOrders);
            } catch (error) {
                console.error("Could not parse orders from localStorage:", error);
                updateOrders([]);
            }
            setIsInitialized(true);
        };

        initializeOrders();
    }, [updateOrders]);

    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'orders' && event.newValue) {
            try {
                updateOrders(JSON.parse(event.newValue));
            } catch (error) {
                console.error("Could not parse orders from storage event:", error);
            }
        }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [updateOrders]);

    if (!isInitialized) {
        return (
            <div className="flex h-dvh w-full flex-col items-center justify-center bg-background">
                <div className="flex items-center gap-3">
                    <History className="h-10 w-10 animate-pulse text-primary" />
                    <h1 className="text-3xl font-bold tracking-tight text-primary font-headline">
                    БаристаТрек
                    </h1>
                </div>
                <p className="mt-4 text-muted-foreground">Загрузка истории...</p>
            </div>
        );
    }
    
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const completedOrders = orders.filter(o => o.status === 'завершен' && o.createdAt > oneHourAgo);

    return (
        <div className="flex min-h-dvh flex-col bg-background">
            <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 shadow-sm md:px-6">
                <div className="flex items-center gap-3">
                    <History className="h-7 w-7 text-primary" />
                    <h1 className="text-2xl font-bold tracking-tight text-primary font-headline">
                    Завершенные заказы (за час)
                    </h1>
                </div>
                <Button variant="outline" asChild>
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Назад к трекеру
                </Link>
                </Button>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="mx-auto max-w-6xl">
                    {completedOrders.length > 0 ? (
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
