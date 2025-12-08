import type { Drink, Order } from './types';

export const DRINKS: Drink[] = [
  { id: 'espresso', name: 'Эспрессо', prepTime: 2 },
  { id: 'cappuccino', name: 'Капучино', prepTime: 3 },
  { id: 'latte', name: 'Латте', prepTime: 4 },
  { id: 'americano', name: 'Американо', prepTime: 2 },
  { id: 'mocha', name: 'Мокка', prepTime: 5 },
  { id: 'flat-white', name: 'Флэт Уайт', prepTime: 3 },
  { id: 'iced-coffee', name: 'Холодный кофе', prepTime: 3 },
  { id: 'herbal-tea', name: 'Травяной чай', prepTime: 2 },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: `order-1`,
    customerName: 'Алиса',
    drinkId: 'cappuccino',
    customizations: 'Дополнительная пена, овсяное молоко',
    status: 'pending',
    createdAt: Date.now() - 300000,
  },
  {
    id: `order-2`,
    customerName: 'Борис',
    drinkId: 'latte',
    customizations: 'С карамельным сиропом',
    status: 'pending',
    createdAt: Date.now() - 240000,
  },
  {
    id: `order-3`,
    customerName: 'Карл',
    drinkId: 'espresso',
    customizations: 'Двойной шот',
    status: 'in-progress',
    createdAt: Date.now() - 180000,
  },
  {
    id: `order-4`,
    customerName: 'Диана',
    drinkId: 'americano',
    customizations: '',
    status: 'ready',
    createdAt: Date.now() - 120000,
  },
    {
    id: `order-5`,
    customerName: 'Ева',
    drinkId: 'mocha',
    customizations: 'Без взбитых сливок',
    status: 'pending',
    createdAt: Date.now() - 60000,
  },
];
