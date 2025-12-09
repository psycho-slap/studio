'use client';

import { useMemo } from 'react';
import { useCollection, useFirestore, useUser, useAuth, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Loader2, UserPlus, Users } from 'lucide-react';
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
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';

export default function CustomersPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const customersRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'customers');
  }, [firestore, user]);

  const { data: customers, isLoading, error } = useCollection<Customer>(customersRef);

  if (isUserLoading || isLoading) {
    return (
      <div className="flex h-dvh w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Загрузка данных о клиентах...</p>
      </div>
    );
  }

  if (!user) {
    return (
        <div className="flex h-dvh w-full flex-col items-center justify-center bg-background p-4 text-center">
            <h1 className="text-2xl font-bold text-destructive">Доступ запрещен</h1>
            <p className="mt-2 text-muted-foreground">
                Для просмотра этой страницы необходимо войти в систему.
            </p>
            <Button onClick={() => initiateAnonymousSignIn(auth)} className="mt-4">
                Войти как сотрудник
            </Button>
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
            <Link href="/">Вернуться на главный экран</Link>
          </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 shadow-sm md:px-6">
        <div className="flex items-center gap-3">
          <Users className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-primary font-headline">
            Клиентская база
          </h1>
        </div>
        <div className="flex items-center gap-2">
            <Button asChild>
                <Link href="/customers/new">
                    <UserPlus className="mr-2"/>
                    Новый клиент
                </Link>
            </Button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Список клиентов</CardTitle>
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
                          <Link href={`/customers/edit/${customer.id}`}>Редактировать</Link>
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
