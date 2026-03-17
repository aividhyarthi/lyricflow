import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

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

const languageCodeMap: Record<string, string> = {
  telugu: 'te',
  hindi: 'hi',
  tamil: 'ta',
  kannada: 'kn',
  malayalam: 'ml',
  marathi: 'mr',
  english: 'en',
  arabic: 'ar',
}

type AnalyzeResult = {
  songName: string
  language: string
  languageCode: string
  genre: string
  mood: string
  artist: string
  lyrics: string[]
  timedLyrics: Array<{ time: number; text: string }>
  caption: string
  platforms: Record<'reels' | 'shorts' | 'post' | 'twitter', string>
  socialPack: Record<'reels' | 'shorts' | 'post' | 'twitter', { title: string; description: string; hashtags: string[] }>
}

function inferLanguageFromName(name: string, requestedCode: string) {
  if (requestedCode !== 'auto' && langLabels[requestedCode]) {
    return { language: langLabels[requestedCode], code: requestedCode }
  }

  const lowered = name.toLowerCase()
  for (const [language, code] of Object.entries(languageCodeMap)) {
    if (lowered.includes(language)) {
      return { language: language[0].toUpperCase() + language.slice(1), code }
    }
  }

  return { language: 'English', code: 'en' }
}

function mockLyrics(languageCode: string) {
  const bank: Record<string, string[]> = {
    en: [
      'When the beat drops, the city starts to glow',
      'Every heartbeat writes a story in the night',
      'Hold this moment, do not let it go',
      'We are fire under purple skies',
      'Sing it louder, let the whole world know',
      'One rhythm, one heart, one light',
      'Dreams are dancing in the neon flow',
      'This is our song till sunrise',
    ],
    hi: ['ये धुन दिल में गूंजे हर पल', 'तेरे साथ हर लम्हा खास लगे', 'रात भी अब रोशन सी लगे', 'ये सफर अब अपना सा लगे'],
    te: ['ఈ రాగం హృదయంలో మోగుతోంది', 'నీతో ఉన్న ప్రతి క్షణం ప్రత్యేకం', 'ఈ రాత్రి వెలుగులా మారింది', 'మన ప్రయాణం గీతంగా మారింది'],
    ta: ['இந்த தாளம் நெஞ்சில் ஓசை தரும்', 'உன் சிரிப்பு என் இரவைக் குளிர்க்கும்', 'இந்த நொடிகள் பாடலாகும்', 'நம் காதல் ராகமாகும்'],
  }

  const base = bank[languageCode] || bank.en
  const lyrics = [...base]
  while (lyrics.length < 10) lyrics.push(base[lyrics.length % base.length])
  return lyrics.slice(0, 10)
}

function createFallback(cleanName: string, captionLanguage: string): AnalyzeResult {
  const { language, code } = inferLanguageFromName(cleanName, captionLanguage)
  const lyrics = mockLyrics(code)
  const timedLyrics = lyrics.map((line, idx) => ({ time: idx * 6, text: line }))
  const hashtags = ['#music', '#lyrics', '#shorts', '#reels', '#viral', '#song', '#nowplaying', '#trending', '#lyricflow', '#fyp']

  const social = (platformLabel: string) => ({
    title: `${cleanName || 'My Song'} | ${platformLabel}`,
    description: `${language} lyrical preview for ${cleanName || 'this track'}. Ready-to-post format for ${platformLabel}.`,
    hashtags,
  })

  const caption = `🎵 ${cleanName || 'New song vibes'}\n${language} mood cut with synced lyric moments.\n${hashtags.join(' ')}`

  return {
    songName: cleanName || 'Untitled Song',
    language,
    languageCode: code,
    genre: 'Pop',
    mood: 'Energetic',
    artist: '',
    lyrics,
    timedLyrics,
    caption,
    platforms: {
      reels: caption,
      shorts: `${caption}\n#YouTubeShorts`,
      post: `${caption}\n#InstagramPost`,
      twitter: `${caption}\n#XMusic`,
    },
    socialPack: {
      reels: social('Instagram Reels'),
      shorts: social('YouTube Shorts'),
      post: social('Instagram Post'),
      twitter: social('Twitter/X'),
    },
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const filename = String(formData.get('filename') || '')
    const captionLanguage = String(formData.get('captionLanguage') || 'auto')
    const file = formData.get('songFile') as File | null

    if (!filename && !file?.name) {
      return NextResponse.json({ error: 'filename is required' }, { status: 400 })
    }

    const cleanName = (filename || file?.name || '')
      .replace(/\.[^.]+$/, '')
      .replace(/[-_]/g, ' ')
      .trim()

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ success: true, data: createFallback(cleanName, captionLanguage), mode: 'fallback' })
    }

    const client = new Anthropic({ apiKey })
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

Return ONLY valid JSON with these keys:
songName, language, languageCode, genre, mood, artist, lyrics, timedLyrics, caption, platforms, socialPack`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2200,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = message.content.map((c) => (c.type === 'text' ? c.text : '')).join('')
    const info = JSON.parse(raw.replace(/```json|```/g, '').trim())

    return NextResponse.json({ success: true, data: info, mode: 'ai' })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Analyze error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
