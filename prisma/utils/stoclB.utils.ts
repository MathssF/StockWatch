export default function generateArrayFinal(
    stockMatrix: { id: number; matrix: number[] }[],
    color: number[], size: number[], year: number[], materials: number[], styles: number[],
    types: boolean[],
  ) {
  const finalStock = stockMatrix.map((item) => {
    const { id, matrix } = item;
    
    let indexT = 0;
    const newMatrix: number[] = [];

    matrix.forEach((value) => {
      for(indexT = 0; indexT < types.length; indexT++) {
        if (types[indexT] === true) {
          switch (indexT) {
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
      }
      indexT = 0;
    })
    
    // matrix.forEach((value, index) => {
    //   if (value !== 0) {
    //     switch (index) {
    //       case 0:
    //         newMatrix.push(color[value - 1]);
    //         break;
    //       case 1:
    //         newMatrix.push(size[value - 1]);
    //         break;
    //       case 2:
    //         newMatrix.push(year[value - 1]);
    //         break;
    //       case 3:
    //         newMatrix.push(materials[value - 1]);
    //         break;
    //       case 4:
    //         newMatrix.push(styles[value - 1]);
    //         break;
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