const productsTable = [
    { id: 1, name: 'Bermuda', price: 80, 
      description: 'Bermuda de boa qualidade, ideal para o seu estilo e conforto.', 
      details: [true, true, false, true, true],
      // details: [1, 2, 4, 5],
      arrays: [
        [101, 102],
        [201, 202, 203, 204],
        [401, 402],
        [501, 502]
      ]
    },
    { id: 2, name: 'Bota', price: 60, 
      description: 'Bota de boa qualidade, ideal para o seu estilo e conforto.', 
      details: [true, true, true, true, true],
      // details: [1, 2, 3, 4, 5],
      arrays: [
        [101, 102],
        [201, 202, 203, 204],
        [301, 302],
        [401, 402],
        [501, 502]
      ]
    },
    { id: 3, name: 'Calça', price: 30, 
      description: 'Calça de boa qualidade, ideal para o seu estilo e conforto.', 
      details: [true, true, false, true, false],
      // details: [1, 2, 4],
      arrays: [
        [101, 102],
        [201, 202, 203, 204],
        [401, 402],
      ]
    },
    { id: 4, name: 'Calça Militar', price: 70, 
      description: 'Calça Militar de boa qualidade, ideal para o seu estilo e conforto.', 
      details: [false, true, true, false, false],
      // details: [2, 3],
      arrays: [
        [201, 202, 203, 204],
        [301, 302]
      ]
    },
    { id: 5, name: 'Calça Social', price: 80, 
      description: 'Calça Social de boa qualidade, ideal para o seu estilo e conforto.', 
      details: [false, true, false, true, false],
      // details: [2, 4],
      arrays: [
        [201, 202, 203, 204],
        [401, 402]
      ]
    },
]
// Dev: Função apenas para teste
// Caso não precise mais simplificar, descomente as coisas abaixo, e comente só o ']' e o 'const productTable2 = ['
// const productTable2 = [
//     { id: 6, name: 'Camisa Estampada', price: 130, 
//       description: 'Camisa Estampada de boa qualidade, ideal para o seu estilo e conforto.', 
//       details: [1, 2, 4, 5] 
//     },
//     { id: 7, name: 'Camisa Larga', price: 90, 
//       description: 'Camisa Larga de boa qualidade, ideal para o seu estilo e conforto.', 
//       details: [1, 2, 4] 
//     },
//     { id: 8, name: 'Camisa Longa', price: 100, 
//       description: 'Camisa Longa de boa qualidade, ideal para o seu estilo e conforto.', 
//       details: [1, 2, 4] 
//     },
//     { id: 9, name: 'Camisa Militar', price: 50, 
//       description: 'Camisa Militar de boa qualidade, ideal para o seu estilo e conforto.', 
//       details: [2, 3] 
//     },
//     { id: 10, name: 'Camisa Polo', price: 60, 
//       description: 'Camisa Polo de boa qualidade, ideal para o seu estilo e conforto.', 
//       details: [1, 2, 4] 
//     },
//     { id: 11, name: 'Camisa Social', price: 110, 
//       description: 'Camisa Social de boa qualidade, ideal para o seu estilo e conforto.', 
//       details: [1, 2, 4] 
//     },
//     { id: 12, name: 'Colar', price: 80, 
//       description: 'Colar de boa qualidade, ideal para o seu estilo e conforto.', 
//       details: [4, 5] 
//     },
//     { id: 13, name: 'Corrente', price: 120, 
//       description: 'Corrente de boa qualidade, ideal para o seu estilo e conforto.', 
//       details: [4, 5] 
//     },
//     { id: 14, name: 'Jaqueta', price: 90, 
//       description: 'Jaqueta de boa qualidade, ideal para o seu estilo e conforto.', 
//       details: [1, 2, 3, 4, 5] 
//     },
//     { id: 15, name: 'Jaqueta Militar', price: 130, 
//       description: 'Jaqueta Militar de boa qualidade, ideal para o seu estilo e conforto.', 
//       details: [2, 3] 
//     },
//     { id: 16, name: 'Jaqueta de Couro', price: 120, 
//       description: 'Jaqueta de Couro de boa qualidade, ideal para o seu estilo e conforto.', 
//       details: [2, 3] 
//     },
//     { id: 17, name: 'Luvas', price: 30, 
//       description: 'Luvas de boa qualidade, ideal para o seu estilo e conforto.', 
//       details: [1, 2, 4, 5] 
//     },
//     { id: 18, name: 'Meias', price: 80, 
//       description: 'Meias de boa qualidade, ideal para o seu estilo e conforto.', 
//       details: [1, 4] 
//     },
//     { id: 19, name: 'Moleton', price: 80, 
//       description: 'Moleton de boa qualidade, ideal para o seu estilo e conforto.', 
//       details: [1, 2, 4] 
//     },
//     { id: 20, name: 'Máscara', price: 80, 
//       description: 'Máscara de boa qualidade, ideal para o seu estilo e conforto.', 
//       details: [1, 4, 5] 
//     },
//     { id: 21, name: 'Sapato', price: 60, 
//       description: 'Sapato de boa qualidade, ideal para o seu estilo e conforto.', 
//       details: [1, 2, 3, 4, 5] 
//     },
//     { id: 22, name: 'Touca', price: 50, 
//       description: 'Touca de boa qualidade, ideal para o seu estilo e conforto.', 
//       details: [1, 4, 5] 
//     },
//     { id: 23, name: 'Tênis', price: 30, 
//       description: 'Tênis de boa qualidade, ideal para o seu estilo e conforto.', 
//       details: [1, 2, 3, 4, 5] 
//     }
//   ]
  

export default productsTable;