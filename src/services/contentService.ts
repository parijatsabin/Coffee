import { supabase } from '../lib/supabase';
import initialContent from '../data/site-content.json';

export interface SiteContent {
  brand: any;
  navigation: any[];
  home: any;
  about: any;
  menu: {
    headline: string;
    description: string;
    searchPlaceholder: string;
    categories: string[];
  };
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
        .select('content')
        .eq('section_key', CONTENT_KEY)
        .maybeSingle();

      if (error) {
        console.warn('Supabase error, falling back to local content:', error.message);
        return initialContent as SiteContent;
      }

      if (data?.content) {
        return data.content as SiteContent;
      }

      const fallback = await supabase
        .from('site_content')
        .select('content')
        .eq('section_key', 'brand')
        .maybeSingle();

      if (fallback.data?.content) {
        return fallback.data.content as SiteContent;
      }

      return initialContent as SiteContent;
    } catch (err) {
      console.error('Failed to fetch content from Supabase:', err);
      return initialContent as SiteContent;
    }
  },

  async updateContent(content: SiteContent): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('site_content')
        .upsert(
          {
            section_key: CONTENT_KEY,
            content,
            description: 'Main site content',
            is_active: true,
          },
          { onConflict: 'section_key' }
        );

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Failed to update content in Supabase:', err);
      return false;
    }
  }
};
