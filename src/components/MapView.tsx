import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useGahm } from '../store/storeContext'
import { formatSpeciesName } from '../engine/config'
import { filterEvents } from '../store/selectors'
import { zones, farmZones, communities, sensors, riskLevelColor } from '../data/demoData'
import type { DetectionEvent, FarmZone, Community, Sensor, ZonePolygon } from '../types'

interface LatLngPoint {
  lat: number
  lng: number
}

type StoreDispatch = ReturnType<typeof useGahm>['dispatch']

const toRad = (deg: number): number => (deg * Math.PI) / 180
const toDeg = (rad: number): number => (rad * 180) / Math.PI

function bearing(a: LatLngPoint, b: LatLngPoint): number | null {
  if (
    !Number.isFinite(a.lat) ||
    !Number.isFinite(a.lng) ||
    !Number.isFinite(b.lat) ||
    !Number.isFinite(b.lng)
  ) {
    return null
  }
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const dLng = toRad(b.lng - a.lng)
  const x = Math.sin(dLng) * Math.cos(lat2)
  const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
  const deg = toDeg(Math.atan2(x, y))
  return Number.isFinite(deg) ? (deg + 360) % 360 : null
}

function headIndicator(head: LatLngPoint, prev: LatLngPoint): L.LatLngTuple[] | null {
  const brg = bearing(prev, head)
  if (brg === null) return null
  const ang = toRad(brg)
  const lngFactor = Math.cos(toRad(head.lat))
  const step = 0.008
  const tipLat = head.lat + Math.cos(ang) * step
  const tipLng = head.lng + Math.sin(ang) * step * lngFactor
  if (!Number.isFinite(tipLat) || !Number.isFinite(tipLng)) return null
  return [
    [head.lat, head.lng] as L.LatLngTuple,
    [tipLat, tipLng] as L.LatLngTuple,
  ]
}

function addDetection(
  group: L.LayerGroup,
  dispatch: StoreDispatch,
  ev: DetectionEvent,
  selected: boolean,
): void {
  const color = riskLevelColor[ev.risk_level]

  if (ev.trail.length >= 2) {
    const pts = ev.trail.map((p): L.LatLngTuple => [p.lat, p.lng])
    L.polyline(pts, { color, weight: 3, dashArray: '4 6' }).addTo(group)

    const arrow = headIndicator(
      ev.trail[ev.trail.length - 1],
      ev.trail[ev.trail.length - 2],
    )
    if (arrow) {
      L.polyline(arrow, { color, weight: 4, opacity: 0.95 }).addTo(group)
    }
  }

  L.circleMarker([ev.position.lat, ev.position.lng], {
    radius: selected ? 11 : 8,
    color: '#ffffff',
    weight: 2,
    fillColor: color,
    fillOpacity: 0.9,
  })
    .bindTooltip(
      `<b>${ev.event_id}</b> — ${formatSpeciesName(ev.species)}<br/>Risk ${ev.risk_score} (${ev.risk_level})`,
    )
    .on('click', () => {
      dispatch({ type: 'SELECT_ALERT', id: ev.event_id })
    })
    .addTo(group)
}

export default function MapView() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const staticGroupRef = useRef<L.LayerGroup | null>(null)
  const detectionsGroupRef = useRef<L.LayerGroup | null>(null)

  const { state, dispatch } = useGahm()
  const stateRef = useRef(state)
  stateRef.current = state
  const dispatchRef = useRef(dispatch)
  dispatchRef.current = dispatch

  useEffect(() => {
    const el = containerRef.current
    if (!el || mapRef.current) return

    const map = L.map(el)
    mapRef.current = map

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    const staticGroup = L.layerGroup().addTo(map)
    const detectionsGroup = L.layerGroup().addTo(map)
    staticGroupRef.current = staticGroup
    detectionsGroupRef.current = detectionsGroup

    zones.forEach((z: ZonePolygon) => {
      const pts: L.LatLngTuple[] = z.polygon.map((p): L.LatLngTuple => [p[0], p[1]])
      L.polygon(pts, {
        fillColor: 'rgba(22,163,74,0.25)',
        fillOpacity: 1,
        color: '#16a34a',
        weight: 2,
        dashArray: '6 6',
      }).addTo(staticGroup)
    })

    farmZones.forEach((f: FarmZone) => {
      L.circle([f.center[0], f.center[1]], {
        radius: f.radiusKm * 1000,
        fillColor: 'rgba(245,158,11,0.25)',
        fillOpacity: 1,
        color: '#d97706',
        weight: 2,
      })
        .bindTooltip(f.name)
        .addTo(staticGroup)
    })

    communities.forEach((c: Community) => {
      L.circleMarker([c.center[0], c.center[1]], {
        radius: 5,
        color: '#7c3aed',
        weight: 2,
        fillColor: '#7c3aed',
        fillOpacity: 0.35,
      })
        .bindTooltip(c.name)
        .addTo(staticGroup)
    })

    sensors.forEach((s: Sensor) => {
      const on = s.online
      L.circleMarker([s.position[0], s.position[1]], {
        radius: 6,
        color: on ? '#22c55e' : '#dc2626',
        weight: 2,
        fillColor: on ? '#22c55e' : '#dc2626',
        fillOpacity: 0.8,
      })
        .bindTooltip(`${s.name} — ${on ? 'online' : 'offline'}`)
        .addTo(staticGroup)
    })

    const zonePts = zones.flatMap((z): L.LatLngTuple[] =>
      z.polygon.map((p): L.LatLngTuple => [p[0], p[1]]),
    )
    if (zonePts.length > 0) {
      map.fitBounds(L.latLngBounds(zonePts), { padding: [30, 30] })
    } else {
      map.setView([0, 0], 3)
    }

    return () => {
      map.remove()
      mapRef.current = null
      staticGroupRef.current = null
      detectionsGroupRef.current = null
    }
  }, [])

  useEffect(() => {
    const group = detectionsGroupRef.current
    if (!group) return
    const st = stateRef.current
    group.clearLayers()
    for (const ev of filterEvents(st.events, st.filter)) {
      addDetection(group, dispatchRef.current, ev, ev.event_id === st.selectedId)
    }
  }, [state.events, state.selectedId, state.filter, dispatch])

  return (
    <div data-tour="map-view" ref={containerRef} className="h-full w-full relative">
      {state.mode === 'demo' && (
        <div className="absolute top-2 right-2 z-[1000] pointer-events-none rounded bg-black/60 px-2 py-0.5 text-[11px] text-white">
          Demo data
        </div>
      )}
    </div>
  )
}