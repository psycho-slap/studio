'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Landmark } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Order, OrderItem } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

type PaymentMethod = 'card' | 'cash';

const playNotificationSound = () => {
    try {
        const audio = new Audio('/notification.mp3');
        audio.play();
    } catch (error) {
        console.error("Could not play notification sound:", error);
    }
}

export default function PaymentPage() {
    const router = useRouter();
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [loyaltyPhoneNumber, setLoyaltyPhoneNumber] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
    const [cashReceived, setCashReceived] = useState<number | null>(null);

    useEffect(() => {
        try {
            const savedOrder = localStorage.getItem('currentOrder');
            const savedPhone = localStorage.getItem('currentOrderPhone');
            if (savedOrder) {
                setOrderItems(JSON.parse(savedOrder));
            } else {
                // If no order, redirect
                router.replace('/add-order');
            }
            if (savedPhone) {
                setLoyaltyPhoneNumber(savedPhone);
            }
        } catch (error) {
            console.error("Failed to load current order from localStorage", error);
            router.replace('/add-order');
        }
    }, [router]);

    const totalPrice = useMemo(() => {
        return orderItems.reduce((total, item) => total + item.finalPrice, 0);
    }, [orderItems]);

    const change = useMemo(() => {
        if (paymentMethod === 'cash' && cashReceived !== null && cashReceived >= totalPrice) {
            return cashReceived - totalPrice;
        }
        return null;
    }, [paymentMethod, cashReceived, totalPrice]);
    
    const handleFinalizeOrder = () => {
        const newOrder: Order = {
            id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            customerName: loyaltyPhoneNumber ? `Loyalty: ${loyaltyPhoneNumber}` : 'Гость',
            items: orderItems,
            status: 'готовится',
            createdAt: Date.now(),
            totalPrice: totalPrice,
            paymentMethod: paymentMethod,
        };

        try {
            const existingOrders: Order[] = JSON.parse(localStorage.getItem('orders') || '[]');
            const updatedOrders = [...existingOrders, newOrder];
            localStorage.setItem('orders', JSON.stringify(updatedOrders));
            
            // Clean up current order
            localStorage.removeItem('currentOrder');
            localStorage.removeItem('currentOrderPhone');

            playNotificationSound();
            router.replace('/add-order');
        } catch (error) {
            console.error("Failed to save order to localStorage:", error);
        }
    }

    if (orderItems.length === 0) {
        return <div className="flex h-dvh w-full items-center justify-center bg-background"><p>Загрузка заказа...</p></div>;
    }

    return (
        <div className="flex min-h-dvh flex-col bg-background">
            <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 shadow-sm md:px-6">
                <h1 className="text-2xl font-bold tracking-tight text-primary font-headline">
                    Оплата заказа
                </h1>
                <Button variant="outline" asChild>
                  <Link href="/add-order">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Назад к заказу
                  </Link>
                </Button>
            </header>
            <main className="flex-1 p-4 md:p-6 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6 space-y-4">
                         <h3 className="font-semibold text-lg">Чек</h3>
                         <ScrollArea className="h-40 border rounded-md p-2">
                            <div className="space-y-1 pr-4">
                            {orderItems.map(item => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span>{item.name}{item.customizations ? ` (${item.customizations})` : ''}</span>
                                    <span>{item.finalPrice} руб.</span>
                                </div>
                            ))}
                            </div>
                         </ScrollArea>
                         <Separator />
                         <div className="flex justify-between font-bold text-lg">
                             <span>Итого:</span>
                             <span>{totalPrice} руб.</span>
                         </div>
                         <Separator />

                        <div>
                            <Label className="mb-2 block">Способ оплаты</Label>
                            <div className="grid grid-cols-2 gap-2">
                            <Button type="button" variant={paymentMethod === 'card' ? 'default' : 'secondary'} onClick={() => setPaymentMethod('card')}>
                                <CreditCard /> Карта
                            </Button>
                            <Button type="button" variant={paymentMethod === 'cash' ? 'default' : 'secondary'} onClick={() => setPaymentMethod('cash')}>
                                <Landmark /> Наличные
                            </Button>
                            </div>
                        </div>

                        {paymentMethod === 'cash' && (
                            <div>
                                <Label htmlFor="cash-received">Принято наличными</Label>
                                <Input
                                    id="cash-received"
                                    type="number"
                                    placeholder="Например, 500"
                                    value={cashReceived ?? ''}
                                    onChange={(e) => setCashReceived(e.target.value ? Number(e.target.value) : null)}
                                />
                                {change !== null && (
                                    <p className="mt-2 text-lg font-semibold text-primary">Сдача: {change.toFixed(2)} руб.</p>
                                )}
                            </div>
                        )}
                        <Button size="lg" className="w-full" onClick={handleFinalizeOrder} disabled={paymentMethod === 'cash' && (cashReceived === null || cashReceived < totalPrice)}>
                            Оплатить и разместить заказ
                        </Button>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}