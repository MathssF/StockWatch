import React, { createContext, useContext, useState, useEffect } from 'react';

interface Promotion {
  id: string;
  stockId: number;
  customerId: number;
  promoValue: number;
}

interface PromotionsContextType {
  promotions: Promotion[];
  isLoading: boolean;
  error: string | null;
  fetchPromotions: () => Promise<void>;
}

const PromotionsContext = createContext<PromotionsContextType | undefined>(undefined);

export const PromotionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPromotions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/promotions');
      if (!response.ok) {
        throw new Error('Erro ao buscar promoções.');
      }

      const data = await response.json();
      setPromotions(data.promotions || []);
    } catch (err: any) {
      setError(err.message || 'Erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  return (
    <PromotionsContext.Provider value={{ promotions, isLoading, error, fetchPromotions }}>
      {children}
    </PromotionsContext.Provider>
  );
};

export const usePromotions = (): PromotionsContextType => {
  const context = useContext(PromotionsContext);
  if (!context) {
    throw new Error('usePromotions deve ser usado dentro de PromotionsProvider');
  }
  return context;
};
