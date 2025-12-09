'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Loader2, Link2, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Schema for the form to add a new device
const deviceFormSchema = z.object({
  activationCode: z.string().length(6, { message: 'Код должен состоять из 6 цифр.' }),
  deviceName: z.string().min(2, { message: 'Название должно быть не менее 2 символов.' }),
});

type DeviceFormValues = z.infer<typeof deviceFormSchema>;

// Mock data for existing devices - in a real app, this would come from Firestore
const mockDevices = [
    { id: 'dev-1', name: 'Касса-1', type: 'Касса', addedAt: new Date() },
    { id: 'dev-2', name: 'Трекер-Кухня', type: 'Трекер', addedAt: new Date() },
];

export default function DevicesPage() {
    const [devices, setDevices] = useState(mockDevices);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<DeviceFormValues>({
        resolver: zodResolver(deviceFormSchema),
        defaultValues: {
            activationCode: '',
            deviceName: '',
        }
    });

    function onSubmit(data: DeviceFormValues) {
        console.log('Submitting form with data:', data);
        setIsSubmitting(true);
        // Here you would typically:
        // 1. Validate the activationCode against a value in Firestore
        // 2. If valid, create a new authenticated session for that device (e.g., using custom tokens)
        // 3. Save the device's info (name, type) to Firestore
        
        // For this mock, we'll just simulate it and add to the local list
        setTimeout(() => {
            // This is a mock. A real implementation would get the type from the activation code data.
            const newDeviceType = Math.random() > 0.5 ? 'Касса' : 'Трекер';
            const newDevice = {
                id: `dev-${Date.now()}`,
                name: data.deviceName,
                type: newDeviceType,
                addedAt: new Date(),
            };
            setDevices(prev => [newDevice, ...prev]);
            setIsSubmitting(false);
            form.reset();
        }, 1500);
    }

    const removeDevice = (id: string) => {
        setDevices(prev => prev.filter(device => device.id !== id));
    };

    return (
        <div className="flex-1 p-4 md:p-6 w-full space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Устройства</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Подключить новое устройство</CardTitle>
                            <CardDescription>
                                Введите 6-значный код, отображаемый на экране нового устройства, и дайте ему название.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="activationCode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Код активации</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="123456" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="deviceName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Название устройства</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Например, Касса-2" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                   Это поможет вам идентифицировать устройство.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Link2 className="mr-2 h-4 w-4" />
                                        )}
                                        Подключить
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                     <Card>
                        <CardHeader>
                            <CardTitle>Подключенные устройства</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <div className="overflow-x-auto">
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Название</TableHead>
                                        <TableHead>Тип</TableHead>
                                        <TableHead>Дата подключения</TableHead>
                                        <TableHead className="text-right">Действия</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {devices.length > 0 ? devices.map(device => (
                                        <TableRow key={device.id}>
                                            <TableCell className="font-medium">{device.name}</TableCell>
                                            <TableCell>{device.type}</TableCell>
                                            <TableCell>{device.addedAt.toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => removeDevice(device.id)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">
                                                Нет подключенных устройств.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                           </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

    