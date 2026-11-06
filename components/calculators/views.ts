import type { ComponentType } from 'react'
import { HppForm } from './hpp-form'
import { HppMethodology } from './hpp'

export type CalculatorViewProps = { formulaVersion: string }
type CalculatorView = { Form: ComponentType; Methodology: ComponentType<CalculatorViewProps> }

export const views: Readonly<Record<string, CalculatorView | undefined>> = {
  hpp: { Form: HppForm, Methodology: HppMethodology },
}
