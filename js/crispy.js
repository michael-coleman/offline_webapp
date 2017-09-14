// vim: foldmethod=marker

/** 
 * Commenting
 * this code is commented in the JSDoc 3 style, see
 * http://usejsdoc.org/
 */

var crispy = {};            // define crispy namespace

/**
 * crispy plugins / components
 * ---------------------------
 */
/** popover    {{{
 *---------------------------------
 * This pattern kind of sets up this popover code as a "plugin" loaded on
 * to the `crispy` namespace as an object.
 * NOTE: this pattern returns an object which is not needed for the popover
 * plugin as the plugin doesn't need an ongoing API, but it is being used here 
 * to provide a basic example template - that is robust/scalable - that can be
 * used by other "plugins" that do need an ongoing API.
 * }}} */
crispy.popover = (function() {       // {{{
	 
	/** TODO using an id for the attachee element, means there can only be one
	 * element with the id='tw-popover'.
	 * This also raises the question whether this overall code in general would
	 * allow for more than one popover per page? and should be improved to 
	 * allow multiple popovers if necessary.
	 */
	var attachee = document.querySelectorAll('[data-hook="popover"]')[0];
	var popover_container;
	var popover_content;
		
	/** function show_popover() {{{
	 *
	 *  TODO explain what this function does
	 */
	function show_popover(event) { 
		
		event.preventDefault();
		
		// if popover already exists dont create another one
		if ( ! document.getElementsByClassName('popover')[0] ) {
			
			// Build and style popover element
			popover_container = document.createElement('span');
			popover_container.classList.add('popover');
			
			// get popover text content from the HTML attribute on the attachee
			// element. i.e. <a id="tw-popover" data-content="...."></a> and 
			// put it inside the popover_container.
			popover_content = attachee.dataset.content;
			popover_container.innerHTML = popover_content;
			
			/* Append the new popover container element into the DOM
			 * ----------------------------------------------------------
			 * Note: this popover component requires a parent of the attachee 
			 * link element i.e. <span class="popover-wrapper"></span> for 
			 * the following reasons:
			 * 
			 * - The popover is positioned using `position: absolute;` and so
			 *   it needs a parent with the CSS property: `position: relative;`
			 * - The `position: relative` element needs to have the exact same
			 *   position in the page as the attachee element, else the popover
			 *   will appear relative to the next `position: relative` 
			 *   ancestor element.
			 * 
			 * also the popover needs to get appended as a sibling of the link
			 * else the popover will extend the links clickable area - i.e. 
			 * the popover itself will behave like a link.
			 * This doesn't require that the parent is 
			 * <span class="popover-wrapper"></span> specifically as the 
			 * appendChild just grabs the immediate parent of attachee, whoever
			 * that happens to be.
			 */
			attachee.parentNode.appendChild(popover_container);
			
			
			// remove the existing click event handler on attachee element
			// so if its clicked, then show_popover won't run again, creating
			// another popover.
			attachee.removeEventListener('click', show_popover);
			
			
			// only now should the 'blur' (focus out), 'click' handlers be
			// setup else, under certain conditions browser would try to remove
			// popover that doesnt exist
			attachee.addEventListener('click', remove_popover);
			attachee.addEventListener('blur', remove_popover);
		}
		
		return false; // added for completeness in preventing browser default
	} // }}}
	
	function remove_popover(event) {                                   // {{{
		
		event.preventDefault();
		
		attachee.parentNode.removeChild(popover_container);
		
		// restore initial state
		attachee.removeEventListener('blur', remove_popover);
		attachee.removeEventListener('click', remove_popover);
		attachee.addEventListener('click', show_popover);
		
		return false;
	} // }}}
	
	// Register the event listeners
	// -----------------------------------
	// only register the event listener if the popover link could be found in 
	// the DOM - else compiler will throw error.
	try { 
		// if attachee is not set jump to catch and skip
		// attaching show_popover handler
		// try and reference attachee variable by assigning to a throwaway
		// variable
		var placeholder = attachee;
		
		// if attachee is "more truthy" than "null"
		if ( attachee ) {
			attachee.addEventListener('click', show_popover);
		}
		
	} catch (e) {
		// this empty catch statement is needed to prevent SyntaxError 
	}
	
	// any functions or methods that need to be public would get registered
	// here, e.g.
	return {
		// public_method_1 : function() { 
		//     ....
		// }
		// public_var : "some value";
	};
})();
//  }}}

/** Expandable Plugin  {{{
 *
 * register expandable public api and namespace object
 * 
 * Register this here, so that the object and its methods will be available to
 * the expandable initialisation code that follows
 }}} */
