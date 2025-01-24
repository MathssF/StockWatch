import React, { useState } from 'react';
import { usePromotions } from '../contexts/PostPromoContext';

const PostPromotion: React.FC = () => {
  const { promotions, isLoading, error, fetchPromotions, postPromotion } = usePromotions();
  const [stockId, setStockId] = useState<number | ''>('');
  const [customerId, setCustomerId] = useState<number | ''>('');
  const [promoValue, setPromoValue] = useState<number | ''>('');

  const handlePostPromotion = async () => {
    if (stockId && customerId && promoValue) {
      await postPromotion({ id: Date.now().toString(), stockId, customerId, promoValue });
      setStockId('');
      setCustomerId('');
      setPromoValue('');
    }
  };

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

      <h3>Enviar Nova Promoção</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handlePostPromotion();
        }}
      >
        <div>
          <label>
            Estoque ID:
            <input
              type="number"
              value={stockId}
              onChange={(e) => setStockId(Number(e.target.value))}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Cliente ID:
            <input
              type="number"
              value={customerId}
              onChange={(e) => setCustomerId(Number(e.target.value))}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Valor da Promoção:
            <input
              type="number"
              step="0.01"
              value={promoValue}
              onChange={(e) => setPromoValue(Number(e.target.value))}
              required
            />
          </label>
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Enviando...' : 'Enviar Promoção'}
        </button>
      </form>
    </div>
  );
};

export default PostPromotion;
