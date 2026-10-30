// ─────────────────────────────────────────────────────────────────────────────
// Solar System data · 太阳系资料
// Every body the app shows is defined here. Sizes are TRUE relative sizes
// (mean radius in km); distances are compressed so the whole system fits.
// Team: edit facts/text here; the 3D look lives in textures.js and bodies.js.
// 小组：文字与数据在这里修改；外观在 textures.js 与 bodies.js。
// ─────────────────────────────────────────────────────────────────────────────

export const EARTH_RADIUS_KM = 6371;
export const UNITS_PER_EARTH_RADIUS = 0.2;           // 1 Earth radius = 0.2 scene units
export const radiusUnits = km => km / EARTH_RADIUS_KM * UNITS_PER_EARTH_RADIUS;
// Compressed orbit radius (scene units) from the real distance in AU.
export const orbitUnits = au => 26 + 14 * Math.sqrt(au);

// facts: [label EN, label 中文, value EN, value 中文]
export const SUN = {
  id: 'sun', en: 'SUN', zh: '太阳', es: 'SOL', type: ['Star · G-type', '恒星 · G 型'], color: '#ffc45c',
  radiusKm: 695700, tilt: 7.25, rotationHours: 609.1,
  facts: [
    ['Diameter', '直径', '1,392,700 km · 109 Earths', '1,392,700 千米 · 109 个地球'],
    ['Mass', '质量', '333,000 Earths', '33.3 万个地球'],
    ['Surface', '表面温度', '~5,500 °C', '约 5,500 °C'],
    ['Core', '核心温度', '~15 million °C', '约 1,500 万 °C'],
    ['Age', '年龄', '~4.6 billion years', '约 46 亿年'],
    ['Light to Earth', '光到地球', '8 min 20 s', '8 分 20 秒'],
  ],
  descEn: 'Our star holds about 99.8% of all the mass in the Solar System. It shines by fusing hydrogen into helium in its core.',
  descZh: '太阳集中了太阳系约 99.8% 的质量，依靠核心的氢聚变为氦而发光。',
  featureEn: 'Shown at true size: about 109 Earths would fit across its face.',
  featureZh: '按真实比例显示：太阳的直径约等于 109 个地球并排。',
};

