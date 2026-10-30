// ─────────────────────────────────────────────────────────────────────────────
// Real surface maps · 真实星球贴图 (from the team's realistic version)
// Credits:
//   Earth colour / normal / roughness / clouds: three.js examples, textures/planets
//     https://threejs.org/examples/textures/planets/
//   All other planet colour maps and Saturn's ring: Solar System Scope, CC BY 4.0
//     https://www.solarsystemscope.com/textures/
//   Bump maps are derived from brightness: artistic detail, not scientific elevation.
// If a map is missing or fails to load, that planet keeps its procedural texture
// from textures.js, so the app still works.
// ─────────────────────────────────────────────────────────────────────────────
import * as T from 'three';

export const TEXTURE_FILES = {
  earth: 'earth.jpg', normal: 'normal.jpg', roughness: 'roughness.jpg', clouds: 'clouds.png',
  mercury: 'mercury.jpg', mercuryBump: 'mercuryBump.jpg',
  venus: 'venus.jpg', venusSurface: 'venusSurface.jpg', venusSurfaceBump: 'venusSurfaceBump.jpg',
  mars: 'mars.jpg', marsBump: 'marsBump.jpg',
  jupiter: 'jupiter.jpg', saturn: 'saturn.jpg', saturnRing: 'saturnRing.png',
  uranus: 'uranus.jpg', neptune: 'neptune.jpg',
};
const COLOR = new Set(['earth', 'clouds', 'mercury', 'venus', 'venusSurface', 'mars', 'jupiter', 'saturn', 'saturnRing', 'uranus', 'neptune']);

// Resolves to { key: THREE.Texture } for every map that loaded.
// The single-file build sets window.__ORBIT_TEXTURES to embedded data URLs.
export async function loadMaps(urls = window.__ORBIT_TEXTURES || TEXTURE_FILES) {
  const maps = {};
  await Promise.allSettled(Object.entries(urls).map(async ([key, url]) => {
    const img = new Image(); img.src = url; await img.decode();
    const t = new T.Texture(img); t.colorSpace = COLOR.has(key) ? T.SRGBColorSpace : T.NoColorSpace;
    t.anisotropy = 8; t.needsUpdate = true; maps[key] = t;
  }));
  return maps;
}

// A small canvas copy of a map, used to colour the particle shell.
export function sampleCanvas(texture, w = 1024) {
  const c = document.createElement('canvas'); c.width = w; c.height = w / 2;
  c.getContext('2d', { willReadFrequently: true }).drawImage(texture.image, 0, 0, w, w / 2);
  return c;
}
