import React, { createContext, useContext, useState, useEffect } from 'react';
import { contentService, SiteContent } from '../services/contentService';
import initialContent from '../data/site-content.json';

interface ContentContextType {
  content: SiteContent;
  loading: boolean;
  updateContent: (newContent: SiteContent) => Promise<boolean>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<SiteContent>(initialContent as SiteContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContent() {
      try {
        const data = await contentService.getContent();
        setContent(data);
      } catch (error) {
        console.error('Failed to load content:', error);
        // Fallback to initial content if service fails
        setContent(initialContent as SiteContent);
      } finally {
        setLoading(false);
      }
    }

    loadContent();

    // Fallback timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Content loading timeout, using initial content');
        setContent(initialContent as SiteContent);
        setLoading(false);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  const updateContent = async (newContent: SiteContent) => {
    const success = await contentService.updateContent(newContent);
    if (success) {
      setContent(newContent);
    }
    return success;
  };

  return (
    <ContentContext.Provider value={{ content, loading, updateContent }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}
