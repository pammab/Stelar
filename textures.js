// ─────────────────────────────────────────────────────────────────────────────
// Procedural planet surfaces · 程序生成的星球表面
// Each painter returns an equirectangular canvas (width × width/2) that wraps
// a three.js sphere. Colours are stylised from real imagery, not scientific maps.
// To use a real photo map instead, load it as a texture in bodies.js.
// ─────────────────────────────────────────────────────────────────────────────
import { makeNoise } from './noise.js';

const N = makeNoise(2026), M = makeNoise(77);
const hex = h => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const clamp01 = x => x < 0 ? 0 : x > 1 ? 1 : x;
const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const mix = (o, a, b, t) => { o[0] = a[0] + (b[0] - a[0]) * t; o[1] = a[1] + (b[1] - a[1]) * t; o[2] = a[2] + (b[2] - a[2]) * t; return o; };
const set = (o, c, k = 1) => { o[0] = c[0] * k; o[1] = c[1] * k; o[2] = c[2] * k; return o; };
const wrapPI = a => ((a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
const DEG = Math.PI / 180;

// Colour stops by latitude (degrees, south → north), interpolated smoothly.
function bands(stops) {
  const s = stops.map(([lat, c]) => [lat, hex(c)]);
  return (o, lat) => {
    let i = 1; while (i < s.length - 1 && lat > s[i][0]) i++;
    const [l0, c0] = s[i - 1], [l1, c1] = s[i];
    return mix(o, c0, c1, clamp01((lat - l0) / (l1 - l0)));
  };
}
const tmp = [0, 0, 0], tmp2 = [0, 0, 0];

/* ───────── Gas and ice giants ───────── */
const jupiterBands = bands([[-90, '#7d7f86'], [-62, '#9b958c'], [-50, '#c4b39a'], [-44, '#a88a6e'], [-38, '#d9c8ad'], [-33, '#b48c66'], [-27, '#e8dcc4'], [-20, '#e6d5b8'], [-19, '#a46d4b'], [-8, '#b07a52'], [-7, '#e9d2a8'], [6, '#ecd8b0'], [7, '#9a6744'], [17, '#a87650'], [18, '#efe2c8'], [26, '#e2d0b2'], [27, '#b48a64'], [34, '#b9926e'], [35, '#ddcbb0'], [42, '#cdb79a'], [47, '#a98868'], [52, '#cbb79c'], [62, '#a29a8f'], [90, '#7f8189']]);
const J = { spot: hex('#b5482b'), spot2: hex('#e3966a'), halo: hex('#f3e6cf'), oval: hex('#f4ede0') };
function jupiter(o, x, y, z, lat, lon) {
  // Domain-warped turbulence: wavy belt edges, eddies and fine streaks · 湍流与细条纹
  const q = N.fbm(x * 3, y * 12, z * 3, 4);
  const warp = (q - 0.5) * 10 + (M.fbm(x * 8 + q * 3, y * 30, z * 8, 4) - 0.5) * 4.5;
  jupiterBands(o, lat + warp);
  set(o, o, 0.8 + 0.38 * N.fbm(x * 4 + q, y * 60, z * 4, 4));
  // Great Red Spot · 大红斑
  const lat0 = -22 * DEG, lon0 = 1.2, la = lat * DEG;
  const dl = wrapPI(lon - lon0) * Math.cos(lat0), da = la - lat0;
  const e = (dl / 0.19) ** 2 + (da / 0.095) ** 2;
  if (e < 1.7) {
    const r = Math.sqrt(e), ang = Math.atan2(da / 0.095, dl / 0.19);
    if (e < 1) { mix(tmp, J.spot, J.spot2, r * (0.85 + 0.15 * Math.sin(ang * 3 + r * 11))); set(o, tmp); }
    else mix(o, J.halo, o, (e - 1) / 0.7);
  }
  // White ovals in the southern temperate belt · 白色卵形风暴
  for (let k = 0; k < 4; k++) {
    const l0 = 1.2 + 0.9 + k * 0.85, d2 = (wrapPI(lon - l0) * Math.cos(-40 * DEG) / 0.045) ** 2 + ((la + 40 * DEG) / 0.03) ** 2;
    if (d2 < 1) mix(o, J.oval, o, d2 * d2);
  }
  return o;
}
const saturnBands = bands([[-90, '#8d8f82'], [-70, '#b8a982'], [-55, '#c9b07a'], [-40, '#dcc493'], [-28, '#d2b47c'], [-18, '#e7d3a2'], [-8, '#eddcae'], [8, '#eddcae'], [18, '#e2cb97'], [28, '#cfae75'], [40, '#dcc594'], [55, '#c6ab78'], [66, '#b9a47e'], [78, '#8f9ca3'], [90, '#7d8fa0']]);
const HEXC = hex('#7f95a3'), HEXE = hex('#e8d9ae');
function saturn(o, x, y, z, lat, lon) {
  saturnBands(o, lat + (N.fbm(x * 2, y * 10, z * 2, 4) - 0.5) * 3.5);
  set(o, o, 0.95 + 0.1 * N.fbm(x * 3, y * 34, z * 3, 3));
  if (lat > 66) { // north-pole hexagon · 北极六边形
    const d = 90 - lat, seg = (((lon / DEG) % 60) + 60) % 60 - 30, r = 13 / Math.cos(seg * DEG);
    if (Math.abs(d - r) < 0.9) set(o, HEXE); else if (d < r) mix(o, HEXC, o, smooth(r - 4, r, d) * 0.5);
  }
  return o;
}
const uranusBands = bands([[-90, '#a9dfe4'], [-30, '#9dd5dd'], [0, '#93ccd6'], [30, '#98d2da'], [60, '#a6dbe1'], [90, '#bce6ea']]);
function uranus(o, x, y, z, lat) {
  uranusBands(o, lat + (N.fbm(x * 2, y * 8, z * 2, 3) - 0.5) * 4);
  return set(o, o, 0.96 + 0.08 * N.fbm(x * 2, y * 20, z * 2, 3));
}
const neptuneBands = bands([[-90, '#2a3f9e'], [-60, '#3553c0'], [-35, '#3e63d4'], [-20, '#2f4fbd'], [0, '#3c5fd0'], [20, '#3459c8'], [45, '#4069d6'], [70, '#3150b8'], [90, '#283c96']]);
const NEP = { dark: hex('#17246a'), white: hex('#eef3ff') };
function neptune(o, x, y, z, lat, lon) {
  neptuneBands(o, lat + (N.fbm(x * 2, y * 8, z * 2, 4) - 0.5) * 6);
  set(o, o, 0.92 + 0.16 * N.fbm(x * 3, y * 18, z * 3, 3));
  const la = lat * DEG, e = (wrapPI(lon - 2.1) * Math.cos(-22 * DEG) / 0.2) ** 2 + ((la + 22 * DEG) / 0.1) ** 2;
  if (e < 1) mix(o, NEP.dark, o, e * e);                       // Great Dark Spot · 大暗斑
  const streak = N.fbm(x * 5, y * 40, z * 5, 3);
  const band = smooth(0, 1, 1 - Math.abs(lat + 30) / 6) + smooth(0, 1, 1 - Math.abs(lat - 25) / 5) + smooth(0, 1, 1 - Math.abs(lat + 30.5) / 2.5) * (e < 2.5 ? 1 : 0);
  if (band > 0) mix(o, o, NEP.white, smooth(0.56, 0.7, streak) * band * 0.9);
  return o;
}

/* ───────── Rocky planets ───────── */
function mercury(o, x, y, z) {
  const n = N.fbm(x * 3 + 11, y * 3, z * 3, 6), m = M.fbm(x * 14, y * 14, z * 14, 3);
  const v = 0.34 + 0.45 * n + 0.16 * (m - 0.5);
  o[0] = 255 * v * 1.02; o[1] = 255 * v * 0.98; o[2] = 255 * v * 0.93;
  return o;
}
const V = { a: hex('#b98547'), b: hex('#f1dcae'), c: hex('#d9ac6c') };
function venus(o, x, y, z, lat) {
  const q = N.fbm(x * 2, y * 2, z * 2, 3);
  const s = N.fbm(x * 1.6 + q * 2.2, y * 5.5 + q * 1.6, z * 1.6, 5);
  mix(o, V.a, V.b, smooth(0.32, 0.72, s));
  mix(o, o, V.c, 0.25 * smooth(55, 85, Math.abs(lat)));
  return o;
}
const MA = { low: hex('#8e4426'), high: hex('#d68457'), dark: hex('#56291b'), cap: hex('#f2ebe3'), dust: hex('#c56a3e') };
function mars(o, x, y, z, lat) {
  const n = N.fbm(x * 2.5, y * 2.5, z * 2.5, 6), d = M.fbm(x * 1.7 + 5, y * 1.7, z * 1.7, 5);
  mix(o, MA.low, MA.high, smooth(0.3, 0.72, n));
  mix(o, o, MA.dark, smooth(0.5, 0.64, d) * 0.85);            // dark albedo regions
  if (lat < -10 && lat > -60) mix(o, o, MA.dust, 0.15);         // brighter southern highlands
  const capN = 79 + 5 * (N.fbm(x * 6, y * 6, z * 6, 3) - 0.5) * 2, capS = -81 + 5 * (M.fbm(x * 6, y * 6, z * 6, 3) - 0.5) * 2;
  if (lat > capN - 2) mix(o, o, MA.cap, smooth(capN - 2, capN + 1.5, lat));
  if (lat < capS + 2) mix(o, o, MA.cap, smooth(capS + 2, capS - 1.5, lat));
  return o;
}

/* ───────── Earth ───────── */
// Continent outlines drawn by the team (equirectangular, % of width/height).
const CONTINENTS = [[[7, 16], [10, 8], [19, 9], [25, 16], [29, 24], [24, 30], [24, 38], [20, 42], [16, 34], [12, 29]], [[23, 43], [29, 45], [32, 55], [30, 65], [27, 77], [24, 69], [23, 57]], [[45, 28], [49, 22], [54, 24], [55, 30], [60, 32], [58, 43], [54, 56], [50, 60], [47, 49], [45, 38]], [[49, 23], [51, 15], [61, 11], [72, 13], [80, 19], [84, 28], [79, 35], [73, 32], [68, 39], [63, 33], [60, 26]], [[75, 61], [82, 58], [87, 66], [85, 73], [79, 74], [75, 69]], [[32, 5], [39, 7], [37, 19], [33, 20]], [[84, 37], [86, 39], [85, 45]], [[62, 45], [64, 48], [63, 51]]];
const E = { deep: hex('#06224f'), mid: hex('#0d3d7a'), shallow: hex('#1f6fa3'), forest: hex('#2c5a2b'), grass: hex('#5f8a3c'), savanna: hex('#9c9550'), desert: hex('#d0ac70'), tundra: hex('#7d7863'), rock: hex('#6e6253'), ice: hex('#eef4f8') };
function earthMask(w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff';
  for (const poly of CONTINENTS) { g.beginPath(); poly.forEach(([a, b], i) => i ? g.lineTo(a / 100 * w, b / 100 * h) : g.moveTo(a / 100 * w, b / 100 * h)); g.closePath(); g.fill(); }
  g.beginPath(); g.rect(0, h * 0.93, w, h * 0.07); g.fill();               // Antarctica
  const land = g.getImageData(0, 0, w, h).data;
  const b = document.createElement('canvas'); b.width = w; b.height = h;
  const bg = b.getContext('2d'); bg.filter = `blur(${Math.round(w / 90)}px)`; bg.drawImage(c, 0, 0);
  const shelf = bg.getImageData(0, 0, w, h).data;
  return { land, shelf };
}
function paintEarth(w) {
  const h = w / 2, { land, shelf } = earthMask(w, h);
  const surf = new ImageData(w, h), rough = new ImageData(w, h), cloud = new ImageData(w, h);
  const o = [0, 0, 0], at = (arr, px, py) => arr[((Math.min(h - 1, Math.max(0, py)) * w + ((px % w) + w) % w) * 4)] / 255;
  for (let py = 0; py < h; py++) {
    const latR = (0.5 - (py + 0.5) / h) * Math.PI, cl = Math.cos(latR), y = Math.sin(latR), lat = latR / DEG, al = Math.abs(lat);
    for (let px = 0; px < w; px++) {
      const lon = (px + 0.5) / w * 2 * Math.PI, x = -Math.cos(lon) * cl, z = Math.sin(lon) * cl, i = (py * w + px) * 4;
      // Wobbly coastlines · 不规则海岸线
      const ox = Math.round((N.fbm(x * 4, y * 4, z * 4, 4) - 0.5) * w * 0.035), oy = Math.round((M.fbm(x * 4, y * 4, z * 4, 4) - 0.5) * h * 0.05);
      const isLand = at(land, px + ox, py + oy) > 0.5, sh = at(shelf, px + ox, py + oy);
      const elev = N.fbm(x * 5 + 3, y * 5, z * 5, 6), wet = M.fbm(x * 3, y * 3, z * 3, 4);
      if (isLand) {
        const dry = smooth(0.45, 0.62, wet) * smooth(8, 18, al) * (1 - smooth(32, 42, al)); // subtropical deserts
        if (al < 12) mix(o, E.forest, E.grass, smooth(0.35, 0.6, wet));
        else mix(o, E.grass, E.forest, smooth(0.42, 0.6, 1 - wet));
        if (al > 10 && al < 25) mix(o, o, E.savanna, 0.35);
        mix(o, o, E.desert, dry);
        mix(o, o, E.tundra, smooth(52, 66, al));
        mix(o, o, E.rock, smooth(0.6, 0.72, elev) * 0.8);
        mix(o, o, E.ice, smooth(0.7, 0.76, elev) * smooth(25, 45, al));
      } else {
        mix(o, E.deep, E.mid, smooth(0.35, 0.65, elev));
        mix(o, o, E.shallow, smooth(0.05, 0.45, sh) * 0.85);
      }
      const capEdge = 72 + 6 * (N.fbm(x * 8, y * 8, z * 8, 3) - 0.5) * 2;
      const ice = lat > 0 ? smooth(capEdge - 1, capEdge + 2, al) : smooth(capEdge - 6, capEdge - 3, al);
      if (ice > 0) mix(o, o, E.ice, ice);
      surf.data[i] = o[0]; surf.data[i + 1] = o[1]; surf.data[i + 2] = o[2]; surf.data[i + 3] = 255;
      const r = isLand || ice > 0.5 ? 235 : 70;                  // oceans are glossy · 海洋反光
      rough.data[i] = rough.data[i + 1] = rough.data[i + 2] = r; rough.data[i + 3] = 255;
      // Clouds: storm belts at mid-latitudes, a band near the equator · 云层
      const q = N.fbm(x * 2.5 + 9, y * 2.5, z * 2.5, 3);
      const cv = M.fbm(x * 4 + q * 2.5, y * 9 + q * 1.5, z * 4, 6);
      const lift = 0.06 * smooth(40, 60, al) * (1 - smooth(62, 75, al)) + 0.05 * (1 - smooth(0, 10, al)) - 0.05 * smooth(15, 28, al) * (1 - smooth(28, 38, al));
      const a = smooth(0.54, 0.72, cv + lift);
      cloud.data[i] = cloud.data[i + 1] = cloud.data[i + 2] = 255; cloud.data[i + 3] = a * 215;
    }
  }
  return { map: toCanvas(surf), roughness: toCanvas(rough), clouds: toCanvas(cloud) };
}
const toCanvas = img => { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; c.getContext('2d').putImageData(img, 0, 0); return c; };

/* ───────── Painted details (craters, canyons) ───────── */
function craters(c, count, dark, light, maxR, rays = 0) {
  const g = c.getContext('2d'), w = c.width, h = c.height, R = makeNoise(5).rnd;
  for (let i = 0; i < count; i++) {
    const lat = Math.asin(2 * R() - 1), px = R() * w, py = (0.5 - lat / Math.PI) * h;
    const r = (2 + Math.pow(R(), 3) * maxR) * w / 1024, sx = Math.min(6, 1 / Math.max(0.15, Math.cos(lat)));
    g.save(); g.translate(px, py); g.scale(sx, 1);
    const grd = g.createRadialGradient(0, 0, r * 0.2, 0, 0, r);
    grd.addColorStop(0, dark); grd.addColorStop(0.7, dark); grd.addColorStop(0.88, light); grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill();
    if (i < rays) { g.strokeStyle = 'rgba(255,250,240,0.07)'; g.lineWidth = r * 0.15; for (let k = 0; k < 14; k++) { const a = R() * Math.PI * 2, L = r * (3 + R() * 6); g.beginPath(); g.moveTo(Math.cos(a) * r, Math.sin(a) * r); g.lineTo(Math.cos(a) * L, Math.sin(a) * L); g.stroke(); } }
    g.restore();
  }
}
function marsDetails(c) {
  const g = c.getContext('2d'), w = c.width, h = c.height, R = makeNoise(9).rnd;
  craters(c, 140, 'rgba(70,30,18,0.12)', 'rgba(245,190,140,0.09)', 11);
  // Valles Marineris · 水手号峡谷
  g.strokeStyle = 'rgba(60,24,14,0.55)'; g.lineCap = 'round';
  for (let pass = 0; pass < 3; pass++) {
    g.lineWidth = (5 - pass * 1.5) * w / 1024; g.beginPath();
    for (let i = 0; i <= 40; i++) { const px = w * (0.62 + i * 0.0042), py = h * (0.56 + Math.sin(i * 0.35) * 0.008 + (R() - 0.5) * 0.004 + pass * 0.004); i ? g.lineTo(px, py) : g.moveTo(px, py); }
    g.stroke();
  }
  // Tharsis volcanoes & Olympus Mons · 塔尔西斯火山群与奥林匹斯山
  const volcano = (fx, fy, fr) => { const r = fr * w, grd = g.createRadialGradient(fx * w, fy * h, 0, fx * w, fy * h, r); grd.addColorStop(0, 'rgba(120,60,36,0.7)'); grd.addColorStop(0.2, 'rgba(230,170,120,0.35)'); grd.addColorStop(0.8, 'rgba(150,70,40,0.25)'); grd.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = grd; g.beginPath(); g.arc(fx * w, fy * h, r, 0, 7); g.fill(); };
  volcano(0.37, 0.4, 0.022); volcano(0.43, 0.47, 0.011); volcano(0.45, 0.5, 0.011); volcano(0.47, 0.53, 0.011);
}

/* ───────── Public API ───────── */
const PAINTERS = { mercury, venus, mars, jupiter, saturn, uranus, neptune };
// Returns { map, roughness?, clouds? } canvases at the requested width.
export function paintBody(id, w = 512) {
  if (id === 'earth') return paintEarth(w);
  const p = PAINTERS[id]; if (!p) return null;
  const h = w / 2, img = new ImageData(w, h), d = img.data, o = [0, 0, 0];
  for (let py = 0; py < h; py++) {
    const latR = (0.5 - (py + 0.5) / h) * Math.PI, cl = Math.cos(latR), y = Math.sin(latR), lat = latR / DEG;
    for (let px = 0; px < w; px++) {
      const lon = (px + 0.5) / w * 2 * Math.PI, x = -Math.cos(lon) * cl, z = Math.sin(lon) * cl, i = (py * w + px) * 4;
      p(o, x, y, z, lat, lon);
      d[i] = o[0]; d[i + 1] = o[1]; d[i + 2] = o[2]; d[i + 3] = 255;
    }
  }
  const map = toCanvas(img);
  if (id === 'mercury') craters(map, 700, 'rgba(30,28,26,0.13)', 'rgba(255,250,240,0.07)', 16, 10);
  if (id === 'mars') marsDetails(map);
  return { map };
}

// Ring textures: a radial strip from the inner to the outer edge (in planet radii).
const RING_PROFILES = {
  saturn: { inner: 1.24, outer: 2.34, profile: r => {
    if (r < 1.53) return [0.28 + 0.1 * Math.sin(r * 90), '#8c7f6c'];       // C ring
    if (r < 1.95) return [0.92 - 0.25 * Math.abs(Math.sin(r * 55)), '#efdcb6']; // B ring
    if (r < 2.03) return [0.06, '#5e5548'];                                   // Cassini Division
    if (r > 2.208 && r < 2.222) return [0.04, '#5e5548'];                     // Encke Gap
    if (r < 2.27) return [0.68 - 0.12 * Math.sin(r * 120), '#d2bf9b'];        // A ring
    if (r > 2.322 && r < 2.334) return [0.55, '#e3dbcc'];                     // F ring
    return [0, '#000'];
  } },
  uranus: { inner: 1.6, outer: 2.02, profile: r => {
    const lines = [1.64, 1.67, 1.7, 1.75, 1.79, 1.83, 1.86, 1.9, 1.995];
    const near = lines.some(l => Math.abs(r - l) < 0.004) ? 0.45 : 0;
    return [Math.abs(r - 1.995) < 0.007 ? 0.75 : near, '#c4d2d6'];
  } },
  jupiter: { inner: 1.71, outer: 1.82, profile: r => [0.08 + 0.04 * Math.sin(r * 300), '#a69683'] },
  neptune: { inner: 2.1, outer: 2.56, profile: r => [Math.abs(r - 2.15) < 0.006 || Math.abs(r - 2.54) < 0.006 ? 0.3 : 0.015, '#9aa3b8'] },
};
export const ringInfo = id => RING_PROFILES[id];
export function paintRing(id, w = 1024) {
  const P = RING_PROFILES[id]; if (!P) return null;
  const img = new ImageData(w, 1);
  for (let i = 0; i < w; i++) {
    const r = P.inner + (P.outer - P.inner) * (i + 0.5) / w, [a, c] = P.profile(r), rgb = hex(c), n = 0.85 + 0.3 * N.noise(r * 220, 0.5, 0.5);
    img.data[i * 4] = rgb[0] * n; img.data[i * 4 + 1] = rgb[1] * n; img.data[i * 4 + 2] = rgb[2] * n; img.data[i * 4 + 3] = clamp01(a) * 255;
  }
  return toCanvas(img);
}
