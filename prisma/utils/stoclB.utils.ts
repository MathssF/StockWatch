function generateArrayD(arrayC: { id: number; matrix: number[] }[], color: number[], size: number[], year: number[], materials: number[], styles: number[]) {
  const arrayD = arrayC.map((item) => {
    const { id, matrix } = item;
    
    // Criar um novo array para armazenar os valores filtrados
    const newMatrix = [];
    
    // Iterar sobre os valores de matrix para incluir apenas os que não são 0
    matrix.forEach((value, index) => {
      if (value !== 0) {
        switch (index) {
          case 0:
            newMatrix.push(color[value - 1]); // -1 para ajustar o índice
            break;
          case 1:
            newMatrix.push(size[value - 1]); // -1 para ajustar o índice
            break;
          case 2:
            newMatrix.push(year[value - 1]); // -1 para ajustar o índice
            break;
          case 3:
            newMatrix.push(materials[value - 1]); // -1 para ajustar o índice
            break;
          case 4:
            newMatrix.push(styles[value - 1]); // -1 para ajustar o índice
            break;
        }
      }
    });

    // Retornar o objeto com o id e a nova matriz filtrada
    return {
      id,
      matrix: newMatrix
    };
  });

  return arrayD;
}

// Exemplo de uso
const arrayC = [
  { id: 9, matrix: [0, 1, 1, 0, 0] },
  { id: 10, matrix: [0, 2, 1, 0, 0] },
  { id: 11, matrix: [0, 3, 1, 0, 0] },
  { id: 12, matrix: [0, 4, 1, 0, 0] },
  { id: 13, matrix: [0, 1, 2, 0, 0] },
  { id: 14, matrix: [0, 2, 2, 0, 0] },
  { id: 15, matrix: [0, 3, 2, 0, 0] },
  { id: 16, matrix: [0, 4, 2, 0, 0] },
  { id: 17, matrix: [0, 1, 3, 0, 0] },
  { id: 18, matrix: [0, 2, 3, 0, 0] },
  { id: 19, matrix: [0, 3, 3, 0, 0] },
  { id: 20, matrix: [0, 4, 3, 0, 0] }
];

const color = [101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119];
const size = [201, 202, 203, 204];
const year = [301, 302, 303, 304, 305, 306, 307];
const materials = [401, 402, 403, 404];
const styles = [501, 502, 503, 504, 505, 506];

const arrayD = generateArrayD(arrayC, color, size, year, materials, styles);
console.log(arrayD);
