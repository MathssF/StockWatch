import { CheckStock } from './check-stock';
import { SendPromotions } from './send-promotions';

export class StockController {
  // Método para chamar CheckStock
  static async CheckStock(): Promise<void> {
    await CheckStock.run();
  }

  // Método para chamar SendPromotions
  static async SendPromotions(): Promise<void> {
    await SendPromotions.run();
  }
}

// Exemplo de uso:
(async () => {
  console.log('--- Verificando Estoque ---');
  await StockController.CheckStock();

  console.log('--- Enviando Promoções ---');
  await StockController.SendPromotions();
})();
