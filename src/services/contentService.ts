import { supabase } from '../lib/supabase';
import initialContent from '../data/site-content.json';

export interface SiteContent {
  brand: any;
  navigation: any[];
  home: any;
  about: any;
  menu: any;
  gallery: any;
  contact: any;
  footer: any;
}

const CONTENT_KEY = 'main_site_content';

export const contentService = {
  async getContent(): Promise<SiteContent> {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('value')
        .eq('key', CONTENT_KEY)
        .single();

      if (error) {
        console.warn('Supabase error, falling back to local content:', error.message);
        return initialContent as SiteContent;
      }

      return data.value as SiteContent;
    } catch (err) {
      console.error('Failed to fetch content from Supabase:', err);
      return initialContent as SiteContent;
    }
  },

  async updateContent(content: SiteContent): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('site_content')
        .upsert({ key: CONTENT_KEY, value: content }, { onConflict: 'key' });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Failed to update content in Supabase:', err);
      return false;
    }
  }
};
