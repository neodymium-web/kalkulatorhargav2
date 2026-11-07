'use client'
import { useState } from 'react'
import { materialsTools, type MaterialsSlug, type MaterialsTool } from '../../lib/utilities-materials/tools'
import type { MaterialsResult } from '../../lib/utilities-materials/engines'
import { formatMaterials } from '../../lib/utilities-materials/format'
import { StructuredForm } from '../ui/structured-form'
import { ResultPanel } from '../ui/calculator'
import { MaterialsBreakdown } from '../ui/materials-breakdown'
import styles from '../ui/calculator.module.css'
export function MaterialsForm({ slug }: { slug: MaterialsSlug }) {
  const tool: MaterialsTool = materialsTools[slug]
  const [result, setResult] = useState<MaterialsResult>()
  const errors = result?.success === false ? result.errors : undefined
  const fields = result?.success ? tool.outputFields.map(field => ({ label: field.label, value: formatMaterials(result.values[field.id], field.unit, result.tiny[field.id]) })) : []
  const [primary, ...details] = fields
  return <>
    <div className={styles.grid}>
      <StructuredForm tool={tool} errors={errors} onResult={input => setResult(tool.engine(input))} onChange={() => setResult(undefined)} />
      <ResultPanel result={primary} details={details} assumptions={result?.success ? result.notes.join(' ') : undefined}
        message={errors ? 'Periksa kolom yang ditandai.' : 'Isi semua kolom untuk melihat hasil.'} />
    </div>
    {result?.success && <MaterialsBreakdown result={result} />}
  </>
}
