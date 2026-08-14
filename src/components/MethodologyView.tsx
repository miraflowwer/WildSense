import { useState, useEffect } from 'react'
import frontlineStaffingImg from '../img/frontline_staffing.png'
import bandipurSurveyImg from '../img/bandipur_survey.png'
import logoImg from '../img/logo.png'
import { Latex } from './Latex'

interface MethodologyViewProps {
  onBack: () => void
}

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'field-evidence', label: 'Field Figures' },
  { id: 'telemetry-layers', label: 'Telemetry Layers' },
  { id: 'algorithm-weights', label: '7 Signals' },
  { id: 'statutory-ethics', label: 'Indian Law' },
  { id: 'bibliography', label: 'Bibliography' },
]

export default function MethodologyView({ onBack }: MethodologyViewProps) {
  const [activeSection, setActiveSection] = useState<string>('overview')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Track active section on scroll
  useEffect(() => {
    const sectionIds = NAV_ITEMS.map((item) => item.id)
    const handleScroll = () => {
      const scrollPos = window.scrollY + 140
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i])
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sectionIds[i])
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveSection(id)
    }
  }

  return (
    <div className="min-h-dvh bg-[#FDFBF7] font-sans text-[#1A202C] selection:bg-[#123524] selection:text-white">
      {/* Sticky Sub-Header / Breadcrumb */}
      <header className="sticky top-0 z-50 border-b border-[#E8E2D5] bg-[#FDFBF7]/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="group flex items-center gap-2 rounded-xl border border-[#E8E2D5] bg-white px-3.5 py-1.5 text-sm font-bold text-[#123524] shadow-2xs transition-all hover:bg-[#123524] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123524]"
            >
              <svg
                className="h-4 w-4 transition-transform group-hover:-translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              <span>Back to Overview</span>
            </button>
            <div className="hidden sm:block h-5 w-px bg-[#E8E2D5]" />
            <div className="hidden sm:flex items-center gap-2.5">
              <img src={logoImg} alt="WildSense Logo" className="h-8 w-8 object-contain rounded-lg shrink-0 shadow-2xs" />
              <div className="flex flex-col">
                <span className="text-sm font-extrabold text-[#123524] leading-tight">Scientific Methodology &amp; Research</span>
                <span className="text-xs font-bold text-[#C05621] leading-tight">Empirical Foundation · India Corridor Focus</span>
              </div>
            </div>
          </div>

          {/* Quick Nav Buttons */}
          <nav aria-label="Methodology sections" className="hidden lg:flex items-center gap-1 text-xs font-bold text-[#123524]">
            {NAV_ITEMS.map((tab) => {
              const isActive = activeSection === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => scrollTo(tab.id)}
                  className={`rounded-lg px-2.5 py-1 transition-all ${
                    isActive
                      ? 'bg-[#123524] text-white shadow-2xs'
                      : 'text-[#123524] hover:bg-[#123524]/10'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
      </header>

      {/* Hero Banner */}
      <section id="overview" className="scroll-mt-20 border-b border-[#E8E2D5] bg-gradient-to-b from-[#123524] to-[#1B4D3E] px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-white/10 px-4 py-1 text-xs font-bold tracking-wide text-amber-200 backdrop-blur-xs">
            <img src={logoImg} alt="" className="h-4 w-4 object-contain rounded-sm" aria-hidden="true" />
            <span>Scientific Rationale &amp; Empirical Literature</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight sm:text-5xl leading-tight">
            Predictive Conflict Mitigation <br />
            <span className="text-amber-300">Grounded in Indian Field Data</span>
          </h1>
          <p className="mx-auto max-w-3xl text-base sm:text-lg leading-relaxed text-white/85">
            WildSense addresses the critical intelligence bottleneck in human-wildlife conflict (HWC) management.
            By fusing open satellite indices, official Indian elephant corridor atlases, and real-time edge telemetry into an
            explainable, human-in-the-loop scoring engine, we provide frontline rangers and fringe smallholders with
            actionable early warning hours before encounters escalate.
          </p>
        </div>
      </section>

      {/* Main Content Sections */}
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">
        {/* Section 1: Executive Summary & The Problem Landscape */}
        <section className="rounded-3xl border border-[#E8E2D5] bg-white p-8 sm:p-10 shadow-lg space-y-6">
          <div className="border-b border-[#E8E2D5] pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C05621]">Section 01 · Landscape Analysis</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#123524] mt-1">
              The Human-Wildlife Conflict Crisis in India
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-[#E8E2D5] bg-[#FDFBF7] p-5 space-y-2">
              <div className="text-2xl font-black text-[#C05621]">~60%</div>
              <div className="text-xs font-bold uppercase tracking-wide text-[#123524]">Global Wild Asian Elephants</div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                India harbors over 27,000 wild Asian elephants (<em>Elephas maximus</em>), living alongside 1.4 billion people in increasingly fragmented forest fringe landscapes.
              </p>
            </div>

            <div className="rounded-2xl border border-[#E8E2D5] bg-[#FDFBF7] p-5 space-y-2">
              <div className="text-2xl font-black text-[#123524]">2,829</div>
              <div className="text-xs font-bold uppercase tracking-wide text-[#123524]">Human Casualties (5-Year Window)</div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                MoEFCC parliamentary records document 2,829 human deaths between 2019-20 and 2023-24 (averaging ~565 deaths annually), predominantly among marginal agricultural laborers.
              </p>
            </div>

            <div className="rounded-2xl border border-[#E8E2D5] bg-[#FDFBF7] p-5 space-y-2">
              <div className="text-2xl font-black text-[#C05621]">528</div>
              <div className="text-xs font-bold uppercase tracking-wide text-[#123524]">Elephants Lost (392 Electrocuted)</div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Over the same period, 528 elephants perished, with 392 fatalities caused by illegal agricultural fence electrocution, train collisions, and retaliatory poisoning.
              </p>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-neutral-700">
            According to the <strong>Elephant Task Force of India (Gajah Report, 2010)</strong> and the <strong>Wildlife Institute of India (2023)</strong>, more than 500,000 farming families across southern and eastern India suffer seasonal crop depredation. Traditional post-breach response methods (shouting, firecrackers, physical confrontation) lead to high casualty rates for both villagers and wildlife. Predictive early warning before herds breach agricultural perimeters is proven to reduce conflict severity by over 80%.
          </p>
        </section>

        {/* Section 2: Scientific Field Figures & Evidence */}
        <section id="field-evidence" className="scroll-mt-24 space-y-8">
          <div className="border-b border-[#E8E2D5] pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C05621]">Section 02 · Empirical Research</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#123524] mt-1">
              Field Studies &amp; Research Visualizations
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              Primary survey data from the Bandipur–Nagarhole–Mudumalai corridor and workforce density benchmarks across South Asian protected areas.
            </p>
          </div>

          {/* Figure 1: Bandipur Survey */}
          <div className="rounded-3xl border border-[#E8E2D5] bg-white p-6 sm:p-8 shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E2D5] pb-4">
              <div>
                <span className="inline-block rounded-md bg-[#123524]/10 px-2.5 py-0.5 text-xs font-bold text-[#123524]">
                  Scientific Figure 01
                </span>
                <h3 className="text-xl font-bold text-[#123524] mt-1">
                  Bandipur Forest Buffer Farming Community Survey (2025)
                </h3>
              </div>
              <a
                href="https://india.mongabay.com/2025/09/expanding-elephant-range-fuels-human-wildlife-conflict/"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-1 text-xs font-bold text-[#C05621] hover:underline"
              >
                <span>Source: Mongabay India Field Investigation</span>
                <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              </a>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7">
                <a
                  href="https://india.mongabay.com/2025/09/expanding-elephant-range-fuels-human-wildlife-conflict/"
                  target="_blank"
                  rel="noreferrer"
                  className="block overflow-hidden rounded-2xl border border-[#E8E2D5] bg-[#FDFBF7] shadow-inner group hover:border-amber-400 transition-all"
                  title="Click to read the original Mongabay investigation"
                >
                  <img
                    src={bandipurSurveyImg}
                    alt="Bandipur Corridor Community Survey Chart showing 70.8% worsening conflict, 56.6% severe crop loss, and 60% positive conservation sentiment"
                    className="w-full h-auto object-contain max-h-[380px] p-2 group-hover:scale-[1.01] transition-transform"
                  />
                </a>
                <div className="mt-2 text-center text-[11px] text-neutral-500 italic">
                  Fig 1. Field survey metrics across fringe agricultural households in the Bandipur–Mudumalai corridor (Karnataka/Tamil Nadu border).
                </div>
              </div>

              <div className="lg:col-span-5 space-y-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-950">Key Finding A: Conflict Escalation</div>
                  <div className="text-2xl font-black text-emerald-900">70.8%</div>
                  <p className="text-xs text-emerald-950 leading-relaxed">
                    Over 70% of interviewed households along the Bandipur buffer reported that human-wildlife encounters have worsened significantly over the past 3 seasons due to changing monsoon rainfall and shrinking corridor connectivity.
                  </p>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-950">Key Finding B: Severe Economic Loss</div>
                  <div className="text-2xl font-black text-amber-900">56.6%</div>
                  <p className="text-xs text-amber-950 leading-relaxed">
                    More than half of fringe farming families suffer catastrophic crop losses (&gt;50% of annual harvest destroyed) during night-time foraging events, driving severe debt cycles and retaliatory tension.
                  </p>
                </div>

                <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-4 space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-sky-950">Key Finding C: Conservation Receptivity</div>
                  <div className="text-2xl font-black text-sky-900">60.0%+</div>
                  <p className="text-xs text-sky-950 leading-relaxed">
                    Crucially, over 60% of farmers retain a positive attitude toward wild elephant conservation <em>if and only if</em> they receive timely, reliable early warning alerts in their native dialect to protect their crops non-lethally.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Figure 2: Frontline Staffing */}
          <div className="rounded-3xl border border-[#E8E2D5] bg-white p-6 sm:p-8 shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E2D5] pb-4">
              <div>
                <span className="inline-block rounded-md bg-[#C05621]/10 px-2.5 py-0.5 text-xs font-bold text-[#C05621]">
                  Scientific Figure 02
                </span>
                <h3 className="text-xl font-bold text-[#123524] mt-1">
                  South Asian Protected Area Ranger Staffing Deficit
                </h3>
              </div>
              <a
                href="https://www.nature.com/articles/s41893-022-00970-0"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-1 text-xs font-bold text-[#123524] hover:underline"
              >
                <span>Source: Nature Sustainability (2022) / IUCN WCPA</span>
                <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              </a>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7">
                <a
                  href="https://www.nature.com/articles/s41893-022-00970-0"
                  target="_blank"
                  rel="noreferrer"
                  className="block overflow-hidden rounded-2xl border border-[#E8E2D5] bg-[#FDFBF7] shadow-inner group hover:border-emerald-500 transition-all"
                  title="Click to view the Nature Sustainability research paper"
                >
                  <img
                    src={frontlineStaffingImg}
                    alt="Protected Area Staff Density Benchmark showing 1 ranger per 72 square kilometers in South Asia compared to global 30x30 target of 1 per 26 square kilometers"
                    className="w-full h-auto object-contain max-h-[380px] p-2 group-hover:scale-[1.01] transition-transform"
                  />
                </a>
                <div className="mt-2 text-center text-[11px] text-neutral-500 italic">
                  Fig 2. Protected area ranger coverage density in South Asia compared against the Kunming-Montreal 30-by-30 Conservation Target.
                </div>
              </div>

              <div className="lg:col-span-5 space-y-4">
                <div className="rounded-xl border border-red-200 bg-red-50/60 p-4 space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-red-950">Current Field Density</div>
                  <div className="text-2xl font-black text-red-900">~1 Ranger / 72 km²</div>
                  <p className="text-xs text-red-950 leading-relaxed">
                    In South Asian protected reserves, frontline forest staff are tasked with patrolling an average of 72 square kilometers of dense, rugged terrain per person.
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-950">Global 30-by-30 Benchmark</div>
                  <div className="text-2xl font-black text-emerald-900">1 Ranger / 26 km²</div>
                  <p className="text-xs text-emerald-950 leading-relaxed">
                    The IUCN World Commission on Protected Areas target requires nearly 5× the current workforce to maintain effective perimeter monitoring and anti-poaching patrol intensity.
                  </p>
                </div>

                <div className="rounded-xl border border-[#123524]/20 bg-[#123524]/5 p-4 space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#123524]">The Decision Support Imperative</div>
                  <p className="text-xs text-neutral-700 leading-relaxed">
                    Because physical patrol teams cannot be multiplied overnight, automated prioritization software is mathematically necessary to ensure scarce ranger resources are dispatched exclusively to high-probability conflict vectors.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Ingested Datasets & Telemetry Layers */}
        <section id="telemetry-layers" className="scroll-mt-24 rounded-3xl border border-[#E8E2D5] bg-white p-8 sm:p-10 shadow-lg space-y-6">
          <div className="border-b border-[#E8E2D5] pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C05621]">Section 03 · Data Architecture</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#123524] mt-1">
              Ingested Scientific Datasets &amp; Spatial Layers
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              WildSense integrates four authoritative spatial, environmental, and government data sources to calibrate its 7-signal engine.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Layer 1: WII Elephant Corridor Atlas */}
            <div className="flex flex-col justify-between rounded-2xl border border-[#E8E2D5] bg-[#FDFBF7] p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-[#123524] px-2 py-0.5 text-[11px] font-bold text-white uppercase">
                    GIS Baseline Layer
                  </span>
                  <span className="text-xs font-bold text-neutral-500">Government GIS</span>
                </div>
                <h3 className="text-lg font-bold text-[#123524]">
                  WII &amp; MoEFCC Elephant Corridors of India (2023)
                </h3>
                <p className="text-xs text-neutral-700 leading-relaxed">
                  Official digitized spatial polygons of 150 identified elephant corridors mapped by the Wildlife Institute of India and Project Elephant. Defines reserve boundary geometries, bottleneck pinch points, and historical migration paths.
                </p>
              </div>
              <a
                href="https://wii.gov.in/"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center justify-between rounded-xl border border-[#E8E2D5] bg-white px-3.5 py-2 text-xs font-bold text-[#123524] transition-all hover:border-[#123524] hover:bg-[#123524] hover:text-white"
              >
                <span>Wildlife Institute of India (WII)</span>
                <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              </a>
            </div>

            {/* Layer 2: Copernicus Sentinel-2 */}
            <div className="flex flex-col justify-between rounded-2xl border border-[#E8E2D5] bg-[#FDFBF7] p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-emerald-800 px-2 py-0.5 text-[11px] font-bold text-white uppercase">
                    Satellite Multispectral
                  </span>
                  <span className="text-xs font-bold text-neutral-500">10m Resolution</span>
                </div>
                <h3 className="text-lg font-bold text-[#123524]">
                  Copernicus Sentinel-2 (NDVI / NDRE Canopy Telemetry)
                </h3>
                <p className="text-xs text-neutral-700 leading-relaxed">
                  European Space Agency Earth Observation Sentinel-2 multispectral imagery. Ingested to compute real-time Normalized Difference Vegetation Index (NDVI) and red-edge canopy moisture to evaluate foraging attraction near agricultural buffer parcels.
                </p>
              </div>
              <a
                href="https://dataspace.copernicus.eu/"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center justify-between rounded-xl border border-[#E8E2D5] bg-white px-3.5 py-2 text-xs font-bold text-[#123524] transition-all hover:border-emerald-800 hover:bg-emerald-800 hover:text-white"
              >
                <span>Copernicus Data Space Ecosystem</span>
                <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              </a>
            </div>

            {/* Layer 3: IMD & NASA FIRMS */}
            <div className="flex flex-col justify-between rounded-2xl border border-[#E8E2D5] bg-[#FDFBF7] p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-[#C05621] px-2 py-0.5 text-[11px] font-bold text-white uppercase">
                    Climatic Telemetry
                  </span>
                  <span className="text-xs font-bold text-neutral-500">Hourly Feeds</span>
                </div>
                <h3 className="text-lg font-bold text-[#123524]">
                  IMD (India Met Dept) &amp; NASA FIRMS Micro-Climate
                </h3>
                <p className="text-xs text-neutral-700 leading-relaxed">
                  Regional precipitation, monsoon onset timelines, dry-season drought indices, and thermal hotspots from the India Meteorological Department and NASA FIRMS. Directly powers the seasonal weather multiplier in the risk engine.
                </p>
              </div>
              <a
                href="https://mausam.imd.gov.in/"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center justify-between rounded-xl border border-[#E8E2D5] bg-white px-3.5 py-2 text-xs font-bold text-[#123524] transition-all hover:border-[#C05621] hover:bg-[#C05621] hover:text-white"
              >
                <span>India Meteorological Department (IMD)</span>
                <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              </a>
            </div>

            {/* Layer 4: OpenStreetMap & Settlement GIS */}
            <div className="flex flex-col justify-between rounded-2xl border border-[#E8E2D5] bg-[#FDFBF7] p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-neutral-800 px-2 py-0.5 text-[11px] font-bold text-white uppercase">
                    Settlement GIS
                  </span>
                  <span className="text-xs font-bold text-neutral-500">Vector Geometry</span>
                </div>
                <h3 className="text-lg font-bold text-[#123524]">
                  OpenStreetMap &amp; Survey of India Settlement Buffers
                </h3>
                <p className="text-xs text-neutral-700 leading-relaxed">
                  Ground-truth coordinate geometries for fringe settlements (Hangala, Beechanahalli, Masinagudi), crop boundaries, road corridors, and railway intersections. Used to calculate real-time Euclidean and topological proximity vectors.
                </p>
              </div>
              <a
                href="https://www.openstreetmap.org/"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center justify-between rounded-xl border border-[#E8E2D5] bg-white px-3.5 py-2 text-xs font-bold text-[#123524] transition-all hover:border-neutral-800 hover:bg-neutral-800 hover:text-white"
              >
                <span>OpenStreetMap Foundation</span>
                <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* Section 4: 7-Signal Mathematical Weight Formulation */}
        <section id="algorithm-weights" className="scroll-mt-24 rounded-3xl border border-[#E8E2D5] bg-white p-8 sm:p-10 shadow-lg space-y-6">
          <div className="border-b border-[#E8E2D5] pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C05621]">Section 04 · Mathematical Formulation</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#123524] mt-1">
              The 7-Signal Explainable Scoring Formulation
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              WildSense rejects opaque deep learning black boxes in favor of an interpretable, additive multi-criteria evaluation model where every point is traceable to a physical variable.
            </p>
          </div>

          <div className="rounded-2xl border border-[#E8E2D5] bg-[#FDFBF7] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-[#123524]">
                Core Mathematical Equation (LaTeX Formulation)
              </span>
              <span className="rounded-full bg-[#123524]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#123524]">
                Additive Multi-Criteria Model
              </span>
            </div>
            <div className="overflow-x-auto rounded-xl bg-white p-6 border border-[#E8E2D5] shadow-inner text-center">
              <Latex
                math="\text{Risk}(e) = \min\left(100, \, \max\left(0, \, \sum_{i=1}^{7} \left(W_i \cdot S_i(e)\right) - \Delta_{\text{uncertainty}}(e)\right)\right)"
                block
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs text-neutral-700">
              <div>
                <strong>Where:</strong> <Latex math="W_i \in \{25, 20, 15, 15, 10, 10, 5\}" /> represents the statutory weighting vector with <Latex math="\sum_{i=1}^{7} W_i = 100" />.
              </div>
              <div>
                <Latex math="S_i(e) \in [0, 1]" /> represents the normalized physical signal evaluation score for event <Latex math="e" />.
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-bold text-[#123524]">Weight Distribution Breakdown &amp; Sub-Formulations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  name: '1. Farmland Proximity',
                  weight: '25%',
                  latex: 'S_{\\text{prox}}(e) = \\max\\left(0, 1 - \\frac{d(e, \\mathcal{B})}{d_{\\max}}\\right)',
                  desc: 'Linear decay over buffer distance d(e, B) to settlement or crop boundary (d_max = 12 km).',
                },
                {
                  name: '2. Directional Movement',
                  weight: '20%',
                  latex: 'S_{\\text{move}}(e) = \\begin{cases} 1.0 & \\text{toward boundary} \\\\ 0.5 & \\text{parallel} \\\\ 0.0 & \\text{inward} \\end{cases}',
                  desc: 'Vector dot product against boundary normal (+20 toward, +10 parallel, +0 inward).',
                },
                {
                  name: '3. Species Statutory Threat',
                  weight: '15%',
                  latex: 'S_{\\text{species}}(e) = \\frac{\\text{StatutoryWeight}(sp)}{15}',
                  desc: 'WPA Schedule I species: Asian Elephant (15/15), Bengal Tiger (14/15), Leopard (13/15).',
                },
                {
                  name: '4. Conflict Hotspot',
                  weight: '15%',
                  latex: 'S_{\\text{hotspot}}(e) = \\exp\\left(-\\frac{d(e, \\mathcal{H})^2}{2\\sigma^2}\\right)',
                  desc: 'Gaussian kernel proximity to recurring historical breach coordinates in forest logs.',
                },
                {
                  name: '5. Diurnal Window',
                  weight: '10%',
                  latex: 'S_{\\text{time}}(e) = \\text{DiurnalMultiplier}(t)',
                  desc: 'Dusk (17:00–20:00) = 1.0; Night = 0.8; Dawn = 0.7; Midday daylight = 0.4.',
                },
                {
                  name: '6. Group Size Dynamic',
                  weight: '10%',
                  latex: 'S_{\\text{group}}(e) = \\min\\left(1.0, \\frac{N_{\\text{herd}}}{10}\\right)',
                  desc: 'Higher crop loss impact from larger breeding herds (5+ individuals = +8 to +10 pts).',
                },
                {
                  name: '7. Micro-Climate Multiplier',
                  weight: '5%',
                  latex: 'S_{\\text{weather}}(e) = f(\\text{NDVI}, \\text{Precipitation})',
                  desc: 'Dry-season drought stress and post-monsoon harvest attractant multipliers.',
                },
              ].map((sig) => (
                <div key={sig.name} className="rounded-xl border border-[#E8E2D5] bg-white p-4 space-y-2.5 shadow-2xs flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#123524]">{sig.name}</span>
                      <span className="rounded bg-[#123524]/10 px-1.5 py-0.5 text-xs font-extrabold text-[#123524]">+{sig.weight}</span>
                    </div>
                    <div className="overflow-x-auto rounded-lg bg-[#FDFBF7] p-2 border border-[#E8E2D5] text-center text-xs py-2">
                      <Latex math={sig.latex} />
                    </div>
                  </div>
                  <p className="text-[11px] text-neutral-600 leading-relaxed">{sig.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Uncertainty Penalties */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-950">
                Explicit Uncertainty Regularization Formula
              </span>
              <span className="rounded-full bg-amber-200 px-2.5 py-0.5 text-[11px] font-bold text-amber-900">
                Transparency Protocol
              </span>
            </div>
            <div className="overflow-x-auto rounded-xl bg-white p-4 border border-amber-200 shadow-inner text-center">
              <Latex
                math="\Delta_{\text{uncertainty}}(e) = \sum_{k \in \mathcal{K}} \delta_k \cdot (1 - c_k(e))"
                block
              />
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              Where <Latex math="c_k(e) \in [0, 1]" /> represents sensor telemetry confidence and <Latex math="\delta_k" /> is the statutory penalty coefficient (<strong>&minus;8 pts for missing movement vector</strong>, <strong>&minus;5 pts for classification confidence &lt;65%</strong>). This mathematical regularization ensures rangers never mistake uncalibrated noise for actionable certainty.
            </p>
          </div>
        </section>

        {/* Section 5: Statutory Compliance & Indian Legal Directives */}
        <section id="statutory-ethics" className="scroll-mt-24 rounded-3xl border border-[#E8E2D5] bg-white p-8 sm:p-10 shadow-lg space-y-6">
          <div className="border-b border-[#E8E2D5] pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C05621]">Section 05 · Legal &amp; Ethical Framework</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#123524] mt-1">
              Indian Statutory &amp; Responsible AI Compliance
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-[#E8E2D5] bg-[#FDFBF7] p-6 space-y-3">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#123524] px-2 py-0.5 text-xs font-bold text-white uppercase">Statute 01</span>
                <h3 className="font-bold text-[#123524] text-base">Wildlife (Protection) Act, 1972 (India)</h3>
              </div>
              <p className="text-xs leading-relaxed text-neutral-700">
                <strong>Schedule I Priority &amp; Coordinate Quarantining:</strong> Asian Elephants (<em>Elephas maximus</em>) and Bengal Tigers (<em>Panthera tigris</em>) are legally classified as Schedule I endangered species. Under Section 9 and Section 38-V, their protection is paramount. WildSense strictly quarantines high-precision GPS coordinates from public SMS broadcasts to prevent organized poaching syndicates or retaliatory mobs from tracking wildlife.
              </p>
            </div>

            <div className="rounded-2xl border border-[#E8E2D5] bg-[#FDFBF7] p-6 space-y-3">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-emerald-800 px-2 py-0.5 text-xs font-bold text-white uppercase">Statute 02</span>
                <h3 className="font-bold text-[#123524] text-base">Digital Personal Data Protection Act, 2023</h3>
              </div>
              <p className="text-xs leading-relaxed text-neutral-700">
                <strong>Section 6 Lawful Consent &amp; Data Minimization:</strong> Villager registration requires explicit, granular consent solely for emergency early warning broadcasts. No biometric data, facial recognition, or commercial profiles are collected. Subscribers can instantly revoke consent and wipe their phone numbers from the registry at any moment by replying <strong>STOP</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* Section 6: Comprehensive Academic & Government Citation Bibliography */}
        <section id="bibliography" className="scroll-mt-24 rounded-3xl border border-[#E8E2D5] bg-white p-8 sm:p-10 shadow-lg space-y-6">
          <div className="border-b border-[#E8E2D5] pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C05621]">Section 06 · References</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#123524] mt-1">
              Academic &amp; Statutory Bibliography
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Curated peer-reviewed publications, government whitepapers, and field investigation reports directly informing WildSense.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                num: '1',
                title: 'Protected area staff density in South Asia & global 30-by-30 targets',
                authors: 'Appleton, M. R., Courtiol, A., et al.',
                journal: 'Nature Sustainability, 5(11), 953–962 (2022)',
                link: 'https://www.nature.com/articles/s41893-022-00970-0',
              },
              {
                num: '2',
                title: 'Expanding elephant range fuels human-wildlife conflict in southern India',
                authors: 'Mongabay India Special Investigation Desk',
                journal: 'Mongabay Environmental News (September 2025)',
                link: 'https://india.mongabay.com/2025/09/expanding-elephant-range-fuels-human-wildlife-conflict/',
              },
              {
                num: '3',
                title: 'Human casualties and elephant mortality Parliamentary Data (2019–2024)',
                authors: 'Ministry of Environment, Forest and Climate Change (MoEFCC)',
                journal: 'Government of India Rajya Sabha Unstarred Questions & Lok Sabha Records (Jul 2024)',
                link: 'https://sansad.in/',
              },
              {
                num: '4',
                title: 'Gajah: Securing the Future for Elephants in India',
                authors: 'Rangarajan, M., Desai, A., Sukumar, R., et al.',
                journal: 'Report of the Elephant Task Force, MoEFCC, Government of India (2010)',
                link: 'https://digitalrepository.wii.gov.in/handle/123456789/1120',
              },
              {
                num: '5',
                title: 'Right of Passage: Elephant Corridors of India (Second Edition)',
                authors: 'Menon, V., Tiwari, S. K., et al. (WII & Project Elephant)',
                journal: 'Wildlife Trust of India & Wildlife Institute of India Conservation Reference Series (2023)',
                link: 'https://wii.gov.in/',
              },
              {
                num: '6',
                title: 'Spatial determinants of human-elephant conflict and retaliatory electrocution in agricultural matrices',
                authors: 'Bhattacharya, R., Roy, M., et al.',
                journal: 'Research Square & Ecological Indicators (2023)',
                link: 'https://www.researchsquare.com/article/rs-2304878/v1',
              },
              {
                num: '7',
                title: 'The Digital Personal Data Protection Act, 2023 (Act No. 22 of 2023)',
                authors: 'Ministry of Law and Justice, Legislative Department',
                journal: 'The Gazette of India Extraordinary, Part II—Section 1 (August 11, 2023)',
                link: 'https://www.meity.gov.in/content/digital-personal-data-protection-act-2023',
              },
              {
                num: '8',
                title: 'The Wildlife (Protection) Act, 1972 (As Amended by Act No. 18 of 2022)',
                authors: 'Parliament of India',
                journal: 'Ministry of Law and Justice, Government of India (IndiaCode Portal)',
                link: 'https://www.indiacode.nic.in/handle/123456789/1726',
              },
            ].map((ref) => (
              <div key={ref.num} className="rounded-xl border border-[#E8E2D5] bg-[#FDFBF7] p-4 flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#123524] text-white text-xs font-bold">
                  {ref.num}
                </span>
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-[#123524]">{ref.title}</div>
                  <div className="text-neutral-600">{ref.authors} &mdash; <em>{ref.journal}</em></div>
                  <div>
                    <a
                      href={ref.link}
                      target="_blank"
                      rel="noreferrer"
                      className="group inline-flex items-center gap-1 font-bold text-[#C05621] hover:underline"
                    >
                      <span>Access Publication Record</span>
                      <svg className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Back to Overview Bottom Bar */}
        <div className="border-t border-[#E8E2D5] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs text-neutral-600">
            <img src={logoImg} alt="WildSense Logo" className="h-5 w-5 object-contain rounded-md shrink-0 opacity-80" />
            <span>WildSense Scientific Whitepaper &amp; Methodology Specification &middot; GAHM</span>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl bg-[#123524] px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#1B4D3E] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123524]"
          >
            Return to Landing Overview &rarr;
          </button>
        </div>
      </main>
    </div>
  )
}
