'use client'

import { useState } from 'react'

type Props = {
  lyrics: string[]
  audioDuration: number
  onExportLRC: (content: string) => void
}

export default function LyricsEditor({ lyrics, audioDuration, onExportLRC }: Props) {
  const [edited, setEdited] = useState<string[]>([])
  const lines = edited.length > 0 ? edited : lyrics

  const handleExport = () => {
    const dur = audioDuration || 180
    const step = (dur * 0.85) / Math.max(lines.length, 1)
    let lrc = '[re:LyricFlow]\n\n'
    lines.forEach((text, i) => {
      const t = Math.round(step * i)
      const m = Math.floor(t / 60), s = t % 60
      lrc += `[${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.00]${text}\n`
    })
    onExportLRC(lrc)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
          Lyrics
        </div>
        <button onClick={handleExport} className="text-xs transition-all" style={{ color: 'var(--muted)' }}>
          ⬇ .lrc file
        </button>
      </div>

      <textarea
        className="w-full rounded-xl p-3 text-sm outline-none resize-none"
        style={{
          background: 'var(--s2)', border: '1px solid var(--border)',
          color: 'var(--text)', lineHeight: 2, minHeight: 160,
          fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif',
        }}
        value={lines.join('\n')}
        placeholder="Lyrics auto-fill after generate…&#10;One line per row."
        onChange={e => setEdited(e.target.value.split('\n'))}
      />
      <div className="text-xs mt-1.5" style={{ color: 'var(--muted)' }}>
        {lines.length} lines · edit to adjust sync timing
      </div>
    </div>
  )
}
