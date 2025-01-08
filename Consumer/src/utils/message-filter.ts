// message-filter.ts
export class MessageQueue {
    private queue: string[] = [];
  
    // Adicionar mensagem à fila
    enqueue(message: string): void {
      this.queue.push(message);
    }
  
    // Retornar e remover a última mensagem da fila
    dequeueLast(): string | undefined {
      const lastMessage = this.queue.pop();
      this.clearQueue(); // Limpa as mensagens antigas
      return lastMessage;
    }
  
    // Limpa a fila
    private clearQueue(): void {
      this.queue.length = 0;
    }
  
    // Verificar se a fila está vazia
    isEmpty(): boolean {
      return this.queue.length === 0;
    }
  }
  
  // Instância única para reutilização
  export const messageQueue = new MessageQueue();
  