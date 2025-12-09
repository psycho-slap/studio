'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
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

    const isActive = (path: string) => pathname === path;

    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader>
                    <div className="flex items-center gap-2 p-2">
                        <Coffee className="h-8 w-8 text-primary" />
                        <h1 className="text-xl font-bold text-primary font-headline">ИС Бариста</h1>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Руководитель</SidebarGroupLabel>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <Link href="/dashboard" legacyBehavior passHref>
                                    <SidebarMenuButton isActive={isActive('/dashboard')}>
                                        <BarChart />
                                        Панель
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                               <Link href="/products" legacyBehavior passHref>
                                    <SidebarMenuButton isActive={isActive('/products')} disabled>
                                        <Package />
                                        Товары
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                             <SidebarMenuItem>
                                <Link href="/inventory" legacyBehavior passHref>
                                    <SidebarMenuButton isActive={isActive('/inventory')} disabled>
                                        <Warehouse />
                                        Склад
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                             <SidebarMenuItem>
                                <Link href="/devices" legacyBehavior passHref>
                                    <SidebarMenuButton isActive={isActive('/devices')} disabled>
                                        <HardDrive />
                                        Устройства
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroup>

                    <SidebarGroup>
                        <SidebarGroupLabel>Бариста</SidebarGroupLabel>
                         <SidebarMenu>
                            <SidebarMenuItem>
                                <Link href="/" legacyBehavior passHref>
                                    <SidebarMenuButton isActive={isActive('/')}>
                                        <Coffee />
                                        Трекер
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <Link href="/add-order" legacyBehavior passHref>
                                    <SidebarMenuButton isActive={isActive('/add-order')}>
                                        <PlusCircle />
                                        Касса
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                               <Link href="/completed" legacyBehavior passHref>
                                    <SidebarMenuButton isActive={isActive('/completed')}>
                                        <History />
                                        Завершенные
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <Link href="/customers" legacyBehavior passHref>
                                    <SidebarMenuButton isActive={isActive('/customers')}>
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
