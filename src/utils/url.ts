export function assembleUrl(
  baseUrlPath: string,
  params: Record<string, string | number | boolean>,
): string {
  const url = new URL(baseUrlPath);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });
  return url.toString();
}
