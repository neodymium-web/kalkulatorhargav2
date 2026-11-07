export const categories = {
  bisnis: { name: 'Bisnis', hub: '/bisnis' },
  marketplace: { name: 'Marketplace', hub: '/marketplace' },
  keuangan: { name: 'Keuangan', hub: '/keuangan' },
  pajak: { name: 'Pajak', hub: null },
  'media-sosial': { name: 'Media Sosial', hub: null },
  'sehari-hari': { name: 'Sehari-hari', hub: null },
} as const

export type CategoryId = keyof typeof categories
