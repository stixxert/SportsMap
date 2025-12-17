export function fetchByPagination(query: string, data: unknown[]) {
  const urlObj = new URL(query);

  const queryParams = new URLSearchParams(urlObj.search);

  const kvs: { [key: string]: string } = {};

  queryParams.forEach((value, key) => {
    kvs[key] = value;
  });

  const { per_page, page } = kvs;

  const num_per_page = per_page ? Number(per_page) : 30;
  const num_page = page ? Number(page) : 1;

  const totalItems = data.length;

  const startIndex = (num_page - 1) * num_per_page;
  const endIndex = Math.min(startIndex + num_per_page, totalItems);

  if (startIndex >= endIndex) {
    return [];
  }

  return data.slice(startIndex, endIndex);
}
