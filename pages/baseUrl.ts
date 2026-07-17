export function baseUrl(): string {
  const url = process.env.DIDAXIS_URL;
  if (!url) throw new Error('DIDAXIS_URL is not set in .env');
  return url.replace(/\/$/, '');
}