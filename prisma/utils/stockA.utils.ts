function generateCombinations(arrayB) {
  const results: number[][] = [];
  const current = [...arrayB];

  for (let col = 0; col < arrayB.length; col++) {
    for (let i = 1; i <= arrayB[col]; i++) {
    // for (let i = arrayB[col]; i >= 1; i++) {
      current[col] = i;
      results.push(
        // current.map((value) => (value === 1 ? 0 : value))
        [...current]
      )
    }
    current[col] = 1;
  }

  return results;
  // return results.map((combination) =>
  //   combination.map((value) => (value === 1 ? 0 : value))
  // );
}

export default function mapToProcessedMatrix(arrayA, arrayB) {
  const combinations = generateCombinations(arrayB);

  return arrayA.map((id, index) => ({
    id,
    matrix: combinations[index % combinations.length],
  }));
}