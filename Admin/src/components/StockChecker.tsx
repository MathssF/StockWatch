import React, { useState } from 'react';
import { useStock } from '../contexts/StockContext';

const StockChecker: React.FC = () => {
  const { checkStock, lowStocks, message, isLoading, error } = useStock();
  const [filter, setFilter] = useState<string>('all'); // Filtro: 'all', 'product', 'stock', etc.

  const filteredStocks = lowStocks.filter((item) => {
    if (filter === 'product') return !!item.productId;
    if (filter === 'stock') return !!item.stockId;
    return true;
  });

  return (
    <div>
      <button onClick={checkStock} disabled={isLoading} style={{ marginBottom: '20px' }}>
        {isLoading ? 'Verificando...' : 'Checar Estoque'}
      </button>

      {message && <p style={{ fontWeight: 'bold' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div>
        <label htmlFor="filter">Filtrar:</label>
        <select id="filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Todos</option>
          <option value="product">Produtos</option>
          <option value="stock">Estoques</option>
        </select>
      </div>

      {filteredStocks.length > 0 ? (
        <table border={1} style={{ marginTop: '20px', width: '100%' }}>
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Stock ID</th>
              <th>Quantidade Atual</th>
              <th>Quanto Falta</th>
            </tr>
          </thead>
          <tbody>
            {filteredStocks.map((item, index) => (
              <tr key={index}>
                <td>{item.productId || 'N/A'}</td>
                <td>{item.stockId || 'N/A'}</td>
                <td>{item.quantityNow || 0}</td>
                <td>{item.quantityNeeded || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ marginTop: '20px' }}>
          {isLoading ? 'Carregando dados...' : 'Nenhum item encontrado.'}
        </p>
      )}
    </div>
  );
};

export default StockChecker;
