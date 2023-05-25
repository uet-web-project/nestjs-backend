function toCamelCase(str: string): string {
  if (typeof str !== 'string') {
    throw new Error('Input must be a string');
  }

  const words: string[] = str.trim().split(/\s+/);
  const camelCaseWords: string[] = words.map((word: string, index: number) => {
    if (index === 0) {
      return word.toLowerCase();
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });

  return camelCaseWords.join('');
}

export default toCamelCase;
