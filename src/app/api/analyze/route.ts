import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const filename = String(formData.get('filename') || '')
    const captionLanguage = String(formData.get('captionLanguage') || 'auto')
    const file = formData.get('songFile') as File | null

    if (!filename && !file?.name) {
      return NextResponse.json({ error: 'filename is required' }, { status: 400 })
    }

    const langLabels: Record<string, string> = {
      auto: "the song's detected language",
      te: 'Telugu',
      hi: 'Hindi',
      ta: 'Tamil',
      kn: 'Kannada',
      ml: 'Malayalam',
      mr: 'Marathi',
      en: 'English',
      ar: 'Arabic',
    }

    const cleanName = (filename || file?.name || '')
      .replace(/\.[^.]+$/, '')
      .replace(/[-_]/g, ' ')
      .trim()

    const clLabel = langLabels[captionLanguage] || "the song's detected language"

    const prompt = `You are a music content expert for social media. Analyse this song name: "${cleanName}".
Return realistic metadata and social copy in the right language.

Rules:
1) songName: clean, user-facing song title.
2) language + languageCode (te/hi/ta/kn/ml/mr/en/ar).
3) genre + mood + artist (artist may be empty if unknown).
4) lyrics: 10 to 14 lines in the SONG language and script.
5) timedLyrics: array aligned to 45-90s short-video pacing. Each item = {"time": seconds_from_start, "text": lyric_line}.
6) caption: primary caption in ${clLabel}.
7) platforms: tailored caption for reels/shorts/post/twitter in same language.
8) socialPack: for each platform include title, description, hashtags (10-12 tags).

Return ONLY valid JSON:
{
  "songName": "",
  "language": "",
  "languageCode": "",
  "genre": "",
  "mood": "",
  "artist": "",
  "lyrics": [],
  "timedLyrics": [{ "time": 0, "text": "" }],
  "caption": "",
  "platforms": {
    "reels": "",
    "shorts": "",
    "post": "",
    "twitter": ""
  },
  "socialPack": {
    "reels": { "title": "", "description": "", "hashtags": [] },
    "shorts": { "title": "", "description": "", "hashtags": [] },
    "post": { "title": "", "description": "", "hashtags": [] },
    "twitter": { "title": "", "description": "", "hashtags": [] }
  }
}`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2200,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = message.content.map((c) => (c.type === 'text' ? c.text : '')).join('')
    const info = JSON.parse(raw.replace(/```json|```/g, '').trim())

    return NextResponse.json({ success: true, data: info })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Analyze error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
