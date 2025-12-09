'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// This is now just a redirect to the main supervisor dashboard page.
export default function HomeRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/su/lk');
    }, [router]);

    return (
        <div className="flex h-dvh w-full flex-col items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Загрузка...</p>
        </div>
    );
}
