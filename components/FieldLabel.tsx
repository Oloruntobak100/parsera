'use client'

export function FieldLabel({
  name,
  hint,
  htmlFor,
  required,
  /** Yellow pill — use for URL only; false for Prompt, Proxy */
  pill = true,
}: {
  name: string
  hint?: string
  htmlFor?: string
  required?: boolean
  pill?: boolean
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 flex flex-wrap items-baseline gap-2"
    >
      {pill ? (
        <span className="inline-flex items-center rounded-md bg-accent px-2 py-0.5 font-display text-xs font-bold uppercase tracking-wider text-zinc-900">
          {name}
        </span>
      ) : (
        <span className="text-sm font-semibold text-zinc-200">{name}</span>
      )}
      {required && <span className="text-red-400">*</span>}
      {hint ? (
        <span className="text-xs font-normal text-zinc-500">{hint}</span>
      ) : null}
    </label>
  )
}
