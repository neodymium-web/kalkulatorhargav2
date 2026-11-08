import { advancedTools, type AdvancedSlug, type AdvancedTool } from './tax-advanced/tools'
import { advancedSources, advancedSnapshot } from './tax-advanced/sources'
import { taxTools, type TaxSlug, type TaxTool } from './tax/tools'
import { taxSources, taxSnapshot } from './tax/sources'
import { economicsTools, type EconomicsSlug, type EconomicsTool } from './marketplace-economics/tools'
import { economicsSources } from './marketplace-economics/sources'
import { unitsTools, type UnitsSlug, type UnitsTool } from './units-scale/tools'
import { unitsSources } from './units-scale/sources'
import { materialsTools, type MaterialsSlug, type MaterialsTool } from './utilities-materials/tools'
import { materialsSources } from './utilities-materials/sources'
import { calendarTools, type CalendarSlug, type CalendarTool } from './calendar-time/tools'
import { calendarSources } from './calendar-time/sources'
import { everydayTools, type EverydaySlug, type EverydayTool } from './everyday/tools'
import { everydaySources } from './everyday/sources'
import { creatorTools, type CreatorSlug, type CreatorTool } from './creator-analytics/tools'
import { creatorSources } from './creator-analytics/sources'
import { socialTools, type SocialSlug, type SocialTool } from './social-metrics/tools'
import { socialSources } from './social-metrics/sources'
import { scenarioTools, type ScenarioSlug, type ScenarioTool } from './loan-scenarios/tools'
import { scenarioSources } from './loan-scenarios/sources'
import { sellerTools, type SellerSlug, type SellerTool } from './seller-costs/tools'
import { financeTools, type FinanceSlug, type FinanceTool } from './finance/tools'
import { financeSources } from './finance/sources'
import { investmentTools, type InvestmentSlug, type InvestmentTool } from './investment/tools'
import { investmentSources } from './investment/sources'
import { valuationTools, type ValuationSlug, type ValuationTool } from './valuation/tools'
import { valuationSources } from './valuation/sources'
import { categories, type CategoryId } from './categories'
import { calculateHpp, formulaVersion } from './hpp'
import { operationTools, type OperationSlug } from './operations/tools'
import { stockServiceTools, type StockServiceSlug } from './stock-services/tools'
import { batchFourTools, type BatchSlug, type BatchTool } from './batch-four/tools'
import { metricTools, type MetricSlug } from './marketplace-metrics/tools'
import { businessTools, type BusinessSlug } from './business/tools'

type SchemaField = {
  id: string
  label: string
  type: 'integer' | 'decimal' | 'date' | 'time' | 'choice' | 'array' | 'text'
  unit?: string
}

type OfficialSource = {
  title: string
  url: `https://${string}`
  effectiveDate?: string
  verifiedAt?: string
  version?: string
}

type TestCaseReference = { file: string; name: string }

type Implementation = {
  engine: (input: unknown) => { success: boolean }
  formulaVersion: string
  testCases: readonly [TestCaseReference, ...TestCaseReference[]]
}

type CalculatorRecord = {
  id: string
  slug: string
  path: `/kalkulator/${string}`
  primaryCategory: CategoryId
  secondaryCategories: readonly CategoryId[]
  metadata: { locale: 'id-ID'; title: string; description: string; keywords: readonly string[] }
  inputFields: readonly SchemaField[]
  outputFields: readonly SchemaField[]
  officialSources: readonly OfficialSource[]
}

export type CalculatorDefinition = CalculatorRecord & (
  | { status: 'idea' | 'draft'; implementation?: Implementation }
  | { status: 'published'; implementation: Implementation }
)

export type PublishedCalculator = Extract<CalculatorDefinition, { status: 'published' }>

const businessDefinitions = (Object.keys(businessTools) as BusinessSlug[]).map((slug): PublishedCalculator => {
  const { title, description, keywords, inputFields, outputFields, engine, formulaVersion, testCases } = businessTools[slug]
  const [first, ...rest] = testCases
  const testReference = (name: string) => ({ file: 'tests/business.unit.ts', name })
  return {
    id: `calc-${slug}`, slug, path: `/kalkulator/${slug}`,
    primaryCategory: 'bisnis', secondaryCategories: [],
    metadata: { locale: 'id-ID', title, description, keywords },
    inputFields, outputFields, officialSources: [], status: 'published',
    implementation: { engine, formulaVersion, testCases: [testReference(first), ...rest.map(testReference)] },
  }
})

