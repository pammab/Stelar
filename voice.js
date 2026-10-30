// ─────────────────────────────────────────────────────────────────────────────
// Voice · 语音 — speech-to-text (Web Speech API) and spoken replies.
// Speech recognition works in Chrome and Edge (and Safari 14.1+). In Chrome the
// audio is processed by Google's speech service; text-to-speech runs locally.
// ─────────────────────────────────────────────────────────────────────────────
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
export const canListen = !!SR;
export const canSpeak = 'speechSynthesis' in window;

export const VOICE_LANGS = [
  { code: 'en-US', label: 'English' },
  { code: 'zh-CN', label: '中文' },
  { code: 'es-ES', label: 'Español' },
  { code: 'pt-PT', label: 'Português' },
];
export function defaultLang() {
  const l = (navigator.language || 'en').toLowerCase();
  return (VOICE_LANGS.find(v => l.startsWith(v.code.slice(0, 2))) || VOICE_LANGS[0]).code;
}

let current = null;
// Listen once; resolves with the final transcript ('' if nothing was heard).
export function listen(lang, onInterim = () => {}) {
  if (!SR) return Promise.reject(Object.assign(new Error('unsupported'), { code: 'unsupported' }));
  stopListening();
  return new Promise((resolve, reject) => {
    const r = new SR(); current = r;
    r.lang = lang; r.interimResults = true; r.continuous = false; r.maxAlternatives = 1;
    let finalText = '', latest = '';
    r.onresult = e => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t; else interim += t;
      }
      latest = (finalText + interim).trim(); onInterim(latest);
    };
    r.onerror = e => { current = null; if (e.error === 'no-speech' || e.error === 'aborted') resolve(''); else reject(Object.assign(new Error(e.error), { code: e.error })); };
    r.onend = () => { current = null; resolve((finalText || latest).trim()); };
    r.start();
  });
}
export function stopListening() { try { current?.stop(); } catch {} current = null; }
export const isListening = () => !!current;

function pickVoice(lang) {
  const voices = speechSynthesis.getVoices(), base = lang.slice(0, 2).toLowerCase();
  const same = voices.filter(v => v.lang?.toLowerCase().startsWith(base));
  return same.find(v => /natural|google|neural|premium|enhanced/i.test(v.name)) || same.find(v => v.lang === lang) || same[0] || null;
}
export function speak(text, lang, onEnd = () => {}) {
  if (!canSpeak || !text) return onEnd();
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang; const v = pickVoice(lang); if (v) u.voice = v;
  u.rate = 1.02; u.pitch = 1; u.onend = onEnd; u.onerror = onEnd;
  speechSynthesis.speak(u);
}
export function stopSpeaking() { if (canSpeak) speechSynthesis.cancel(); }
if (canSpeak) speechSynthesis.getVoices(); // warm up the voice list
