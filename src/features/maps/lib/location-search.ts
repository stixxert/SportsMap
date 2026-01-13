"use client";

import { LatLngTuple } from "leaflet";

/* https://nominatim.org/release-docs/latest/api/Search/ */
type LocationResult = LatLngTuple[];

type SearchResult = LocationResult | null;

const apiOptions = {
  format: "json",
  limit: "1",
  addressdetails: "0",
};

/* returns location or null, if no location found, or error encountered. */
export async function fetchLocation(
  city?: string,
  county?: string,
  country?: string,
): Promise<SearchResult> {
  if (!process.env.NEXT_PUBLIC_LOCATION_SEARCH_API) {
    return Promise.resolve(null);
  }

  if (!city && !county && !country) return Promise.resolve(null);

  const searchParams = new URLSearchParams({
    ...apiOptions,
    ...(city ? { city } : {}),
    ...(county ? { county } : {}),
    ...(country ? { country } : {}),
  });

  return fetch(
    `${process.env.NEXT_PUBLIC_LOCATION_SEARCH_API}?${searchParams.toString()}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  )
    .then((response) => {
      if (!response.ok) return null;

      return response.json();
    })
    .then((json) => {
      if (!Array.isArray(json) || json.length === 0) return null;

      const _result = json[0].boundingbox;

      if (!_result || !Array.isArray(_result) || _result.length < 4)
        return null;

      const corner1 = [Number(_result[0]), Number(_result[2])];

      const corner2 = [Number(_result[1]), Number(_result[3])];

      return [corner1, corner2] as SearchResult;
    })
    .catch(() => null);
}
