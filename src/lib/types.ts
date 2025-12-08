import { type Timestamp } from "firebase/firestore";

export type OrderStatus = 'готовится' | 'завершен';
export type PaymentMethod = 'cash' | 'card';

export interface Modifier {
    id: string;
    name: string;
    price: number;
}

export interface ModifierGroup {
    id: string;
    name: string;
    type: 'single' | 'multiple';
    items: Modifier[];
}

export interface Drink {
  id: string;
  name: string;
  category: string;
  prepTime: number; 
  price: number;
  modifiers: ModifierGroup[];
}

export interface OrderItem {
    id: string; // unique item id in one order
    drinkId: string;
    name: string;
    price: number;
    customizations: string; // e.g., "Oat Milk, Vanilla"
    finalPrice: number;
}

export interface Order {
  id: string;
  customerName: string; // Can be "Гость" or the customer's name
  customerId?: string; // Optional customer ID from Firestore
  items: OrderItem[];
  status: OrderStatus;
  createdAt: number; // Using number (timestamp) for simplicity across client/server
  completedAt?: number; // Timestamp when the order was completed
  totalPrice: number;
  paymentMethod: PaymentMethod;
  estimatedPrepTime: number; // in seconds
}

export interface Customer {
  id: string;
  name: string;
  phoneNumber: string;
  notes?: string;
}
