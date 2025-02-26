const detailTypes = [
  { id: 1, name: 'Cor' },
  { id: 2, name: 'Tamanho' },
  { id: 3, name: 'Ano' },
  { id: 4, name: 'Material' },
  { id: 5, name: 'Tema' },
];

const details = [
  { type: 1, id: 101, value: 'Amarelo' },
  { type: 1, id: 102, value: 'Azul' },
  { type: 1, id: 103, value: 'Bege' },
  { type: 1, id: 104, value: 'Branco' },
  { type: 1, id: 105, value: 'Caramelo' },
  { type: 1, id: 106, value: 'Carmesim' },
  { type: 1, id: 107, value: 'Carmim' },
  { type: 1, id: 108, value: 'Castanho' },
  { type: 1, id: 109, value: 'Cinza' },
  { type: 1, id: 110, value: 'Dourado' },
  { type: 1, id: 111, value: 'Esmeralda' },
  { type: 1, id: 112, value: 'Laranja' },
  { type: 1, id: 113, value: 'Lilás' },
  { type: 1, id: 114, value: 'Prateado' },
  { type: 1, id: 115, value: 'Preto' },
  { type: 1, id: 116, value: 'Rosa' },
  { type: 1, id: 117, value: 'Roxo' },
  { type: 1, id: 118, value: 'Verde' },
  { type: 1, id: 119, value: 'Vermelho' },

  { type: 2, id: 201, value: 'P' },
  { type: 2, id: 202, value: 'M' },
  { type: 2, id: 203, value: 'G' },
  { type: 2, id: 204, value: 'GG' },

  { type: 3, id: 301, value: '2000' },
  { type: 3, id: 302, value: '2010' },
  { type: 3, id: 303, value: '2020' },
  { type: 3, id: 304, value: '2021' },
  { type: 3, id: 305, value: '2022' },
  { type: 3, id: 306, value: '2023' },
  { type: 3, id: 307, value: '2024' },

  { type: 4, id: 401, value: 'Algodão' },
  { type: 4, id: 402, value: 'Tecido' },
  { type: 4, id: 403, value: 'Seda' },
  { type: 4, id: 404, value: 'Poliester' },
  // { type: 4, id: 411, value: 'Aço' },
  // { type: 4, id: 412, value: 'Ferro' },
  // { type: 4, id: 413, value: 'Madeira' },
  // { type: 4, id: 414, value: 'Ouro' },
  // { type: 4, id: 415, value: 'Plástico' },
  // { type: 4, id: 416, value: 'Prata' },

  { type: 5, id: 501, value: 'Básico' },
  { type: 5, id: 502, value: 'Fofo' },
  { type: 5, id: 503, value: 'Nerd' },
  { type: 5, id: 504, value: 'Otaku' },
  { type: 5, id: 505, value: 'Rock' },
  { type: 5, id: 506, value: 'Praia' }
];

const color = [
  101, 102, 103, 104, 105,
  106, 107, 108, 109, 110,
  111, 112, 113, 114, 115,
  116, 117, 118, 119,
]
const colorMatrix = [
  { type: 1, id: 101, value: 'Amarelo' },
  { type: 1, id: 102, value: 'Azul' },
  { type: 1, id: 103, value: 'Bege' },
  { type: 1, id: 104, value: 'Branco' },
  { type: 1, id: 105, value: 'Caramelo' },

  { type: 1, id: 106, value: 'Carmesim' },
  { type: 1, id: 107, value: 'Carmim' },
  { type: 1, id: 108, value: 'Castanho' },
  { type: 1, id: 109, value: 'Cinza' },
  { type: 1, id: 110, value: 'Dourado' },
  { type: 1, id: 111, value: 'Esmeralda' },
  { type: 1, id: 112, value: 'Laranja' },
  { type: 1, id: 113, value: 'Lilás' },
  { type: 1, id: 114, value: 'Prateado' },
  { type: 1, id: 115, value: 'Preto' },
  { type: 1, id: 116, value: 'Rosa' },
  { type: 1, id: 117, value: 'Roxo' },
  { type: 1, id: 118, value: 'Verde' },
  { type: 1, id: 119, value: 'Vermelho' },
]

const size = [ 201, 202, 203, 204]
const sizeMatrix = [
  { type: 2, id: 201, value: 'P' },
  { type: 2, id: 202, value: 'M' },
  { type: 2, id: 203, value: 'G' },
  { type: 2, id: 204, value: 'GG' },
]

const year = [
  301, 302, 303,
  304, 305, 306, 307
]
const yearMatrix = [
  { type: 3, id: 301, value: '2000' },
  { type: 3, id: 302, value: '2010' },
  { type: 3, id: 303, value: '2020' },
  { type: 3, id: 304, value: '2021' },
  { type: 3, id: 305, value: '2022' },
  { type: 3, id: 306, value: '2023' },
  { type: 3, id: 307, value: '2024' },
]

const materials = [401, 402, 403, 404]
const materialsFull = [401, 402, 403, 404, 411, 412, 413, 414, 415, 416]
const materialsMatrix = [
  { type: 4, id: 401, value: 'Algodão' },
  { type: 4, id: 402, value: 'Tecido' },
  { type: 4, id: 403, value: 'Seda' },
  { type: 4, id: 404, value: 'Poliester' },
  // { type: 4, id: 411, value: 'Aço' },
  // { type: 4, id: 412, value: 'Ferro' },
  // { type: 4, id: 413, value: 'Madeira' },
  // { type: 4, id: 414, value: 'Ouro' },
  // { type: 4, id: 415, value: 'Plástico' },
  // { type: 4, id: 416, value: 'Prata' },
]

const style = [502, 503, 504, 505, 506]
const styleFull = [501, 502, 503, 504, 505, 506]
const styleMatrix = [
  { type: 5, id: 501, value: 'Básico' },
  { type: 5, id: 502, value: 'Fofo' },
  { type: 5, id: 503, value: 'Nerd' },
  { type: 5, id: 504, value: 'Otaku' },
  { type: 5, id: 505, value: 'Rock' },
  { type: 5, id: 506, value: 'Praia' }
]

export {
  detailTypes, details,
  color, size, year, materials, style,
  colorMatrix, sizeMatrix, yearMatrix, materialsMatrix, styleMatrix,
  materialsFull, styleFull
}