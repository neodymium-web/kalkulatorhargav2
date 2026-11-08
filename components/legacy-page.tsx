import { createElement, Fragment, type ReactNode } from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Breadcrumb } from './breadcrumb'
import { legacyPages, legacyReference, type LegacyNode, type LegacyPage } from '../lib/legacy/registry'
import { pageMetadata } from '../lib/seo'
import layout from './ui/layout.module.css'
import styles from './legacy-page.module.css'

const allowed = new Set(['div','h1','h2','h3','h4','h5','h6','p','ul','ol','li','dl','dt','dd','table','caption','thead','tbody','tfoot','tr','th','td','a','strong','b','em','i','span','time','small','br','code','pre','details','summary','blockquote'])
function nodeText(node: LegacyNode): string { return typeof node === 'string' ? node : node.children.map(nodeText).join('') }
function headings(node: LegacyNode): { label: string; id: string }[] {
  const list: { label: string; id: string }[] = []
  function visit(n: LegacyNode) {
    if (typeof n === 'string') return
    if (['h2','h3'].includes(n.tag)) list.push({ label: nodeText(n), id: `legacy-section-${list.length + 1}` })
    n.children.forEach(visit)
  }
  visit(node); return list
}
function sourceContent(tree: LegacyNode, annotation: ReactNode, sourcePath: string): ReactNode {
  let heading = 0
  function render(node: LegacyNode, key: number): ReactNode {
    if (typeof node === 'string') return node
    const tag = allowed.has(node.tag) ? node.tag : 'div'
    const props: Record<string, unknown> = { key }
    if (['h2','h3'].includes(tag)) props.id = `legacy-section-${++heading}`
    if (tag === 'a') {
      const reference = legacyReference(node.attrs.href ?? '', sourcePath)
      const children = node.children.map(render)
      if (!reference.href) return <span key={key} className={styles.reference}>{children}<small data-legacy-annotation> (Referensi arsip nonklik: {reference.original}. {reference.reason} Alamat asal masih dapat disalin untuk memeriksa legacy sebelum cutover; setelah cutover perlu arsip terpisah yang disetujui.)</small></span>
      return <Fragment key={key}><a href={reference.href} rel="noreferrer">{children}</a>{reference.scopeChanged && <small data-legacy-annotation> (versi v2 dengan asumsi manual; bukan preset atau pencarian akun legacy)</small>}</Fragment>
    }
    if (tag === 'time') props.dateTime = node.attrs.datetime
    if (['td','th'].includes(tag)) {
      for (const [from,to] of [['colspan','colSpan'],['rowspan','rowSpan']]) if (/^[1-9]\d?$/.test(node.attrs[from] ?? '')) props[to] = Number(node.attrs[from])
      if (tag === 'th') props.scope = ['row','col','rowgroup','colgroup'].includes(node.attrs.scope ?? '') ? node.attrs.scope : 'col'
    }
    if (tag === 'ol' && /^\d+$/.test(node.attrs.start ?? '')) props.start = Number(node.attrs.start)
    if (tag === 'br') return createElement(tag, props)
    const element = createElement(tag, props, node.children.map(render))
    if (tag === 'h1') return <Fragment key={key}>{element}{annotation}</Fragment>
    if (tag !== 'table') return element
    const caption = node.children.find(n => typeof n !== 'string' && n.tag === 'caption')
    return <div className={styles.table} key={key} role="region" tabIndex={0} aria-label={caption ? nodeText(caption) : 'Tabel sumber legacy'}>{element}</div>
  }
  return render(tree, 0)
}
export function legacyMetadata(page: LegacyPage): Metadata {
  return { ...pageMetadata(page.h1, page.description ?? 'Arsip konten situs lama yang menunggu review pemilik.', page.path), title: { absolute: page.title } }
}
export function LegacyPageView({ page }: { page: LegacyPage }) {
  const toc = headings(page.tree)
  return <div className={`${layout.container} ${layout.page} ${styles.page}`}>
    <Breadcrumb category={page.path === '/blog' ? undefined : { name: 'Arsip catatan seller', path: '/blog' }} current={page.h1} />
    <article className={styles.content} aria-label="Teks terbitan legacy" data-legacy-source>{sourceContent(page.tree, <>
    <aside data-legacy-annotation className={styles.notice} aria-label="Status review arsip">
      <p><strong>Arsip situs lama · menunggu review pemilik</strong></p>
      <p>{page.reviewNotice}</p>
      <p><span>Alamat sumber historis: <code>{page.url}</code>. Alamat ini dapat disalin untuk memeriksa situs lama sebelum cutover; setelah domain dipindahkan, alamat yang sama bukan arsip permanen project legacy.</span> Teks diamati <time dateTime={page.observedAtUtc}>{page.observedAtUtc.slice(0,10)}</time>; tanggal pengamatan ini bukan tanggal publikasi atau verifikasi tarif. Tanggal terbit dan byline di bawah mengikuti sumber.</p>
    </aside>
    {toc.length >= 3 && <nav data-legacy-annotation className={styles.toc} aria-label="Daftar isi artikel"><ul>{toc.map(h => <li key={h.id}><a href={`#${h.id}`}>{h.label}</a></li>)}</ul></nav>}
    </>, page.path)}</article>
    <section className={styles.related} aria-labelledby="v2-tools"><h2 id="v2-tools">Alat v2 dengan asumsi yang dijelaskan</h2>
      <p>Alat berikut terpisah dari preset dan fitur situs lama. Biaya seller diisi manual; estimasi pendapatan kreator memakai asumsi pengguna.</p>
      <ul>{[['/marketplace','Kalkulator Marketplace'],['/kalkulator/tiktok','TikTok kreator'],['/kalkulator/tiktok-shop','TikTok Shop seller'],['/kalkulator/rata-rata-beli-saham','Rata-rata beli saham']].map(([href,label]) => <li key={href}><Link href={href} prefetch={false}>{label}</Link></li>)}</ul>
    </section>
    <nav className={styles.archive} aria-label="Arsip legacy yang tersedia"><h2>Arsip konten yang tersedia</h2><p>22 halaman diwarisi untuk review, termasuk 13 artikel. Status arsip ini bukan persetujuan peluncuran.</p><ul>{legacyPages.map(p => <li key={p.path}><Link href={p.path} prefetch={false} aria-current={p.path === page.path ? 'page' : undefined}>{p.h1}</Link></li>)}</ul></nav>
  </div>
}
