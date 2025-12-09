import AppLayout from "@/components/app/app-layout";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Устройства',
};

export default function DevicesLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <AppLayout>{children}</AppLayout>;
  }
