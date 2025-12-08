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
    name: string;
    price: number;
    customizations: string; // e.g., "Oat Milk, Vanilla"
    finalPrice: number;
}

export interface Order {
  id: string;
  customerName: string;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: number;
  totalPrice: number;
  paymentMethod: PaymentMethod;
}
