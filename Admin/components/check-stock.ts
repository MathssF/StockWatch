import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import './CheckStockBox.css'; // Inclua estilos personalizados, se necessário

// Tipos para a resposta da API
interface StockItem {
  productId: string;
  productName: string;
  stockId: string;
  quantityNow: number;
  quantityNeeded: number;
}

interface CheckStockResponse {
  lowStocks: StockItem[];
  messageID: string;
  notification: string;
}

// Contexto
interface CheckStockContextProps {
  data: CheckStockResponse | null;
  fetchCheckStock: () => Promise<void>;
}

const CheckStockContext = createContext<CheckStockContextProps | undefined>(undefined);

// Provedor do contexto
const CheckStockProvider: React.FC = ({ children }) => {
  const [data, setData] = useState<CheckStockResponse | null>(null);

  const fetchCheckStock = async () => {
    try {
      const response = await axios.get<CheckStockResponse>('/check-stock/informe');
      setData(response.data);
    } catch (error) {
      console.error('Erro ao buscar estoque:', error);
      setData(null);
    }
  };

  return (
    <CheckStockContext.Provider value={{ data, fetchCheckStock }}>
      {children}
    </CheckStockContext.Provider>
  );
};

// Hook para usar o contexto
const useCheckStock = () => {
  const context = useContext(CheckStockContext);
  if (!context) {
    throw new Error('useCheckStock deve ser usado dentro de um CheckStockProvider');
  }
  return context;
};

// Componente da tabela
interface StockTableProps {
  stocks: StockItem[];
  filter: 'all' | 'products' | 'stocks';
}

const StockTable: React.FC<StockTableProps> = ({ stocks, filter }) => {
  const filteredStocks = stocks.filter((item) => {
    if (filter === 'products') return !!item.productId;
    if (filter === 'stocks') return !!item.stockId;
    return true;
  });

  return (
    <table className="stock-table">
      <thead>
        <tr>
          <th>Product ID</th>
          <th>Product Name</th>
          <th>Stock ID</th>
          <th>Quantity Now</th>
          <th>Quantity Needed</th>
        </tr>
      </thead>
      <tbody>
        {filteredStocks.map((item) => (
          <tr key={item.stockId}>
            <td>{item.productId}</td>
            <td>{item.productName}</td>
            <td>{item.stockId}</td>
            <td>{item.quantityNow}</td>
            <td>{item.quantityNeeded}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// Componente principal
const CheckStockBox: React.FC = () => {
  const { data, fetchCheckStock } = useCheckStock();
  const [filter, setFilter] = useState<'all' | 'products' | 'stocks'>('all');

  return (
    <div className="check-stock-box">
      <h1>Check Stock</h1>
      <button onClick={fetchCheckStock}>Checar Estoque</button>
      {data && (
        <div className="notification">
          <p>{data.notification}</p>
        </div>
      )}

      {data?.lowStocks && (
        <div>
          <div className="filter-buttons">
            <button onClick={() => setFilter('all')}>Todos</button>
            <button onClick={() => setFilter('products')}>Produtos</button>
            <button onClick={() => setFilter('stocks')}>Estoques</button>
          </div>
          <StockTable stocks={data.lowStocks} filter={filter} />
        </div>
      )}
    </div>
  );
};

// Exportando o componente principal com o provedor de contexto
const CheckStockApp: React.FC = () => {
  return (
    <CheckStockProvider>
      <CheckStockBox />
    </CheckStockProvider>
  );
};

export default CheckStockApp;
