import AppLayout from "@/components/app/app-layout";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Панель руководителя',
};

export default function DashboardLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <AppLayout>{children}</AppLayout>;
  }