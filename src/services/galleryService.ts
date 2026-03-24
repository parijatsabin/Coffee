import { supabase } from '../lib/supabase';

export interface GalleryImage {
  id: string;
  url: string;
  caption: string;
  category: string;
  created_at?: string;
}

export const galleryService = {
  async getImages(): Promise<GalleryImage[]> {
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Failed to fetch gallery images:', err);
      return [];
    }
  },

  async addImage(image: Omit<GalleryImage, 'id' | 'created_at'>): Promise<GalleryImage | null> {
    try {
      const { data, error } = await supabase
        .from('gallery')
        .insert(image)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Failed to add gallery image:', err);
      return null;
    }
  },

  async updateImage(id: string, image: Partial<GalleryImage>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('gallery')
        .update(image)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Failed to update gallery image:', err);
      return false;
    }
  },

  async deleteImage(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('gallery')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Failed to delete gallery image:', err);
      return false;
    }
  },

  async uploadImage(file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `gallery/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err) {
      console.error('Failed to upload image:', err);
      return null;
    }
  }
};
