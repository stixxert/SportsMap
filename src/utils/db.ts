/* min/max lower/upper bound is inferred from https://w3c.github.io/IndexedDB/#key-construct */
export const MAX_UPPER_BOUND = [];

export const MIN_LOWER_BOUND = {
  string: "",
  number: -Infinity,
  date: new Date(-8640000000000000),
};

const defaultBoundsOptions = {
  lowerOpen: false,
  upperOpen: false,
};

export function constructKeyBound<T extends unknown[] | unknown>(
  bounds: { start?: T; end?: T },
  options?: Partial<typeof defaultBoundsOptions>,
): IDBKeyRange | undefined {
  const _options = Object.assign({}, defaultBoundsOptions, options);

  const { lowerOpen, upperOpen } = _options;

  if (bounds.start) {
    // start and end
    if (bounds.end) {
      return IDBKeyRange.bound(bounds.start, bounds.end, lowerOpen, upperOpen);
    }

    // start, but no end
    return IDBKeyRange.lowerBound(bounds.start, lowerOpen);
  }

  // end but no start
  if (bounds.end) {
    return IDBKeyRange.upperBound(bounds.end, upperOpen);
  }

  // default case
  return undefined;
}

export function constructDiscreteKeyBound<T extends unknown[] | unknown>(
  discreteKeys: T,
): IDBKeyRange[] {
  if (Array.isArray(discreteKeys)) {
    return discreteKeys.map((key) => IDBKeyRange.only(key));
  }

  return [IDBKeyRange.only(discreteKeys as T)];
}

export function constructDiscreteFirstKeyFollowingContinuous<
  T extends unknown[] | unknown,
  R extends unknown[] | unknown,
>(
  discreteFirstKey: T,
  continuousBounds: { start?: R; end?: R },
): IDBKeyRange[] | undefined {
  if (Array.isArray(discreteFirstKey)) {
    const ranges = discreteFirstKey
      .map((firstKey) =>
        constructKeyBound({
          start: [firstKey, ...(continuousBounds.start as unknown[])],
          end: [firstKey, ...(continuousBounds.end as unknown[])],
        }),
      )
      .filter((search) => search !== undefined);

    return ranges ? ranges : undefined;
  }

  const keyBound = constructKeyBound({
    start: [discreteFirstKey, ...(continuousBounds.start as unknown[])],
    end: [discreteFirstKey, ...(continuousBounds.end as unknown[])],
  });
  return keyBound ? [keyBound] : undefined;
}
