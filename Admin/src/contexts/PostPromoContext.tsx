import React, { createContext, useContext, useState } from 'react';
import dotenv from 'dotenv';

dotenv.config();

interface Promotion {
  id: string;
  stockId: number;
  customerId: number;
  promoValue: number;
}

interface PromotionsContextType {
  postPromotion: (promotionData: Promotion) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const PromotionsContext = createContext<PromotionsContextType | undefined>(undefined);

export const PromotionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const PRODUCER_POST_PROMOTION = process.env.PRODUCER_PROMOTION || '';

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
    } catch (err: any) {
      setError(err.message || 'Erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PromotionsContext.Provider value={{ postPromotion, isLoading, error }}>
      {children}
    </PromotionsContext.Provider>
  );
};

export const usePostPromotion = (): PromotionsContextType => {
  const context = useContext(PromotionsContext);
  if (!context) {
    throw new Error('usePostPromotion deve ser usado dentro de PromotionsProvider');
  }
  return context;
};
