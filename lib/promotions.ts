const DISMISSED_KEY = 'bts_dismissed_promos';

export function isDismissed(variantId: string): boolean {
  if (typeof window === 'undefined') return false;
  const dismissed = JSON.parse(sessionStorage.getItem(DISMISSED_KEY) || '[]') as string[];
  return dismissed.includes(variantId);
}

export function dismiss(variantId: string): void {
  const dismissed = JSON.parse(sessionStorage.getItem(DISMISSED_KEY) || '[]') as string[];
  if (!dismissed.includes(variantId)) {
    sessionStorage.setItem(DISMISSED_KEY, JSON.stringify([...dismissed, variantId]));
  }
}
