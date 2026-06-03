import { useFormContext } from 'react-hook-form'

const LABELS = {
  healthcare: 'Healthcare',
  education: 'Education',
  cybersecurity: 'Cybersecurity',
  finops: 'FinOps',
  itconsulting: 'IT Consulting',
  other: 'Other',
  exploring: 'Exploring',
  piloting: 'Piloting',
  scaling: 'Scaling',
  optimizing: 'Optimizing',
}

const pretty = (v) => LABELS[v] || v
const joinOr = (list, fallback = '—') =>
  !list || list.length === 0 ? fallback : list.join(', ')

function Row({ label, value }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-2 border-b border-slate-800 last:border-b-0">
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="sm:col-span-2 text-sm text-slate-200">{value}</dd>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
      <dl className="mt-2">{children}</dl>
    </div>
  )
}

export default function StepReview() {
  const { watch } = useFormContext()
  const v = watch()

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">Review your answers</h2>
        <p className="text-sm text-slate-400 mt-1">
          Hit "Generate report" when you're happy — you can always go back and edit.
        </p>
      </div>

      <Section title="Industry & size">
        <Row label="Industry" value={pretty(v.industry)} />
        <Row label="Company size" value={`${v.company_size} employees`} />
      </Section>

      <Section title="AI maturity">
        <Row label="Maturity stage" value={pretty(v.ai_maturity)} />
        <Row label="Use cases" value={joinOr(v.ai_use_cases)} />
      </Section>

      <Section title="Data state">
        <Row label="Sources" value={String(v.data_state?.sources_count ?? '—')} />
        <Row label="% structured" value={`${v.data_state?.structured_pct ?? 0}%`} />
        <Row label="Siloed" value={v.data_state?.siloed ? 'Yes' : 'No'} />
        <Row label="Quality" value={`${v.data_state?.quality_rating ?? 0} / 5`} />
      </Section>

      <Section title="Governance">
        <Row
          label="Data governance program"
          value={v.governance?.has_data_governance ? 'Yes' : 'No'}
        />
        <Row label="AI policy" value={v.governance?.has_ai_policy ? 'Yes' : 'No'} />
        <Row label="Regulated" value={v.governance?.regulated ? 'Yes' : 'No'} />
        <Row
          label="Compliance frameworks"
          value={joinOr(v.governance?.compliance_frameworks)}
        />
        <Row label="Current blockers" value={joinOr(v.current_blockers)} />
      </Section>
    </div>
  )
}
