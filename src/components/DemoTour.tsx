import { useState, useEffect, useRef } from 'react'
import { Joyride, STATUS } from 'react-joyride'
import type { EventData, Step } from 'react-joyride'
import { useGahm } from '../store/storeContext'

interface DemoTourProps {
  runTour: boolean
  onFinishTour: () => void
}

const STEPS: Step[] = [
  {
    target: '[data-tour="ops-bar"]',
    content:
      'Monitor operational metrics at a glance: active high-risk incidents, unreviewed alerts, average response time, online sensors, and affected communities.',
    skipBeacon: true,
    skipScroll: true,
    placement: 'bottom',
  },
  {
    target: '[data-tour="map-view"]',
    content: (
      <span>
        Interactive reserve map displaying farm zones (<span className="font-semibold text-amber-600">amber</span>),{' '}
        <span className="font-semibold text-emerald-600">protected boundaries (green)</span>,{' '}
        communities (<span className="font-semibold text-purple-600">purple</span> — real villages in the
        Bandipur–Nagarhole–Mudumalai corridor), sensors, and detection movement trails. Events are simulated.
      </span>
    ),
    skipBeacon: true,
    skipScroll: true,
    placement: 'center',
  },
  {
    target: '[data-tour="alert-EVT-1042"]',
    content:
      'EVT-1042 is the flagship high-risk incident (87/100 Elephant group moving toward farm at dusk). Click EVT-1042 to inspect.',
    skipScroll: true,
    placement: 'left',
  },
  {
    target: '[data-tour="contributing-signals"]',
    content:
      'Review contributing signal points (+25 proximity to farms, +20 movement toward boundary, +15 historical hotspot) that calculate the conflict risk score.',
    skipScroll: true,
    placement: 'left',
  },
  {
    target: '[data-tour="btn-acknowledge"]',
    content:
      'Click Acknowledge to claim ownership of EVT-1042 and track response time.',
    skipScroll: true,
    placement: 'left',
  },
  {
    target: '[data-tour="btn-contact-ranger"]',
    content: 'Click Contact ranger unit to log dispatch of field patrols.',
    skipScroll: true,
    placement: 'left',
  },
  {
    target: '[data-tour="btn-prepare-sms"]',
    content: 'Click Prepare community warning to launch the localized SMS simulator.',
    skipScroll: true,
    placement: 'left',
  },
  {
    target: '[data-tour="sms-modal"]',
    content:
      'The SMS Simulator lets you preview warnings composed in the community\u2019s preferred language (Kannada, Tamil, Hindi, or English) and send alerts to local residents without revealing exact animal coordinates. Toggle language or click Send warning to proceed.',
    skipScroll: true,
    placement: 'left',
  },
  {
    target: '[data-tour="btn-close-record"]',
    content:
      'The SMS simulator closes automatically. Click Close & record outcome to save field results and response duration.',
    skipScroll: true,
    placement: 'left',
  },
  {
    target: '[data-tour="alert-EVT-1045"]',
    content: 'Now click EVT-1045 to explore how WICRE handles uncertain or missing sensor data.',
    skipScroll: true,
    placement: 'left',
  },
  {
    target: '[data-tour="uncertainty-warning"]',
    content:
      'Notice the amber uncertainty warning: WICRE penalizes missing data instead of guessing, keeping human operators informed and in full control.',
    skipScroll: true,
    placement: 'left',
  },
  {
    target: '[data-tour="ops-bar"]',
    content: (
      <div className="space-y-1.5">
        <div className="text-sm font-bold text-neutral-900">Guided Tour Complete!</div>
        <p className="text-xs leading-relaxed text-neutral-600">
          You've explored WICRE's risk engine, ranger dispatch, community SMS warning simulator, and uncertainty penalty system.
        </p>
      </div>
    ),
    skipScroll: true,
    placement: 'bottom',
  },
]

