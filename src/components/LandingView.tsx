import { useState, useEffect, useRef } from 'react'
import type { FormEvent } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { useAuth } from '../auth/authContext'
import { DEMO_EMAIL, DEMO_PASSWORD } from '../auth/demoAccount'
import { loadCorridorActivity, subscribeVillager } from '../auth/api'
import { communities } from '../data/demoData'
import type { CorridorActivityZone } from '../types'
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
  const [scrollProgress, setScrollProgress] = useState(0)

  // Live Corridor Activity & Subscription State
  const [corridorActivity, setCorridorActivity] = useState<CorridorActivityZone[]>([])
  const [activityLastUpdated, setActivityLastUpdated] = useState<Date>(() => new Date())
  const [subName, setSubName] = useState('')
  const [subPhone, setSubPhone] = useState('')
  const [subCommunity, setSubCommunity] = useState('Hangala')
  const [subConsent, setSubConsent] = useState(false)
  const [subStatus, setSubStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [subError, setSubError] = useState('')

  // Refs for GSAP scroll animations
  const heroRef = useRef<HTMLDivElement>(null)
  const corridorRef = useRef<HTMLDivElement>(null)
  const whereRef = useRef<HTMLDivElement>(null)
  const problemRef = useRef<HTMLDivElement>(null)
  const insightRef = useRef<HTMLDivElement>(null)
  const methodologyRef = useRef<HTMLDivElement>(null)
  const proofRef = useRef<HTMLDivElement>(null)
  const sdgRef = useRef<HTMLDivElement>(null)
  const rangerRef = useRef<HTMLDivElement>(null)
  const officerRef = useRef<HTMLDivElement>(null)
  const farmerRef = useRef<HTMLDivElement>(null)
  const ethicsRef = useRef<HTMLDivElement>(null)

  // Fetch corridor activity and poll every 30s
  useEffect(() => {
    const fetchActivity = () => {
      loadCorridorActivity()
        .then((data) => {
          if (data && data.length > 0) {
            setCorridorActivity(data)
          } else {
            setCorridorActivity([
              { zone: 'Bandipur Buffer Zone', community: 'Hangala', riskLevel: 'high', count: 3, recentActivityAt: new Date().toISOString() },
              { zone: 'Nagarhole Sector Gap', community: 'Beechanahalli', riskLevel: 'medium', count: 2, recentActivityAt: new Date(Date.now() - 1800000).toISOString() },
              { zone: 'Mudumalai Fringe', community: 'Masinagudi', riskLevel: 'low', count: 1, recentActivityAt: new Date(Date.now() - 3600000).toISOString() },
            ])
          }
          setActivityLastUpdated(new Date())
        })
        .catch(() => {})
    }
    fetchActivity()
    const timer = setInterval(fetchActivity, 30000)
    return () => clearInterval(timer)
  }, [])

  // Scroll progress indicator for the story's reading position
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      setScrollProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Initialize Lenis smooth scroll & GSAP ScrollTrigger animations
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

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

    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current.children,
        { opacity: 0, y: 35 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' }
      )
    }

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

    const cardSections = [
      corridorRef.current,
      whereRef.current,
      problemRef.current,
      insightRef.current,
      methodologyRef.current,
      proofRef.current,
      sdgRef.current,
      ethicsRef.current,
    ]
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

  // Lock background scroll while the auth modal or ethics modal is open (S1 fix)
  useEffect(() => {
    if (!authModal.open && !showEthics) return
    const lenis = lenisHolder.instance
    lenis?.stop()
    document.body.style.overflow = 'hidden'
    return () => {
      lenis?.start()
      document.body.style.overflow = ''
    }
  }, [authModal.open, showEthics])

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

  const handleSubscribeSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!subName.trim() || !subPhone.trim() || !subConsent) return
    setSubStatus('submitting')
    setSubError('')
    try {
      const res = await subscribeVillager({
        name: subName,
        phone: subPhone,
        community: subCommunity,
      })
      if (res.ok) {
        setSubStatus('success')
        setSubName('')
        setSubPhone('')
        setSubConsent(false)
      } else {
        setSubStatus('error')
        setSubError(res.error || 'Subscription failed. Please check your details.')
      }
    } catch {
      setSubStatus('error')
      setSubError('Failed to connect to subscription service.')
    }
  }

  return (
    <div className="relative min-h-dvh bg-[#FDFBF7] font-sans text-[#1A202C] selection:bg-[#123524] selection:text-white">
      {/* Scroll progress bar */}
      <div className="fixed inset-x-0 top-0 z-[70] h-1 bg-transparent" aria-hidden="true">
        <div
          className="h-full origin-left bg-gradient-to-r from-[#123524] to-[#C05621] transition-[width] duration-150 ease-out"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

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
                WildSense
              </span>
              <span className="text-sm font-bold text-[#C05621]">
                Wildlife Conflict Risk Engine · by GAHM
              </span>
            </div>
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
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-20">
        {/* Section 1: Hero Section */}
        <section ref={heroRef} className="relative pt-6 text-center lg:pt-14 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#123524]/20 bg-white/80 backdrop-blur-xs px-4 py-1.5 text-sm font-bold text-[#123524] shadow-xs">
            <span>🌿 WildSense: Wildlife Conflict Risk Engine · by GAHM</span>
          </div>

          <h1 className="mx-auto max-w-4xl text-3xl font-black tracking-tight text-[#123524] sm:text-5xl lg:text-6xl leading-[1.15]">
            Predict &amp; Mitigate Human-Wildlife Conflict <br className="hidden sm:inline" />
            <span className="text-[#C05621]">Before Encounters Escalate</span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-neutral-700 sm:text-xl">
            WildSense turns weak environmental signals into transparent conflict risk scores, empowering forest rangers and fringe agricultural communities with early warning alerts, anti-poaching privacy guards, and non-lethal mitigation dispatches. It is built by GAHM (Global Actions on Habitats and Marines).
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
              <div className="text-3xl font-black text-[#123524]">500K+</div>
              <div className="text-sm font-bold text-neutral-500 uppercase tracking-wider">
                Farming Families
              </div>
              <div className="text-xs text-neutral-600">Protected Fringe Livelihoods</div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl font-black text-[#C05621]">7 Signals</div>
              <div className="text-sm font-bold text-neutral-500 uppercase tracking-wider">
                Multi-Factor Engine
              </div>
              <div className="text-xs text-neutral-600">Transparent 0–100 Scoring</div>
            </div>
          </div>

          {/* Scroll Cue */}
          <div className="pt-6 text-center text-sm font-semibold text-neutral-400">
            <span className="inline-flex items-center gap-2">
              Scroll to follow the story
              <span className="animate-bounce" aria-hidden="true">↓</span>
            </span>
          </div>
        </section>

        {/* Section 1.5: Live Corridor Activity & Early Warning Alerts */}
        <section
          ref={corridorRef}
          className="rounded-3xl border border-[#E8E2D5] bg-white/95 p-8 sm:p-12 shadow-2xl backdrop-blur-md space-y-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8E2D5] pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-block rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 inline-block mr-1.5 animate-pulse" />
                  Live Corridor Feed
                </span>
                <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-semibold text-neutral-500">
                  Updated {activityLastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h2 className="text-3xl font-extrabold text-[#123524] mt-2">
                Live Corridor Activity &amp; Community Warnings
              </h2>
              <p className="mt-1 text-sm text-neutral-600 max-w-2xl leading-relaxed">
                Aggregated, privacy-sanitized zone activity across fringe settlements. Exact wildlife telemetry is quarantined to protect Schedule I species from poaching.
              </p>
            </div>
          </div>

          {/* Zone Activity Cards Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {corridorActivity.map((zone, idx) => {
              const isHigh = zone.riskLevel === 'high'
              const isMed = zone.riskLevel === 'medium'
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#E8E2D5] bg-[#FDFBF7] p-5 shadow-xs transition-all hover:border-[#123524]/30"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-[#123524]">{zone.zone}</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        isHigh
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : isMed
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {zone.riskLevel.toUpperCase()} RISK
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-neutral-600">
                    Community: <strong className="text-neutral-900">{zone.community}</strong>
                  </div>
                  <div className="mt-1 text-xs text-neutral-500">
                    Active detections: <strong className="text-neutral-900">{zone.count}</strong>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-[#E8E2D5]/70 pt-2 text-[11px] text-neutral-400">
                    <span>Corridor status</span>
                    <span className="rounded bg-neutral-200/60 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-700">
                      Demo data
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Villager Self-Subscription Form */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/60 pb-3">
              <div>
                <h3 className="text-xl font-bold text-emerald-950">
                  Subscribe for Community SMS Early Warnings
                </h3>
                <p className="text-xs text-emerald-800">
                  Receive direct early warnings on any mobile phone before animals approach your agricultural boundary.
                </p>
              </div>
              <span className="self-start rounded-full bg-emerald-200/60 px-3 py-1 text-xs font-bold text-emerald-900">
                DPDP Act 2023 Compliant
              </span>
            </div>

            {subStatus === 'success' ? (
              <div className="rounded-xl border border-emerald-300 bg-emerald-100/90 p-4 text-emerald-900 space-y-1">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <span>✓</span> Successfully Subscribed to Corridor Alerts!
                </div>
                <p className="text-xs leading-relaxed">
                  Your phone is now registered for early warning notifications in <strong>{subCommunity}</strong>. You can opt out anytime by replying <strong>STOP</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => setSubStatus('idle')}
                  className="mt-2 text-xs font-bold text-emerald-950 underline hover:text-emerald-800"
                >
                  Register another number
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubscribeSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor="sub-name" className="block text-xs font-bold uppercase tracking-wider text-emerald-950 mb-1">
                      Full Name
                    </label>
                    <input
                      id="sub-name"
                      type="text"
                      required
                      value={subName}
                      onChange={(e) => setSubName(e.target.value)}
                      placeholder="e.g. Ramesh Gowda"
                      className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                    />
                  </div>

                  <div>
                    <label htmlFor="sub-phone" className="block text-xs font-bold uppercase tracking-wider text-emerald-950 mb-1">
                      Mobile Number
                    </label>
                    <input
                      id="sub-phone"
                      type="tel"
                      required
                      value={subPhone}
                      onChange={(e) => setSubPhone(e.target.value)}
                      placeholder="+91 98450 12345"
                      className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                    />
                  </div>

                  <div>
                    <label htmlFor="sub-comm" className="block text-xs font-bold uppercase tracking-wider text-emerald-950 mb-1">
                      Corridor Community
                    </label>
                    <select
                      id="sub-comm"
                      value={subCommunity}
                      onChange={(e) => setSubCommunity(e.target.value)}
                      className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-sm font-medium text-neutral-900 focus:border-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                    >
                      {communities.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name} ({c.preferredLanguage})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* DPDP Section 6 Consent Checkbox */}
                <div className="rounded-xl border border-emerald-200/80 bg-white/70 p-3.5">
                  <label className="flex items-start gap-3 text-xs leading-relaxed text-emerald-950 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={subConsent}
                      onChange={(e) => setSubConsent(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-emerald-700 focus:ring-2 focus:ring-emerald-500/40"
                    />
                    <span>
                      <strong>Consent under DPDP Act 2023 (§6):</strong> I provide free, specific, and informed consent to receive wildlife early warning SMS messages from the corridor ranger patrol. I understand exact animal GPS coordinates are scrubbed for conservation privacy, and I can reply <strong>STOP</strong> at any time to instantly revoke consent and delete my number. (
                      <button
                        type="button"
                        onClick={() => setShowEthics(true)}
                        className="font-bold underline hover:text-emerald-800"
                      >
                        Read Ethics Charter
                      </button>
                      )
                    </span>
                  </label>
                </div>

                {subError ? (
                  <div className="rounded-lg bg-red-100 p-2.5 text-xs font-medium text-red-800">
                    {subError}
                  </div>
                ) : null}

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                  <p className="text-[11px] text-emerald-800">
                    🔒 Zero commercial sharing · Scrubbed coordinates · Instant STOP opt-out
                  </p>
                  <button
                    type="submit"
                    disabled={subStatus === 'submitting' || !subConsent}
                    className="w-full sm:w-auto rounded-xl bg-emerald-800 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-50"
                  >
                    {subStatus === 'submitting' ? 'Registering…' : 'Subscribe to Warnings'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* Section 2: Where Is This Set? */}
        <section
          ref={whereRef}
          className="rounded-3xl border border-[#123524]/25 bg-gradient-to-br from-[#123524] to-[#1B4D3E] p-8 sm:p-10 shadow-xl space-y-6"
        >
          <div className="space-y-2">
            <span className="inline-block rounded-full border border-[#C05621]/40 bg-[#C05621]/15 px-3.5 py-1 text-sm font-bold text-amber-200">
              Where Is This Set?
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              A real landscape, modeled honestly
            </h2>
            <p className="max-w-3xl text-base leading-relaxed text-white/75">
              The demo is modeled on the Bandipur–Nagarhole–Mudumalai elephant corridor in southern
              India. The villages are real; the events are simulated.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                name: 'Beechanahalli',
                detail: 'Kabini dam gap · Karnataka',
                lang: 'Kannada',
              },
              {
                name: 'Hangala',
                detail: 'Bandipur forest edge · Karnataka',
                lang: 'Kannada',
              },
              {
                name: 'Masinagudi',
                detail: 'Mudumalai buffer · Tamil Nadu',
                lang: 'Tamil',
              },
            ].map((v) => (
              <div
                key={v.name}
                className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm"
              >
                <div className="text-lg font-bold text-white">{v.name}</div>
                <div className="mt-1 text-sm text-white/70">{v.detail}</div>
                <div className="mt-3 inline-block rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold text-amber-200">
                  Warnings in {v.lang}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs leading-relaxed text-white/60">
            The "Aranya Corridor Reserve" boundary is a simplified stand-in for the land between the
            three real reserves. All detections, timestamps, and outcomes are synthetic demo data —
            only the geography is real.
          </p>
        </section>

        {/* Section 3: The Problem */}
        <section ref={problemRef} className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-sm font-bold uppercase tracking-widest text-[#C05621]">
              The Problem
            </span>
            <h2 className="mx-auto max-w-3xl text-3xl font-extrabold tracking-tight text-[#123524] sm:text-4xl">
              At the forest edge, the stakes are life and livelihood
            </h2>
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-neutral-600">
              India holds roughly 60% of the world's wild Asian elephants — and the numbers on
              conflict are sobering.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                value: '~7,868',
                label: 'human deaths from elephant encounters',
                note: 'India, 2009–2024 (≈492 per year)',
              },
              {
                value: '2,829',
                label: 'human casualties in five years',
                note: '2019–20 to 2023-24, government data',
              },
              {
                value: '528',
                label: 'elephants lost — 392 by electrocution',
                note: 'in the same five-year period',
              },
              {
                value: '>5,00,000',
                label: 'marginal farming families affected',
                note: 'Rangarajan et al., Elephant Task Force 2010',
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-[#E8E2D5] bg-white/95 p-6 shadow-md"
              >
                <div className="text-3xl font-black text-[#C05621]">{s.value}</div>
                <div className="mt-2 text-sm font-bold text-[#123524]">{s.label}</div>
                <div className="mt-1 text-xs text-neutral-500">{s.note}</div>
              </div>
            ))}
          </div>

          <p className="text-center text-[11px] text-neutral-400">
            Sources: Frontiers in Conservation Science (2026); MoEFCC parliament replies via Times
            of India (Jul 2024); Rangarajan et al., Elephant Task Force (2010).
          </p>
        </section>

        {/* Section 4: The Insight */}
        <section
          ref={insightRef}
          className="grid grid-cols-1 gap-10 rounded-3xl border border-[#E8E2D5] bg-white/90 p-8 sm:p-12 shadow-xl lg:grid-cols-12"
        >
          <div className="space-y-6 lg:col-span-7">
            <span className="inline-block rounded-full bg-[#C05621]/10 px-3.5 py-1 text-sm font-bold text-[#C05621] border border-[#C05621]/20">
              The Insight
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#123524] sm:text-4xl">
              Detection isn't the bottleneck. Prioritization is.
            </h2>
            <p className="text-base leading-relaxed text-neutral-700">
              Corridor monitoring already produces detections around the clock. But ranger teams are
              outnumbered, most signals are routine or deep inside the reserve, and the few that
              matter — a herd drifting toward a village at dusk — hide inside the noise.
            </p>
            <p className="text-base leading-relaxed text-neutral-700">
              WildSense's job is to turn those weak signals into one transparent, explainable risk score,
              so the human ranger's attention goes where the conflict is about to happen.
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-[#E8E2D5] bg-[#FDFBF7] p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between border-b border-[#E8E2D5] pb-3">
                <span className="text-base font-bold text-[#123524]">The 7 Signals</span>
                <span className="rounded-full border bg-[#123524]/10 px-2.5 py-0.5 text-xs font-bold text-[#123524]">
                  Weights
                </span>
              </div>
              <div className="space-y-2.5">
                {[
                  ['Proximity to farmland / settlement', 25],
                  ['Movement toward the boundary', 20],
                  ['Species risk (Schedule I)', 15],
                  ['Historical conflict hotspot', 15],
                  ['Time of day (dusk/night)', 10],
                  ['Group size', 10],
                  ['Weather conditions', 5],
                ].map(([label, w]) => (
                  <div
                    key={label as string}
                    className="flex items-center justify-between rounded-lg border border-[#E8E2D5] bg-white p-3"
                  >
                    <span className="text-sm font-medium text-neutral-700">{label}</span>
                    <span className="text-sm font-bold text-[#123524]">+{w}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 4.5: Research & Methodology */}
        <section
          ref={methodologyRef}
          className="rounded-3xl border border-[#E8E2D5] bg-white/95 p-8 sm:p-12 shadow-2xl backdrop-blur-md space-y-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8E2D5] pb-6">
            <div>
              <span className="text-sm font-bold uppercase tracking-widest text-[#C05621]">
                Academic &amp; Field Evidence
              </span>
              <h2 className="text-3xl font-extrabold text-[#123524] mt-1">
                Research Foundation &amp; Open Datasets
              </h2>
              <p className="mt-1 text-sm text-neutral-600 max-w-2xl leading-relaxed">
                WildSense’s predictive engine is grounded in empirical research across southern Indian elephant corridors and open satellite environmental layers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-[#E8E2D5] bg-[#FDFBF7] p-6 space-y-3 shadow-xs">
              <div className="text-xs font-bold uppercase tracking-wider text-[#C05621]">
                Bandipur Corridor Farmer Survey
              </div>
              <div className="text-2xl font-black text-[#123524]">70.8% Worsening Conflict</div>
              <p className="text-sm leading-relaxed text-neutral-700">
                A 2025 field investigation in the Bandipur corridor found that <strong>70.8%</strong> of fringe farming families report worsening human-wildlife encounters, with <strong>56.6%</strong> suffering over 50% crop loss annually. Crucially, over <strong>60%</strong> maintain positive sentiment toward wildlife conservation when provided timely early warning.
              </p>
              <div className="text-[11px] font-semibold text-neutral-400">
                Source: Mongabay India Field Survey Report (2025)
              </div>
            </div>

            <div className="rounded-2xl border border-[#E8E2D5] bg-[#FDFBF7] p-6 space-y-3 shadow-xs">
              <div className="text-xs font-bold uppercase tracking-wider text-[#123524]">
                Frontline Staffing Constraints
              </div>
              <div className="text-2xl font-black text-[#C05621]">~1 Ranger per 72 km²</div>
              <p className="text-sm leading-relaxed text-neutral-700">
                Protected area rangers in South Asia manage vast rugged terrain under severe staffing deficits—averaging nearly <strong>5× below</strong> the global 30-by-30 conservation staffing targets. Transparent predictive prioritization acts as a force multiplier for stretched patrol teams.
              </p>
              <div className="text-[11px] font-semibold text-neutral-400">
                Source: Nature Sustainability (2022) &amp; IUCN World Commission on Protected Areas
              </div>
            </div>
          </div>

          {/* Named Open Datasets */}
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-6 space-y-4">
            <h3 className="text-base font-bold text-[#123524]">
              Scientific Datasets &amp; Satellite Telemetry Integration
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <a
                href="https://www.gbif.org"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-emerald-500 hover:shadow-sm"
              >
                <div className="font-bold text-sm text-[#123524] flex items-center justify-between">
                  <span>GBIF</span>
                  <span className="text-xs text-neutral-400">↗</span>
                </div>
                <div className="mt-1 text-xs text-neutral-600">
                  Global Biodiversity Information Facility observation baseline.
                </div>
              </a>

              <a
                href="https://eos.com/landviewer"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-emerald-500 hover:shadow-sm"
              >
                <div className="font-bold text-sm text-[#123524] flex items-center justify-between">
                  <span>EOS LandViewer</span>
                  <span className="text-xs text-neutral-400">↗</span>
                </div>
                <div className="mt-1 text-xs text-neutral-600">
                  Multispectral satellite imagery and forest boundary verification.
                </div>
              </a>

              <a
                href="https://dataspace.copernicus.eu"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-emerald-500 hover:shadow-sm"
              >
                <div className="font-bold text-sm text-[#123524] flex items-center justify-between">
                  <span>Copernicus Hub</span>
                  <span className="text-xs text-neutral-400">↗</span>
                </div>
                <div className="mt-1 text-xs text-neutral-600">
                  Sentinel-2 land cover, moisture index, and vegetation density.
                </div>
              </a>

              <a
                href="https://earthdata.nasa.gov"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-emerald-500 hover:shadow-sm"
              >
                <div className="font-bold text-sm text-[#123524] flex items-center justify-between">
                  <span>NASA Earthdata</span>
                  <span className="text-xs text-neutral-400">↗</span>
                </div>
                <div className="mt-1 text-xs text-neutral-600">
                  MODIS and Landsat environmental and climatic telemetry.
                </div>
              </a>
            </div>
            <p className="text-[11px] text-neutral-500 italic">
              Note: The 7-signal weights (25/20/15/15/10/10/5) reflect our core baseline; Phase 2 deployments calibrate parameters against each reserve's historical telemetry.
            </p>
          </div>
        </section>

        {/* Section 5: GSAP Pinned Scroll-Locked Feature Showcase */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-sm font-bold uppercase tracking-widest text-[#C05621]">
              How It Works
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#123524] sm:text-4xl">
              Seven signals. One transparent score.
            </h2>
            <p className="text-base text-neutral-600 max-w-lg mx-auto">
              Scroll down — the page locks while the deck steps through WildSense’s end-to-end conflict prediction and non-lethal dispatch modules.
            </p>
          </div>

          <FeatureCarousel />
        </section>

        {/* Section 6: The Solution */}
        <section ref={sdgRef} className="rounded-3xl border border-[#E8E2D5] bg-white/90 p-8 sm:p-12 shadow-xl backdrop-blur-md space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#E8E2D5] pb-6">
            <div>
              <span className="inline-block rounded-full bg-[#123524]/10 px-3.5 py-1 text-sm font-bold text-[#123524] mb-2 border border-[#123524]/20">
                The Solution
              </span>
              <h2 className="text-3xl font-extrabold text-[#123524]">
                Early warning before encounters escalate
              </h2>
            </div>
            <div className="text-base text-neutral-600 md:text-right max-w-sm leading-relaxed">
              A transparent risk engine, a human ranger in the loop, and an SMS warning that reaches
              the village in its own language.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-base leading-relaxed text-neutral-700">
            <div className="space-y-2.5 rounded-2xl border border-[#E8E2D5] bg-[#FDFBF7] p-6 shadow-xs">
              <h3 className="text-lg font-bold text-[#123524]">Habitat Boundary Protection</h3>
              <p>
                As agricultural communities expand near protected forest reserves, human-wildlife encounters increase. WildSense focuses exclusively on land habitat conflict risk prediction to protect both local livelihoods and wild species.
              </p>
            </div>

            <div className="space-y-2.5 rounded-2xl border border-[#E8E2D5] bg-[#FDFBF7] p-6 shadow-xs">
              <h3 className="text-lg font-bold text-[#C05621]">Non-Lethal Early Warning</h3>
              <p>
                Traditional deterrents often involve high-risk confrontation or lethal force. WildSense uses weak signal predictive analytics to alert rangers and villagers hours before potential breach events occur.
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

        {/* Section 7: Who Is WildSense Built For (Scroll-Break Persona Showcase) */}
        <section className="space-y-16">
          <div className="text-center space-y-2">
            <span className="text-sm font-bold uppercase tracking-widest text-[#C05621]">
              Built For
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#123524] sm:text-4xl">
              The people on the ground
            </h2>
            <p className="text-base text-neutral-600 max-w-lg mx-auto">
              Custom workflows for the rangers, analysts, and farmers who live at the forest edge.
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
                  <div className="text-xs text-neutral-600">EVT-1042 · Asian Elephant Herd (5.9 km to Bandipur Farm, moving north)</div>
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
                  <div className="text-xs text-neutral-600">WildSense ALERT: High elephant risk near Hangala. Avoid field boundary until 21:00 UTC. Reply STOP to opt out.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 8: Proof — The Demo Story */}
        <section ref={proofRef} className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-sm font-bold uppercase tracking-widest text-[#C05621]">
              Proof
            </span>
            <h2 className="mx-auto max-w-3xl text-3xl font-extrabold tracking-tight text-[#123524] sm:text-4xl">
              One evening, one herd — the whole loop
            </h2>
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-neutral-600">
              The flagship scenario in the live demo runs the complete workflow end-to-end.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-[#E8E2D5] bg-white/95 p-8 shadow-xl">
              <div className="mb-5 flex items-center justify-between border-b border-[#E8E2D5] pb-4">
                <span className="text-base font-bold text-[#123524]">EVT-1042 — Asian Elephant Herd</span>
                <span className="rounded-full border border-red-200 bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800">
                  Score 87/100 · High Risk
                </span>
              </div>
              <ol className="space-y-3">
                {[
                  ['18:42', 'Detection logged at Bandipur Gate — 5.9 km from Bandipur Farm, moving north at dusk.'],
                  ['Risk engine', '+14 proximity, +20 movement, +15 hotspot — one transparent score, no black box.'],
                  ['Ranger loop', 'Acknowledge, contact the ranger unit, and prepare the community warning in the demo.'],
                  ['SMS in Kannada', 'Warning reaches Hangala residents without revealing exact animal coordinates.'],
                  ['Outcome logged', 'EVT-1040 shows the completed loop: "De-escalated before crop damage."'],
                ].map(([time, step]) => (
                  <li key={time} className="flex items-start gap-3">
                    <span className="mt-0.5 min-w-20 rounded-md bg-[#123524]/10 px-2 py-1 text-center text-xs font-bold text-[#123524]">
                      {time}
                    </span>
                    <span className="text-sm leading-relaxed text-neutral-700">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex flex-col justify-between gap-6 rounded-3xl border border-[#123524]/25 bg-gradient-to-br from-[#123524] to-[#1B4D3E] p-8 shadow-xl">
              <div className="space-y-4">
                <h3 className="text-2xl font-extrabold text-white">Run the demo. Watch it live.</h3>
                <p className="text-sm leading-relaxed text-white/75">
                  Follow EVT-1042 from detection to dispatch, inspect the signal breakdown, and send
                  the warning yourself — all in the interactive demo.
                </p>
                <button
                  type="button"
                  onClick={() => void handleEnterDemo()}
                  disabled={demoBusy}
                  className="w-full rounded-xl bg-[#C05621] px-6 py-3.5 text-base font-bold text-white shadow-md transition-colors hover:bg-[#A04518] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:opacity-50 sm:w-auto"
                >
                  {demoBusy ? 'Launching…' : 'Launch Interactive Demo'}
                </button>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-5">
                <div className="text-xs font-bold uppercase tracking-widest text-amber-200">
                  Phase 2 — a real pilot
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-white/75">
                  One partner reserve, a real detection feed, locally calibrated thresholds, and
                  community consent — the natural next step after the demo.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 9: Ethical AI & Responsible Principles */}
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
              View Full Statutory Charter ↗
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-[#E8E2D5] bg-[#FDFBF7] p-6 space-y-2 shadow-xs">
              <div className="font-bold text-[#123524] text-lg">
                1. Human-in-the-Loop Safeguard
              </div>
              <p className="text-base text-neutral-700 leading-relaxed">
                WildSense never performs autonomous dispatch or automatic acoustic/visual deterrent triggers. The human ranger evaluates all risk signals and retains sole authority for field actions.
              </p>
            </div>

            <div className="rounded-2xl border border-[#E8E2D5] bg-[#FDFBF7] p-6 space-y-2 shadow-xs">
              <div className="font-bold text-[#C05621] text-lg">
                2. Wildlife Protection Act, 1972 (§9)
              </div>
              <p className="text-base text-neutral-700 leading-relaxed">
                Schedule I species (Asian Elephants, Bengal Tigers, Leopards, Sloth Bears) receive prioritized non-lethal risk modeling. To enforce anti-poaching safeguards, exact coordinates are strictly quarantined to verified ranger dashboards.
              </p>
            </div>

            <div className="rounded-2xl border border-[#E8E2D5] bg-[#FDFBF7] p-6 space-y-2 shadow-xs">
              <div className="font-bold text-[#123524] text-lg">
                3. DPDP Act, 2023 (§6 Consent)
              </div>
              <p className="text-base text-neutral-700 leading-relaxed">
                Complies with Section 6 of the Digital Personal Data Protection Act, 2023. Zero biometric tracking or individual location monitoring, with instant opt-out support by replying STOP.
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

        {/* Section 10: Universal Accessibility Guarantee */}
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
            <h2 className="text-3xl font-extrabold text-[#123524]">Ready to Explore WildSense?</h2>
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
              WildSense — Wildlife Conflict Risk Engine · by GAHM (Global Actions on Habitats and Marines) · Teens in AI Incubator 2026
            </div>
            <div>
              Built by Team GAHM — Harima K. (Project Lead) · Mathew M. (Prototype Lead) · Gabriel L. (Technical Lead)
            </div>
            <div>
              Version 1.4.0
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