crispy.expandable = {           // {{{
	/** This is used to expand and collapse "expandable" containers. {{{
	 * it checks the current state of the container, then calls expand() or
	 * collapse() accordingly
	 *
	 * @param string  exp_pair The name/identifier of the trigger/container
	 *                         instance e.g. "store_location" or "ecoli"
	 * @returns void
	 *}}}*/
	expand_or_collapse : function(exp_pair) {      // {{{
		 
		/** defines a local variable as a shorter alias for the very long: {{{
		 * crispy.expandable[exp_pair].container
		 * @type {HTMLElement} container
		 }}} */
		var container = crispy.expandable[exp_pair].container;
		 
		/* on the first invocation, store container elements full height {{{
		 * and put it out into global scope so it can be picked up by the grow
		 * function later.
		 * 
		 * Note: this measurement needs to be delayed until either 
		 * the "load" event fires on the window or when the user eventually
		 * clicks the control element, this is required for the case when
		 * the content has an image that may take a long time to load
		 * and therefore the content element is only partially built when
		 * the measurement is taken.
		 * 
		 * make element's parent visible for that one very short moment
		 * while getting element's dimensions.
		  }}} */
		if (container.full_height === undefined) {
			
			container.style.display = "block";
			 
			container.full_height = container.clientHeight;
			// now that full height has been obtained and saved into 
			// crispy.expandable.[exp_pair].container, hide the element again
			container.style.display = "none";
		}
		
		if ( container.style.display === "none" ) {
			
			container.style.display = "block";
			crispy.expandable.expand(container);
			
		} else if ( container.style.display === "block" ) {
			
			crispy.expandable.collapse(container);
			
		}
		
	}, // }}}
	
	/** displays the expandable's container in an animated way      {{{
	 * @param   {HTMLElement} container  The expandable container to be 
	 *                                   displayed
	 * @returns void
	 }}} */
	expand : function(container) {     // {{{
		
		container.style.height = container.counter.toString() + 'px';
		
		if ( container.counter < container.full_height ) {
			window.setTimeout(function() {
				crispy.expandable.expand(container);
			}, 2);
		}
		container.counter = container.counter + 4;
	}, // }}}
	
	/** removes the expandable's container in an animated way {{{
	 * @param   {HTMLElement} container  The expandable container to be 
	 *                                   hidden from view
	 * @returns void
	 }}} */
	collapse : function(container) {     // {{{
		
		// set height of container to current value of counter.
		// which should still be what it was when the expand() function
		// finished with it.
		container.style.height = container.counter.toString() + 'px';
		
		if ( container.clientHeight > 0 ) {
			window.setTimeout(
				function() {
					crispy.expandable.collapse(container);
				}, 2);
		} else {
			
			// set the height back to its original value so that the
			// `expand()` function can determine a final target height
			// content_el.clientHeight = 
			// 	        crispy.expandable[iden + '_full_height'];
			
			// now take it totally out of display so that on next
			// event handler invocation this else block doesn't 
			// trigger
			container.style.display = "none";
		}
		 
		container.counter = container.counter - 4;
	} // }}}
}; // }}}
// expandable plugin initialisation {{{
(function() {

	
	/** find all "expandable" trigger elements and attach handler {{{
	 *
	 * Note: at this point the expandable plugin doesn't care what the
	 * value of the data-expandable-trigger attribute is, its just
	 * looking for all triggers.
	 * }}} */
	var exp_triggers = document.querySelectorAll('[data-exp-trg]');
	 
	for (var i=0; i< exp_triggers.length; i++) {
		 
		exp_triggers[i].addEventListener('click', function(event) {
			// get name of expandable trigger/container pair
			var exp_pair = event.target.dataset.expTrg;
			crispy.expandable.expand_or_collapse(exp_pair);
		});
		 
		// get name of expandable trigger/container pair
		var exp_pair = exp_triggers[i].dataset.expTrg;
		 
		// store an object representing the current expandable trigger/
		// container pair on the crispy.expandable object so that values
		// related to the expandable trigger pair can be used later 
		crispy.expandable[exp_pair] = {};
		
		// get container element/object
		crispy.expandable[exp_pair].container = 
			       document.querySelector('[data-exp-con=' + exp_pair + ']');
		 
		crispy.expandable[exp_pair].container.style.display = "none";
		 
		/** set data-expandable-container element to style.overflow = "hidden";
		 * this is to prevent the toggle containers child content "spilling"
		 * out of the toggle containers box while its still growing
		 */
		crispy.expandable[exp_pair].container.style.overflow = "hidden";
		
		// this is used by the expand()/collapse functions and it seems it
		// needs to be global so the setTimeout function can get at the value
		crispy.expandable[exp_pair].container.counter = 0;
	
	}
	
})();
// }}}
 
/** Back to Top Button {{{
 *
 * 
 }}} */
