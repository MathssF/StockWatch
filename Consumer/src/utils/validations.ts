// Tipos de dados esperados
interface Product {
  stockId: number;
  quantityNow: number;
  quantityNeeded: number;
}

interface ParsedMessage {
  notification: string;
  products: Product[];
}

// Função para validar o formato da mensagem
export const validateMessage = (message: string): ParsedMessage | null => {
  try {
    const parsedMessage = JSON.parse(message); // Tentativa de parse da string

    // Verifica se a estrutura da mensagem está correta
    if (
      parsedMessage &&
      typeof parsedMessage === 'object' &&
      typeof parsedMessage.notification === 'string' &&
      Array.isArray(parsedMessage.products) &&
      parsedMessage.products.every(
        (product: any) =>
          typeof product.stockId === 'number' &&
          typeof product.quantityNow === 'number' &&
          typeof product.quantityNeeded === 'number'
      )
    ) {
      return parsedMessage; // Se estiver no formato correto, retorna a mensagem parseada
    }

    return null; // Se não estiver no formato correto, retorna null
  } catch (error) {
    return null; // Se ocorrer um erro durante o parsing, retorna null
  }
};
