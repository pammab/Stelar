// ─────────────────────────────────────────────────────────────────────────────
// 3D builders for the Sun and planets · 太阳与行星的三维构建
// buildPlanet(p) returns an independent object; teammates can replace any
// planet's look here without touching the rest of the app.
// Hierarchy: anchor (orbit position) → tilt (axial tilt) → spin (rotation) → meshes
// ─────────────────────────────────────────────────────────────────────────────
import * as T from 'three';
import { radiusUnits } from './data.js';
import { paintBody, paintRing, ringInfo } from './textures.js';
import { sampleCanvas } from './maps.js';

const DEG = Math.PI / 180;
export const sphereGeo = new T.SphereGeometry(1, 96, 64);
const lowGeo = new T.SphereGeometry(1, 40, 24);

// Glow on the sunlit edge of an atmosphere · 大气层向阳边缘的辉光
export function atmosphere(color, scale = 1.04, strength = 0.9, power = 3.2) {
  const mat = new T.ShaderMaterial({
    uniforms: { tint: { value: new T.Color(color) }, sunPos: { value: new T.Vector3() }, strength: { value: strength }, power: { value: power } },
    vertexShader: 'varying vec3 vW;varying vec3 vN;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vN=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*w;}',
    fragmentShader: 'uniform vec3 tint;uniform vec3 sunPos;uniform float strength;uniform float power;varying vec3 vW;varying vec3 vN;void main(){vec3 n=normalize(vN);vec3 v=normalize(cameraPosition-vW);float f=pow(1.-max(dot(n,v),0.),power);float day=smoothstep(-.3,.5,dot(n,normalize(sunPos-vW)));gl_FragColor=vec4(tint,f*strength*day);}',
    transparent: true, depthWrite: false, blending: T.AdditiveBlending,
  });
  const m = new T.Mesh(sphereGeo, mat); m.scale.setScalar(scale); m.userData.isAtmosphere = true; return m;
}

function canvasTex(c, srgb = true) {
  const t = new T.CanvasTexture(c); if (srgb) t.colorSpace = T.SRGBColorSpace;
  t.anisotropy = 8; return t;
}

function ringMesh(id, r) {
  const info = ringInfo(id); if (!info) return null;
  const geo = new T.RingGeometry(info.inner, info.outer, 256, 1);
  const pos = geo.attributes.position, uv = geo.attributes.uv, v = new T.Vector3();
  for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i); uv.setXY(i, (v.length() - info.inner) / (info.outer - info.inner), 0.5); }
  const mat = new T.MeshLambertMaterial({ map: canvasTex(paintRing(id)), transparent: true, side: T.DoubleSide, depthWrite: false });
  const ring = new T.Mesh(geo, mat); ring.rotation.x = -Math.PI / 2; ring.scale.setScalar(r); ring.renderOrder = 2;
  return ring;
}

// Particle shell sampled from the planet's own surface colours (the "particle garden" look).
// 粒子外壳：颜色取自星球表面纹理，张开手掌时会扩散。
export function buildParticles(canvas, r, count) {
  const g = canvas.getContext('2d', { willReadFrequently: true }), W = canvas.width, H = canvas.height, data = g.getImageData(0, 0, W, H).data;
  const pos = new Float32Array(count * 3), col = new Float32Array(count * 3), seed = new Float32Array(count), c = new T.Color();
  for (let i = 0; i < count; i++) {
    const u = Math.random(), yv = 2 * Math.random() - 1, lat = Math.asin(yv), lon = u * Math.PI * 2, cl = Math.cos(lat);
    pos.set([-Math.cos(lon) * cl * r * 1.01, yv * r * 1.01, Math.sin(lon) * cl * r * 1.01], i * 3);
    const px = Math.min(W - 1, Math.floor(u * W)), py = Math.min(H - 1, Math.floor((0.5 - lat / Math.PI) * H)), k = (py * W + px) * 4;
    c.setRGB(data[k] / 255, data[k + 1] / 255, data[k + 2] / 255, T.SRGBColorSpace);
    col.set([c.r, c.g, c.b], i * 3); seed[i] = Math.random();
  }
  const geo = new T.BufferGeometry();
  geo.setAttribute('position', new T.BufferAttribute(pos, 3).setUsage(T.DynamicDrawUsage));
  geo.setAttribute('color', new T.BufferAttribute(col, 3));
  const pts = new T.Points(geo, new T.PointsMaterial({ size: r * 0.016, vertexColors: true, transparent: true, opacity: 0.55, blending: T.AdditiveBlending, depthWrite: false }));
  pts.userData = { base: pos.slice(), seed };
  return pts;
}

