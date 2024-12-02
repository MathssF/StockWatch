function generateCombinations(arrayB) {
  const results: number[][] = [];
  const current = [...arrayB];

  for (let col = 1; col < arrayB.length; col++) {
    for (let i = 1; i <= arrayB[col]; i++) {
      current[col] = i;
      results.push(
        current.map((value) => (value === 1 ? 0 : value))
      )
    }
    current[col] = 1;
  }

  return results;
}

export default function mapToProcessedMatrix(arrayA, arrayB) {
  const combinations = generateCombinations(arrayB);

  return arrayA.map((id, index) => ({
    id,
    matrix: combinations[index % combinations.length],
  }));
}