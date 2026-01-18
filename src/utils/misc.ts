export function createLookupTable(
  fn: (value: number) => number,
  min: number,
  max: number,
) {
  const lookup = new Map<number, number>();

  for (let i = min; i <= max; i++) {
    lookup.set(i, fn(i));
  }

  return function (value: number) {
    const _value = Math.min(max, Math.max(min, value));

    return lookup.get(_value) || 0;
  };
}

export function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
export function randomFromArray(array: unknown[]) {
  return array[Math.floor(Math.random() * array.length)];
}
