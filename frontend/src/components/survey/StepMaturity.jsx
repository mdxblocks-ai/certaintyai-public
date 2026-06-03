import { FormCheckboxList, FormRadioCards } from './Primitives'

const AI_MATURITY = [
  { value: 'exploring', label: 'Exploring', tagline: 'Researching, no production AI yet' },
  { value: 'piloting', label: 'Piloting', tagline: 'Running first AI experiments' },
  { value: 'scaling', label: 'Scaling', tagline: 'Multiple production use-cases' },
  { value: 'optimizing', label: 'Optimizing', tagline: 'AI is a core operational capability' },
]

const AI_USE_CASES = [
  { value: 'copilot', label: 'Copilot / assistant' },
  { value: 'automation', label: 'Process automation' },
  { value: 'analytics', label: 'Predictive analytics' },
  { value: 'decision_support', label: 'Decision support' },
  { value: 'document_processing', label: 'Document processing' },
  { value: 'customer_support', label: 'Customer support' },
]

export default function StepMaturity() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">
          Where are you on the AI maturity curve?
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Be honest — calibration matters more than aspiration.
        </p>
        <div className="mt-4">
          <FormRadioCards name="ai_maturity" options={AI_MATURITY} />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-100">
          What AI use-cases matter most?
        </h2>
        <p className="text-sm text-slate-400 mt-1">Pick any number.</p>
        <div className="mt-4">
          <FormCheckboxList name="ai_use_cases" options={AI_USE_CASES} />
        </div>
      </div>
    </div>
  )
}
