import type { Page } from '@playwright/test'
export const scenes: readonly (readonly [string, string])[]
export function prepare(page: Page, name: string): Promise<void>
