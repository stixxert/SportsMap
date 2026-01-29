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

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

export function interpolate(value: number, start: number, end: number) {
  return start + (end - start) * value;
}

export type DataArray<T = number> = { [key: number]: { [key: number]: T } };
export class Sparse2DArray<T = number> {
  data: DataArray<T>;
  constructor(array?: DataArray<T>) {
    if (!array) this.data = {};
    else this.data = array;
  }

  load(array: { x: number; y: number; data: T }[]) {
    for (const item of array) {
      const { x, y, data } = item;
      this.set(x, y, data);
    }

    return this;
  }

  toList(): { x: number; y: number; data: T }[] {
    const indexKeys = Object.keys(this.getObject()).map((key) =>
      parseInt(key, 10),
    );

    const listData: { x: number; y: number; data: T }[] = [];

    for (const row of indexKeys) {
      const _row = this.getObject()[row];

      if (!_row) continue;

      const rowKeys = Object.keys(_row).map((key) => parseInt(key, 10));

      for (const col of rowKeys) {
        const val = _row[col];

        if (!val) continue;

        listData.push({ x: row, y: col, data: val });
      }
    }

    return listData;
  }

  getObject() {
    return this.data;
  }

  hasRow(row: number) {
    return Boolean(this.data[row]);
  }

  set(row: number, col: number, value: T) {
    if (!this.data[row]) this.data[row] = {};

    this.data[row][col] = value;
  }

  get(row: number, col: number) {
    if (!this.data[row]) return undefined;

    return this.data[row][col] || undefined;
  }
}
