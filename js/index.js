// js for prog web app talk


// test for - service worker - incompatible situations
if ( window.location.hostname !== "localhost" && 
	                                  window.location.protocol !== "http:" ) {
	console.log('window.location.protocol is: ' + window.location.protocol );
	alert('[Warning] https is required for service workers');
}

console.log( 'registering service worker' );
if ('serviceWorker' in navigator) {
	
	// '/' is default, need to limit it to `prog_webapp_talk/` subdirectory
	navigator.serviceWorker.register('service_worker.js', 
		{ scope : '/offline_webapp/' })
	.then(function(registration) {
		 
		console.log('registration ok');
		 
	})
	.catch(function(err) {
		 
		console.log('Error registering service worker', err);
		 
	});
} else {
	console.log('[Notice] serviceworkers not available');
}


// fetch nav sidebar and insert into page
crispy.get('templates/nav.html')
	.then(function(response) {
		document.getElementsByTagName('nav')[0].innerHTML = response;
	})
	.catch(function(err) {
		console.log("error fetching nav template: ", err);
	});
