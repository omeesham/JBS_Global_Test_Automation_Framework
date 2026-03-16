import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '@/services/api';
import { useClient } from './ClientContext';

interface Website {
  id: string;
  name: string;
  url: string;
  authType?: string;
  enabledServices?: string[];
  config?: Record<string, any>;
}

interface WebsiteContextType {
  website: Website | null;
  websites: Website[];
  setActiveWebsite: (id: string) => void;
  loading: boolean;
}

const WebsiteContext = createContext<WebsiteContextType | null>(null);

export function WebsiteProvider({ children }: { children: ReactNode }) {
  const { client } = useClient();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [website, setWebsite] = useState<Website | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!client) {
      setWebsites([]);
      setWebsite(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchWebsites() {
      setLoading(true);
      try {
        const { data } = await api.get<Website[]>('/websites', {
          params: { clientId: client!.id },
        });
        if (cancelled) return;

        setWebsites(data);
        setWebsite(data[0] ?? null);
      } catch {
        if (!cancelled) {
          setWebsites([]);
          setWebsite(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchWebsites();
    return () => { cancelled = true; };
  }, [client]);

  const setActiveWebsite = (id: string) => {
    const found = websites.find((w) => w.id === id);
    if (found) setWebsite(found);
  };

  return (
    <WebsiteContext.Provider value={{ website, websites, setActiveWebsite, loading }}>
      {children}
    </WebsiteContext.Provider>
  );
}

export function useWebsite() {
  const ctx = useContext(WebsiteContext);
  if (!ctx) throw new Error('useWebsite must be used within WebsiteProvider');
  return ctx;
}
