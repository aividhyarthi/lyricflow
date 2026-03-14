import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { filename, captionLanguage } = body

    if (!filename) {
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
    const clLabel = langLabels[captionLanguage] || "the song's detected language"

    const cleanName = filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')

    const prompt = `You are a music content expert for social media. Analyse this song filename: "${cleanName}"

Based on the filename (which usually contains the song title and possibly the language/artist):
1. songName: Clean properly formatted song name
2. language: Full language name (e.g. Telugu, Hindi, Tamil)
3. languageCode: Two-letter code (te/hi/ta/kn/ml/mr/en/ar)
4. genre: Folk / Classical / Film / Pop / Devotional / Bhajan / Carnatic / etc.
5. mood: devotional / joyful / melancholic / energetic / romantic / spiritual / etc.
6. artist: Artist/singer name if guessable from filename, else empty string
7. lyrics: Array of 8-10 authentic-sounding song lines IN THE SONG'S LANGUAGE using correct native script (Telugu script for Telugu, Devanagari for Hindi, Tamil script for Tamil, etc.)
8. caption: Social media caption in ${clLabel}. Format: emoji opening line, 2 sentence description, then 10-12 hashtags (mix native language + English)
9. platforms: Object with keys "reels", "shorts", "post", "twitter" — each with a tailored caption variation (same language, slightly adjusted tone)

Respond ONLY with valid JSON, no markdown fences:
{
  "songName": "",
  "language": "",
  "languageCode": "",
  "genre": "",
  "mood": "",
  "artist": "",
  "lyrics": [],
  "caption": "",
  "platforms": {
    "reels": "",
    "shorts": "",
    "post": "",
    "twitter": ""
  }
}`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1800,
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
