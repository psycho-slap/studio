import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Новый клиент',
};

export default function NewCustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
