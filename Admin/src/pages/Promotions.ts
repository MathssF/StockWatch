import React from 'react';
import { PromotionsList } from '../components/SendPromotion';
import { PromotionsProvider } from '../contexts/SendPromoContext';

const PromotionsPage: React.FC = () => {
  return (
    <PromotionsProvider>
      <PromotionsList />
    </PromotionsProvider>
  );
};

export default PromotionsPage;
