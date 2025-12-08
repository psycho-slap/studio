'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import type { Drink } from '@/lib/types';
import { DRINKS } from '@/lib/data';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ModifiersPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const drinkId = searchParams.get('drinkId');
    const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
    const [currentModifiers, setCurrentModifiers] = useState<Record<string, Set<string>>>({});

    useEffect(() => {
        const drink = DRINKS.find(d => d.id === drinkId);
        if (drink) {
            setSelectedDrink(drink);
            const defaultModifiers: Record<string, Set<string>> = {};
            drink.modifiers.forEach(group => {
                if (group.items.length > 0) {
                    if (group.type === 'single') {
                        defaultModifiers[group.id] = new Set([group.items[0].id]);
                    } else {
                        defaultModifiers[group.id] = new Set();
                    }
                }
            });
            setCurrentModifiers(defaultModifiers);
        } else {
            // Handle case where drink is not found
            router.push('/add-order');
        }
    }, [drinkId, router]);
    
    const handleModifierChange = (groupId: string, modifierId: string, groupType: 'single' | 'multiple') => {
        setCurrentModifiers(prev => {
            const newModifiers = { ...prev };
            if (groupType === 'single') {
                newModifiers[groupId] = new Set([modifierId]);
            } else {
                const currentSet = new Set(newModifiers[groupId] || []);
                if (currentSet.has(modifierId)) {
                    currentSet.delete(modifierId);
                } else {
                    currentSet.add(modifierId);
                }
                newModifiers[groupId] = currentSet;
            }
            return newModifiers;
        });
    };

    const handleAddDrinkToOrder = () => {
        if (!selectedDrink) return;

        let finalPrice = selectedDrink.price;
        const customizations: string[] = [];

        Object.entries(currentModifiers).forEach(([groupId, modifierIds]) => {
            const group = selectedDrink.modifiers.find(g => g.id === groupId);
            if (!group) return;

            modifierIds.forEach(modifierId => {
                const modifier = group.items.find(i => i.id === modifierId);
                if (modifier && modifier.price > 0) {
                    finalPrice += modifier.price;
                    customizations.push(modifier.name);
                } else if (modifier && group.type === 'single' && group.items[0].id !== modifier.id) {
                    customizations.push(modifier.name);
                } else if (modifier && group.type === 'multiple') {
                    customizations.push(modifier.name);
                }
            });
        });

        const newItem = {
            id: `${selectedDrink.id}-${Date.now()}`,
            name: selectedDrink.name,
            price: selectedDrink.price,
            customizations: customizations.join(', '),
            finalPrice: finalPrice,
        };

        try {
            const existingOrder = JSON.parse(localStorage.getItem('currentOrder') || '[]');
            const updatedOrder = [...existingOrder, newItem];
            localStorage.setItem('currentOrder', JSON.stringify(updatedOrder));
            router.push('/add-order');
        } catch (error) {
            console.error("Failed to update order in localStorage", error);
        }
    };


    if (!selectedDrink) {
        return (
             <div className="flex h-dvh w-full items-center justify-center bg-background">
                <p>Загрузка...</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-dvh flex-col bg-background">
            <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 shadow-sm md:px-6">
                <h1 className="text-2xl font-bold tracking-tight text-primary font-headline">
                    Настроить «{selectedDrink.name}»
                </h1>
                <Button variant="ghost" asChild>
                  <Link href="/add-order">
                    Отмена
                  </Link>
                </Button>
            </header>
            <main className="flex-1 p-4 md:p-6">
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>Выберите модификаторы</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[calc(100dvh-20rem)]">
                            <div className="space-y-6 pr-6">
                                {selectedDrink.modifiers.map(group => (
                                    <div key={group.id}>
                                        <Label className="text-base font-semibold">{group.name}</Label>
                                        {group.type === 'single' ? (
                                            <RadioGroup 
                                                value={Array.from(currentModifiers[group.id] || [])[0]}
                                                onValueChange={(value) => handleModifierChange(group.id, value, group.type)}
                                                className="mt-2 space-y-2"
                                            >
                                                {group.items.map(item => (
                                                    <div key={item.id} className="flex items-center justify-between rounded-md border p-3">
                                                        <Label htmlFor={`radio-${item.id}`} className="flex items-center gap-3 cursor-pointer w-full">
                                                            <RadioGroupItem value={item.id} id={`radio-${item.id}`} />
                                                            {item.name}
                                                        </Label>
                                                        {item.price > 0 && <Badge variant="secondary">+{item.price} руб.</Badge>}
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        ) : (
                                            <div className="mt-2 space-y-2">
                                            {group.items.map(item => (
                                                <div key={item.id} className="flex items-center justify-between rounded-md border p-3">
                                                    <Label htmlFor={`check-${item.id}`} className="flex items-center gap-3 cursor-pointer w-full">
                                                        <Checkbox
                                                            id={`check-${item.id}`}
                                                            checked={currentModifiers[group.id]?.has(item.id)}
                                                            onCheckedChange={() => handleModifierChange(group.id, item.id, group.type)}
                                                        />
                                                        {item.name}
                                                    </Label>
                                                    {item.price > 0 && <Badge variant="secondary">+{item.price} руб.</Badge>}
                                                </div>
                                            ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </main>
            <footer className="sticky bottom-0 border-t bg-card p-4">
                <div className="max-w-2xl mx-auto">
                    <Button size="lg" className="w-full" onClick={handleAddDrinkToOrder}>
                        <Plus className="mr-2"/> Добавить в заказ
                    </Button>
                </div>
            </footer>
        </div>
    );
}