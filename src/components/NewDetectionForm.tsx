import { useEffect, useState } from 'react'
import { useGahm } from '../store/storeContext'
import { useI18n } from '../i18n/I18nContext'
import { speciesName, weatherName } from '../i18n/helpers'
import {
  SPECIES_IMPACT,
  WEATHER_FACTOR,
  thresholdsForZone,
} from '../engine/config'
import { computeRisk } from '../engine/riskEngine'
import { distanceToCircleKm } from '../engine/geo'
import { farmZones, nearestCommunityName } from '../data/demoData'
import type { DetectionEvent } from '../types'
import LocationPickerMap from './LocationPickerMap'

interface NewDetectionFormProps {
  onClose: () => void
}

const inputCls =
  'w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 shadow-2xs transition-colors focus:border-emerald-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40'

const labelCls = 'mb-1 block text-xs font-extrabold uppercase tracking-wider text-neutral-700'

function NewDetectionForm({ onClose }: NewDetectionFormProps) {
  const { dispatch } = useGahm()
  const { t, catalog } = useI18n()
  const [species, setSpecies] = useState('elephant')
  const [customSpecies, setCustomSpecies] = useState('')
  const [count, setCount] = useState<number>(1)
  const [confidence, setConfidence] = useState(0.8)
  const [weather, setWeather] = useState('dry_season')
  const [towardFarm, setTowardFarm] = useState(true)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [picking, setPicking] = useState(false)

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (picking) return
      if (ev.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, picking])

  const addPresetCount = (delta: number) => {
    setCount((prev) => Math.max(1, (prev || 0) + delta))
  }

  const submit = () => {
    if (!location) return
    const targetSpecies =
      species === 'other' ? customSpecies.trim().toLowerCase().replace(/\s+/g, '_') || 'wildlife' : species
    if (!targetSpecies) return

    const parsedCount = Math.max(1, Number(count) || 1)
    const timestamp = new Date().toISOString()
    const distance = Math.min(
      ...farmZones.map((f) =>
        distanceToCircleKm(location, { lat: f.center[0], lng: f.center[1] }, f.radiusKm),
      ),
    )
    const risk = computeRisk(
      {
        species: targetSpecies,
        detection_confidence: confidence,
        estimated_count: parsedCount,
        distance_to_farm_km: distance,
        movement_toward_farm: towardFarm,
        movementKnown: true,
        historical_incidents_nearby: 0,
        weather_condition: weather,
        trailLength: 1,
        hour: new Date(timestamp).getUTCHours(),
      },
      thresholdsForZone('Manual Detection'),
    )
    const event: DetectionEvent = {
      event_id: `EVT-${Date.now().toString(36).toUpperCase()}`,
      timestamp,
      sensor_zone: 'Manual Detection',
      species: targetSpecies,
      detection_confidence: confidence,
      estimated_count: parsedCount,
      distance_to_farm_km: distance,
      movement_toward_farm: towardFarm,
      movementKnown: true,
      historical_incidents_nearby: 0,
      weather_condition: weather,
      position: { lat: location.lat, lng: location.lng },
      trail: [{ lat: location.lat, lng: location.lng, ts: timestamp }],
      speed_kmh: null,
      community: nearestCommunityName(location),
      risk_score: risk.risk_score,
      risk_level: risk.risk_level,
      reasons: risk.reasons,
      uncertainty: risk.uncertainty,
      status: 'awaiting_review',
      acknowledgedAt: null,
      rangerContactedAt: null,
      owner: null,
      outcome: null,
    }
    dispatch({ type: 'ADD_EVENT', event })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl transition-all">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between border-b border-neutral-200 pb-3">
          <div>
            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
              {t('detection.fieldReport')}
            </span>
            <h3 className="mt-0.5 text-lg font-black text-neutral-900">{t('detection.title')}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Species Selector */}
          <div>
            <label htmlFor="nd-species" className={labelCls}>
              {t('detection.targetSpecies')}
            </label>
            <select
              id="nd-species"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              className={inputCls}
            >
              {Object.keys(SPECIES_IMPACT).map((s) => (
                <option key={s} value={s}>
                  {speciesName(catalog, s)}
                </option>
              ))}
              <option value="other">{t('detection.otherSpecies')}</option>
            </select>

            {species === 'other' ? (
              <div className="mt-2.5">
                <label htmlFor="nd-custom-species" className={labelCls}>
                  {t('detection.customSpecies')}
                </label>
                <input
                  id="nd-custom-species"
                  type="text"
                  placeholder={t('detection.customPlaceholder')}
                  value={customSpecies}
                  onChange={(e) => setCustomSpecies(e.target.value)}
                  className={inputCls}
                />
              </div>
            ) : null}
          </div>

          {/* Uncapped Estimated Count */}
          <div>
            <label htmlFor="nd-count" className={labelCls}>
              {t('detection.estimatedCount')}
            </label>
            <div className="flex items-center gap-2">
              <input
                id="nd-count"
                type="number"
                min={1}
                max={999}
                value={count}
                onChange={(e) => setCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className={`${inputCls} text-base font-extrabold text-emerald-950`}
              />
              <div className="flex shrink-0 gap-1">
                {[1, 5, 10, 25].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => addPresetCount(preset)}
                    className="rounded-lg border border-neutral-300 bg-neutral-50 px-2.5 py-1.5 text-xs font-bold text-neutral-700 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-800"
                  >
                    +{preset}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-1 text-[11px] text-neutral-500">{t('detection.countHint')}</p>
          </div>

          {/* Detection Confidence Slider */}
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="nd-confidence" className={labelCls}>
                {t('detection.confidence')}
              </label>
              <span className="font-mono text-xs font-extrabold text-emerald-700">
                {Math.round(confidence * 100)}%
              </span>
            </div>
            <input
              id="nd-confidence"
              type="range"
              min={0.5}
              max={1}
              step={0.01}
              value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
          </div>

          {/* Weather Dropdown (Clean Formatting) */}
          <div>
            <label htmlFor="nd-weather" className={labelCls}>
              {t('detection.weatherSeasonal')}
            </label>
            <select
              id="nd-weather"
              value={weather}
              onChange={(e) => setWeather(e.target.value)}
              className={inputCls}
            >
              {Object.keys(WEATHER_FACTOR).map((w) => (
                <option key={w} value={w}>
                  {weatherName(catalog, w)}
                </option>
              ))}
            </select>
          </div>

          {/* Movement Toward Farm Checkbox */}
          <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-3">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-neutral-800">
              <input
                type="checkbox"
                checked={towardFarm}
                onChange={(e) => setTowardFarm(e.target.checked)}
                className="h-4 w-4 rounded-md accent-emerald-600"
              />
              <span>{t('detection.vectorLabel')}</span>
            </label>
          </div>

          {/* Location Picker Card */}
          <div className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className={labelCls}>{t('detection.coordinates')}</span>
              {location ? (
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-800">
                  {t('detection.locationSet')}
                </span>
              ) : (
                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                  {t('detection.required')}
                </span>
              )}
            </div>
            <p className="mt-1 font-mono text-sm font-bold text-neutral-900">
              {location
                ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
                : t('detection.noPoint')}
            </p>
            <button
              type="button"
              onClick={() => setPicking(true)}
              className="mt-2.5 w-full rounded-lg border border-emerald-600 bg-white px-3 py-2 text-xs font-extrabold text-emerald-700 shadow-2xs transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
            >
              {location ? t('detection.changeLocation') : t('detection.selectLocation')}
            </button>
            <p className="mt-1.5 text-[11px] text-neutral-500">{t('detection.proximityNote')}</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex justify-end gap-2 border-t border-neutral-200 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-xs font-bold text-neutral-700 shadow-2xs transition-colors hover:bg-neutral-50"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!location || (species === 'other' && !customSpecies.trim())}
            className="rounded-lg bg-emerald-700 px-5 py-2 text-xs font-extrabold text-white shadow-xs transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t('detection.logDetection')}
          </button>
        </div>
      </div>

      {picking ? (
        <LocationPickerMap
          initial={location}
          onConfirm={(pos) => {
            setLocation(pos)
            setPicking(false)
          }}
          onClose={() => setPicking(false)}
        />
      ) : null}
    </div>
  )
}

export default NewDetectionForm