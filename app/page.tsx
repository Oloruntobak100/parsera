'use client'

import { useState } from 'react'
import {
  Loader2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Sparkles,
  Play,
  Zap,
  LayoutGrid,
  Table2,
} from 'lucide-react'
import {
  AttributesBuilder,
  type AttributeRow,
} from '@/components/AttributesBuilder'
import { ResultsTable, countResults } from '@/components/ResultsTable'
import { ExportButtons } from '@/components/ExportButtons'
import { HistoryPanel } from '@/components/HistoryPanel'
import { FieldLabel } from '@/components/FieldLabel'
import { EmptyScrapeBanner } from '@/components/EmptyScrapeHint'

const PROXY_COUNTRIES = [
  { value: 'UnitedStates', label: 'United States' },
  { value: 'UnitedKingdom', label: 'United Kingdom' },
  { value: 'Germany', label: 'Germany' },
  { value: 'France', label: 'France' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Australia', label: 'Australia' },
  { value: 'Netherlands', label: 'Netherlands' },
  { value: 'Singapore', label: 'Singapore' },
  { value: 'Japan', label: 'Japan' },
  { value: 'Brazil', label: 'Brazil' },
  { value: 'India', label: 'India' },
  { value: 'Nigeria', label: 'Nigeria' },
] as const

type CookieRow = { name: string; value: string }

const inputClass =
  'w-full rounded-xl border border-white/10 bg-surface-input px-4 py-3 text-[15px] text-white placeholder:text-zinc-500 shadow-inner focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30'

export default function HomePage() {
  const [url, setUrl] = useState('')
  const [prompt, setPrompt] = useState('')
  const [attributes, setAttributes] = useState<AttributeRow[]>([])
  const [mode, setMode] = useState<'standard' | 'precision'>('standard')
  const [proxyCountry, setProxyCountry] = useState('UnitedStates')
  const [cookiesOpen, setCookiesOpen] = useState(false)
  const [cookies, setCookies] = useState<CookieRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<unknown>(null)
  const [modeTip, setModeTip] = useState(false)
  const [historyRefresh, setHistoryRefresh] = useState(0)

  const addCookie = () => setCookies([...cookies, { name: '', value: '' }])
  const removeCookie = (i: number) =>
    setCookies(cookies.filter((_, j) => j !== i))
  const updateCookie = (i: number, field: keyof CookieRow, value: string) => {
    setCookies(
      cookies.map((c, j) => (j === i ? { ...c, [field]: value } : c))
    )
  }

  const validateClient = (): string | null => {
    if (!url.trim()) return 'URL is required.'
    try {
      const u = new URL(url.trim())
      if (!['http:', 'https:'].includes(u.protocol))
        return 'URL must use http or https.'
    } catch {
      return 'Enter a valid URL (include https://).'
    }
    const hasPrompt = prompt.trim().length > 0
    const hasAttrs = attributes.some(
      (a) => a.name.trim() && a.description.trim()
    )
    if (!hasPrompt && !hasAttrs) {
      return 'Add a prompt or at least one data field (name + description).'
    }
    return null
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const v = validateClient()
    if (v) {
      setError(v)
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const attrs = attributes.filter(
        (a) => a.name.trim() && a.description.trim()
      )
      const cookiePayload = cookies
        .filter((c) => c.name.trim())
        .map((c) => ({ name: c.name.trim(), value: c.value }))

      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          prompt: prompt.trim() || undefined,
          attributes: attrs.length ? attrs : undefined,
          mode,
          proxy_country: proxyCountry,
          cookies: cookiePayload.length ? cookiePayload : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(
          typeof data?.error === 'string'
            ? data.error
            : 'Request failed. Check your API key and try again.'
        )
        if (data?.details) setResult(data.details)
        return
      }
      setResult(data)
    } catch {
      setError('Network error. Try again.')
    } finally {
      setHistoryRefresh((k) => k + 1)
      setLoading(false)
    }
  }

  const n = result != null ? countResults(result) : 0
  const slug = (() => {
    try {
      return new URL(url.trim()).hostname.replace(/\./g, '-')
    } catch {
      return 'scrape'
    }
  })()

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      {/* Hero — sample 1 badge + sample 2 headline weight */}
      <header className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-bold text-zinc-900 shadow-glow-sm">
          <Sparkles className="h-4 w-4" aria-hidden />
          Parsera API
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
          Scraper
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
          Enter a URL, describe what to extract, run — then export{' '}
          <span className="text-accent-glow">CSV</span> or{' '}
          <span className="text-accent-glow">Excel</span>.
        </p>
      </header>

      {/* Two clear panels — labels like a product UI */}
      <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch lg:gap-8">
        <form
          onSubmit={submit}
          className="panel-card flex flex-col rounded-2xl p-6 sm:p-8"
        >
          <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <LayoutGrid className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white">
                Request
              </h2>
              <p className="text-xs text-zinc-500">
                URL, fields, prompt &amp; options
              </p>
            </div>
          </div>

          <div className="flex flex-1 flex-col space-y-6">
            {error && (
              <div
                className="rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200"
                role="alert"
              >
                {error}
              </div>
            )}

            <div>
              <FieldLabel name="URL" htmlFor="url" required hint="Page to scrape" />
              <input
                id="url"
                type="url"
                required
                placeholder="https://example.com/page"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className={inputClass}
              />
            </div>

            <AttributesBuilder rows={attributes} onChange={setAttributes} />

            <div>
              <FieldLabel
                name="Prompt"
                htmlFor="prompt"
                pill={false}
                hint={
                  attributes.some((a) => a.name && a.description)
                    ? 'Optional if you added fields above'
                    : 'Say what to extract if you didn’t add fields'
                }
              />
              <textarea
                id="prompt"
                rows={4}
                placeholder="e.g. Extract all product titles and prices from the listing."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-sm font-semibold text-zinc-200">Mode</span>
                  <button
                    type="button"
                    className="text-zinc-500 hover:text-accent"
                    aria-label="Mode help"
                    onClick={() => setModeTip(!modeTip)}
                    onBlur={() => setTimeout(() => setModeTip(false), 200)}
                  >
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </div>
                {modeTip && (
                  <div className="mb-2 rounded-lg border border-white/10 bg-surface-input p-3 text-xs text-zinc-400">
                    <strong className="text-accent">Standard:</strong> fast.
                    <br />
                    <strong className="text-accent">Precision:</strong> deeper
                    page; more credits.
                  </div>
                )}
                <div className="flex gap-4 rounded-xl border border-white/10 bg-surface-input/50 px-4 py-3 text-sm text-zinc-300">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="mode"
                      checked={mode === 'standard'}
                      onChange={() => setMode('standard')}
                      className="border-white/20 bg-surface-input text-accent focus:ring-accent"
                    />
                    Standard
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="mode"
                      checked={mode === 'precision'}
                      onChange={() => setMode('precision')}
                      className="border-white/20 bg-surface-input text-accent focus:ring-accent"
                    />
                    Precision
                  </label>
                </div>
              </div>
              <div>
                <FieldLabel
                  name="Proxy"
                  htmlFor="proxy"
                  pill={false}
                  hint="Country for request"
                />
                <select
                  id="proxy"
                  value={proxyCountry}
                  onChange={(e) => setProxyCountry(e.target.value)}
                  className={`${inputClass} cursor-pointer`}
                >
                  {PROXY_COUNTRIES.map((c) => (
                    <option
                      key={c.value}
                      value={c.value}
                      className="bg-surface-input text-white"
                    >
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setCookiesOpen(!cookiesOpen)}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-zinc-200 hover:bg-white/5"
              >
                <span className="text-sm font-semibold text-zinc-200">
                  Cookies (optional)
                </span>
                {cookiesOpen ? (
                  <ChevronUp className="h-4 w-4 text-accent" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-accent" />
                )}
              </button>
              {cookiesOpen && (
                <div className="space-y-2 border-t border-white/10 bg-black/20 p-4">
                  {cookies.map((c, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        placeholder="Name"
                        value={c.name}
                        onChange={(e) =>
                          updateCookie(i, 'name', e.target.value)
                        }
                        className="flex-1 rounded-lg border border-white/10 bg-surface-input px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-accent/30"
                      />
                      <input
                        placeholder="Value"
                        value={c.value}
                        onChange={(e) =>
                          updateCookie(i, 'value', e.target.value)
                        }
                        className="flex-1 rounded-lg border border-white/10 bg-surface-input px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-accent/30"
                      />
                      <button
                        type="button"
                        onClick={() => removeCookie(i)}
                        className="rounded-lg px-2 text-zinc-500 hover:bg-white/10 hover:text-zinc-300"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addCookie}
                    className="text-sm font-medium text-accent hover:text-accent-glow hover:underline"
                  >
                    + Add cookie
                  </button>
                </div>
              )}
            </div>

            <div className="mt-auto space-y-3 border-t border-white/10 pt-6">
              <div className="run-scrape-shell">
                <button
                  type="submit"
                  disabled={loading}
                  className="run-scrape-btn"
                >
                  {loading ? (
                    <>
                      <Loader2
                        className="h-6 w-6 shrink-0 animate-spin text-zinc-900"
                        aria-hidden
                      />
                      <span>Running…</span>
                    </>
                  ) : (
                    <>
                      <Zap
                        className="h-6 w-6 shrink-0 text-zinc-900"
                        fill="currentColor"
                        aria-hidden
                      />
                      <span>Run scrape</span>
                      <Play
                        className="h-4 w-4 shrink-0 text-zinc-900 opacity-80"
                        aria-hidden
                      />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>

        <section className="panel-card flex flex-col rounded-2xl p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent">
              <Table2 className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white">
                Results
              </h2>
              <p className="text-xs text-zinc-500">
                Table, export &amp; copy JSON
              </p>
            </div>
          </div>

          <div className="flex min-h-[280px] flex-1 flex-col">
            {loading && (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-zinc-500">
                <Loader2
                  className="h-10 w-10 animate-spin text-accent"
                  aria-hidden
                />
                <span className="text-sm">Calling Parsera…</span>
              </div>
            )}
            {!loading && result == null && !error && (
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-black/20 px-6 py-16 text-center">
                <p className="max-w-xs text-sm leading-relaxed text-zinc-500">
                  Run a scrape to see structured data here. Export as CSV or
                  Excel when ready.
                </p>
              </div>
            )}
            {!loading && result != null && (
              <>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-medium text-zinc-400">
                    {Array.isArray(result)
                      ? `${n} row${n !== 1 ? 's' : ''}`
                      : n
                        ? '1 object'
                        : 'Result'}
                  </p>
                  <ExportButtons data={result} baseFilename={slug} />
                </div>
                <div className="min-h-0 flex-1 overflow-auto">
                  <EmptyScrapeBanner data={result} />
                  <ResultsTable data={result} />
                </div>
              </>
            )}
          </div>
        </section>
      </div>

      <HistoryPanel refreshKey={historyRefresh} />
    </div>
  )
}
