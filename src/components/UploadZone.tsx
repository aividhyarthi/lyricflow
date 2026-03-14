'use client'

import { useRef, useState, useCallback } from 'react'

type Props = {
  onFileSelect: (file: File) => void
  currentFile: File | null
}

export default function UploadZone({ onFileSelect, currentFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f && (f.type.startsWith('audio/') || f.type.startsWith('video/'))) {
      onFileSelect(f)
    }
  }, [onFileSelect])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) onFileSelect(f)
  }

  const loaded = !!currentFile

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`relative cursor-pointer rounded-2xl p-8 text-center transition-all select-none ${dragging ? 'drag-over' : ''}`}
      style={{
        border: `1.5px ${loaded ? 'solid' : 'dashed'} ${loaded ? 'var(--accent)' : 'var(--border2)'}`,
        background: loaded ? 'rgba(185,110,245,0.07)' : dragging ? 'rgba(185,110,245,0.05)' : 'var(--surface)',
      }}>
      <input ref={inputRef} type="file" accept="audio/*,video/*" className="hidden" onChange={handleChange} />

      {loaded ? (
        <>
          {/* Waveform icon */}
          <div className="flex items-end justify-center gap-1 h-10 mb-4">
            {[6,10,14,10,16,8,12,16,10,14,8,12].map((h, i) => (
              <div key={i} className="wave-bar rounded-sm w-1.5"
                style={{ height: h, background: 'var(--accent)', transformOrigin: 'bottom' }} />
            ))}
          </div>
          <div className="text-sm font-semibold mb-1" style={{ color: 'var(--accent2)' }}>
            {currentFile!.name}
          </div>
          <div className="text-xs" style={{ color: 'var(--muted)' }}>
            {(currentFile!.size / 1024 / 1024).toFixed(1)} MB · click to change
          </div>
        </>
      ) : (
        <>
          <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'rgba(185,110,245,0.12)', border: '1px solid rgba(185,110,245,0.3)' }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 3v12M7 7l4-4 4 4" stroke="#b96ef5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 17h16" stroke="#b96ef5" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="text-base font-semibold mb-1" style={{ color: 'var(--text)' }}>
            {dragging ? 'Drop it here' : 'Drop your song here'}
          </div>
          <div className="text-sm" style={{ color: 'var(--muted)' }}>
            or click to browse · MP3, MP4, WAV, M4A
          </div>
        </>
      )}
    </div>
  )
}
