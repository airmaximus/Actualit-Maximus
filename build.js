import { readFile, writeFile } from 'node:fs/promises';

/* Données de repli = contenu connu (utilisé si un flux est injoignable) */
const FALLBACK = [
  { id:'ia', icon:'📰', title:'Actus IA', sub:"L'essentiel de l'intelligence artificielle", items:[
    { t:"Anthropic rétablit l'accès mondial à Claude Fable 5 et Mythos 5", s:"ia-info.fr",
      b:"Fin juin, les autorités américaines ont levé les restrictions à l'export qui avaient conduit à suspendre Claude Fable 5 et Mythos 5 quelques semaines plus tôt. Anthropic a donc rétabli l'accès mondial aux deux modèles, tout en les assortissant de conditions liées à leur sécurité. L'épisode illustre la tension du moment entre course technologique et contrôle étatique des modèles les plus puissants." },
    { t:"Première attaque de rançongiciel menée entièrement par une IA", s:"Le Monde Informatique",
      b:"Des chercheurs en sécurité (Sysdig) affirment avoir observé la première opération de rançongiciel conduite de bout en bout par un agent d'IA, sans opérateur humain aux commandes. L'agent aurait enchaîné seul les étapes de l'attaque, à une vitesse inédite. Pour les défenseurs, cela marque un cap : il faut désormais anticiper des menaces entièrement automatisées." },
    { t:"L'ONU alerte : l'IA avance plus vite qu'on ne peut l'encadrer", s:"ONU Info",
      b:"Un groupe de 40 chercheurs mandaté par l'Assemblée générale de l'ONU a remis un premier état des lieux mondial de l'IA. Son constat : les capacités progressent plus vite que la science et les gouvernements ne parviennent à les comprendre et à les encadrer. António Guterres a exhorté les États à agir sans attendre, à la veille d'un dialogue mondial sur la gouvernance de l'IA à Genève." },
    { t:"OpenAI soumettra ses prochains modèles à une revue gouvernementale", s:"ia-info.fr",
      b:"OpenAI indique travailler avec le gouvernement américain à un processus formalisé de revue de ses modèles avant publication. La diffusion de son prochain modèle, GPT-5.6, serait limitée à un petit groupe de partenaires approuvés. C'est un signe de plus que la régulation étatique s'installe durablement dans le cycle de développement de l'IA." },
    { t:"Anthropic lance Claude Sonnet 5 et Claude Science", s:"Veille Sécurité IA",
      b:"Anthropic a lancé Claude Sonnet 5, un modèle « médian » offrant des performances proches de son haut de gamme Opus 4.8 pour un coût inférieur, notamment pour le code et la sécurité. L'entreprise a aussi présenté Claude Science, un environnement réunissant recherche bibliographique, notebooks et analyse de données à destination des chercheurs." },
  ]},
  { id:'bourse', icon:'📈', title:'Bourse', sub:"Appuie pour le détail (cours en direct non affichable ici de façon fiable)", items:[
    { t:"Safran", s:"Indicatif au 10 juillet",
      b:"Dernier repère indicatif : autour de 332 € (clôture de la veille voisine de 340 €). Attention : un cours de bourse change en permanence et ne peut pas être affiché en direct de façon fiable dans cette page. Pour le cours exact à l'instant T, demande-le-moi et je te le donne à jour." },
    { t:"CAC 40", s:"Cours en direct sur demande",
      b:"Je n'affiche pas de valeur en direct ici pour ne pas risquer un chiffre erroné (les cours bougent en continu). Demande-moi « cours du CAC 40 » et je te donne le niveau à jour au moment où tu le demandes." },
    { t:"S&P 500", s:"Cours en direct sur demande",
      b:"Même principe : pas de chiffre figé qui pourrait être faux. Demande-moi le niveau du S&P 500 et je te le donne à jour." },
    { t:"Nasdaq", s:"Cours en direct sur demande",
      b:"Demande-moi le niveau du Nasdaq et je te le donne à jour au moment de ta demande." },
    { t:"Nvidia", s:"Cours en direct sur demande",
      b:"Demande-moi le cours de Nvidia et je te le donne à jour." },
    { t:"Apple", s:"Cours en direct sur demande",
      b:"Demande-moi le cours d'Apple et je te le donne à jour." },
  ]},
  { id:'sim', icon:'🎮', title:'Sim — X-Plane / MSFS', sub:"Nouveautés avions, scènes et mises à jour", items:[
    { t:"MSFS 2024 — Sim Update 6 (bêta)", tag:"MSFS", s:"FSElite · 7 juil.",
      b:"La bêta de Sim Update 6 est disponible pour MSFS 2024. Parmi les changements : la fin des inspections extérieures rendues obligatoires en vol libre, la prise en charge des technologies FSR4 et DLSS 4.5, et surtout le retour des 59 « bush trips » du précédent simulateur, portés gratuitement vers MSFS 2024." },
    { t:"MSFS 2024 — « World Update 22 » et « City Update 15 »", tag:"MSFS", s:"FSElite · 4-5 juil.",
      b:"Microsoft a publié gratuitement le World Update 22 consacré aux parcs nationaux américains, avec un relief haute résolution comparable à celui du Grand Canyon. En parallèle, le City Update 15 ajoute plusieurs villes du Midwest (Chicago, Minneapolis, Milwaukee…), et un dirigeable Goodyear est offert comme appareil par défaut." },
    { t:"X-Plane 12 — mise à jour 12.4.4 (« SDK Update »)", tag:"X-Plane", s:"FSNews",
      b:"La prochaine grande mise à jour de X-Plane 12 est surtout destinée aux développeurs. Elle apporte une nouvelle API graphique (Panel Graphics, basée sur Vulkan) pour créer des avioniques performantes, des améliorations du radar météo, le CPDLC sur l'Airbus A330 par défaut, et un aéroport de Farnborough retravaillé." },
    { t:"X-Plane 12 — puis 12.5.0 (« Flight Model Update »)", tag:"X-Plane", s:"Simulation Daily",
      b:"Après la SDK Update viendra la 12.5.0, dite « Flight Model Update », prévue pour la fin 2026. Au programme : un modèle de vol enrichi (rotors d'hélicoptères, hydraulique, physique au sol) et un nouvel aéroport « méga » très détaillé, le JFK de New York." },
    { t:"iniBuilds / LatinVFR — A380 et Tristar", s:"FSElite",
      b:"Côté add-ons, LatinVFR a diffusé de nouvelles vidéos de son A380 pour en montrer les fonctionnalités, tandis qu'iniBuilds a annoncé une mise à jour et une extension pour son Tristar (L-1011)." },
  ]},
  { id:'supernote', icon:'🖊️', title:'Supernote Manta', sub:"Micrologiciel, applications et écosystème e-ink", items:[
    { t:"Micrologiciel 3.28 — stylo Calligraphie + application InkHub", s:"eWritable",
      b:"Le micrologiciel 3.28 des Supernote Manta et Nomad ajoute un stylo Calligraphie et l'application InkHub, qui permet de parcourir et télécharger stickers, modèles de pages, notes et croquis partagés par la communauté. Il affine aussi le rendu des traits d'écriture." },
    { t:"Nouvelle application ServerLink (WebDAV)", s:"Changelog Ratta",
      b:"Ratta a introduit l'application ServerLink, qui gère la synchronisation de fichiers, la sauvegarde et l'accès depuis plusieurs appareils via le protocole WebDAV. De quoi compléter, voire remplacer, ta synchronisation actuelle par Dropbox." },
    { t:"Corrections importantes sur Manta", s:"Support Supernote",
      b:"Plusieurs correctifs récents concernent la Manta : la calibration du stylet (problème d'écriture « sans contact ») et un bug de batterie qui chutait brutalement de 20 % à 0 %. Après mise à jour, il est conseillé de recharger à 100 % pour recalibrer la jauge. Certaines versions ont été temporairement suspendues le temps d'un correctif." },
    { t:"Écosystème — Onyx annonce le BOOX Go 6 Gen II", s:"eWritable · 11 juin",
      b:"Du côté de la concurrence e-ink, Onyx a annoncé le BOOX Go 6 Gen II, une petite liseuse abordable prenant en charge l'écriture manuscrite — un segment de plus en plus animé." },
  ]},
  { id:'veille', icon:'🧭', title:'Veille — logiciels type FlightPlanner', sub:"Ce que font les autres outils de vol", items:[
    { t:"Navigraph — mise à jour Charts & avionics (1er juillet)", s:"FSNews",
      b:"Navigraph a annoncé une série de mises à jour de ses cartes et services d'avionique : couverture VFR étendue, informations de routes océaniques et prise en charge de la suite Honeywell Primus Epic 2 dans MSFS 2024, ainsi qu'un changement de calendrier pour les cartes Jeppesen." },
    { t:"SayIntentions AI — trois nouveautés au FlightSimExpo 2026", s:"FSElite",
      b:"SayIntentions AI, le service de contrôle aérien piloté par IA, a présenté trois nouvelles fonctionnalités lors du FlightSimExpo 2026 (et y a reçu un prix de la meilleure annonce). C'est un acteur à suivre de près dans ta veille, d'autant que tu es déjà en contact avec eux." },
    { t:"X-Plane 12.4.4 ouvre une API web (CEF) pour le cockpit", s:"X-PlaneReviews",
      b:"La mise à jour 12.4.4 de X-Plane introduit une API web (basée sur Chromium / CEF) permettant d'embarquer un vrai navigateur dans les avions et plugins. Concrètement, on pourra créer des EFB, des outils de planification de vol et des avioniques en HTML/CSS/JavaScript — une piste directement pertinente pour ton FlightPlanner." },
  ]},
  { id:'cinema', icon:'🎬', title:'Cinéma (France)', sub:"À l'affiche cette semaine (sorties du 8 juillet)", items:[
    { t:"Vaiana (live-action)", s:"Aventure · dès 6 ans",
      b:"Disney sort la version en prises de vues réelles de Vaiana, réalisée par Thomas Kail, avec Dwayne Johnson dans le rôle du demi-dieu Maui. Vaiana s'aventure au-delà du récif de son île pour aider son peuple à retrouver sa prospérité. Le film est attendu comme le gros démarrage de la semaine." },
    { t:"Evil Dead Burn", s:"Épouvante-horreur",
      b:"Nouvel épisode de la saga horrifique, signé Sébastien Vaniček. Après l'enterrement de son mari, Alice rejoint la maison isolée de sa belle-famille pour un dernier repas — jusqu'à ce que la réunion bascule dans l'épouvante, ses proches se transformant l'un après l'autre en créatures démoniaques." },
    { t:"Le Passage", s:"Drame — avec Omar Sy",
      b:"Drame de Brandt Andersen porté par Omar Sy. En Syrie, cinq personnages — une médecin, un soldat, un passeur, un poète, un sauveteur — voient leurs destins s'entremêler au fil d'un périple dangereux sur le chemin de la liberté." },
    { t:"Microstar", s:"Comédie dramatique française",
      b:"Comédie dramatique de Léopold Kraus, portée par Abraham Wapler et Félix Lefebvre. Un influenceur beauté sans grand succès rêve de percer comme comédien et se laisse entraîner dans le milieu doré parisien, où tout semble facile en apparence." },
    { t:"Toujours en tête du box-office", s:"Box-office France",
      b:"Côté fréquentation, Toy Story 5 et Des Minions et des Monstres, sortis un peu avant, continuent de dominer le box-office français et de remplir les salles en cette période estivale." },
  ]},
  { id:'actu', icon:'🌍', title:'Actu générale', sub:"Le tour de l'actualité du jour", items:[
    { t:"Mondial 2026 : les Bleus filent vers la demi-finale", s:"franceinfo",
      b:"En Coupe du monde 2026, l'équipe de France file vers les demi-finales : elle affrontera l'Espagne ou la Belgique le mardi 14 juillet. Kylian Mbappé est notamment revenu sur le pénalty qu'il a manqué lors du match contre le Maroc." },
    { t:"EasyJet retient l'offre d'Apollo (5,7 Mds £)", s:"Euronews",
      b:"La compagnie aérienne EasyJet a retenu l'offre du fonds Apollo, évaluée à 5,7 milliards de livres, de préférence à celle de Castlelake." },
    { t:"Bruxelles vise Instagram et Facebook", s:"Euronews",
      b:"La Commission européenne accuse les plateformes de Meta, Instagram et Facebook, de favoriser des usages addictifs — un dossier de plus dans le bras de fer entre l'Union européenne et les grandes plateformes numériques." },
    { t:"Crédit Agricole défie Apple Pay", s:"Rekto",
      b:"Le Crédit Agricole devient la première banque française à proposer, sur iPhone, une alternative à Apple Pay directement depuis son application. L'argument mis en avant : la souveraineté des données de paiement, et l'économie des commissions versées à Apple." },
    { t:"Marine Le Pen : décision attendue en 2027", s:"franceinfo",
      b:"Sur le plan judiciaire, la décision de la Cour de cassation dans l'affaire concernant Marine Le Pen est désormais attendue pour début avril 2027 « au plus tard »." },
  ]},
  { id:'youtube', icon:'📺', title:'YouTube', type:'video',
    sub:"Appuie sur une vidéo : elle s'ouvre dans YouTube (plein écran, meilleure qualité).",
    items:[
      { id:'nYbarWE8b2U', topic:'X-Plane', title:"X-Plane 12 — présentation de la plateforme (FSExpo 2026)" },
      { id:'Pk3g5TMeVjA', topic:'MSFS', title:"MSFS 2024 — Sim Update 6 bêta est disponible" },
      { id:'TfTEaxbV0pw', topic:'MSFS', title:"MSFS 2024 — Sim Update 6 : le bon, le moins bon, les surprises" },
      { id:'LikrhlACyiI', topic:'DCS', title:"DCS : 2026 and Beyond (vidéo officielle Eagle Dynamics)" },
      { id:'bezwf71ppYA', topic:'DCS', title:"DCS — la campagne dynamique expliquée (2026)" },
      { id:'IrIuM3E3EqU', topic:'DCS', title:"DCS World 2026 — cette mise à jour change plus qu'il n'y paraît" },
      { id:'LTX8C7PzugQ', topic:'SayIntentions', title:"SayIntentions.AI — l'ATC devient bien plus simple" },
      { id:'bk2RCIl5bNM', topic:'SayIntentions', title:"SayIntentions — l'optimiseur gratuit règle MSFS 2024" },
      { id:'RC_DL46K1No', topic:'Navigraph', title:"Navigraph Charts — guide complet (SID & STAR)" },
      { id:'DT0kTcaYv_Q', topic:'Navigraph', title:"Navigraph Charts — créer un plan de vol VFR" },
    ]},
];

