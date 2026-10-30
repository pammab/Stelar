// ─────────────────────────────────────────────────────────────────────────────
// "Ask Stelar" — AI space guide with voice · AI 太空向导（支持语音）
// The browser only talks to /api/chat on our own server; the API key stays on
// the server (.env locally, environment variable on Vercel).
// Simple navigation ("go to Mars", "去火星", "line up the planets") is handled
// right here without calling the AI.
// ─────────────────────────────────────────────────────────────────────────────
import { byId, NAMES, factsText } from './data.js';
import { canListen, canSpeak, listen, stopListening, isListening, speak, stopSpeaking, VOICE_LANGS, defaultLang } from './voice.js';

const $ = s => document.querySelector(s);
const LOCAL = { // planet names for confirmations · 确认语中的名称
  es: { sun: 'el Sol', mercury: 'Mercurio', venus: 'Venus', earth: 'la Tierra', mars: 'Marte', jupiter: 'Júpiter', saturn: 'Saturno', uranus: 'Urano', neptune: 'Neptuno' },
  pt: { sun: 'o Sol', mercury: 'Mercúrio', venus: 'Vénus', earth: 'a Terra', mars: 'Marte', jupiter: 'Júpiter', saturn: 'Saturno', uranus: 'Úrano', neptune: 'Neptuno' },
};
const SAY = {
  en: { go: n => `Flying to ${n}.`, home: 'Back to the whole Solar System.', lineup: 'Here are the planets side by side, at their true sizes.', pause: 'Orbits paused.', resume: 'Orbits running again.' },
  zh: { go: n => `正在前往${n}。`, home: '返回太阳系总览。', lineup: '这是按真实比例并排的行星。', pause: '公转已暂停。', resume: '公转已恢复。' },
  es: { go: n => `Volando hacia ${n}.`, home: 'De vuelta al Sistema Solar completo.', lineup: 'Aquí están los planetas lado a lado, a su tamaño real.', pause: 'Órbitas en pausa.', resume: 'Órbitas en marcha.' },
  pt: { go: n => `A voar para ${n}.`, home: 'De volta ao Sistema Solar inteiro.', lineup: 'Aqui estão os planetas lado a lado, no tamanho real.', pause: 'Órbitas em pausa.', resume: 'Órbitas a andar outra vez.' },
};
const ERR = {
  rate: ['Too many questions at once. Wait a few seconds and try again.', '提问太频繁，请稍等几秒再试。'],
  config: ['The AI guide is not set up yet: the server has no API key.', 'AI 向导尚未配置：服务器缺少 API 密钥。'],
  offline: ['The AI guide needs the Stelar server. Run "npm start", or open the online version.', 'AI 向导需要 Stelar 服务器：请运行 "npm start" 或打开在线版本。'],
  busy: ['The AI is busy right now. Please try again.', 'AI 暂时繁忙，请重试。'],
  bad: ['Something went wrong with that message. Please try again.', '消息出错，请重试。'],
  'not-allowed': ['Microphone access is blocked. Allow it in the address bar, then try again.', '麦克风权限被拒绝，请在地址栏允许后重试。'],
  unsupported: ['Voice input needs Chrome or Edge. You can still type.', '语音输入需要 Chrome 或 Edge 浏览器，仍可打字提问。'],
  network: ['The speech service could not be reached. Check the connection.', '无法连接语音服务，请检查网络。'],
  'audio-capture': ['No microphone was found.', '未找到麦克风。'],
};

