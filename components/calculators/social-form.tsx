'use client'
import { useState } from 'react'
import { socialTools, type SocialSlug, type SocialTool } from '../../lib/social-metrics/tools'
import type { SocialResult } from '../../lib/social-metrics/engines'
import { acquisitionLabels, basisLabels, formatSocial } from '../../lib/social-metrics/format'
import { StructuredForm } from '../ui/structured-form'
import { ResultPanel } from '../ui/calculator'
import layout from '../ui/calculator.module.css'
export function SocialForm({ slug }: { slug: SocialSlug }) {
  const tool: SocialTool = socialTools[slug]
  const [result, setResult] = useState<SocialResult>()
  const errors = result?.success === false ? result.errors : undefined
  const outputs = result?.success ? tool.outputFields.map(f => ({
    label: f.id === 'denominator' && result.basis ? basisLabels[result.basis]
      : f.id === 'cost' && result.action ? `CPA per ${acquisitionLabels[result.action]} teratribusi`
      : f.id === 'events' && result.action ? `Jumlah ${acquisitionLabels[result.action]} teratribusi` : f.label,
    value: formatSocial(result.values[f.id], f.unit, f.id === 'rate' || f.id === 'cost' ? result.tiny : undefined),
  })) : []
  const [primary, ...details] = outputs
  const explanation = result?.success
    ? result.basis
      ? `Basis: ${basisLabels[result.basis]}. ${result.overBasis ? 'Rasio eksak melebihi 100% sebelum pembulatan. Jumlah aksi lebih besar dari basis; satu akun dapat melakukan beberapa aksi. ' : ''}Interaksi bukan orang unik dan tidak ada ambang engagement baik universal.`
      : slug === 'pertumbuhan-pengikut'
        ? `${result.values.rate === null ? 'Pengikut awal nol membuat persentase tidak terdefinisi; perubahan bersih dan jumlah akhir tetap dapat dihitung. ' : ''}Ini perbandingan dua snapshot, bukan laju harian atau prediksi.`
        : `Biaya rata-rata diagnostik hingga dua desimal rupiah, dari belanja dan jumlah hasil yang dimasukkan. ${result.action ? 'Gunakan satu definisi hasil, periode, model dan jendela atribusi yang sama; ini bukan bukti laba atau sebab-akibat iklan.' : slug === 'cpm' ? 'Impresi bisa berulang pada orang yang sama.' : 'Klik adalah aksi, tidak selalu orang unik atau link click.'}`
    : undefined
  return <div className={layout.grid}>
    <StructuredForm tool={tool} errors={errors} onResult={input => setResult(tool.engine(input))} onChange={() => setResult(undefined)} />
    <ResultPanel result={primary} details={details} assumptions={explanation}
      message={errors ? 'Periksa kolom yang ditandai.' : 'Isi semua kolom untuk melihat hasil.'} />
  </div>
}
