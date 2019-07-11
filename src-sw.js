workbox.precaching.precacheAndRoute(self.__precacheManifest);

workbox.routing.registerRoute(
    /https:\/\/(?:.*)(?:\.bullhornstaffing\.com\/rest\-services\/3rn5us\/find\?query\=)(?:.*)/,
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: "query-cache",
        plugins: [
            new workbox.expiration.Plugin({
                maxEntries: 50,
                maxAgeSeconds:  60 * 60 * 10, //now 10 mins //10 * 86400, // 10 days
                purgeOnQuotaError: true
            })
        ]
    })
);

workbox.routing.registerRoute(
    /https:\/\/(?:.*)(?:\.bullhornstaffing\.com\/rest\-services\/3rn5us\/entity\/)(?:.*)(?:\?fields\=)(?:.*)/,
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: "entity-cache",
        plugins: [
            new workbox.expiration.Plugin({
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 10, // 10 minutes
                purgeOnQuotaError: true
            })
        ]
    })
);