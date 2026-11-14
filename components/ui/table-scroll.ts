import type { KeyboardEvent } from 'react'

export function scrollTableByKey(event: KeyboardEvent<HTMLDivElement>) {
  const region = event.currentTarget
  if (event.target !== region || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
  if (region.scrollWidth <= region.clientWidth || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return
  // WebKit does not consistently scroll a focused overflow region with arrow keys.
  event.preventDefault()
  region.scrollLeft += event.key === 'ArrowRight' ? 48 : -48
}
