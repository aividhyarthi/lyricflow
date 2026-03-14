'use client'

import { Platform } from '@/app/page'

const PLATFORMS: { id: Platform; icon: string; label: string; size: string }[] = [
  { id: 'reels',   icon: '📱', label: 'Reels',    size: '9:16' },
  { id: 'shorts',  icon: '▶️', label: 'Shorts',   size: '9:16' },
  { id: 'post',    icon: '🖼️', label: 'Post',     size: '1:1'  },
  { id: 'twitter', icon: '🐦', label: 'Twitter',  size: '16:9' },
]

const STYLES = ['Gradient', 'Dark', 'Devotional', 'Minimal', 'Neon']

type Props = {
  platform: Platform
  onPlatform: (p: Platform) => void
  thumbStyle: string
  onStyle: (s: string) => void
}

export default function PlatformTabs({ platform, onPlatform, thumbStyle, onStyle }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {/* Platform grid */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>Platform</div>
        <div className="grid grid-cols-2 gap-2">
          {PLATFORMS.map(p => (
            <button
              key={p.id}
              onClick={() => onPlatform(p.id)}
              className="rounded-xl py-2.5 text-center transition-all"
              style={{
                background: platform === p.id ? 'rgba(185,110,245,0.12)' : 'var(--s2)',
                border: `1px solid ${platform === p.id ? 'var(--accent)' : 'var(--border)'}`,
                color: 'var(--text)',
              }}>
              <div className="text-base mb-0.5">{p.icon}</div>
              <div className="text-xs font-medium">{p.label}</div>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>{p.size}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Thumbnail style */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>Thumbnail style</div>
        <div className="flex gap-1.5 flex-wrap">
          {STYLES.map(s => (
            <button
              key={s}
              onClick={() => onStyle(s.toLowerCase())}
              className="text-xs px-3 py-1.5 rounded-full transition-all"
              style={{
                border: `1px solid ${thumbStyle === s.toLowerCase() ? 'var(--accent)' : 'var(--border2)'}`,
                background: thumbStyle === s.toLowerCase() ? 'rgba(185,110,245,0.14)' : 'transparent',
                color: thumbStyle === s.toLowerCase() ? 'var(--accent2)' : 'var(--muted)',
              }}>
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
