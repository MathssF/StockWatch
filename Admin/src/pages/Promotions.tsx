import React from 'react';
import PromotionsList from '../components/SendPromotion';
import { PromotionsProvider } from '../contexts/SendPromoContext'; // Correção para garantir que está importando como componente

const PromotionsPage: React.FC = () => {
  return (
    <PromotionsProvider> 
      <PromotionsList />
    </PromotionsProvider>
  );
};

export default PromotionsPage;
