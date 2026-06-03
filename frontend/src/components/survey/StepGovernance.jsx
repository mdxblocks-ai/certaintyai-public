import { FormCheckboxList, FormToggle } from './Primitives'

const COMPLIANCE_FRAMEWORKS = [
  'HIPAA',
  'GDPR',
  'SOC2',
  'ISO27001',
  'FERPA',
  'PCI-DSS',
  'CCPA',
  'NIST',
]

const BLOCKERS = [
  { value: 'data_silos', label: 'Data silos' },
  { value: 'no_ontology', label: 'No ontology / common vocabulary' },
  { value: 'skills_gap', label: 'AI skills gap' },
  { value: 'budget', label: 'Budget' },
  { value: 'leadership', label: 'Leadership alignment' },
  { value: 'compliance_risk', label: 'Compliance risk' },
  { value: 'vendor_lockin', label: 'Vendor lock-in concerns' },
  { value: 'explainability', label: 'Explainability / trust' },
]

export default function StepGovernance() {
  return (
    <div className="space-y-7">
      <div className="divide-y divide-slate-800">
        <FormToggle
          name="governance.has_data_governance"
          label="We have a data governance program"
          description="Formal data owners, quality checks, lineage."
        />
        <FormToggle
          name="governance.has_ai_policy"
          label="We have an AI / model-use policy"
          description="Written guidelines for model selection, risk review, approvals."
        />
        <FormToggle
          name="governance.regulated"
          label="We operate under regulatory oversight"
          description="HIPAA, FERPA, SOC 2, GDPR, financial regs, or similar."
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-100">
          Compliance frameworks in scope
        </h2>
        <p className="text-sm text-slate-400 mt-1">Select any that apply.</p>
        <div className="mt-4">
          <FormCheckboxList
            name="governance.compliance_frameworks"
            options={COMPLIANCE_FRAMEWORKS}
          />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-100">
          What's blocking you today?
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Pick any number. This drives the report's recommendations.
        </p>
        <div className="mt-4">
          <FormCheckboxList name="current_blockers" options={BLOCKERS} />
        </div>
      </div>
    </div>
  )
}
