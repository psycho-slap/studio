import type { Drink, Order } from './types';

const milkModifiers = {
    id: 'milk',
    name: 'Молоко',
    type: 'single' as 'single',
    items: [
        { id: 'whole-milk', name: 'Обычное молоко', price: 0 },
        { id: 'oat-milk', name: 'Овсяное молоко', price: 50 },
        { id: 'soy-milk', name: 'Соевое молоко', price: 50 },
        { id: 'almond-milk', name: 'Миндальное молоко', price: 60 },
    ],
};

const syrupModifiers = {
    id: 'syrup',
    name: 'Сироп',
    type: 'multiple' as 'multiple',
    items: [
        { id: 'no-syrup', name: 'Без сиропа', price: 0 },
        { id: 'vanilla', name: 'Ванильный', price: 40 },
        { id: 'caramel', name: 'Карамельный', price: 40 },
        { id: 'hazelnut', name: 'Ореховый', price: 40 },
    ],
};

const extrasModifiers = {
    id: 'extras',
    name: 'Добавки',
    type: 'multiple' as 'multiple',
    items: [
        { id: 'extra-shot', name: 'Доп. шот эспрессо', price: 70 },
        { id: 'cinnamon', name: 'Корица', price: 20 },
        { id: 'whipped-cream', name: 'Взбитые сливки', price: 60 },
    ]
}


export const DRINKS: Drink[] = [
  { 
    id: 'cappuccino', 
    name: 'Капучино', 
    category: 'Кофе',
    prepTime: 3, 
    price: 250,
    modifiers: [milkModifiers, syrupModifiers, extrasModifiers]
  },
  { 
    id: 'latte', 
    name: 'Латте', 
    category: 'Кофе',
    prepTime: 4, 
    price: 280,
    modifiers: [milkModifiers, syrupModifiers, extrasModifiers]
  },
  { 
    id: 'espresso', 
    name: 'Эспрессо', 
    category: 'Кофе',
    prepTime: 2, 
    price: 150,
    modifiers: [extrasModifiers]
  },
  { 
    id: 'americano', 
    name: 'Американо', 
    category: 'Кофе',
    prepTime: 2, 
    price: 180,
    modifiers: [extrasModifiers]
  },
  { 
    id: 'mocha', 
    name: 'Мокка', 
    category: 'Кофе',
    prepTime: 5, 
    price: 320,
    modifiers: [milkModifiers, extrasModifiers]
  },
  { 
    id: 'flat-white', 
    name: 'Флэт Уайт',
    category: 'Кофе', 
    prepTime: 3, 
    price: 260,
    modifiers: [milkModifiers]
  },
  { 
    id: 'iced-coffee', 
    name: 'Холодный кофе', 
    category: 'Холодные напитки',
    prepTime: 3, 
    price: 220,
    modifiers: [syrupModifiers]
  },
  { 
    id: 'herbal-tea', 
    name: 'Травяной чай', 
    category: 'Чай',
    prepTime: 2, 
    price: 120,
    modifiers: []
  },
  { 
    id: 'black-tea', 
    name: 'Черный чай', 
    category: 'Чай',
    prepTime: 2, 
    price: 120,
    modifiers: []
  },
  { 
    id: 'green-tea', 
    name: 'Зеленый чай', 
    category: 'Чай',
    prepTime: 2, 
    price: 120,
    modifiers: []
  },
];

export const INITIAL_ORDERS: Order[] = [];
