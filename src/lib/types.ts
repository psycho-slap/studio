export type OrderStatus = 'готовится' | 'завершен';

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
