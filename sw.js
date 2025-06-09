const CACHE_NAME = 'caderneta-gestante-v2';
const urlsToCache = [
  './',
  'index.html',
  'https://i.imgur.com/UdqvWLG.jpeg',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Roboto:wght@300;400;500&display=swap',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js',
  'https://www.gstatic.com/firebasejs/8.10.0/firebase-firestore.js',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  // Estratégia Cache-First com atualização em segundo plano
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retorna do cache se disponível
        if (response) {
          // Atualiza o cache em segundo plano
          fetchAndCache(event.request);
          return response;
        }
        
        // Busca na rede se não estiver no cache
        return fetchAndCache(event.request);
      })
  );
});

function fetchAndCache(request) {
  return fetch(request)
    .then(response => {
      // Verifica se a resposta é válida
      if (!response || response.status !== 200 || response.type !== 'basic') {
        return response;
      }

      // Clona a resposta para armazenar no cache
      const responseToCache = response.clone();
      
      caches.open(CACHE_NAME)
        .then(cache => {
          cache.put(request, responseToCache);
        });

      return response;
    })
    .catch(error => {
      // Fallback para conteúdo offline
      return caches.match('./offline.html') || new Response('Offline');
    });
}

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Remove caches antigos
          if (cacheWhitelist.indexOf(cacheName)
