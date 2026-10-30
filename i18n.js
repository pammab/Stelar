// ─────────────────────────────────────────────────────────────────────────────
// Languages · 语言 · Idiomas — English, 中文, Español
// Every piece of text is written as bi(en, zh, es). When the Spanish is not given,
// it is looked up here by its English text. To fix a translation, edit ES below.
// ─────────────────────────────────────────────────────────────────────────────
export const LANGS = { en: 'English', zh: '中文', es: 'Español' };
const VOICE = { en: 'en-US', zh: 'zh-CN', es: 'es-ES' };

export const ES = {
  // Header, intro, panels
  'Resume Orbits': 'Reanudar órbitas', 'Pause Orbits': 'Pausar órbitas', 'Enable Gestures': 'Activar gestos', 'Disable Gestures': 'Desactivar gestos',
  'Loading…': 'Cargando…', 'Starting camera…': 'Iniciando cámara…',
  'True sizes, side by side.': 'Tamaños reales, uno al lado del otro.',
  'The Sun is 109 times wider than Earth. Jupiter is 11 times wider. Mercury is smaller than some moons.': 'El Sol es 109 veces más ancho que la Tierra. Júpiter es 11 veces más ancho. Mercurio es más pequeño que algunas lunas.',
  'Among the worlds.': 'Entre los mundos.',
  'Eight worlds and their star, shown at their true sizes. Select a planet, use your hands, or just ask.': 'Ocho mundos y su estrella, a su tamaño real. Elige un planeta, usa tus manos o simplemente pregunta.',
  'Tint · keeps surface detail': 'Tono · conserva el detalle', 'Particle glow': 'Brillo de partículas', 'Particle spread': 'Dispersión de partículas', 'Open palm / fist': 'Palma abierta / puño',
  'View': 'Vista', 'Show clouds': 'Ver nubes', 'Radar surface': 'Superficie por radar', 'Pause spin': 'Pausar rotación', 'Resume spin': 'Reanudar rotación', 'Reset look': 'Restaurar aspecto',
  'Show one hand to the camera': 'Muestra una mano a la cámara',
  // Body types and fact labels
  'Star · G-type': 'Estrella · tipo G', 'Terrestrial': 'Planeta rocoso', 'Gas giant': 'Gigante gaseoso', 'Ice giant': 'Gigante de hielo',
  'Diameter': 'Diámetro', 'Mass': 'Masa', 'Surface': 'Superficie', 'Core': 'Núcleo', 'Age': 'Edad', 'Light to Earth': 'Luz hasta la Tierra',
  'From the Sun': 'Distancia al Sol', 'One year': 'Un año', 'One spin': 'Una rotación', 'Moons': 'Lunas', 'Temperature': 'Temperatura',
  'Surface water': 'Agua en superficie', 'Average': 'Media', 'Made of': 'Composición', 'Density': 'Densidad', 'Tilt': 'Inclinación', 'Winds': 'Vientos',
  // Fact values
  '1,392,700 km · 109 Earths': '1.392.700 km · 109 Tierras', '333,000 Earths': '333.000 Tierras', '~5,500 °C': '~5.500 °C', '~15 million °C': '~15 millones de °C', '~4.6 billion years': '~4.600 millones de años',
  '4,879 km · 0.38 Earth': '4.879 km · 0,38 Tierras', '58 million km · 0.39 AU': '58 millones de km · 0,39 UA', '88 days': '88 días', '58.6 Earth days': '58,6 días terrestres', '−180 to 430 °C': '−180 a 430 °C',
  '12,104 km · 0.95 Earth': '12.104 km · 0,95 Tierras', '108 million km · 0.72 AU': '108 millones de km · 0,72 UA', '225 days': '225 días', '243 days (backwards)': '243 días (al revés)',
  '12,742 km': '12.742 km', '150 million km · 1 AU': '150 millones de km · 1 UA', '365.25 days': '365,25 días',
  '6,779 km · 0.53 Earth': '6.779 km · 0,53 Tierras', '228 million km · 1.52 AU': '228 millones de km · 1,52 UA', '687 days': '687 días', '2 · Phobos, Deimos': '2 · Fobos, Deimos',
  '139,820 km · 11 Earths': '139.820 km · 11 Tierras', '778 million km · 5.2 AU': '778 millones de km · 5,2 UA', '11.9 years': '11,9 años', '101 (as of 2026)': '101 (en 2026)', '~90% hydrogen · 10% helium': '~90 % hidrógeno · 10 % helio',
  '116,460 km · 9.1 Earths': '116.460 km · 9,1 Tierras', '1.43 billion km · 9.5 AU': '1.430 millones de km · 9,5 UA', '29.4 years': '29,4 años', '274 (confirmed 2025)': '274 (confirmadas en 2025)', '0.69 g/cm³ · less than water': '0,69 g/cm³ · menos que el agua',
  '50,724 km · 4 Earths': '50.724 km · 4 Tierras', '2.9 billion km · 19.2 AU': '2.900 millones de km · 19,2 UA', '84 years': '84 años', '17 h 14 min (backwards)': '17 h 14 min (al revés)', '28 (+1 pending)': '28 (+1 por confirmar)',
  '49,244 km · 3.9 Earths': '49.244 km · 3,9 Tierras', '4.5 billion km · 30 AU': '4.500 millones de km · 30 UA', '165 years': '165 años', 'up to ~2,000 km/h': 'hasta ~2.000 km/h',
  // Descriptions
  'Our star holds about 99.8% of all the mass in the Solar System. It shines by fusing hydrogen into helium in its core.': 'Nuestra estrella reúne cerca del 99,8 % de toda la masa del sistema solar. Brilla fusionando hidrógeno en helio en su núcleo.',
  'Shown at true size: about 109 Earths would fit across its face.': 'A tamaño real: cabrían unas 109 Tierras a lo ancho de su disco.',
  'The smallest planet and the closest to the Sun. Its surface is covered in impact craters, and with almost no atmosphere its days are scorching and its nights freezing.': 'El planeta más pequeño y el más cercano al Sol. Su superficie está cubierta de cráteres y, casi sin atmósfera, sus días son abrasadores y sus noches heladas.',
  'Look for overlapping craters and bright ray systems.': 'Busca cráteres superpuestos y brillantes sistemas de rayos.',
  'Wrapped in thick carbon-dioxide air and sulfuric-acid clouds, Venus traps heat so well that it is the hottest planet, even hotter than Mercury.': 'Envuelto en un aire denso de dióxido de carbono y nubes de ácido sulfúrico, Venus atrapa tanto calor que es el planeta más caliente, incluso más que Mercurio.',
  'Look for the swirling, cream-coloured cloud deck and its thick glowing haze.': 'Busca su capa de nubes color crema en remolinos y su espesa neblina brillante.',
  'Our home is the only world known to host life. Liquid oceans cover about 71% of its surface; continents, clouds and a thin blue atmosphere complete it.': 'Nuestro hogar es el único mundo conocido con vida. Los océanos cubren cerca del 71 % de su superficie; continentes, nubes y una fina atmósfera azul lo completan.',
  'Look for oceans that shine in sunlight, green and desert continents, clouds and polar ice.': 'Busca océanos que brillan al sol, continentes verdes y desérticos, nubes y hielo polar.',
  'Iron oxide (rust) gives Mars its red colour. It has a thin atmosphere, polar ice caps, the giant canyon Valles Marineris and Olympus Mons, the tallest volcano in the Solar System.': 'El óxido de hierro (herrumbre) da a Marte su color rojo. Tiene una atmósfera fina, casquetes polares, el enorme cañón Valles Marineris y el Monte Olimpo, el volcán más alto del sistema solar.',
  'Look for the dark canyon near the equator, the volcano Olympus Mons and the white polar caps.': 'Busca el cañón oscuro cerca del ecuador, el volcán Monte Olimpo y los casquetes polares blancos.',
  'The largest planet: more than 1,300 Earths would fit inside it. Its striped clouds of ammonia race around in alternating belts and zones.': 'El planeta más grande: dentro cabrían más de 1.300 Tierras. Sus nubes de amoníaco forman franjas que giran en cinturones y zonas alternas.',
  'Look for the Great Red Spot, a storm wider than Earth that has raged for centuries.': 'Busca la Gran Mancha Roja, una tormenta más ancha que la Tierra que dura desde hace siglos.',
  'Saturn’s rings stretch about 280,000 km across yet are mostly only about 10 m thick, made of ice and rock. It is the only planet less dense than water.': 'Los anillos de Saturno miden unos 280.000 km de ancho, pero casi todos tienen solo unos 10 m de grosor y son de hielo y roca. Es el único planeta menos denso que el agua.',
  'Look for the dark Cassini Division in the rings and the hexagon-shaped storm at the north pole.': 'Busca la oscura División de Cassini en los anillos y la tormenta hexagonal del polo norte.',
  'Methane gives Uranus its pale cyan colour. Tipped over by about 98°, it rolls around the Sun on its side, so each pole gets about 42 years of sunlight and then 42 years of night.': 'El metano da a Urano su color cian pálido. Inclinado unos 98°, gira alrededor del Sol de costado: cada polo tiene unos 42 años de luz y luego 42 de noche.',
  'Look for its faint, almost vertical rings.': 'Busca sus tenues anillos, casi verticales.',
  'The farthest and windiest planet. It was predicted with mathematics and then found in 1846. Its largest moon, Triton, orbits backwards.': 'El planeta más lejano y con más viento. Se predijo con matemáticas y se descubrió en 1846. Su luna mayor, Tritón, gira al revés.',
  'Look for the deep-blue bands, a dark storm spot and bright high-altitude clouds.': 'Busca sus franjas azul intenso, una mancha oscura de tormenta y nubes altas brillantes.',
  // Chat
  'Too many questions at once. Wait a few seconds and try again.': 'Demasiadas preguntas seguidas. Espera unos segundos y vuelve a intentarlo.',
  'The AI guide is not set up yet: the server has no API key.': 'El guía de IA aún no está configurado: falta la clave de la API en el servidor.',
  'The AI guide needs the Stelar server. Run "npm start", or open the online version.': 'El guía de IA necesita el servidor de Stelar. Ejecuta "npm start" o abre la versión en línea.',
  'The AI is busy right now. Please try again.': 'La IA está ocupada. Inténtalo de nuevo.',
  'Something went wrong with that message. Please try again.': 'Algo falló con ese mensaje. Inténtalo de nuevo.',
  'Microphone access is blocked. Allow it in the address bar, then try again.': 'El micrófono está bloqueado. Permítelo en la barra de direcciones y vuelve a intentarlo.',
  'Voice input needs Chrome or Edge. You can still type.': 'La voz necesita Chrome o Edge. Puedes seguir escribiendo.',
  'The speech service could not be reached. Check the connection.': 'No se pudo conectar con el servicio de voz. Revisa la conexión.',
  'No microphone was found.': 'No se encontró ningún micrófono.',
  'Tell me a fun fact': 'Cuéntame un dato curioso', 'Could humans live there?': '¿Podrían vivir personas allí?', 'How big is it compared to Earth?': '¿Qué tamaño tiene comparado con la Tierra?',
  'Which planet is the hottest?': '¿Qué planeta es el más caliente?', 'Why do planets orbit the Sun?': '¿Por qué los planetas giran alrededor del Sol?', 'Line up the planets': 'Alinea los planetas',
  'Talking about · the Solar System': 'Hablando de · el sistema solar',
  "Hi! I'm Stelar, your space guide. Ask me anything, type or press the mic and talk. Try “Go to Saturn”.": '¡Hola! Soy Stelar, tu guía espacial. Pregúntame lo que quieras: escribe o pulsa el micrófono y habla. Prueba «Ve a Saturno».',
};

