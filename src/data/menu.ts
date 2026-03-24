import siteContent from './site-content.json';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: 'Coffee' | 'Snacks' | 'Desserts' | 'Specials';
  image: string;
  popular?: boolean;
}

export const MENU_ITEMS: MenuItem[] = siteContent.menu.items as MenuItem[];
