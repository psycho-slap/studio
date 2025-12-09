'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Order } from '@/lib/types';
import { Loader2, DollarSign, ShoppingCart, BarChart, Clock, CalendarIcon } from 'lucide-react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const getStartOfDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

const getEndOfDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
}

export default function DashboardPage() {
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [paymentMethodFilter, setPaymentMethodFilter] = useState<'all' | 'card' | 'cash'>('all');

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/su/login');
        }
    }, [isUserLoading, user, router]);


    const dateRange = useMemo(() => {
        const start = getStartOfDay(selectedDate);
        const end = getEndOfDay(selectedDate);
        return { start, end };
    }, [selectedDate]);

    const ordersQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        
        const qConstraints = [
            where('createdAt', '>=', dateRange.start.getTime()),
            where('createdAt', '<=', dateRange.end.getTime())
        ];

        if (paymentMethodFilter !== 'all') {
            qConstraints.push(where('paymentMethod', '==', paymentMethodFilter));
        }
        
        return query(
            collection(firestore, 'orders'),
            ...qConstraints,
            orderBy('createdAt', 'desc')
        );
    }, [firestore, user, dateRange, paymentMethodFilter]);

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

    const isLoading = isUserLoading || areOrdersLoading;

    if (isLoading || !user) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Загрузка данных...</p>
            </div>
        );
    }

    return (
       <div className="flex-1 p-4 md:p-6 w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h2 className="text-2xl font-bold">Показатели за день</h2>
                 <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                            "w-full sm:w-[240px] justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, 'dd MMMM yyyy', { locale: ru }) : <span>Выберите дату</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => date && setSelectedDate(date)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <Select value={paymentMethodFilter} onValueChange={(value: 'all' | 'card' | 'cash') => setPaymentMethodFilter(value)}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Способ оплаты" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Все</SelectItem>
                            <SelectItem value="card">Карта</SelectItem>
                            <SelectItem value="cash">Наличные</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
           
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                    <CardTitle>Заказы за день</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Время</TableHead>
                                <TableHead>Клиент</TableHead>
                                <TableHead className="hidden md:table-cell">Состав</TableHead>
                                <TableHead>Сумма</TableHead>
                                <TableHead>Оплата</TableHead>
                                <TableHead>Статус</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders && orders.length > 0 ? (
                                orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell>{format(order.createdAt, 'HH:mm')}</TableCell>
                                        <TableCell>{order.customerName}</TableCell>
                                        <TableCell className="hidden md:table-cell">{order.items.map(i => i.name).join(', ')}</TableCell>
                                        <TableCell>{order.totalPrice} руб.</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {order.paymentMethod === 'card' ? 'Карта' : 'Наличные'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={order.status === 'завершен' ? 'secondary' : 'default'}>
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                                ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        За выбранный период заказов не найдено.
                                    </TableCell>
                                </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
       </div>
    );
}

    