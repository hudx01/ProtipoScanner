self.addEventListener('install', (event) => {
    console.log('Service Worker: Instalado');
    event.waitUntil(
        caches.open('scanner-cache').then((cache) => {
            return cache.addAll([
                '/',                  // Página inicial
                '/index.html',        // Arquivo HTML
                '/css/styles.css',    // Estilos
                '/js/app.js',         // Código do app
                '/js/axios.min.js',   // Biblioteca Axios
                '/js/html5-qrcode.min.js', // Biblioteca QR Code
                'https://cdn.jsdelivr.net/npm/html5-qrcode/minified/html5-qrcode.min.js',
                'https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js'
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