// Fallback for text not in the dictionary: translate common units, keep the rest.
export function esText(en) {
  en = String(en);
  if (ES[en]) return ES[en];
  return en.replace(/(\d)\.(\d)/g, '$1,$2').replace(/ Earths?\b/g, ' Tierras').replace(/\bdays\b/g, 'días').replace(/\byears\b/g, 'años');
}
window.ES = ES; window.esText = esText;

const listeners = new Set();
export const onLanguage = fn => { listeners.add(fn); return fn; };
export const getLanguage = () => document.documentElement.dataset.lang || 'en';
export const voiceCode = (l = getLanguage()) => VOICE[l] || 'en-US';
export function setLanguage(l) {
  if (!LANGS[l]) l = 'en';
  const root = document.documentElement; root.dataset.lang = l; root.lang = l === 'zh' ? 'zh-CN' : l;
  document.title = { en: 'ORBIT · Solar System Explorer', zh: 'ORBIT · 太阳系交互探索', es: 'ORBIT · Explorador del sistema solar' }[l];
  try { localStorage.setItem('orbit-lang', l); } catch {}
  const sel = document.querySelector('#language'); if (sel) sel.value = l;
  listeners.forEach(fn => fn(l));
}
export function initialLanguage() {
  let saved = null; try { saved = localStorage.getItem('orbit-lang'); } catch {}
  if (LANGS[saved]) return saved;
  const n = (navigator.language || 'en').toLowerCase();
  return n.startsWith('zh') ? 'zh' : n.startsWith('es') ? 'es' : 'en';
}
