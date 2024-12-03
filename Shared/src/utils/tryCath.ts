export default async function executeWithTryCatch<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    console.error('Error occurred:', error);
    return null; 
  }
}