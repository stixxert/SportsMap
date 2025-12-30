type KeyBound<T> = {
  start?: T;
  end?: T;
};

export function constructKeyBound<T>(
  bounds: KeyBound<T>,
  lowerOpen?: boolean,
  upperOpen?: boolean,
): IDBKeyRange | undefined {
  if (bounds.start) {
    // start and end
    if (bounds.end) {
      return IDBKeyRange.bound(
        bounds.start,
        bounds.end,
        lowerOpen ? !lowerOpen : undefined,
        upperOpen ? !upperOpen : undefined,
      );
    }

    // start, but no end
    return IDBKeyRange.lowerBound(
      bounds.start,
      lowerOpen ? !lowerOpen : undefined,
    );
  }

  // end but no start
  if (bounds.end) {
    return IDBKeyRange.upperBound(
      bounds.end,
      upperOpen ? !lowerOpen : undefined,
    );
  }

  // default case
  return undefined;
}

export function constructDiscreteKeyBound<T>(
  discreteKeys: T | T[],
): IDBKeyRange[] {
  if (Array.isArray(discreteKeys)) {
    return discreteKeys.map((key) => IDBKeyRange.only(key));
  }

  return [IDBKeyRange.only(discreteKeys as T)];
}

type FunctionType = (...args: never[]) => unknown;

export function runOnceWrapper<T extends FunctionType>(func: T) {
  let isRunning = false;

  let promise: Promise<ReturnType<T>>;

  async function runOnce(...args: Parameters<T>) {
    if (isRunning) {
      return promise;
    }

    isRunning = true;

    promise = Promise.resolve(func(...args) as ReturnType<T>).then((r) => {
      isRunning = false;
      return r;
    });

    return promise;
  }

  return (...args: Parameters<T>) => runOnce(...args);
}

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
