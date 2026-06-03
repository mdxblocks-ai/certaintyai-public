import { useFormContext } from 'react-hook-form'
import { FormStarRating, FormToggle } from './Primitives'

export default function StepData() {
  const { register, watch } = useFormContext()
  const sourcesCount = watch('data_state.sources_count')
  const structuredPct = watch('data_state.structured_pct')

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">
          How many data sources do you have?
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Systems, apps, warehouses, spreadsheets — anything holding operational data.
        </p>
        <div className="mt-4 flex items-center gap-4">
          <input
            type="range"
            min="1"
            max="50"
            {...register('data_state.sources_count', { valueAsNumber: true })}
            className="flex-1 accent-cyan-400"
          />
          <span className="w-16 text-right text-slate-100 font-mono">{sourcesCount}</span>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-100">
          What share of that data is structured?
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Roughly, what % lives in tables and queryable systems vs. PDFs, emails, free text.
        </p>
        <div className="mt-4 flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="100"
            {...register('data_state.structured_pct', { valueAsNumber: true })}
            className="flex-1 accent-cyan-400"
          />
          <span className="w-16 text-right text-slate-100 font-mono">{structuredPct}%</span>
        </div>
      </div>

      <div>
        <FormToggle
          name="data_state.siloed"
          label="Are your sources siloed?"
          description="Different teams own different data, with limited cross-system queries."
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-100">Overall data quality</h2>
        <p className="text-sm text-slate-400 mt-1">Trust, completeness, freshness.</p>
        <div className="mt-3">
          <FormStarRating name="data_state.quality_rating" />
        </div>
      </div>
    </div>
  )
}
