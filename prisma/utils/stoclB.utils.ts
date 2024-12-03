export default function generateArrayFinal(
    stockMatrix: { id: number; matrix: number[] }[],
    color: number[], size: number[], year: number[], materials: number[], styles: number[]
  ) {
  const finalStock = stockMatrix.map((item) => {
    const { id, matrix } = item;
    
    const newMatrix: number[] = [];
    
    matrix.forEach((value, index) => {
      if (value !== 0) {
        switch (index) {
          case 0:
            newMatrix.push(color[value - 1]);
            break;
          case 1:
            newMatrix.push(size[value - 1]);
            break;
          case 2:
            newMatrix.push(year[value - 1]);
            break;
          case 3:
            newMatrix.push(materials[value - 1]);
            break;
          case 4:
            newMatrix.push(styles[value - 1]);
            break;
        }
      }
    });

    return {
      id,
      matrix: newMatrix
    };
  });

  return finalStock;
}