export const PLANETS = [
  {
    id: 'mercury', en: 'MERCURY', zh: '水星', es: 'MERCURIO', type: ['Terrestrial', '类地行星'], color: '#a9a19a',
    radiusKm: 2439.7, au: 0.387, periodDays: 88, rotationHours: 1407.6, tilt: 0.03,
    facts: [
      ['Diameter', '直径', '4,879 km · 0.38 Earth', '4,879 千米 · 0.38 地球'],
      ['From the Sun', '距太阳', '58 million km · 0.39 AU', '5,800 万千米 · 0.39 AU'],
      ['One year', '公转周期', '88 days', '88 天'],
      ['One spin', '自转周期', '58.6 Earth days', '58.6 地球日'],
      ['Moons', '卫星', '0', '0'],
      ['Temperature', '温度', '−180 to 430 °C', '−180 至 430 °C'],
    ],
    descEn: 'The smallest planet and the closest to the Sun. Its surface is covered in impact craters, and with almost no atmosphere its days are scorching and its nights freezing.',
    descZh: '最小、距离太阳最近的行星，表面遍布撞击坑。几乎没有大气，因此白天酷热、夜晚严寒。',
    featureEn: 'Look for overlapping craters and bright ray systems.',
    featureZh: '观察重点：层层叠叠的撞击坑与明亮的辐射纹。',
  },
  {
    id: 'venus', en: 'VENUS', zh: '金星', es: 'VENUS', type: ['Terrestrial', '类地行星'], color: '#e3c58e',
    radiusKm: 6051.8, au: 0.723, periodDays: 224.7, rotationHours: -5832.5, tilt: 177.4,
    facts: [
      ['Diameter', '直径', '12,104 km · 0.95 Earth', '12,104 千米 · 0.95 地球'],
      ['From the Sun', '距太阳', '108 million km · 0.72 AU', '1.08 亿千米 · 0.72 AU'],
      ['One year', '公转周期', '225 days', '225 天'],
      ['One spin', '自转周期', '243 days (backwards)', '243 天（逆向）'],
      ['Moons', '卫星', '0', '0'],
      ['Surface', '表面温度', '~465 °C', '约 465 °C'],
    ],
    descEn: 'Wrapped in thick carbon-dioxide air and sulfuric-acid clouds, Venus traps heat so well that it is the hottest planet, even hotter than Mercury.',
    descZh: '浓密的二氧化碳大气与硫酸云层让金星强烈保温，成为太阳系最热的行星，甚至比水星更热。',
    featureEn: 'Look for the swirling, cream-coloured cloud deck and its thick glowing haze.',
    featureZh: '观察重点：奶黄色的旋涡云层与厚厚的大气辉光。',
  },
  {
    id: 'earth', en: 'EARTH', zh: '地球', es: 'TIERRA', type: ['Terrestrial', '类地行星'], color: '#4aa8ef',
    radiusKm: 6371, au: 1, periodDays: 365.25, rotationHours: 23.93, tilt: 23.44,
    facts: [
      ['Diameter', '直径', '12,742 km', '12,742 千米'],
      ['From the Sun', '距太阳', '150 million km · 1 AU', '1.5 亿千米 · 1 AU'],
      ['One year', '公转周期', '365.25 days', '365.25 天'],
      ['One spin', '自转周期', '23 h 56 min', '23 小时 56 分'],
      ['Moons', '卫星', '1', '1'],
      ['Surface water', '海洋覆盖', '~71%', '约 71%'],
    ],
    descEn: 'Our home is the only world known to host life. Liquid oceans cover about 71% of its surface; continents, clouds and a thin blue atmosphere complete it.',
    descZh: '我们的家园，也是目前唯一已知存在生命的星球。液态海洋覆盖约 71% 的表面，陆地、云层与蓝色大气共同构成这个蔚蓝世界。',
    featureEn: 'Look for oceans that shine in sunlight, green and desert continents, clouds and polar ice.',
    featureZh: '观察重点：反射阳光的海洋、绿色与荒漠大陆、云层与极地冰盖。',
  },
  {
    id: 'mars', en: 'MARS', zh: '火星', es: 'MARTE', type: ['Terrestrial', '类地行星'], color: '#cf7048',
    radiusKm: 3389.5, au: 1.524, periodDays: 687, rotationHours: 24.62, tilt: 25.19,
    facts: [
      ['Diameter', '直径', '6,779 km · 0.53 Earth', '6,779 千米 · 0.53 地球'],
      ['From the Sun', '距太阳', '228 million km · 1.52 AU', '2.28 亿千米 · 1.52 AU'],
      ['One year', '公转周期', '687 days', '687 天'],
      ['One spin', '自转周期', '24 h 37 min', '24 小时 37 分'],
      ['Moons', '卫星', '2 · Phobos, Deimos', '2 · 火卫一、火卫二'],
      ['Average', '平均温度', '~−60 °C', '约 −60 °C'],
    ],
    descEn: 'Iron oxide (rust) gives Mars its red colour. It has a thin atmosphere, polar ice caps, the giant canyon Valles Marineris and Olympus Mons, the tallest volcano in the Solar System.',
    descZh: '铁氧化物赋予火星红色。它拥有稀薄的大气、极地冰盖、巨大的水手号峡谷，以及太阳系最高的火山奥林匹斯山。',
    featureEn: 'Look for the dark canyon near the equator, the volcano Olympus Mons and the white polar caps.',
    featureZh: '观察重点：赤道附近的深色峡谷、奥林匹斯火山与白色极冠。',
  },
  {
    id: 'jupiter', en: 'JUPITER', zh: '木星', es: 'JÚPITER', type: ['Gas giant', '气态巨行星'], color: '#d3ab83',
    radiusKm: 69911, au: 5.203, periodDays: 4333, rotationHours: 9.93, tilt: 3.13,
    facts: [
      ['Diameter', '直径', '139,820 km · 11 Earths', '139,820 千米 · 11 个地球'],
      ['From the Sun', '距太阳', '778 million km · 5.2 AU', '7.78 亿千米 · 5.2 AU'],
      ['One year', '公转周期', '11.9 years', '11.9 年'],
      ['One spin', '自转周期', '9 h 56 min', '9 小时 56 分'],
      ['Moons', '卫星', '101 (as of 2026)', '101 颗（截至 2026 年）'],
      ['Made of', '主要成分', '~90% hydrogen · 10% helium', '约 90% 氢 · 10% 氦'],
    ],
    descEn: 'The largest planet: more than 1,300 Earths would fit inside it. Its striped clouds of ammonia race around in alternating belts and zones.',
    descZh: '太阳系最大的行星，内部可容纳 1,300 多个地球。氨云构成明暗相间的云带，在高速气流中环绕行星。',
    featureEn: 'Look for the Great Red Spot, a storm wider than Earth that has raged for centuries.',
    featureZh: '观察重点：大红斑——一场比地球还宽、持续了数百年的巨型风暴。',
  },
  {
    id: 'saturn', en: 'SATURN', zh: '土星', es: 'SATURNO', type: ['Gas giant', '气态巨行星'], color: '#e4cc9b',
    radiusKm: 58232, au: 9.537, periodDays: 10759, rotationHours: 10.66, tilt: 26.73,
    facts: [
      ['Diameter', '直径', '116,460 km · 9.1 Earths', '116,460 千米 · 9.1 个地球'],
      ['From the Sun', '距太阳', '1.43 billion km · 9.5 AU', '14.3 亿千米 · 9.5 AU'],
      ['One year', '公转周期', '29.4 years', '29.4 年'],
      ['One spin', '自转周期', '10 h 33 min', '10 小时 33 分'],
      ['Moons', '卫星', '274 (confirmed 2025)', '274 颗（2025 年确认）'],
      ['Density', '密度', '0.69 g/cm³ · less than water', '0.69 g/cm³ · 比水还轻'],
    ],
    descEn: 'Saturn’s rings stretch about 280,000 km across yet are mostly only about 10 m thick, made of ice and rock. It is the only planet less dense than water.',
    descZh: '土星环宽约 28 万千米，但大部分只有约 10 米厚，由冰块和岩石组成。它是唯一密度比水还低的行星。',
    featureEn: 'Look for the dark Cassini Division in the rings and the hexagon-shaped storm at the north pole.',
    featureZh: '观察重点：光环中的卡西尼环缝，以及北极的六边形风暴。',
  },
  {
    id: 'uranus', en: 'URANUS', zh: '天王星', es: 'URANO', type: ['Ice giant', '冰巨星'], color: '#9fdbe2',
    radiusKm: 25362, au: 19.19, periodDays: 30687, rotationHours: -17.24, tilt: 97.77,
    facts: [
      ['Diameter', '直径', '50,724 km · 4 Earths', '50,724 千米 · 4 个地球'],
      ['From the Sun', '距太阳', '2.9 billion km · 19.2 AU', '29 亿千米 · 19.2 AU'],
      ['One year', '公转周期', '84 years', '84 年'],
      ['One spin', '自转周期', '17 h 14 min (backwards)', '17 小时 14 分（逆向）'],
      ['Moons', '卫星', '28 (+1 pending)', '28 颗（另 1 颗待确认）'],
      ['Tilt', '自转轴倾角', '~98°', '约 98°'],
    ],
    descEn: 'Methane gives Uranus its pale cyan colour. Tipped over by about 98°, it rolls around the Sun on its side, so each pole gets about 42 years of sunlight and then 42 years of night.',
    descZh: '甲烷使天王星呈淡青色。它的自转轴倾斜约 98°，几乎侧躺着绕太阳运行，每个极地经历约 42 年白昼与 42 年黑夜。',
    featureEn: 'Look for its faint, almost vertical rings.',
    featureZh: '观察重点：几乎竖立的暗淡光环。',
  },
  {
    id: 'neptune', en: 'NEPTUNE', zh: '海王星', es: 'NEPTUNO', type: ['Ice giant', '冰巨星'], color: '#4a72e2',
    radiusKm: 24622, au: 30.07, periodDays: 60190, rotationHours: 16.11, tilt: 28.32,
    facts: [
      ['Diameter', '直径', '49,244 km · 3.9 Earths', '49,244 千米 · 3.9 个地球'],
      ['From the Sun', '距太阳', '4.5 billion km · 30 AU', '45 亿千米 · 30 AU'],
      ['One year', '公转周期', '165 years', '165 年'],
      ['One spin', '自转周期', '16 h 6 min', '16 小时 6 分'],
      ['Moons', '卫星', '16', '16'],
      ['Winds', '风速', 'up to ~2,000 km/h', '最高约 2,000 千米/时'],
    ],
    descEn: 'The farthest and windiest planet. It was predicted with mathematics and then found in 1846. Its largest moon, Triton, orbits backwards.',
    descZh: '最遥远、风速最快的行星。它先由数学计算预言，1846 年才被观测发现。最大的卫星海卫一逆向公转。',
    featureEn: 'Look for the deep-blue bands, a dark storm spot and bright high-altitude clouds.',
    featureZh: '观察重点：深蓝色云带、暗斑风暴与明亮的高空云。',
  },
];

