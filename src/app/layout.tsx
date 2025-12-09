import type {Metadata} from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';


export const metadata: Metadata = {
  title: {
    template: 'ИС | %s',
    default: 'ИС | Трекер',
  },
  description: 'Отслеживайте и управляйте кофейными заказами с легкостью.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
            {children}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
