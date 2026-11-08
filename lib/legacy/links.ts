export type LegacyReference = {
  kind: 'local' | 'external' | 'reference' | 'invalid'
  classification: 'self-source' | 'implemented-v2' | 'unresolved-legacy-feature' | 'external-reference' | 'unknown'
  original: string
  href?: string
  reason: string
  ownerApproval: boolean
  scopeChanged?: boolean
}
export function classifyLegacyLink(href: string, sourcePath: string, published: readonly string[], additional: readonly string[] = []): LegacyReference {
  try {
    const url = new URL(href, `https://www.kalkulatorharga.com${sourcePath}`)
    const original = url.href
    if (!['http:', 'https:'].includes(url.protocol)) return {kind:'invalid',classification:'unknown',original:href,reason:'Skema tautan tidak didukung.',ownerApproval:true}
    if (!['kalkulatorharga.com','www.kalkulatorharga.com'].includes(url.hostname)) return {kind:'external',classification:'external-reference',original,href:original,reason:'Sumber di domain lain; tidak ikut berpindah bersama domain situs.',ownerApproval:false}
    const reference = (classification: LegacyReference['classification'], reason: string): LegacyReference => ({kind:'reference',classification,original,reason,ownerApproval:true})
    if (url.port) return reference('unknown','Port atau layanan khusus legacy belum diverifikasi pada v2.')
    if (url.pathname === sourcePath && !url.search && !url.hash) return reference('self-source','Alamat asal akan menjadi halaman ini setelah cutover, bukan arsip project lama.')
    if (url.search) return reference('unresolved-legacy-feature','Parameter pilihan atau preset lama belum didukung v2; path dasar 200 bukan bukti kesetaraan.')
    if (url.hash) return reference('unresolved-legacy-feature','Fragmen sumber lama belum dipetakan ke heading v2.')
    if (url.pathname === '/') return reference('unresolved-legacy-feature','Beranda lama memuat preset kalkulator; direktori v2 bukan fitur yang sama.')
    if (!published.includes(url.pathname)) return reference('unresolved-legacy-feature','Fitur atau path legacy ini belum tersedia/setara pada v2.')
    return {kind:'local',classification:'implemented-v2',original,href:url.pathname,reason:'Route v2 terbit; tidak bergantung hostname legacy.',ownerApproval:false,scopeChanged:url.pathname.startsWith('/kalkulator/') || additional.includes(url.pathname)}
  } catch { return {kind:'invalid',classification:'unknown',original:href,reason:'Alamat tidak valid.',ownerApproval:true} }
}
