import { useFormContext } from 'react-hook-form'
import { FormRadioCards } from './Primitives'

const INDUSTRIES = [
  { value: 'healthcare', label: 'Healthcare', tagline: 'EMR, HIPAA, clinical workflows' },
  { value: 'education', label: 'Education', tagline: 'SIS, FERPA, learning analytics' },
  { value: 'cybersecurity', label: 'Cybersecurity', tagline: 'Asset risk, identity, SOC' },
  { value: 'finops', label: 'FinOps', tagline: 'Cost, budget, anomaly detection' },
  { value: 'itconsulting', label: 'IT Consulting', tagline: 'Engagements, projects, resources' },
  { value: 'other', label: 'Other', tagline: 'Something else' },
]

const COMPANY_SIZES = ['1-50', '51-250', '251-1000', '1000+']

export default function StepIndustry() {
  const { register } = useFormContext()

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">
          Which industry best fits your organization?
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          We tune ontology and recommendations to your domain.
        </p>
        <div className="mt-4">
          <FormRadioCards name="industry" options={INDUSTRIES} />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-100">Company size</h2>
        <p className="text-sm text-slate-400 mt-1">Headcount, roughly.</p>
        <select
          {...register('company_size')}
          className="mt-4 w-full sm:w-64 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:outline-none"
        >
          {COMPANY_SIZES.map((s) => (
            <option key={s} value={s}>
              {s} employees
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