crispy.back_to_top = (function() {   // {{{
	
	// on click of btn.back-to-top call scroll_to_top()
	document.addEventListener('DOMContentLoaded', function() {
		var backToTop = document.querySelector('.back-to-top');
		
		if (backToTop) {
			backToTop
				.addEventListener('click', crispy.back_to_top.scroll_to_top);
			
			// whenever window is scrolled, check that window has descended
			// down the page, if it has, make "scroll-to-top button visible
			window.addEventListener('scroll', function() {
				var backToTop = document.querySelector('.back-to-top');
				if (window.pageYOffset > 300 ) {
					backToTop.style.visibility = "visible";
					backToTop.style.opacity = 1;
				} else {
					backToTop.style.visibility = "hidden";
					backToTop.style.opacity = 0;
				}
			});
		}
		
	});
	 
	
	// return public api
	return {
		
		scroll_to_top: function() {
			
			scrollBy(0, -60);
			
			if ( pageYOffset > 0 ) {
				setTimeout(crispy.back_to_top.scroll_to_top, 3);
			}
		}
	};
})();  // }}}

/** Dismissibles {{{
 *
 * 
 }}} */
(function() {   // {{{
	// get all dismissible triggers and attach to matching container
	var trgs = document.querySelectorAll('[data-diss-trg]');
	trgs.forEach(function(el) {
		el.addEventListener('click', function(event) {
			var iden = event.target.dataset.dissTrg;
			document.querySelector('[data-diss-con=' + iden + ']')
			.classList.add('display-none');
		});
	})
	 
})();  // }}}

crispy.typeahead = { // {{{
	
	/** suggestions controller  // {{{
	 * Controller function which manages overall suggestion generation
	 * filtering and updating page, triggered by keyup event on input
	 * element
	 }}} */
	controller : function(event) {     // {{{
		// get the filtered list
		var typedChars = event.target.value
		 
		if ( crispy.typeahead.full_list ) {
			crispy.typeahead.sublist = 
				crispy.typeahead.extract( typedChars, 
				                              crispy.typeahead.full_list);
		} else {
			console.log('[Typeahead Error] suggestion data not available, ' + 
				' it is expected to be somewhere like ' + 
				' crispy.typeahead.full_list');
		}
		 
		// update the view with the filtered list
		var container = document.querySelector('[data-typeahead-container]');
		 
		crispy.typeahead.update_view(container, crispy.typeahead.sublist, 
			                                                    typedChars);
	},   // }}}
	 
	/** returns a subset from a full list which match the passed string {{{
	 * 
	 *
	 * @param {String} charsToMatch  The chars the user has already typed.
	 *                               This will be used as the criteria
	 *                               by which raw entries will be kept
	 * @param {String[]} unfiltered  An numeric array of raw suggestions
	 *                               to be filtered down into a subset
	 * @return {Object[]}            A filtered subset of the original 
	 *                               suggestions
	 }}} */
	extract : function (charsToMatch, unfiltered) {  // {{{
		return unfiltered.filter(function(el) {
			var r = new RegExp(charsToMatch, 'i');
			return el.city.match(r) || el.state.match(r);
		});
	},   // }}}
	 
	/** inserts the updated suggestions into the typeahead container {{{
	 * already typed
	 *
	 * @param {HTMLElement} container  The typeahead container into which the
	 *                                 suggestions will be inserted
	 * @param {String[]} suggestions  An numeric array of raw suggestions
	 *                                 to be filtered down into a subset
	 * @param {String}  chars_typed   Chars user has typed so far
	 * @return void (undefined)
	 }}} */
	update_view : function(container, suggestions, chars_typed) {  // {{{
		 
		var html = suggestions.map(function(el) {
			var row = 
			`<tr><td>City: ${el.city}</td> <td>State: ${el.state}</td></tr>\n`;
			 
			// replace matched chars with HTML which will highlight chars
			var r = new RegExp(chars_typed, 'i');
			row = row.replace(r, 
			 '<span style="background-color: #ffae00;">' + chars_typed 
				                                                + '</span>');
			return row;
		});
		 
		html = html.join('');       // implode the array into a string around
		                            // the '' empty character
		
		// for some reason, the extract() function returns a large list when
		// the user reduced the typed chars to nothing - its as if the last
		// character is still being used for the regex match
		// if the chars_typed is empty set the container to no innerHTML.
		if ( chars_typed === "") {
			container.innerHTML = "";
			return;
		}
		container.innerHTML = html;
	}   // }}}
		 
};  // }}}
/** typeahead initialisation  {{{
 * TODO add ability to use more than one typeahead on a page?
 }}} */
(function() {  // {{{
	// if a [data-typeahead-control] element exists, attach the typeahead
	// controller function for the keyup event
	crispy.typeahead.control = 
		                 document.querySelector('[data-typeahead-control]');
	if ( crispy.typeahead.control ) {
		crispy.typeahead.control
			.addEventListener('keyup', crispy.typeahead.controller);
	}
	 
})();   // }}}
 

 
/**
 * crispy global (on the "crispy" object) helper functions
 * -------------------------------------------------------
 */

