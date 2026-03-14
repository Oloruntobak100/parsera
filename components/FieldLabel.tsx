'use client'

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
      <span className="text-sm font-semibold text-zinc-200">{name}</span>
      {required && <span className="text-red-400">*</span>}
      {hint ? (
        <span className="text-xs font-normal text-zinc-500">{hint}</span>
      ) : null}
    </label>
  )
}
