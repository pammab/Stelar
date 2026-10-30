// ─────────────────────────────────────────────────────────────────────────────
// Hand tracking · 手势追踪 (MediaPipe Hand Landmarker, runs in the browser)
// Produces a smooth hand cursor and a stable gesture every video frame:
//   point ☝  pinch 🤏  open ✋  fist ✊  victory ✌  other / none
// Nothing is uploaded: the video stays on the visitor's device.
//
// How it stays accurate:
//  • fingers are judged by joint angles in 3D (world landmarks), so a tilted or
//    turned hand is still read correctly;
//  • a gesture must win a short vote over recent frames (no flicker);
//  • the cursor uses a One-Euro filter: steady when you hold still, quick when you move.
// ─────────────────────────────────────────────────────────────────────────────
const VISION = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.20';
const MODEL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
const BONES = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11], [11, 12], [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [17, 18], [18, 19], [19, 20], [0, 17]];
export const GESTURE_COLORS = { point: '#8bd6ff', pinch: '#ffd36b', open: '#7dffb0', fist: '#ff8a7a', victory: '#d39bff', other: '#9fb2c4', none: '#9fb2c4' };

// Sensitivity 1 (calm) … 5 (very responsive) · 灵敏度
export const SENSITIVITY = {
  1: { reach: 0.86, minCutoff: 0.6, beta: 0.004, gain: 0.7 },
  2: { reach: 0.78, minCutoff: 0.9, beta: 0.007, gain: 0.85 },
  3: { reach: 0.7, minCutoff: 1.2, beta: 0.012, gain: 1 },
  4: { reach: 0.6, minCutoff: 1.7, beta: 0.02, gain: 1.25 },
  5: { reach: 0.5, minCutoff: 2.4, beta: 0.035, gain: 1.6 },
};

const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: (a.z || 0) - (b.z || 0) });
const len = v => Math.hypot(v.x, v.y, v.z);
const dist = (a, b) => len(sub(a, b));
const cosAngle = (a, b) => { const la = len(a), lb = len(b); return la && lb ? (a.x * b.x + a.y * b.y + a.z * b.z) / (la * lb) : 0; };

// How straight a finger is: 1 = fully straight, lower = bent. Uses the two joints above the knuckle.
function straightness(p, mcp, pip, dip, tip) {
  return (cosAngle(sub(p[pip], p[mcp]), sub(p[dip], p[pip])) + cosAngle(sub(p[dip], p[pip]), sub(p[tip], p[dip]))) / 2;
}

// Pure function, easy to test. lm = 21 image landmarks; world = 21 world landmarks (metres) or null.
export function classify(lm, world = null, previous = 'none') {
  const p = world || lm;
  const palm = Math.max(1e-4, dist(p[0], p[9]));
  const fingers = [[5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16], [17, 18, 19, 20]];
  const extended = fingers.map(([m, pi, d, t]) => straightness(p, m, pi, d, t) > 0.72 && dist(p[t], p[0]) > dist(p[pi], p[0]) * 1.08);
  const curled = fingers.map(([m, pi, d, t]) => dist(p[t], p[0]) < dist(p[pi], p[0]) * 1.05);
  const count = extended.filter(Boolean).length;
  const pinch = dist(p[4], p[8]) / palm;
  const indexOut = dist(p[8], p[0]) > palm * 0.95;
  const openness = [8, 12, 16, 20].reduce((s, i) => s + dist(p[i], p[0]), 0) / 4 / palm;
  // Hysteresis: easier to stay in a pinch than to start one.
  const pinchLimit = previous === 'pinch' ? 0.5 : 0.33;
  let g = 'other';
  if (pinch < pinchLimit && indexOut && !(extended[1] && extended[2] && extended[3] && pinch > 0.25)) g = 'pinch';
  else if (count >= 4 || (count === 3 && !curled[0] && !curled[3])) g = 'open';
  else if (extended[0] && !extended[1] && curled[2] && curled[3]) g = 'point';
  else if (extended[0] && extended[1] && !extended[2] && !extended[3]) g = 'victory';
  else if (count === 0 && curled.filter(Boolean).length >= 3) g = 'fist';
  return { gesture: g, palm, pinch, openness, extended };
}