const operationDefinitions = (Object.keys(operationTools) as OperationSlug[]).map((slug): PublishedCalculator => {
  const { title, description, keywords, inputFields, outputFields, engine, testCase } = operationTools[slug]
  return {
    id: `calc-${slug}`, slug, path: `/kalkulator/${slug}`,
    primaryCategory: 'bisnis', secondaryCategories: [],
    metadata: { locale: 'id-ID', title, description, keywords },
    inputFields, outputFields, officialSources: [], status: 'published',
    implementation: {
      engine, formulaVersion: '1.0.0',
      testCases: [{ file: 'tests/operations.unit.ts', name: testCase }],
    },
  }
})

const stockServiceDefinitions = (Object.keys(stockServiceTools) as StockServiceSlug[]).map((slug): PublishedCalculator => {
  const { title, description, keywords, inputFields, outputFields, engine, testCase } = stockServiceTools[slug]
  return {
    id: `calc-${slug}`, slug, path: `/kalkulator/${slug}`,
    primaryCategory: 'bisnis', secondaryCategories: [],
    metadata: { locale: 'id-ID', title, description, keywords },
    inputFields, outputFields, officialSources: [], status: 'published',
    implementation: {
      engine, formulaVersion: '1.0.0',
      testCases: [{ file: 'tests/stock-services.unit.ts', name: testCase }],
    },
  }
})

const batchFourDefinitions = (Object.keys(batchFourTools) as BatchSlug[]).map((slug): PublishedCalculator => {
  const tool: BatchTool = batchFourTools[slug]
  const { title, description, category, keywords, inputFields, outputFields, engine, testCase } = tool
  return {
    id: `calc-${slug}`, slug, path: `/kalkulator/${slug}`,
    primaryCategory: category, secondaryCategories: [],
    metadata: { locale: 'id-ID', title, description, keywords },
    inputFields: [...inputFields, ...(tool.rows ? [{ id: tool.rows, label: tool.rows === 'ingredients' ? 'Bahan resep' : 'Arus kas per periode', type: 'array' as const }] : [])],
    outputFields, officialSources: [], status: 'published',
    implementation: {
      engine, formulaVersion: '1.0.0',
      testCases: [{ file: 'tests/batch-four.unit.ts', name: testCase }],
    },
  }
})

const metricDefinitions = (Object.keys(metricTools) as MetricSlug[]).map((slug): PublishedCalculator => {
  const { title, description, keywords, inputFields, outputFields, engine, testCase } = metricTools[slug]
  return {
    id: `calc-${slug}`, slug, path: `/kalkulator/${slug}`,
    primaryCategory: 'marketplace', secondaryCategories: [],
    metadata: { locale: 'id-ID', title, description, keywords },
    inputFields, outputFields, officialSources: [], status: 'published',
    implementation: {
      engine, formulaVersion: '1.0.0',
      testCases: [{ file: 'tests/metrics.unit.ts', name: testCase }],
    },
  }
})

const sellerDefinitions = (Object.keys(sellerTools) as SellerSlug[]).map((slug): PublishedCalculator => {
  const tool: SellerTool = sellerTools[slug]
  return {
    id: `calc-${slug}`, slug, path: `/kalkulator/${slug}`, primaryCategory: 'marketplace', secondaryCategories: [],
    metadata: { locale: 'id-ID', title: tool.title, description: tool.description, keywords: tool.keywords },
    inputFields: [...tool.inputFields, ...(tool.rows ? [{ id: tool.rows, label: 'Bahan kemasan', type: 'array' as const }] : [])],
    outputFields: tool.outputFields, officialSources: [{title: slug === 'biaya-kemasan' ? 'BCcampus: Yield Testing' : slug === 'promo-seller' || slug === 'subsidi-ongkir' ? 'TikTok Shop: Co-funded Campaign (Brazil; conceptual only)' : 'OpenStax: Expected value', url: slug === 'biaya-kemasan' ? 'https://opentextbc.ca/basickitchenandfoodservicemanagement/chapter/yield-testing/' : slug === 'promo-seller' || slug === 'subsidi-ongkir' ? 'https://seller-br.tiktok.com/university/essay?knowledge_id=2569565069149953&lang=en' : 'https://openstax.org/books/introductory-statistics-2e/pages/4-2-mean-or-expected-value-and-standard-deviation',verifiedAt:'2026-11-07'}], status:'published',
    implementation: { engine: tool.engine, formulaVersion:'1.0.0', testCases:[{file:'tests/seller-costs.unit.ts',name:tool.testCase}] },
  }
})

