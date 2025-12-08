'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { OrderItem, Drink } from '@/lib/types';
import { DRINKS } from '@/lib/data';
import { Separator } from '@/components/ui/separator';

const DrinkCategories = DRINKS.reduce((acc, drink) => {
    if (!acc[drink.category]) {
        acc[drink.category] = [];
    }
    acc[drink.category].push(drink);
    return acc;
}, {} as Record<string, Drink[]>);


export default function AddOrderPage() {
  const router = useRouter();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loyaltyPhoneNumber, setLoyaltyPhoneNumber] = useState('');
  
  const loadOrderFromStorage = () => {
    try {
        const savedOrder = localStorage.getItem('currentOrder');
        if (savedOrder) {
            setOrderItems(JSON.parse(savedOrder));
        }
        const savedPhone = localStorage.getItem('currentOrderPhone');
        if (savedPhone) {
            setLoyaltyPhoneNumber(savedPhone);
        }
    } catch (error) {
        console.error("Failed to load current order from localStorage", error);
    }
  };

  useEffect(() => {
    loadOrderFromStorage();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'currentOrder' || event.key === 'currentOrderPhone') {
        loadOrderFromStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    try {
        localStorage.setItem('currentOrder', JSON.stringify(orderItems));
    } catch (error) {
        console.error("Failed to save current order to localStorage", error);
    }
  }, [orderItems]);

  useEffect(() => {
    try {
        localStorage.setItem('currentOrderPhone', loyaltyPhoneNumber);
    } catch (error) {
        console.error("Failed to save phone number to localStorage", error);
    }
  }, [loyaltyPhoneNumber]);


  const totalPrice = useMemo(() => {
    return orderItems.reduce((total, item) => total + item.finalPrice, 0);
  }, [orderItems]);


  const handleDrinkSelect = (drink: Drink) => {
    router.push(`/add-order/modifiers?drinkId=${drink.id}`);
  };
  
  const handleRemoveItem = (itemId: string) => {
    setOrderItems(prev => prev.filter((item) => item.id !== itemId));
  }

  const resetOrder = () => {
    setOrderItems([]);
    setLoyaltyPhoneNumber('');
    localStorage.removeItem('currentOrder');
    localStorage.removeItem('currentOrderPhone');
  }
  
  const handleGoToPayment = () => {
      router.push('/add-order/payment');
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
       <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 shadow-sm md:px-6">
        <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-primary font-headline">
            Касса
            </h1>
        </div>
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к трекеру
          </Link>
        </Button>
      </header>
      
      <main className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-0">
        {/* Step 1: Selection */}
        <div className="p-4 md:p-6 overflow-y-auto md:col-span-2">
            <h2 className="text-2xl font-bold font-headline mb-4">Ассортимент</h2>
            {Object.entries(DrinkCategories).map(([category, drinks]) => (
                <div key={category} className="mb-6">
                    <h3 className="text-xl font-semibold mb-3 text-muted-foreground">{category}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {drinks.map(drink => (
                           <Button 
                             key={drink.id}
                             variant="outline"
                             className="h-24 text-left flex flex-col items-start justify-between p-3"
                             onClick={() => handleDrinkSelect(drink)}
                           >
                               <span className="font-semibold">{drink.name}</span>
                               <span className="text-sm text-muted-foreground">{drink.price} руб.</span>
                           </Button>
                        ))}
                    </div>
                </div>
            ))}
        </div>

        {/* Order Summary */}
        <div className="flex flex-col border-l bg-card p-4 md:p-6">
           <div className="flex-1 overflow-y-auto">
             <h2 className="text-2xl font-bold font-headline mb-1">Текущий заказ</h2>
             <Input 
                placeholder="Номер телефона (лояльность)"
                value={loyaltyPhoneNumber}
                onChange={(e) => setLoyaltyPhoneNumber(e.target.value)}
                className="mb-4 mt-2"
              />

            {orderItems.length > 0 ? (
                <div className="space-y-3">
                    {orderItems.map((item) => (
                        <Card key={item.id} className="p-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold">{item.name}</p>
                                    {item.customizations && <p className="text-xs text-muted-foreground">{item.customizations}</p>}
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">{item.finalPrice} руб.</p>
                                    <button onClick={() => handleRemoveItem(item.id)} className="text-destructive hover:text-destructive/80 mt-1">
                                        <Trash2 className="h-4 w-4"/>
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex h-full items-center justify-center text-center">
                    <p className="text-muted-foreground">Выберите напитки из ассортимента слева, чтобы начать.</p>
                </div>
            )}
           </div>
           
           <Separator className="my-4"/>

            {/* Total and Payment */}
            <div className="mt-auto space-y-4">
                 <div className="flex justify-between items-center text-xl font-bold">
                    <span>Итого:</span>
                    <span>{totalPrice} руб.</span>
                </div>
                <Button size="lg" className="w-full" onClick={handleGoToPayment} disabled={orderItems.length === 0}>
                    К оплате
                </Button>
                 <Button variant="ghost" size="sm" className="w-full text-destructive" onClick={resetOrder}>
                    Сбросить заказ
                </Button>
            </div>
        </div>
      </main>
    </div>
  );
}
