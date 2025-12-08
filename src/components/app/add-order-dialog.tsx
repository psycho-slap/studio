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
  customerName: z.string().min(2, 'Name must be at least 2 characters.').max(50, 'Name is too long.'),
  drinkId: z.string({ required_error: 'Please select a drink.' }),
  customizations: z.string().max(100, 'Customizations are too long.').optional(),
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
          Add Order
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Customer Order</DialogTitle>
          <DialogDescription>
            Enter the details for the new order. Click place when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Jane Doe" {...field} />
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
                  <FormLabel>Drink</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a drink" />
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
                  <FormLabel>Customizations</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g. Oat milk, extra shot, no sugar..."
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
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Place Order</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
