import { useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Database,
  Download,
  FileArchive,
  Gavel,
  Upload,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { unzipSync } from 'fflate'
import { COUNTRY_LOCALIZATION, COUNTRY_LOCALIZATION_COUNT } from './countryLocalization'
import {
  LAW_METADATA,
  LAW_METADATA_COUNT,
  type LawCategory,
} from './lawMetadata'
import {
  TECHNOLOGY_METADATA,
  TECHNOLOGY_METADATA_COUNT,
  type TechnologyCategory,
} from './technologyMetadata'
import './App.css'

type SaveFormat = 'text' | 'zip-text' | 'zip-binary' | 'unknown'

type TrendPoint = {
  index: number
  year: number
  dateLabel: string
  gdp?: number
  population?: number
  literacy?: number
  sol?: number
  prestige?: number
  investmentPoolIncome?: number
  nationalRevenue?: number
}

type TrendDataKey = keyof Pick<
  TrendPoint,
  | 'gdp'
  | 'population'
  | 'literacy'
  | 'sol'
  | 'prestige'
  | 'investmentPoolIncome'
  | 'nationalRevenue'
>

type AggregateMetricKey =
  | TrendDataKey
  | 'balance'
  | 'money'
  | 'credit'
  | 'radicals'
  | 'loyalists'

type AggregateMetricConfig = {
  key: AggregateMetricKey
  label: string
  mode: 'trend' | 'current'
  formatter: (value?: number) => string
}

type AggregateLimit = number | 'all'

type DatedValue = {
  date: string
  year: number
  value: number
}

type BudgetBreakdownItem = {
  key: string
  label: string
  value: number
}

type BudgetBreakdown = {
  totalIncome?: number
  totalExpenses?: number
  incomes: BudgetBreakdownItem[]
  expenses: BudgetBreakdownItem[]
}

type StateProfession = {
  key: string
  label: string
  population: number
}

type StateBuilding = {
  key: string
  buildingKey: string
  label: string
  levels: number
  staffing?: number
  economicOutput: number
}

type StateBreakdownEntry = {
  id: string
  name: string
  population: number
  economicOutput: number
  professions: StateProfession[]
  buildings: StateBuilding[]
}

type TechnologyProgress = {
  key: string
  label: string
  progress?: number
  isResearched: boolean
}

type CountryTechnologies = {
  acquired: string[]
  researchTechnology?: string
  researchQueue: string[]
  progressed: TechnologyProgress[]
  spreading: string[]
}

type CountrySummary = {
  id: string
  tag: string
  name: string
  playerName?: string
  rank?: string
  taxLevel?: string
  countryType?: string
  activeLaws: LawSummary[]
  technologies: CountryTechnologies
  gdp: DatedValue[]
  population: DatedValue[]
  literacy: DatedValue[]
  sol: DatedValue[]
  prestige: DatedValue[]
  investmentPoolIncome: DatedValue[]
  nationalRevenue: DatedValue[]
  budgetBreakdown: BudgetBreakdown
  states: StateBreakdownEntry[]
  money?: number
  balance?: number
  debt?: number
  credit?: number
  radicals?: number
  loyalists?: number
  lowerStrata?: number
  middleStrata?: number
  upperStrata?: number
}

type LawSummary = {
  key: string
  label: string
  group: string
  groupLabel: string
  category: LawCategory
}

type PlayerSummary = {
  name: string
  countryId: string
  countryTag: string
  countryName: string
}

type AnalysisResult = {
  fileName: string
  fileSize: number
  format: SaveFormat
  meta: Record<string, string>
  countries: CountrySummary[]
  players: PlayerSummary[]
  warnings: string[]
  extractedText?: string
  sourceParts: string[]
}

const decoder = new TextDecoder('utf-8', { fatal: false })
const VIC3_START_YEAR = 1836
const PLAYER_COLORS = [
  '#2563eb',
  '#dc2626',
  '#16a34a',
  '#9333ea',
  '#ea580c',
  '#0891b2',
  '#be123c',
  '#4f46e5',
  '#65a30d',
  '#b45309',
  '#0f766e',
  '#7c3aed',
  '#c2410c',
  '#0284c7',
  '#a21caf',
  '#15803d',
  '#b91c1c',
  '#4338ca',
  '#0e7490',
  '#854d0e',
]

const AGGREGATE_METRICS: AggregateMetricConfig[] = [
  { key: 'gdp', label: 'GDP', mode: 'trend', formatter: formatCompact },
  { key: 'population', label: 'Population', mode: 'trend', formatter: formatCompact },
  { key: 'sol', label: 'Average SoL', mode: 'trend', formatter: formatValue },
  { key: 'literacy', label: 'Literacy', mode: 'trend', formatter: formatValue },
  { key: 'prestige', label: 'Prestige', mode: 'trend', formatter: formatCompact },
  { key: 'nationalRevenue', label: 'National Revenue', mode: 'current', formatter: formatCompact },
  { key: 'investmentPoolIncome', label: 'Investment Pool Income', mode: 'current', formatter: formatCompact },
  { key: 'balance', label: 'Weekly Balance', mode: 'current', formatter: formatCompact },
  { key: 'credit', label: 'Debt / Cap', mode: 'current', formatter: formatCompact },
  { key: 'money', label: 'Treasury', mode: 'current', formatter: formatCompact },
  { key: 'radicals', label: 'Radicals', mode: 'current', formatter: formatCompact },
  { key: 'loyalists', label: 'Loyalists', mode: 'current', formatter: formatCompact },
]

function App() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [selectedTag, setSelectedTag] = useState<string>('')
  const [countryTagSearch, setCountryTagSearch] = useState<string>('')
  const [isWorking, setIsWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aggregateMetricKey, setAggregateMetricKey] = useState<AggregateMetricKey>('gdp')
  const [aggregateLimit, setAggregateLimit] = useState<AggregateLimit>(20)
  const [dismissedWarnings, setDismissedWarnings] = useState<Set<string>>(() => new Set())

  const selectedCountry = useMemo(() => {
    if (!analysis?.countries.length) return null
    return (
      analysis.countries.find((country) => country.tag === selectedTag) ??
      analysis.countries[0]
    )
  }, [analysis, selectedTag])

  const chartData = useMemo(
    () => buildChartData(selectedCountry),
    [selectedCountry],
  )
  const aggregateMetric = useMemo(
    () => AGGREGATE_METRICS.find((metric) => metric.key === aggregateMetricKey) ?? AGGREGATE_METRICS[0],
    [aggregateMetricKey],
  )

  async function handleFile(file: File) {
    setIsWorking(true)
    setError(null)
    setAnalysis(null)
    setSelectedTag('')
    setCountryTagSearch('')
    setDismissedWarnings(new Set())

    try {
      const result = await analyzeSaveFile(file)
      setAnalysis(result)
      setSelectedTag(result.countries[0]?.tag ?? '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed.')
    } finally {
      setIsWorking(false)
    }
  }

  return (
    <main className="shell">
      <section className="topbar">
        <div>
          <h1>GitGud Save Analyzer</h1>
          <p>Victoria 3 save stats analyzer made by TryToGitGud</p>
        </div>
        <label className="uploadButton" title="Upload a .v3 save file">
          <Upload size={18} />
          <span>Open save</span>
          <input
            type="file"
            accept=".v3,.txt,.zip"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0]
              if (file) void handleFile(file)
            }}
          />
        </label>
      </section>

      <section className="workspace">
        <aside className="side">
          <nav className="panel navPanel" aria-label="Page navigation">
            <h2>Navigation</h2>
            <a href="#overview"><Database size={16} />Overview</a>
            <a href="#players"><Users size={16} />Players</a>
            <a href="#compare"><BarChart3 size={16} />Compare</a>
            <a href="#economy"><Wallet size={16} />Economy</a>
            <a href="#society"><BarChart3 size={16} />Society</a>
            <a href="#laws"><Gavel size={16} />Laws</a>
            <a href="#file"><FileArchive size={16} />File</a>
          </nav>

          <div className="panel playerList" id="players">
            <h2>Players</h2>
            {analysis?.players.length ? (
              analysis.players.map((player) => (
                <button
                  className={selectedCountry?.id === player.countryId ? 'playerRow active' : 'playerRow'}
                  key={`${player.countryId}-${player.name}`}
                  type="button"
                  onClick={() => setSelectedTag(player.countryTag)}
                >
                  <strong>{player.name}</strong>
                  <span>{player.countryName} ({player.countryTag})</span>
                </button>
              ))
            ) : (
              <p className="muted">No player countries loaded yet.</p>
            )}
          </div>
        </aside>

        <section className="mainPanel" id="overview">
          {!analysis && !isWorking && !error && (
            <div className="dropIntro">
              <Activity size={42} />
              <h2>Ready for a save file</h2>
              <p>Upload a `.v3` save to inspect countries, players, charts, and active laws.</p>
            </div>
          )}

          {isWorking && (
            <div className="dropIntro">
              <Activity className="spin" size={42} />
              <h2>Unpacking and reading the save...</h2>
              <p>Large campaign files can take a few seconds.</p>
            </div>
          )}

          {error && (
            <div className="notice danger">
              <AlertTriangle size={20} />
              <span>{error}</span>
            </div>
          )}

          {analysis && (
            <>
              <FormatSummary analysis={analysis} />

              {analysis.countries.length > 0 ? (
                <>
                  <div className="toolbar">
                    {analysis.extractedText && (
                      <button
                        className="textButton"
                        type="button"
                        onClick={() => {
                          if (analysis.extractedText) {
                            downloadText(analysis.fileName, analysis.extractedText)
                          }
                        }}
                        title="Download the extracted text gamestate"
                      >
                        <Download size={16} />
                        <span>gamestate.txt</span>
                      </button>
                    )}
                    <label>
                      Tag search
                      <input
                        className="tagSearchInput"
                        inputMode="text"
                        maxLength={3}
                        pattern="[A-Za-z]{3}"
                        placeholder="ITA"
                        title="Enter a 3-letter country tag"
                        value={countryTagSearch}
                        onChange={(event) => {
                          const next = event.target.value
                            .replace(/[^a-z]/gi, '')
                            .slice(0, 3)
                            .toUpperCase()
                          setCountryTagSearch(next)
                          if (next.length === 3) {
                            const match = analysis.countries.find(
                              (country) => country.tag.toUpperCase() === next,
                            )
                            if (match) setSelectedTag(match.tag)
                          }
                        }}
                      />
                    </label>
                    <label>
                      Country
                      <select
                        value={selectedCountry?.tag ?? ''}
                        onChange={(event) => setSelectedTag(event.target.value)}
                      >
                        {analysis.countries.map((country) => (
                          <option value={country.tag} key={`${country.id}-${country.tag}`}>
                            {country.name} ({country.tag})
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <AggregatePlayerChart
                    countries={analysis.countries}
                    metric={aggregateMetric}
                    metricKey={aggregateMetricKey}
                    limit={aggregateLimit}
                    onMetricChange={setAggregateMetricKey}
                    onLimitChange={setAggregateLimit}
                  />

                  {selectedCountry && (
                    <>
                      <KpiGrid country={selectedCountry} />
                      <CountryDetails country={selectedCountry} />
                      <section className="chartGrid" id="economy">
                        <SingleStatChart
                          data={chartData}
                          dataKey="gdp"
                          title="GDP"
                          stroke="#276749"
                          valueFormatter={formatCompact}
                        />
                        <SingleStatChart
                          data={chartData}
                          dataKey="population"
                          title="Population"
                          stroke="#9b2c2c"
                          valueFormatter={formatCompact}
                        />
                      </section>

                      <section className="chartGrid" id="society">
                        <SingleStatChart
                          data={chartData}
                          dataKey="sol"
                          title="Average SoL"
                          stroke="#805ad5"
                          valueFormatter={formatValue}
                        />
                        <SingleStatChart
                          data={chartData}
                          dataKey="literacy"
                          title="Literacy"
                          stroke="#2b6cb0"
                          valueFormatter={formatValue}
                        />
                        <SingleStatChart
                          data={chartData}
                          dataKey="prestige"
                          title="Prestige"
                          stroke="#b7791f"
                          valueFormatter={formatCompact}
                        />
                      </section>
                    </>
                  )}
                </>
              ) : (
                <div className="emptyState">
                  <h2>No readable country block found</h2>
                  <p>
                    If the format is `zip-binary`, the gamestate was extracted
                    but not converted to text. Run the app through the local server
                    so the converter can melt binary tokens first.
                  </p>
                </div>
              )}
            </>
          )}
        </section>
      </section>

      {analysis && (
        <WarningToasts
          warnings={analysis.warnings.filter((warning) => !dismissedWarnings.has(warning))}
          onDismiss={(warning) =>
            setDismissedWarnings((current) => {
              const next = new Set(current)
              next.add(warning)
              return next
            })
          }
        />
      )}
    </main>
  )
}

function FormatSummary({ analysis }: { analysis: AnalysisResult }) {
  return (
    <div className="summaryGrid" id="file">
      <Metric label="File" value={analysis.fileName} />
      <Metric label="Size" value={formatBytes(analysis.fileSize)} />
      <Metric label="Format" value={analysis.format} />
      <Metric label="Sources" value={analysis.sourceParts.join(', ') || 'direct file'} />
      <Metric label="Game Version" value={analysis.meta.version ?? 'n/a'} />
      <Metric label="Game Date" value={analysis.meta.game_date ?? 'n/a'} />
      <Metric label="Law Map" value={`${LAW_METADATA_COUNT}`} />
      <Metric label="Country Map" value={`${COUNTRY_LOCALIZATION_COUNT}`} />
      <Metric label="Tech Map" value={`${TECHNOLOGY_METADATA_COUNT}`} />
    </div>
  )
}

function WarningToasts({
  warnings,
  onDismiss,
}: {
  warnings: string[]
  onDismiss: (warning: string) => void
}) {
  if (!warnings.length) return null

  return (
    <div className="warningToasts" aria-live="polite">
      {warnings.map((warning) => (
        <div className="warningToast" key={warning}>
          <AlertTriangle size={17} />
          <span>{warning}</span>
          <button
            aria-label="Dismiss warning"
            className="toastClose"
            onClick={() => onDismiss(warning)}
            type="button"
          >
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  )
}

function KpiGrid({ country }: { country: CountrySummary }) {
  const latestGdp = last(country.gdp)
  const firstGdp = country.gdp[0]?.value
  const latestPopulation = last(country.population)
  const firstPopulation = country.population[0]?.value

  return (
    <div className="kpiGrid">
      <Metric label="Tag" value={country.tag} className="metricSpan2" />
      <Metric label="Player" value={country.playerName ?? 'AI / n/a'} className="metricSpan2" />
      <Metric label="GDP" value={formatCompact(latestGdp?.value)} delta={growth(firstGdp, latestGdp?.value)} />
      <Metric label="Pop" value={formatCompact(latestPopulation?.value)} delta={growth(firstPopulation, latestPopulation?.value)} />
      <Metric label="SoL" value={formatValue(last(country.sol)?.value)} />
      <Metric label="Literacy" value={formatPercent(last(country.literacy)?.value)} />
      <Metric label="Nat Revenue" value={formatCompact(last(country.nationalRevenue)?.value)} />
      <Metric label="Investment Pool Income" value={formatCompact(last(country.investmentPoolIncome)?.value)} />
      <Metric label="Weekly Balance" value={formatCompact(country.balance)} />
      <Metric label="Debt / Debt Cap" value={formatDebt(country)} />
      <Metric label="Radicals" value={formatCompact(country.radicals)} className="metricSpan2" />
      <Metric label="Loyalists" value={formatCompact(country.loyalists)} className="metricSpan2" />
    </div>
  )
}

function CountryDetails({ country }: { country: CountrySummary }) {
  const lawsByCategory = groupLawsByCategory(country.activeLaws)
  const interestGroupIcons = [
    'landowners',
    'industrialists',
    'armed_forces',
    'devout',
    'intelligensia',
    'petty_bourgeoisie',
    'rural_folk',
    'trade_unions',
  ]
  return (
    <div className="detailsGrid">
      <section className="detailPanel">
        <div className="chartHeader">
          <h2>Player</h2>
          <span>From player_manager.database</span>
        </div>
        <div className="playerBox">
          <strong>{country.playerName ?? 'AI / unassigned'}</strong>
          <span>
            Country id {country.id} - {country.name} ({country.tag})
          </span>
          <div className="igIconStrip" aria-hidden="true">
            {interestGroupIcons.map((icon) => (
              <img
                alt=""
                key={icon}
                src={`/vic3-assets/ig-icons/${icon}.png`}
                title={readableName(icon)}
              />
            ))}
          </div>
        </div>
      </section>

      <BudgetBreakdownPanel budget={country.budgetBreakdown} />
      <StateBreakdownPanel states={country.states} />
      <TechnologyPanel technologies={country.technologies} />

      <section className="detailPanel lawsPanel" id="laws">
        <div className="chartHeader">
          <h2>Active Laws</h2>
          <span>{country.activeLaws.length} laws</span>
        </div>
        {country.activeLaws.length ? (
          <div className="lawCategoryGrid">
            {lawsByCategory.map((category) => (
              <section className="lawCategory" key={category.category}>
                <h3>{category.category}</h3>
                {category.groups.map((group) => (
                  <div className="lawGroup" key={`${category.category}-${group.group}`}>
                    <span>{group.groupLabel}</span>
                    {group.laws.map((law) => (
                      <div className="lawItem" key={law.key} title={law.key}>
                        <img
                          alt=""
                          src={lawIconSrc(law.key)}
                          onError={(event) => {
                            event.currentTarget.src = '/vic3-assets/law-icons/placeholder.png'
                          }}
                        />
                        <strong>{law.label}</strong>
                      </div>
                    ))}
                  </div>
                ))}
              </section>
            ))}
          </div>
        ) : (
          <p className="muted">No active laws found for this country id.</p>
        )}
      </section>
    </div>
  )
}

const TECHNOLOGY_CATEGORIES: Array<{ key: TechnologyCategory; label: string }> = [
  { key: 'production', label: 'Production' },
  { key: 'military', label: 'Military' },
  { key: 'society', label: 'Society' },
]

function TechnologyPanel({ technologies }: { technologies: CountryTechnologies }) {
  const acquired = new Set(technologies.acquired)
  const researching = technologies.researchTechnology
    ? buildTechnologyItem(technologies.researchTechnology)
    : undefined
  const spreading = technologies.spreading.map(buildTechnologyItem)
  const totalKnown = technologies.acquired.length

  return (
    <section className="detailPanel techPanel" id="technology">
      <div className="chartHeader">
        <div>
          <h2>Technology</h2>
          <span>{totalKnown} researched technologies</span>
        </div>
        {researching ? (
          <div className="techResearchBadge">
            <span>Researching</span>
            <strong>{researching.label}</strong>
          </div>
        ) : null}
      </div>

      {spreading.length ? (
        <div className="techSpreadRow">
          <span>Spreading</span>
          {spreading.slice(0, 6).map((tech) => (
            <b key={tech.key}>{tech.label}</b>
          ))}
        </div>
      ) : null}

      {totalKnown ? (
        <div className="techCategoryGrid">
          {TECHNOLOGY_CATEGORIES.map((category) => (
            <TechnologyCategoryTree
              acquired={acquired}
              category={category.key}
              key={category.key}
              label={category.label}
              progress={technologies.progressed}
              researchQueue={technologies.researchQueue}
              researching={technologies.researchTechnology}
              spreading={technologies.spreading}
            />
          ))}
        </div>
      ) : (
        <p className="muted">No readable technology data found for this country.</p>
      )}
    </section>
  )
}

function TechnologyCategoryTree({
  acquired,
  category,
  label,
  progress,
  researchQueue,
  researching,
  spreading,
}: {
  acquired: Set<string>
  category: TechnologyCategory
  label: string
  progress: TechnologyProgress[]
  researchQueue: string[]
  researching?: string
  spreading: string[]
}) {
  const categoryTechs = Object.keys(TECHNOLOGY_METADATA)
    .filter((key) => TECHNOLOGY_METADATA[key].category === category)
    .sort(compareTechnologyKeys)
  const byEra = groupTechnologyByEra(categoryTechs)

  return (
    <section className={`techCategory techCategory-${category}`}>
      <div className="techCategoryHeader">
        <h3>{label}</h3>
        <span>{categoryTechs.length}</span>
      </div>
      <div className="techEraGrid">
        {byEra.map((era) => (
          <div className="techEraColumn" key={`${category}-${era.era}`}>
            <h4>{formatEra(era.era)}</h4>
            <div className="techTileList">
              {era.items.map((key) => (
                <TechnologyTile
                  isAcquired={acquired.has(key)}
                  isQueued={researchQueue.includes(key)}
                  isResearching={researching === key}
                  isSpreading={spreading.includes(key)}
                  key={key}
                  progress={progress.find((item) => item.key === key)?.progress}
                  techKey={key}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function TechnologyTile({
  techKey,
  isAcquired,
  isResearching,
  isQueued,
  isSpreading,
  progress,
}: {
  techKey: string
  isAcquired: boolean
  isResearching: boolean
  isQueued: boolean
  isSpreading: boolean
  progress?: number
}) {
  const tech = buildTechnologyItem(techKey)
  const stateLabel = isResearching
    ? 'Researching'
    : isQueued
      ? 'Queued'
      : isSpreading
        ? 'Spreading'
        : isAcquired
          ? 'Researched'
          : 'Known'

  return (
    <div
      className={`techTile ${isAcquired ? 'techTileAcquired' : 'techTileUnresearched'} ${
        isResearching ? 'techTileResearching' : ''
      } ${isSpreading ? 'techTileSpreading' : ''}`.trim()}
      title={techKey}
    >
      <img
        alt=""
        src={technologyIconSrc(tech.icon)}
        onError={(event) => {
          event.currentTarget.src = '/vic3-assets/tech-icons/placeholder.png'
        }}
      />
      <div>
        <strong>{tech.label}</strong>
        <span>{stateLabel}</span>
        {progress !== undefined && !isAcquired ? <small>{formatValue(progress)} progress</small> : null}
      </div>
    </div>
  )
}

function BudgetBreakdownPanel({ budget }: { budget: BudgetBreakdown }) {
  const maxValue = Math.max(
    ...budget.incomes.map((item) => item.value),
    ...budget.expenses.map((item) => item.value),
    1,
  )

  return (
    <section className="detailPanel budgetPanel">
      <div className="chartHeader">
        <h2>Budget Breakdown</h2>
        <span>
          Income {formatCompact(budget.totalIncome)} - Expenses {formatCompact(budget.totalExpenses)}
        </span>
      </div>
      <div className="budgetColumns">
        <BudgetColumn
          items={budget.incomes}
          maxValue={maxValue}
          title="Income"
          tone="income"
        />
        <BudgetColumn
          items={budget.expenses}
          maxValue={maxValue}
          title="Expenses"
          tone="expense"
        />
      </div>
    </section>
  )
}

function BudgetColumn({
  items,
  maxValue,
  title,
  tone,
}: {
  items: BudgetBreakdownItem[]
  maxValue: number
  title: string
  tone: 'income' | 'expense'
}) {
  const shown = items.slice(0, 8)

  return (
    <div className="budgetColumn">
      <h3>{title}</h3>
      {shown.length ? (
        shown.map((item) => (
          <div className="budgetRow" key={`${tone}-${item.key}`}>
            <div className="budgetRowTop">
              <span>{item.label}</span>
              <strong>{formatCompact(item.value)}</strong>
            </div>
            <div className="budgetTrack">
              <div
                className={`budgetBar ${tone}`}
                style={{ width: `${Math.max((item.value / maxValue) * 100, 2)}%` }}
              />
            </div>
          </div>
        ))
      ) : (
        <p className="muted">No detailed {title.toLowerCase()} entries found.</p>
      )}
    </div>
  )
}

function StateBreakdownPanel({ states }: { states: StateBreakdownEntry[] }) {
  const [sortMode, setSortMode] = useState<'gdp' | 'population'>('gdp')
  const [openStateId, setOpenStateId] = useState<string | null>(null)
  const sortedStates = useMemo(
    () =>
      [...states].sort((a, b) =>
        sortMode === 'gdp'
          ? b.economicOutput - a.economicOutput || b.population - a.population
          : b.population - a.population || b.economicOutput - a.economicOutput,
      ),
    [states, sortMode],
  )

  const maxValue = Math.max(
    ...sortedStates.map((state) =>
      sortMode === 'gdp' ? state.economicOutput : state.population,
    ),
    1,
  )

  return (
    <section className="detailPanel statePanel" id="states">
      <div className="chartHeader stateHeader">
        <div>
          <h2>State Breakdown</h2>
          <span>{states.length} states</span>
        </div>
        <label>
          Sort
          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as 'gdp' | 'population')}
          >
            <option value="gdp">Highest GDP</option>
            <option value="population">Highest Pops</option>
          </select>
        </label>
      </div>

      {sortedStates.length ? (
        <div className="stateList">
          {sortedStates.map((state) => {
            const value = sortMode === 'gdp' ? state.economicOutput : state.population
            const isOpen = openStateId === state.id
            return (
              <article className="stateRow" key={state.id}>
                <button
                  className="stateRowButton"
                  onClick={() => setOpenStateId(isOpen ? null : state.id)}
                  type="button"
                >
                  <span className="stateName">
                    <strong>{state.name}</strong>
                    <small>State {state.id}</small>
                  </span>
                  <span>{formatCompact(state.economicOutput)}</span>
                  <span>{formatCompact(state.population)}</span>
                  <b>{isOpen ? 'Close' : 'Open'}</b>
                </button>
                <div className="stateBarTrack">
                  <div
                    className="stateBar"
                    style={{ width: `${Math.max((value / maxValue) * 100, 2)}%` }}
                  />
                </div>
                {isOpen && <StateExpandedView state={state} />}
              </article>
            )
          })}
        </div>
      ) : (
        <p className="muted">No state data found for this country.</p>
      )}
    </section>
  )
}

function StateExpandedView({ state }: { state: StateBreakdownEntry }) {
  const professions = state.professions.slice(0, 10)
  const buildingSections = groupBuildingsBySection(state.buildings)

  return (
    <div className="stateExpanded">
      <div className="statePieBox">
        <h3>Pop Professions</h3>
        {professions.length ? (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={professions}
                dataKey="population"
                innerRadius={48}
                nameKey="label"
                outerRadius={82}
                paddingAngle={1}
              >
                {professions.map((entry, index) => (
                  <Cell
                    fill={PLAYER_COLORS[index % PLAYER_COLORS.length]}
                    key={entry.key}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCompact(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="muted">No pop professions found in this state.</p>
        )}
        <div className="professionLegend">
          {professions.map((profession, index) => (
            <span key={profession.key}>
              <i style={{ background: PLAYER_COLORS[index % PLAYER_COLORS.length] }} />
              {profession.label} {formatCompact(profession.population)}
            </span>
          ))}
        </div>
      </div>

      <div className="stateBuildingBox">
        <h3>Buildings by Size</h3>
        {state.buildings.length ? (
          buildingSections.map((section) => (
            <section className="buildingSection" key={section.title}>
              <div className="buildingSectionHeader">
                <span>{section.title}</span>
                <small>{section.items.length}</small>
              </div>
              <div className="buildingList">
                {section.items.slice(0, 28).map((building) => (
                  <div className="buildingRow" key={building.key}>
                    <img
                      alt=""
                      src={buildingIconSrc(building.buildingKey)}
                      onError={(event) => {
                        event.currentTarget.src = '/vic3-assets/building-icons/placeholder.png'
                      }}
                    />
                    <span>{building.label}</span>
                    <strong>Lv {formatValue(building.levels)}</strong>
                    <small>{formatCompact(building.economicOutput)}</small>
                  </div>
                ))}
              </div>
            </section>
          ))
        ) : (
          <p className="muted">No buildings found in this state.</p>
        )}
      </div>
    </div>
  )
}

function groupBuildingsBySection(buildings: StateBuilding[]): Array<{
  title: string
  items: StateBuilding[]
}> {
  const sections = [
    {
      title: 'Manufacturing',
      items: buildings.filter((building) => buildingSection(building.buildingKey) === 'manufacturing'),
    },
    {
      title: 'Extraction',
      items: buildings.filter((building) => buildingSection(building.buildingKey) === 'extraction'),
    },
    {
      title: 'Agriculture & Plantations',
      items: buildings.filter((building) => buildingSection(building.buildingKey) === 'agriculture'),
    },
    {
      title: 'Infrastructure & Services',
      items: buildings.filter((building) => buildingSection(building.buildingKey) === 'infrastructure'),
    },
    {
      title: 'Ownership & Subsistence',
      items: buildings.filter((building) => buildingSection(building.buildingKey) === 'ownership'),
    },
    {
      title: 'Military Infrastructure',
      items: buildings.filter((building) => buildingSection(building.buildingKey) === 'military'),
    },
  ]

  return sections.filter((section) => section.items.length > 0)
}

type BuildingSection = 'manufacturing' | 'extraction' | 'agriculture' | 'infrastructure' | 'ownership' | 'military'

function buildingSection(key: string): BuildingSection {
  if (
    key === 'building_manor_house' ||
    key === 'building_financial_district' ||
    key === 'building_company_headquarter' ||
    key === 'building_company_regional_headquarter' ||
    key.startsWith('building_subsistence_')
  ) {
    return 'ownership'
  }

  if (
    key.includes('barrack') ||
    key.includes('conscription') ||
    key.includes('naval_') ||
    key.includes('army_') ||
    key.includes('land_logistics') ||
    key.includes('military') ||
    key.includes('fortification') ||
    key.includes('supply_depot')
  ) {
    return 'military'
  }

  if (
    key.endsWith('_mine') ||
    key === 'building_gold_field' ||
    key === 'building_logging_camp' ||
    key === 'building_fishing_wharf' ||
    key === 'building_whaling_station' ||
    key === 'building_oil_rig' ||
    key === 'building_rubber_plantation'
  ) {
    return 'extraction'
  }

  if (
    key.endsWith('_farm') ||
    key.endsWith('_plantation') ||
    key === 'building_livestock_ranch' ||
    key === 'building_vineyard'
  ) {
    return 'agriculture'
  }

  if (
    key.includes('industry') ||
    key.includes('factory') ||
    key.includes('mill') ||
    key.includes('manufactory') ||
    key.includes('workshop') ||
    key.includes('plant') ||
    key === 'building_glassworks' ||
    key === 'building_shipyard' ||
    key === 'building_military_shipyards'
  ) {
    return 'manufacturing'
  }

  return 'infrastructure'
}

function buildingIconSrc(key: string): string {
  return `/vic3-assets/building-icons/${key}.png`
}

function AggregatePlayerChart({
  countries,
  metric,
  metricKey,
  limit,
  onMetricChange,
  onLimitChange,
}: {
  countries: CountrySummary[]
  metric: AggregateMetricConfig
  metricKey: AggregateMetricKey
  limit: AggregateLimit
  onMetricChange: (key: AggregateMetricKey) => void
  onLimitChange: (limit: AggregateLimit) => void
}) {
  const [disabledSeries, setDisabledSeries] = useState<Set<string>>(() => new Set())
  const playerCountries = useMemo(
    () => countries.filter((country) => country.playerName),
    [countries],
  )
  const rankedCountries = useMemo(
    () => {
      const ranked = rankCountriesForMetric(playerCountries, metric)
      return limit === 'all' ? ranked : ranked.slice(0, limit)
    },
    [playerCountries, metric, limit],
  )
  const coloredCountries = useMemo(
    () => rankedCountries.map((country, index) => ({
      country,
      color: PLAYER_COLORS[index % PLAYER_COLORS.length],
      seriesKey: seriesKey(country),
      value: getAggregateValue(country, metric.key),
    })),
    [rankedCountries, metric.key],
  )
  const activeCountries = useMemo(
    () => coloredCountries.filter((item) => !disabledSeries.has(item.seriesKey)),
    [coloredCountries, disabledSeries],
  )
  const lineRows = useMemo(
    () => metric.mode === 'trend'
      ? buildAggregateTrendRows(activeCountries, metric.key as TrendDataKey)
      : [],
    [activeCountries, metric],
  )
  const domain = useMemo(
    () => aggregateDomain(lineRows, activeCountries.map((item) => item.seriesKey)),
    [lineRows, activeCountries],
  )
  const xDomain = useMemo(
    () => yearDomain(lineRows),
    [lineRows],
  )
  const maxCurrent = Math.max(
    ...activeCountries.map((item) => Math.abs(item.value ?? 0)),
    1,
  )
  const toggleSeries = (key: string) => {
    setDisabledSeries((current) => {
      const next = new Set(current)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  return (
    <section className="aggregatePanel" id="compare">
      <div className="aggregateHeader">
        <div>
          <h2>Player Comparison</h2>
          <span>
            {metric.mode === 'trend'
              ? `${trendCoverageLabel(lineRows)} historical multi-line graph`
              : 'Current-only value bars'}
          </span>
        </div>
        <div className="aggregateControls">
          <label>
            Metric
            <select
              value={metricKey}
              onChange={(event) => onMetricChange(event.target.value as AggregateMetricKey)}
            >
              {AGGREGATE_METRICS.map((item) => (
                <option value={item.key} key={item.key}>{item.label}</option>
              ))}
            </select>
          </label>
          <label>
            Filter
            <select
              value={limit}
              onChange={(event) => {
                const value = event.target.value
                onLimitChange(value === 'all' ? 'all' : Number(value))
              }}
            >
              <option value="all">No filter</option>
              {[20, 10, 5, 3].map((item) => (
                <option value={item} key={item}>Top {item}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {coloredCountries.length ? (
        <div className="aggregateBody">
          <div className="aggregateGraph">
            {activeCountries.length === 0 ? (
              <div className="emptyGraphState">Select at least one country from the legend.</div>
            ) : metric.mode === 'trend' ? (
              <ResponsiveContainer width="100%" height={420}>
                <LineChart data={lineRows} margin={{ top: 12, right: 20, bottom: 8, left: 0 }}>
                  <CartesianGrid stroke="#d8dde4" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="year"
                    type="number"
                    domain={xDomain}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => String(Math.round(Number(value)))}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => metric.formatter(Number(value))}
                    width={74}
                    domain={domain}
                  />
                  <Tooltip
                    shared
                    trigger="hover"
                    cursor={{ stroke: '#6a7280', strokeDasharray: '4 4' }}
                    itemSorter={(item) => -Number(item.value ?? 0)}
                    formatter={(value, name) => [metric.formatter(Number(value)), name]}
                    labelFormatter={(value) => `Year ${Number(value).toFixed(2)}`}
                  />
                  {activeCountries.map((item) => (
                    <Line
                      connectNulls
                      dataKey={item.seriesKey}
                      dot={false}
                      key={item.seriesKey}
                      name={playerCountryLabel(item.country)}
                      stroke={item.color}
                      strokeWidth={2}
                      type="linear"
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="currentBars">
                {activeCountries.map((item) => {
                  const width = `${Math.max((Math.abs(item.value ?? 0) / maxCurrent) * 100, 2)}%`
                  return (
                    <div className="currentBarRow" key={item.seriesKey}>
                      <span>{item.country.tag}</span>
                      <div className="currentBarTrack">
                        <div
                          className={(item.value ?? 0) < 0 ? 'currentBar negative' : 'currentBar'}
                          style={{ background: item.color, width }}
                        />
                      </div>
                      <strong>{formatAggregateMetricValue(item.country, metricKey, item.value)}</strong>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <aside className="aggregateLegend" aria-label="Player comparison legend">
            {coloredCountries.map((item, index) => (
              <button
                aria-pressed={!disabledSeries.has(item.seriesKey)}
                className={`legendRow ${disabledSeries.has(item.seriesKey) ? 'legendRowDisabled' : ''}`.trim()}
                key={item.seriesKey}
                onClick={() => toggleSeries(item.seriesKey)}
                type="button"
                title={playerCountryLabel(item.country)}
              >
                <span className="legendRank">{index + 1}</span>
                <span className="legendSwatch" style={{ background: item.color }} />
                <span className="legendText">
                  <strong>{item.country.playerName}</strong>
                  <small>{item.country.name} ({item.country.tag})</small>
                </span>
                <b>{formatAggregateMetricValue(item.country, metricKey, item.value)}</b>
              </button>
            ))}
          </aside>
        </div>
      ) : (
        <p className="muted">No player-controlled countries available for comparison.</p>
      )}
    </section>
  )
}

function SingleStatChart({
  data,
  dataKey,
  title,
  stroke,
  valueFormatter,
}: {
  data: TrendPoint[]
  dataKey: TrendDataKey
  title: string
  stroke: string
  valueFormatter: (value?: number) => string
}) {
  const chartRows = data.filter((row) => row[dataKey] !== undefined)
  const samples = chartRows.length
  const domain = chartDomain(chartRows, [dataKey])
  const xDomain = yearDomain(chartRows)
  const firstYear = chartRows[0]?.year
  const lastYear = chartRows[chartRows.length - 1]?.year

  return (
    <div className="chartPanel">
      <div className="chartHeader">
        <h2>{title}</h2>
        <span>
          {samples} samples
          {firstYear && lastYear
            ? `, ${trendCoverageLabel(chartRows)}, ${firstYear.toFixed(1)}-${lastYear.toFixed(1)}`
            : ''}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartRows} margin={{ top: 12, right: 18, bottom: 8, left: 0 }}>
          <CartesianGrid stroke="#d8dde4" strokeDasharray="3 3" />
          <XAxis
            dataKey="year"
            type="number"
            domain={xDomain}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => String(Math.round(Number(value)))}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => valueFormatter(Number(value))}
            width={70}
            domain={domain}
          />
          <Tooltip
            shared
            trigger="hover"
            cursor={{ stroke: '#6a7280', strokeDasharray: '4 4' }}
            itemSorter={(item) => -Number(item.value ?? 0)}
            formatter={(value) => valueFormatter(Number(value))}
            labelFormatter={(value) => `Year ${Number(value).toFixed(2)}`}
          />
          <Line
            type="linear"
            dataKey={dataKey}
            name={title}
            stroke={stroke}
            strokeWidth={2.3}
            dot={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function Metric({
  label,
  value,
  delta,
  className = '',
}: {
  label: string
  value: string
  delta?: string
  className?: string
}) {
  return (
    <div className={`metric ${className}`.trim()}>
      <span>{label}</span>
      <strong>{value}</strong>
      {delta && <small>{delta}</small>}
    </div>
  )
}

function buildPlayerSummaries(countries: CountrySummary[]): PlayerSummary[] {
  return countries
    .filter((country) => country.playerName)
    .map((country) => ({
      name: country.playerName ?? '',
      countryId: country.id,
      countryTag: country.tag,
      countryName: country.name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

function groupLawsByCategory(laws: LawSummary[]): Array<{
  category: LawCategory
  groups: Array<{ group: string; groupLabel: string; laws: LawSummary[] }>
}> {
  const categoryOrder: LawCategory[] = ['Power Structure', 'Economy', 'Human Rights']
  return categoryOrder
    .map((category) => {
      const groupMap = new Map<string, { group: string; groupLabel: string; laws: LawSummary[] }>()
      for (const law of laws.filter((item) => item.category === category)) {
        const group =
          groupMap.get(law.group) ??
          { group: law.group, groupLabel: law.groupLabel, laws: [] }
        group.laws.push(law)
        groupMap.set(law.group, group)
      }
      return {
        category,
        groups: Array.from(groupMap.values()).sort((a, b) =>
          a.groupLabel.localeCompare(b.groupLabel),
        ),
      }
    })
    .filter((category) => category.groups.length > 0)
}

function rankCountriesForMetric(
  countries: CountrySummary[],
  metric: AggregateMetricConfig,
): CountrySummary[] {
  return [...countries]
    .filter((country) => getAggregateValue(country, metric.key) !== undefined)
    .sort((a, b) => (getAggregateValue(b, metric.key) ?? 0) - (getAggregateValue(a, metric.key) ?? 0))
}

function buildAggregateTrendRows(
  countries: Array<{ country: CountrySummary; seriesKey: string }>,
  key: TrendDataKey,
): Array<Record<string, number | string>> {
  const rows = new Map<string, Record<string, number | string>>()
  for (const item of countries) {
    for (const point of getCountryTrend(item.country, key)) {
      const row =
        rows.get(point.date) ??
        {
          date: point.date,
          year: point.year,
        }
      row[item.seriesKey] = point.value
      rows.set(point.date, row)
    }
  }
  return Array.from(rows.values()).sort((a, b) => Number(a.year) - Number(b.year))
}

function aggregateDomain(
  rows: Array<Record<string, number | string>>,
  keys: string[],
): [number, number] {
  const values = rows.flatMap((row) =>
    keys
      .map((key) => Number(row[key]))
      .filter((value) => Number.isFinite(value)),
  )
  if (!values.length) return [0, 1]

  const minValue = Math.min(0, ...values)
  const maxValue = Math.max(...values)
  const range = maxValue - minValue
  const padding = Math.max(range * 0.18, Math.abs(maxValue) * 0.08, 1)

  return [minValue < 0 ? minValue - padding : 0, maxValue + padding]
}

function yearDomain(rows: Array<{ year?: number | string }>): [number, number] {
  const years = rows
    .map((row) => Number(row.year))
    .filter((value) => Number.isFinite(value))
  if (!years.length) return [VIC3_START_YEAR, VIC3_START_YEAR + 1]

  const minYear = Math.min(VIC3_START_YEAR, ...years)
  const maxYear = Math.max(...years)
  const range = maxYear - minYear
  const padding = range > 0 ? Math.max(range * 0.015, 0.15) : 0.5
  return [Math.max(VIC3_START_YEAR, minYear - padding), maxYear + padding]
}

function trendCoverageLabel(rows: Array<{ year?: number | string }>): string {
  const years = rows
    .map((row) => Number(row.year))
    .filter((value) => Number.isFinite(value))
  if (!years.length) return 'no saved samples'

  const firstYear = Math.min(...years)
  return firstYear > VIC3_START_YEAR + 0.25
    ? `saved from ${firstYear.toFixed(1)}`
    : `saved from ${VIC3_START_YEAR}`
}

function getAggregateValue(country: CountrySummary, key: AggregateMetricKey): number | undefined {
  if (key === 'balance') return country.balance
  if (key === 'money') return country.money
  if (key === 'credit') return country.debt
  if (key === 'radicals') return country.radicals
  if (key === 'loyalists') return country.loyalists
  return last(getCountryTrend(country, key))?.value
}

function formatAggregateMetricValue(
  country: CountrySummary,
  key: AggregateMetricKey,
  value?: number,
): string {
  if (key === 'credit') return formatDebt(country)
  return formatCompact(value)
}

function getCountryTrend(country: CountrySummary, key: TrendDataKey): DatedValue[] {
  if (key === 'gdp') return country.gdp
  if (key === 'population') return country.population
  if (key === 'literacy') {
    return country.literacy.map((point) => ({ ...point, value: point.value * 100 }))
  }
  if (key === 'sol') return country.sol
  if (key === 'prestige') return country.prestige
  if (key === 'investmentPoolIncome') return country.investmentPoolIncome
  return country.nationalRevenue
}

function seriesKey(country: CountrySummary): string {
  return `country_${country.id.replace(/\W/g, '_')}`
}

function playerCountryLabel(country: CountrySummary): string {
  return `${country.playerName ?? 'AI'} - ${country.name} (${country.tag})`
}

async function analyzeSaveFile(file: File): Promise<AnalysisResult> {
  let bytes = new Uint8Array(await file.arrayBuffer())
  let unpacked = unpackSave(bytes)
  let meta = unpacked.metaText ? parseMeta(unpacked.metaText) : parseMeta(unpacked.text ?? '')
  const warnings = [...unpacked.warnings]

  if (!unpacked.text) {
    if (unpacked.format === 'zip-binary') {
      try {
        const convertedText = await convertBinarySave(file)
        bytes = new TextEncoder().encode(convertedText)
        unpacked = {
          format: 'zip-text',
          text: convertedText,
          metaText: unpacked.metaText,
          warnings: [],
          sourceParts: [...unpacked.sourceParts, 'rakaly-melt'],
        }
        meta = unpacked.metaText ? parseMeta(unpacked.metaText) : parseMeta(convertedText)
        warnings.push('Binary save converted automatically through the local rakaly server.')
      } catch (err) {
        warnings.push(
          err instanceof Error
            ? err.message
            : 'Automatic conversion failed. Run the site with local-server.cjs so the binary converter is available.',
        )
      }
    }
  }

  if (!unpacked.text) {
    return {
      fileName: file.name,
      fileSize: file.size,
      format: unpacked.format,
      meta,
      countries: [],
      players: [],
      warnings,
      sourceParts: unpacked.sourceParts,
    }
  }

  const playerNamesByCountry = parsePlayerNames(unpacked.text)
  const activeLawsByCountry = parseActiveLaws(unpacked.text)
  const technologiesByCountry = parseTechnologies(unpacked.text)
  const stateBreakdowns = parseStateBreakdowns(unpacked.text)
  const countries = parseCountries(
    unpacked.text,
    playerNamesByCountry,
    activeLawsByCountry,
    technologiesByCountry,
    stateBreakdowns,
  )
  if (countries.length === 0) {
    warnings.push('The extracted text does not contain a readable country_manager.database block.')
  }
  const players = buildPlayerSummaries(countries)

  return {
    fileName: file.name,
    fileSize: file.size,
    format: unpacked.format,
    meta,
    countries,
    players,
    warnings,
    extractedText: unpacked.text,
    sourceParts: unpacked.sourceParts,
  }
}

function unpackSave(bytes: Uint8Array): {
  format: SaveFormat
  text?: string
  metaText?: string
  warnings: string[]
  sourceParts: string[]
} {
  const warnings: string[] = []
  const sourceParts: string[] = []
  const zipOffset = findZipOffset(bytes)

  if (zipOffset >= 0) {
    const archiveBytes = bytes.slice(zipOffset)
    const archive = unzipSync(archiveBytes)
    const gamestateEntry = archive.gamestate ?? archive['gamestate.txt']
    const metaEntry = archive.meta ?? archive['meta.txt']
    const metaText = metaEntry ? decoder.decode(metaEntry) : undefined
    sourceParts.push(...Object.keys(archive))

    if (!gamestateEntry) {
      warnings.push('Valid zip archive, but no gamestate entry was found.')
      return { format: 'unknown', metaText, warnings, sourceParts }
    }

    if (!looksLikeText(gamestateEntry)) {
      warnings.push(
        'Binary gamestate extracted from the zip: attempting automatic conversion through the local server.',
      )
      return { format: 'zip-binary', metaText, warnings, sourceParts }
    }

    return {
      format: 'zip-text',
      text: decoder.decode(gamestateEntry),
      metaText,
      warnings,
      sourceParts,
    }
  }

  if (looksLikeText(bytes)) {
    return {
      format: 'text',
      text: decoder.decode(bytes),
      warnings,
      sourceParts,
    }
  }

  warnings.push('Unknown format: the file does not look like plain text or an embedded zip archive.')
  return { format: 'unknown', warnings, sourceParts }
}

function parseStateBreakdowns(text: string): Map<string, StateBreakdownEntry> {
  const states = parseStateBasics(text)
  const professionsByState = parseProfessionsByState(text)
  const buildingsByState = parseBuildingsByState(text)
  const ids = new Set([
    ...states.keys(),
    ...professionsByState.keys(),
    ...buildingsByState.keys(),
  ])
  const result = new Map<string, StateBreakdownEntry>()

  for (const id of ids) {
    const state = states.get(id)
    const professions = professionsByState.get(id) ?? []
    const buildings = buildingsByState.get(id) ?? []
    const population = professions.reduce((sum, profession) => sum + profession.population, 0)
    const economicOutput = buildings.reduce((sum, building) => sum + building.economicOutput, 0)

    result.set(id, {
      id,
      name: state?.region ? readableName(state.region) : `State ${id}`,
      population,
      economicOutput,
      professions,
      buildings,
    })
  }

  return result
}

function parseStateBasics(text: string): Map<string, { region?: string }> {
  const database = findSectionDatabase(text, 'states')
  const states = new Map<string, { region?: string }>()
  if (!database) return states

  for (const entry of iterateDatabaseBlocks(text, database.open, database.close)) {
    states.set(entry.id, { region: getValue(entry.block, 'region') })
  }

  return states
}

function parseProfessionsByState(text: string): Map<string, StateProfession[]> {
  const database = findSectionDatabase(text, 'pops')
  const byState = new Map<string, Map<string, StateProfession>>()
  if (!database) return new Map()

  forEachDatabaseBlock(text, database.open, database.close, (entry) => {
    const stateId = getBareValue(entry.block, 'location')
    const professionKey = getValue(entry.block, 'type')
    if (!stateId || !professionKey) return
    const workforce = getNumberValue(entry.block, 'workforce') ?? 0
    const dependents = getNumberValue(entry.block, 'dependents') ?? 0
    const population = workforce + dependents
    if (population <= 0) return

    const stateMap = byState.get(stateId) ?? new Map<string, StateProfession>()
    const current =
      stateMap.get(professionKey) ?? {
        key: professionKey,
        label: readableName(professionKey),
        population: 0,
      }
    current.population += population
    stateMap.set(professionKey, current)
    byState.set(stateId, stateMap)
  })

  return new Map(
    [...byState.entries()].map(([stateId, professions]) => [
      stateId,
      [...professions.values()].sort((a, b) => b.population - a.population),
    ]),
  )
}

function parseBuildingsByState(text: string): Map<string, StateBuilding[]> {
  const database = findSectionDatabase(text, 'building_manager')
  const byState = new Map<string, StateBuilding[]>()
  if (!database) return byState

  forEachDatabaseBlock(text, database.open, database.close, (entry) => {
    const stateId = getBareValue(entry.block, 'state')
    const buildingKey = getValue(entry.block, 'building')
    if (!stateId || !buildingKey) return

    const building: StateBuilding = {
      key: `${entry.id}-${buildingKey}`,
      buildingKey,
      label: readableName(buildingKey.replace(/^building_/, '')),
      levels: getNumberValue(entry.block, 'levels') ?? getNumberValue(entry.block, 'staffing') ?? 0,
      staffing: getNumberValue(entry.block, 'staffing'),
      economicOutput: buildingEconomicOutput(entry.block),
    }
    const buildings = byState.get(stateId) ?? []
    buildings.push(building)
    byState.set(stateId, buildings)
  })

  for (const [stateId, buildings] of byState) {
    byState.set(
      stateId,
      buildings.sort((a, b) => b.levels - a.levels || b.economicOutput - a.economicOutput),
    )
  }

  return byState
}

function buildingEconomicOutput(block: string): number {
  const keys = [
    'goods_cost',
    'trade_revenue',
    'income_taxes',
    'dividends_taxes',
    'government_dividends',
    'other_building_dividends',
    'profit_after_investments',
    'profit_after_reserves',
  ]
  return keys
    .map((key) => getNumberValue(block, key) ?? 0)
    .filter((value) => value > 0)
    .reduce((sum, value) => sum + value, 0)
}

async function convertBinarySave(file: File): Promise<string> {
  const response = await fetch('/api/convert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'X-File-Name': encodeURIComponent(file.name),
    },
    body: file,
  })

  if (!response.ok) {
    const message = await response.text().catch(() => '')
    throw new Error(
      message ||
        'Automatic conversion is not available. Run the site with local-server.cjs instead of python -m http.server.',
    )
  }

  return response.text()
}

function parseCountries(
  text: string,
  playerNamesByCountry: Map<string, string>,
  activeLawsByCountry: Map<string, LawSummary[]>,
  technologiesByCountry: Map<string, CountryTechnologies>,
  stateBreakdowns: Map<string, StateBreakdownEntry>,
): CountrySummary[] {
  const database = findSectionDatabase(text, 'country_manager')
  if (!database) return []

  const countries: CountrySummary[] = []
  const seenStarts = new Set<number>()
  const definitionRegex = /definition=(?:"([^"]+)"|([^\s{}"]+))/g
  definitionRegex.lastIndex = database.open

  while (definitionRegex.lastIndex < database.close) {
    const definitionMatch = definitionRegex.exec(text)
    if (!definitionMatch || definitionMatch.index > database.close) break

    const headerMatch = findCountryHeaderBefore(text, definitionMatch.index)
    if (!headerMatch) continue
    const { countryStart, id } = headerMatch
    if (seenStarts.has(countryStart)) continue

    const openIndex = text.indexOf('{', countryStart)
    const closeIndex = findMatchingBrace(text, openIndex)
    if (closeIndex <= openIndex || closeIndex > database.close) continue

    seenStarts.add(countryStart)
    const earlyBlock = text.slice(openIndex + 1, Math.min(closeIndex, openIndex + 1800))
    const tag = getValue(earlyBlock, 'definition')
    if (tag) {
      const block = text.slice(openIndex + 1, closeIndex)
      countries.push(
        parseCountryBlock(
          id,
          tag,
          block,
          playerNamesByCountry.get(id),
          activeLawsByCountry.get(id) ?? [],
          technologiesByCountry.get(id) ?? emptyCountryTechnologies(),
          stateBreakdowns,
        ),
      )
    }

    definitionRegex.lastIndex = closeIndex
  }

  return countries.sort((a, b) => {
    const gdpDiff = (last(b.gdp)?.value ?? 0) - (last(a.gdp)?.value ?? 0)
    return gdpDiff || a.tag.localeCompare(b.tag)
  })
}

function findCountryHeaderBefore(
  text: string,
  fromIndex: number,
): { countryStart: number; id: string } | undefined {
  let lineEnd = text.lastIndexOf('\n', fromIndex)
  for (let line = 0; line < 8 && lineEnd > 0; line += 1) {
    const lineStart = text.lastIndexOf('\n', lineEnd - 1)
    const header = text.slice(lineStart + 1, lineEnd).trim()
    const idMatch = /^(\d+)=\{$/.exec(header)
    if (idMatch) {
      return { countryStart: lineStart, id: idMatch[1] }
    }
    lineEnd = lineStart
  }
  return undefined
}

function parseCountryBlock(
  id: string,
  tag: string,
  block: string,
  playerName: string | undefined,
  activeLaws: LawSummary[],
  technologies: CountryTechnologies,
  stateBreakdowns: Map<string, StateBreakdownEntry>,
): CountrySummary {
  const dynamicName =
    getValue(block, 'dynamic_country_name')
  const name = localizeCountry(dynamicName, tag)
  const balanceSamples = getWeeklySamples(block, 'balance_trend')
  const moneySamples = getWeeklySamples(block, 'money_trend')
  const currentYear = getCurrentYear(block)
  const nationalRevenue =
    getNestedNumberValue(block, ['budget', 'country_building_budget'], 'income') ??
    sumBudgetVector(block, 'weekly_income')
  const investmentPoolIncome = sumNestedValues(block, 'investment')
  const budgetBreakdown = parseBudgetBreakdown(block)
  const money = getNumberValue(block, 'money') ?? last(moneySamples)
  const debt =
    getNumberValue(block, 'principal') ??
    currentDebtFromMoneyTrend(block) ??
    (money !== undefined ? Math.max(-money, 0) : undefined)

  return {
    id,
    tag,
    name,
    playerName,
    rank: getBareValue(block, 'rank'),
    taxLevel: getBareValue(block, 'tax_level'),
    countryType: getValue(block, 'country_type'),
    activeLaws,
    technologies,
    gdp: getTrendValues(block, 'gdp'),
    population: getTrendValues(block, 'trend_population'),
    literacy: getTrendValues(block, 'literacy'),
    sol: getTrendValues(block, 'avgsoltrend'),
    prestige: getTrendValues(block, 'prestige'),
    investmentPoolIncome: makeCurrentSeries(currentYear, investmentPoolIncome),
    nationalRevenue: makeCurrentSeries(currentYear, nationalRevenue),
    budgetBreakdown,
    states: parseCountryStates(block, stateBreakdowns),
    money,
    balance: last(balanceSamples),
    debt,
    credit: getNumberValue(block, 'credit'),
    radicals: getNumberValue(block, 'population_radicals'),
    loyalists: getNumberValue(block, 'population_loyalists'),
    lowerStrata: getNumberValue(block, 'population_lower_strata'),
    middleStrata: getNumberValue(block, 'population_middle_strata'),
    upperStrata: getNumberValue(block, 'population_upper_strata'),
  }
}

function parsePlayerNames(text: string): Map<string, string> {
  const players = new Map<string, string>()
  const database = findSectionDatabase(text, 'player_manager')
  if (!database) return players

  for (const entry of iterateDatabaseBlocks(text, database.open, database.close)) {
    const user = getValue(entry.block, 'user')
    const countryId = getBareValue(entry.block, 'country')
    if (user && countryId) {
      players.set(countryId, user)
    }
  }
  return players
}

function parseActiveLaws(text: string): Map<string, LawSummary[]> {
  const lawsByCountry = new Map<string, LawSummary[]>()
  const database = findSectionDatabase(text, 'laws')
  if (!database) return lawsByCountry

  for (const entry of iterateDatabaseBlocks(text, database.open, database.close)) {
    if (/\bactive=yes\b/.test(entry.block)) {
      const lawKey = getValue(entry.block, 'law')
      const countryId = getBareValue(entry.block, 'country')
      if (lawKey && countryId) {
        const laws = lawsByCountry.get(countryId) ?? []
        laws.push(buildLawSummary(lawKey))
        lawsByCountry.set(countryId, laws)
      }
    }
  }

  return lawsByCountry
}

function parseTechnologies(text: string): Map<string, CountryTechnologies> {
  const technologiesByCountry = new Map<string, CountryTechnologies>()
  const database = findSectionDatabase(text, 'technology')
  if (!database) return technologiesByCountry

  for (const entry of iterateDatabaseBlocks(text, database.open, database.close)) {
    const countryId = getBareValue(entry.block, 'country')
    if (!countryId) continue

    technologiesByCountry.set(countryId, {
      acquired: getQuotedList(entry.block, 'acquired_technologies'),
      researchTechnology: getValue(entry.block, 'research_technology'),
      researchQueue: getQuotedList(entry.block, 'research_queue'),
      progressed: parseTechnologyProgress(entry.block),
      spreading: getQuotedList(entry.block, 'currently_spreading_technologies'),
    })
  }

  return technologiesByCountry
}

function parseTechnologyProgress(block: string): TechnologyProgress[] {
  const progressBlock = getKeyBlock(block, 'progressed_technologies')
  if (!progressBlock) return []

  const progress: TechnologyProgress[] = []
  const techRegex = /technology=(?:"([^"]+)"|([^\s{}"]+))/g
  while (techRegex.lastIndex < progressBlock.length) {
    const match = techRegex.exec(progressBlock)
    if (!match) break
    const itemStart = progressBlock.lastIndexOf('{', match.index)
    const itemClose = itemStart >= 0 ? findMatchingBrace(progressBlock, itemStart) : -1
    const itemBlock =
      itemStart >= 0 && itemClose > itemStart
        ? progressBlock.slice(itemStart + 1, itemClose)
        : progressBlock.slice(match.index, Math.min(progressBlock.length, match.index + 260))
    const key = match[1] ?? match[2]
    progress.push({
      key,
      label: buildTechnologyItem(key).label,
      progress: getNumberValue(itemBlock, 'progress'),
      isResearched: getBareValue(itemBlock, 'is_researched') === 'yes',
    })
    techRegex.lastIndex = itemClose > match.index ? itemClose : match.index + match[0].length
  }

  return progress
}

function getQuotedList(block: string, key: string): string[] {
  const listBlock = getKeyBlock(block, key)
  if (!listBlock) return []
  const quoted = [...listBlock.matchAll(/"([^"]+)"/g)].map((match) => match[1])
  if (quoted.length > 0) return quoted
  return listBlock
    .trim()
    .split(/\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0 && item !== '{' && item !== '}')
}

function emptyCountryTechnologies(): CountryTechnologies {
  return {
    acquired: [],
    researchQueue: [],
    progressed: [],
    spreading: [],
  }
}

function localizeCountry(dynamicName: string | undefined, tag: string): string {
  if (dynamicName && COUNTRY_LOCALIZATION[dynamicName]) {
    return COUNTRY_LOCALIZATION[dynamicName]
  }
  return COUNTRY_LOCALIZATION[tag] ?? readableName(dynamicName ?? tag)
}

function lawIconSrc(key: string): string {
  return `/vic3-assets/law-icons/${lawIconKey(key)}.png`
}

const LAW_ICON_OVERRIDES: Record<string, string> = {
  law_latifundias: 'tenant_farmers',
  law_expanded_latifundias: 'tenant_farmers',
  law_commercialized_agriculture: 'commercial_agriculture',
  law_peasant_proprietorship: 'freeholders',
  law_homesteading: 'freeholders',
  law_merchant_navy: 'merchant_fleet',
  law_jeune_ecole: 'torpedos',
  law_professional_navy: 'ocean_domination',
  law_diplomatic_navy: 'diplomatic_interest',
}

function lawIconKey(key: string): string {
  return LAW_ICON_OVERRIDES[key] ?? key.replace(/^law_/, '')
}

function technologyIconSrc(icon: string): string {
  return `/vic3-assets/tech-icons/${icon}.png`
}

function buildLawSummary(key: string): LawSummary {
  const metadata = LAW_METADATA[key]
  return {
    key,
    label: metadata?.label ?? readableName(key.replace(/^law_/, '')),
    group: metadata?.group ?? 'lawgroup_unknown',
    groupLabel: metadata?.groupLabel ?? 'Unknown',
    category: metadata?.category ?? 'Human Rights',
  }
}

function buildTechnologyItem(key: string): {
  key: string
  label: string
  category: TechnologyCategory
  era: string
  icon: string
} {
  const metadata = TECHNOLOGY_METADATA[key]
  return {
    key,
    label: metadata?.label ?? readableName(key),
    category: metadata?.category ?? 'society',
    era: metadata?.era ?? 'era_1',
    icon: metadata?.icon ?? key,
  }
}

function compareTechnologyKeys(a: string, b: string): number {
  const techA = buildTechnologyItem(a)
  const techB = buildTechnologyItem(b)
  return eraRank(techA.era) - eraRank(techB.era) || techA.label.localeCompare(techB.label)
}

function groupTechnologyByEra(keys: string[]): Array<{ era: string; items: string[] }> {
  const byEra = new Map<string, string[]>()
  for (const key of keys) {
    const era = buildTechnologyItem(key).era
    const items = byEra.get(era) ?? []
    items.push(key)
    byEra.set(era, items)
  }
  return Array.from(byEra.entries())
    .sort(([eraA], [eraB]) => eraRank(eraA) - eraRank(eraB))
    .map(([era, items]) => ({ era, items }))
}

function eraRank(era: string): number {
  return Number(/\d+/.exec(era)?.[0] ?? 99)
}

function formatEra(era: string): string {
  const rank = eraRank(era)
  return Number.isFinite(rank) && rank < 99 ? `Era ${rank}` : readableName(era)
}

function getTrendValues(block: string, key: string): DatedValue[] {
  const keyIndex = block.indexOf(`${key}={`)
  if (keyIndex < 0) return []
  const open = block.indexOf('{', keyIndex)
  const close = findMatchingBrace(block, open)
  if (close < 0) return []
  const trendBlock = block.slice(open + 1, close)
  const date = getBareValue(trendBlock, 'date')
  const index = getNumberValue(trendBlock, 'index')
  const sampleRate = getNumberValue(trendBlock, 'sample_rate')
  const valuesMatch = /values=\{\s*([^}]*)\}/.exec(trendBlock)
  if (!valuesMatch) return []
  const values = valuesMatch[1]
    .trim()
    .split(/\s+/)
    .map(Number)
    .filter((value) => Number.isFinite(value))

  if (!date) {
    return values.map((value, idx) => ({
      date: `${idx + 1}`,
      year: idx + 1,
      value,
    }))
  }

  const orderedValues = rotateRingValues(values, index)
  const end = parseVic3Date(date)
  const sampledDates = buildSampleDates(end, orderedValues.length, sampleRate)
  const endYear = Math.max(decimalYear(end), VIC3_START_YEAR)
  const fallbackSpan = endYear - VIC3_START_YEAR
  return orderedValues.map((value, idx) => {
    const sampledDate = sampledDates[idx]
    const sampledYear = sampledDate ? decimalYear(sampledDate) : undefined
    const year = sampledYear
      ? Math.max(sampledYear, VIC3_START_YEAR)
      : orderedValues.length <= 1
        ? endYear
        : VIC3_START_YEAR + (fallbackSpan * idx) / (orderedValues.length - 1)
    return {
      date: year.toFixed(4),
      year,
      value,
    }
  })
}

function getWeeklySamples(block: string, key: string): number[] {
  const keyIndex = block.indexOf(`${key}={`)
  if (keyIndex < 0) return []
  const open = block.indexOf('{', keyIndex)
  const close = findMatchingBrace(block, open)
  if (close < 0) return []
  const trendBlock = block.slice(open + 1, close)
  const samplesMatch = /samples=\{\s*([^}]*)\}/.exec(trendBlock)
  if (!samplesMatch) return []
  return samplesMatch[1]
    .trim()
    .split(/\s+/)
    .map(Number)
    .filter((value) => Number.isFinite(value) && value !== 0)
}

function currentDebtFromMoneyTrend(block: string): number | undefined {
  const moneyTrend = getKeyBlock(block, 'money_trend')
  if (!moneyTrend) return undefined
  const current = getNumberValue(moneyTrend, 'current')
  if (current === undefined || current >= 0) return undefined
  return Math.abs(current)
}

function getCurrentYear(block: string): number {
  for (const key of ['gdp', 'trend_population', 'money_trend', 'balance_trend']) {
    const date = getTrendDate(block, key)
    if (date) return decimalYear(parseVic3Date(date))
  }
  return VIC3_START_YEAR
}

function getTrendDate(block: string, key: string): string | undefined {
  const trendBlock = getKeyBlock(block, key)
  if (!trendBlock) return undefined
  return (
    getBareValue(trendBlock, 'date') ??
    getBareValue(trendBlock, 'latest_sample')
  )
}

function makeCurrentSeries(year: number, value: number | undefined): DatedValue[] {
  if (value === undefined || Number.isNaN(value)) return []
  return [{
    date: year.toFixed(4),
    year,
    value,
  }]
}

function parseBudgetBreakdown(block: string): BudgetBreakdown {
  const countryBuildingBudget = getNestedBlock(block, ['budget', 'country_building_budget'])
  if (!countryBuildingBudget) {
    return { incomes: [], expenses: [] }
  }

  return {
    totalIncome: getNumberValue(countryBuildingBudget, 'income'),
    totalExpenses: getNumberValue(countryBuildingBudget, 'expense'),
    incomes: collectBudgetItems(countryBuildingBudget, 'incomes'),
    expenses: collectBudgetItems(countryBuildingBudget, 'expenses'),
  }
}

function parseCountryStates(
  block: string,
  stateBreakdowns: Map<string, StateBreakdownEntry>,
): StateBreakdownEntry[] {
  const statesBlock = getKeyBlock(block, 'states')
  if (!statesBlock) return []
  const ids = statesBlock.match(/\d+/g) ?? []

  return ids
    .map((id) => stateBreakdowns.get(id))
    .filter((state): state is StateBreakdownEntry => Boolean(state))
    .sort((a, b) => b.economicOutput - a.economicOutput || b.population - a.population)
}

function collectBudgetItems(block: string, key: string): BudgetBreakdownItem[] {
  const section = getKeyBlock(block, key)
  if (!section) return []

  return iterateNamedBlocks(section)
    .map((entry) => ({
      key: entry.key,
      label: readableName(entry.key),
      value: sumValuesBlock(entry.block),
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
}

function iterateNamedBlocks(block: string): Array<{ key: string; block: string }> {
  const entries: Array<{ key: string; block: string }> = []
  const regex = /(^|\n)\s*([A-Za-z0-9_]+)=\{/g

  while (regex.lastIndex < block.length) {
    const match = regex.exec(block)
    if (!match) break
    const open = block.indexOf('{', match.index)
    const close = findMatchingBrace(block, open)
    if (close < 0) {
      regex.lastIndex = match.index + 1
      continue
    }
    entries.push({ key: match[2], block: block.slice(open + 1, close) })
    regex.lastIndex = close
  }

  return entries
}

function sumValuesBlock(block: string): number {
  const valuesBlock = getKeyBlock(block, 'values') ?? block
  return [...valuesBlock.matchAll(/=\s*(-?\d+(?:\.\d+)?)/g)]
    .map((match) => Number(match[1]))
    .filter((value) => Number.isFinite(value) && value > 0)
    .reduce((sum, value) => sum + value, 0)
}

function getNestedBlock(block: string, path: string[]): string | undefined {
  let current: string | undefined = block
  for (const part of path) {
    current = getKeyBlock(current, part)
    if (!current) return undefined
  }
  return current
}

function getNestedNumberValue(
  block: string,
  path: string[],
  key: string,
): number | undefined {
  const current = getNestedBlock(block, path)
  if (!current) return undefined
  return getNumberValue(current, key)
}

function sumNestedValues(block: string, key: string): number | undefined {
  const nested = getKeyBlock(block, key)
  if (!nested) return undefined
  const values = [...nested.matchAll(/=\s*(-?\d+(?:\.\d+)?)/g)]
    .map((match) => Number(match[1]))
    .filter(Number.isFinite)
  if (!values.length) return undefined
  return values.reduce((sum, value) => sum + value, 0)
}

function sumBudgetVector(block: string, key: string): number | undefined {
  const nested = getKeyBlock(block, key)
  if (!nested) return undefined
  const values = nested
    .trim()
    .split(/\s+/)
    .map(Number)
    .filter(Number.isFinite)
  if (!values.length) return undefined
  return values.reduce((sum, value) => sum + value, 0)
}

function getKeyBlock(block: string, key: string): string | undefined {
  const match = new RegExp(`(^|\\n)\\s*${escapeRegExp(key)}=\\{`).exec(block)
  if (!match) return undefined
  const open = block.indexOf('{', match.index)
  const close = findMatchingBrace(block, open)
  if (close < 0) return undefined
  return block.slice(open + 1, close)
}

function parseMeta(text: string): Record<string, string> {
  const meta: Record<string, string> = {}
  for (const key of ['version', 'game_date', 'real_date', 'name', 'rank']) {
    const value = getStringValue(text, key) ?? getBareValue(text, key)
    if (value) meta[key] = value
  }
  return meta
}

function buildChartData(country: CountrySummary | null): TrendPoint[] {
  if (!country) return []
  const rows = new Map<string, TrendPoint>()
  mergeTrend(rows, country.gdp, 'gdp')
  mergeTrend(rows, country.nationalRevenue, 'nationalRevenue')
  mergeTrend(rows, country.investmentPoolIncome, 'investmentPoolIncome')
  mergeTrend(rows, country.population, 'population')
  mergeTrend(rows, country.literacy, 'literacy', 100)
  mergeTrend(rows, country.sol, 'sol')
  mergeTrend(rows, country.prestige, 'prestige')

  return Array.from(rows.values())
    .sort((a, b) => a.year - b.year)
    .map((row, index) => ({ ...row, index }))
}

function chartDomain(
  rows: TrendPoint[],
  keys: TrendDataKey[],
): [number, number] {
  const values = rows.flatMap((row) =>
    keys
      .map((key) => Number(row[key]))
      .filter((value) => Number.isFinite(value)),
  )
  if (!values.length) return [0, 1]

  const minValue = Math.min(0, ...values)
  const maxValue = Math.max(...values)
  const range = maxValue - minValue
  const padding = Math.max(range * 0.18, Math.abs(maxValue) * 0.08, 1)
  return [minValue < 0 ? minValue - padding : 0, maxValue + padding]
}

function mergeTrend(
  rows: Map<string, TrendPoint>,
  values: DatedValue[],
  key: TrendDataKey,
  multiplier = 1,
) {
  for (const item of values) {
    const row =
      rows.get(item.date) ??
      ({
        index: 0,
        year: item.year,
        dateLabel: formatYearLabel(item.year),
      } satisfies TrendPoint)
    row[key] = item.value * multiplier
    rows.set(item.date, row)
  }
}

function rotateRingValues(values: number[], index: number | undefined): number[] {
  if (index === undefined || index <= 0 || index >= values.length) return values
  return [...values.slice(index), ...values.slice(0, index)]
}

function parseVic3Date(value: string): Date {
  const [year, month = 1, day = 1] = value.split('.').map((part) => Number(part))
  return new Date(Date.UTC(year, month - 1, day))
}

function buildSampleDates(
  end: Date,
  sampleCount: number,
  sampleRate: number | undefined,
): Date[] {
  if (!sampleRate || sampleRate <= 0 || sampleCount <= 0) return []
  const daysPerSample = sampleRate / 4
  return Array.from({ length: sampleCount }, (_, idx) => {
    const daysBeforeEnd = (sampleCount - 1 - idx) * daysPerSample
    return addDays(end, -daysBeforeEnd)
  })
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

function decimalYear(date: Date): number {
  const year = date.getUTCFullYear()
  const start = Date.UTC(year, 0, 1)
  const end = Date.UTC(year + 1, 0, 1)
  return year + (date.getTime() - start) / (end - start)
}

function formatYearLabel(year: number): string {
  return year.toFixed(1)
}

function findSectionDatabase(
  text: string,
  sectionName: string,
): { open: number; close: number } | undefined {
  let sectionStart = text.indexOf(`\n${sectionName}={`)
  if (sectionStart < 0 && text.startsWith(`${sectionName}={`)) sectionStart = 0
  if (sectionStart < 0) return undefined
  const sectionOpen = text.indexOf('{', sectionStart)
  const sectionClose = findMatchingBrace(text, sectionOpen)
  if (sectionClose < 0) return undefined
  const databaseStart = text.indexOf('database={', sectionOpen)
  if (databaseStart < 0 || databaseStart > sectionClose) return undefined
  const databaseOpen = text.indexOf('{', databaseStart)
  const databaseClose = findMatchingBrace(text, databaseOpen)
  if (databaseClose < 0 || databaseClose > sectionClose) return undefined
  return { open: databaseOpen, close: databaseClose }
}

function iterateDatabaseBlocks(
  text: string,
  databaseOpen: number,
  databaseClose: number,
): Array<{ id: string; block: string; start: number; close: number }> {
  const entries: Array<{ id: string; block: string; start: number; close: number }> = []
  forEachDatabaseBlock(text, databaseOpen, databaseClose, (entry) => entries.push(entry))
  return entries
}

function forEachDatabaseBlock(
  text: string,
  databaseOpen: number,
  databaseClose: number,
  callback: (entry: { id: string; block: string; start: number; close: number }) => void,
): void {
  const headerRegex = /\n\s*([0-9]+)=\{/g
  headerRegex.lastIndex = databaseOpen

  while (headerRegex.lastIndex < databaseClose) {
    const match = headerRegex.exec(text)
    if (!match || match.index > databaseClose) break
    const openIndex = text.indexOf('{', match.index)
    const closeIndex = findMatchingBrace(text, openIndex)
    if (closeIndex < 0 || closeIndex > databaseClose) {
      headerRegex.lastIndex = match.index + 1
      continue
    }
    callback({
      id: match[1],
      block: text.slice(openIndex + 1, closeIndex),
      start: match.index,
      close: closeIndex,
    })
    headerRegex.lastIndex = closeIndex
  }
}

function findMatchingBrace(text: string, openIndex: number): number {
  if (openIndex < 0) return -1
  let depth = 0
  let inString = false
  for (let i = openIndex; i < text.length; i += 1) {
    const char = text[i]
    const previous = text[i - 1]
    if (char === '"' && previous !== '\\') inString = !inString
    if (inString) continue
    if (char === '{') depth += 1
    if (char === '}') {
      depth -= 1
      if (depth === 0) return i
    }
  }
  return -1
}

function findZipOffset(bytes: Uint8Array): number {
  for (let i = 0; i < Math.min(bytes.length - 3, 1024 * 1024); i += 1) {
    if (bytes[i] === 0x50 && bytes[i + 1] === 0x4b && bytes[i + 2] === 0x03 && bytes[i + 3] === 0x04) {
      return i
    }
  }
  return -1
}

function looksLikeText(bytes: Uint8Array): boolean {
  const sample = bytes.slice(0, Math.min(bytes.length, 8192))
  let printable = 0
  for (const byte of sample) {
    if (byte === 9 || byte === 10 || byte === 13 || (byte >= 32 && byte <= 126)) {
      printable += 1
    }
  }
  return printable / Math.max(sample.length, 1) > 0.88
}

function getStringValue(block: string, key: string): string | undefined {
  return new RegExp(`${escapeRegExp(key)}="([^"]*)"`).exec(block)?.[1]
}

function getValue(block: string, key: string): string | undefined {
  return getStringValue(block, key) ?? getBareValue(block, key)
}

function getBareValue(block: string, key: string): string | undefined {
  return new RegExp(`${escapeRegExp(key)}=([^\\s{}"]+)`).exec(block)?.[1]
}

function getNumberValue(block: string, key: string): number | undefined {
  const value = getBareValue(block, key)
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function readableName(value: string): string {
  return value
    .replace(/^dyn_c_/, '')
    .replace(/_ADJ$/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function last<T>(values: T[] | undefined): T | undefined {
  return values?.length ? values[values.length - 1] : undefined
}

function growth(first?: number, current?: number): string | undefined {
  if (!first || !current) return undefined
  const percent = ((current - first) / first) * 100
  const sign = percent >= 0 ? '+' : ''
  return `${sign}${percent.toFixed(1)}% from first sample`
}

function formatCompact(value?: number): string {
  if (value === undefined || Number.isNaN(value)) return 'n/a'
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  const units: Array<[number, string]> = [
    [1_000_000_000, 'B'],
    [1_000_000, 'M'],
    [1_000, 'K'],
  ]
  for (const [unitValue, suffix] of units) {
    if (abs >= unitValue) {
      const scaled = abs / unitValue
      return `${sign}${Intl.NumberFormat('en-US', {
        maximumFractionDigits: scaled >= 100 ? 0 : 1,
      }).format(scaled)}${suffix}`
    }
  }
  return `${sign}${Intl.NumberFormat('en-US', {
    maximumFractionDigits: abs > 100 ? 0 : 2,
  }).format(abs)}`
}

function formatDebt(country: CountrySummary): string {
  return `${formatCompact(country.debt)} / ${formatCompact(country.credit)}`
}

function formatValue(value?: number): string {
  if (value === undefined || Number.isNaN(value)) return 'n/a'
  return Intl.NumberFormat('en-US', {
    maximumFractionDigits: value > 100 ? 0 : 2,
  }).format(value)
}

function formatPercent(value?: number): string {
  if (value === undefined || Number.isNaN(value)) return 'n/a'
  return `${(value * 100).toFixed(1)}%`
}

function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  return `${Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value)} ${units[unitIndex]}`
}

function downloadText(fileName: string, text: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${fileName.replace(/\.[^.]+$/, '')}.gamestate.txt`
  link.click()
  URL.revokeObjectURL(url)
}

export default App
