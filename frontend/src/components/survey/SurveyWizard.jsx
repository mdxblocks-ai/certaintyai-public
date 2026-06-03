import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'

const CANONICAL_ROLES = [
  'CFO',
  // 'CIO',
  // 'CTO',
  // 'CDO',
  // 'Compliance Officer',
  // 'Head of AI',
  // 'Business Leader',
  'Security Director / CISO'
]

const PUBLIC_AGENCIES = [
  "Department of Health",
  "Department of Education",
  "Department of Defense",
  "Department of Veterans Affairs",
  "Department of the Treasury",
  "Department of Justice",
  "Department of Homeland Security",
  "Centers for Medicare & Medicaid Services",
  "Internal Revenue Service",
  "Social Security Administration",
  "Department of Energy",
  "Department of Transportation",
  "State Health Agency",
  "City / County Government",
  "Public University System"
]

const PRIVATE_COMPANIES = [
  "ACME Corporation",
  "Astra Finance Corp",
  "Apex Healthcare",
  "Beacon Cybersecurity",
  "Summit Education Services",
  "Nexus Consulting Group",
  "Nova Energy Solutions",
  "Vanguard Logistics",
  "Horizon Tech Systems",
  "Genesis Capital"
]

const DEFAULT_TEMPLATE_QUESTIONS = [
  {
    id: "maturity",
    dimension: "maturity",
    text: "Where is {org} with AI today?",
    sub: "",
    multi: false,
    options: [
      {value: "exploring", label: "Exploring — researching options", score: 25, frag: 0},
      {value: "pilots", label: "Pilots running", score: 50, frag: 0},
      {value: "production", label: "In production", score: 75, frag: 0},
      {value: "scaling", label: "Scaling — but hitting friction", score: 90, frag: 0}
    ]
  },
  {
    id: "semantic",
    dimension: "semantic",
    text: "How many systems hold your {entity} data — and do they define it the same way?",
    sub: "Different teams often label the same {entity} differently — and that mismatch is what blocks reliable AI.",
    multi: false,
    options: [
      {value: "low", label: "1–2 systems, same definition", score: 85, frag: 15},
      {value: "mod", label: "3–5 systems, mostly aligned", score: 60, frag: 40},
      {value: "high", label: "6–10 systems, significant variation", score: 35, frag: 70},
      {value: "sev", label: "10+ systems, all different", score: 15, frag: 90}
    ]
  },
  {
    id: "rag",
    dimension: "rag",
    text: "On complex {industry} questions, how accurate are {org}'s AI answers today?",
    sub: "Vector-only retrieval typically plateaus at 70–80%. Governed, graph-based retrieval reaches 90–99%.",
    multi: false,
    options: [
      {value: "unk", label: "We haven't measured", score: 30, frag: 0},
      {value: "u50", label: "Below 50%", score: 25, frag: 0},
      {value: "5070", label: "50–70%", score: 45, frag: 0},
      {value: "7085", label: "70–85%", score: 70, frag: 0},
      {value: "o85", label: "Above 85%", score: 88, frag: 0}
    ]
  },
  {
    id: "oversight",
    dimension: "oversight",
    text: "Does {org} have formal AI oversight in place today?",
    sub: "",
    multi: false,
    options: [
      {value: "none", label: "No formal oversight", score: 20, frag: 0},
      {value: "partial", label: "Partial — some controls", score: 50, frag: 0},
      {value: "formal", label: "Yes — formal governance", score: 85, frag: 0}
    ]
  },
  {
    id: "audit",
    dimension: "audit",
    text: "Can {org} produce a full provenance trail for any AI-generated answer today?",
    sub: "Sources, confidence scores and decision rationale — increasingly required under {framework}.",
    multi: false,
    options: [
      {value: "full", label: "Yes, fully", score: 100, frag: 0},
      {value: "part", label: "Partially, for some systems", score: 50, frag: 0},
      {value: "no", label: "No, not today", score: 0, frag: 0}
    ]
  }
]

