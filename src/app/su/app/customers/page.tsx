'use client';

import { useMemo, useEffect } from 'react';
import { useCollection, useFirestore, useUser, useAuth, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Loader2, UserPlus, Users, LogIn } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Customer } from '@/lib/types';
import AppHeader from '@/components/app/header';
import { useRouter } from 'next/navigation';

export default function CustomersPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/su/login');
    }
  }, [isUserLoading, user, router]);

  const customersRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'customers');
  }, [firestore, user]);

  const { data: customers, isLoading, error } = useCollection<Customer>(customersRef);

  if (isUserLoading || isLoading || !user) {
    return (
      <div className="flex h-dvh w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Загрузка данных о клиентах...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex h-dvh w-full flex-col items-center justify-center bg-background p-4 text-center">
          <h1 className="text-2xl font-bold text-destructive">Ошибка загрузки</h1>
          <p className="mt-2 text-muted-foreground max-w-md">
            Не удалось загрузить данные о клиентах. Возможно, у вас нет прав доступа. Обратитесь к администратору.
          </p>
           <pre className="mt-4 text-xs bg-muted p-2 rounded-md text-left w-full max-w-md overflow-auto">
            <code>{error.message}</code>
          </pre>
          <Button asChild className="mt-4">
            <Link href="/su/app/tracker">Вернуться на главный экран</Link>
          </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AppHeader title="Клиентская база" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Список клиентов</CardTitle>
            <Button asChild>
                <Link href="/su/app/customers/new">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Новый клиент
                </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Имя</TableHead>
                  <TableHead>Номер телефона</TableHead>
                  <TableHead>Заметки</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers && customers.length > 0 ? (
                  customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.phoneNumber}</TableCell>
                      <TableCell>{customer.notes || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/su/app/customers/edit/${customer.id}`}>Редактировать</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Клиентов пока нет.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
