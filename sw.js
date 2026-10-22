// Change ce numéro quand tu ajoutes ou renommes des fichiers à mettre en cache.
const VERSION = 'v1';
const CACHE = 'atelier-' + VERSION;

const FICHIERS = [
  './',
  'index.html',
  'app.js',
  'manifest.webmanifest',
  'icon-192.png',
  'icon-512.png',
  'icon-maskable-512.png',
];

// Installation : on enregistre les fichiers de base.
self.addEventListener('install', (evenement) => {
  evenement.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FICHIERS)));
  self.skipWaiting();
});

// Activation : on supprime les anciens caches.
self.addEventListener('activate', (evenement) => {
  evenement.waitUntil(
    caches
      .keys()
      .then((noms) =>
        Promise.all(
          noms
            .filter((nom) => nom.startsWith('atelier-') && nom !== CACHE)
            .map((nom) => caches.delete(nom))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Requêtes : réseau d'abord (toujours la dernière version quand tu es en ligne),
// cache en secours quand il n'y a pas de réseau.
self.addEventListener('fetch', (evenement) => {
  const requete = evenement.request;
  if (requete.method !== 'GET') return;
  if (new URL(requete.url).origin !== self.location.origin) return;

  evenement.respondWith(
    fetch(requete)
      .then((reponse) => {
        const copie = reponse.clone();
        caches.open(CACHE).then((cache) => cache.put(requete, copie));
        return reponse;
      })
      .catch(() =>
        caches
          .match(requete, { ignoreSearch: true })
          .then((trouve) => trouve || (requete.mode === 'navigate' ? caches.match('index.html') : undefined))
      )
  );
});
