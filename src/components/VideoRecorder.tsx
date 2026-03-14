'use client'
import { useRef, useState } from 'react'
type Props = { audioRef: React.RefObject<HTMLAudioElement>; songName: string; platform: string }
export default function VideoRecorder({ audioRef, songName, platform }: Props) {
  const [recording, setRecording] = useState(false)
  const [progress, setProgress] = useState(0)
  const mediaRecRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const progressRef = useRef<NodeJS.Timeout | null>(null)
  async function startRecording() {
    const canvas = document.getElementById('thumbCanvas') as HTMLCanvasElement
    if (!canvas) { alert('Generate content first'); return }
    const canvasStream = canvas.captureStream(30)
    try {
      const audioEl = audioRef.current
      if (audioEl) {
        const audioStream = (audioEl as any).captureStream?.()
        if (audioStream) audioStream.getAudioTracks().forEach((t: MediaStreamTrack) => canvasStream.addTrack(t))
      }
    } catch(e) { console.warn('Audio capture not supported') }
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm'
    const rec = new MediaRecorder(canvasStream, { mimeType })
    mediaRecRef.current = rec; chunksRef.current = []
    rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
    rec.onstop = saveVideo; rec.start(100)
    setRecording(true); setProgress(0)
    if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play().catch(console.warn) }
    const duration = audioRef.current?.duration || 60
    const start = Date.now()
    progressRef.current = setInterval(() => { setProgress(Math.min(100, ((Date.now() - start) / 1000 / duration) * 100)) }, 500)
    audioRef.current?.addEventListener('ended', stopRecording, { once: true })
  }
  function stopRecording() {
    if (mediaRecRef.current?.state === 'recording') mediaRecRef.current.stop()
    if (audioRef.current) audioRef.current.pause()
    if (progressRef.current) clearInterval(progressRef.current)
    setRecording(false); setProgress(100)
  }
  function saveVideo() {
    const blob = new Blob(chunksRef.current, { type: 'video/webm' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${songName || 'lyric-video'}_${platform}.webm`
    a.click(); setProgress(0)
  }
  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs font-semibold uppercase tracking-widest" style={{color:'var(--muted)'}}>Export Video</div>
      {recording && (
        <div>
          <div className="flex justify-between text-xs mb-1" style={{color:'var(--muted)'}}><span>● Recording…</span><span>{Math.round(progress)}%</span></div>
          <div className="h-1 rounded-full overflow-hidden" style={{background:'var(--s2)'}}><div className="h-full rounded-full transition-all" style={{width:`${progress}%`,background:'linear-gradient(90deg,#7c3aed,#ec4899)'}}/></div>
        </div>
      )}
      {!recording ? (
        <button onClick={startRecording} className="w-full py-3 rounded-xl font-semibold text-sm text-white" style={{background:'linear-gradient(135deg,#7c3aed,#ec4899)',border:'none',cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>⏺ Record Lyric Video</button>
      ) : (
        <button onClick={stopRecording} className="w-full py-3 rounded-xl font-semibold text-sm" style={{background:'rgba(239,68,68,0.15)',border:'1px solid #ef4444',color:'#fca5a5',cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>⏹ Stop & Save</button>
      )}
      <div className="text-xs" style={{color:'var(--muted)'}}>Saves as .webm · upload to YouTube/Instagram directly or convert at <a href="https://cloudconvert.com/webm-to-mp4" target="_blank" style={{color:'var(--accent)'}}>CloudConvert</a></div>
    </div>
  )
}
