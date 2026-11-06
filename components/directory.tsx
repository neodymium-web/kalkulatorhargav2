'use client'

import { useState } from 'react'
import Link from 'next/link'
import { calculators, type Calculator } from '../lib/registry'

export function Directory({ searchable = false, tools = calculators }: {
  searchable?: boolean
  tools?: readonly Calculator[]
}) {
  const [query, setQuery] = useState('')
  const terms = query.toLocaleLowerCase('id').trim().split(/\s+/)
  const matches = tools.filter(tool => {
    const haystack = [tool.name, tool.category.name, tool.description, ...tool.keywords].join(' ').toLocaleLowerCase('id')
    return terms.every(term => haystack.includes(term))
  })

  return (
    <section aria-labelledby="directory-title">
      {searchable && (
        <div role="search" className="search">
          <label htmlFor="calculator-search">Cari kalkulator</label>
          <input id="calculator-search" type="search" placeholder="Contoh: biaya produksi" value={query}
            onChange={event => setQuery(event.target.value)} />
        </div>
      )}
      <h2 id="directory-title">{query.trim() ? 'Hasil pencarian' : 'Kalkulator tersedia'}</h2>
      {searchable && <p className="sr-only" role="status">{matches.length} kalkulator ditemukan</p>}
      {matches.length ? <ul className="directory">
        {matches.map(tool => <li key={tool.id}><Link href={tool.path}>
          <strong>{tool.name}</strong><span>{tool.description}</span>
        </Link></li>)}
      </ul> : <p>Coba kata kunci lain, misalnya HPP atau biaya produksi.</p>}
    </section>
  )
}
