import Link from 'next/link'

export function Breadcrumb({ category, current }: {
  category?: { name: string; path: string }
  current: string
}) {
  return <nav className="breadcrumb" aria-label="Jejak navigasi">
    <Link href="/">Beranda</Link>
    {category && <Link href={category.path}>{category.name}</Link>}
    <span aria-current="page">{current}</span>
  </nav>
}
