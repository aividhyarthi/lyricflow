import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { songName, artist, genre, mood, language, platform } = await req.json()

    const prompt = `Write a social media caption in ${language} for the song "${songName}" by ${artist || 'Unknown'}. Genre: ${genre}. Mood: ${mood}. Platform: ${platform}.
Format: emoji opening line, 2 sentence description, 10-12 relevant hashtags (native language + English).
Return caption text only.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    })

    const caption = message.content.map((c) => (c.type === 'text' ? c.text : '')).join('')
    return NextResponse.json({ caption })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
