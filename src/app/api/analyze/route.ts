import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { filename, captionLanguage } = body
    if (!filename) return NextResponse.json({ error: 'filename is required' }, { status: 400 })

    const langLabels: Record<string, string> = {
      auto: "the song's detected language", te: 'Telugu', hi: 'Hindi', ta: 'Tamil',
      kn: 'Kannada', ml: 'Malayalam', mr: 'Marathi', en: 'English', ar: 'Arabic',
    }
    const clLabel = langLabels[captionLanguage] || "the song's detected language"
    const cleanName = filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1800,
      messages: [{ role: 'user', content: `Analyse song filename: "${cleanName}". Return ONLY valid JSON (no markdown). Use ROMANIZED TRANSLITERATION for lyrics (not native script) to avoid JSON encoding issues:
{"songName":"","language":"","languageCode":"","genre":"","mood":"","artist":"","lyrics":["","","","","","","",""],"caption":"","platforms":{"reels":"","shorts":"","post":"","twitter":""},"imageSubject":"","imageSearchQuery":""}
- caption: in ${clLabel} with emoji, 2 sentences, 10 hashtags
- imageSubject: deity or subject in English (e.g. Lord Shiva)
- lyrics: 8 lines romanized (e.g. Om Namah Shivaya not ఓం నమః శివాయ)` }],
    })

    const raw = message.content.map((c) => (c.type === 'text' ? c.text : '')).join('')

    const parseJSON = (text: string) => {
      try { const m = text.replace(/```json|```/g, '').trim().match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]) } catch {}
      try {
        const m = text.replace(/```json|```/g, '').trim().match(/\{[\s\S]*\}/)
        if (m) return JSON.parse(m[0].replace(/,\s*}/g, '}').replace(/,\s*]/g, ']').replace(/[\u0000-\u001F]/g, ' '))
      } catch {}
      return null
    }

    let info = parseJSON(raw)
    if (!info) {
      const retry = await client.messages.create({
        model: 'claude-sonnet-4-20250514', max_tokens: 800,
        messages: [{ role: 'user', content: `Song: "${cleanName}". Return ONLY this JSON, all values in plain English/romanized text:
{"songName":"${cleanName}","language":"Telugu","languageCode":"te","genre":"Devotional","mood":"spiritual","artist":"","lyrics":["line 1","line 2","line 3","line 4","line 5","line 6","line 7","line 8"],"caption":"caption here","platforms":{"reels":"","shorts":"","post":"","twitter":""},"imageSubject":"","imageSearchQuery":""}` }],
      })
      const r2 = retry.content.map((c) => (c.type === 'text' ? c.text : '')).join('')
      info = parseJSON(r2)
      if (!info) throw new Error('Could not parse response')
    }

    return NextResponse.json({ success: true, data: info })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
