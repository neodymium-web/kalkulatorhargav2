export const categories = {
  bisnis: { name: 'Bisnis', hub: '/bisnis' },
  marketplace: { name: 'Marketplace', hub: null },
  keuangan: { name: 'Keuangan', hub: null },
  pajak: { name: 'Pajak', hub: null },
  'media-sosial': { name: 'Media Sosial', hub: null },
  'sehari-hari': { name: 'Sehari-hari', hub: null },
} as const

export type CategoryId = keyof typeof categories
