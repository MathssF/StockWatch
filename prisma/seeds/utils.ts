export default function generateCombinations(array) {
  const result = [];
  const temp = [...array];
  
  function backtrack(index) {
    if (index >= array.length) {
      result.push([...temp]);
        return;
  }
      for (let value = 1; value <= array[index]; value++) {
        temp[index] = value;
        backtrack(index + 1);
        temp.fill(1, index + 1);
      }
    }
  
  backtrack(0);
  return result;
}

// export default generateCombinations();