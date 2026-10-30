// Ask Stelar AI endpoint (Vercel) + shared chat logic, also used by server.mjs locally.
// The Anthropic API key is read from the environment on the server. It never reaches the browser.

const LANGS = { en: 'English', zh: 'Chinese (Simplified)', es: 'Spanish', pt: 'Portuguese' };
const BODIES = ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'solar'];
const NAMES = {
  sun: 'the Sun', mercury: 'Mercury', venus: 'Venus', earth: 'Earth', mars: 'Mars',
  jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune', solar: 'the Solar System'
};

const MAX_TURNS = 8;          // only the last 8 messages are sent to the AI
const MAX_CHARS = 500;        // longest question accepted
const MAX_FACTS = 2000;       // longest "facts on screen" text accepted
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 10;          // questions per minute per visitor (best effort)

const hits = new Map();
export function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > RATE_MAX;
}

const clean = (s, max) => String(s ?? '').replace(/[\u0000-\u0008\u000b-\u001f]/g, ' ').trim().slice(0, max);

function systemPrompt(planet, language, facts, voice) {
  return [
    'You are Stelar, the friendly space guide inside an interactive 3D model of the Solar System, built by students for a hackathon.',
    'In this app the Sun and planets are shown at their true relative sizes, while distances between them are compressed.',
    `The visitor is currently looking at: ${NAMES[planet]}.`,
    facts ? `These facts are shown on screen; keep your numbers consistent with them:\n${facts}` : '',
    'Answer questions about this body, the rest of the Solar System, space and astronomy.',
    'If a question is unrelated to space, politely steer back to space in one sentence.',
    language ? `Always reply in ${language}.` : 'Reply in the same language the visitor used in their latest message.',
    voice ? 'The visitor is talking to you by voice and will hear your answer read aloud: write natural spoken sentences, spell out symbols and units (say "degrees Celsius", not "°C"), and avoid emojis.' : '',
    'Keep answers to 2-4 short sentences in plain text (no markdown, no lists), friendly for a general audience.',
    'If you are not sure about a fact, say so instead of guessing.'
  ].filter(Boolean).join('\n');
}

// Returns { status, json } so each server can send it however it likes.
export async function chat(body) {
  const key = process.env.ANTHROPIC_API_KEY;
  const model = process.env.CLAUDE_MODEL || 'claude-haiku-5-5';
  if (!key) return { status: 500, json: { error: 'config' } };

  const planet = BODIES.includes(body?.planet) ? body.planet : 'solar';
  const language = LANGS[String(body?.lang || '').slice(0, 2).toLowerCase()] || null; // null = same language as the visitor
  const voice = body?.voice === true;
  const facts = clean(body?.facts, MAX_FACTS);

  let messages = Array.isArray(body?.messages) ? body.messages : [];
  messages = messages
    .filter(m => (m?.role === 'user' || m?.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-MAX_TURNS)
    .map(m => ({ role: m.role, content: clean(m.content, MAX_CHARS) }));
  while (messages.length && messages[0].role !== 'user') messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== 'user') return { status: 400, json: { error: 'bad' } };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: controller.signal,
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model, max_tokens: 350, system: systemPrompt(planet, language, facts, voice), messages })
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      console.error('Anthropic API error', r.status, data?.error?.type, data?.error?.message);
      const code = r.status === 429 ? 'rate' : (r.status === 401 || r.status === 403) ? 'config' : 'busy';
      return { status: r.status === 429 ? 429 : 502, json: { error: code } };
    }
    const reply = (data.content || []).filter(c => c.type === 'text').map(c => c.text).join('\n').trim();
    return { status: 200, json: { reply: reply || '…' } };
  } catch (e) {
    console.error('Chat request failed:', e?.name, e?.message);
    return { status: 502, json: { error: 'busy' } };
  } finally {
    clearTimeout(timer);
  }
}

// ───────── Vercel serverless function: POST /api/chat ─────────
// Set ANTHROPIC_API_KEY in Vercel → Project → Settings → Environment Variables.
export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'bad' }); return; }
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'anon';
  if (rateLimited(ip)) { res.status(429).json({ error: 'rate' }); return; }
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const r = await chat(body || {});
  res.status(r.status).json(r.json);
}
