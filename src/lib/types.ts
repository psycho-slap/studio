export type OrderStatus = 'pending' | 'in-progress' | 'ready';

export interface Drink {
  id: string;
  name: string;
  prepTime: number; // in minutes, for AI optimization logic
}

export interface Order {
  id: string;
  customerName: string;
  drinkId: string;
  customizations: string;
  status: OrderStatus;
  createdAt: number;
}
