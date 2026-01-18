import { SportType } from "@/strava-api";

const ACTIVITY_TYPES = Object.keys(SportType);

const SPAN_DELIMITER = "-";

export type CompressedTypeSpan = string;

function convTypeToIndex(type: SportType) {
  return ACTIVITY_TYPES.findIndex((value) => value === type.toString());
}

function convIndexToType(index: string | number) {
  const _index = typeof index === "number" ? index : Number(index);

  if (_index < 0 && _index >= ACTIVITY_TYPES.length) {
    return undefined;
  }

  return ACTIVITY_TYPES[_index];
}

export function compressSpan(
  span: SportType[] | SportType,
): CompressedTypeSpan {
  if (!Array.isArray(span)) return convTypeToIndex(span).toString();

  return (
    span
      /* sort to ensure spans with equal types will actually match in compressed form */
      .sort()
      .map((type) => convTypeToIndex(type))
      .join(SPAN_DELIMITER)
  );
}

export function uncompressSpan(
  compressedSpan: CompressedTypeSpan,
): SportType | SportType[] | undefined {
  const results = compressedSpan
    .split(SPAN_DELIMITER)
    .map((value) => convIndexToType(value))
    /* filter away undefined index types*/
    .filter((value) => value !== undefined);

  if (results.length === 0) return undefined;

  if (results.length === 1) return results[0] as SportType;

  return results as SportType[];
}
