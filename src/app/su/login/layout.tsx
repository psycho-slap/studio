import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Вход в систему',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
