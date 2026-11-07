import type { ComponentType } from 'react'
import { businessTools, type BusinessSlug } from '../../lib/business/tools'
import { BusinessForm } from './business-form'
import { BusinessMethodology } from './business-methodology'
import { operationTools, type OperationSlug } from '../../lib/operations/tools'
import { OperationsForm } from './operations-form'
import { OperationsMethodology } from './operations-methodology'
import { stockServiceTools, type StockServiceSlug } from '../../lib/stock-services/tools'
import { StockServicesForm } from './stock-services-form'
import { StockServicesMethodology } from './stock-services-methodology'
import { batchFourTools, type BatchSlug } from '../../lib/batch-four/tools'
import { BatchFourForm } from './batch-four-form'
import { BatchFourMethodology } from './batch-four-methodology'
import { HppForm } from './hpp-form'
import { HppMethodology } from './hpp'

export type CalculatorViewProps = { formulaVersion: string }
type CalculatorView = { Form: ComponentType; Methodology: ComponentType<CalculatorViewProps> }

export const views: Readonly<Record<string, CalculatorView | undefined>> = {
  hpp: { Form: HppForm, Methodology: HppMethodology },
  ...Object.fromEntries((Object.keys(businessTools) as BusinessSlug[]).map(slug => {
    const view: CalculatorView = {
      Form: () => <BusinessForm slug={slug} />,
      Methodology: ({ formulaVersion }) => <BusinessMethodology slug={slug} formulaVersion={formulaVersion} />,
    }
    return [slug, view]
  })),
  ...Object.fromEntries((Object.keys(operationTools) as OperationSlug[]).map(slug => {
    const view: CalculatorView = {
      Form: () => <OperationsForm slug={slug} />,
      Methodology: ({ formulaVersion }) => <OperationsMethodology slug={slug} formulaVersion={formulaVersion} />,
    }
    return [slug, view]
  })),
  ...Object.fromEntries((Object.keys(stockServiceTools) as StockServiceSlug[]).map(slug => {
    const view: CalculatorView = {
      Form: () => <StockServicesForm slug={slug} />,
      Methodology: ({ formulaVersion }) => <StockServicesMethodology slug={slug} formulaVersion={formulaVersion} />,
    }
    return [slug, view]
  })),
  ...Object.fromEntries((Object.keys(batchFourTools) as BatchSlug[]).map(slug => {
    const view: CalculatorView = {
      Form: () => <BatchFourForm slug={slug} />,
      Methodology: ({ formulaVersion }) => <BatchFourMethodology slug={slug} formulaVersion={formulaVersion} />,
    }
    return [slug, view]
  })),
}
