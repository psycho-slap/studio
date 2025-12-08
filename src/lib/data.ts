import type { Drink, Order } from './types';

export const DRINKS: Drink[] = [
  { id: 'espresso', name: 'Espresso', prepTime: 2 },
  { id: 'cappuccino', name: 'Cappuccino', prepTime: 3 },
  { id: 'latte', name: 'Latte', prepTime: 4 },
  { id: 'americano', name: 'Americano', prepTime: 2 },
  { id: 'mocha', name: 'Mocha', prepTime: 5 },
  { id: 'flat-white', name: 'Flat White', prepTime: 3 },
  { id: 'iced-coffee', name: 'Iced Coffee', prepTime: 3 },
  { id: 'herbal-tea', name: 'Herbal Tea', prepTime: 2 },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: `order-1`,
    customerName: 'Alice',
    drinkId: 'cappuccino',
    customizations: 'Extra foam, oat milk',
    status: 'pending',
    createdAt: Date.now() - 300000,
  },
  {
    id: `order-2`,
    customerName: 'Bob',
    drinkId: 'latte',
    customizations: 'With caramel syrup',
    status: 'pending',
    createdAt: Date.now() - 240000,
  },
  {
    id: `order-3`,
    customerName: 'Charlie',
    drinkId: 'espresso',
    customizations: 'Double shot',
    status: 'in-progress',
    createdAt: Date.now() - 180000,
  },
  {
    id: `order-4`,
    customerName: 'Diana',
    drinkId: 'americano',
    customizations: '',
    status: 'ready',
    createdAt: Date.now() - 120000,
  },
    {
    id: `order-5`,
    customerName: 'Eve',
    drinkId: 'mocha',
    customizations: 'No whip',
    status: 'pending',
    createdAt: Date.now() - 60000,
  },
];
