export type OrderStatus = 'готовится' | 'завершен';
export type PaymentMethod = 'cash' | 'card';

export interface Drink {
  id: string;
  name: string;
  prepTime: number; // in minutes, for AI optimization logic
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  drinkId: string;
  customizations: string;
  status: OrderStatus;
  createdAt: number;
  price: number;
  paymentMethod: PaymentMethod;
}
