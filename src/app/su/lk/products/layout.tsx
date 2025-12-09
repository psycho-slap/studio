import AppLayout from "@/components/app/app-layout";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Товары',
};

export default function ProductsLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <AppLayout>{children}</AppLayout>;
  }
