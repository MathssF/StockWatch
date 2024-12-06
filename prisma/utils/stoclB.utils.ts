// type TypeArray = number[]; // Representa qualquer um dos arrays de dados como color, size, year, etc.
// type Types = boolean[];

export default function generateArrayFinal(
    stockMatrix: { id: number; matrix: number[] }[],
    color: number[], size: number[], year: number[], materials: number[], styles: number[],
    types: boolean[],
  ) {

  const arraysLists = [color, size, year, materials, styles];
  const finalStock = stockMatrix.map((item) => {
    const { id, matrix } = item;
    
    const newMatrix: number[] = [];
    let index = 0;

    const generateCombinations = (
      combinations: number[][],
      current: number[] = [],
      depth: number = 0
    ): void => {
      if (depth === combinations.length) {
        finalStock.push({ id: id++, matrix: current });
        return;
      }
  
      for (let item of combinations[depth]) {
        generateCombinations(combinations, [...current, item], depth + 1);
      }
    };

    // matrix.forEach((value) => {
    //   for (index = 0; index < types.length; index++) {
    //     if (types[index] === true) {
    //       switch (index) {
    //         case 0:
    //           newMatrix.push(color[value - 1]);
    //           break;
    //         case 1:
    //           newMatrix.push(size[value - 1]);
    //           break;
    //         case 2:
    //           newMatrix.push(year[value - 1]);
    //           break;
    //         case 3:
    //           newMatrix.push(materials[value - 1]);
    //           break;
    //         case 4:
    //           newMatrix.push(styles[value - 1]);
    //           break;
    //         default:
    //           break;
    //       }
    //       break;
    //     }
    //   }
    // });

    return {
      id,
      matrix: newMatrix
    };
  });

  return finalStock;
}