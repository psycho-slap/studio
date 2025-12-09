'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFirestore, useUser, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Loader2, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';
import type { Customer } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const customerSchema = z.object({
  name: z.string().min(2, { message: 'Имя должно содержать не менее 2 символов.' }),
  phoneNumber: z.string().regex(/^\+?[0-9\s-()]{10,}$/, { message: 'Введите корректный номер телефона.' }),
  notes: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;
  
  const firestore = useFirestore();
  const { user } = useUser();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const customerRef = useMemo(() => {
      if (!firestore || !user || !customerId) return null;
      return doc(firestore, 'customers', customerId);
  }, [firestore, user, customerId]);

  const { data: customer, isLoading } = useDoc<Customer>(customerRef);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: '', phoneNumber: '', notes: '' },
  });

  useEffect(() => {
    if (customer) {
      form.reset({
        name: customer.name,
        phoneNumber: customer.phoneNumber,
        notes: customer.notes || '',
      });
    }
  }, [customer, form]);

  const onSubmit = (values: CustomerFormValues) => {
    if (!customerRef) return;
    
    setIsSubmitting(true);
    
    const updatedData = {
        id: customerId, // ensure the id is part of the data
        ...values
    };
    
    setDocumentNonBlocking(customerRef, updatedData, { merge: true });
    
    router.push('/app/customers');
  };

  const handleDelete = () => {
    if (!customerRef) return;
    setIsDeleting(true);
    deleteDocumentNonBlocking(customerRef);
    router.push('/app/customers');
  };

  if (isLoading) {
    return (
      <div className="flex h-dvh w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Загрузка данных клиента...</p>
      </div>
    );
  }

  if (!customer) {
      return (
        <div className="flex h-dvh w-full flex-col items-center justify-center bg-background p-4 text-center">
            <h1 className="text-2xl font-bold text-destructive">Клиент не найден</h1>
            <p className="mt-2 text-muted-foreground">Не удалось найти клиента с указанным ID.</p>
            <Button asChild className="mt-4">
                <Link href="/app/customers">Вернуться к списку</Link>
            </Button>
        </div>
      )
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 shadow-sm md:px-6">
        <h1 className="text-2xl font-bold tracking-tight text-primary font-headline">
          Редактировать клиента
        </h1>
      </header>
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <Card className="mx-auto max-w-xl">
          <CardHeader>
            <CardTitle>Информация о клиенте</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Имя</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Номер телефона</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Заметки</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button type="button" variant="destructive" className="w-auto">
                                <Trash2 className="mr-2"/> Удалить
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Это действие нельзя отменить. Карточка клиента будет безвозвратно удалена из базы данных.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>Отмена</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Удалить'}
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <Button type="submit" disabled={isSubmitting} className="flex-grow">
                    {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="mr-2" />
                    )}
                    Сохранить изменения
                    </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
