import React, { useState } from 'react';
import { usePostPromotion } from '../contexts/PostPromoContext';

const PostPromotion: React.FC = () => {
  const { isLoading, error, postPromotion } = usePostPromotion();
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
      <h2>Enviar Nova Promoção</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
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