export default function DemoTour({ runTour, onFinishTour }: DemoTourProps) {
  const { state, dispatch } = useGahm()
  const [stepIndex, setStepIndex] = useState(0)

  const evt1042 = state.events.find((e) => e.event_id === 'EVT-1042')
  const evt1045 = state.events.find((e) => e.event_id === 'EVT-1045')

  // Set when the user clicks Back: the stepIndex has already changed, but the store state that
  // triggered the forward rule is still set (e.g. SMS still open, EVT-1045 still selected), so
  // the state machine would immediately bounce forward again. The next machine run is skipped —
  // the sync effect below resets the relevant store state, and re-doing the step action advances
  // forward normally.
  const skipNextMachineRun = useRef(false)

  // Reset step index when tour is activated
  useEffect(() => {
    if (runTour) {
      setStepIndex(0)
    }
  }, [runTour])

  // Auto-inject tutorial events if tour is running but sample events are missing from state
  useEffect(() => {
    if (runTour && (!evt1042 || !evt1045)) {
      dispatch({ type: 'START_TUTORIAL' })
    }
  }, [runTour, evt1042, evt1045, dispatch])

  // Synchronize workspace UI state so required DOM targets exist and are enabled for stepIndex
  useEffect(() => {
    if (!runTour || !evt1042 || !evt1045) return

    switch (stepIndex) {
      case 0:
      case 1:
        if (state.sms.openEventId) dispatch({ type: 'CLOSE_SMS' })
        break

      case 2:
        // Step 3 of 12: target alert-EVT-1042 in AlertList
        if (state.sms.openEventId) dispatch({ type: 'CLOSE_SMS' })
        if (state.selectedId !== null) dispatch({ type: 'SELECT_ALERT', id: '' })
        break

      case 3:
      case 4:
        // Step 4 & 5 of 12: target contributing-signals & btn-acknowledge in AlertPanel
        if (state.sms.openEventId) dispatch({ type: 'CLOSE_SMS' })
        if (state.selectedId !== 'EVT-1042') dispatch({ type: 'SELECT_ALERT', id: 'EVT-1042' })
        if (evt1042.status !== 'awaiting_review') {
          dispatch({ type: 'RESET_EVENT_STATUS', id: 'EVT-1042', status: 'awaiting_review' })
        }
        break

      case 5:
        // Step 6 of 12: target btn-contact-ranger in AlertPanel
        if (state.sms.openEventId) dispatch({ type: 'CLOSE_SMS' })
        if (state.selectedId !== 'EVT-1042') dispatch({ type: 'SELECT_ALERT', id: 'EVT-1042' })
        if (evt1042.status === 'awaiting_review') dispatch({ type: 'ACKNOWLEDGE', id: 'EVT-1042' })
        if (evt1042.rangerContactedAt != null) {
          dispatch({ type: 'CLEAR_RANGER_CONTACT', id: 'EVT-1042' })
        }
        break

      case 6:
        // Step 7 of 12: target btn-prepare-sms in AlertPanel
        if (state.selectedId !== 'EVT-1042') dispatch({ type: 'SELECT_ALERT', id: 'EVT-1042' })
        if (evt1042.status === 'awaiting_review') dispatch({ type: 'ACKNOWLEDGE', id: 'EVT-1042' })
        if (!evt1042.rangerContactedAt) dispatch({ type: 'CONTACT_RANGER', id: 'EVT-1042' })
        if (state.sms.openEventId) dispatch({ type: 'CLOSE_SMS' })
        break

      case 7:
        // Step 8 of 12: target sms-modal in SmsSimulator modal
        if (state.selectedId !== 'EVT-1042') dispatch({ type: 'SELECT_ALERT', id: 'EVT-1042' })
        if (state.sms.openEventId !== 'EVT-1042') dispatch({ type: 'OPEN_SMS', id: 'EVT-1042' })
        break

      case 8:
        // Step 9 of 12: target btn-close-record in AlertPanel
        if (state.selectedId !== 'EVT-1042') dispatch({ type: 'SELECT_ALERT', id: 'EVT-1042' })
        if (state.sms.openEventId) dispatch({ type: 'CLOSE_SMS' })
        if (evt1042.status === 'resolved' || evt1042.status === 'dismissed') {
          dispatch({ type: 'RESET_EVENT_STATUS', id: 'EVT-1042', status: 'under_review' })
        }
        break

      case 9:
        // Step 10 of 12: target alert-EVT-1045 in AlertList
        if (state.sms.openEventId) dispatch({ type: 'CLOSE_SMS' })
        if (state.selectedId !== null) dispatch({ type: 'SELECT_ALERT', id: '' })
        break

      case 10:
        // Step 11 of 12: target uncertainty-warning in AlertPanel
        if (state.sms.openEventId) dispatch({ type: 'CLOSE_SMS' })
        if (state.selectedId !== 'EVT-1045') dispatch({ type: 'SELECT_ALERT', id: 'EVT-1045' })
        break

      case 11:
        // Step 12 of 12: final completion prompt
        if (state.sms.openEventId) dispatch({ type: 'CLOSE_SMS' })
        break
    }
  }, [
    stepIndex,
    runTour,
    state.selectedId,
    state.sms.openEventId,
    evt1042?.status,
    evt1042?.rangerContactedAt,
    evt1042,
    evt1045,
    dispatch,
  ])

  // Reactive state machine: advance steps automatically as demo actions are performed in UI
  useEffect(() => {
    if (!runTour || !evt1042 || !evt1045) return

    // One-run suppression after a Back click: the store state that triggered the previous
    // forward rule is still set in this render, and the sync effect above resets it in a
    // follow-up render — skipping this single run prevents the "Back bounces forward" bug.
    const skipThisRun = skipNextMachineRun.current
    skipNextMachineRun.current = false
    if (skipThisRun) return

    if (stepIndex === 2 && state.selectedId === 'EVT-1042') {
      setStepIndex(3)
    } else if (stepIndex === 4 && evt1042.status === 'under_review') {
      setStepIndex(5)
    } else if (stepIndex === 5 && evt1042.rangerContactedAt != null) {
      setStepIndex(6)
    } else if (stepIndex === 6 && state.sms.openEventId === 'EVT-1042') {
      setStepIndex(7)
    } else if (stepIndex === 7 && state.sms.sentAt != null) {
      setStepIndex(8)
    } else if (
      stepIndex === 8 &&
      (evt1042.status === 'resolved' || evt1042.status === 'dismissed')
    ) {
      if (state.selectedId) {
        dispatch({ type: 'SELECT_ALERT', id: '' })
      }
      setStepIndex(9)
    } else if (stepIndex === 9 && state.selectedId === 'EVT-1045') {
      setStepIndex(10)
    }
  }, [
    state.selectedId,
    state.sms.openEventId,
    state.sms.sentAt,
    stepIndex,
    runTour,
    evt1042,
    evt1045,
    dispatch,
  ])

  // Synchronize lockdown CSS class, active target attribute, and auto-scroll for current stepIndex
  useEffect(() => {
    if (!runTour || !evt1042 || !evt1045) {
      document.body.classList.remove('tour-active')
      document.querySelectorAll('[data-tour-active]').forEach((el) => {
        el.removeAttribute('data-tour-active')
      })
      return
    }

    document.body.classList.add('tour-active')

    // Secondary targets that must stay interactive alongside the main spotlighted target.
    // Step 8 (btn-close-record) opens the OutcomeForm modal — its inputs/buttons need the
    // lockdown exemption too, or the user cannot save the outcome and the tour stalls.
    const EXTRA_ACTIVE_TARGETS: Record<number, string[]> = {
      8: ['[data-tour="outcome-form"]'],
    }

    const updateActiveTarget = () => {
      document.querySelectorAll('[data-tour-active]').forEach((el) => {
        el.removeAttribute('data-tour-active')
      })

      const markActive = (sel: string) => {
        const el = document.querySelector(sel)
        if (el) el.setAttribute('data-tour-active', 'true')
      }

      const targetSel = STEPS[stepIndex]?.target
      if (typeof targetSel === 'string') {
        markActive(targetSel)
        const activeEl = document.querySelector(targetSel)
        if (activeEl) {
          activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
      }
      for (const sel of EXTRA_ACTIVE_TARGETS[stepIndex] ?? []) {
        markActive(sel)
      }
    }

    updateActiveTarget()
    const t1 = setTimeout(updateActiveTarget, 50)
    const t2 = setTimeout(updateActiveTarget, 150)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      document.body.classList.remove('tour-active')
      document.querySelectorAll('[data-tour-active]').forEach((el) => {
        el.removeAttribute('data-tour-active')
      })
    }
  }, [runTour, stepIndex, evt1042, evt1045])

  // Prevent tabbing out of active tour elements while tour is running
  useEffect(() => {
    if (!runTour) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const activeEl = document.activeElement
      const portal = document.querySelector('#react-joyride-portal')
      const tourTarget = document.querySelector('[data-tour-active]')

      const isInsidePortal = portal?.contains(activeEl)
      const isInsideTarget = tourTarget?.contains(activeEl)

      if (!isInsidePortal && !isInsideTarget) {
        e.preventDefault()
        const joyrideBtn = portal?.querySelector<HTMLElement>(
          'button[data-action="primary"], button[data-action="next"], button'
        )
        if (joyrideBtn) {
          joyrideBtn.focus()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown, true)
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [runTour])

  const handleJoyrideEvent = (data: EventData) => {
    const { action, index, status, type } = data
    if (
      status === STATUS.FINISHED ||
      status === STATUS.SKIPPED ||
      action === 'close' ||
      action === 'skip' ||
      action === 'stop'
    ) {
      onFinishTour()
      return
    }

    if (type === 'step:after') {
      if (action === 'next') {
        setStepIndex(index + 1)
      } else if (action === 'prev') {
        skipNextMachineRun.current = true
        setStepIndex(Math.max(0, index - 1))
      }
    }
  }

  if (!runTour) return null

  return (
    <Joyride
      steps={STEPS}
      run={runTour}
      stepIndex={stepIndex}
      onEvent={handleJoyrideEvent}
      continuous
      loaderComponent={null}
      locale={{
        last: 'Finish',
      }}
      floatingOptions={{
        shiftOptions: { padding: 24 },
      }}
      options={{
        primaryColor: '#059669',
        textColor: '#171717',
        backgroundColor: '#ffffff',
        overlayColor: 'rgba(0, 0, 0, 0.45)',
        showProgress: true,
        zIndex: 10000,
        overlayClickAction: false,
        closeButtonAction: 'skip',
        dismissKeyAction: 'close',
        width: 330,
      }}
      styles={{
        tooltip: {
          width: '330px',
        },
        buttonPrimary: {
          backgroundColor: '#059669',
          fontSize: '12px',
          fontWeight: 600,
          borderRadius: '6px',
          padding: '6px 12px',
        },
        buttonBack: {
          color: '#525252',
          fontSize: '12px',
          marginRight: '8px',
        },
        buttonSkip: {
          color: '#737373',
          fontSize: '12px',
        },
        tooltipContent: {
          fontSize: '13px',
          padding: '8px 4px 4px 4px',
        },
      }}
    />
  )
}