/* Sources */
const gnews = (q) => `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=fr&gl=FR&ceid=FR:fr`;
const GNEWS_TOP = `https://news.google.com/rss?hl=fr&gl=FR&ceid=FR:fr`;
const ytFeed = (cid) => `https://www.youtube.com/feeds/videos.xml?channel_id=${cid}`;

const NEWS = {
  ia:        gnews('intelligence artificielle'),
  sim:       gnews('"Microsoft Flight Simulator" OR "X-Plane 12"'),
  supernote: gnews('Supernote liseuse OR e-ink'),
  cinema:    gnews('sorties cinéma semaine'),
  actu:      GNEWS_TOP,
};

/* Chaînes suivies : identifiant direct (cid) quand connu, sinon @handle (résolu au vol) */
const CHANNELS = [
  { name: 'MSFS officiel',      badge: 'MSFS',          cid: 'UCqONzeACDBaF6FfKjh7ndAQ' },
  { name: 'DCS World',          badge: 'DCS',           cid: 'UCoIiSS0lfL7aX4BtbC-YGQA' },
  { name: 'Navigraph',          badge: 'Navigraph',     cid: 'UCSS9LiuWJbP45UfGOiQn6Yw' },
  { name: 'SayIntentions',      badge: 'SayIntentions', handle: 'SayIntentionsAI' },
  { name: 'FlightSimSceneryFR', badge: 'X-Plane',       handle: 'FlightSimSceneryFR' },
  { name: 'Furax84',            badge: 'Sim FR',        handle: 'Furax84' },
  { name: 'Q8Pilot',            badge: 'X-Plane',       handle: 'Q8Pilot' },
  { name: 'Blackbox711',        badge: 'Cockpit',       handle: 'Blackbox711' },
  { name: 'TraaaKe',            badge: 'MSFS',          handle: 'traaake' },
  { name: '0Cage0',             badge: 'DCS',           handle: '0cage023' },
  { name: 'Akula DOF',          badge: 'MSFS',          handle: 'akulaDOF' },
  { name: 'TheFlyingScotsman',  badge: 'X-Plane',       handle: 'theflyingscotsman229' },
];
const PER_CHANNEL = 1; // nb de vidéos récentes par chaîne

