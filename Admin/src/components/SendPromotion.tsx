import React from 'react';
import { usePromotions } from '../contexts/SendPromoContext';

const PromotionsList: React.FC = () => {
  const { promotions, isLoading, error, fetchPromotions } = usePromotions(); // usePromotions retorna corretamente o tipo esperado

  return (
    <div>
      <h2>Promoções</h2>

      <button onClick={fetchPromotions} disabled={isLoading}>
        {isLoading ? 'Carregando...' : 'Atualizar Promoções'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <ul>
        {promotions.map((promotion) => (
          <li key={promotion.id}>
            Estoque ID: {promotion.stockId}, Cliente ID: {promotion.customerId}, Valor da Promoção: R$ {promotion.promoValue}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PromotionsList;
