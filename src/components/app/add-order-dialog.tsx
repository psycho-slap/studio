'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
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
import { PlusCircle } from 'lucide-react';
import { DRINKS } from '@/lib/data';
import type { Order } from '@/lib/types';

const orderSchema = z.object({
  customerName: z.string().min(2, 'Имя должно содержать не менее 2 символов.').max(50, 'Имя слишком длинное.'),
  drinkId: z.string({ required_error: 'Пожалуйста, выберите напиток.' }),
  customizations: z.string().max(100, 'Дополнения слишком длинные.').optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

interface AddOrderDialogProps {
  addOrder: (order: Omit<Order, 'id' | 'status' | 'createdAt'>) => void;
}

export function AddOrderDialog({ addOrder }: AddOrderDialogProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customerName: '',
      customizations: '',
      drinkId: '',
    },
  });

  function onSubmit(data: OrderFormValues) {
    addOrder(data);
    form.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Добавить заказ
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Новый заказ клиента</DialogTitle>
          <DialogDescription>
            Введите детали нового заказа. Нажмите "Разместить", когда закончите.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Отмена
                </Button>
              </DialogClose>
              <Button type="submit">Разместить заказ</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
