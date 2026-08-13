import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { lenisHolder } from '../lib/lenisHolder'

gsap.registerPlugin(ScrollTrigger)

interface FeatureSlide {
  id: string
  title: string
  subtitle: string
  tag: string
  tagColor: string
  description: string
  bullets: string[]
  visualContent: {
    heading: string
    badge: string
    badgeColor: string
    stats: { label: string; value: string; highlight?: boolean }[]
    caption: string
  }
}

const SLIDES: FeatureSlide[] = [
  {
    id: 'risk-engine',
    title: 'Weak Signal Risk Engine & Spatial Threat Map',
    subtitle: 'Real-time multi-factor conflict scoring before encounters escalate',
    tag: 'Predictive AI',
    tagColor: 'bg-[#123524]/10 text-[#123524] border-[#123524]/20',
    description:
      'Combines 7 spatial and contextual signals (proximity, movement, species risk, history, time, group size, weather) to compute a transparent 0–100 risk score for every detection event.',
    bullets: [
      'Proximity weight (25%) & spatial threat corridors',
      'Honest uncertainty penalties for missing feeds (-8 pts)',
      'Equal priority for smallholder and commercial land',
    ],
    visualContent: {
      heading: 'EVT-1042: Asian Elephant Herd',
      badge: 'Score 87/100 · High Risk',
      badgeColor: 'bg-red-100 text-red-800 border-red-200',
      stats: [
        { label: 'Proximity', value: '420m to North Farm', highlight: true },
        { label: 'Movement Vector', value: '1.2 km/h Northbound' },
        { label: 'Target Boundary', value: 'Fringe Agriculture Zone' },
      ],
      caption:
        'Visual Feature Preview: Spatial map view indicating elephant movement trajectory towards North Farm with high-contrast alert callout.',
    },
  },
  {
    id: 'privacy-guard',
    title: 'Proximity Dispatch & GPS Privacy Guard',
    subtitle: 'Protects endangered wildlife while alerting ranger teams',
    tag: 'Poaching Protection',
    tagColor: 'bg-[#C05621]/10 text-[#C05621] border-[#C05621]/20',
    description:
      'Complies strictly with India’s Wildlife (Protection) Act, 1972. Exact GPS coordinates are scrubbed from public SMS alerts so poachers and retaliatory hunters cannot exploit the data.',
    bullets: [
      'Automatic coordinate masking on public SMS channels',
      'Precise grid access restricted to verified rangers',
      'DPDP Act 2023 compliant data minimization',
    ],
    visualContent: {
      heading: 'Coordinates Scrubbing Protocol',
      badge: 'Anti-Poaching Lock Active',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
      stats: [
        { label: 'Public SMS', value: 'North Farm Sector (Scrubbed)' },
        { label: 'Ranger Map', value: '26.8467° N, 80.9462° E' },
        { label: 'DPDP Status', value: 'Informed Consent Active' },
      ],
      caption:
        'Visual Feature Preview: Side-by-side comparison demonstrating precise GPS data reserved for verified rangers vs. generalized zone text sent to public SMS recipients.',
    },
  },
  {
    id: 'sms-simulator',
    title: 'SMS Early Warning Simulator',
    subtitle: 'Frictionless alert distribution for fringe communities',
    tag: 'Community Alert',
    tagColor: 'bg-sky-100 text-sky-900 border-sky-200',
    description:
      'Dispatches high-priority SMS alerts to registered agricultural workers and villagers near wildlife movement corridors, complete with simple opt-out controls.',
    bullets: [
      'Instant SMS warnings to field workers',
      'No smartphone or mobile app required',
      'One-tap "STOP" opt-out compliance',
    ],
    visualContent: {
      heading: 'Simulated SMS Warning Message',
      badge: 'SMS Dispatched · 34 Recipients',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
      stats: [
        { label: 'Message', value: 'GAHM ALERT: High elephant risk near North Farm.' },
        { label: 'Action Advice', value: 'Avoid field boundary until 21:00 UTC.' },
        { label: 'Opt-out', value: 'Reply STOP to unsubscribe' },
      ],
      caption:
        'Visual Feature Preview: Simulated mobile SMS notification card displaying clear text advice and opt-out instructions.',
    },
  },
  {
    id: 'human-in-loop',
    title: 'Human-in-the-Loop & Model Calibration',
    subtitle: 'Rangers stay in control with transparent feedback loops',
    tag: 'Responsible AI',
    tagColor: 'bg-purple-100 text-purple-900 border-purple-200',
    description:
      'Zero autonomous dispatches or automatic acoustic/visual deterrents. Rangers inspect every high-risk signal, log actual field outcomes, and continuously calibrate prediction accuracy.',
    bullets: [
      'Human ranger retains full dispatch authority',
      'Field outcome logging (Conflict Prevented / False Positive)',
      'Continuous algorithm weight verification',
    ],
    visualContent: {
      heading: 'Field Outcome Verification Log',
      badge: 'Human Ranger Confirmed',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-200',
      stats: [
        { label: 'Verification', value: 'Ranger Patrol Dispatched' },
        { label: 'Outcome', value: 'Elephant Herd Safely Diverted' },
        { label: 'Model Impact', value: 'Proximity Weight Validated (+25)' },
      ],
      caption:
        'Visual Feature Preview: Ranger verification panel showing outcome logged and continuous model calibration metric.',
    },
  },
]