function personalizeFallbackQuestions(questions, intake) {
  const entityMap = {
    healthcare: "patient",
    finance: "customer",
    cyber: "asset",
    education: "student",
    finops: "cost centre",
    consulting: "client",
    other: "core entity"
  }
  const entity = entityMap[intake.domain] || "core entity"
  
  const indMap = {
    healthcare: "clinical",
    finance: "financial",
    cyber: "security",
    education: "learning",
    finops: "cost",
    consulting: "delivery",
    other: "operational"
  }
  const industry = indMap[intake.domain] || "complex"
  
  const isPub = intake.orgType === 'public'
  let framework = "the EU AI Act, GDPR and SOC 2"
  if (isPub) framework = "FISMA, FedRAMP and NIST 800-53"
  else if (intake.domain === 'healthcare') framework = "HIPAA, HITECH and the EU AI Act"
  else if (intake.domain === 'finance') framework = "SOX, Basel III and GDPR"
  else if (intake.domain === 'cyber') framework = "NIST CSF, ISO 27001 and SOC 2"
  else if (intake.domain === 'education') framework = "FERPA, GDPR and the EU AI Act"

  const org = intake.org || (isPub ? "your agency" : "your organization")
  const role = intake.role || "your team"

  return questions.map(q => {
    const text = q.text.replace(/{org}/g, org)
                     .replace(/{entity}/g, entity)
                     .replace(/{industry}/g, industry)
                     .replace(/{framework}/g, framework)
                     .replace(/{role}/g, role)
    const sub = q.sub.replace(/{org}/g, org)
                   .replace(/{entity}/g, entity)
                   .replace(/{industry}/g, industry)
                   .replace(/{framework}/g, framework)
                   .replace(/{role}/g, role)
    return { ...q, text, sub }
  })
}

