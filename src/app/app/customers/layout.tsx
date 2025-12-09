import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Клиенты',
};

export default function CustomersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