const financeDefinitions = (Object.keys(financeTools) as FinanceSlug[]).map((slug): PublishedCalculator => {
  const tool: FinanceTool = financeTools[slug]
  return {
    id: `calc-${slug}`, slug, path: `/kalkulator/${slug}`, primaryCategory: 'keuangan', secondaryCategories: [],
    metadata: { locale: 'id-ID', title: tool.title, description: tool.description, keywords: tool.keywords },
    inputFields: tool.inputFields, outputFields: tool.outputFields,
    officialSources: tool.sources.map(id => ({ ...financeSources[id], verifiedAt: '2026-11-07' })),
    status: 'published',
    implementation: { engine: tool.engine, formulaVersion: '1.0.0', testCases: [{ file: 'tests/finance.unit.ts', name: tool.testCase }] },
  }
})

const investmentDefinitions = (Object.keys(investmentTools) as InvestmentSlug[]).map((slug): PublishedCalculator => {
  const tool: InvestmentTool = investmentTools[slug]
  return {
    id: `calc-${slug}`, slug, path: `/kalkulator/${slug}`, primaryCategory: 'keuangan', secondaryCategories: [],
    metadata: { locale: 'id-ID', title: tool.title, description: tool.description, keywords: tool.keywords },
    inputFields: tool.inputFields, outputFields: tool.outputFields,
    officialSources: tool.sources.map(id => ({ ...investmentSources[id], verifiedAt: '2026-11-07' })),
    status: 'published',
    implementation: { engine: tool.engine, formulaVersion: '1.0.0', testCases: [{ file: 'tests/investment.unit.ts', name: tool.testCase }] },
  }
})

const valuationDefinitions = (Object.keys(valuationTools) as ValuationSlug[]).map((slug): PublishedCalculator => {
  const tool: ValuationTool = valuationTools[slug]
  return {
    id: `calc-${slug}`, slug, path: `/kalkulator/${slug}`, primaryCategory: 'keuangan', secondaryCategories: [],
    metadata: { locale: 'id-ID', title: tool.title, description: tool.description, keywords: tool.keywords },
    inputFields: [...tool.inputFields, ...(tool.rows ? [{ id: tool.rows, label: tool.rows === 'cashflows' ? 'Arus kas tahunan' : 'Transaksi beli', type: 'array' as const }] : [])],
    outputFields: tool.outputFields, officialSources: tool.sources.map(id => ({ ...valuationSources[id], verifiedAt: '2026-11-07' })), status: 'published',
    implementation: { engine: tool.engine, formulaVersion: '1.0.0', testCases: [{ file: 'tests/valuation.unit.ts', name: tool.testCase }] },
  }
})

const scenarioDefinitions = (Object.keys(scenarioTools) as ScenarioSlug[]).map((slug): PublishedCalculator => {
  const tool: ScenarioTool = scenarioTools[slug]
  return {
    id: `calc-${slug}`, slug, path: `/kalkulator/${slug}`, primaryCategory: 'keuangan', secondaryCategories: [],
    metadata: { locale: 'id-ID', title: tool.title, description: tool.description, keywords: tool.keywords },
    inputFields: [...tool.inputFields, ...(tool.rows ? [{ id: tool.rows, label: 'Pembayaran bertanggal', type: 'array' as const }] : [])],
    outputFields: tool.outputFields, officialSources: tool.sources.map(id => ({ ...scenarioSources[id], verifiedAt: '2026-11-07' })), status: 'published',
    implementation: { engine: tool.engine, formulaVersion: '1.0.0', testCases: [{ file: 'tests/loan-scenarios.unit.ts', name: tool.testCase }] },
  }
})

