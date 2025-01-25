import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PromotionsPage from '../pages/Promotions';
import Stock from '../pages/Stock';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/promotion" element={<PromotionsPage />} />
      <Route path="/stock" element={<Stock />} />
    </Routes>
  );
};

export default AppRoutes;
