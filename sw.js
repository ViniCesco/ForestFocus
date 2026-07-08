const CACHE_NAME = "forest-focus-v2";

const ASSETS = [
    "./",
    "./index.html",

    "./assets/css/style.css",

    "./assets/js/dashboard.js",

    "./manifest.json",

    "./assets/img/favicon.png",
    "./assets/img/logo-192.png",
    "./assets/img/logo-512.png"
];

// =======================
// INSTALAÇÃO
// =======================

self.addEventListener("install", event => {

    self.skipWaiting();

    event.waitUntil(

        caches.open(CACHE_NAME)

            .then(cache => cache.addAll(ASSETS))

    );

});

// =======================
// ATIVAÇÃO
// =======================

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys().then(keys =>

            Promise.all(

                keys.map(key => {

                    if (key !== CACHE_NAME) {

                        return caches.delete(key);

                    }

                })

            )

        )

    );

    self.clients.claim();

});

// =======================
// FETCH
// =======================

self.addEventListener("fetch", event => {

    // HTML → sempre pega a versão mais recente

    if (event.request.mode === "navigate") {

        event.respondWith(

            fetch(event.request)

                .catch(() => caches.match("./index.html"))

        );

        return;

    }

    event.respondWith(

        caches.match(event.request)

            .then(response => {

                return response || fetch(event.request);

            })

    );

});