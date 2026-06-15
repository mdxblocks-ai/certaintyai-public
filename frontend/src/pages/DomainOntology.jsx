import React, { useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import Footer from '../components/Footer'
import { DOMAIN_ONTOLOGIES, findDomainOntology } from '../lib/domainOntologies'

export default function DomainOntology() {
  const { slug } = useParams()
  const domain = findDomainOntology(slug)

  useEffect(() => {
    if (typeof window !== 'undefined' && domain) {
      const prev = document.title
      document.title = `${domain.name} Ontology · CertaintyAI`
      return () => { document.title = prev }
    }
  }, [domain])

  if (!domain) {
    return <Navigate to="/" replace />
  }

  const isComingSoon = domain.status === 'coming-soon'
  const entityCount = domain.entityChain.length
  const relationshipCount = Math.max(entityCount - 1, 0)

  return (
    <div className="theme-parchment min-h-screen bg-[#F4F0E6] text-[#14161A] font-sans-brand relative isolate">

      {/* ===== Hero ===== */}
      <section className="page-container pt-12 pb-10">
        <div className="flex items-center gap-3 text-[11px] text-[#73706A] mb-6">
          <Link to="/" className="hover:text-[#7C5723]">Home</Link>
          <span aria-hidden>›</span>
          <Link to="/#explorer" className="hover:text-[#7C5723]">Industries & Domains</Link>
          <span aria-hidden>›</span>
          <span className="text-[#14161A] font-semibold">{domain.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.22em] uppercase mb-3" style={{ color: domain.accent }}>
              <span className="w-5 h-px" style={{ backgroundColor: domain.accent }} />
              {domain.eyebrow}
            </div>
            <h1 className="font-serif-brand text-4xl sm:text-5xl text-[#14161A] font-normal leading-tight tracking-tight mb-5">
              {domain.headline}
            </h1>
            <p className="text-base text-[#3B3D42] leading-relaxed max-w-3xl">
              {domain.blurb}
            </p>
          </div>

          <div className="lg:col-span-4">
            <div
              className="rounded-2xl p-5 border bg-[#FBF8F0] relative overflow-hidden"
              style={{ borderColor: `${domain.accent}33`, borderTopWidth: 3, borderTopColor: domain.accent }}
            >
              <div
                aria-hidden
                className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-50 pointer-events-none"
                style={{ background: `radial-gradient(circle, ${domain.glow} 0%, transparent 70%)` }}
              />
              <div className="relative">
                <div className="text-[10px] font-semibold tracking-widest uppercase text-[#73706A] mb-3">
                  Ontology snapshot
                </div>
                <dl className="space-y-2.5 text-[13px]">
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-[#73706A]">Primary entity</dt>
                    <dd className="font-semibold text-[#14161A]">{domain.primaryEntity}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-[#73706A]">Entities</dt>
                    <dd className="font-semibold text-[#14161A]">{entityCount}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-[#73706A]">Relationships</dt>
                    <dd className="font-semibold text-[#14161A]">{relationshipCount}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-[#73706A]">Status</dt>
                    <dd className="font-semibold" style={{ color: isComingSoon ? '#B45309' : '#047857' }}>
                      {isComingSoon ? 'Coming soon' : 'Live pack'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Entity Chain ===== */}
      <section className="page-container py-10 border-t border-[#14161A]/8">
        <div className="flex items-end justify-between gap-6 mb-8 flex-wrap">
          <div>
            <span className="text-[11px] font-semibold tracking-[0.22em] text-[#7C5723] uppercase block mb-2">Entity chain</span>
            <h2 className="font-serif-brand text-2xl sm:text-3xl text-[#14161A] font-normal leading-tight">
              How the graph flows.
            </h2>
          </div>
          {isComingSoon && (
            <span className="text-[12px] text-[#B45309] font-semibold">
              Reference model · pack content in early access
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {domain.entityChain.map((entity, i) => (
            <React.Fragment key={entity}>
              <div
                className="px-4 py-2.5 rounded-xl bg-[#FBF8F0] border shadow-sm font-semibold text-[13px] text-[#14161A]"
                style={{ borderColor: `${domain.accent}40` }}
              >
                {entity}
              </div>
              {i < domain.entityChain.length - 1 && (
                <span aria-hidden className="text-[#73706A] text-lg">→</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {domain.upstreamSystems?.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-[10px] font-bold tracking-widest uppercase text-[#73706A] mb-2.5">Upstream systems</div>
              <div className="flex flex-wrap gap-2">
                {domain.upstreamSystems.map((s) => (
                  <span
                    key={s}
                    className="text-[12px] px-3 py-1.5 rounded-lg border border-[#14161A]/10 bg-[#ECE5D6]/40 text-[#3B3D42]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-widest uppercase text-[#73706A] mb-2.5">Frameworks mapped at every node</div>
              <div className="flex flex-wrap gap-2">
                {domain.frameworks.map((f) => (
                  <span
                    key={f}
                    className="text-[12px] px-3 py-1.5 rounded-lg border border-[#14161A]/10 bg-[#FBF8F0] text-[#3B3D42] font-semibold"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ===== Copilots Built on This Ontology ===== */}
      {domain.copilots?.length > 0 && (
        <section className="page-container py-10 border-t border-[#14161A]/8">
          <div className="flex items-end justify-between gap-6 mb-6 flex-wrap">
            <div>
              <span className="text-[11px] font-semibold tracking-[0.22em] text-[#7C5723] uppercase block mb-2">Copilots built on this ontology</span>
              <h2 className="font-serif-brand text-2xl sm:text-3xl text-[#14161A] font-normal leading-tight">
                What this ontology already powers.
              </h2>
            </div>
            {domain.marketplaceAnchor && (
              <Link
                to="/copilot-marketplace"
                className="text-[12px] font-bold text-[#A87C3C] hover:text-[#7C5723] shrink-0"
              >
                See full marketplace →
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {domain.copilots.map((c) => (
              <div
                key={c}
                className="bg-[#FBF8F0] border border-[#14161A]/10 rounded-xl p-4 text-[13px] text-[#14161A] font-semibold"
              >
                {c}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== CTAs — Ontology vs Foundry are different journeys ===== */}
      <section className="page-container pt-10 pb-20">
        <div
          className="rounded-3xl p-8 sm:p-10 border bg-[#FBF8F0] relative overflow-hidden"
          style={{ borderColor: `${domain.accent}33` }}
        >
          <div
            aria-hidden
            className="absolute -bottom-16 -right-16 w-72 h-72 rounded-full blur-3xl opacity-40 pointer-events-none"
            style={{ background: `radial-gradient(circle, ${domain.glow} 0%, transparent 70%)` }}
          />
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <span className="text-[11px] font-semibold tracking-[0.22em] text-[#7C5723] uppercase block mb-2">Next step</span>
              <h2 className="font-serif-brand text-2xl sm:text-3xl text-[#14161A] font-normal leading-tight mb-3">
                {isComingSoon
                  ? `Request early access to the ${domain.name} pack.`
                  : `Deploy this ontology with the Foundry.`}
              </h2>
              <p className="text-sm text-[#3B3D42] leading-relaxed max-w-2xl">
                {isComingSoon
                  ? 'Ontology Explorer and Foundry are different journeys. Once this pack is live in the Foundry, you will be able to stand it up, connect upstream systems, and assemble domain copilots in weeks.'
                  : 'Ontology Explorer shows you the model. The Foundry is where you deploy it — connect upstream systems, map your data, and assemble defensible domain copilots without rebuilding the layer underneath.'}
              </p>
            </div>
            <div className="lg:col-span-5 flex flex-col gap-3">
              <Link
                to="/foundry"
                className="inline-flex items-center justify-between gap-3 py-3.5 px-5 rounded-xl bg-[#14161A] text-[#F4F0E6] hover:bg-[#7C5723] transition font-bold text-sm shadow"
              >
                <span>Deploy this Ontology with Foundry</span>
                <span aria-hidden>→</span>
              </Link>
              <Link
                to="/foundry"
                className="inline-flex items-center justify-between gap-3 py-3.5 px-5 rounded-xl border border-[#14161A]/15 text-[#14161A] hover:border-[#A87C3C] hover:text-[#7C5723] transition font-bold text-sm bg-[#FBF8F0]"
              >
                <span>Build Domain Copilots with Foundry</span>
                <span aria-hidden>→</span>
              </Link>
              {domain.marketplaceAnchor && (
                <Link
                  to="/copilot-marketplace"
                  className="inline-flex items-center justify-between gap-3 py-3 px-5 rounded-xl text-[#A87C3C] hover:text-[#7C5723] transition font-bold text-[13px]"
                >
                  <span>Browse {domain.name} Copilots</span>
                  <span aria-hidden>→</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Other Ontologies ===== */}
      <section className="page-container pb-16">
        <div className="text-[10px] font-bold tracking-widest uppercase text-[#73706A] mb-4">
          Other domain ontologies
        </div>
        <div className="flex flex-wrap gap-2">
          {DOMAIN_ONTOLOGIES.filter((d) => d.slug !== domain.slug).map((d) => (
            <Link
              key={d.slug}
              to={`/ontology/${d.slug}`}
              className="text-[12.5px] px-3.5 py-2 rounded-lg border border-[#14161A]/12 bg-[#FBF8F0] text-[#3B3D42] hover:border-[#A87C3C] hover:text-[#14161A] font-semibold transition"
            >
              {d.name}{d.status === 'coming-soon' ? ' · soon' : ''} →
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}
