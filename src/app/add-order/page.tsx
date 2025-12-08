'use client';

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
import { ArrowLeft } from 'lucide-react';

const orderSchema = z.object({
  customerName: z.string().min(2, 'Имя должно содержать не менее 2 символов.').max(50, 'Имя слишком длинное.'),
  drinkId: z.string({ required_error: 'Пожалуйста, выберите напиток.' }),
  customizations: z.string().max(100, 'Дополнения слишком длинные.').optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

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

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: defaultFormValues,
  });

  function onSubmit(data: OrderFormValues) {
    const drinkId = data.drinkId;
    const customizations = data.customizations || '';
    
    const newOrder: Order = {
        id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        customerName: data.customerName,
        drinkId: drinkId,
        customizations: customizations,
        status: 'готовится',
        createdAt: Date.now(),
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
        <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="mb-1 text-2xl font-bold font-headline">Новый заказ клиента</h2>
            <p className="mb-6 text-muted-foreground">Введите детали нового заказа. Нажмите "Разместить", когда закончите.</p>
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
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Выберите напиток" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {DRINKS.map(drink => (
                            <SelectItem key={drink.id} value={drink.id}>
                            {drink.name}
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
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="secondary" onClick={() => form.reset(defaultFormValues)}>Очистить</Button>
                  <Button type="submit">Разместить заказ</Button>
                </div>
            </form>
            </Form>
        </div>
      </main>
    </div>
  );
}
