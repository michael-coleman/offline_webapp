/** 
 * @fileoverview service worker
 *
 * This service worker has control over any URI beginning with:
 *
 *     prog_webapp_talk/
 *      
 * Resources:
 * https://bitsofco.de/the-service-worker-lifecycle/
 */

var cache_name = "v1";
var cache_files = [
	'01-intro.html',
	'02-technologies.html',
	'03-technologies-related.html',
	'CSS/crispy.css',
	'CSS/style.css',
	'fonts/Oswald/Oswald-Bold.ttf',
	'images/browser.jpg',
	'images/road_landscape.jpg',
	'./js/crispy.js',
	'./js/index.js',
	'templates/nav.html',
	'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/fonts/fontawesome-webfont.woff2?v=4.7.0',
	'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css',
];
 

self.addEventListener('install', function(event) {
	console.log( '[* installing...]' );
	 
	event.waitUntil(
		caches.open(cache_name).then(function(cache) {
			console.log('[* Caching files in cache], again...');
			return cache.addAll(cache_files);
		})
	);
});


// TODO: If the cache_name has been updated, update the cache
self.addEventListener('activate', function(event) {
	 
	console.log( '[* ServiceWorker activating - only runs if overtaking old worker?] should update cache here...' );
	 
	event.waitUntil(
		caches.keys().then(function(cache_name) {
		})
	);
});

self.addEventListener('fetch', function(event) {
	 
	event.respondWith(
		caches.open(cache_name).then(function(cache) {
			 
			console.log( '[* Handling request for:] ' + event.request.url);
			 
			// TODO: try using a .catch to make this more readable?
			return cache.match(event.request).then(function(response) {
				if (response) {
					return response;
				} else {
					console.log( '[Error Handling request for: ', 
					                                     event.request.url);
					return Promise.reject('doh, object not in sw cache');
				}
			});
		})
	);
});

