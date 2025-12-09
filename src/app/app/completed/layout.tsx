import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Завершенные заказы',
};

export default function CompletedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
