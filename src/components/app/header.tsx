import { PlusCircle, History, Users, LayoutDashboard, Coffee, TestTube2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface AppHeaderProps {
  title?: string;
  showTestOrderButton?: boolean;
  onTestOrderClick?: () => void;
}

export default function AppHeader({
  title = 'Трекер',
  showTestOrderButton = false,
  onTestOrderClick,
}: AppHeaderProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 shadow-sm md:px-6">
      <div className="flex items-center gap-3">
        <Link href="/su/app/tracker" className="flex items-center gap-3 text-primary">
            <Coffee className="h-7 w-7" />
            <h1 className="text-2xl font-bold tracking-tight font-headline">
                {title}
            </h1>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        
        <div className="flex gap-2">
           <Button variant="ghost" asChild>
            <Link href="/su/app/tracker">
              <Coffee className="mr-2 h-4 w-4" />
              Трекер
            </Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/su/app/customers">
              <Users className="mr-2 h-4 w-4" />
              Клиенты
            </Link>
          </Button>
          <Button asChild>
            <Link href="/su/app/add-order">
              <PlusCircle className="mr-2 h-4 w-4" />
              Касса
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/su/app/completed">
              <History className="mr-2 h-4 w-4" />
              Завершенные
            </Link>
          </Button>
          {showTestOrderButton && (
            <Button variant="outline" onClick={onTestOrderClick}>
              <TestTube2 className="mr-2 h-4 w-4" />
              Тестовый заказ
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
