import AppLayout from "@/components/app/app-layout";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Склад',
};

export default function InventoryLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <AppLayout>{children}</AppLayout>;
  }
