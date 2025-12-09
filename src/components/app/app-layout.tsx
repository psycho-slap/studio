'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInset,
} from '@/components/ui/sidebar';
import { useAuth, useUser } from '@/firebase';
import { LogOut, User, BarChart, Package, Warehouse, HardDrive, Coffee, Users, PlusCircle, History } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';


export default function AppLayout({ children }: { children: React.ReactNode }) {
    const auth = useAuth();
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/su/login');
        }
    }, [isUserLoading, user, router]);


    const isActive = (path: string) => pathname.startsWith(path);

    const handleSignOut = () => {
        auth?.signOut().then(() => {
            router.push('/su/login');
        })
    }

    if (isUserLoading || !user) {
        return null; // Or a loading spinner
    }

    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader>
                    <div className="flex items-center gap-2 p-2">
                        <Coffee className="h-8 w-8 text-primary" />
                        <h1 className="text-xl font-bold text-primary font-headline">ИС Руководителя</h1>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Управление</SidebarGroupLabel>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <Link href="/su/lk">
                                    <SidebarMenuButton isActive={pathname === '/su/lk'}>
                                        <BarChart />
                                        Панель
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                               <Link href="/su/lk/products">
                                    <SidebarMenuButton isActive={isActive('/su/lk/products')}>
                                        <Package />
                                        Товары
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                             <SidebarMenuItem>
                                <Link href="/su/lk/inventory">
                                    <SidebarMenuButton isActive={isActive('/su/lk/inventory')}>
                                        <Warehouse />
                                        Склад
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                             <SidebarMenuItem>
                                <Link href="/su/lk/devices">
                                    <SidebarMenuButton isActive={isActive('/su/lk/devices')}>
                                        <HardDrive />
                                        Устройства
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroup>
                     <SidebarGroup>
                        <SidebarGroupLabel>Рабочие инструменты</SidebarGroupLabel>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <Link href="/su/app/tracker">
                                    <SidebarMenuButton isActive={isActive('/su/app/tracker')}>
                                        <Coffee />
                                        Трекер
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                               <Link href="/su/app/add-order">
                                    <SidebarMenuButton isActive={isActive('/su/app/add-order')}>
                                        <PlusCircle />
                                        Касса
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                             <SidebarMenuItem>
                                <Link href="/su/app/customers">
                                    <SidebarMenuButton isActive={isActive('/su/app/customers')}>
                                        <Users />
                                        Клиенты
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <User />
                                {user.email || 'Сотрудник'}
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton onClick={handleSignOut}>
                                <LogOut />
                                Выход
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                <div className='flex h-full w-full'>
                     {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
