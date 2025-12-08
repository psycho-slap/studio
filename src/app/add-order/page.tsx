'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Landmark, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Order, OrderItem, Drink, ModifierGroup, Modifier } from '@/lib/types';
import { DRINKS } from '@/lib/data';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

type PaymentMethod = 'card' | 'cash';

const playNotificationSound = () => {
    try {
        const audio = new Audio('/notification.mp3');
        audio.play();
    } catch (error) {
        console.error("Could not play notification sound:", error);
    }
}

const DrinkCategories = DRINKS.reduce((acc, drink) => {
    if (!acc[drink.category]) {
        acc[drink.category] = [];
    }
    acc[drink.category].push(drink);
    return acc;
}, {} as Record<string, Drink[]>);


export default function AddOrderPage() {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loyaltyPhoneNumber, setLoyaltyPhoneNumber] = useState('');
  
  // Payment Dialog State
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cashReceived, setCashReceived] = useState<number | null>(null);

  // Modifier Dialog State
  const [isModifierDialogOpen, setIsModifierDialogOpen] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [currentModifiers, setCurrentModifiers] = useState<Record<string, Set<string>>>({});


  const totalPrice = useMemo(() => {
    return orderItems.reduce((total, item) => total + item.finalPrice, 0);
  }, [orderItems]);

  const change = useMemo(() => {
    if (paymentMethod === 'cash' && cashReceived !== null && cashReceived >= totalPrice) {
      return cashReceived - totalPrice;
    }
    return null;
  }, [paymentMethod, cashReceived, totalPrice]);

  const handleDrinkSelect = (drink: Drink) => {
    setSelectedDrink(drink);
    
    const defaultModifiers: Record<string, Set<string>> = {};
    drink.modifiers.forEach(group => {
      if(group.items.length > 0) {
        // For single selection, select the first one by default. For multiple, none are selected.
        if (group.type === 'single') {
            defaultModifiers[group.id] = new Set([group.items[0].id]);
        } else {
            defaultModifiers[group.id] = new Set();
        }
      }
    });
    setCurrentModifiers(defaultModifiers);

    setIsModifierDialogOpen(true);
  };
  
  const handleAddDrinkToOrder = () => {
      if (!selectedDrink) return;

      let finalPrice = selectedDrink.price;
      const customizations: string[] = [];

      Object.entries(currentModifiers).forEach(([groupId, modifierIds]) => {
          const group = selectedDrink.modifiers.find(g => g.id === groupId);
          if (!group) return;

          modifierIds.forEach(modifierId => {
             const modifier = group.items.find(i => i.id === modifierId);
              if (modifier && modifier.price > 0) {
                  finalPrice += modifier.price;
                  customizations.push(modifier.name);
              } else if (modifier && group.type === 'single' && group.items[0].id !== modifier.id) {
                  customizations.push(modifier.name)
              } else if (modifier && group.type === 'multiple') {
                  customizations.push(modifier.name);
              }
          })
      })

      const newItem: OrderItem = {
          id: `${selectedDrink.id}-${Date.now()}`,
          name: selectedDrink.name,
          price: selectedDrink.price,
          customizations: customizations.join(', '),
          finalPrice: finalPrice,
      };

      setOrderItems(prev => [...prev, newItem]);
      setIsModifierDialogOpen(false);
      setSelectedDrink(null);
      setCurrentModifiers({});
  }

  const handleModifierChange = (groupId: string, modifierId: string, groupType: 'single' | 'multiple') => {
      setCurrentModifiers(prev => {
          const newModifiers = { ...prev };
          if (groupType === 'single') {
              newModifiers[groupId] = new Set([modifierId]);
          } else {
              const currentSet = new Set(newModifiers[groupId] || []);
              if (currentSet.has(modifierId)) {
                  currentSet.delete(modifierId);
              } else {
                  currentSet.add(modifierId);
              }
              newModifiers[groupId] = currentSet;
          }
          return newModifiers;
      })
  }

  const handleRemoveItem = (itemId: string) => {
    setOrderItems(prev => prev.filter((item) => item.id !== itemId));
  }

  const resetOrder = () => {
    setOrderItems([]);
    setLoyaltyPhoneNumber('');
    setPaymentMethod('card');
    setCashReceived(null);
    setIsPaymentDialogOpen(false);
  }

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
        
        playNotificationSound();
        resetOrder();
    } catch (error) {
        console.error("Failed to save order to localStorage:", error);
    }
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
                                    <p className="text-xs text-muted-foreground">{item.customizations}</p>
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
                <Button size="lg" className="w-full" onClick={() => setIsPaymentDialogOpen(true)} disabled={orderItems.length === 0}>
                    К оплате
                </Button>
                 <Button variant="ghost" size="sm" className="w-full text-destructive" onClick={resetOrder}>
                    Сбросить заказ
                </Button>
            </div>
        </div>

        {/* Modifier Dialog */}
        <Dialog open={isModifierDialogOpen} onOpenChange={setIsModifierDialogOpen}>
            <DialogContent className="max-h-[90dvh] flex flex-col">
                <DialogHeader>
                <DialogTitle>Настроить «{selectedDrink?.name}»</DialogTitle>
                </DialogHeader>
                <div className="flex-1 min-h-0">
                    <ScrollArea className="h-full">
                        <div className="space-y-4 pr-6">
                            {selectedDrink?.modifiers.map(group => (
                                <div key={group.id}>
                                    <Label className="text-base">{group.name}</Label>
                                    {group.type === 'single' ? (
                                        <RadioGroup 
                                            value={Array.from(currentModifiers[group.id] || [])[0]}
                                            onValueChange={(value) => handleModifierChange(group.id, value, group.type)}
                                            className="mt-2 space-y-1"
                                        >
                                            {group.items.map(item => (
                                                <div key={item.id} className="flex items-center justify-between rounded-md border p-3">
                                                    <Label htmlFor={`radio-${item.id}`} className="flex items-center gap-3 cursor-pointer">
                                                        <RadioGroupItem value={item.id} id={`radio-${item.id}`} />
                                                        {item.name}
                                                    </Label>
                                                    {item.price > 0 && <Badge variant="secondary">+{item.price} руб.</Badge>}
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    ) : (
                                        <div className="mt-2 space-y-1">
                                        {group.items.map(item => (
                                            <div key={item.id} className="flex items-center justify-between rounded-md border p-3">
                                                <Label htmlFor={`check-${item.id}`} className="flex items-center gap-3 cursor-pointer">
                                                    <Checkbox
                                                        id={`check-${item.id}`}
                                                        checked={currentModifiers[group.id]?.has(item.id)}
                                                        onCheckedChange={() => handleModifierChange(group.id, item.id, group.type)}
                                                    />
                                                    {item.name}
                                                </Label>
                                                {item.price > 0 && <Badge variant="secondary">+{item.price} руб.</Badge>}
                                            </div>
                                        ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsModifierDialogOpen(false)}>Отмена</Button>
                    <Button onClick={handleAddDrinkToOrder}>
                        <Plus className="mr-2"/> Добавить в заказ
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Payment Dialog */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogContent className="max-h-[90dvh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Оплата заказа</DialogTitle>
                </DialogHeader>
                <div className="flex-1 space-y-4">
                    <Card>
                        <CardContent className="p-4 space-y-2">
                             <h3 className="font-semibold">Чек</h3>
                             <ScrollArea className="h-40">
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
                        </CardContent>
                    </Card>

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
                                <p className="mt-2 text-lg font-semibold text-primary">Сдача: {change} руб.</p>
                            )}
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsPaymentDialogOpen(false)}>Назад</Button>
                    <Button size="lg" onClick={handleFinalizeOrder} disabled={paymentMethod === 'cash' && (cashReceived === null || cashReceived < totalPrice)}>
                        Оплатить
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

      </main>
    </div>
  );
}
