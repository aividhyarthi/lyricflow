'use client'

import { useState } from 'react'
import { Platform } from '@/app/page'

type Props = {
  caption: string
  platform: Platform
  onRegenerate: () => void
}

export default function CaptionBox({ caption, platform, onRegenerate }: Props) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(caption)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
          Caption · {platform}
        </div>
        <button onClick={onRegenerate} className="text-xs transition-all" style={{ color: 'var(--muted)' }}>
          🔄 Regenerate
        </button>
      </div>

      <div className="rounded-xl p-3 text-sm leading-relaxed whitespace-pre-wrap break-words mb-2"
        style={{ background: 'var(--s2)', border: '1px solid var(--border)', color: 'var(--text)', minHeight: 80 }}>
        {caption || 'Generate content to see caption…'}
      </div>

      <button onClick={copy}
        className="w-full py-2 rounded-xl text-xs font-medium transition-all"
        style={{
          border: '1px solid var(--border2)',
          background: copied ? 'rgba(74,222,128,0.1)' : 'transparent',
          color: copied ? '#4ade80' : 'var(--muted)',
        }}>
        {copied ? '✓ Copied!' : '📋 Copy caption'}
      </button>
    </div>
  )
}
