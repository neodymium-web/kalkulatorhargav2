'use client'

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { searchDirectory, type DirectoryEntry } from '../lib/directory'
import { Button, Input } from './ui/controls'
import styles from './directory.module.css'
import layout from './ui/layout.module.css'

const pageSize = 12

function ToolCard({ tool }: { tool: DirectoryEntry }) {
  return <Link className={styles.card} href={tool.path}>
    <span className={styles.category}>{tool.categories[0]}</span>
    <strong>{tool.name}</strong>
    <span>{tool.description}</span>
  </Link>
}

export function Directory({ tools, heading = 'Kalkulator tersedia' }: {
  tools: readonly DirectoryEntry[]
  heading?: string
}) {
  const titleId = useId()
  const [limit, setLimit] = useState(pageSize)
  const firstNewIndex = useRef<number>(null)
  const list = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const index = firstNewIndex.current
    if (index === null) return
    firstNewIndex.current = null
    list.current?.children.item(index)?.querySelector('a')?.focus()
  }, [limit])

  return <section aria-labelledby={titleId}>
    <h2 id={titleId}>{heading}</h2>
    {tools.length > 0 && <ul ref={list} className={styles.list} role="list">
      {tools.slice(0, limit).map(tool => <li key={tool.id}><ToolCard tool={tool} /></li>)}
    </ul>}
    {tools.length > limit && <Button className={styles.more} variant="secondary" onClick={() => {
      firstNewIndex.current = limit
      setLimit(limit + pageSize)
    }}>Muat lebih banyak</Button>}
  </section>
}

function relevance(tool: DirectoryEntry, query: string) {
  const normalize = (value: string) => value.toLocaleLowerCase('id-ID')
  if (normalize(tool.name) === query) return 0
  if (normalize(tool.name).includes(query) || tool.keywords.some(word => normalize(word).includes(query))) return 1
  return 2
}

export function DirectorySearch({ tools, hubs, children }: {
  tools: readonly DirectoryEntry[]
  hubs: readonly { name: string; path: string }[]
  children: ReactNode
}) {
  const [query, setQuery] = useState('')
  const input = useRef<HTMLInputElement>(null)
  const queryText = query.trim()
  const normalized = queryText.toLocaleLowerCase('id-ID')
  const matches = queryText ? searchDirectory(tools, queryText)
    .sort((a, b) => relevance(a, normalized) - relevance(b, normalized)) : tools.slice(0, pageSize)

  function clear() {
    setQuery('')
    input.current?.focus()
  }

  return <>
    <section className={styles.hero}>
      <div className={layout.container}>
        {children}
        <div className={styles.search} role="search">
          <div className={styles.searchRow}>
            <Input ref={input} id="calculator-search" label="Cari kalkulator" type="search"
              placeholder="Contoh: biaya produksi" value={query} onChange={event => setQuery(event.target.value)} />
            {query && <Button variant="secondary" onClick={clear}>Hapus pencarian</Button>}
          </div>
          <p className={styles.status} role="status">{queryText && `${matches.length} kalkulator ditemukan`}</p>
        </div>
      </div>
    </section>
    <div className={`${layout.container} ${layout.page}`}>
      {!queryText && hubs.length > 0 && <section>
        <h2>Jelajahi kategori</h2>
        <nav className={styles.links} aria-label="Kategori kalkulator">
          {hubs.map(hub => <Link key={hub.path} href={hub.path}>{hub.name}</Link>)}
        </nav>
      </section>}
      <div className={!queryText && hubs.length ? layout.section : undefined}>
        <Directory key={normalized} heading={queryText ? 'Hasil pencarian' : 'Kalkulator tersedia'} tools={matches} />
        {queryText && matches.length === 0 && <div className={styles.empty}>
          <strong>Tidak ada kalkulator yang cocok.</strong>
          <p>Coba kata kunci lain, misalnya HPP atau biaya produksi.</p>
        </div>}
      </div>
    </div>
  </>
}
