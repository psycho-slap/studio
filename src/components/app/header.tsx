import { PlusCircle, History, Users, LayoutDashboard, Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface AppHeaderProps {
  soundEnabled?: boolean;
  onSoundToggle?: (enabled: boolean) => void;
  showSoundControl?: boolean;
}


export default function AppHeader({ soundEnabled, onSoundToggle, showSoundControl = false }: AppHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 shadow-sm md:px-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-primary font-headline">
          Трекер
        </h1>
      </div>
      <div className='flex items-center gap-4'>
        {showSoundControl && onSoundToggle && (
            <div className="flex items-center space-x-2">
                {soundEnabled ? <Bell className="text-primary"/> : <BellOff className="text-muted-foreground"/>}
                <Switch
                    id="sound-toggle"
                    checked={soundEnabled}
                    onCheckedChange={onSoundToggle}
                />
                 <Label htmlFor="sound-toggle" className="text-sm text-muted-foreground">
                    Звук
                </Label>
            </div>
        )}
        <div className='flex gap-2'>
            <Button variant="secondary" asChild>
                <Link href="/">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Дашборд
                </Link>
            </Button>
            <Button variant="secondary" asChild>
            <Link href="/customers">
                <Users className="mr-2 h-4 w-4" />
                Клиенты
            </Link>
            </Button>
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
      </div>
    </header>
  );
}
