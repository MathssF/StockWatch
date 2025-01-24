import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/routes';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
