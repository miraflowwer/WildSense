import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { zones, farmZones, communities, sensors } from '../data/demoData'
import type { ZonePolygon, FarmZone, Community, Sensor, CorridorActivityZone, RiskLevel } from '../types'

interface CommunityMapViewProps {
  corridorActivity?: CorridorActivityZone[]
  onSubscribeForCommunity?: (communityName: string) => void
}

interface SectorInfo {
  id: string
  name: string
  community: string
  riskLevel: RiskLevel
  count: number
  advisory: string
  center: [number, number]
  zoom: number
}

const DEFAULT_SECTORS: SectorInfo[] = [
  {
    id: 'bandipur',
    name: 'Bandipur Buffer Zone',
    community: 'Hangala',
    riskLevel: 'high',
    count: 3,
    advisory: 'Elephant movement detected near north agricultural border. Night farm-perimeter vigilance advised.',
    center: [11.7471, 76.6504],
    zoom: 13,
  },
  {
    id: 'nagarhole',
    name: 'Nagarhole Sector Gap',
    community: 'Beechanahalli',
    riskLevel: 'medium',
    count: 2,
    advisory: 'Wildlife activity in Kabini fringe scrubland. Keep livestock inside secure enclosures after dusk.',
    center: [11.9735, 76.3528],
    zoom: 13,
  },
  {
    id: 'mudumalai',
    name: 'Mudumalai Fringe',
    community: 'Masinagudi',
    riskLevel: 'low',
    count: 1,
    advisory: 'Normal corridor movement along Moyar river basin. Zero immediate farm boundary threats.',
    center: [11.5722, 76.6427],
    zoom: 13,
  },
]

