'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import type { Customer } from '@/lib/types';
import { ArrowLeft, Trash2, Save } from 'lucide-react';
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
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

const customerSchema = z.object({
  name: z.string().min(2, "Имя должно содержать не менее 2 символов"),
  phoneNumber: z.string().min(6, "Номер телефона слишком короткий"),
  notes: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

export default function EditCustomerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get('id');
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(!!customerId);
  const [isSaving, setIsSaving] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: '', phoneNumber: '', notes: '' },
  });

  const fetchCustomer = useCallback(async (id: string) => {
    if (!firestore) return;
    setIsLoading(true);
    try {
      const docRef = doc(firestore, 'customers', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const customerData = docSnap.data() as Customer;
        reset({
          name: customerData.name,
          phoneNumber: customerData.phoneNumber,
          notes: customerData.notes || '',
        });
      } else {
        console.error('Customer not found');
        toast({ title: "Ошибка", description: "Клиент не найден.", variant: "destructive" });
        router.push('/customers');
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
      toast({ title: "Ошибка", description: "Не удалось загрузить данные клиента.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [firestore, reset, router, toast]);

  useEffect(() => {
    if (customerId) {
      fetchCustomer(customerId);
    }
  }, [customerId, fetchCustomer]);

  const onSubmit = (data: CustomerFormData) => {
    if (!firestore) return;
    setIsSaving(true);
    
    // The document ID is the phone number
    const newCustomerId = data.phoneNumber;
    
    const customerData: Customer = {
      id: newCustomerId,
      ...data,
    };

    const docRef = doc(firestore, 'customers', newCustomerId);
    
    setDocumentNonBlocking(docRef, customerData, { merge: true });

    toast({
      title: "Сохранено!",
      description: `Данные клиента ${data.name} были обновлены.`,
    });

    // If the phone number (ID) was changed, we might need to delete the old document
    if (customerId && customerId !== newCustomerId) {
        const oldDocRef = doc(firestore, 'customers', customerId);
        deleteDocumentNonBlocking(oldDocRef);
    }

    setTimeout(() => {
        router.push('/customers');
    }, 500); // Give a moment for the user to see the feedback
  };
  
  const handleDelete = () => {
    if (!firestore || !customerId) return;
    
    const docRef = doc(firestore, 'customers', customerId);
    deleteDocumentNonBlocking(docRef);
    
    toast({
        title: "Клиент удален",
        variant: "destructive"
    });

    router.push('/customers');
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 shadow-sm md:px-6">
        <h1 className="text-2xl font-bold tracking-tight text-primary font-headline">
          {customerId ? 'Редактировать клиента' : 'Новый клиент'}
        </h1>
        <Button variant="outline" onClick={() => router.push('/customers')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад к списку
        </Button>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-2xl">
          {isLoading ? (
            <p>Загрузка...</p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="name">Имя</Label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => <Input id="name" {...field} className="mt-1" />}
                />
                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="phoneNumber">Номер телефона</Label>
                <Controller
                  name="phoneNumber"
                  control={control}
                  render={({ field }) => <Input id="phoneNumber" {...field} className="mt-1" />}
                />
                {errors.phoneNumber && <p className="text-sm text-destructive mt-1">{errors.phoneNumber.message}</p>}
                <p className="text-xs text-muted-foreground mt-1">Используется как уникальный идентификатор.</p>
              </div>
              <div>
                <Label htmlFor="notes">Заметки</Label>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => <Textarea id="notes" {...field} className="mt-1" placeholder="Предпочтения, аллергии и т.д." />}
                />
              </div>
              <div className="flex justify-between items-center pt-4">
                <Button type="submit" disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? 'Сохранение...' : 'Сохранить'}
                </Button>
                {customerId && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button type="button" variant="destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Удалить клиента
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Это действие необратимо. Карточка клиента будет удалена навсегда.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Отмена</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Удалить</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
