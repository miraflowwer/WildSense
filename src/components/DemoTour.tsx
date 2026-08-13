import { useState, useEffect } from 'react'
import { Joyride, STATUS } from 'react-joyride'
import type { EventData, Step } from 'react-joyride'
import { useGahm } from '../store/storeContext'

interface DemoTourProps {
  runTour: boolean
  onFinishTour: () => void
}

export default function DemoTour({ runTour, onFinishTour }: DemoTourProps) {
  const { state } = useGahm()
  const [stepIndex, setStepIndex] = useState(0)

  const evt1042 = state.events.find((e) => e.event_id === 'EVT-1042')
  const evt1045 = state.events.find((e) => e.event_id === 'EVT-1045')

  // Reset step index when tour is activated
  useEffect(() => {
    if (runTour) {
      setStepIndex(0)
    }
  }, [runTour])

  // Reactive state machine: advance steps automatically as demo actions are performed
  useEffect(() => {
    if (!runTour || !evt1042 || !evt1045) return

    if (stepIndex === 2 && state.selectedId === 'EVT-1042') {
      setStepIndex(3)
    } else if (stepIndex === 3 && evt1042.status === 'under_review') {
      setStepIndex(4)
    } else if (stepIndex === 4 && evt1042.rangerContactedAt != null) {
      setStepIndex(5)
    } else if (stepIndex === 5 && state.sms.openEventId === 'EVT-1042') {
      setStepIndex(6)
    } else if (stepIndex === 6 && !state.sms.openEventId && state.sms.sentAt != null) {
      setStepIndex(7)
    } else if (
      stepIndex === 7 &&
      (evt1042.status === 'resolved' || evt1042.status === 'dismissed') &&
      !state.selectedId
    ) {
      setStepIndex(8)
    } else if (stepIndex === 8 && state.selectedId === 'EVT-1045') {
      setStepIndex(9)
    }
  }, [state, stepIndex, runTour, evt1042, evt1045])

  const handleJoyrideEvent = (data: EventData) => {
    const { action, index, status, type } = data
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      onFinishTour()
      return
    }

    if (type === 'step:after') {
      if (action === 'next') {
        setStepIndex(index + 1)
      } else if (action === 'prev') {
        setStepIndex(Math.max(0, index - 1))
      }
    }
  }

  const steps: Step[] = [
    {
      target: '[data-tour="ops-bar"]',
      content:
        'Monitor operational metrics at a glance: active high-risk incidents, unreviewed alerts, average response time, online sensors, and affected communities.',
      skipBeacon: true,
      placement: 'bottom',
    },
    {
      target: '[data-tour="map-view"]',
      content:
        'Interactive reserve map displaying farm zones (amber), protected boundaries (green), communities (purple), sensors, and detection movement trails.',
      placement: 'right',
    },
    {
      target: '[data-tour="alert-EVT-1042"]',
      content:
        'EVT-1042 is the flagship high-risk incident (87/100 Elephant group moving toward farm at dusk). Click EVT-1042 to inspect.',
      placement: 'left',
    },
    {
      target: '[data-tour="btn-acknowledge"]',
      content:
        'Review signal points (+25 proximity, +20 movement, +15 hotspot). Click Acknowledge to claim ownership and track response time.',
      placement: 'top',
    },
    {
      target: '[data-tour="btn-contact-ranger"]',
      content: 'Click Contact ranger unit to log dispatch of field patrols.',
      placement: 'top',
    },
    {
      target: '[data-tour="btn-prepare-sms"]',
      content: 'Click Prepare community warning to launch the localized SMS simulator.',
      placement: 'top',
    },
    {
      target: '[data-tour="btn-send-sms"]',
      content:
        'Toggle language (English/Hindi) and click Send warning to simulate a community alert without broadcasting exact animal coordinates.',
      placement: 'top',
    },
    {
      target: '[data-tour="btn-close-record"]',
      content:
        'Close the SMS simulator modal when done, then click Close & record outcome to save field results and response duration.',
      placement: 'top',
    },
    {
      target: '[data-tour="alert-EVT-1045"]',
      content: 'Now click EVT-1045 to explore how GAHM handles uncertain or missing sensor data.',
      placement: 'left',
    },
    {
      target: '[data-tour="uncertainty-warning"]',
      content:
        'Notice the amber uncertainty warning: GAHM penalizes missing data instead of guessing, keeping human operators informed and in full control. Tour complete!',
      placement: 'top',
    },
  ]

  if (!runTour) return null

  return (
    <Joyride
      steps={steps}
      run={runTour}
      stepIndex={stepIndex}
      onEvent={handleJoyrideEvent}
      continuous
      options={{
        primaryColor: '#059669',
        textColor: '#171717',
        backgroundColor: '#ffffff',
        overlayColor: 'rgba(0, 0, 0, 0.45)',
        showProgress: true,
        zIndex: 10000,
      }}
      styles={{
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
          padding: '12px 4px 4px 4px',
        },
      }}
    />
  )
}
