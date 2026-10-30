// Seeded 3D value noise + fractal Brownian motion (fbm).
// Sampling on the unit sphere (x, y, z) gives seamless planet textures with no pole pinching.
export function makeNoise(seed = 1) {
  let s = seed >>> 0 || 1;
  const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const perm = new Uint8Array(512);
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const vals = new Float32Array(256);
  for (let i = 0; i < 256; i++) vals[i] = rnd();
  const h = (a, b, c) => vals[perm[perm[perm[a] + b] + c]];
  const fade = t => t * t * (3 - 2 * t);
  const lerp = (a, b, t) => a + (b - a) * t;

  function noise(x, y, z) {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    const X = xi & 255, Y = yi & 255, Z = zi & 255;
    const u = fade(x - xi), v = fade(y - yi), w = fade(z - zi);
    return lerp(
      lerp(lerp(h(X, Y, Z), h(X + 1, Y, Z), u), lerp(h(X, Y + 1, Z), h(X + 1, Y + 1, Z), u), v),
      lerp(lerp(h(X, Y, Z + 1), h(X + 1, Y, Z + 1), u), lerp(h(X, Y + 1, Z + 1), h(X + 1, Y + 1, Z + 1), u), v),
      w);
  }
  function fbm(x, y, z, octaves = 5, lacunarity = 2.03, gain = 0.5) {
    let amp = 0.5, freq = 1, sum = 0, norm = 0;
    for (let i = 0; i < octaves; i++) {
      sum += amp * noise(x * freq + i * 17.1, y * freq, z * freq);
      norm += amp; amp *= gain; freq *= lacunarity;
    }
    return sum / norm;
  }
  return { noise, fbm, rnd };
}
