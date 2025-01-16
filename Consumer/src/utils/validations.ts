interface Product {
  stockId: number;
  quantityNow: number;
  quantityNeeded: number;
}

interface ParsedMessage {
  notification: string;
  products: Product[];
}

export const validateMessage = (message: string): ParsedMessage | null => {
  try {
    
    const parsedMessage = JSON.parse(message);
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
      return parsedMessage;
    }

    return null;
  } catch (error) {
    return null;
  }
};
