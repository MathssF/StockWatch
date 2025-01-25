import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PromotionsPage from '../pages/Promotions';
import Stock from '../pages/Stock';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/promotion" element={<PromotionsPage />} />
      <Route path="/stock" element={<Stock />} />
    </Routes>
  );
};

export default AppRoutes;
