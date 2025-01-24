import React, { createContext, useContext, useState, useEffect } from 'react';
import dotenv from 'dotenv';

dotenv.config();

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
  postPromotion: (promotionData: Promotion) => Promise<void>;
}

const PromotionsContext = createContext<PromotionsContextType | undefined>(undefined);

export const PromotionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const PRODUCER_POST_PROMOTION = process.env.PRODUCER_PROMOTION || '';
  const CONSUMER_POST_PROMOTION = process.env.CONSUMER_PROMOTION || '';

  const fetchPromotions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(CONSUMER_POST_PROMOTION);
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

  const postPromotion = async (promotionData: Promotion) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(PRODUCER_POST_PROMOTION, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promotionData),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar promoção.');
      }

      // Atualiza promoções após envio
      await fetchPromotions();
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
    <PromotionsContext.Provider value={{ promotions, isLoading, error, fetchPromotions, postPromotion }}>
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
