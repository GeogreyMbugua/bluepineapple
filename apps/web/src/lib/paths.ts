const PUBLIC_PREFIX = process.env.NODE_ENV === 'production' ? '/bluepineapple' : '';

export function publicPath(path: string): string {
  return `${PUBLIC_PREFIX}${path}`;
}