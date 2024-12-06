type TypeArray = number[]; // Representa qualquer um dos arrays de dados como color, size, year, etc.
type Types = boolean[];

export default function generateArrayFinal(
  stockMatrix: { id: number; matrix: number[] }[],
  color: number[], size: number[], year: number[], materials: number[], styles: number[],
  types: Types
) {
  const arraysLists = [color, size, year, materials, styles];
  const finalStock: { id: number; matrix: number[] }[] = [];

  stockMatrix.forEach((item) => {
    const { id, matrix } = item;

    const newMatrix: number[] = [];
    let arrayIndex = 0;

    // Filtra os arrays de acordo com o tipo ativo em 'types'
    const activeArrays = types
      .map((isActive, index) => (isActive ? arraysLists[index] : []))
      .filter((array) => array.length > 0); // Remove arrays vazios

    const generateCombinations = (
      combinations: number[][],
      current: number[] = [],
      depth: number = 0
    ): void => {
      if (depth === combinations.length) {
        finalStock.push({ id, matrix: current }); // Usa o id original de stockMatrix
        return;
      }

      for (let item of combinations[depth]) {
        generateCombinations(combinations, [...current, item], depth + 1);
      }
    };

    // Cria as combinações com os arrays filtrados
    generateCombinations(activeArrays);

    return;
  });

  return finalStock;
}
