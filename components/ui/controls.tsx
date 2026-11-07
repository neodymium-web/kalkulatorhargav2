import type { ComponentProps } from 'react'
import styles from './controls.module.css'

export function Button({ variant = 'primary', type = 'button', className = '', ...props }:
  ComponentProps<'button'> & { variant?: 'primary' | 'secondary' | 'text' }) {
  return <button {...props} type={type} className={`${styles.button} ${styles[variant]} ${className}`} />
}

export function Input({ label, id, hint, error, 'aria-describedby': describedBy, ...props }:
  ComponentProps<'input'> & { label: string; id: string; hint?: string; error?: string }) {
  const descriptions = [describedBy, hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ')
  return <div>
    <label htmlFor={id} className={styles.label}>{label}</label>
    <input {...props} id={id} className={styles.input}
      aria-invalid={Boolean(error) || undefined} aria-describedby={descriptions || undefined} />
    {hint && <p className={styles.hint} id={`${id}-hint`}>{hint}</p>}
    {error && <p className={styles.error} id={`${id}-error`}>{error}</p>}
  </div>
}

export function Select({ label, id, hint, error, 'aria-describedby': describedBy, children, ...props }:
  ComponentProps<'select'> & { label: string; id: string; hint?: string; error?: string }) {
  const descriptions = [describedBy, hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ')
  return <div>
    <label htmlFor={id} className={styles.label}>{label}</label>
    <select {...props} id={id} className={styles.input}
      aria-invalid={Boolean(error) || undefined} aria-describedby={descriptions || undefined}>
      {children}
    </select>
    {hint && <p className={styles.hint} id={`${id}-hint`}>{hint}</p>}
    {error && <p className={styles.error} id={`${id}-error`}>{error}</p>}
  </div>
}
