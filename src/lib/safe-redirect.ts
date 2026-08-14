export function safeInternalPath(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  if (!value.startsWith('/')) return undefined
  if (value.startsWith('//')) return undefined
  if (value.includes('\\')) return undefined
  return value
}
