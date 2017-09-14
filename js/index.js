// js for prog web app talk

// fetch nav sidebar and insert into page
crispy.get('templates/nav.html')
	.then(function(response) {
		document.getElementsByTagName('nav')[0].innerHTML = response;
	})
	.catch(function(err) {
		console.log("error fetching nav template: ", err);
	});