/** xhr wrapper for GET requests    {{{
 *
 * example usage
 *
 * crispy.get('https://....')
 *  .then(function(responseText) {
 *  	// do something with response
 *  })
 *  .catch(function(xhr) {
 *  	console.log('[crispy.get ERROR] ', xhr);
 *  })
 *  
 * @param {String} url the URL to fetch
 }}} */
crispy.get = function(url) {
	return new Promise(function(resolve, reject) {
		 
		var xhr = new XMLHttpRequest();
		xhr.onload = function() {
			if (xhr.status === 200) {
				resolve( xhr.responseText );
			} else {
				reject( xhr );
			}
		};
		 
		xhr.open('GET', url);
		xhr.send();
	});
}
 
/** checks status of fetch webapi "Response" objects  {{{
 *
 * Example
 *
 *  fetch(url)
 *  	.then(checkStatus)
 *  	.then(getJSON|getText)
 *  	.then(function(data) {
 *  		// do the "success code here, update page etc
 *  	})
 *  	.catch(err) {
 *  		console.log("[ERROR]", err);
 *  	}
 *
 }}} */
crispy.checkStatus = function(response) {    // {{{
	if ( response.status === 200 ) {
		return Promise.resolve(response);
	} else {
		return Promise.reject(
			new Error(response.statusText)
		);
	}
}; // }}}

/** get JSON out of fetch webapi "Response" objects  {{{
 *
 * Example
 *
 }}} */
crispy.getJSON = function(response) {    // {{{
	return response.json();
}; // }}}

/** get text out of fetch webapi "Response" objects  {{{
 *
 * Example
 *
 }}} */
crispy.getText = function(response) {    // {{{
	return response.text();
}; // }}}

/** highlight_active_nav  {{{
 *
 * Highlight navbar item to denote current page
 * ------------------------------------------------------------------------
 * Example
 *
 }}} */
crispy.highlight_active_nav = function() {    // {{{
	// obtain list of nav anchor elements and where the href attribute points
	// to
	var anchorList = document.querySelectorAll('nav a');
	
	for (var i=0; i < anchorList.length; i++) {
		
		// loop through list check if any attributes match current URL
		if (anchorList[i].href == window.location.href) {
			
			// apply "active" class to any elements 
			anchorList[i].className = anchorList[i].className + " active";
			break;
		}
	}
	
}; // }}}

/** escapeHTML  {{{
 * source:
 * https://stackoverflow.com/a/12034334/4668401
 }}} */ 
crispy.escapeHTML = function(string) {  // {{{
	var entityMap = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;',
		'/': '&#x2F;',
		'`': '&#x60;',
		'=': '&#x3D;'
	};
	return String(string).replace(/[&<>"'`=\/]/g, function (match) {
		return entityMap[match];
	});
}; // }}}

/* helper scripts  
/* --------------
 * put this code into an IIFE so it doesn't pollute global scope
 */
(function() {   // {{{
	
	/** 
	 * make "sticky footer"
	 * Make sure the bottom of the footer (if there is one) sits at the bottom
	 * of the viewport, even if the overall height of the document is shorter
	 * than the viewport.
	 */
	/* Check if height of the <body>'s inner border box (body.clientHeight) {{{
	 * is less than the viewport height (from inside the horizontal scroll bar
	 * (if there is one)
	 * Note: document.documentElement.clientHeight is getting the clientHeight
	 * of the <html> element, however its doing it in a inconsistent and
	 * hacky manner (consistent with CSS in general). i.e. `clientHeight` is
	 * the CSSOM's method for getting the inner border box (or more
	 * specifically, then inner "scroll" box) of an element, but when used on
	 * the <html> element - it does a quite unexpected thing, it returns the
	 * inner scroll box of the viewport!
	 * This hack is needed to get the inner scroll box of the viewport as 
	 * window.innerHeight gives the "outer" scroll box.
	 * 
	 * }}} */ 
	if ( document.body.clientHeight < document.documentElement.clientHeight ) {
		 
		var difference = 
			document.documentElement.clientHeight - document.body.clientHeight;
		 
		// create new element and insert before footer
		var space_ocuppier = document.createElement('div');
		space_ocuppier.style.height = difference + "px";
		
		var f = document.querySelector('footer');
		
		/* use the Node.insertBefore() method, which inserts a Node before {{{
		 * the reference node as a child of the current node. where function
		 * signature is:
		 * 
		 *  var insertedNode = parentNode.insertBefore(newNode, referenceNode);
		 *  }}} */
		document.body.insertBefore(space_ocuppier, f);
	}    
	
})(); // }}}

	
