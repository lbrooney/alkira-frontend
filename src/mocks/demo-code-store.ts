import { Store } from '@tanstack/store'
import { useStore } from '@tanstack/react-store'

export const demoCodeStore = new Store<string | null>(null)

export function setDemoCode(code: string | null) {
  demoCodeStore.setState(() => code)
}

export function useDemoCode() {
  return useStore(demoCodeStore)
}