const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const CJK = /[㐀-鿿]/;
export function findBody(text) {
  const t = text.toLowerCase();
  for (const [id, names] of Object.entries(NAMES)) for (const n of names) {
    if (CJK.test(n) ? t.includes(n) : new RegExp(`(^|[^a-zà-ÿ])${esc(n)}([^a-zà-ÿ]|$)`, 'i').test(t)) return id;
  }
  return null;
}
const NAV = /(go to|show( me)?|open|take me to|fly to|zoom (in )?(on|to)|visit|select|let'?s see|去|打开|看看|显示|飞到|前往|ir a|ve a|ve al|vamos a|muestra|muéstrame|enséñame|mostrar|llévame|vai para|vamos para|mostra|leva-me|abre|abrir)/i;
const HOME = /^(back|go back|overview|home|(the |show (me )?the )?(whole )?solar system|总览|返回|太阳系|太阳系总览|vista general|volver|el sistema solar|sistema solar|visão geral|voltar|o sistema solar)[\s.!。！]*$/i;
const LINEUP = /(line ?up|compare (the )?(planet )?sizes|size comparison|side by side|对比大小|大小对比|比较大小|并排|comparar (los |os )?tamaños|comparar (os )?tamanhos|lado a lado|alinea( los planetas)?)/i;
const PAUSE = /^(pause|stop (the )?orbits|暂停|pausa|pausar)/i, RESUME = /^(resume|play|continue|继续|reanudar|continuar|retomar)/i;
// Returns an action name, or null if this should go to the AI.
export function parseCommand(text) {
  const t = text.trim(); if (!t || t.length > 60) return null;
  if (LINEUP.test(t)) return { type: 'lineup' };
  const body = findBody(t);
  if (!body && HOME.test(t)) return { type: 'home' };
  if (PAUSE.test(t)) return { type: 'pause' };
  if (RESUME.test(t)) return { type: 'resume' };
  const bare = body && NAMES[body].some(n => t.toLowerCase().replace(/[\s.!?。！？]/g, '') === n.replace(/\s/g, ''));
  if (body && (NAV.test(t) || bare)) return { type: 'go', id: body };
  return null;
}

export function initChat({ bi, getContext, actions }) {
  const panel = $('#chatPanel'), log = $('#chatLog'), input = $('#chatInput'), send = $('#chatSend'), mic = $('#chatMic'), spk = $('#chatSpeak'), langSel = $('#chatLang');
  let history = [], busy = false, speakReplies = false, lastCtx = null, quiet = false;
  VOICE_LANGS.forEach(v => { const o = document.createElement('option'); o.value = v.code; o.textContent = v.label; langSel.append(o); });
  langSel.value = defaultLang();
  const setVoiceLang = code => { langSel.value = code; };
  const lang2 = () => langSel.value.slice(0, 2);
  if (!canListen) { mic.disabled = true; mic.title = ERR.unsupported[0]; }
  if (!canSpeak) spk.style.display = 'none';

  const nameOf = id => id === 'solar' ? null : byId[id];
  const add = (cls, html, isHtml = false) => { const el = document.createElement('div'); el.className = 'msg ' + cls; isHtml ? el.innerHTML = html : el.textContent = html; log.append(el); log.scrollTop = log.scrollHeight; return el; };
  const error = code => add('err', bi(...(ERR[code] || ERR.busy)), true); // Spanish comes from js/i18n.js

  function renderContext() {
    const id = getContext(), b = nameOf(id);
    $('#chatCtx').innerHTML = b ? bi('Talking about · ' + b.en, '当前话题 · ' + b.zh, 'Hablando de · ' + b.es) : bi('Talking about · the Solar System', '当前话题 · 太阳系');
    const sugg = b ? [['Tell me a fun fact', '讲一个有趣的知识'], ['Could humans live there?', '人类能在那里生活吗？'], ['How big is it compared to Earth?', '它和地球比有多大？']]
      : [['Which planet is the hottest?', '哪颗行星最热？'], ['Why do planets orbit the Sun?', '行星为什么绕太阳转？'], ['Line up the planets', '把行星并排比较大小']];
    const box = $('#chatSugg'); box.innerHTML = '';
    // Send the suggestion in the language on screen · 以当前语言发送
    sugg.forEach(([en, zh]) => { const b2 = document.createElement('button'); b2.type = 'button'; b2.innerHTML = bi(en, zh); b2.onclick = () => { const l = document.documentElement.dataset.lang; ask(l === 'zh' ? zh : l === 'es' ? window.esText(en) : en, false); }; box.append(b2); });
    // A quiet divider when the topic changes; consecutive changes reuse the same line.
    if (lastCtx !== null && lastCtx !== id && history.length && !quiet) {
      const html = b ? bi(b.en, b.zh, b.es) : bi('SOLAR SYSTEM', '太阳系', 'SISTEMA SOLAR'), lastEl = log.lastElementChild;
      if (lastEl?.classList.contains('note')) lastEl.innerHTML = html; else add('note', html, true);
    }
    lastCtx = id;
  }

  function open() {
    panel.classList.add('show'); document.body.classList.add('chat-open'); renderContext();
    if (!log.childElementCount) add('bot', bi("Hi! I'm Stelar, your space guide. Ask me anything, type or press the mic and talk. Try “Go to Saturn”.", '你好！我是太空向导 Stelar。可以打字或点麦克风说话提问，试试说“去土星”。'), true);
    setTimeout(() => input.focus(), 60);
  }
  function close() { panel.classList.remove('show'); document.body.classList.remove('chat-open'); stopListening(); stopSpeaking(); setMic(false); }

  function reply(text, fromVoice) {
    const el = add('bot', text);
    if (fromVoice || speakReplies) speak(text, CJK.test(text) ? 'zh-CN' : langSel.value);
    return el;
  }

  async function ask(raw, fromVoice) {
    const text = String(raw || '').trim().slice(0, 500); if (!text || busy) return;
    input.value = ''; add('me', text);
    const L2 = CJK.test(text) ? 'zh' : document.documentElement.dataset.lang === 'zh' ? 'zh' : lang2();
    const cmd = parseCommand(text);
    if (cmd) {
      const L = SAY[L2] || SAY.en, b = cmd.id && byId[cmd.id];
      const name = b ? (L2 === 'zh' ? b.zh : LOCAL[L2]?.[cmd.id] || b.en.charAt(0) + b.en.slice(1).toLowerCase()) : '';
      quiet = true; if (cmd.type === 'go') actions.select(cmd.id); else actions[cmd.type]?.(); quiet = false;
      reply(cmd.type === 'go' ? L.go(name) : L[cmd.type], fromVoice);
      renderContext(); return;
    }
    busy = true; send.disabled = true; history.push({ role: 'user', content: text });
    const wait = add('bot', '<span class="typing"><i></i><i></i><i></i></span>', true);
    const planet = findBody(text) || getContext();
    let err = null;
    try {
      const r = await fetch('/api/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ planet, facts: factsText(planet), lang: fromVoice ? langSel.value : 'auto', voice: !!fromVoice, messages: history.slice(-8) }) });
      let data = {}; try { data = await r.json(); } catch { err = r.status === 404 || r.status === 405 || r.status === 501 ? 'offline' : 'busy'; }
      if (!err && r.ok && data.reply) { wait.remove(); reply(data.reply, fromVoice); history.push({ role: 'assistant', content: data.reply }); }
      else err = err || data.error || 'busy';
    } catch { err = 'offline'; }
    if (err) { wait.remove(); history.pop(); error(err); }
    busy = false; send.disabled = false;
  }

  function setMic(on) { mic.classList.toggle('live', on); mic.setAttribute('aria-pressed', on); }
  async function startVoice() {
    if (!canListen) { open(); error('unsupported'); return; }
    if (isListening()) { stopListening(); return; }
    open(); stopSpeaking(); setMic(true); input.placeholder = '…';
    try {
      const text = await listen(langSel.value, t => { input.value = t; });
      setMic(false); input.placeholder = ph();
      if (text) ask(text, true);
    } catch (e) { setMic(false); input.placeholder = ph(); error(e.code || 'network'); }
  }

  $('#chatBtn').onclick = () => panel.classList.contains('show') ? close() : open();
  $('#chatClose').onclick = close;
  $('#chatForm').addEventListener('submit', e => { e.preventDefault(); ask(input.value, false); });
  mic.onclick = startVoice;
  spk.onclick = () => { speakReplies = !speakReplies; spk.classList.toggle('on', speakReplies); spk.setAttribute('aria-pressed', speakReplies); if (!speakReplies) stopSpeaking(); };
  const PH = { en: 'Ask a question', zh: '输入问题', es: 'Haz una pregunta' };
  const ph = () => PH[document.documentElement.dataset.lang] || PH.en;
  input.placeholder = ph(); new MutationObserver(() => { if (!isListening()) input.placeholder = ph(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-lang'] });
  return { open, close, startVoice, refresh: renderContext, ask, setVoiceLang, isOpen: () => panel.classList.contains('show') };
}
