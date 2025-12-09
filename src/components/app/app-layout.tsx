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
import { useAuth } from '@/firebase';
import { LogOut, User, BarChart, Package, Warehouse, HardDrive, Coffee, Users, PlusCircle, History } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';


export default function AppLayout({ children }: { children: React.ReactNode }) {
    const auth = useAuth();
    const pathname = usePathname();

    const isActive = (path: string) => pathname.startsWith(path);

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
                                Сотрудник #1
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton onClick={() => auth?.signOut()}>
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
