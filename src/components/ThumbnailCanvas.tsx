'use client'

import { useEffect, useRef, RefObject } from 'react'
import { SongInfo, Platform } from '@/app/page'

const PLATS: Record<Platform, { w: number; h: number }> = {
  reels:   { w: 1080, h: 1920 },
  shorts:  { w: 1080, h: 1920 },
  post:    { w: 1080, h: 1080 },
  twitter: { w: 1280, h: 720 },
}

const GRADS: Record<string, string[]> = {
  gradient:  ['#1a0a2e','#2d1b5c','#6b2d6b','#c4724a'],
  dark:      ['#050508','#0e0e1c','#181830','#1e1e40'],
  devotional:['#1a0800','#3d1200','#8b3000','#c87000'],
  minimal:   ['#0c0c10','#151520','#1e1e2c','#252535'],
  neon:      ['#000814','#001233','#023e8a','#0077b6'],
}

type Props = {
  songInfo: SongInfo
  platform: Platform
  thumbStyle: string
  profilePhoto: string
  handle: string
  audioRef: RefObject<HTMLAudioElement>
  currentTime: number
}

export default function ThumbnailCanvas({ songInfo, platform, thumbStyle, profilePhoto, handle, audioRef, currentTime }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    draw()
  }, [songInfo, platform, thumbStyle, profilePhoto, handle])

  async function draw() {
    const canvas = canvasRef.current
    if (!canvas) return
    const pl = PLATS[platform]
    canvas.width = pl.w
    canvas.height = pl.h
    const ctx = canvas.getContext('2d')!
    const W = pl.w, H = pl.h

    // Background gradient
    const cols = GRADS[thumbStyle] || GRADS.gradient
    const g = ctx.createLinearGradient(0, 0, W * 0.7, H)
    g.addColorStop(0, cols[0]); g.addColorStop(0.35, cols[1])
    g.addColorStop(0.7, cols[2]); g.addColorStop(1, cols[3])
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)

    // Ambient blobs
    for (let i = 0; i < 7; i++) {
      const x = (i * 137) % W, y = (i * 89 + 50) % H, r = 120 + (i * 40) % 200
      const rg = ctx.createRadialGradient(x, y, 0, x, y, r)
      rg.addColorStop(0, 'rgba(255,200,120,0.05)')
      rg.addColorStop(1, 'rgba(255,200,120,0)')
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
    }

    // Decorative rings
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1
    for (let r = 80; r < 500; r += 80) {
      ctx.beginPath(); ctx.arc(W * 0.85, H * 0.2, r, 0, Math.PI * 2); ctx.stroke()
    }

    // Profile photo circle
    const cx = W / 2, cy = H * 0.23, rp = W * 0.14
    if (profilePhoto) {
      await new Promise<void>(resolve => {
        const img = new Image()
        img.onload = () => {
          ctx.save()
          ctx.beginPath(); ctx.arc(cx, cy, rp, 0, Math.PI * 2); ctx.clip()
          ctx.drawImage(img, cx - rp, cy - rp, rp * 2, rp * 2)
          ctx.restore()
          // Glow ring
          ctx.beginPath(); ctx.arc(cx, cy, rp + 5, 0, Math.PI * 2)
          ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 3; ctx.stroke()
          resolve()
        }
        img.onerror = () => { drawPlaceholder(ctx, cx, cy, rp); resolve() }
        img.src = profilePhoto
      })
    } else {
      drawPlaceholder(ctx, cx, cy, rp)
    }

    // Handle text below photo
    ctx.font = `500 ${Math.round(H * 0.02)}px DM Sans, sans-serif`
    ctx.fillStyle = 'rgba(255,255,255,0.65)'
    ctx.textAlign = 'center'
    ctx.fillText(handle || '@yourpage', cx, cy + rp + Math.round(H * 0.028))

    // Bottom text scrim
    const tg = ctx.createLinearGradient(0, H * 0.5, 0, H)
    tg.addColorStop(0, 'rgba(0,0,0,0)'); tg.addColorStop(1, 'rgba(0,0,0,0.92)')
    ctx.fillStyle = tg; ctx.fillRect(0, H * 0.5, W, H * 0.5)

    // Song name
    ctx.fillStyle = '#fff'
    ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 20
    ctx.font = `bold ${Math.round(H * 0.042)}px Playfair Display, Georgia, serif`
    wrapTextCenter(ctx, songInfo.songName || '', cx, H * 0.73, W * 0.82, Math.round(H * 0.052))
    ctx.shadowBlur = 0

    // Artist
    const artistName = songInfo.artist && songInfo.artist !== 'Unknown Artist' ? songInfo.artist : ''
    if (artistName) {
      ctx.font = `400 ${Math.round(H * 0.022)}px DM Sans, sans-serif`
      ctx.fillStyle = 'rgba(255,255,255,0.58)'
      ctx.fillText(artistName, cx, H * 0.81)
    }

    // Language badge
    if (songInfo.language) {
      ctx.font = `600 ${Math.round(H * 0.018)}px DM Sans, sans-serif`
      const bw = ctx.measureText(songInfo.language).width + 30
      const bx = cx - bw / 2, by = H * 0.845
      drawRoundRect(ctx, bx, by, bw, Math.round(H * 0.028), 20)
      ctx.fillStyle = 'rgba(185,110,245,0.88)'; ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.fillText(songInfo.language, cx, by + Math.round(H * 0.02))
    }

    // Genre badge
    if (songInfo.genre) {
      ctx.font = `500 ${Math.round(H * 0.016)}px DM Sans, sans-serif`
      const bw2 = ctx.measureText(songInfo.genre).width + 24
      const bx2 = cx - bw2 / 2, by2 = H * 0.885
      drawRoundRect(ctx, bx2, by2, bw2, Math.round(H * 0.025), 20)
      ctx.fillStyle = 'rgba(246,192,38,0.2)'; ctx.fill()
      ctx.fillStyle = '#f6c026'
      ctx.fillText(songInfo.genre, cx, by2 + Math.round(H * 0.018))
    }

    ctx.textAlign = 'left'
  }

  function drawPlaceholder(ctx: CanvasRenderingContext2D, cx: number, cy: number, rp: number) {
    ctx.beginPath(); ctx.arc(cx, cy, rp, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 2; ctx.stroke()
    ctx.font = `bold ${Math.round(rp * 0.65)}px serif`
    ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.textAlign = 'center'
    ctx.fillText('♪', cx, cy + Math.round(rp * 0.25))
  }

  function wrapTextCenter(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number, maxW: number, lh: number) {
    const words = text.split(' '); let line = ''
    for (const w of words) {
      const t = line + (line ? ' ' : '') + w
      if (ctx.measureText(t).width > maxW && line) {
        ctx.fillText(line, cx, y); line = w; y += lh
      } else line = t
    }
    if (line) ctx.fillText(line, cx, y)
  }

  function drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }

  // Compute display size
  const pl = PLATS[platform]
  const aspect = pl.w / pl.h

  return (
    <div ref={wrapRef} className="flex flex-col items-center gap-2 w-full h-full">
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="relative" style={{
          borderRadius: 14,
          overflow: 'hidden',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.1), 0 24px 60px rgba(0,0,0,0.8)',
          aspectRatio: `${pl.w}/${pl.h}`,
          maxHeight: '100%',
          maxWidth: aspect > 1 ? '100%' : undefined,
          height: aspect <= 1 ? '100%' : undefined,
        }}>
          <canvas
            id="thumbCanvas"
            ref={canvasRef}
            style={{ display: 'block', width: '100%', height: '100%' }}
          />

          {/* Lyric overlay */}
          <div className="absolute inset-0 flex flex-col justify-end pointer-events-none" style={{ borderRadius: 14 }}>
            <div className="p-3" style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)'
            }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
                  style={{ border: '1.5px solid rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.1)' }}>
                  {profilePhoto
                    ? <img src={profilePhoto} alt="" className="w-full h-full object-cover" />
                    : <span className="text-xs text-white">♪</span>
                  }
                </div>
                <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>{handle}</span>
              </div>
              <div className="font-display font-bold text-white text-sm mb-2 leading-tight"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                {songInfo.songName}
              </div>
              <div className="space-y-0.5 mb-2">
                {(() => {
                  const timed = songInfo.timedLyrics || []
                  const activeTimedIndex = timed.length > 0
                    ? Math.max(0, timed.findIndex((line, idx) => currentTime >= line.time && (timed[idx + 1] ? currentTime < timed[idx + 1].time : true)))
                    : -1
                  const activeIndex = activeTimedIndex >= 0 ? activeTimedIndex : Math.floor((currentTime / Math.max(audioRef.current?.duration || 180, 1)) * Math.max(songInfo.lyrics.length, 1))
                  const start = Math.max(activeIndex - 1, 0)
                  const rows = (timed.length > 0 ? timed.map((line) => line.text) : songInfo.lyrics).slice(start, start + 3)
                  return rows.map((line, i) => {
                    const isActive = i === Math.min(1, rows.length - 1)
                    return (
                      <div key={`${line}-${i}`} className={`text-xs leading-relaxed transition-all ${isActive ? 'text-white font-semibold lyric-active' : ''}`}
                        style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.45)', textShadow: isActive ? '0 0 12px rgba(246,192,38,0.5)' : undefined }}>
                        {line}
                      </div>
                    )
                  })
                })()}
              </div>
              {/* Mini progress */}
              <div className="h-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <div className="h-full rounded-full" style={{ background: '#fff', width: `${Math.min(100, ((currentTime || 0) / Math.max(audioRef.current?.duration || 180, 1)) * 100)}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
