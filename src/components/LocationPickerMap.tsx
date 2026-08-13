import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { zones, farmZones, communities } from '../data/demoData'
import type { ZonePolygon, FarmZone, Community } from '../types'

interface LocationPickerProps {
  initial?: { lat: number; lng: number } | null
  onConfirm: (pos: { lat: number; lng: number }) => void
  onClose: () => void
}

function LocationPickerMap({ initial = null, onConfirm, onClose }: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.CircleMarker | null>(null)
  const placePinRef = useRef<
    (p: { lat: number; lng: number }, zoom?: number, accuracyM?: number) => void
  >(() => {})
  const accuracyRingRef = useRef<L.Circle | null>(null)
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [askLocation, setAskLocation] = useState(!initial && 'geolocation' in navigator)
  const [locateError, setLocateError] = useState<string | null>(null)

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

    zones.forEach((z: ZonePolygon) => {
      const pts: L.LatLngTuple[] = z.polygon.map((p): L.LatLngTuple => [p[0], p[1]])
      L.polygon(pts, {
        fillColor: 'rgba(234,179,8,0.18)',
        fillOpacity: 1,
        color: '#ca8a04',
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

    const zonePts = zones.flatMap((z): L.LatLngTuple[] =>
      z.polygon.map((p): L.LatLngTuple => [p[0], p[1]]),
    )
    if (zonePts.length > 0) {
      map.fitBounds(L.latLngBounds(zonePts), { padding: [30, 30] })
    } else {
      map.setView([0, 0], 3)
    }

    const placePin = (
      p: { lat: number; lng: number },
      zoom?: number,
      accuracyM?: number,
    ) => {
      if (mapRef.current !== map) return
      markerRef.current?.remove()
      markerRef.current = L.circleMarker([p.lat, p.lng], {
        radius: 12,
        color: '#ffffff',
        weight: 2,
        fillColor: '#dc2626',
        fillOpacity: 0.95,
      }).addTo(map)
      accuracyRingRef.current?.remove()
      if (accuracyM && accuracyM > 0) {
        accuracyRingRef.current = L.circle([p.lat, p.lng], {
          radius: accuracyM,
          color: '#dc2626',
          weight: 1,
          dashArray: '4 6',
          fillColor: '#dc2626',
          fillOpacity: 0.06,
        }).addTo(map)
      }
      if (zoom) map.setView([p.lat, p.lng], zoom)
      setPos(p)
      setAccuracy(accuracyM ?? null)
      setLocateError(null)
    }
    placePinRef.current = placePin

    if (initial) {
      placePin(initial, 15)
    }

    map.on('click', (e: L.LeafletMouseEvent) => {
      placePin({ lat: e.latlng.lat, lng: e.latlng.lng })
    })

    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [initial])

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const useMyLocation = () => {
    setAskLocation(false)
    setLocateError(null)
    navigator.geolocation.getCurrentPosition(
      (position) =>
        placePinRef.current(
          { lat: position.coords.latitude, lng: position.coords.longitude },
          15,
          position.coords.accuracy,
        ),
      () =>
        setLocateError(
          'Location unavailable — check permissions, or click the map to place the marker.',
        ),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 30_000 },
    )
  }

  const coarse = accuracy != null && accuracy > 2000
  const accuracyLabel =
    accuracy == null
      ? ''
      : accuracy < 1000
        ? `±${Math.round(accuracy)} m`
        : `±${(accuracy / 1000).toFixed(1)} km`

  return (
    <div className="fixed inset-0 z-[1100] flex flex-col bg-neutral-900">
      <div className="flex items-center justify-between border-b border-neutral-700 px-4 py-2.5 text-white">
        <div>
          <div className="text-sm font-bold">Select detection location</div>
          <div className="text-[11px] text-neutral-400">
            Click the map to place the marker
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-md px-2 py-1 text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        >
          ×
        </button>
      </div>

      <div ref={containerRef} className="relative min-h-0 flex-1 cursor-crosshair">
        {askLocation ? (
          <div className="absolute top-3 left-1/2 z-[1000] w-[300px] -translate-x-1/2 rounded-lg border border-neutral-200 bg-white p-3 shadow-xl">
            <div className="text-sm font-semibold text-neutral-900">
              Use your current location?
            </div>
            <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">
              Set the pin to where you are now, or click the map to choose elsewhere.
            </p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={useMyLocation}
                className="flex-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                Use my location
              </button>
              <button
                type="button"
                onClick={() => setAskLocation(false)}
                className="flex-1 rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
              >
                Not now
              </button>
            </div>
          </div>
        ) : null}

        {!askLocation && (locateError || coarse) ? (
          <div className="absolute bottom-3 left-1/2 z-[1000] w-[300px] -translate-x-1/2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 shadow-lg">
            {locateError ??
              `Location is approximate (${accuracyLabel}) — click the map to fine-tune the pin.`}
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-3 border-t border-neutral-700 bg-neutral-900 px-4 py-2.5 text-white">
        <span className="min-w-0 flex-1 truncate font-mono text-xs text-neutral-300">
          {pos
            ? `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}${accuracy ? ` · ${accuracyLabel}` : ''}`
            : 'No location yet — click the map'}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-neutral-600 px-3 py-1.5 text-xs text-neutral-200 transition-colors hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!pos}
          onClick={() => pos && onConfirm(pos)}
          className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Confirm location
        </button>
      </div>
    </div>
  )
}

export default LocationPickerMap