export const BODIES = [SUN, ...PLANETS];
export const byId = Object.fromEntries(BODIES.map(b => [b.id, b]));

// Names in several languages for voice / text commands · 语音指令用的名称
export const NAMES = {
  sun: ['sun', 'the sun', '太阳', 'sol', 'el sol', 'o sol'],
  mercury: ['mercury', '水星', 'mercurio', 'mercúrio'],
  venus: ['venus', '金星', 'vénus', 'vênus'],
  earth: ['earth', 'the earth', '地球', 'tierra', 'la tierra', 'terra', 'a terra'],
  mars: ['mars', '火星', 'marte'],
  jupiter: ['jupiter', '木星', 'júpiter'],
  saturn: ['saturn', '土星', 'saturno'],
  uranus: ['uranus', '天王星', 'urano', 'úrano'],
  neptune: ['neptune', '海王星', 'neptuno', 'netuno'],
};

// Plain-text facts for the AI guide (kept consistent with the info panel).
export function factsText(id) {
  const b = byId[id];
  if (!b) return 'The Solar System: the Sun and eight planets in order: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune. In this app the sizes are true to scale and the distances are compressed.';
  return [b.en, b.descEn, ...b.facts.map(f => `${f[0]}: ${f[2]}`), b.featureEn].join('\n');
}
