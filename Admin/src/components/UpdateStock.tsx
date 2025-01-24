import React from 'react';
import { useStock } from '../contexts/UpdateContext';

const StockChecker: React.FC = () => {
  const { updatedStocks, createdOrder, mode, isLoading, error, updateStock } = useStock();

  const handleUpdate = () => {
    updateStock();
  };

  return (
    <div>
      <button onClick={handleUpdate} disabled={isLoading} style={{ marginBottom: '20px' }}>
        {isLoading ? 'Atualizando...' : 'Verificar Estoque'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <h3>Resultado:</h3>
      <p>Modo: {mode}</p>

      {/* Tabela de Produtos Atualizados */}
      <h4>Produtos Atualizados:</h4>
      {updatedStocks.length > 0 ? (
        <table border={1} style={{ marginTop: '10px', width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID do Estoque</th>
              <th>Quantidade Adicionada</th>
              <th>Preço</th>
            </tr>
          </thead>
          <tbody>
            {updatedStocks.map((stock) => (
              <tr key={stock.stockId}>
                <td>{stock.stockId}</td>
                <td>{stock.quantityAdded}</td>
                <td>{stock.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Nenhum produto atualizado.</p>
      )}

      {/* Tabela de Ordem Criada */}
      {createdOrder && (
        <div style={{ marginTop: '20px' }}>
          <h4>Ordem Criada:</h4>
          <p>ID: {createdOrder.id}</p>
          <p>Número da Ordem: {createdOrder.orderNumber}</p>
          <p>Status: {createdOrder.status}</p>

          <h5>Itens da Ordem:</h5>
          {createdOrder.items.length > 0 ? (
            <table border={1} style={{ marginTop: '10px', width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>ID do Estoque</th>
                  <th>Quantidade</th>
                  <th>Preço</th>
                </tr>
              </thead>
              <tbody>
                {createdOrder.items.map((item) => (
                  <tr key={item.stockId}>
                    <td>{item.stockId}</td>
                    <td>{item.quantityAdded}</td>
                    <td>{item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Sem itens na ordem.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default StockChecker;
