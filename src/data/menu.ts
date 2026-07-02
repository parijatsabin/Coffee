// Menu items are now loaded from the database via productService.
// This file is kept for type compatibility only.

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: 'Coffee' | 'Snacks' | 'Desserts' | 'Specials';
  image: string;
  popular?: boolean;
}

export const MENU_ITEMS: MenuItem[] = [];
