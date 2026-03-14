export type ParseraAttribute = { name: string; description: string }

export type ParseraExtractPayload = {
  url: string
  prompt?: string
  attributes?: ParseraAttribute[]
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
}): ParseraExtractPayload {
  const payload: ParseraExtractPayload = { url: body.url.trim() }
  if (body.prompt?.trim()) payload.prompt = body.prompt.trim()
  if (body.attributes?.length) {
    const attrs = body.attributes.filter(
      (a) => a.name?.trim() && a.description?.trim()
    )
    if (attrs.length) payload.attributes = attrs
  }
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

export function validateExtractPayload(payload: ParseraExtractPayload): string | null {
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
  const hasAttributes = Boolean(payload.attributes?.length)
  if (!hasPrompt && !hasAttributes) {
    return 'Provide either a prompt or at least one data field (name + description).'
  }
  return null
}
