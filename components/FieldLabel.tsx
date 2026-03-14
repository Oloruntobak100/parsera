'use client'

/**
 * Field name in yellow (Parséra-style) + optional hint in muted text.
 */
export function FieldLabel({
  name,
  hint,
  htmlFor,
  required,
}: {
  name: string
  hint?: string
  htmlFor?: string
  required?: boolean
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 flex flex-wrap items-baseline gap-2"
    >
      <span className="inline-flex items-center rounded-md bg-accent px-2 py-0.5 font-display text-xs font-bold uppercase tracking-wider text-zinc-900">
        {name}
      </span>
      {required && <span className="text-red-400">*</span>}
      {hint ? (
        <span className="text-xs font-normal normal-case tracking-normal text-zinc-500">
          {hint}
        </span>
      ) : null}
    </label>
  )
}
