'use client'

import { SongInfo } from '@/app/page'

const MOOD_COLORS: Record<string, { bg: string; text: string }> = {
  devotional: { bg: 'rgba(251,191,36,0.15)', text: '#fbbf24' },
  spiritual:  { bg: 'rgba(251,191,36,0.15)', text: '#fbbf24' },
  joyful:     { bg: 'rgba(74,222,128,0.15)', text: '#4ade80' },
  energetic:  { bg: 'rgba(251,146,60,0.15)', text: '#fb923c' },
  romantic:   { bg: 'rgba(249,168,212,0.15)', text: '#f9a8d4' },
  melancholic:{ bg: 'rgba(147,197,253,0.15)', text: '#93c5fd' },
  default:    { bg: 'rgba(185,110,245,0.15)', text: '#b96ef5' },
}

function getMoodColor(mood: string) {
  const key = mood.toLowerCase()
  return MOOD_COLORS[key] || MOOD_COLORS.default
}

export default function SongCard({ info }: { info: SongInfo }) {
  const moodColor = getMoodColor(info.mood)

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--s2)', border: '1px solid var(--border)' }}>
      {/* Gradient header */}
      <div className="p-4 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a0a2e, #2d1b5c, #6b2d6b)' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(24,24,31,0.9))' }} />
        <div className="relative">
          <div className="text-xs font-semibold uppercase tracking-widest mb-2 opacity-60">Detected</div>
          <h2 className="font-display text-xl font-bold leading-tight" style={{ color: '#fff', textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>
            {info.songName}
          </h2>
          {info.artist && info.artist !== 'Unknown Artist' && (
            <p className="text-sm mt-1 opacity-70">{info.artist}</p>
          )}
        </div>
      </div>

      {/* Info grid */}
      <div className="p-3 grid grid-cols-2 gap-2">
        <InfoCell label="Language" value={info.language} accent />
        <InfoCell label="Genre" value={info.genre} />
        <div className="col-span-2">
          <div className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Mood</div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full"
            style={{ background: moodColor.bg, color: moodColor.text }}>
            {info.mood}
          </span>
        </div>
      </div>
    </div>
  )
}

function InfoCell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl p-2.5" style={{ background: 'var(--s3)', border: '1px solid var(--border)' }}>
      <div className="text-xs mb-1" style={{ color: 'var(--muted)' }}>{label}</div>
      <div className="text-sm font-semibold" style={{ color: accent ? 'var(--accent2)' : 'var(--text)' }}>
        {value || '—'}
      </div>
    </div>
  )
}
