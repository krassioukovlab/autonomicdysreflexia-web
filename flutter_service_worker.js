'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "f708c3a3c343782f6e9267dbe862c3bb",
"assets/assets/data/about_guidelines.md": "362a994ac9d08baee9b1a576cacfc512",
"assets/assets/data/algorithms/management-text.md": "4a51a56ae5544a354c0711be1f0006ea",
"assets/assets/data/algorithms/popups/bp-cutoffs.md": "0abe47d2a259436a64acab1c729ab349",
"assets/assets/data/home.md": "f7725566603336b3448d04cf80cdad19",
"assets/assets/data/pages/about.md": "261dd2c70fecd2ba2767916c5bf873ee",
"assets/assets/data/pages/diagnosis.md": "eafa332879bdff3961bb0247cefcc6c4",
"assets/assets/data/pages/differential-diagnosis.md": "fb5eb1e7933a567aeddd9583feacd64b",
"assets/assets/data/pages/epidemiology.md": "d6db4354c57ae3116322e92b2d4f4061",
"assets/assets/data/pages/history-and-physical.md": "e93a98b5954f668d7876fe358ebfc76b",
"assets/assets/data/pages/management.md": "d969326c1de264cafc69ef330add4ec0",
"assets/assets/data/pages/pharmacology.md": "8cf199f60b44fbd129bd5f9bbcbeb9e0",
"assets/assets/data/pages/primer.md": "08b177ebe7b15f9a39de865c00278471",
"assets/assets/fonts/ABCofADIcons.ttf": "b8976f8d25d71a22f35898526a273dce",
"assets/assets/images/algorithm-for-AD-treatment.png": "a0e8dd9587de77aa26213017e546783d",
"assets/assets/images/blusson-ramp.jpeg": "a64738ad707d458057d69d8ff8885486",
"assets/assets/images/catheter.png": "f604b5f27229f9c7adccd33041beb42e",
"assets/assets/images/causes.png": "7fae6b208d71b554124ba64a03ee227f",
"assets/assets/images/complications.png": "21db546d96364b779c813d013251ef99",
"assets/assets/images/demographics.png": "2eaac505336365cf9e3d4ebfbbb79002",
"assets/assets/images/discomfort.png": "39459e8f7337084d012cc7fac8849009",
"assets/assets/images/flowchart.png": "a7e5ade37d9324b4434994d0b983aa5e",
"assets/assets/images/icon.png": "6379fbac49b141365c4565f9b4e0b605",
"assets/assets/images/sphygomanometer.png": "0135932597f9698ba83870835b0ba43a",
"assets/FontManifest.json": "ef6c8bd855932a8bb415ded38742a2bf",
"assets/fonts/MaterialIcons-Regular.otf": "e7069dfd19b331be16bed984668fe080",
"assets/NOTICES": "b933ca7d536ac9315880a8b6ce998981",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"canvaskit/canvaskit.js": "97937cb4c2c2073c968525a3e08c86a3",
"canvaskit/canvaskit.wasm": "3de12d898ec208a5f31362cc00f09b9e",
"canvaskit/profiling/canvaskit.js": "c21852696bc1cc82e8894d851c01921a",
"canvaskit/profiling/canvaskit.wasm": "371bc4e204443b0d5e774d64a046eb99",
"favicon.png": "4754a2f721af3a401089db1de809dfc5",
"flutter.js": "1cfe996e845b3a8a33f57607e8b09ee4",
"icons/Icon-192.png": "95a515a054fe3e1bf232c9b5f0a4285b",
"icons/Icon-512.png": "b278f296e3d02acc230763cfba0b2b23",
"icons/Icon-maskable-192.png": "95a515a054fe3e1bf232c9b5f0a4285b",
"icons/Icon-maskable-512.png": "b278f296e3d02acc230763cfba0b2b23",
"index.html": "51f1d161257963445e5e0bb844214c32",
"/": "51f1d161257963445e5e0bb844214c32",
"main.dart.js": "261de88d3b795c0e8adb79f35ff331cc",
"manifest.json": "9d89f0fbe8dd760708962293503af633",
"version.json": "bcc26306b673a288cdde8da725b5cf15"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