export default function SurveyWizard() {
  const navigate = useNavigate()
  
  // Intake state
  const [orgType, setOrgType] = useState('private') // 'private' | 'public'
  const [org, setOrg] = useState('')
  const [role, setRole] = useState('')
  const [domain, setDomain] = useState('')
  const [email, setEmail] = useState('')

  // Control state
  const [index, setIndex] = useState(0) // 0: Intake, 1..N: Questions, N+1: Email/Generate
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const [acOpen, setAcOpen] = useState(false)
  const [acFiltered, setAcFiltered] = useState([])
  const [acHighlightIndex, setAcHighlightIndex] = useState(-1)
  
  const [validationError, setValidationError] = useState('')
  const [serverError, setServerError] = useState('')

  // Autocomplete filtering
  useEffect(() => {
    const query = org.trim().toLowerCase()
    const sourceList = orgType === 'public' ? PUBLIC_AGENCIES : PRIVATE_COMPANIES
    if (!query) {
      setAcFiltered(sourceList)
    } else {
      setAcFiltered(sourceList.filter(a => a.toLowerCase().includes(query)))
    }
    setAcHighlightIndex(0)
  }, [org, orgType])

  const domOpts = orgType === 'public' ? [
    { value: "healthcare", label: "Health & Human Services" },
    { value: "finance", label: "Treasury, Revenue & Finance" },
    { value: "cyber", label: "Defense, Security & Intelligence" },
    { value: "education", label: "Education & Research" },
    { value: "finops", label: "Public Services & Operations" },
    { value: "other", label: "Other agency / mandate" }
  ] : [
    { value: "healthcare", label: "Healthcare & Life Sciences" },
    { value: "finance", label: "Banking & Finance" },
    { value: "cyber", label: "Cybersecurity" },
    { value: "education", label: "Education" },
    { value: "finops", label: "FinOps" },
    { value: "consulting", label: "IT Consulting" },
    { value: "other", label: "Other regulated industry" }
  ]

  const totalSteps = questions.length ? questions.length + 2 : 2

  // Progress calculations
  const progressPct = ((index + 1) / totalSteps) * 100

  const handleNextIntake = async () => {
    setValidationError('')
    setServerError('')

    if (!org.trim()) {
      setValidationError(orgType === 'public' ? 'Agency name is required.' : 'Company name is required.')
      return
    }
    if (!role) {
      setValidationError('Role selection is required.')
      return
    }
    if (!domain) {
      setValidationError(orgType === 'public' ? 'Department / Mandate is required.' : 'Industry is required.')
      return
    }

    setLoadingQuestions(true)
    try {
      const { data } = await api.post('/survey/generate-questions', {
        orgType,
        org,
        role,
        domain
      })
      
      if (data && Array.isArray(data.questions) && data.questions.length >= 5) {
        setQuestions(data.questions)
      } else {
        throw new Error("Invalid questions response")
      }
    } catch (err) {
      console.warn("Failed to fetch custom dynamic questions, loading fallbacks...", err)
      const formattedFallbacks = personalizeFallbackQuestions(DEFAULT_TEMPLATE_QUESTIONS, {
        orgType,
        org,
        role,
        domain
      })
      setQuestions(formattedFallbacks)
    } finally {
      setLoadingQuestions(false)
      setIndex(1)
    }
  }

  const handleAnswerPick = (qId, optionVal, isMulti) => {
    setValidationError('')
    if (isMulti) {
      const current = answers[qId] || []
      const next = current.includes(optionVal)
        ? current.filter(v => v !== optionVal)
        : [...current, optionVal]
      setAnswers({ ...answers, [qId]: next })
    } else {
      setAnswers({ ...answers, [qId]: optionVal })
    }
  }

  const handleNextQuestion = () => {
    setValidationError('')
    const activeQ = questions[index - 1]
    const chosen = answers[activeQ.id]
    
    if (!chosen || (Array.isArray(chosen) && chosen.length === 0)) {
      setValidationError('Please select an option to proceed.')
      return
    }

    setIndex(index + 1)
  }

  const handleBack = () => {
    setValidationError('')
    setServerError('')
    setIndex(Math.max(0, index - 1))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationError('')
    setServerError('')
    setSubmitting(true)

    try {
      const payload = {
        intake: {
          orgType,
          org,
          role,
          domain
        },
        answers,
        questions,
        email: email.trim() || null
      }

      const { data } = await api.post('/survey', payload)
      sessionStorage.setItem('certaintyai_last_token', data.anon_token)
      navigate(`/report/${data.anon_token}`, { replace: true })
    } catch (err) {
      setSubmitting(false)
      const detail = err.response?.data?.detail
      setServerError(typeof detail === 'string' ? detail : 'Failed to compile report. Please try again.')
    }
  }

  // Handle Autocomplete Keys
  const handleAcKeyDown = (e) => {
    if (e.key === 'Tab') {
      if (acOpen && acFiltered.length > 0 && acHighlightIndex >= 0) {
        setOrg(acFiltered[acHighlightIndex])
        setAcOpen(false)
      } else {
        const exampleVal = orgType === 'public' ? 'Department of Health' : 'ACME Corporation'
        setOrg(exampleVal)
        setAcOpen(false)
      }
      return
    }

    if (!acOpen || !acFiltered.length) return
    
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setAcHighlightIndex(i => (i + 1) % acFiltered.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setAcHighlightIndex(i => (i - 1 + acFiltered.length) % acFiltered.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (acHighlightIndex >= 0) {
        setOrg(acFiltered[acHighlightIndex])
      }
      setAcOpen(false)
    } else if (e.key === 'Escape') {
      setAcOpen(false)
    }
  }

  return (
    <div className="theme-parchment min-h-[calc(100vh-80px)] flex items-center justify-center p-6 bg-[#F4F0E6]">
      {/* Loading Overlay */}
      {loadingQuestions && (
        <div className="fixed inset-0 z-50 bg-[#F4F0E6]/95 backdrop-blur-sm flex items-center justify-center px-6 text-[#14161A]">
          <div className="text-center max-w-md">
            <div className="mx-auto h-12 w-12 rounded-full border-2 border-[#14161A]/10 border-t-[#A87C3C] animate-spin" />
            <h3 className="font-serif-brand text-2xl font-semibold mt-6">Tailoring your assessment</h3>
            <p className="mt-2 text-sm text-[#3B3D42]">Designing specialized AI readiness scenarios for {role} at {org}...</p>
          </div>
        </div>
      )}

      {submitting && (
        <div className="fixed inset-0 z-50 bg-[#F4F0E6]/95 backdrop-blur-sm flex items-center justify-center px-6 text-[#14161A]">
          <div className="text-center max-w-md">
            <div className="mx-auto h-12 w-12 rounded-full border-2 border-[#14161A]/10 border-t-[#A87C3C] animate-spin" />
            <h3 className="font-serif-brand text-2xl font-semibold mt-6">Generating your report</h3>
            <p className="mt-2 text-sm text-[#3B3D42]">Evaluating dynamic responses and resolving framework compliance mappings...</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-[580px] bg-[#FBF8F0] border border-[#14161A]/12 rounded-3xl p-8 sm:p-10 shadow-lg">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-1 bg-[#ECE5D6] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#A87C3C] transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#73706A]">
              Step {index + 1} of {totalSteps}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#7C5723]">
              {index === 0 ? 'Intake Profile' : (index === totalSteps - 1 ? 'Report Dispatch' : 'Scoring Scenario')}
            </span>
          </div>
        </div>

        {/* Step 1: Intake */}
        {index === 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif-brand text-3xl font-normal leading-tight text-[#14161A]">
                How <em>defensible</em> is your AI today?
              </h2>
              <p className="text-xs text-[#3B3D42] mt-1.5 leading-relaxed">
                Provide your role and domain parameters to tailor a dynamic board-ready evaluation dashboard.
              </p>
            </div>

            {/* Private/Public Toggle buttons */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#73706A] block mb-2">Organization Sector *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setOrgType('private')
                    setOrg('')
                    setRole('')
                    setDomain('')
                  }}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all ${
                    orgType === 'private'
                      ? 'border-[#A87C3C] bg-[#A87C3C]/8 text-[#14161A]'
                      : 'border-[#14161A]/10 bg-transparent text-[#73706A] hover:border-[#14161A]/20'
                  }`}
                >
                  <span className="font-bold text-xs">Private Sector</span>
                  <span className="text-[10px] mt-0.5 opacity-80">Commercial Company</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOrgType('public')
                    setOrg('')
                    setRole('')
                    setDomain('')
                  }}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all ${
                    orgType === 'public'
                      ? 'border-[#A87C3C] bg-[#A87C3C]/8 text-[#14161A]'
                      : 'border-[#14161A]/10 bg-transparent text-[#73706A] hover:border-[#14161A]/20'
                  }`}
                >
                  <span className="font-bold text-xs">Public Sector</span>
                  <span className="text-[10px] mt-0.5 opacity-80">Government Agency</span>
                </button>
              </div>
            </div>

            {/* Inputs Block */}
            <div className="space-y-4">
              {/* Org Name / Autocomplete */}
              <div className="relative">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#73706A] block mb-1.5">
                  {orgType === 'public' ? 'Agency Name *' : 'Company Name *'}
                </label>
                <input
                  type="text"
                  value={org}
                  onChange={(e) => {
                    setOrg(e.target.value)
                    setAcOpen(true)
                  }}
                  onKeyDown={handleAcKeyDown}
                  onFocus={() => {
                    setAcOpen(true)
                  }}
                  onBlur={() => {
                    setTimeout(() => setAcOpen(false), 200)
                  }}
                  placeholder={orgType === 'public' ? 'e.g. Department of Health' : 'e.g. ACME Corporation'}
                  className="w-full px-4 py-3.5 rounded-xl bg-[#ECE5D6]/30 border border-[#14161A]/12 focus:border-[#A87C3C] focus:outline-none transition text-sm text-[#14161A]"
                />
                
                {/* Autocomplete items */}
                {acOpen && acFiltered.length > 0 && (
                  <ul className="absolute z-30 w-full mt-1 max-h-48 overflow-y-auto bg-[#FBF8F0] border border-[#14161A]/14 rounded-xl shadow-lg py-1">
                    {acFiltered.map((agency, i) => (
                      <li key={agency}>
                        <button
                          type="button"
                          onMouseDown={() => {
                            setOrg(agency)
                            setAcOpen(false)
                          }}
                          className={`w-full text-left px-4 py-2 text-xs text-[#14161A] hover:bg-[#ECE5D6]/45 transition ${
                            i === acHighlightIndex ? 'bg-[#ECE5D6]/60' : ''
                          }`}
                        >
                          {agency}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Predefined Roles dropdown select */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#73706A] block mb-1.5">Your Role *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-[#ECE5D6]/30 border border-[#14161A]/12 focus:border-[#A87C3C] focus:outline-none transition text-sm text-[#14161A]"
                >
                  <option value="">Select your role...</option>
                  {CANONICAL_ROLES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Adaptive 3rd field: Mandate / Industry */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#73706A] block mb-1.5">
                  {orgType === 'public' ? 'Department / Mandate *' : 'Industry *'}
                </label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-[#ECE5D6]/30 border border-[#14161A]/12 focus:border-[#A87C3C] focus:outline-none transition text-sm text-[#14161A]"
                >
                  <option value="">
                    {orgType === 'public' ? 'Select department or mandate...' : 'Select your industry...'}
                  </option>
                  {domOpts.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {validationError && (
              <div className="text-xs text-[#7C5723] bg-[#ECE5D6] border border-[#A87C3C]/20 px-3.5 py-2.5 rounded-lg">
                ⚠ {validationError}
              </div>
            )}

            <button
              type="button"
              onClick={handleNextIntake}
              className="w-full py-4.5 px-6 rounded-lg bg-[#14161A] text-[#F4F0E6] font-bold hover:bg-[#7C5723] hover:text-white transition shadow text-sm"
            >
              Tailor my scenario assessment →
            </button>
          </div>
        )}

        {/* Dynamic Questions (Steps 2..N) */}
        {index > 0 && index <= questions.length && (() => {
          const q = questions[index - 1]
          const chosen = answers[q.id]

          return (
            <div className="space-y-6">
              <div>
                <div className="text-[10px] font-bold tracking-widest text-[#7C5723] uppercase block">
                  ✦ Tailored for {role} · {org}
                </div>
                <h3 className="font-serif-brand text-2xl font-normal leading-tight text-[#14161A] mt-3">
                  {q.text}
                </h3>
                {q.sub && (
                  <p className="text-xs text-[#73706A] leading-relaxed mt-1.5 italic font-serif-brand">
                    {q.sub}
                  </p>
                )}
              </div>

              {/* Options list */}
              <div className="space-y-2.5">
                {q.options.map(opt => {
                  const isSelected = q.multi 
                    ? (Array.isArray(chosen) && chosen.includes(opt.value))
                    : chosen === opt.value

                  return (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => handleAnswerPick(q.id, opt.value, q.multi)}
                      className={`w-full text-left rounded-xl border p-4 transition-all duration-150 flex items-center gap-3.5 ${
                        isSelected
                          ? 'border-[#A87C3C] bg-[#A87C3C]/8 text-[#14161A]'
                          : 'border-[#14161A]/10 hover:border-[#14161A]/20 bg-transparent text-[#3B3D42] hover:text-[#14161A]'
                      }`}
                    >
                      <span className={`w-4.5 h-4.5 rounded-full border flex-shrink-0 flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'border-[#A87C3C] bg-[#A87C3C]' 
                          : 'border-[#14161A]/22 bg-transparent'
                      }`}>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FBF8F0]" />
                        )}
                      </span>
                      <span className="text-xs font-semibold leading-normal">{opt.label}</span>
                    </button>
                  )
                })}
              </div>

              {validationError && (
                <div className="text-xs text-[#7C5723] bg-[#ECE5D6] border border-[#A87C3C]/20 px-3.5 py-2.5 rounded-lg">
                  ⚠ {validationError}
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-[#14161A]/10 mt-6">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-2.5 rounded-lg text-xs font-bold text-[#3B3D42] border border-[#14161A]/10 hover:border-[#14161A]/22 transition"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 rounded-lg bg-[#14161A] text-[#F4F0E6] font-bold hover:bg-[#7C5723] hover:text-white transition shadow text-xs"
                >
                  Continue →
                </button>
              </div>
            </div>
          )
        })()}

        {/* Final step: Dispatch report */}
        {index === questions.length + 1 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="font-serif-brand text-3xl font-normal leading-tight text-[#14161A]">
                Generate your report
              </h2>
              <p className="text-xs text-[#3B3D42] mt-1.5 leading-relaxed">
                Provide your email address to claim this report under your profile (optional).
              </p>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#73706A] block mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-4 py-3.5 rounded-xl bg-[#ECE5D6]/30 border border-[#14161A]/12 focus:border-[#A87C3C] focus:outline-none transition text-sm text-[#14161A]"
              />
            </div>

            {serverError && (
              <div className="text-xs text-[#7C5723] bg-[#ECE5D6] border border-[#A87C3C]/20 px-3.5 py-2.5 rounded-lg">
                ⚠ {serverError}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-[#14161A]/10 mt-6">
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2.5 rounded-lg text-xs font-bold text-[#3B3D42] border border-[#14161A]/10 hover:border-[#14161A]/22 transition"
              >
                ← Back
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-[#14161A] text-[#F4F0E6] font-bold hover:bg-[#7C5723] hover:text-white transition shadow text-xs"
              >
                🚀 Generate Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
