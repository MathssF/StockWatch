import React from 'react';
import { StockProvider } from '../contexts/StockContext';
import StockChecker from '../components/StockChecker';

const Stock: React.FC = () => {
  return (
    <StockProvider>
      <div style={{ padding: '20px' }}>
        <h1>Verificar Estoque</h1>
        <StockChecker />
      </div>
    </StockProvider>
  );
};

export default Stock;
