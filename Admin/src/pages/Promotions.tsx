import React from 'react';
import PromotionsList from '../components/SendPromotion';
import PostPromotion from '../components/PostPromotion';
import { PromotionsProvider as SendProvider } from '../contexts/SendPromoContext';
import { PromotionsProvider as PostProvider } from '../contexts/PostPromoContext';

const PromotionsPage: React.FC = () => {
  return (
    <SendProvider>
      <PostProvider>
        <div>
          <h1>Gestão de Promoções</h1>
          <PromotionsList />
          <PostPromotion />
        </div>
      </PostProvider>
    </SendProvider>
  );
};

export default PromotionsPage;
