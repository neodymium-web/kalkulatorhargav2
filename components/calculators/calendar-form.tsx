'use client'
import { useState } from 'react'
import { calendarTools, type CalendarSlug, type CalendarTool } from '../../lib/calendar-time/tools'
import type { CalendarResult } from '../../lib/calendar-time/engines'
import { formatCalendar } from '../../lib/calendar-time/format'
import { StructuredForm } from '../ui/structured-form'
import { ResultPanel } from '../ui/calculator'
import { HolidayBreakdown } from '../ui/holiday-breakdown'
import styles from '../ui/calculator.module.css'
export function CalendarForm({ slug }: { slug: CalendarSlug }) {
  const tool: CalendarTool = calendarTools[slug]
  const [result, setResult] = useState<CalendarResult>()
  const errors = result?.success === false ? result.errors : undefined
  const fields = result?.success ? tool.outputFields.map(field => ({
    label: field.label,
    value: field.unit === 'age'
      ? `${formatCalendar(result.values.years, 'integer')} tahun ${formatCalendar(result.values.months, 'integer')} bulan ${formatCalendar(result.values.days, 'days')}`
      : formatCalendar(result.values[field.id], field.unit, result.tiny?.[field.id]),
  })) : []
  const [primary, ...details] = fields
  return <>
    <div className={styles.grid}>
      <StructuredForm tool={tool} errors={errors} onResult={input => setResult(tool.engine(input))} onChange={() => setResult(undefined)} />
      <ResultPanel result={primary} details={details} assumptions={result?.success ? result.notes.join(' ') : undefined}
        message={errors ? 'Periksa kolom yang ditandai.' : 'Isi semua kolom untuk melihat hasil.'} />
    </div>
    {result?.success && result.holidays && <HolidayBreakdown rows={result.holidays} />}
  </>
}
