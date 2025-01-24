import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';

interface StockUpdate {
  stockId: number;
  quantityAdded: number;
  price: number;
}

interface CreatedOrder {
  id: number;
  orderNumber: string;
  status: string;
  items: StockUpdate[];
}

interface StockContextProps {
  updatedStocks: StockUpdate[];
  createdOrder: CreatedOrder | null;
  mode: number;
  isLoading: boolean;
  error: string | null;
  updateStock: (message?: string) => Promise<void>;
}

const StockContext = createContext<StockContextProps | undefined>(undefined);

export const StockProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [updatedStocks, setUpdatedStocks] = useState<StockUpdate[]>([]);
  const [createdOrder, setCreatedOrder] = useState<CreatedOrder | null>(null);
  const [mode, setMode] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateStock = async (message?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/update-stock', { message });
      const { updatedStocks, createdOrder, mode } = response.data;

      setUpdatedStocks(updatedStocks);
      setCreatedOrder(createdOrder);
      setMode(mode);
    } catch (err) {
      setError('Erro ao atualizar o estoque.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StockContext.Provider
      value={{ updatedStocks, createdOrder, mode, isLoading, error, updateStock }}
    >
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
