import React from 'react';
import { StockProvider as CheckStockProvider } from '../contexts/CheckStockContext';
import { StockProvider as UpdateStockProvider } from '../contexts/UpdateContext';
import StockChecker from '../components/StockChecker'; // Componente de verificação de estoque (CheckStockContext)
import StockUpdater from '../components/UpdateStock'; // Componente de atualização de estoque (UpdateContext)

const Stock: React.FC = () => {
  return (
    <CheckStockProvider>
      <UpdateStockProvider>
        <div style={{ padding: '20px' }}>
          <h1>Gerenciamento de Estoque</h1>
          <div>
            <h2>Verificar Estoque</h2>
            <StockChecker />
          </div>
          <div style={{ marginTop: '40px' }}>
            <h2>Atualizar Estoque</h2>
            <StockUpdater />
          </div>
        </div>
      </UpdateStockProvider>
    </CheckStockProvider>
  );
};

export default Stock;