// Saturn's rings as sparkling particles, following the real ring structure.
export function buildRingParticles(id, r, count = 9000) {
  const info = ringInfo(id); if (!info) return null;
  const pos = new Float32Array(count * 3), col = new Float32Array(count * 3), seed = new Float32Array(count), c = new T.Color();
  let i = 0, guard = 0;
  while (i < count && guard++ < count * 40) {
    const rr = info.inner + Math.random() * (info.outer - info.inner), [a, hexc] = info.profile(rr);
    if (Math.random() > a) continue;
    const t = Math.random() * Math.PI * 2;
    pos.set([Math.cos(t) * rr * r, (Math.random() - 0.5) * 0.004 * r, Math.sin(t) * rr * r], i * 3);
    c.set(hexc); col.set([c.r, c.g, c.b], i * 3); seed[i] = Math.random(); i++;
  }
  const geo = new T.BufferGeometry();
  geo.setAttribute('position', new T.BufferAttribute(pos.subarray(0, i * 3), 3).setUsage(T.DynamicDrawUsage));
  geo.setAttribute('color', new T.BufferAttribute(col.subarray(0, i * 3), 3));
  const pts = new T.Points(geo, new T.PointsMaterial({ size: r * 0.012, vertexColors: true, transparent: true, opacity: 0.7, blending: T.AdditiveBlending, depthWrite: false }));
  pts.userData = { base: pos.slice(0, i * 3), seed: seed.subarray(0, i) };
  return pts;
}

const ATMOS = { venus: ['#f3cf8a', 1.06, 1.1, 2.2], earth: ['#4a9cff', 1.035, 1.15, 3], mars: ['#e8916a', 1.02, 0.6, 3.5], jupiter: ['#f0d9b5', 1.02, 0.4, 3.5], saturn: ['#f2dfb3', 1.02, 0.35, 3.5], uranus: ['#bff3f6', 1.03, 0.7, 2.8], neptune: ['#6f9bff', 1.03, 0.8, 2.8] };

export function buildPlanet(p) {
  const r = radiusUnits(p.radiusKm);
  const anchor = new T.Group(), tilt = new T.Group(), spin = new T.Group();
  anchor.add(tilt); tilt.add(spin); tilt.rotation.z = p.tilt * DEG;
  const tex = paintBody(p.id, 256);                         // quick low-res first; upgraded later
  const mat = new T.MeshStandardMaterial({ map: canvasTex(tex.map), roughness: 1, metalness: 0 });
  if (tex.roughness) { mat.roughnessMap = canvasTex(tex.roughness, false); mat.roughness = 1; }
  const surface = new T.Mesh(sphereGeo, mat); surface.scale.setScalar(r);
  const FLAT = { jupiter: 0.935, saturn: 0.902, uranus: 0.977, neptune: 0.983 };
  if (FLAT[p.id]) surface.scale.y = r * FLAT[p.id];                // giant planets are flattened · 扁球
  spin.add(surface);
  let clouds = null;
  if (tex.clouds) {
    clouds = new T.Mesh(sphereGeo, new T.MeshStandardMaterial({ map: canvasTex(tex.clouds), transparent: true, depthWrite: false, roughness: 1 }));
    clouds.scale.setScalar(r * 1.012); spin.add(clouds);
  }
  const a = ATMOS[p.id]; let atmo = null;
  if (a) { atmo = atmosphere(a[0], a[1], a[2], a[3]); atmo.scale.setScalar(r * a[1]); anchor.add(atmo); }
  const ring = ringMesh(p.id, r); if (ring) tilt.add(ring);
  // Invisible, larger hit sphere so tiny planets are easy to click · 便于点击的隐形球
  const hit = new T.Mesh(lowGeo, new T.MeshBasicMaterial({ visible: false })); hit.scale.setScalar(r * 1.6); anchor.add(hit);
  const body = { p, r, anchor, tilt, spin, surface, clouds, ring, atmo, hit, particles: null, ringParticles: null, hiRes: false, texCanvas: tex.map };
  return body;
}

