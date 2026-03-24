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
      const data = await contentService.getContent();
      setContent(data);
      setLoading(false);
    }
    loadContent();
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