const socialDefinitions = (Object.keys(socialTools) as SocialSlug[]).map((slug): PublishedCalculator => {
  const tool: SocialTool = socialTools[slug]
  return {
    id: `calc-${slug}`, slug, path: `/kalkulator/${slug}`, primaryCategory: 'media-sosial', secondaryCategories: [],
    metadata: { locale: 'id-ID', title: tool.title, description: tool.description, keywords: tool.keywords },
    inputFields: tool.inputFields, outputFields: tool.outputFields,
    officialSources: tool.sources.map(id => ({ ...socialSources[id], verifiedAt: '2026-11-07' })), status: 'published',
    implementation: { engine: tool.engine, formulaVersion: '1.0.0', testCases: [{ file: 'tests/social-metrics.unit.ts', name: tool.testCase }] },
  }
})

const creatorDefinitions = (Object.keys(creatorTools) as CreatorSlug[]).map((slug): PublishedCalculator => {
  const tool: CreatorTool = creatorTools[slug]
  return {
    id: slug === 'tiktok' ? 'calc-estimasi-tiktok-kreator' : `calc-${slug}`, slug, path: `/kalkulator/${slug}`,
    primaryCategory: 'media-sosial', secondaryCategories: [],
    metadata: { locale: 'id-ID', title: tool.title, description: tool.description, keywords: tool.keywords },
    inputFields: [...(slug === 'tiktok' ? [{ id: 'mode', label: 'Modul kreator', type: 'choice' as const }] : []), ...tool.inputFields], outputFields: tool.outputFields,
    officialSources: tool.sources.map(id => ({ ...creatorSources[id], verifiedAt: '2026-11-07' })), status: 'published',
    implementation: { engine: tool.engine, formulaVersion: '1.0.0', testCases: [{ file: 'tests/creator-analytics.unit.ts', name: tool.testCase }] },
  }
})

const everydayDefinitions = (Object.keys(everydayTools) as EverydaySlug[]).map((slug): PublishedCalculator => {
  const tool: EverydayTool = everydayTools[slug]
  return {
    id: `calc-${slug}`, slug, path: `/kalkulator/${slug}`, primaryCategory: 'sehari-hari', secondaryCategories: [],
    metadata: { locale: 'id-ID', title: tool.title, description: tool.description, keywords: tool.keywords },
    inputFields: [...(slug === 'persen' ? [{ id: 'mode', label: 'Mode persen', type: 'choice' as const }] : []), ...tool.inputFields,
      ...(tool.rows ? [{ id: tool.rows, label: tool.rowConfig?.label ?? 'Baris', type: 'array' as const }] : [])],
    outputFields: tool.outputFields, officialSources: tool.sources.map(id => ({ ...everydaySources[id], verifiedAt: '2026-11-07' })), status: 'published',
    implementation: { engine: tool.engine, formulaVersion: '1.0.0', testCases: [{ file: 'tests/everyday.unit.ts', name: tool.testCase }] },
  }
})

const calendarDefinitions = (Object.keys(calendarTools) as CalendarSlug[]).map((slug): PublishedCalculator => {
  const tool: CalendarTool = calendarTools[slug]
  return {
    id: `calc-${slug}`, slug, path: `/kalkulator/${slug}`, primaryCategory: 'sehari-hari', secondaryCategories: [],
    metadata: { locale: 'id-ID', title: tool.title, description: tool.description, keywords: tool.keywords },
    inputFields: [...tool.inputFields, ...(tool.rows ? [{ id: tool.rows, label: 'Tanggal libur eksplisit', type: 'array' as const }] : [])],
    outputFields: tool.outputFields, officialSources: tool.sources.map(id => ({ ...calendarSources[id], verifiedAt: '2026-11-07' })), status: 'published',
    implementation: { engine: tool.engine, formulaVersion: '1.0.0', testCases: [{ file: 'tests/calendar-time.unit.ts', name: tool.testCase }] },
  }
})