// Replace the low-res texture with a detailed one (done in the background).
export function upgradeTexture(body, w = 1024) {
  if (body.hiRes) return;
  const tex = paintBody(body.p.id, w); body.hiRes = true; body.texCanvas = tex.map;
  const m = body.surface.material; m.map.dispose(); m.map = canvasTex(tex.map);
  if (tex.roughness) { m.roughnessMap?.dispose(); m.roughnessMap = canvasTex(tex.roughness, false); }
  m.needsUpdate = true;
  if (tex.clouds && body.clouds) { body.clouds.material.map.dispose(); body.clouds.material.map = canvasTex(tex.clouds); body.clouds.material.needsUpdate = true; }
}

// Swap in the real surface maps (see maps.js) once they have loaded · 换上真实贴图
export function applyMaps(body, M) {
  const id = body.p.id, map = M[id]; if (!map) return false;
  const m = body.surface.material;
  if (m.map && m.map !== map) m.map.dispose();
  m.map = map; m.roughnessMap = null; m.bumpMap = null; m.normalMap = null; m.roughness = 1;
  if (id === 'earth') {
    m.roughness = 0.58;
    if (M.normal) { m.normalMap = M.normal; m.normalScale.set(0.7, 0.7); }
    if (M.roughness) { m.roughnessMap = M.roughness; m.roughness = 1; }
    if (M.clouds && body.clouds) { const c = body.clouds.material; c.map.dispose(); c.map = M.clouds; c.opacity = 0.92; c.needsUpdate = true; body.clouds.scale.setScalar(body.r * 1.009); }
  }
  if (id === 'mercury' && M.mercuryBump) { m.bumpMap = M.mercuryBump; m.bumpScale = 0.018; }
  if (id === 'mars' && M.marsBump) { m.bumpMap = M.marsBump; m.bumpScale = 0.022; m.roughness = 0.98; }
  if (id === 'saturn' && M.saturnRing && body.ring) { const rm = body.ring.material; rm.map.dispose(); rm.map = M.saturnRing; rm.opacity = 0.95; rm.alphaTest = 0.025; rm.needsUpdate = true; }
  m.needsUpdate = true; body.hiRes = true; body.realMap = true;
  body.texCanvas = sampleCanvas(map);
  return true;
}

// Venus: clouds (what your eyes would see) or the radar view of the ground beneath.
// The radar colours are an interpretation, not a photograph. · 金星云层 / 雷达地表视图
export function setVenusSurface(body, M, surfaceView) {
  if (body.p.id !== 'venus' || !M.venus || !M.venusSurface) return false;
  const m = body.surface.material;
  m.map = surfaceView ? M.venusSurface : M.venus;
  m.bumpMap = surfaceView && M.venusSurfaceBump ? M.venusSurfaceBump : null; m.bumpScale = 0.012;
  m.needsUpdate = true; body.texCanvas = sampleCanvas(m.map); body.venusSurface = surfaceView;
  if (body.atmo) body.atmo.visible = !surfaceView;
  return true;
}

/* ───────── The Sun · 太阳 ───────── */
const SUN_VERT = 'varying vec3 vP;varying vec3 vN;varying vec3 vW;void main(){vP=position;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vN=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*w;}';
const SUN_FRAG = `uniform float time;varying vec3 vP;varying vec3 vN;varying vec3 vW;
float h(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float n(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*n(p);p*=2.07;a*=.5;}return s;}
void main(){vec3 p=normalize(vP);float t=time*.04;
float g=fbm(p*9.+vec3(t,t*.7,-t));float c=fbm(p*38.+g*2.+t*2.);float spots=smoothstep(.72,.8,fbm(p*3.+vec3(9.,t*.3,2.)));
float mu=max(dot(normalize(vN),normalize(cameraPosition-vW)),0.);
vec3 col=mix(vec3(1.,.42,.06),vec3(1.,.86,.48),g*.8+c*.45);col*=1.-spots*.5;
col*=.55+.6*pow(mu,.45);col+=vec3(1.,.55,.2)*pow(1.-mu,3.)*.6;gl_FragColor=vec4(col,1.);}`;

