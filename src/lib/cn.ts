type ClassValue = string | number | bigint | boolean | null | undefined

export function cn(...values: ClassValue[]): string {
  return values
    .filter(
      (value): value is string => typeof value === 'string' && value !== '',
    )
    .join(' ')
}