function decode(s){
  return String(s)
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, x) => String.fromCharCode(parseInt(x, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim();
}
const stripTags = (s) => String(s).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

function parseNews(xml, n){
  const parts = xml.split('<item>').slice(1);
  const out = [];
  for (const p of parts.slice(0, n)){
    const t   = (p.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
    const src = (p.match(/<source[^>]*>([\s\S]*?)<\/source>/) || [])[1] || '';
    const pd  = (p.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || '';
    let title = decode(stripTags(t));
    const source = decode(stripTags(src));
    if (source && title.endsWith(' - ' + source)) title = title.slice(0, -(source.length + 3)).trim();
    const d = pd ? new Date(pd) : null;
    const ds = (d && !isNaN(d)) ? d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '';
    const s = [source, ds].filter(Boolean).join(' · ');
    if (title) out.push({ t: title, s });
  }
  return out;
}

function parseYouTube(xml, n){
  const parts = xml.split('<entry>').slice(1);
  const out = [];
  for (const p of parts.slice(0, n)){
    const id = (p.match(/<yt:videoId>([\s\S]*?)<\/yt:videoId>/) || [])[1] || '';
    const t  = (p.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
    if (id) out.push({ id: id.trim(), title: decode(stripTags(t)) });
  }
  return out;
}

async function get(url){
  try {
    const r = await fetch(url, { headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      'accept-language': 'fr-FR,fr;q=0.9,en;q=0.6',
      'cookie': 'CONSENT=YES+cb'
    } });
    if (!r.ok) return null;
    return await r.text();
  } catch { return null; }
}

/* Retrouve l'URL du flux RSS d'une chaîne à partir du HTML de sa page */
function extractFeedUrl(html){
  let m = html.match(/https:\/\/www\.youtube\.com\/feeds\/videos\.xml\?channel_id=(UC[\w-]{20,})/);
  if (m) return 'https://www.youtube.com/feeds/videos.xml?channel_id=' + m[1];
  m = html.match(/"externalId":"(UC[\w-]{20,})"/);
  if (m) return 'https://www.youtube.com/feeds/videos.xml?channel_id=' + m[1];
  m = html.match(/\/channel\/(UC[\w-]{20,})/);
  if (m) return 'https://www.youtube.com/feeds/videos.xml?channel_id=' + m[1];
  return null;
}

/* Donne l'URL du flux d'une chaîne : par identifiant direct, ou en résolvant son @handle */
async function channelFeed(ch){
  if (ch.cid) return 'https://www.youtube.com/feeds/videos.xml?channel_id=' + ch.cid;
  const html = await get('https://www.youtube.com/@' + ch.handle);
  if (!html) return null;
  return extractFeedUrl(html);
}

async function main(){
  const sections = JSON.parse(JSON.stringify(FALLBACK));
  const byId = Object.fromEntries(sections.map(s => [s.id, s]));
  let okNews = 0, okCh = 0;

  // Actualités
  for (const [id, url] of Object.entries(NEWS)){
    if (!byId[id]) continue;
    const xml = await get(url);
    if (!xml) continue;
    const items = parseNews(xml, 6);
    if (items.length){ byId[id].items = items; okNews++; }
  }

  // Vidéos : dernières de chaque chaîne suivie (résolution du @handle si besoin)
  const vids = [];
  const seen = new Set();
  for (const ch of CHANNELS) {
    try {
      const feed = await channelFeed(ch);
      if (!feed) continue;
      const xml = await get(feed);
      if (!xml) continue;
      const vs = parseYouTube(xml, PER_CHANNEL);
      let added = 0;
      for (const v of vs) {
        if (v.id && !seen.has(v.id)) {
          seen.add(v.id);
          const t = v.title ? (ch.name + ' — ' + v.title) : ch.name;
          vids.push({ id: v.id, topic: ch.badge, title: t });
          added++;
        }
      }
      if (added) okCh++;
    } catch { /* on continue */ }
  }
  // On ne remplace la sélection de repli que si on a récupéré assez de vidéos fraîches
  if (byId['youtube'] && vids.length >= 3) byId['youtube'].items = vids;

  const tpl = await readFile('template.html', 'utf8');
  const out = tpl.replace('/*__SECTIONS__*/[]', JSON.stringify(sections));
  await writeFile('index.html', out);
  console.log(`index.html généré — actus ${okNews}/${Object.keys(NEWS).length}, chaînes ${okCh}/${CHANNELS.length}, vidéos ${vids.length}`);
}

import { pathToFileURL } from 'node:url';
const isMain = import.meta.url === pathToFileURL(process.argv[1] || '').href;
if (isMain) { try { await main(); } catch (e) { console.error('Erreur build:', e); process.exit(1); } }
export { parseNews, parseYouTube, extractFeedUrl, decode };
