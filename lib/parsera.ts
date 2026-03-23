export type ParseraAttribute = { name: string; description: string }

/** Normalize URL: prepend https:// if no protocol (matches Parsera UI behavior) */
export function normalizeUrl(raw: string): string {
  const s = raw.trim()
  if (!s) return s
  if (/^https?:\/\//i.test(s)) return s
  return `https://${s}`
}

/** What we send to Parsera /v1/extract — API requires `attributes` (object), not optional */
export type ParseraExtractWirePayload = {
  url: string
  prompt?: string
  /** Required by Parsera API (422 if omitted). Empty {} when using prompt-only. */
  attributes: Record<string, string>
  mode?: 'standard' | 'precision'
  proxy_country?: string
  cookies?: { name: string; value: string }[]
}

export function buildParseraPayload(body: {
  url: string
  prompt?: string
  attributes?: ParseraAttribute[]
  mode?: string
  proxy_country?: string
  cookies?: { name: string; value: string }[]
}): ParseraExtractWirePayload {
  const attrsList = (body.attributes ?? []).filter(
    (a) => a.name?.trim() && a.description?.trim()
  )
  const attributes: Record<string, string> = {}
  for (const a of attrsList) {
    attributes[a.name.trim()] = a.description.trim()
  }

  const promptTrim = body.prompt?.trim() ?? ''
  /**
   * Prompt-only with {} — inject attributes so the model has concrete outputs.
   * When the prompt asks for item/price lists, use item+price (matches Parsera template).
   * Otherwise fall back to summary/key_points/page_type.
   */
  if (Object.keys(attributes).length === 0 && promptTrim) {
    const p = promptTrim.toLowerCase()
    const wantsItemPriceList =
      (p.includes('price') || p.includes('prices')) &&
      (p.includes('item') || p.includes('items') || p.includes('list') || p.includes('product'))

    if (wantsItemPriceList) {
      attributes.item = 'Product or item name/description'
      attributes.price = 'Price as number (e.g. 11.99)'
    } else {
      attributes.summary =
        `Answer in depth: ${promptTrim}. Explain what the page/site is about, who it is for, main themes, products or services if any, and any clear calls-to-action. Use complete sentences.`
      attributes.key_points =
        'Extract the most important facts, sections, or claims from the page as a concise bullet-style list (plain text, one line per point).'
      attributes.page_type =
        'One short phrase: what kind of page this is (e.g. marketing homepage, blog, SaaS landing, directory).'
    }
  }

  const payload: ParseraExtractWirePayload = {
    url: normalizeUrl(body.url),
    attributes,
  }
  if (promptTrim) payload.prompt = promptTrim
  if (body.mode === 'precision' || body.mode === 'standard') {
    payload.mode = body.mode
  }
  if (body.proxy_country?.trim()) {
    payload.proxy_country = body.proxy_country.trim()
  }
  if (body.cookies?.length) {
    const cookies = body.cookies.filter((c) => c.name?.trim())
    if (cookies.length) payload.cookies = cookies
  }
  return payload
}

export function validateExtractPayload(payload: ParseraExtractWirePayload): string | null {
  const url = normalizeUrl(payload.url)
  if (!url) return 'URL is required.'
  try {
    const u = new URL(url)
    if (!['http:', 'https:'].includes(u.protocol)) {
      return 'URL must use http or https.'
    }
  } catch {
    return 'Enter a valid URL (include https://).'
  }
  const hasPrompt = Boolean(payload.prompt?.trim())
  const hasAttributes = Object.keys(payload.attributes).length > 0
  if (!hasPrompt && !hasAttributes) {
    return 'Provide either a prompt or at least one data field (name + description).'
  }
  return null
}

/** For Supabase history — store array form */
export function attributesAsArray(
  attributes: Record<string, string>
): ParseraAttribute[] {
  return Object.entries(attributes).map(([name, description]) => ({
    name,
    description,
  }))
}

/** Parsera API expects attributes as array [{ name, description }], not map. */
export function toParseraApiBody(payload: ParseraExtractWirePayload): Record<string, unknown> {
  const { attributes, ...rest } = payload
  return {
    ...rest,
    attributes: attributesAsArray(attributes),
  }
}
