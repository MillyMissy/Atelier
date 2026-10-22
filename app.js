// --- Console de debug (pour voir les erreurs sans ordinateur) ---
// Ouvre l'appli avec ?debug à la fin de l'adresse pour l'activer.
if (location.search.includes('debug')) {
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/eruda@3.0.1/eruda.min.js';
  s.onload = () => eruda.init();
  document.head.appendChild(s);
}

// --- Affichage de l'état ---
const elReseau = document.getElementById('reseau');
const elHorsLigne = document.getElementById('hors-ligne');
const elInstalle = document.getElementById('installe');
const boutonInstaller = document.getElementById('installer');

function majReseau() {
  elReseau.textContent = navigator.onLine ? 'En ligne' : 'Hors ligne';
}
window.addEventListener('online', majReseau);
window.addEventListener('offline', majReseau);
majReseau();

const modeInstalle =
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true;
elInstalle.textContent = modeInstalle ? 'Oui' : 'Non (navigateur)';

// --- Service worker (mode hors ligne) ---
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('sw.js')
    .then(() => navigator.serviceWorker.ready)
    .then(() => { elHorsLigne.textContent = 'Prêt'; })
    .catch((erreur) => {
      elHorsLigne.textContent = 'Erreur';
      console.error('Service worker :', erreur);
    });
} else {
  elHorsLigne.textContent = 'Non pris en charge';
}

// --- Bouton d'installation (Android / Chrome) ---
let invite = null;
window.addEventListener('beforeinstallprompt', (evenement) => {
  evenement.preventDefault();
  invite = evenement;
  boutonInstaller.hidden = false;
});

boutonInstaller.addEventListener('click', async () => {
  if (!invite) return;
  invite.prompt();
  await invite.userChoice;
  invite = null;
  boutonInstaller.hidden = true;
});

window.addEventListener('appinstalled', () => {
  boutonInstaller.hidden = true;
  elInstalle.textContent = 'Oui';
});
