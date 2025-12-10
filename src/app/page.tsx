'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Coffee, LogIn, HardDrive } from 'lucide-react';

export default function HomePage() {
    return (
        <div className="flex h-dvh w-full flex-col items-center justify-center bg-background text-center p-4">
            <div className="mb-8">
                <Coffee className="h-20 w-20 text-primary mx-auto" />
                <h1 className="mt-4 text-5xl font-bold tracking-tight text-primary font-headline">
                    БаристаТрек
                </h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-md mx-auto">
                    Ваша система для управления кофейней. Отслеживайте заказы, управляйте клиентами и анализируйте продажи.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-xs">
                <Button asChild size="lg" className="w-full">
                    <Link href="/su/login">
                        <LogIn className="mr-2" />
                        Вход для руководителя
                    </Link>
                </Button>
                <Button asChild variant="secondary" size="lg" className="w-full">
                    <Link href="/login/device">
                        <HardDrive className="mr-2" />
                        Активировать устройство
                    </Link>
                </Button>
            </div>
             <p className="absolute bottom-4 text-sm text-muted-foreground">
                Сделано с ❤️ в Firebase Studio
            </p>
        </div>
    );
}
