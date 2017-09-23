// vim: foldmethod=marker


// test for - service worker - incompatible situations
if ( window.location.hostname !== "localhost" && 
	                                  window.location.protocol !== "https:" ) {
	alert('[NOTICE] https is required for service workers');
}


// Insert a notification box into the page - "ready for offline"
function offline_ready() {
	// create  notification box container
	var notification = document.createElement('div');
	 
	// add styles and content to notification box
	notification.className = "bg-grey-333 pam text-grey-eee";
	notification.style.position = "fixed";
	notification.style.bottom = "10px";
	notification.style.left = "10px";
	notification.style.opacity = "0.85";
	notification.innerHTML = 
	`Service Worker install succeeded, app is offline ready
	                                   <i class="fa fa-window-close mlm"></i>`;
	 
	// event handler to remove box when "close" icon clicked
	notification.firstElementChild.addEventListener('click', function() {
		notification.parentElement.removeChild(notification);
	});
	 
	document.body.appendChild(notification);

}

if ('serviceWorker' in navigator) {
	
	// '/' is default, need to limit it to `prog_webapp_talk/` subdirectory
	navigator.serviceWorker.register('service_worker.js', 
		                                     { scope : '/offline_webapp/' })
	.then(function(registration) {
		 
		// onupdatefound fires ONLY when a new service worker is registered
		registration.onupdatefound = function() {
			
			// get a reference to this new service worker and start tracking
			// its progress
			console.log( 'new service worker found...' );
			var new_sw = registration.installing;
			new_sw.onstatechange = function() {
			
			console.log( 'new sw state is: ' + new_sw.state );
				if (new_sw.state === "installed") {
					offline_ready();
				}
			};
		};
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
	// highlight nav link for current page
	crispy.highlight_active_nav();
	
	})
	.catch(function(err) {
		console.log("error fetching nav template: ", err);
	});
