import { useFormContext } from 'react-hook-form'

// ─── Toggle ──────────────────────────────────────────────────────────
export function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-slate-200">{label}</p>
        {description && (
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition',
          checked ? 'bg-cyan-400' : 'bg-slate-700',
        ].join(' ')}
      >
        <span
          className={[
            'inline-block h-4 w-4 transform rounded-full bg-white transition',
            checked ? 'translate-x-6' : 'translate-x-1',
          ].join(' ')}
        />
      </button>
    </div>
  )
}

export function FormToggle({ name, label, description }) {
  const { watch, setValue } = useFormContext()
  const value = watch(name)
  return (
    <Toggle
      checked={Boolean(value)}
      onChange={(v) => setValue(name, v, { shouldDirty: true, shouldValidate: true })}
      label={label}
      description={description}
    />
  )
}

// ─── Star rating ─────────────────────────────────────────────────────
export function FormStarRating({ name, max = 5 }) {
  const { watch, setValue } = useFormContext()
  const value = watch(name) || 0
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => {
        const n = i + 1
        const filled = n <= value
        return (
          <button
            key={n}
            type="button"
            onClick={() => setValue(name, n, { shouldDirty: true })}
            className={[
              'text-2xl leading-none transition px-1',
              filled ? 'text-amber-400' : 'text-slate-700 hover:text-slate-500',
            ].join(' ')}
            aria-label={`${n} out of ${max}`}
          >
            ★
          </button>
        )
      })}
      <span className="ml-3 text-sm text-slate-400">{value} / {max}</span>
    </div>
  )
}

// ─── Radio cards (single-select) ─────────────────────────────────────
export function FormRadioCards({ name, options }) {
  const { watch, setValue } = useFormContext()
  const current = watch(name)
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map((opt) => {
        const selected = current === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() =>
              setValue(name, opt.value, { shouldDirty: true, shouldValidate: true })
            }
            className={[
              'text-left rounded-xl border px-4 py-3 transition',
              selected
                ? 'border-cyan-400 bg-cyan-400/10'
                : 'border-slate-800 hover:border-slate-600 bg-slate-900/40',
            ].join(' ')}
          >
            <p className="text-sm font-medium text-slate-100">{opt.label}</p>
            {opt.tagline && (
              <p className="text-xs text-slate-400 mt-0.5">{opt.tagline}</p>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─── Checkbox list (multi-select) ────────────────────────────────────
export function FormCheckboxList({ name, options }) {
  const { watch, setValue } = useFormContext()
  const current = watch(name) || []

  function toggleValue(val) {
    const has = current.includes(val)
    const next = has ? current.filter((v) => v !== val) : [...current, val]
    setValue(name, next, { shouldDirty: true })
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {options.map((opt) => {
        const value = typeof opt === 'string' ? opt : opt.value
        const label = typeof opt === 'string' ? opt : opt.label
        const checked = current.includes(value)
        return (
          <label
            key={value}
            className={[
              'flex items-center gap-3 rounded-lg border px-3 py-2 cursor-pointer transition',
              checked
                ? 'border-cyan-400/60 bg-cyan-400/10'
                : 'border-slate-800 hover:border-slate-600 bg-slate-900/30',
            ].join(' ')}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggleValue(value)}
              className="accent-cyan-400"
            />
            <span className="text-sm text-slate-200">{label}</span>
          </label>
        )
      })}
    </div>
  )
}
