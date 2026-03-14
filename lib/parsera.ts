export type ParseraAttribute = { name: string; description: string }

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

  const payload: ParseraExtractWirePayload = {
    url: body.url.trim(),
    attributes,
  }
  if (body.prompt?.trim()) payload.prompt = body.prompt.trim()
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
  if (!payload.url) return 'URL is required.'
  try {
    const u = new URL(payload.url)
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
