// StockChecker.tsx
import React from 'react';
import { useStock } from '../contexts/UpdateContext';

const StockChecker: React.FC = () => {
  const { updatedStocks, createdOrder, mode, isLoading, error, updateStock } = useStock();

  const handleUpdate = () => {
    updateStock();
  };

  return (
    <div>
      <button onClick={handleUpdate} disabled={isLoading}>
        {isLoading ? 'Atualizando...' : 'Verificar Estoque'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div>
        <h3>Resultado:</h3>
        <p>Modo: {mode}</p>
        <h4>Produtos Atualizados:</h4>
        <ul>
          {updatedStocks.map((stock) => (
            <li key={stock.stockId}>
              ID: {stock.stockId}, Quantidade Adicionada: {stock.quantityAdded}, Preço: {stock.price}
            </li>
          ))}
        </ul>

        {createdOrder && (
          <div>
            <h4>Ordem Criada:</h4>
            <p>ID: {createdOrder.id}</p>
            <p>Número da Ordem: {createdOrder.orderNumber}</p>
            <p>Status: {createdOrder.status}</p>
            <h5>Itens:</h5>
            <ul>
              {createdOrder.items.map((item) => (
                <li key={item.stockId}>
                  ID: {item.stockId}, Quantidade: {item.quantityAdded}, Preço: {item.price}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockChecker;
