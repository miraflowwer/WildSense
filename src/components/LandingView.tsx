import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { useAuth } from '../auth/authContext'
import { DEMO_EMAIL, DEMO_PASSWORD } from '../auth/demoAccount'
import { lenisHolder } from '../lib/lenisHolder'
import FeatureCarousel from './FeatureCarousel'
import AuthView from './AuthView'
import EthicsModal from './EthicsModal'

gsap.registerPlugin(ScrollTrigger)

interface LandingViewProps {
  onReturnToDashboard?: () => void
}

export default function LandingView({ onReturnToDashboard }: LandingViewProps) {
  const { mode, signIn } = useAuth()
  const [authModal, setAuthModal] = useState<{ open: boolean; view: 'signin' | 'signup' }>({
    open: false,
    view: 'signin',
  })
  const [showEthics, setShowEthics] = useState(false)
  const [demoBusy, setDemoBusy] = useState(false)

  // Refs for GSAP scroll animations
  const heroRef = useRef<HTMLDivElement>(null)
  const sdgRef = useRef<HTMLDivElement>(null)
  const rangerRef = useRef<HTMLDivElement>(null)
  const officerRef = useRef<HTMLDivElement>(null)
  const farmerRef = useRef<HTMLDivElement>(null)
  const ethicsRef = useRef<HTMLDivElement>(null)

  // Initialize Lenis smooth scroll & GSAP ScrollTrigger animations
  useEffect(() => {
    // Respect reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    // Lenis runs a single rAF loop only via the GSAP ticker (autoRaf: false),
    // avoiding the stutter caused by two loops animating the same scroll.
    const lenis = new Lenis({
      autoRaf: false,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    lenis.on('scroll', ScrollTrigger.update)

    const ticker = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(ticker)

    gsap.ticker.lagSmoothing(0)
    lenisHolder.instance = lenis

    // Hero Reveal Animation
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current.children,
        { opacity: 0, y: 35 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' }
      )
    }

    // Persona Section Animations (Scroll-Triggered Fade-In & Scale-Up)
    const personaRefs = [rangerRef.current, officerRef.current, farmerRef.current]
    personaRefs.forEach((el) => {
      if (!el) return
      const textCol = el.querySelector('.persona-text')
      const imageCol = el.querySelector('.persona-image')

      if (textCol) {
        gsap.fromTo(
          textCol,
          { opacity: 0, x: -40 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 75%',
            },
          }
        )
      }

      if (imageCol) {
        gsap.fromTo(
          imageCol,
          { opacity: 0, scale: 0.92, x: 40 },
          {
            opacity: 1,
            scale: 1,
            x: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 75%',
            },
          }
        )
      }
    })

    // SDG 15 & Ethics Section Reveals
    const cardSections = [sdgRef.current, ethicsRef.current]
    cardSections.forEach((el) => {
      if (!el) return
      gsap.fromTo(
        el,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
          },
        }
      )
    })

    return () => {
      gsap.ticker.remove(ticker)
      lenisHolder.instance = null
      lenis.destroy()
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  const handleEnterDemo = async () => {
    if (demoBusy) return
    setDemoBusy(true)
    try {
      if (onReturnToDashboard && mode === 'demo') {
        onReturnToDashboard()
      } else {
        await signIn(DEMO_EMAIL, DEMO_PASSWORD)
      }
    } finally {
      setDemoBusy(false)
    }
  }

  return (
    <div className="relative min-h-dvh bg-[#FDFBF7] font-sans text-[#1A202C] selection:bg-[#123524] selection:text-white">
      {/* Background Decorative Pattern & Ambient Glows */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(#123524_0.8px,transparent_0.8px)] [background-size:28px_28px] opacity-[0.07]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-40 top-20 z-0 h-96 w-96 rounded-full bg-[#123524]/10 blur-[130px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-0 top-1/3 z-0 h-[30rem] w-[30rem] rounded-full bg-[#C05621]/10 blur-[150px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-10 bottom-1/4 z-0 h-[28rem] w-[28rem] rounded-full bg-[#123524]/8 blur-[140px]"
        aria-hidden="true"
      />

      {/* Auth Overlay Modal */}
      {authModal.open && (
        <AuthView
          isModal
          initialView={authModal.view}
          onClose={() => setAuthModal({ ...authModal, open: false })}
        />
      )}

      {/* Ethics Modal */}
      {showEthics && <EthicsModal onClose={() => setShowEthics(false)} />}

      {/* Top Header */}
      <header className="sticky top-0 z-50 border-b border-[#E8E2D5] bg-[#FDFBF7]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Lockup with Full Name */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-[#123524] sm:text-2xl">
                GAHM
              </span>
              <span className="text-sm font-bold text-[#C05621]">
                Global Actions on Habitats and Marines
              </span>
            </div>

            {/* Target SDG 15 Badge */}
            <span className="hidden items-center gap-1.5 rounded-full border border-[#123524]/20 bg-[#123524]/10 px-3 py-1 text-sm font-bold text-[#123524] sm:inline-flex">
              <span className="h-2 w-2 rounded-full bg-[#123524] animate-pulse" aria-hidden="true" />
              SDG 15: Life on Land
            </span>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {mode ? (
              <button
                type="button"
                onClick={onReturnToDashboard}
                className="rounded-xl border border-[#123524] bg-[#123524] px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#1B4D3E] sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123524]"
              >
                Return to Dashboard →
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setAuthModal({ open: true, view: 'signin' })}
                  className="rounded-xl border border-[#E8E2D5] bg-white px-4 py-2 text-sm font-bold text-[#1A202C] shadow-xs transition-colors hover:bg-[#F6F2EA] sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123524]"
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={() => setAuthModal({ open: true, view: 'signup' })}
                  className="rounded-xl bg-[#123524] px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#1B4D3E] sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123524]"
                >
                  Register
                </button>
                <button
                  type="button"
                  onClick={() => void handleEnterDemo()}
                  disabled={demoBusy}
                  className="hidden rounded-xl border border-[#C05621] bg-[#C05621]/10 px-4 py-2 text-sm font-bold text-[#C05621] transition-colors hover:bg-[#C05621] hover:text-white sm:inline-block sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C05621] disabled:opacity-50"
                >
                  {demoBusy ? 'Launching…' : 'Try Live Demo'}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-28">
        {/* Section 1: Hero Section */}
        <section ref={heroRef} className="relative pt-6 text-center lg:pt-14 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#123524]/20 bg-white/80 backdrop-blur-xs px-4 py-1.5 text-sm font-bold text-[#123524] shadow-xs">
            <span>🌿 GAHM: Global Actions on Habitats and Marines</span>
            <span className="text-[#C05621]">•</span>
            <span>UN SDG 15 Dedicated</span>
          </div>

          <h1 className="mx-auto max-w-4xl text-3xl font-black tracking-tight text-[#123524] sm:text-5xl lg:text-6xl leading-[1.15]">
            Predict &amp; Mitigate Human-Wildlife Conflict <br className="hidden sm:inline" />
            <span className="text-[#C05621]">Before Encounters Escalate</span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-neutral-700 sm:text-xl">
            GAHM (Global Actions on Habitats and Marines) turns weak environmental signals into transparent conflict risk scores, empowering forest rangers and fringe agricultural communities with early warning alerts, anti-poaching privacy guards, and non-lethal mitigation dispatches.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 pt-2">
            <button
              type="button"
              onClick={() => void handleEnterDemo()}
              disabled={demoBusy}
              className="w-full rounded-xl bg-[#123524] px-7 py-3.5 text-base font-bold text-white shadow-md transition-all hover:bg-[#1B4D3E] sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123524] disabled:opacity-50"
            >
              {demoBusy ? 'Launching Demo…' : 'Explore Interactive Demo'}
            </button>
            <button
              type="button"
              onClick={() => setAuthModal({ open: true, view: 'signup' })}
              className="w-full rounded-xl border border-[#E8E2D5] bg-white px-7 py-3.5 text-base font-bold text-[#1A202C] shadow-xs transition-all hover:bg-[#F6F2EA] sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123524]"
            >
              Create Account
            </button>
          </div>

          {/* Key Stats Banner */}
          <div className="mt-14 grid grid-cols-2 gap-4 rounded-3xl border border-[#E8E2D5] bg-white/90 p-6 shadow-xl backdrop-blur-md sm:grid-cols-4 sm:p-8">
            <div className="space-y-1 border-r border-[#E8E2D5]/60 pr-2">
              <div className="text-3xl font-black text-[#123524]">100%</div>
              <div className="text-sm font-bold text-neutral-500 uppercase tracking-wider">
                Human-in-the-Loop
              </div>
              <div className="text-xs text-neutral-600">Ranger Patrol Control</div>
            </div>

            <div className="space-y-1 border-r border-[#E8E2D5]/60 pr-2">
              <div className="text-3xl font-black text-[#C05621]">0%</div>
              <div className="text-sm font-bold text-neutral-500 uppercase tracking-wider">
                GPS Coordinate Leak
              </div>
              <div className="text-xs text-neutral-600">Anti-Poaching Protection</div>
            </div>

            <div className="space-y-1 border-r border-[#E8E2D5]/60 pr-2">
              <div className="text-3xl font-black text-[#123524]">SDG 15</div>
              <div className="text-sm font-bold text-neutral-500 uppercase tracking-wider">
                Life on Land
              </div>
              <div className="text-xs text-neutral-600">Habitat Preservation</div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl font-black text-[#C05621]">7 Signals</div>
              <div className="text-sm font-bold text-neutral-500 uppercase tracking-wider">
                Multi-Factor Engine
              </div>
              <div className="text-xs text-neutral-600">Transparent 0–100 Scoring</div>
            </div>
          </div>
        </section>

        {/* Section 2: GSAP Pinned Scroll-Locked Feature Showcase */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-sm font-bold uppercase tracking-widest text-[#C05621]">
              Scroll-Locked Feature Deck
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#123524] sm:text-4xl">
              Core Platform Capabilities
            </h2>
            <p className="text-base text-neutral-600 max-w-lg mx-auto">
              Scroll down — the page locks while the deck steps through GAHM’s end-to-end conflict prediction and non-lethal dispatch modules.
            </p>
          </div>

          <FeatureCarousel />
        </section>

        {/* Section 3: Target SDG 15 Focus & Mission */}
        <section ref={sdgRef} className="rounded-3xl border border-[#E8E2D5] bg-white/90 p-8 sm:p-12 shadow-xl backdrop-blur-md space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#E8E2D5] pb-6">
            <div>
              <span className="inline-block rounded-full bg-[#123524]/10 px-3.5 py-1 text-sm font-bold text-[#123524] mb-2 border border-[#123524]/20">
                UN Sustainable Development Goal
              </span>
              <h2 className="text-3xl font-extrabold text-[#123524]">
                SDG 15: Life on Land Focus &amp; Purpose
              </h2>
            </div>
            <div className="text-base text-neutral-600 md:text-right max-w-sm leading-relaxed">
              Protecting terrestrial biodiversity, mitigating fringe agriculture encounters, and preventing retaliatory wildlife harm.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-base leading-relaxed text-neutral-700">
            <div className="space-y-2.5 rounded-2xl border border-[#E8E2D5] bg-[#FDFBF7] p-6 shadow-xs">
              <h3 className="text-lg font-bold text-[#123524]">Habitat Boundary Protection</h3>
              <p>
                As agricultural communities expand near protected forest reserves, human-wildlife encounters increase. GAHM focuses exclusively on land habitat conflict risk prediction to protect both local livelihoods and wild species.
              </p>
            </div>

            <div className="space-y-2.5 rounded-2xl border border-[#E8E2D5] bg-[#FDFBF7] p-6 shadow-xs">
              <h3 className="text-lg font-bold text-[#C05621]">Non-Lethal Early Warning</h3>
              <p>
                Traditional deterrents often involve high-risk confrontation or lethal force. GAHM uses weak signal predictive analytics to alert rangers and villagers hours before potential breach events occur.
              </p>
            </div>

            <div className="space-y-2.5 rounded-2xl border border-[#E8E2D5] bg-[#FDFBF7] p-6 shadow-xs">
              <h3 className="text-lg font-bold text-[#123524]">Schedule I Wildlife Focus</h3>
              <p>
                Weighted risk modeling specifically accounts for endangered Schedule I species under the Indian Wildlife (Protection) Act, 1972 (Asian Elephants, Bengal Tigers, Indian Leopards, and Sloth Bears).
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Who Is GAHM Built For (Scroll-Break Persona Showcase) */}
        <section className="space-y-24">
          <div className="text-center space-y-2">
            <span className="text-sm font-bold uppercase tracking-widest text-[#C05621]">
              Stakeholder Storytelling
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#123524] sm:text-4xl">
              Who is GAHM Built For?
            </h2>
            <p className="text-base text-neutral-600 max-w-lg mx-auto">
              Custom-built workflows for every key stakeholder in habitat conflict management.
            </p>
          </div>

          {/* Persona 1: Forest Rangers */}
          <div
            ref={rangerRef}
            className="relative overflow-hidden grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center rounded-3xl border border-[#E8E2D5] bg-white/95 p-8 sm:p-12 shadow-2xl backdrop-blur-md"
          >
            <div className="pointer-events-none absolute right-4 top-2 select-none text-[8rem] font-black leading-none text-[#123524]/5" aria-hidden="true">
              01
            </div>

            <div className="persona-text lg:col-span-6 space-y-6 relative z-10">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#123524]/10 px-3.5 py-1 text-sm font-bold text-[#123524]">
                🛡️ Role 01 · Forest Patrols
              </span>
              <h3 className="text-3xl font-extrabold text-[#123524]">
                Forest Rangers &amp; Field Patrol Teams
              </h3>
              <p className="text-base leading-relaxed text-neutral-700">
                Frontline rangers receive prioritized risk notifications, live spatial vectors, and clear non-lethal dispatch advice directly on field mobile devices—eliminating administrative delays when every minute counts.
              </p>
              <ul className="space-y-3 text-base font-medium text-neutral-800">
                <li className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#123524] text-white text-xs font-bold">✓</span>
                  Real-time threat sorting (Low 40 / High 70 thresholds)
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#123524] text-white text-xs font-bold">✓</span>
                  Interactive Leaflet map location pickers for rapid reporting
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#123524] text-white text-xs font-bold">✓</span>
                  Instant dispatch verification &amp; outcome logging
                </li>
              </ul>
              <button
                type="button"
                onClick={() => void handleEnterDemo()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#123524] px-5 py-2.5 text-base font-bold text-white transition-colors hover:bg-[#1B4D3E]"
              >
                Test Ranger Workflow →
              </button>
            </div>

            <div className="persona-image lg:col-span-6 relative z-10">
              <div className="relative overflow-hidden rounded-2xl border border-[#E8E2D5] shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80"
                  alt="Forest ranger on patrol"
                  className="h-80 w-full object-cover sm:h-96"
                />
                <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-white/90 p-4 backdrop-blur-md border border-[#E8E2D5] shadow-md">
                  <div className="text-sm font-bold text-[#123524]">Ranger Field Dashboard Preview</div>
                  <div className="text-xs text-neutral-600">EVT-1042 · Asian Elephant Herd (420m to North Farm)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Persona 2: Wildlife Conservation Officers */}
          <div
            ref={officerRef}
            className="relative overflow-hidden grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center rounded-3xl border border-[#E8E2D5] bg-white/95 p-8 sm:p-12 shadow-2xl backdrop-blur-md"
          >
            <div className="pointer-events-none absolute right-4 top-2 select-none text-[8rem] font-black leading-none text-[#C05621]/5" aria-hidden="true">
              02
            </div>

            <div className="persona-image lg:col-span-6 lg:order-1 relative z-10">
              <div className="relative overflow-hidden rounded-2xl border border-[#E8E2D5] shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1200&q=80"
                  alt="Conservation analytics and spatial mapping"
                  className="h-80 w-full object-cover sm:h-96"
                />
                <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-white/90 p-4 backdrop-blur-md border border-[#E8E2D5] shadow-md">
                  <div className="text-sm font-bold text-[#C05621]">Risk Algorithm Weights (25/20/15/15/10/10/5)</div>
                  <div className="text-xs text-neutral-600">Proximity (25%), Movement (20%), Species (15%), History (15%)</div>
                </div>
              </div>
            </div>

            <div className="persona-text lg:col-span-6 lg:order-2 space-y-6 relative z-10">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#C05621]/10 px-3.5 py-1 text-sm font-bold text-[#C05621]">
                📊 Role 02 · Conservation Analytics
              </span>
              <h3 className="text-3xl font-extrabold text-[#123524]">
                Wildlife Conservation Officers &amp; Analysts
              </h3>
              <p className="text-base leading-relaxed text-neutral-700">
                Conservation managers access full risk engine transparency, honest uncertainty monitoring, and field outcome verification logs to refine long-term wildlife corridor strategies and habitat safety.
              </p>
              <ul className="space-y-3 text-base font-medium text-neutral-800">
                <li className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#C05621] text-white text-xs font-bold">✓</span>
                  Full 7-signal algorithm weight breakdown (config.ts source of truth)
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#C05621] text-white text-xs font-bold">✓</span>
                  Historical incident timeline &amp; spatial hotspot analysis
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#C05621] text-white text-xs font-bold">✓</span>
                  Outcome feedback calibration (Conflict Prevented / False Positive)
                </li>
              </ul>
              <button
                type="button"
                onClick={() => void handleEnterDemo()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#C05621] px-5 py-2.5 text-base font-bold text-white transition-colors hover:bg-[#A04518]"
              >
                Inspect Risk Engine Spec →
              </button>
            </div>
          </div>

          {/* Persona 3: Fringe Communities */}
          <div
            ref={farmerRef}
            className="relative overflow-hidden grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center rounded-3xl border border-[#E8E2D5] bg-white/95 p-8 sm:p-12 shadow-2xl backdrop-blur-md"
          >
            <div className="pointer-events-none absolute right-4 top-2 select-none text-[8rem] font-black leading-none text-[#123524]/5" aria-hidden="true">
              03
            </div>

            <div className="persona-text lg:col-span-6 space-y-6 relative z-10">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#123524]/10 px-3.5 py-1 text-sm font-bold text-[#123524]">
                📲 Role 03 · Community Safety
              </span>
              <h3 className="text-3xl font-extrabold text-[#123524]">
                Fringe Agricultural Communities &amp; Farmers
              </h3>
              <p className="text-base leading-relaxed text-neutral-700">
                Delivers zero-friction SMS early warnings directly to basic feature phones. Agricultural workers receive advance notice before wildlife enters crop zones, complete with anti-poaching coordinate privacy and 1-click unsubscription.
              </p>
              <ul className="space-y-3 text-base font-medium text-neutral-800">
                <li className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#123524] text-white text-xs font-bold">✓</span>
                  No smartphone or app installation required
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#123524] text-white text-xs font-bold">✓</span>
                  0% GPS coordinate leakage on public SMS channels
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#123524] text-white text-xs font-bold">✓</span>
                  DPDP Act 2023 compliant data consent &amp; STOP unsubscription
                </li>
              </ul>
              <button
                type="button"
                onClick={() => void handleEnterDemo()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#123524] px-5 py-2.5 text-base font-bold text-white transition-colors hover:bg-[#1B4D3E]"
              >
                Launch SMS Simulator →
              </button>
            </div>

            <div className="persona-image lg:col-span-6 relative z-10">
              <div className="relative overflow-hidden rounded-2xl border border-[#E8E2D5] shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"
                  alt="Rural agricultural field at sunset"
                  className="h-80 w-full object-cover sm:h-96"
                />
                <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-white/90 p-4 backdrop-blur-md border border-[#E8E2D5] shadow-md">
                  <div className="text-sm font-bold text-[#123524]">Simulated SMS Alert Message</div>
                  <div className="text-xs text-neutral-600">GAHM ALERT: High elephant risk near North Farm. Avoid field boundary until 21:00 UTC. Reply STOP to opt out.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Ethical AI & Responsible Principles */}
        <section ref={ethicsRef} className="rounded-3xl border border-[#E8E2D5] bg-white/95 p-8 sm:p-12 shadow-2xl backdrop-blur-md space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D5] pb-6">
            <div>
              <span className="text-sm font-bold uppercase tracking-widest text-[#C05621]">
                Legal Compliance &amp; AI Principles
              </span>
              <h2 className="text-3xl font-extrabold text-[#123524] mt-1">
                Responsible AI &amp; Privacy Charter
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowEthics(true)}
              className="rounded-xl border border-[#E8E2D5] bg-[#FDFBF7] px-4 py-2 text-base font-bold text-[#123524] hover:bg-[#F6F2EA] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123524]"
            >
              View Full Compliance Document ↗
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-[#E8E2D5] bg-[#FDFBF7] p-6 space-y-2 shadow-xs">
              <div className="font-bold text-[#123524] text-lg">
                1. Human-in-the-Loop Safeguard
              </div>
              <p className="text-base text-neutral-700 leading-relaxed">
                GAHM never performs autonomous dispatch or automatic acoustic/visual deterrent triggers. The human ranger evaluates all risk signals and retains sole authority for field actions.
              </p>
            </div>

            <div className="rounded-2xl border border-[#E8E2D5] bg-[#FDFBF7] p-6 space-y-2 shadow-xs">
              <div className="font-bold text-[#C05621] text-lg">
                2. Poaching Protection (WLPA 1972)
              </div>
              <p className="text-base text-neutral-700 leading-relaxed">
                Exact GPS coordinates are scrubbed from public SMS alerts to prevent poachers or retaliatory hunters from exploiting detection feeds under the Indian Wildlife (Protection) Act, 1972.
              </p>
            </div>

            <div className="rounded-2xl border border-[#E8E2D5] bg-[#FDFBF7] p-6 space-y-2 shadow-xs">
              <div className="font-bold text-[#123524] text-lg">
                3. Data Minimization &amp; DPDP 2023
              </div>
              <p className="text-base text-neutral-700 leading-relaxed">
                Complies with the Digital Personal Data Protection Act, 2023. Zero biometric tracking or individual location monitoring, with instant opt-out support by replying STOP.
              </p>
            </div>

            <div className="rounded-2xl border border-[#E8E2D5] bg-[#FDFBF7] p-6 space-y-2 shadow-xs">
              <div className="font-bold text-[#C05621] text-lg">
                4. Anti-Economic Bias &amp; Honest Uncertainty
              </div>
              <p className="text-base text-neutral-700 leading-relaxed">
                Smallholder farms receive identical risk priority to commercial acreage. Missing feeds incur explicit penalties (-8 pts) rather than making overconfident black-box assumptions.
              </p>
            </div>
          </div>
        </section>

        {/* Section 6: Universal Accessibility Guarantee */}
        <section className="rounded-3xl border border-[#E8E2D5] bg-white/95 p-8 sm:p-10 shadow-lg space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#123524]/10 text-[#123524] font-bold text-lg">
              ♿
            </span>
            <div>
              <h3 className="text-2xl font-extrabold text-[#123524]">Universal Accessibility Guarantee</h3>
              <p className="text-sm text-neutral-600">
                Built for everyone: phone users, low-bandwidth networks, and deaf/hearing-impaired users.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base text-neutral-700 pt-2">
            <div className="flex items-start gap-3">
              <span className="font-bold text-[#123524]">✓</span>
              <div>
                <strong className="text-[#123524] block text-base">Deaf &amp; Hearing-Impaired Accessibility</strong>
                100% visual alert indicators, high-contrast badges, visual pulse animations, and text captions for all audio and alert events.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-bold text-[#123524]">✓</span>
              <div>
                <strong className="text-[#123524] block text-base">Mobile &amp; Touch Friendly Design</strong>
                Fluid responsive layouts adapted to all viewport widths, touch targets ≥44px, and zero horizontal scroll leaks.
              </div>
            </div>
          </div>
        </section>

        {/* Footer & Final CTA */}
        <footer className="border-t border-[#E8E2D5] pt-12 pb-10 text-center space-y-8">
          <div className="max-w-xl mx-auto space-y-4">
            <h2 className="text-3xl font-extrabold text-[#123524]">Ready to Explore GAHM?</h2>
            <p className="text-sm text-neutral-600">
              Try the live interactive demo or sign up for a workspace to start managing wildlife conflict risk.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => void handleEnterDemo()}
                disabled={demoBusy}
                className="w-full sm:w-auto rounded-xl bg-[#123524] px-7 py-3 text-base font-bold text-white hover:bg-[#1B4D3E] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123524] disabled:opacity-50"
              >
                {demoBusy ? 'Launching…' : 'Try Live Demo'}
              </button>
              <button
                type="button"
                onClick={() => setAuthModal({ open: true, view: 'signup' })}
                className="w-full sm:w-auto rounded-xl border border-[#E8E2D5] bg-white px-7 py-3 text-base font-bold text-[#1A202C] hover:bg-[#F6F2EA] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123524]"
              >
                Register Free Account
              </button>
            </div>
          </div>

          <div className="border-t border-[#E8E2D5] pt-8 text-sm text-neutral-500 space-y-1.5">
            <div>
              GAHM — Global Actions on Habitats and Marines · Teens in AI Incubator 2026
            </div>
            <div>
              Target SDG 15: Life on Land · Version 0.9.0
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