function glowSprite(inner, outer, size, opacity) {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, inner); grd.addColorStop(0.35, outer); grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
  const s = new T.Sprite(new T.SpriteMaterial({ map: canvasTex(c), blending: T.AdditiveBlending, depthWrite: false, transparent: true, opacity }));
  s.scale.setScalar(size); return s;
}

export function buildSun(sunData) {
  const r = radiusUnits(sunData.radiusKm);
  const anchor = new T.Group(), tilt = new T.Group(), spin = new T.Group(); anchor.add(tilt); tilt.add(spin); tilt.rotation.z = sunData.tilt * DEG;
  const mat = new T.ShaderMaterial({ uniforms: { time: { value: 0 } }, vertexShader: SUN_VERT, fragmentShader: SUN_FRAG });
  const surface = new T.Mesh(sphereGeo, mat); surface.scale.setScalar(r); spin.add(surface);
  anchor.add(glowSprite('rgba(255,200,120,0.55)', 'rgba(255,140,40,0.18)', r * 3.2, 1));
  anchor.add(glowSprite('rgba(255,170,80,0.12)', 'rgba(255,120,30,0.05)', r * 7, 1));
  const hit = new T.Mesh(lowGeo, new T.MeshBasicMaterial({ visible: false })); hit.scale.setScalar(r * 1.05); anchor.add(hit);
  return { p: sunData, r, anchor, tilt, spin, surface, hit, isSun: true, particles: null, hiRes: true };
}

/* ───────── Background · 背景 ───────── */
export function buildStars() {
  const n = 9000, pos = new Float32Array(n * 3), col = new Float32Array(n * 3), c = new T.Color();
  const tilt = new T.Matrix4().makeRotationX(1.05).multiply(new T.Matrix4().makeRotationZ(0.5)), v = new T.Vector3();
  for (let i = 0; i < n; i++) {
    const band = i < n * 0.45; // Milky Way band · 银河带
    const a = Math.random() * Math.PI * 2, y = band ? (Math.random() + Math.random() + Math.random() - 1.5) * 0.18 : 2 * Math.random() - 1, rr = Math.sqrt(1 - y * y);
    v.set(Math.cos(a) * rr, y, Math.sin(a) * rr).applyMatrix4(band ? tilt : new T.Matrix4()).multiplyScalar(1800 + Math.random() * 900);
    pos.set([v.x, v.y, v.z], i * 3);
    const t = Math.random(); c.setHSL(t < 0.2 ? 0.08 : t < 0.35 ? 0.6 : 0.62, t < 0.35 ? 0.6 : 0.15, band ? 0.55 + Math.random() * 0.2 : 0.7 + Math.random() * 0.3);
    col.set([c.r, c.g, c.b], i * 3);
  }
  const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(pos, 3)); geo.setAttribute('color', new T.BufferAttribute(col, 3));
  return new T.Points(geo, new T.PointsMaterial({ size: 1.6, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0.85, depthWrite: false }));
}

export function buildAsteroidBelt(inner, outer, n = 4000) {
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, rr = inner + (outer - inner) * (0.5 + (Math.random() - 0.5) * (Math.random() + 0.3));
    pos.set([Math.cos(a) * rr, (Math.random() - 0.5) * 1.2, Math.sin(a) * rr], i * 3);
  }
  const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(pos, 3));
  return new T.Points(geo, new T.PointsMaterial({ color: '#8c8478', size: 1.3, sizeAttenuation: false, transparent: true, opacity: 0.5, depthWrite: false }));
}

export function orbitLine(radius, color = '#3b5870') {
  const pts = Array.from({ length: 361 }, (_, k) => new T.Vector3(Math.cos(k / 360 * Math.PI * 2) * radius, 0, Math.sin(k / 360 * Math.PI * 2) * radius));
  return new T.Line(new T.BufferGeometry().setFromPoints(pts), new T.LineBasicMaterial({ color, transparent: true, opacity: 0.3, depthWrite: false }));
}
