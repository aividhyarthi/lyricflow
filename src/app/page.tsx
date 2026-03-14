'use client'

import { useState, useRef, useCallback } from 'react'
import UploadZone from '@/components/UploadZone'
import SongCard from '@/components/SongCard'
import PlatformTabs from '@/components/PlatformTabs'
import CaptionBox from '@/components/CaptionBox'
import LyricsEditor from '@/components/LyricsEditor'
import ThumbnailCanvas from '@/components/ThumbnailCanvas'

export type SongInfo = {
  songName: string
  language: string
  languageCode: string
  genre: string
  mood: string
  artist: string
  lyrics: string[]
  caption: string
  platforms: Record<string, string>
}

export type Platform = 'reels' | 'shorts' | 'post' | 'twitter'

const PLATFORM_LABELS: Record<Platform, string> = {
  reels: 'Instagram Reels',
  shorts: 'YouTube Shorts',
  post: 'Instagram Post',
  twitter: 'Twitter / X',
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [profilePhoto, setProfilePhoto] = useState<string>('')
  const [handle, setHandle] = useState('@yourpage')
  const [captionLang, setCaptionLang] = useState('auto')
  const [platform, setPlatform] = useState<Platform>('reels')
  const [thumbStyle, setThumbStyle] = useState('gradient')
  const [songInfo, setSongInfo] = useState<SongInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'upload' | 'result'>('upload')
  const audioRef = useRef<HTMLAudioElement>(null)

  const handleFileSelect = useCallback((f: File) => {
    setFile(f)
    setError('')
    setSongInfo(null)
    setStep('upload')
    if (audioRef.current) {
      audioRef.current.src = URL.createObjectURL(f)
      audioRef.current.load()
    }
  }, [])

  const handleGenerate = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, captionLanguage: captionLang }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to analyse')
      setSongInfo(json.data)
      setStep('result')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleRegenCaption = async () => {
    if (!songInfo) return
    try {
      const res = await fetch('/api/caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songName: songInfo.songName,
          artist: songInfo.artist,
          genre: songInfo.genre,
          mood: songInfo.mood,
          language: songInfo.language,
          platform,
        }),
      })
      const json = await res.json()
      if (json.caption) {
        setSongInfo((prev) => prev ? { ...prev, caption: json.caption } : prev)
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>

      {/* Header */}
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
        className="px-6 py-4 flex items-center gap-4 sticky top-0 z-50">
        <div className="font-display text-xl font-black grad-text">LyricFlow</div>
        <span className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: 'var(--s2)', border: '1px solid var(--border2)', color: 'var(--muted)' }}>
          Content Studio
        </span>
        <div className="ml-auto flex items-center gap-3">
          {step === 'result' && (
            <button
              onClick={() => { setStep('upload'); setSongInfo(null); setFile(null); }}
              className="text-sm px-4 py-1.5 rounded-lg transition-all"
              style={{ border: '1px solid var(--border2)', color: 'var(--muted)' }}>
              ← New song
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {step === 'upload' ? (
          /* ── UPLOAD STEP ── */
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
            <div className="w-full max-w-xl">
              {/* Hero text */}
              <div className="text-center mb-10">
                <h1 className="font-display text-4xl font-black mb-3 leading-tight"
                  style={{ color: 'var(--text)' }}>
                  Upload a song.<br />
                  <span className="grad-text">Get content for every platform.</span>
                </h1>
                <p className="text-base" style={{ color: 'var(--muted)' }}>
                  Thumbnail · Synced lyrics · Captions · Hashtags — in your song's language
                </p>
              </div>

              {/* Upload zone */}
              <UploadZone onFileSelect={handleFileSelect} currentFile={file} />

              {/* Profile + handle */}
              {file && (
                <div className="mt-5 p-4 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="text-xs font-semibold mb-3 uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
                    Your profile
                  </div>
                  <div className="flex gap-3 items-center">
                    {/* Photo picker */}
                    <label className="relative cursor-pointer flex-shrink-0">
                      <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center transition-all"
                        style={{ background: 'var(--s3)', border: '2px dashed var(--border2)' }}>
                        {profilePhoto
                          ? <img src={profilePhoto} alt="profile" className="w-full h-full object-cover" />
                          : <span className="text-2xl" style={{ color: 'var(--muted)' }}>＋</span>
                        }
                      </div>
                      <input type="file" accept="image/*" className="hidden"
                        onChange={e => {
                          const f = e.target.files?.[0]
                          if (f) setProfilePhoto(URL.createObjectURL(f))
                        }} />
                    </label>
                    <div className="flex-1 flex flex-col gap-2">
                      <input
                        className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-all"
                        style={{ background: 'var(--s2)', border: '1px solid var(--border2)', color: 'var(--text)' }}
                        placeholder="@yourpage"
                        value={handle}
                        onChange={e => setHandle(e.target.value)}
                      />
                      <select
                        className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                        style={{ background: 'var(--s2)', border: '1px solid var(--border2)', color: 'var(--text)' }}
                        value={captionLang}
                        onChange={e => setCaptionLang(e.target.value)}
                      >
                        <option value="auto">Caption language: Auto-detect</option>
                        <option value="te">Telugu — తెలుగు</option>
                        <option value="hi">Hindi — हिंदी</option>
                        <option value="ta">Tamil — தமிழ்</option>
                        <option value="kn">Kannada — ಕನ್ನಡ</option>
                        <option value="ml">Malayalam — മലയാളം</option>
                        <option value="mr">Marathi — मराठी</option>
                        <option value="en">English</option>
                        <option value="ar">Arabic — العربية</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mt-4 p-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                  ❌ {error}
                </div>
              )}

              {/* Generate button */}
              {file && (
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="btn-shine relative overflow-hidden w-full mt-5 py-4 rounded-2xl font-semibold text-base text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 55%, #ec4899 100%)', border: 'none' }}>
                  <div className="shine" />
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" />
                      </svg>
                      Analysing with Claude…
                    </span>
                  ) : '✨ Generate Content'}
                </button>
              )}

              {/* How it works */}
              {!file && (
                <div className="mt-10 grid grid-cols-3 gap-3">
                  {[
                    { icon: '🎵', title: 'Upload song', desc: 'MP3 or MP4, any language' },
                    { icon: '🤖', title: 'Claude analyses', desc: 'Detects language, genre, mood' },
                    { icon: '🚀', title: 'Get content', desc: 'Thumbnail, lyrics, captions' },
                  ].map(item => (
                    <div key={item.title} className="p-4 rounded-xl text-center"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <div className="text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>{item.title}</div>
                      <div className="text-xs" style={{ color: 'var(--muted)' }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ── RESULT STEP ── */
          <div className="flex-1 grid" style={{ gridTemplateColumns: '320px 1fr 300px', height: 'calc(100vh - 61px)', overflow: 'hidden' }}>

            {/* Left: Info + controls */}
            <div className="overflow-y-auto p-5 flex flex-col gap-4" style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>
              <SongCard info={songInfo!} />

              <PlatformTabs
                platform={platform}
                onPlatform={setPlatform}
                thumbStyle={thumbStyle}
                onStyle={setThumbStyle}
              />

              {/* Profile recap */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>Profile</div>
                <div className="flex gap-2 items-center">
                  <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0"
                    style={{ background: 'var(--s3)', border: '1px solid var(--border2)' }}>
                    {profilePhoto
                      ? <img src={profilePhoto} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-sm" style={{ color: 'var(--muted)' }}>♪</div>
                    }
                  </div>
                  <span className="text-sm font-medium">{handle}</span>
                </div>
              </div>

              {/* Re-generate */}
              <button
                onClick={() => { setStep('upload'); setSongInfo(null); setFile(null); }}
                className="w-full py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ border: '1px solid var(--border2)', background: 'transparent', color: 'var(--muted)' }}>
                ← Upload a different song
              </button>
            </div>

            {/* Center: Preview */}
            <div className="flex flex-col overflow-hidden" style={{ background: '#0b0b12' }}>
              <div className="px-5 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Preview</span>
                <span className="text-sm font-medium">{PLATFORM_LABELS[platform]}</span>
                <div className="ml-auto">
                  <button
                    onClick={() => {
                      const canvas = document.getElementById('thumbCanvas') as HTMLCanvasElement
                      if (!canvas) return
                      const a = document.createElement('a')
                      a.download = `${songInfo?.songName || 'thumbnail'}_${platform}.png`
                      a.href = canvas.toDataURL('image/png')
                      a.click()
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg transition-all"
                    style={{ border: '1px solid var(--border2)', color: 'var(--text)', background: 'transparent' }}>
                    ⬇ Download PNG
                  </button>
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
                <ThumbnailCanvas
                  songInfo={songInfo!}
                  platform={platform}
                  thumbStyle={thumbStyle}
                  profilePhoto={profilePhoto}
                  handle={handle}
                  audioRef={audioRef}
                />
              </div>
            </div>

            {/* Right: Caption + Lyrics */}
            <div className="overflow-y-auto p-4 flex flex-col gap-4" style={{ background: 'var(--surface)', borderLeft: '1px solid var(--border)' }}>
              <CaptionBox
                caption={songInfo?.platforms?.[platform] || songInfo?.caption || ''}
                onRegenerate={handleRegenCaption}
                platform={platform}
              />
              <LyricsEditor
                lyrics={songInfo?.lyrics || []}
                audioDuration={audioRef.current?.duration || 180}
                onExportLRC={(lrcContent) => {
                  const a = document.createElement('a')
                  a.href = URL.createObjectURL(new Blob([lrcContent], { type: 'text/plain' }))
                  a.download = `${songInfo?.songName || 'lyrics'}.lrc`
                  a.click()
                }}
              />
            </div>
          </div>
        )}
      </main>

      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  )
}