// One-Euro filter: smooth when slow, responsive when fast (Casiez et al. 2012).
class OneEuro {
  constructor(minCutoff, beta) { this.set(minCutoff, beta); this.x = null; this.dx = 0; this.t = 0; }
  set(minCutoff, beta) { this.minCutoff = minCutoff; this.beta = beta; }
  reset() { this.x = null; }
  filter(x, t) {
    if (this.x === null) { this.x = x; this.t = t; return x; }
    const dt = Math.max(1e-3, (t - this.t) / 1000); this.t = t;
    const a = c => 1 / (1 + 1 / (2 * Math.PI * c * dt));
    const dx = (x - this.x) / dt; this.dx += a(1) * (dx - this.dx);
    const cutoff = this.minCutoff + this.beta * Math.abs(this.dx) * 1000;
    this.x += a(cutoff) * (x - this.x); return this.x;
  }
}

export class HandTracker {
  constructor({ video, overlay, onUpdate, fpsEl }) {
    this.video = video; this.overlay = overlay; this.onUpdate = onUpdate; this.fpsEl = fpsEl;
    this.landmarker = null; this.stream = null; this.running = false;
    this.votes = []; this.stable = 'none'; this.lastSeen = 0; this.frames = 0; this.fpsT = 0;
    this.fx = new OneEuro(1.2, 0.012); this.fy = new OneEuro(1.2, 0.012); this.anchor = null;
    this.setSensitivity(3);
  }
  get active() { return this.running; }
  setSensitivity(level) {
    this.level = Math.max(1, Math.min(5, Math.round(level))); this.cfg = SENSITIVITY[this.level];
    this.fx.set(this.cfg.minCutoff, this.cfg.beta); this.fy.set(this.cfg.minCutoff, this.cfg.beta);
  }