const materialsDefinitions = (Object.keys(materialsTools) as MaterialsSlug[]).map((slug): PublishedCalculator => {
  const tool: MaterialsTool = materialsTools[slug]
  return {
    id: `calc-${slug}`, slug, path: `/kalkulator/${slug}`, primaryCategory: 'sehari-hari', secondaryCategories: [],
    metadata: { locale: 'id-ID', title: tool.title, description: tool.description, keywords: tool.keywords },
    inputFields: [...tool.inputFields, ...(tool.rows ? [{ id: tool.rows, label: tool.rowConfig?.label ?? 'Baris', type: 'array' as const }] : [])],
    outputFields: tool.outputFields, officialSources: tool.sources.map(id => ({ ...materialsSources[id], verifiedAt: '2026-11-07' })), status: 'published',
    implementation: { engine: tool.engine, formulaVersion: '1.0.0', testCases: [{ file: 'tests/utilities-materials.unit.ts', name: tool.testCase }] },
  }
})

const unitsDefinitions = (Object.keys(unitsTools) as UnitsSlug[]).map((slug): PublishedCalculator => {
  const tool: UnitsTool = unitsTools[slug]
  return {
    id: `calc-${slug}`, slug, path: `/kalkulator/${slug}`, primaryCategory: 'sehari-hari', secondaryCategories: [],
    metadata: { locale: 'id-ID', title: tool.title, description: tool.description, keywords: tool.keywords },
    inputFields: tool.inputFields, outputFields: [{ id: 'converted', label: 'Hasil dalam satuan tujuan', type: 'decimal' }, { id: 'baseValue', label: 'Nilai dalam satuan basis', type: 'decimal' }],
    officialSources: tool.sources.map(source => ({ ...unitsSources[source], verifiedAt: '2026-11-07' })), status: 'published',
    implementation: { engine: tool.engine, formulaVersion: '1.0.0', testCases: [{ file: 'tests/units-scale.unit.ts', name: tool.testCase }] },
  }
})

const economicsDefinitions = (Object.keys(economicsTools) as EconomicsSlug[]).map((slug): PublishedCalculator => {
  const tool: EconomicsTool = economicsTools[slug]
  return {
    id: `calc-${slug}`, slug, path: `/kalkulator/${slug}`, primaryCategory: 'marketplace', secondaryCategories: [],
    metadata: { locale: 'id-ID', title: tool.title, description: tool.description, keywords: tool.keywords },
    inputFields: [...tool.inputFields, ...(tool.rows ? [{ id: tool.rows, label: tool.rowConfig!.label, type: 'array' as const }] : [])],
    outputFields: [{ id: 'primary', label: 'Hasil skenario', type: 'decimal' }],
    officialSources: tool.sources.map(source => ({ ...economicsSources[source], verifiedAt: '2026-11-07' })), status: 'published',
    implementation: { engine: tool.engine, formulaVersion: '1.0.0', testCases: [{ file: 'tests/marketplace-economics.unit.ts', name: tool.testCase }] },
  }
})

const taxDefinitions = (Object.keys(taxTools) as TaxSlug[]).map((slug): PublishedCalculator => {
  const tool: TaxTool = taxTools[slug]
  return { id: `calc-${slug}`, slug, path: `/kalkulator/${slug}`, primaryCategory: 'pajak', secondaryCategories: [],
    metadata: { locale: 'id-ID', title: tool.title, description: tool.description, keywords: tool.keywords },
    inputFields: [...tool.inputFields, ...(tool.rows ? [{ id: tool.rows, label: 'Omzet dua belas bulan', type: 'array' as const }] : [])], outputFields: [{ id: 'amount', label: 'Estimasi pajak atau status kelayakan', type: 'integer', unit: 'IDR' }],
    officialSources: tool.sources.map(s => ({ title: taxSources[s].title, url: taxSources[s].url, effectiveDate: taxSources[s].effectiveFrom, verifiedAt: taxSnapshot.verifiedAt, version: taxSnapshot.version })), status: 'published',
    implementation: { engine: tool.engine, formulaVersion: slug === 'pph-final-umkm' ? '1.1.0' : '1.0.0', testCases: [{ file: 'tests/tax.unit.ts', name: tool.testCase }] } }
})

