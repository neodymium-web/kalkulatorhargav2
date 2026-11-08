import {advancedTools,type AdvancedSlug} from '../../lib/tax-advanced/tools'
import {AdvancedTaxForm} from './advanced-tax-form'
import {AdvancedTaxMethodology} from './advanced-tax-methodology'
import { taxTools, type TaxSlug } from '../../lib/tax/tools'
import { TaxForm } from './tax-form'
import { TaxMethodology } from './tax-methodology'
import { economicsTools, type EconomicsSlug } from '../../lib/marketplace-economics/tools'
import { EconomicsForm } from './economics-form'
import { EconomicsMethodology } from './economics-methodology'
import { unitsTools, type UnitsSlug } from '../../lib/units-scale/tools'
import { UnitsForm } from './units-form'
import { UnitsMethodology } from './units-methodology'
import { materialsTools, type MaterialsSlug } from '../../lib/utilities-materials/tools'
import { MaterialsForm } from './materials-form'
import { MaterialsMethodology } from './materials-methodology'
import { calendarTools, type CalendarSlug } from '../../lib/calendar-time/tools'
import { CalendarForm } from './calendar-form'
import { CalendarMethodology } from './calendar-methodology'
import { everydayTools, type EverydaySlug } from '../../lib/everyday/tools'
import { EverydayForm } from './everyday-form'
import { EverydayMethodology } from './everyday-methodology'
import { creatorTools, type CreatorSlug } from '../../lib/creator-analytics/tools'
import { CreatorForm } from './creator-form'
import { CreatorMethodology } from './creator-methodology'
import { socialTools, type SocialSlug } from '../../lib/social-metrics/tools'
import { SocialForm } from './social-form'
import { SocialMethodology } from './social-methodology'
import { scenarioTools, type ScenarioSlug } from '../../lib/loan-scenarios/tools'
import { ScenarioForm } from './scenario-form'
import { ScenarioMethodology } from './scenario-methodology'
import { sellerTools, type SellerSlug } from '../../lib/seller-costs/tools'
import { financeTools, type FinanceSlug } from '../../lib/finance/tools'
import { FinanceForm } from './finance-form'
import { FinanceMethodology } from './finance-methodology'
import { investmentTools, type InvestmentSlug } from '../../lib/investment/tools'
import { InvestmentForm } from './investment-form'
import { InvestmentMethodology } from './investment-methodology'
import { valuationTools, type ValuationSlug } from '../../lib/valuation/tools'
import { ValuationForm } from './valuation-form'
import { ValuationMethodology } from './valuation-methodology'
import { SellerForm } from './seller-form'
import { SellerMethodology } from './seller-methodology'
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
import { metricTools, type MetricSlug } from '../../lib/marketplace-metrics/tools'
import { MetricsForm } from './metrics-form'
import { MetricsMethodology } from './metrics-methodology'
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
  ...Object.fromEntries((Object.keys(metricTools) as MetricSlug[]).map(slug => {
    const view: CalculatorView = {
      Form: () => <MetricsForm slug={slug} />,
      Methodology: ({ formulaVersion }) => <MetricsMethodology slug={slug} formulaVersion={formulaVersion} />,
    }
    return [slug, view]
  })),
  ...Object.fromEntries((Object.keys(sellerTools) as SellerSlug[]).map(slug => {
    const view: CalculatorView = {
      Form: () => <SellerForm slug={slug} />,
      Methodology: ({ formulaVersion }) => <SellerMethodology slug={slug} formulaVersion={formulaVersion} />,
    }
    return [slug, view]
  })),
  ...Object.fromEntries((Object.keys(financeTools) as FinanceSlug[]).map(slug => {
    const view: CalculatorView = {
      Form: () => <FinanceForm slug={slug} />,
      Methodology: ({ formulaVersion }) => <FinanceMethodology slug={slug} formulaVersion={formulaVersion} />,
    }
    return [slug, view]
  })),
  ...Object.fromEntries((Object.keys(investmentTools) as InvestmentSlug[]).map(slug => {
    const view: CalculatorView = {
      Form: () => <InvestmentForm slug={slug} />,
      Methodology: ({ formulaVersion }) => <InvestmentMethodology slug={slug} formulaVersion={formulaVersion} />,
    }
    return [slug, view]
  })),
  ...Object.fromEntries((Object.keys(valuationTools) as ValuationSlug[]).map(slug => {
    const view: CalculatorView = {
      Form: () => <ValuationForm slug={slug} />,
      Methodology: ({ formulaVersion }) => <ValuationMethodology slug={slug} formulaVersion={formulaVersion} />,
    }
    return [slug, view]
  })),
  ...Object.fromEntries((Object.keys(scenarioTools) as ScenarioSlug[]).map(slug => {
    const view: CalculatorView = {
      Form: () => <ScenarioForm slug={slug} />,
      Methodology: ({ formulaVersion }) => <ScenarioMethodology slug={slug} formulaVersion={formulaVersion} />,
    }
    return [slug, view]
  })),
  ...Object.fromEntries((Object.keys(socialTools) as SocialSlug[]).map(slug => {
    const view: CalculatorView = {
      Form: () => <SocialForm slug={slug} />,
      Methodology: ({ formulaVersion }) => <SocialMethodology slug={slug} formulaVersion={formulaVersion} />,
    }
    return [slug, view]
  })),
  ...Object.fromEntries((Object.keys(creatorTools) as CreatorSlug[]).map(slug => {
    const view: CalculatorView = {
      Form: () => <CreatorForm slug={slug} />,
      Methodology: ({ formulaVersion }) => <CreatorMethodology slug={slug} formulaVersion={formulaVersion} />,
    }
    return [slug, view]
  })),
  ...Object.fromEntries((Object.keys(everydayTools) as EverydaySlug[]).map(slug => {
    const view: CalculatorView = {
      Form: () => <EverydayForm slug={slug} />,
      Methodology: ({ formulaVersion }) => <EverydayMethodology slug={slug} formulaVersion={formulaVersion} />,
    }
    return [slug, view]
  })),
  ...Object.fromEntries((Object.keys(calendarTools) as CalendarSlug[]).map(slug => {
    const view: CalculatorView = {
      Form: () => <CalendarForm slug={slug} />,
      Methodology: ({ formulaVersion }) => <CalendarMethodology slug={slug} formulaVersion={formulaVersion} />,
    }
    return [slug, view]
  })),
  ...Object.fromEntries((Object.keys(materialsTools) as MaterialsSlug[]).map(slug => {
    const view: CalculatorView = {
      Form: () => <MaterialsForm slug={slug} />,
      Methodology: ({ formulaVersion }) => <MaterialsMethodology slug={slug} formulaVersion={formulaVersion} />,
    }
    return [slug, view]
  })),
  ...Object.fromEntries((Object.keys(unitsTools) as UnitsSlug[]).map(slug => {
    const view: CalculatorView = {
      Form: () => <UnitsForm slug={slug} />,
      Methodology: ({ formulaVersion }) => <UnitsMethodology slug={slug} formulaVersion={formulaVersion} />,
    }
    return [slug, view]
  })),
  ...Object.fromEntries((Object.keys(economicsTools) as EconomicsSlug[]).map(slug => {
    const view: CalculatorView = {
      Form: () => <EconomicsForm slug={slug} />,
      Methodology: ({ formulaVersion }) => <EconomicsMethodology slug={slug} formulaVersion={formulaVersion} />,
    }
    return [slug, view]
  })),
  ...Object.fromEntries((Object.keys(taxTools) as TaxSlug[]).map(slug => {
    const view: CalculatorView = { Form: () => <TaxForm slug={slug} />, Methodology: ({ formulaVersion }) => <TaxMethodology slug={slug} formulaVersion={formulaVersion} /> }
    return [slug, view]
  })),
  ...Object.fromEntries((Object.keys(advancedTools) as AdvancedSlug[]).map(slug => {
    const view: CalculatorView = { Form: () => <AdvancedTaxForm slug={slug} />, Methodology: ({formulaVersion}) => <AdvancedTaxMethodology slug={slug} formulaVersion={formulaVersion} /> }
    return [slug,view]
  })),
}
