import React from 'react';
import PromotionsList from '../components/SendPromotion';
import { PromotionsProvider as SendProvider } from '../contexts/SendPromoContext';
import PostPromotion from '../components/PostPromotion';
import { PromotionsProvider as PostProvider } from '../contexts/PostPromoContext';

const PromotionsPage: React.FC = () => {
  return (
    <SendProvider> 
      <PromotionsList />
    </SendProvider>
  );
};

export default PromotionsPage;
