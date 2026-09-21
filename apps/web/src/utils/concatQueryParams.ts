export default function concatQueryParams(
  params: Record<string, string> | null,
) {
  const queryParams: string = "";

  if (params) {
    for (const key of params.keys) queryParams.concat(`${key}=${params[key]}`);
  }
  return queryParams;
}