export default function FeatureCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [locked, setLocked] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const indexRef = useRef(0)
  const lockedRef = useRef(false)
  const lastStepAtRef = useRef(0)
  const touchStartYRef = useRef(0)

  const goTo = (index: number) => {
    const clamped = Math.min(SLIDES.length - 1, Math.max(0, index))
    indexRef.current = clamped
    setCurrentIndex(clamped)
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const STEP_DEBOUNCE_MS = 650
    const WHEEL_MIN_DELTA = 8
    const TOUCH_MIN_DELTA = 40

    // Freeze the page and lock scrolling while the deck is active.
    const engage = () => {
      // Only lock when the whole deck fits in the viewport (small screens
      // keep free scrolling so the controls stay reachable).
      if (container.offsetHeight > window.innerHeight) return
      lockedRef.current = true
      setLocked(true)
      lenisHolder.instance?.stop()
    }

    // Release the lock and continue scrolling past the deck.
    const release = (direction: 'up' | 'down') => {
      if (!lockedRef.current) return
      lockedRef.current = false
      setLocked(false)
      const lenis = lenisHolder.instance
      lenis?.start()
      const vh = window.innerHeight
      if (direction === 'down') {
        const deckTop = container.getBoundingClientRect().top + window.scrollY
        lenis?.scrollTo(deckTop + container.offsetHeight + vh * 0.1, { duration: 1.1 })
      } else {
        lenis?.scrollTo(Math.max(0, window.scrollY - vh * 0.9), { duration: 1.1 })
      }
    }

    const onWheel = (e: WheelEvent) => {
      if (!lockedRef.current) return
      const delta = e.deltaY
      const now = Date.now()
      const withinCooldown = now - lastStepAtRef.current < STEP_DEBOUNCE_MS
      if (withinCooldown || Math.abs(delta) < WHEEL_MIN_DELTA) {
        e.preventDefault()
        return
      }
      const atEnd = indexRef.current >= SLIDES.length - 1
      const atStart = indexRef.current <= 0
      if ((delta > 0 && atEnd) || (delta < 0 && atStart)) {
        release(delta > 0 ? 'down' : 'up')
        return
      }
      e.preventDefault()
      lastStepAtRef.current = now
      goTo(indexRef.current + (delta > 0 ? 1 : -1))
    }

    const onTouchStart = (e: TouchEvent) => {
      if (lockedRef.current) touchStartYRef.current = e.touches[0].clientY
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!lockedRef.current) return
      e.preventDefault()
      const deltaY = touchStartYRef.current - e.touches[0].clientY
      const now = Date.now()
      if (Math.abs(deltaY) < TOUCH_MIN_DELTA || now - lastStepAtRef.current < STEP_DEBOUNCE_MS) {
        return
      }
      touchStartYRef.current = e.touches[0].clientY
      lastStepAtRef.current = now
      const atEnd = indexRef.current >= SLIDES.length - 1
      const atStart = indexRef.current <= 0
      if ((deltaY > 0 && atEnd) || (deltaY < 0 && atStart)) {
        release(deltaY > 0 ? 'down' : 'up')
        return
      }
      goTo(indexRef.current + (deltaY > 0 ? 1 : -1))
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (!lockedRef.current) return
      const forward = e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown'
      const back = e.key === 'ArrowUp' || e.key === 'PageUp'
      if (!forward && !back) return
      e.preventDefault()
      const now = Date.now()
      if (now - lastStepAtRef.current < STEP_DEBOUNCE_MS) return
      lastStepAtRef.current = now
      if (forward) {
        if (indexRef.current >= SLIDES.length - 1) release('down')
        else goTo(indexRef.current + 1)
      } else if (indexRef.current <= 0) {
        release('up')
      } else {
        goTo(indexRef.current - 1)
      }
    }

    // Engage the scroll-lock as soon as the deck reaches just below the
    // sticky header (top += 80px) so its top bar stays fully visible, and
    // release it if the user scrolls back above it.
    const lockTrigger = ScrollTrigger.create({
      trigger: container,
      start: 'top top+=80',
      onEnter: engage,
      onLeaveBack: () => {
        if (lockedRef.current) release('up')
      },
    })

    // Gentle reveal the first time the deck scrolls into view.
    const reveal = ScrollTrigger.create({
      trigger: container,
      start: 'top 82%',
      once: true,
      onEnter: () => {
        if (!cardRef.current) return
        gsap.fromTo(
          cardRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }
        )
      },
    })

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('keydown', onKeyDown)

    return () => {
      lockTrigger.kill()
      reveal.kill()
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('keydown', onKeyDown)
      if (lockedRef.current) {
        lockedRef.current = false
        setLocked(false)
        lenisHolder.instance?.start()
      }
    }
  }, [])

  // Morph transition on slide change
  useEffect(() => {
    if (!cardRef.current) return
    gsap.fromTo(
      cardRef.current,
      { opacity: 0.5, y: 10, scale: 0.99 },
      { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'power2.out' }
    )
  }, [currentIndex])

  const current = SLIDES[currentIndex]
  const isLastSlide = currentIndex === SLIDES.length - 1

  return (
    <div
      ref={containerRef}
      className="w-full rounded-3xl border border-[#E8E2D5] bg-white p-6 shadow-2xl backdrop-blur-md sm:p-10 transition-all"
    >
      {/* Top Carousel Bar: Slide Indicators & Control Badges */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#E8E2D5] pb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold uppercase tracking-wider text-neutral-500">
            Feature Showcase ({currentIndex + 1} of {SLIDES.length})
          </span>
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${current.tagColor}`}
          >
            {current.tag}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Scroll Lock Pill */}
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#123524]/10 px-3 py-1 text-sm font-semibold text-[#123524]">
            <span
              className={`h-1.5 w-1.5 rounded-full bg-[#123524] ${locked ? 'animate-pulse' : ''}`}
            />
            {locked ? 'Scroll Locked Deck' : 'Interactive Deck'}
          </span>

          {/* Manual Controls */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => goTo((indexRef.current - 1 + SLIDES.length) % SLIDES.length)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E8E2D5] bg-[#FDFBF7] text-neutral-700 hover:bg-[#123524] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123524]"
              aria-label="Previous feature"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => goTo((indexRef.current + 1) % SLIDES.length)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E8E2D5] bg-[#FDFBF7] text-neutral-700 hover:bg-[#123524] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123524]"
              aria-label="Next feature"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Main Slide Card Content */}
      <div ref={cardRef} className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
        {/* Left Column: Narrative Details */}
        <div className="space-y-4 lg:col-span-6">
          <h3 className="text-2xl font-bold tracking-tight text-[#123524] sm:text-3xl">
            {current.title}
          </h3>
          <p className="text-base font-semibold text-[#C05621]">{current.subtitle}</p>
          <p className="text-base leading-relaxed text-neutral-700">{current.description}</p>

          <ul className="space-y-2.5 pt-2">
            {current.bullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-2 text-base font-medium text-neutral-800">
                <span className="mt-0.5 font-bold text-[#123524]">✓</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Column: Visual Component Card */}
        <div className="lg:col-span-6">
          <div className="rounded-2xl border border-[#E8E2D5] bg-[#FDFBF7] p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between border-b border-[#E8E2D5] pb-3">
              <span className="text-base font-bold text-[#123524]">{current.visualContent.heading}</span>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${current.visualContent.badgeColor}`}
              >
                {current.visualContent.badge}
              </span>
            </div>

            {/* Stat Rows */}
            <div className="space-y-2.5">
              {current.visualContent.stats.map((stat, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between rounded-lg p-3 text-base ${
                    stat.highlight
                      ? 'border border-[#123524]/30 bg-[#123524]/10 text-[#123524] font-semibold'
                      : 'border border-[#E8E2D5] bg-white text-neutral-700'
                  }`}
                >
                  <span className="font-medium text-neutral-600">{stat.label}</span>
                  <span className="font-semibold">{stat.value}</span>
                </div>
              ))}
            </div>

            {/* Accessibility Visual Description */}
            <div className="mt-4 border-t border-[#E8E2D5] pt-3">
              <p className="text-sm leading-snug italic text-neutral-600">
                <span className="font-semibold text-[#123524] not-italic">
                  Visual Accessibility Note:
                </span>{' '}
                {current.visualContent.caption}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Dots */}
      <div className="mt-8 flex items-center justify-center gap-2">
        {SLIDES.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => goTo(index)}
            className={`h-2.5 transition-all ${
              index === currentIndex
                ? 'w-8 rounded-full bg-[#123524]'
                : 'w-2.5 rounded-full bg-[#E8E2D5] hover:bg-neutral-400'
            }`}
            aria-label={`Go to slide ${index + 1}: ${slide.title}`}
          />
        ))}
      </div>

      {/* Scroll-Lock Hint */}
      <div className="mt-4 flex min-h-6 items-center justify-center text-sm">
        {locked ? (
          isLastSlide ? (
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#C05621]">
              <span aria-hidden="true" className="animate-bounce">↓</span>
              Keep scrolling to continue to the personas
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 font-medium text-neutral-600">
              <span aria-hidden="true" className="animate-bounce">↓</span>
              Scroll to step through the deck · Scroll up to go back
            </span>
          )
        ) : null}
      </div>
    </div>
  )
}