  async start() {
    if (this.running) return;
    if (!navigator.mediaDevices?.getUserMedia) throw Object.assign(new Error('insecure'), { name: 'InsecureContext' });
    this.stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30 }, facingMode: 'user' }, audio: false });
    this.video.srcObject = this.stream; await this.video.play();
    const V = await import(`${VISION}/vision_bundle.mjs`);
    const files = await V.FilesetResolver.forVisionTasks(`${VISION}/wasm`);
    const opts = { baseOptions: { modelAssetPath: MODEL, delegate: 'GPU' }, runningMode: 'VIDEO', numHands: 1, minHandDetectionConfidence: 0.5, minHandPresenceConfidence: 0.5, minTrackingConfidence: 0.5 };
    try { this.landmarker = await V.HandLandmarker.createFromOptions(files, opts); }
    catch { opts.baseOptions.delegate = 'CPU'; this.landmarker = await V.HandLandmarker.createFromOptions(files, opts); }
    if (!this.stream) { this.landmarker?.close(); this.landmarker = null; return; } // stopped while loading
    this.running = true; this.loop();
  }

  stop() {
    this.running = false;
    this.stream?.getTracks().forEach(t => t.stop()); this.stream = null;
    this.landmarker?.close(); this.landmarker = null;
    this.video.srcObject = null; this.votes = []; this.stable = 'none'; this.fx.reset(); this.fy.reset();
    this.overlay?.getContext('2d').clearRect(0, 0, this.overlay.width, this.overlay.height);
    this.onUpdate({ present: false, gesture: 'none' });
  }

  loop() {
    if (!this.running) return;
    try { this.detect(performance.now()); } catch (e) { console.warn('Hand tracking frame failed', e); }
    if (this.video.requestVideoFrameCallback) this.video.requestVideoFrameCallback(() => this.loop()); else requestAnimationFrame(() => this.loop());
  }

  detect(now) {
    if (this.video.readyState < 2) return;
    const res = this.landmarker.detectForVideo(this.video, now), lm = res.landmarks?.[0], world = res.worldLandmarks?.[0] || null;
    this.frames++; if (now - this.fpsT > 1000) { if (this.fpsEl) this.fpsEl.textContent = this.frames + ' fps'; this.frames = 0; this.fpsT = now; }
    if (!lm) {
      if (now - this.lastSeen > 300) { this.votes = []; this.stable = 'none'; this.fx.reset(); this.fy.reset(); this.onUpdate({ present: false, gesture: 'none' }); this.draw(null); }
      return;
    }
    this.lastSeen = now;
    const f = classify(lm, world, this.stable);
    // Vote over the last 5 frames: a gesture needs 3 of them (a pinch only 2, so clicks feel instant).
    this.votes.push(f.gesture); if (this.votes.length > 5) this.votes.shift();
    const tally = {}; this.votes.forEach(v => tally[v] = (tally[v] || 0) + 1);
    const best = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];
    if (best[1] >= 3 || (f.gesture === 'pinch' && tally.pinch >= 2) || (this.stable === 'pinch' && f.gesture !== 'pinch' && (tally[f.gesture] || 0) >= 2)) this.stable = best[1] >= 3 ? best[0] : f.gesture;
    const g = this.stable;
    // Cursor anchor: the index knuckle-to-tip area is steadier than the tip alone; palm centre for open/fist.
    const tip = { x: lm[8].x * 0.75 + lm[7].x * 0.25, y: lm[8].y * 0.75 + lm[7].y * 0.25 };
    const palmC = { x: (lm[0].x + lm[5].x + lm[9].x + lm[13].x + lm[17].x) / 5, y: (lm[0].y + lm[5].y + lm[9].y + lm[13].y + lm[17].y) / 5 };
    const target = g === 'open' || g === 'fist' ? palmC : tip;
    // Glide between anchors instead of jumping when the gesture changes.
    if (!this.anchor) this.anchor = { ...target }; else { this.anchor.x += (target.x - this.anchor.x) * 0.35; this.anchor.y += (target.y - this.anchor.y) * 0.35; }
    const r = this.cfg.reach, x0 = (1 - r) / 2, y0 = (1 - r) / 2 - 0.05;
    const cl = v => Math.max(0, Math.min(1, v));
    const cx = this.fx.filter(cl((1 - this.anchor.x - x0) / r), now), cy = this.fy.filter(cl((this.anchor.y - y0) / r), now);
    this.onUpdate({ present: true, gesture: g, raw: f.gesture, cursor: { x: cx, y: cy }, openness: f.openness, pinch: f.pinch, gain: this.cfg.gain });
    this.draw(lm, g);
  }

  draw(lm, g) {
    const c = this.overlay; if (!c) return;
    const ctx = c.getContext('2d'), w = c.width = c.clientWidth * devicePixelRatio, h = c.height = c.clientHeight * devicePixelRatio;
    ctx.clearRect(0, 0, w, h); if (!lm) return;
    const col = GESTURE_COLORS[g] || '#fff', X = p => (1 - p.x) * w, Y = p => p.y * h;
    ctx.lineWidth = 2 * devicePixelRatio; ctx.strokeStyle = col; ctx.globalAlpha = 0.9;
    for (const [a, b] of BONES) { ctx.beginPath(); ctx.moveTo(X(lm[a]), Y(lm[a])); ctx.lineTo(X(lm[b]), Y(lm[b])); ctx.stroke(); }
    ctx.fillStyle = col;
    lm.forEach((p, i) => { ctx.beginPath(); ctx.arc(X(p), Y(p), (i % 4 === 0 ? 3.2 : 2) * devicePixelRatio, 0, 7); ctx.fill(); });
    // The reach box that maps to the whole screen (smaller box = more sensitive) · 映射到全屏的操作区域
    const r = this.cfg.reach;
    ctx.globalAlpha = 0.3; ctx.setLineDash([4 * devicePixelRatio, 4 * devicePixelRatio]); ctx.strokeStyle = '#fff';
    ctx.strokeRect(w * (1 - r) / 2, h * ((1 - r) / 2 - 0.05), w * r, h * r);
  }
}
