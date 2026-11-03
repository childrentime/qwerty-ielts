// Keep the upstream call sites compatible without sending events to third parties.
export const trackPromotionEvent = (_event: string, _properties: Record<string, string>) => undefined
