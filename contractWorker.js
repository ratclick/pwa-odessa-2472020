/**
 * ServiceWorker.js
 * --------------------------
 * Cache version, change name to force reload
 */
var CACHE_VERSION = 'v1';


/**
 * Stuff to put in the cache at install
 */
var CACHE_FILES  = [
    '/pwa/index.html',
    '/pwa/contracts.json',
    '/pwa/contracts.html',
    '/pwa/app.css',
];


/**
 * Service worker 'install' event.
 * If all the files are successfully cached, then the service worker will be installed.
 * If any of the files fail to download, then the install step will fail.
 */
this.addEventListener('install', function(event) {
   event.waitUntil(
        caches.open(CACHE_VERSION).then(function(cache) {
            console.log('Installing...');
            return cache.addAll(CACHE_FILES);
        }).catch(function(a) {
            console.log(a);
        })
    ); // waitUntil
});


/**
 * After a service worker is installed and the user navigates to a different page or refreshes,
 * the service worker will begin to receive fetch events.
 *
 * Network-first approach: if online, request is fetched from network and not from cache
 */
this.addEventListener('fetch', function(event) {
    if (event.request.url.includes("/api/")) {
    // response to API requests, Cache Update Refresh strategy
    } else {
    // response to static files requests, Cache-First strategy
        
    }
    event.respondWith(function() {

        var fetchRequest = event.request.clone();
        var cloneRequest = event.request.clone();
        caches.match(cloneRequest).then(function(res){
            // Cache hit - return response
            if(res){
                return res;
            }

            // no response
            return null;
        })
        var res = returnFromServer(fetchRequest);
        if (res) {return res;}


    }());
});


/**
 * If we don't have a matching response, we return the result of a call to fetch,
 * which will make a network request and return the data if anything can be retrieved from the network. 
 */
function returnFromServer(fetchRequest){
    
    // IMPORTANT: Clone the request. A request is a stream and
    // can only be consumed once. Since we are consuming this
    // once by cache and once by the browser for fetch, we need
    // to clone the response.
    
    return fetch(fetchRequest).then(
        function(response) {
            var cloned = fetchRequest.clone()
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
                  return null;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            var responseToCache = response.clone();

            caches.open(CACHE_VERSION)
                .then(function(cache) {
                    cache.put(cloned, responseToCache);
                });

            return response;
        }
    ); // return.fetch().then()

}


// on activate of the service worker we can check for updating the caches
// we can go through older caches and delete the ones updated

self.addEventListener('activate', function(event) {

    var cacheWhitelist = ['pages-cache-v1', 'blog-posts-cache-v1'];
  
    event.waitUntil(
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  });