'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DRINKS } from '@/lib/data';
import type { Order } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Landmark } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const orderSchema = z.object({
  customerName: z.string().min(2, 'Имя должно содержать не менее 2 символов.').max(50, 'Имя слишком длинное.'),
  drinkId: z.string({ required_error: 'Пожалуйста, выберите напиток.' }),
  customizations: z.string().max(100, 'Дополнения слишком длинные.').optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;
type PaymentMethod = 'card' | 'cash';

const defaultFormValues: OrderFormValues = {
  customerName: '',
  customizations: '',
  drinkId: '',
};

const playNotificationSound = () => {
    try {
        const audio = new Audio('/notification.mp3');
        audio.play();
    } catch (error) {
        console.error("Could not play notification sound:", error);
    }
}

export default function AddOrderPage() {
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [totalPrice, setTotalPrice] = useState(0);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: defaultFormValues,
  });

  const selectedDrinkId = form.watch('drinkId');

  useState(() => {
    const drink = DRINKS.find(d => d.id === selectedDrinkId);
    setTotalPrice(drink?.price || 0);
  });

  function onSubmit(data: OrderFormValues) {
    const drink = DRINKS.find(d => d.id === data.drinkId);
    if (!drink) return;

    const newOrder: Order = {
        id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        customerName: data.customerName,
        drinkId: data.drinkId,
        customizations: data.customizations || '',
        status: 'готовится',
        createdAt: Date.now(),
        price: drink.price,
        paymentMethod: paymentMethod,
    };

    try {
        const existingOrders: Order[] = JSON.parse(localStorage.getItem('orders') || '[]');
        const updatedOrders = [...existingOrders, newOrder]; // Append new orders
        localStorage.setItem('orders', JSON.stringify(updatedOrders));
        
        playNotificationSound();

        toast({
            title: 'Заказ добавлен',
            description: `Заказ для ${data.customerName} был добавлен в очередь.`,
        });
        form.reset(defaultFormValues);
        setTotalPrice(0);
    } catch (error) {
        console.error("Failed to save order to localStorage:", error);
        toast({
            variant: "destructive",
            title: "Ошибка",
            description: "Не удалось сохранить заказ. Пожалуйста, попробуйте еще раз.",
        });
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
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="mb-1 text-2xl font-bold font-headline">Новый заказ клиента</h2>
            <p className="mb-6 text-muted-foreground">Введите детали заказа и примите оплату.</p>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Имя клиента</FormLabel>
                    <FormControl>
                        <Input placeholder="например, Анна Иванова" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="drinkId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Напиток</FormLabel>
                    <Select 
                        onValueChange={(value) => {
                            field.onChange(value);
                            const drink = DRINKS.find(d => d.id === value);
                            setTotalPrice(drink?.price || 0);
                        }} 
                        value={field.value}
                    >
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Выберите напиток" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {DRINKS.map(drink => (
                            <SelectItem key={drink.id} value={drink.id}>
                            {drink.name} - {drink.price} руб.
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="customizations"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Дополнения</FormLabel>
                    <FormControl>
                        <Textarea
                        placeholder="например, овсяное молоко, дополнительный шот, без сахара..."
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <Card className="mt-6">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-lg font-semibold">Итого:</span>
                            <span className="text-2xl font-bold font-headline">{totalPrice} руб.</span>
                        </div>
                        
                        <FormLabel>Способ оплаты</FormLabel>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                           <Button type="button" variant={paymentMethod === 'card' ? 'default' : 'secondary'} onClick={() => setPaymentMethod('card')} className="h-12">
                             <CreditCard className="mr-2"/> Карта
                           </Button>
                           <Button type="button" variant={paymentMethod === 'cash' ? 'default' : 'secondary'} onClick={() => setPaymentMethod('cash')} className="h-12">
                             <Landmark className="mr-2"/> Наличные
                           </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="secondary" onClick={() => {form.reset(defaultFormValues); setTotalPrice(0);}}>Очистить</Button>
                  <Button type="submit" size="lg" disabled={!selectedDrinkId}>Принять оплату и разместить заказ</Button>
                </div>
            </form>
            </Form>
        </div>
      </main>
    </div>
  );
}
