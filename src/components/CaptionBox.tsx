'use client'

import { useState } from 'react'
import { Platform } from '@/app/page'

type Props = {
  caption: string
  platform: Platform
  onRegenerate: () => void
  socialPack?: {
    title: string
    description: string
    hashtags: string[]
  }
}

export default function CaptionBox({ caption, platform, onRegenerate, socialPack }: Props) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    const socialSummary = socialPack
      ? `Title: ${socialPack.title}\nDescription: ${socialPack.description}\nHashtags: ${socialPack.hashtags.join(' ')}`
      : ''
    await navigator.clipboard.writeText([caption, socialSummary].filter(Boolean).join('\n\n'))
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

      {socialPack && (
        <div className="rounded-xl p-3 text-xs space-y-2 mb-2"
          style={{ background: 'var(--s2)', border: '1px solid var(--border)', color: 'var(--text)' }}>
          <div><span className="font-semibold">Title:</span> {socialPack.title}</div>
          <div><span className="font-semibold">Description:</span> {socialPack.description}</div>
          <div><span className="font-semibold">Hashtags:</span> {socialPack.hashtags.join(' ')}</div>
        </div>
      )}

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
