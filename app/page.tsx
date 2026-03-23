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
  Table2,
  History,
} from 'lucide-react'
import { normalizeUrl } from '@/lib/parsera'
import {
  AttributesBuilder,
  type AttributeRow,
} from '@/components/AttributesBuilder'
import { ResultsTable, countResults } from '@/components/ResultsTable'
import { HistoryPanel } from '@/components/HistoryPanel'
import { FieldLabel } from '@/components/FieldLabel'
import { EmptyScrapeBanner } from '@/components/EmptyScrapeHint'

const PROXY_COUNTRIES = [
  { value: 'UnitedStates', label: 'United States' },
  { value: 'UnitedArabEmirates', label: 'United Arab Emirates' },
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
  const [resultAt, setResultAt] = useState<Date | null>(null)
  const [activeTab, setActiveTab] = useState<'results' | 'history'>('results')
  const [requestExpanded, setRequestExpanded] = useState(true)
  const [optionsExpanded, setOptionsExpanded] = useState(true)

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
    const normalized = normalizeUrl(url)
    try {
      const u = new URL(normalized)
      if (!['http:', 'https:'].includes(u.protocol))
        return 'URL must use http or https.'
    } catch {
      return 'Enter a valid URL (e.g. example.com or https://...).'
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
    setActiveTab('results')
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
          url: normalizeUrl(url),
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
      setResultAt(new Date())
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
      return new URL(normalizeUrl(url)).hostname.replace(/\./g, '-')
    } catch {
      return 'scrape'
    }
  })()

  return (
    <div className="flex min-h-screen flex-col">
      {/* Compact header */}
      <header className="shrink-0 border-b border-white/10 px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-sm font-bold text-zinc-900">
              <Sparkles className="h-4 w-4" aria-hidden />
              Parsera API
            </div>
            <h1 className="font-display text-xl font-bold text-white sm:text-2xl">
              Scraper
            </h1>
          </div>
        </div>
      </header>

      {/* Request bar — collapsible, ~25% */}
      <div className="shrink-0 border-b border-white/10 px-4 py-3 sm:px-6">
        <form onSubmit={submit} className="panel-card rounded-2xl p-4 sm:p-6">
            {/* Collapsible header */}
            <button
              type="button"
              onClick={() => setRequestExpanded(!requestExpanded)}
              className="flex w-full items-center justify-between gap-2 py-1 text-left"
            >
              <span className="text-sm font-semibold text-zinc-200">
                Request
              </span>
              {requestExpanded ? (
                <ChevronUp className="h-4 w-4 text-accent" />
              ) : (
                <ChevronDown className="h-4 w-4 text-accent" />
              )}
            </button>

            {requestExpanded && (
              <div className="space-y-4 pt-2">
                {/* Instructional note */}
                <div className="rounded-lg border border-accent/20 bg-accent/5 px-3 py-2 text-xs text-zinc-400">
                  <strong className="text-accent">Column-based</strong> (Add
                  field): Define columns like <code className="rounded bg-black/30 px-1">item</code>,{' '}
                  <code className="rounded bg-black/30 px-1">price</code> for structured table output — ideal for
                  lists and exports. <strong className="text-accent">Text-based</strong> (Prompt
                  only): Describe what to extract for summaries or free-form
                  results.
                </div>

                {error && (
                  <div
                    className="rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-2 text-sm text-red-200"
                    role="alert"
                  >
                    {error}
                  </div>
                )}

                {/* Horizontal primary row */}
                <div className="flex flex-wrap items-end gap-3">
                  <div className="flex min-h-[5.5rem] min-w-[200px] flex-1 flex-col justify-end">
                    <FieldLabel name="URL" htmlFor="url" required hint="Page to scrape" />
                    <input
                      id="url"
                      type="text"
                      required
                      placeholder="example.com/page or https://..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="flex min-h-[5.5rem] min-w-[200px] flex-[2] flex-col justify-end">
                    <FieldLabel
                      name="Prompt"
                      htmlFor="prompt"
                      pill={false}
                      hint={
                        attributes.some((a) => a.name && a.description)
                          ? 'Optional if you added fields'
                          : 'What to extract'
                      }
                    />
                    <textarea
                      id="prompt"
                      rows={2}
                      placeholder="e.g. Extract all product titles and prices."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="run-scrape-shell shrink-0 self-center pb-1">
                    <button
                      type="submit"
                      disabled={loading}
                      className="run-scrape-btn run-scrape-btn-sm"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-zinc-900" />
                          <span>Running…</span>
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 shrink-0 text-zinc-900" fill="currentColor" />
                          <span>Run scrape</span>
                          <Play className="h-3.5 w-3.5 shrink-0 text-zinc-900 opacity-80" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Collapsible Options */}
                <div className="overflow-hidden rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setOptionsExpanded(!optionsExpanded)}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm font-medium text-zinc-200 hover:bg-white/5"
                  >
                    <span>Options &amp; fields</span>
                    {optionsExpanded ? (
                      <ChevronUp className="h-4 w-4 text-accent" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-accent" />
                    )}
                  </button>
                  {optionsExpanded && (
                    <div className="space-y-4 border-t border-white/10 p-4">
                      <AttributesBuilder
                        rows={attributes}
                        onChange={setAttributes}
                        collapsible
                      />
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
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
                            <div className="rounded-lg border border-white/10 bg-surface-input p-3 text-xs text-zinc-400">
                              <strong className="text-accent">Standard:</strong> fast.{' '}
                              <strong className="text-accent">Precision:</strong> deeper page; more credits.
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
                        <div className="space-y-2">
                          <FieldLabel name="Proxy" htmlFor="proxy" pill={false} hint="Country" />
                          <select
                            id="proxy"
                            value={proxyCountry}
                            onChange={(e) => setProxyCountry(e.target.value)}
                            className={`${inputClass} cursor-pointer`}
                          >
                            {PROXY_COUNTRIES.map((c) => (
                              <option key={c.value} value={c.value} className="bg-surface-input text-white">
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
                          <span>Cookies (optional)</span>
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
                                  onChange={(e) => updateCookie(i, 'name', e.target.value)}
                                  className="flex-1 rounded-lg border border-white/10 bg-surface-input px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-accent/30"
                                />
                                <input
                                  placeholder="Value"
                                  value={c.value}
                                  onChange={(e) => updateCookie(i, 'value', e.target.value)}
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
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Minimal collapsed view */}
            {!requestExpanded && (
              <div className="flex flex-wrap items-end gap-3 pt-2">
                <div className="min-w-[180px] flex-1">
                  <input
                    id="url-collapsed"
                    type="text"
                    required
                    placeholder="URL to scrape"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="run-scrape-btn run-scrape-btn-sm shrink-0"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-zinc-900" />
                  ) : (
                    <>
                      <Zap className="h-5 w-5 text-zinc-900" fill="currentColor" />
                      <span>Run</span>
                    </>
                  )}
                </button>
              </div>
            )}
        </form>
      </div>

      {/* Main content — Results | History tabs, 75% */}
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Tab menu */}
        <div className="flex shrink-0 border-b border-white/10 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setActiveTab('results')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'results'
                ? 'border-accent text-accent'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Table2 className="h-4 w-4" />
            Results
            {n > 0 && (
              <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs text-accent">
                {n}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'border-accent text-accent'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <History className="h-4 w-4" />
            History
          </button>
        </div>

        {/* Tab content */}
        <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-6">
          {activeTab === 'results' && (
            <div className="flex h-full min-h-[240px] flex-col">
              {loading && (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-zinc-500">
                  <Loader2 className="h-10 w-10 animate-spin text-accent" />
                  <span className="text-sm">Calling Parsera…</span>
                </div>
              )}
              {!loading && result == null && !error && (
                <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-black/20 px-6 py-16 text-center">
                  <p className="max-w-sm text-sm leading-relaxed text-zinc-500">
                    Run a scrape to see structured data here. Export as CSV or
                    Excel when ready.
                  </p>
                </div>
              )}
              {!loading && result != null && (
                <>
                  <p className="mb-3 text-sm font-medium text-zinc-400">
                    {n > 0 ? `${n} row${n !== 1 ? 's' : ''}` : 'Result'}
                  </p>
                  <div className="min-h-0 flex-1 overflow-auto">
                    <EmptyScrapeBanner data={result} />
                    <ResultsTable
                      data={result}
                      extractedAt={resultAt}
                      baseFilename={slug}
                    />
                  </div>
                </>
              )}
            </div>
          )}
          {activeTab === 'history' && (
            <HistoryPanel refreshKey={historyRefresh} embedded />
          )}
        </div>
      </div>
    </div>
  )
}