const advancedDefinitions = (Object.keys(advancedTools) as AdvancedSlug[]).map((slug): PublishedCalculator => {
  const tool: AdvancedTool = advancedTools[slug]
  return { id: `calc-${slug}`, slug, path: `/kalkulator/${slug}`, primaryCategory: 'pajak', secondaryCategories: [],
    metadata: { locale: 'id-ID', title: tool.title, description: tool.description, keywords: tool.keywords },
    inputFields: [...tool.inputFields], outputFields: [{id:'amount',label:'Estimasi terbatas, simulasi atau status',type:'integer',unit:'IDR'}],
    officialSources: tool.sources.map(s=>({title:advancedSources[s].title,url:advancedSources[s].url,effectiveDate:advancedSources[s].effectiveFrom,verifiedAt:advancedSnapshot.verifiedAt,version:advancedSnapshot.version})),status:'published',
    implementation: {engine:tool.engine,formulaVersion:'1.0.0',testCases:[{file:'tests/tax-advanced.unit.ts',name:tool.testCase}]} }
})

export const definitions: readonly CalculatorDefinition[] = [{
  id: 'production-cost',
  slug: 'hpp',
  path: '/kalkulator/hpp',
  primaryCategory: 'bisnis',
  secondaryCategories: [],
  metadata: {
    locale: 'id-ID',
    title: 'Kalkulator HPP',
    description: 'Hitung total biaya produksi dan harga pokok produksi per unit.',
    keywords: ['harga pokok produksi', 'modal', 'biaya produksi'],
  },
  inputFields: [
    { id: 'materials', label: 'Bahan baku', type: 'integer', unit: 'IDR' },
    { id: 'labor', label: 'Tenaga kerja langsung', type: 'integer', unit: 'IDR' },
    { id: 'overhead', label: 'Overhead produksi', type: 'integer', unit: 'IDR' },
    { id: 'units', label: 'Jumlah unit', type: 'integer', unit: 'unit' },
  ],
  outputFields: [
    { id: 'total', label: 'Total biaya produksi', type: 'integer', unit: 'IDR' },
    { id: 'perUnit', label: 'HPP per unit', type: 'integer', unit: 'IDR' },
  ],
  officialSources: [],
  status: 'published',
  implementation: {
    engine: calculateHpp,
    formulaVersion,
    testCases: [
      { file: 'tests/hpp.unit.ts', name: 'calculates the documented production batch' },
      { file: 'tests/hpp.unit.ts', name: 'rounds %s rupiah across %s units' },
      { file: 'tests/hpp.unit.ts', name: 'preserves precision for the maximum supported costs' },
      { file: 'tests/hpp.unit.ts', name: 'rejects invalid unit count %s' },
      { file: 'tests/hpp.unit.ts', name: 'rejects invalid cost %s' },
    ],
  },
}, ...businessDefinitions, ...operationDefinitions, ...stockServiceDefinitions, ...batchFourDefinitions, ...metricDefinitions, ...sellerDefinitions, ...financeDefinitions, ...investmentDefinitions, ...valuationDefinitions, ...scenarioDefinitions, ...socialDefinitions, ...creatorDefinitions, ...everydayDefinitions, ...calendarDefinitions, ...materialsDefinitions, ...unitsDefinitions, ...economicsDefinitions, ...taxDefinitions, ...advancedDefinitions]

export function listPublished(records = definitions): PublishedCalculator[] {
  return records.filter(tool => tool.status === 'published')
}

export function findPublished(slug: string, records = definitions) {
  return listPublished(records).find(tool => tool.slug === slug)
}

function belongsTo(tool: PublishedCalculator, category: CategoryId) {
  return tool.primaryCategory === category || tool.secondaryCategories.includes(category)
}

export function listCategory(category: CategoryId, records = definitions) {
  return listPublished(records).filter(tool => belongsTo(tool, category))
}

export function listCategoryHubs(records = definitions) {
  return Object.entries(categories).flatMap(([id, category]) =>
    category.hub && listCategory(id as CategoryId, records).length
      ? [{ name: category.name, path: category.hub }]
      : [],
  )
}

export function relatedCalculators(tool: PublishedCalculator, records = definitions) {
  const categoryIds = [tool.primaryCategory, ...tool.secondaryCategories]
  return listPublished(records).filter(candidate =>
    candidate.id !== tool.id && categoryIds.some(category => belongsTo(candidate, category)),
  )
}

export function sitemapPaths(records = definitions) {
  return ['/', ...listCategoryHubs(records).map(hub => hub.path), ...listPublished(records).map(tool => tool.path)]
}
