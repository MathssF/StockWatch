import { Route, Routes } from 'react-router-dom';
import Stock from '../pages/Stock';
import PromotionsPage from '../pages/Promotions';

const AppRoutes = () => (
  <Routes>
    <Route path="/stock" element={<Stock />} />
    <Route path="/promotion" element={<PromotionsPage />} />
  </Routes>
);

export default AppRoutes;
