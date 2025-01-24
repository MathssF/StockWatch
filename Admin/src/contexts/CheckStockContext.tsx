import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';

interface StockContextProps {
  lowStocks: any[];
  message: string | null;
  isLoading: boolean;
  error: string | null;
  checkStock: () => Promise<void>;
}

const StockContext = createContext<StockContextProps | undefined>(undefined);

export const StockProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lowStocks, setLowStocks] = useState<any[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const checkStock = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:${process.env.PRODUCER_PORT}/check-stock/informe`);
      const { lowStocks, notification } = response.data;
      setLowStocks(lowStocks);
      setMessage(notification.notification || 'Estoque verificado com sucesso.');
    } catch (err) {
      setError('Erro ao verificar o estoque.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StockContext.Provider value={{ lowStocks, message, isLoading, error, checkStock }}>
      {children}
    </StockContext.Provider>
  );
};

export const useStock = (): StockContextProps => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStock deve ser usado dentro de um StockProvider.');
  }
  return context;
};
