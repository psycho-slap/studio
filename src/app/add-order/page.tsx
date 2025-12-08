'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { ArrowLeft, Trash2, Plus, CreditCard, Landmark, X, Users, UserRoundX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Order, OrderItem, Drink, Customer } from '@/lib/types';
import { DRINKS } from '@/lib/data';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check as CheckIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const playNotificationSound = () => {
  try {
    const audio = new Audio('/notification.mp3');
    audio.play().catch(e => console.error("Error playing notification sound:", e));
  } catch (error) {
    console.error("Could not play notification sound:", error);
  }
};


const DrinkCategories = DRINKS.reduce((acc, drink) => {
  if (!acc[drink.category]) {
    acc[drink.category] = [];
  }
  acc[drink.category].push(drink);
  return acc;
}, {} as Record<string, Drink[]>);

type PaymentMethod = 'card' | 'cash';

export default function AddOrderPage() {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // State for modifiers dialog
  const [isModifierOpen, setIsModifierOpen] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [currentModifiers, setCurrentModifiers] = useState<Record<string, Set<string>>>({});
  
  // State for payment dialog
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cashReceived, setCashReceived] = useState<number | null>(null);
  
  // State for customer selection popover
  const [isCustomerPopoverOpen, setIsCustomerPopoverOpen] = useState(false);

  // Firebase hooks
  const firestore = useFirestore();
  const { user } = useUser();
  const customersRef = useMemo(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'customers');
  }, [firestore, user]);
  const { data: customers } = useCollection<Customer>(customersRef);


  useEffect(() => {
    try {
      const savedOrder = localStorage.getItem('currentOrder');
      if (savedOrder) {
        setOrderItems(JSON.parse(savedOrder));
      }
      const savedCustomer = localStorage.getItem('currentOrderCustomer');
      if (savedCustomer) {
        setSelectedCustomer(JSON.parse(savedCustomer));
      }
    } catch (error) {
      console.error("Failed to load state from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('currentOrder', JSON.stringify(orderItems));
    } catch (error) {
      console.error("Failed to save order to localStorage", error);
    }
  }, [orderItems]);

  useEffect(() => {
    try {
      if (selectedCustomer) {
        localStorage.setItem('currentOrderCustomer', JSON.stringify(selectedCustomer));
      } else {
        localStorage.removeItem('currentOrderCustomer');
      }
    } catch (error) {
      console.error("Failed to save customer to localStorage", error);
    }
  }, [selectedCustomer]);


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
        if (group.type === 'single' && group.items.length > 0) {
            defaultModifiers[group.id] = new Set([group.items[0].id]);
        } else {
            defaultModifiers[group.id] = new Set();
        }
    });
    setCurrentModifiers(defaultModifiers);
    setIsModifierOpen(true);
  };
  
  const handleModifierChange = (groupId: string, modifierId: string, groupType: 'single' | 'multiple') => {
    setCurrentModifiers(prev => {
        const newModifiers = { ...prev };
        const currentSet = new Set(newModifiers[groupId] || []);

        if (groupType === 'single') {
            newModifiers[groupId] = new Set([modifierId]);
        } else {
            if (currentSet.has(modifierId)) {
                currentSet.delete(modifierId);
            } else {
                currentSet.add(modifierId);
            }
            newModifiers[groupId] = currentSet;
        }
        return newModifiers;
    });
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
            if (modifier) {
                finalPrice += modifier.price;
                 if ((group.type === 'multiple' && modifier.price > 0) || (group.type === 'single' && modifier.id !== group.items[0].id) || (group.type === 'multiple' && modifier.price === 0)) {
                    customizations.push(modifier.name);
                }
            }
        });
    });

    const newItem = {
        id: `${selectedDrink.id}-${Date.now()}`,
        name: selectedDrink.name,
        price: selectedDrink.price,
        customizations: customizations.join(', '),
        finalPrice: finalPrice,
    };
    
    setOrderItems(prev => [...prev, newItem]);
    setIsModifierOpen(false);
  };


  const handleRemoveItem = (itemId: string) => {
    setOrderItems(prev => prev.filter((item) => item.id !== itemId));
  }

  const resetOrder = () => {
    setOrderItems([]);
    setSelectedCustomer(null);
    localStorage.removeItem('currentOrder');
    localStorage.removeItem('currentOrderCustomer');
  }

  const handleFinalizeOrder = () => {
    const newOrder: Order = {
        id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        customerName: selectedCustomer ? selectedCustomer.name : 'Гость',
        customerId: selectedCustomer ? selectedCustomer.id : undefined,
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
        setIsPaymentOpen(false);
    } catch (error) {
        console.error("Failed to save order to localStorage:", error);
    }
  };


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

        <div className="flex flex-col border-l bg-card p-4 md:p-6">
           <div className="flex-1 overflow-y-auto">
             <h2 className="text-2xl font-bold font-headline mb-1">Текущий заказ</h2>
             
             <div className="mt-4 mb-4">
                <Label className="mb-2 block text-sm font-medium">Клиент</Label>
                <div className="flex items-center gap-2">
                    <Popover open={isCustomerPopoverOpen} onOpenChange={setIsCustomerPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start">
                                <Users className="mr-2 h-4 w-4"/>
                                {selectedCustomer ? selectedCustomer.name : 'Выберите клиента'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="start">
                            <Command>
                                <CommandInput placeholder="Найти клиента..." />
                                <CommandList>
                                    <CommandEmpty>Клиенты не найдены.</CommandEmpty>
                                    <CommandGroup>
                                        {customers?.map((customer) => (
                                        <CommandItem
                                            key={customer.id}
                                            value={customer.name}
                                            onSelect={() => {
                                                setSelectedCustomer(customer);
                                                setIsCustomerPopoverOpen(false);
                                            }}
                                        >
                                           <CheckIcon
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedCustomer?.id === customer.id ? "opacity-100" : "opacity-0"
                                            )}
                                            />
                                            {customer.name} ({customer.phoneNumber})
                                        </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    {selectedCustomer && (
                        <Button variant="ghost" size="icon" onClick={() => setSelectedCustomer(null)}>
                            <UserRoundX className="h-4 w-4 text-destructive"/>
                        </Button>
                    )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                   Для гостя без карты лояльности оставьте поле пустым.
                </p>
             </div>


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

            <div className="mt-auto space-y-4">
                 <div className="flex justify-between items-center text-xl font-bold">
                    <span>Итого:</span>
                    <span>{totalPrice} руб.</span>
                </div>
                <Button size="lg" className="w-full" onClick={() => setIsPaymentOpen(true)} disabled={orderItems.length === 0}>
                    К оплате
                </Button>
                 <Button variant="ghost" size="sm" className="w-full text-destructive" onClick={resetOrder}>
                    Сбросить заказ
                </Button>
            </div>
        </div>
      </main>

      {/* Modifiers Dialog */}
      <Dialog open={isModifierOpen} onOpenChange={setIsModifierOpen}>
        <DialogContent className="max-w-md">
            {selectedDrink && (
              <>
                <DialogHeader>
                    <DialogTitle>Настроить «{selectedDrink.name}»</DialogTitle>
                </DialogHeader>
                <div className="flex max-h-[60vh] flex-col">
                  <ScrollArea className="flex-1 pr-4">
                      <div className="space-y-6">
                          {selectedDrink.modifiers.map(group => (
                              <div key={group.id}>
                                  <Label className="text-base font-semibold">{group.name}</Label>
                                  {group.type === 'single' ? (
                                      <RadioGroup 
                                          value={Array.from(currentModifiers[group.id] || [])[0]}
                                          onValueChange={(value) => handleModifierChange(group.id, value, group.type)}
                                          className="mt-2 space-y-2"
                                      >
                                          {group.items.map(item => (
                                              <div key={item.id} className="flex items-center justify-between rounded-md border p-3">
                                                  <Label htmlFor={`radio-${item.id}`} className="flex items-center gap-3 cursor-pointer w-full">
                                                      <RadioGroupItem value={item.id} id={`radio-${item.id}`} />
                                                      {item.name}
                                                  </Label>
                                                  {item.price > 0 && <Badge variant="secondary">+{item.price} руб.</Badge>}
                                              </div>
                                          ))}
                                      </RadioGroup>
                                  ) : (
                                      <div className="mt-2 space-y-2">
                                      {group.items.map(item => (
                                          <div key={item.id} className="flex items-center justify-between rounded-md border p-3">
                                              <Label htmlFor={`check-${item.id}`} className="flex items-center gap-3 cursor-pointer w-full">
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
                    <Button size="lg" className="w-full" onClick={handleAddDrinkToOrder}>
                        <Plus className="mr-2"/> Добавить в заказ
                    </Button>
                </DialogFooter>
              </>
            )}
        </DialogContent>
      </Dialog>
      
      {/* Payment Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
         <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>Оплата заказа</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
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
            </div>
            <DialogFooter>
                 <Button size="lg" className="w-full" onClick={handleFinalizeOrder} disabled={paymentMethod === 'cash' && (cashReceived === null || cashReceived < totalPrice)}>
                    Оплатить и разместить заказ
                </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
}