export default function CommunityMapView({
  corridorActivity,
  onSubscribeForCommunity,
}: CommunityMapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)

  const sectors: SectorInfo[] = DEFAULT_SECTORS.map((def) => {
    const matched = corridorActivity?.find(
      (ca) => ca.community.toLowerCase() === def.community.toLowerCase(),
    )
    if (matched) {
      return {
        ...def,
        riskLevel: matched.riskLevel,
        count: matched.count,
      }
    }
    return def
  })

  const sectorsRef = useRef(sectors)
  sectorsRef.current = sectors

  const [selectedSector, setSelectedSector] = useState<string>('all')
  const [activeInfo, setActiveInfo] = useState<SectorInfo | null>(sectors[0])
  const [showSensors, setShowSensors] = useState<boolean>(true)
  const [showBuffers, setShowBuffers] = useState<boolean>(true)

  // Map layer references
  const staticGroupRef = useRef<L.LayerGroup | null>(null)
  const sensorGroupRef = useRef<L.LayerGroup | null>(null)
  const bufferGroupRef = useRef<L.LayerGroup | null>(null)
  const riskGroupRef = useRef<L.LayerGroup | null>(null)

  // Initialize Leaflet Map
  useEffect(() => {
    const el = containerRef.current
    if (!el || mapRef.current) return

    const map = L.map(el, {
      scrollWheelZoom: true,
      zoomControl: true,
    })
    mapRef.current = map

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    const staticGroup = L.layerGroup().addTo(map)
    const bufferGroup = L.layerGroup().addTo(map)
    const riskGroup = L.layerGroup().addTo(map)
    const sensorGroup = L.layerGroup().addTo(map)

    staticGroupRef.current = staticGroup
    bufferGroupRef.current = bufferGroup
    riskGroupRef.current = riskGroup
    sensorGroupRef.current = sensorGroup

    // 1. Corridor Reserve Boundaries
    zones.forEach((z: ZonePolygon) => {
      const pts: L.LatLngTuple[] = z.polygon.map((p): L.LatLngTuple => [p[0], p[1]])
      L.polygon(pts, {
        fillColor: '#123524',
        fillOpacity: 0.08,
        color: '#123524',
        weight: 2.5,
        dashArray: '5 7',
      })
        .bindTooltip(`Protected Reserve: ${z.name}`, { sticky: true })
        .addTo(staticGroup)
    })

    // 2. Agricultural & Buffer Zones
    farmZones.forEach((f: FarmZone) => {
      L.circle([f.center[0], f.center[1]], {
        radius: f.radiusKm * 1000,
        fillColor: '#D97706',
        fillOpacity: 0.15,
        color: '#B45309',
        weight: 1.5,
        dashArray: '3 4',
      })
        .bindTooltip(`Agricultural Buffer: ${f.name}`, { sticky: true })
        .addTo(bufferGroup)
    })

    // 3. Privacy-Sanitized Zone Risk Highlights
    const riskHighlights = [
      {
        center: [11.7471, 76.6504] as [number, number],
        radius: 2800,
        color: '#DC2626',
        fillColor: '#EF4444',
        title: 'Bandipur Buffer — HIGH RISK ZONE',
      },
      {
        center: [11.9735, 76.3528] as [number, number],
        radius: 2400,
        color: '#D97706',
        fillColor: '#F59E0B',
        title: 'Nagarhole Gap — MEDIUM RISK ZONE',
      },
      {
        center: [11.5722, 76.6427] as [number, number],
        radius: 2200,
        color: '#059669',
        fillColor: '#10B981',
        title: 'Mudumalai Fringe — LOW RISK ZONE',
      },
    ]

    riskHighlights.forEach((r) => {
      L.circle(r.center, {
        radius: r.radius,
        color: r.color,
        fillColor: r.fillColor,
        fillOpacity: 0.2,
        weight: 2,
      })
        .bindTooltip(r.title, { sticky: true })
        .addTo(riskGroup)
    })

    // 4. Communities / Settlements
    communities.forEach((c: Community) => {
      const isHangala = c.name === 'Hangala'
      const isBeech = c.name === 'Beechanahalli'
      const badgeColor = isHangala ? '#DC2626' : isBeech ? '#D97706' : '#059669'

      const customIcon = L.divIcon({
        className: 'custom-community-marker',
        html: `
          <div style="display:flex; align-items:center; gap:6px; background:#123524; color:white; padding:4px 8px; border-radius:9999px; font-size:11px; font-weight:700; box-shadow:0 2px 8px rgba(0,0,0,0.3); border:2px solid white; cursor:pointer;">
            <span style="display:inline-block; width:8px; height:8px; border-radius:9999px; background:${badgeColor};"></span>
            <span>${c.name}</span>
          </div>
        `,
        iconSize: [110, 26],
        iconAnchor: [55, 13],
      })

      L.marker([c.center[0], c.center[1]], { icon: customIcon })
        .on('click', () => {
          const matched = sectorsRef.current.find((s) => s.community === c.name)
          if (matched) {
            setSelectedSector(matched.id)
            setActiveInfo(matched)
            map.flyTo(matched.center, matched.zoom, { duration: 1.2 })
          }
        })
        .bindTooltip(`Community: ${c.name} (${c.preferredLanguage}) — Click to inspect advisory`)
        .addTo(staticGroup)
    })

    // 5. Sensor Gateways
    sensors.forEach((s: Sensor) => {
      const on = s.online
      L.circleMarker([s.position[0], s.position[1]], {
        radius: 5,
        color: on ? '#0284C7' : '#94A3B8',
        weight: 2,
        fillColor: on ? '#38BDF8' : '#CBD5E1',
        fillOpacity: 0.9,
      })
        .bindTooltip(`Telemetry Node: ${s.name} (${on ? 'Active' : 'Offline'})`, { sticky: true })
        .addTo(sensorGroup)
    })

    // Fit Initial Bounds
    const allPts = zones.flatMap((z) => z.polygon.map((p): L.LatLngTuple => [p[0], p[1]]))
    if (allPts.length > 0) {
      map.fitBounds(L.latLngBounds(allPts), { padding: [30, 30] })
    }

    return () => {
      map.remove()
      mapRef.current = null
      staticGroupRef.current = null
      bufferGroupRef.current = null
      riskGroupRef.current = null
      sensorGroupRef.current = null
    }
  }, [])

  // Toggle Sensor Layer
  useEffect(() => {
    const group = sensorGroupRef.current
    const map = mapRef.current
    if (!group || !map) return
    if (showSensors) {
      if (!map.hasLayer(group)) map.addLayer(group)
    } else {
      if (map.hasLayer(group)) map.removeLayer(group)
    }
  }, [showSensors])

  // Toggle Buffer Layer
  useEffect(() => {
    const group = bufferGroupRef.current
    const map = mapRef.current
    if (!group || !map) return
    if (showBuffers) {
      if (!map.hasLayer(group)) map.addLayer(group)
    } else {
      if (map.hasLayer(group)) map.removeLayer(group)
    }
  }, [showBuffers])

  const handleSelectSector = (sectorId: string) => {
    setSelectedSector(sectorId)
    const map = mapRef.current
    if (!map) return

    if (sectorId === 'all') {
      setActiveInfo(null)
      const allPts = zones.flatMap((z) => z.polygon.map((p): L.LatLngTuple => [p[0], p[1]]))
      if (allPts.length > 0) {
        map.fitBounds(L.latLngBounds(allPts), { padding: [30, 30] })
      }
    } else {
      const matched = sectors.find((s) => s.id === sectorId)
      if (matched) {
        setActiveInfo(matched)
        map.flyTo(matched.center, matched.zoom, { duration: 1.2 })
      }
    }
  }

  // Active risk badges
  const getRiskBadge = (level: RiskLevel) => {
    if (level === 'high') {
      return (
        <span className="rounded-full bg-red-100 border border-red-200 px-2.5 py-0.5 text-xs font-bold text-red-800">
          HIGH RISK
        </span>
      )
    }
    if (level === 'medium') {
      return (
        <span className="rounded-full bg-amber-100 border border-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-800">
          MEDIUM RISK
        </span>
      )
    }
    return (
      <span className="rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
        LOW RISK
      </span>
    )
  }

  return (
    <div
      data-lenis-prevent
      className="relative flex flex-col rounded-3xl border border-[#E8E2D5] bg-[#FDFBF7] shadow-lg overflow-hidden"
    >
      {/* Map Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8E2D5] bg-white/90 px-4 py-3 sm:px-6">
        {/* Sector Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => handleSelectSector('all')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all shrink-0 ${
              selectedSector === 'all'
                ? 'bg-[#123524] text-white shadow-xs'
                : 'bg-[#F6F2EA] text-neutral-700 hover:bg-[#E8E2D5]'
            }`}
          >
            Entire Corridor
          </button>
          {sectors.map((s) => {
            const isSel = selectedSector === s.id
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelectSector(s.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all shrink-0 ${
                  isSel
                    ? 'bg-[#123524] text-white shadow-xs'
                    : 'bg-[#F6F2EA] text-neutral-700 hover:bg-[#E8E2D5]'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    s.riskLevel === 'high'
                      ? 'bg-red-500'
                      : s.riskLevel === 'medium'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                  }`}
                />
                <span>{s.community}</span>
              </button>
            )
          })}
        </div>

        {/* Layer Toggles & Status */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs font-medium text-neutral-600">
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showBuffers}
              onChange={(e) => setShowBuffers(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-neutral-300 text-emerald-700 focus:ring-emerald-500"
            />
            <span className="text-[11px] font-semibold text-neutral-700">Buffer Zones</span>
          </label>
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showSensors}
              onChange={(e) => setShowSensors(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-neutral-300 text-emerald-700 focus:ring-emerald-500"
            />
            <span className="text-[11px] font-semibold text-neutral-700">Sensors</span>
          </label>
        </div>
      </div>

      {/* Main Map Area */}
      <div className="relative h-[420px] sm:h-[480px] w-full bg-neutral-100">
        <div ref={containerRef} className="h-full w-full" />

        {/* Floating Privacy Guarantee Badge */}
        <div className="pointer-events-none absolute top-3 right-3 z-[400] max-w-[240px] sm:max-w-[280px] rounded-xl border border-[#123524]/20 bg-white/95 p-2.5 text-[11px] text-neutral-700 shadow-md backdrop-blur-xs">
          <div className="flex items-center gap-1.5 font-bold text-[#123524]">
            <span>🛡️</span>
            <span>Public Corridor View</span>
          </div>
          <p className="mt-0.5 text-[10px] leading-tight text-neutral-600">
            Sanitized aggregate zones. Precise GPS telemetry quarantined under WLPA 1972 Schedule I protection.
          </p>
        </div>

        {/* Floating Live Sector Advisory Card */}
        {activeInfo && (
          <div className="absolute bottom-3 right-3 left-3 sm:left-auto sm:max-w-sm z-[400] rounded-2xl border border-[#E8E2D5] bg-white/95 p-4 shadow-xl backdrop-blur-md space-y-2.5">
            <div className="flex items-start justify-between gap-2 border-b border-neutral-100 pb-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  {activeInfo.name}
                </span>
                <h4 className="text-sm font-bold text-[#123524]">
                  Community: {activeInfo.community}
                </h4>
              </div>
              {getRiskBadge(activeInfo.riskLevel)}
            </div>

            <p className="text-xs leading-relaxed text-neutral-700">
              {activeInfo.advisory}
            </p>

            <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
              <span className="text-[11px] text-neutral-500">
                Active alerts: <strong className="text-neutral-900">{activeInfo.count}</strong>
              </span>
              {onSubscribeForCommunity && (
                <button
                  type="button"
                  onClick={() => onSubscribeForCommunity(activeInfo.community)}
                  className="rounded-lg bg-emerald-800 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-emerald-900 transition-colors"
                >
                  Get SMS Alerts →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Map Legend on bottom-left */}
        <div className="pointer-events-none absolute bottom-3 left-3 hidden md:flex z-[400] flex-col gap-1 rounded-xl border border-neutral-200 bg-white/90 p-2.5 text-[10px] font-medium text-neutral-700 shadow-sm backdrop-blur-xs">
          <span className="font-bold text-neutral-900">Map Legend</span>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span>High Risk Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span>Medium Risk Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Low Risk Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-sky-500" />
            <span>Telemetry Sensor</span>
          </div>
        </div>
      </div>
    </div>
  )
}
