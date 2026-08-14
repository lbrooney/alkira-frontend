import { safeInternalPath } from '#/lib/safe-redirect'

export interface AuthSearch {
  redirect?: string
}

export function validateAuthSearch(
  search: Record<string, unknown>,
): AuthSearch {
  const redirect = safeInternalPath(search.redirect)
  return redirect ? { redirect } : {}
}
