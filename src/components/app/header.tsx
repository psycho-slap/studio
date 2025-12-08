import { Coffee, PlusCircle, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AppHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 shadow-sm md:px-6">
      <div className="flex items-center gap-3">
        <Coffee className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight text-primary font-headline">
          БаристаТрек
        </h1>
      </div>
      <div className='flex gap-2'>
        <Button asChild>
          <Link href="/add-order">
            <PlusCircle className="mr-2 h-4 w-4" />
            Касса
          </Link>
        </Button>
        <Button variant="outline" asChild>
            <Link href="/completed">
                <History className="mr-2 h-4 w-4" />
                Завершенные
            </Link>
        </Button>
      </div>
    </header>
  );
}
