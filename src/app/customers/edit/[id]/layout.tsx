import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Редактировать клиента',
};

export default function EditCustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
