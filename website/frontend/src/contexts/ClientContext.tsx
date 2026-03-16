import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface Client {
  id: string;
  name: string;
  slug: string;
  dbSchema: string;
  plan: string;
}

interface ClientContextType {
  client: Client | null;
  clients: Client[];
  setActiveClient: (id: string) => void;
  loading: boolean;
}

const ClientContext = createContext<ClientContextType | null>(null);

export function ClientProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setClients([]);
      setClient(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchClients() {
      setLoading(true);
      try {
        let visible: Client[];
        if (user!.role === 'super_admin') {
          const { data } = await api.get<Client[]>('/clients');
          visible = data;
        } else if (user!.clientId) {
          const { data } = await api.get<Client>(`/clients/${user!.clientId}`);
          visible = data ? [data] : [];
        } else {
          // clientId null (demo user fallback) — endpoint returns scoped results by schema
          const { data } = await api.get<Client[]>('/clients');
          visible = data;
        }
        if (cancelled) return;

        setClients(visible);
        setClient(visible[0] ?? null);
      } catch {
        if (!cancelled) {
          setClients([]);
          setClient(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchClients();
    return () => { cancelled = true; };
  }, [user]);

  const setActiveClient = (id: string) => {
    const found = clients.find((c) => c.id === id);
    if (found) setClient(found);
  };

  return (
    <ClientContext.Provider value={{ client, clients, setActiveClient, loading }}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClient() {
  const ctx = useContext(ClientContext);
  if (!ctx) throw new Error('useClient must be used within ClientProvider');
  return ctx;
}
