'use client';

import { useMemo } from 'react';
import type { Order } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, DollarSign, ShoppingCart, BarChart, Users, LayoutDashboard, Clock } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase, useUser, useAuth } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';

const getStartOfToday = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now.getTime();
}

export default function DashboardPage() {
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    const auth = useAuth();

    const startOfToday = useMemo(() => getStartOfToday(), []);

    const ordersQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(
            collection(firestore, 'orders'),
            where('createdAt', '>=', startOfToday),
            orderBy('createdAt', 'desc')
        );
    }, [firestore, user, startOfToday]);

    const { data: orders, isLoading: areOrdersLoading } = useCollection<Order>(ordersQuery);

    const stats = useMemo(() => {
        if (!orders) return { totalRevenue: 0, orderCount: 0, avgCheck: 0, avgPrepTime: 0 };
        const orderCount = orders.length;
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
        const avgCheck = orderCount > 0 ? totalRevenue / orderCount : 0;
        
        const completedOrders = orders.filter(o => o.status === 'завершен' && o.completedAt);
        const totalPrepTime = completedOrders.reduce((sum, order) => sum + (order.completedAt! - order.createdAt), 0);
        const avgPrepTime = completedOrders.length > 0 ? (totalPrepTime / completedOrders.length) / 1000 : 0; // in seconds

        return { totalRevenue, orderCount, avgCheck, avgPrepTime };
    }, [orders]);


    if (isUserLoading || areOrdersLoading) {
        return (
            <div className="flex h-dvh w-full flex-col items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Загрузка данных...</p>
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

    return (
        <div className="flex min-h-dvh flex-col bg-background">
            <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 shadow-sm md:px-6">
                <div className="flex items-center gap-3">
                    <LayoutDashboard className="h-7 w-7 text-primary" />
                    <h1 className="text-2xl font-bold tracking-tight text-primary font-headline">
                        Панель руководителя
                    </h1>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Назад к трекеру
                    </Link>
                </Button>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="mx-auto max-w-7xl">
                    <h2 className="text-xl font-semibold mb-4">Показатели за сегодня ({format(new Date(), 'dd MMMM yyyy', { locale: ru })})</h2>
                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Общая выручка</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString('ru-RU')} руб.</div>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Количество заказов</CardTitle>
                                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.orderCount}</div>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Средний чек</CardTitle>
                                <BarChart className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.avgCheck.toFixed(2)} руб.</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Среднее время готовки</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">~ {Math.round(stats.avgPrepTime)} сек.</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Orders Table */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Последние заказы</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                    <TableHead>Время</TableHead>
                                    <TableHead>Клиент</TableHead>
                                    <TableHead>Состав заказа</TableHead>
                                    <TableHead>Сумма</TableHead>
                                    <TableHead>Статус</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders && orders.length > 0 ? (
                                    orders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell>{format(order.createdAt, 'HH:mm')}</TableCell>
                                            <TableCell>{order.customerName}</TableCell>
                                            <TableCell>{order.items.map(i => i.name).join(', ')}</TableCell>
                                            <TableCell>{order.totalPrice} руб.</TableCell>
                                            <TableCell>
                                                <Badge variant={order.status === 'завершен' ? 'secondary' : 'default'}>
                                                    {order.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                    ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            Заказов за сегодня еще не было.
                                        </TableCell>
                                    </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
