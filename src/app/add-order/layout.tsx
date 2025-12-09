import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Касса',
};

export default function AddOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
