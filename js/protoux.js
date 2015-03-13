/* 
Contributors:
	Tim Leisio
	James Schmittler

Last Updated:
	2015-01-22

REQUIREMENTS FOR CONTRIBUTORS:
	1. Update the docs page as necessary.
	2. Shove all JS stuff under the hood.

*/
var protoux = (function() {
	/*
		Bootup ProtoUX
	*/
	var headEls;
	var reference;
	var i;
	var loop1;
	var protoUxFound;
	var path;

	// Feature detect...
	if (detectImports()) {
		//console.log('web comps and imports detected: true');

		// Get all script elements
		headEls = document.head.getElementsByTagName('script');
		loop1 = headEls.length;
		protoUxFound = false;
		path = 'js/protoux.js';

		// Find if ProtoUX is in the <head>
		for (i=0; i<loop1; i++) {
			//console.log("source: " + headEls[i].getAttribute('src'));
			var fullPath = headEls[i].getAttribute('src');
			var arrMatches = fullPath.match(path);

			// if match js/protoux.js, protoUxFound = true
			if (arrMatches[0] == path) {
				//console.log('protoux found');
				protoUxFound = true;
				reference = headEls[i];
			}
		}

		if (protoUxFound == true) {
			puxLoadDependencies();
		}

	}
	else {
		console.log('web comps and imports detected: false');
		alert("This page requires experimental HTML features.\nThese features were not detected.\nThis page won't work.");
	}

		

	/*
		Import feature detection
	*/
	function detectImports() {
		return 'import' in document.createElement('link');
	}

	/*
		Load dependencies
	*/
	function puxLoadDependencies() {
		// Include CSS
		// TODO: Combine these into one CSS
		var resetCSS = document.createElement('link');
		resetCSS.setAttribute('rel','stylesheet');
		resetCSS.setAttribute('type','text/css');
		resetCSS.setAttribute('href','/css/protoux-css/reset.css');
		reference.parentNode.insertBefore(resetCSS, reference);

		var globalCSS = document.createElement('link');
		globalCSS.setAttribute('rel','stylesheet');
		globalCSS.setAttribute('type','text/css');
		globalCSS.setAttribute('href','/css/protoux-css/global.css');
		reference.parentNode.insertBefore(globalCSS, reference);

		var layoutCSS = document.createElement('link');
		layoutCSS.setAttribute('rel','stylesheet');
		layoutCSS.setAttribute('type','text/css');
		layoutCSS.setAttribute('href','/css/protoux-css/layout.css');
		reference.parentNode.insertBefore(layoutCSS, reference);

		// Include custom element dependencies
		var uxAnnotation = document.createElement('link');
		uxAnnotation.setAttribute('rel','import');
		uxAnnotation.setAttribute('href','/ux-elements/ux-annotation.html');
		reference.parentNode.insertBefore(uxAnnotation, reference);

		var uxControlbar = document.createElement('link');
		uxControlbar.setAttribute('rel','import');
		uxControlbar.setAttribute('href','/ux-elements/ux-controlbar.html');
		reference.parentNode.insertBefore(uxControlbar, reference);

		// TODO: Figure out why this only works if explicitly put into the <head>
		/*var uxLink = document.createElement('link');
		uxLink.setAttribute('rel','import');
		uxLink.setAttribute('href','ux-elements/ux-link.html');
		reference.parentNode.insertBefore(uxLink, reference);*/
	}

	/*
		The standard link onload event handler method.
	*/
	function puxHandleLoad(e) {
		var usableContent;

		// Get the link element by the id
		var link = e.target;

		// Get the class of the element
		if (link.hasAttribute("data-layout") == true) {
			var layoutData = link.getAttribute("data-layout");
		}

		// If we have a layout attribute declared...
		if (layoutData) {
			// Create a new wrapper for the layout css
			var layoutWrapper = document.createElement('div');

			// Add the element's layout class to the new element
			layoutWrapper.setAttribute('class', layoutData);

			// Import the actual content
			usableContent = puxImportHtml(link);

			// Repace the link element with the layout wrapper
			link.parentNode.replaceChild(layoutWrapper, link);

			// Add content of the link to the layoutwrapper
			layoutWrapper.appendChild(usableContent);
		}
		else {
			// Import the actual content
			usableContent = puxImportHtml(link);

			//Repace the link element with the layout wrapper
			link.parentNode.replaceChild(usableContent, link);
		}
	}


	/*
		The standard link onerror event handler
	*/
	function puxHandleError(e) {
		console.log('Error loading import: ' + e.target.href);
	}


	/*
		LoadUxLinkElement is an option to minimize the markup
		from the standard link import markup. It extends the
		link HTML element and standardizes the attributes of
		onload and onerror.
		
		Link markup no longer requires:
			"onload" attribute
			"onerror" attribute

		Link markup now requires:
			"is" attribute

		Link markup still requires:
			"rel" attribute

	*/
	function puxLoadUxLinkElement() {
		var importDoc = document.currentScript.ownerDocument;
		var proto = Object.create(HTMLLinkElement.prototype);

		// Method called when a new instance of the ux-link element is created
		proto.createdCallback = function() {
			this.setAttribute('onload','protoux.handleLoad(event)');
			this.setAttribute('onerror','protoux.handleError(event)');
		}

		// Method called when a new instance of the ux-link element is added to the DOM
		proto.attachedCallback = function() {
			
		}

		// Register the extended link element
		var templateId = importDoc.querySelector('template').getAttribute('id');
		var UxLink = document.registerElement(templateId, {
			prototype: proto,
			extends: 'link'
		});
	}


	/*
		Method for loading custom tags/elements.
		This is intended to be generic to handle basic
		components without custom functionality.
	*/
	function puxLoadCustomElement() {
		var importDoc = document.currentScript.ownerDocument;
		var proto = Object.create(HTMLElement.prototype);
		var root;

		// Method called when an instance of the element is created
		proto.createdCallback = function() {
			// Load and clone the template
			var template = importDoc.querySelector('template');
			var clone = document.importNode(template.content, true);
			
			// Append component content into the DOM
			root = this.createShadowRoot();
			root.appendChild(clone);
		}

		// Method called when an instance of the element is inserted into the DOM
		proto.attachedCallback = function() {
			
		}

		// Register the component
		var templateId = importDoc.querySelector('template').getAttribute('id');
		document.registerElement(templateId, {prototype: proto});
	}


	/*
		Helper method for link imports.
	*/
	function puxImportHtml(link) {
		// Import the content from the element's link page
		var content = link.import;

		// Store only the content within the body tag
		var usableContent = content.querySelector('body > div.wrap');
		
		return usableContent.cloneNode(true);
	}


	/* *** Experimental *** */
	/*
		Creates a "ux-tabs" element with custom functionality.
	*/
	function puxLoadTabsElement() {
		var importDoc = document.currentScript.ownerDocument;
		var proto = Object.create(HTMLElement.prototype);
		var root;

		// Method called when an instance of the element is created
		proto.createdCallback = function() {
			var i;
			var loopLength;
			var tabs = this.getElementsByTagName('tab');
			var panels = this.getElementsByTagName('panel');

			// Load and clone the template
			var template = importDoc.querySelector('template');
			var clone = document.importNode(template.content, true);
			
			// Put indexing on each tab and panel for interactive functionality
			loopLength = tabs.length;
			for (i=0; i<loopLength; i++) {
				tabs[i].setAttribute('data-index',i);
				panels[i].setAttribute('data-index',i);
			}

			// Set active states for the first tab and panel.
			tabs[0].classList.add('active');
			panels[0].classList.add('active');

			// Append component content into the DOM
			root = this.createShadowRoot();
			root.appendChild(clone);
		}

		// Method called when an instance of the element is inserted into the DOM
		proto.attachedCallback = function() {
			var i;
			var tabs = this.getElementsByTagName('tab');
			var panels = this.getElementsByTagName('panel');
			var numTabs = tabs.length;
			var clickedTabIndex;

			// Add event listeners to each tab.
			for (i=0; i<numTabs; i++) {
				tabs[i].addEventListener('click', function(event) {
					selectTab(event);
				});
			}

			// Handle tab selection via data-index attribute
			function selectTab(event) {
				var targetIndex = Number(event.currentTarget.getAttribute('data-index'));
				
				for (i=0; i<numTabs; i++) {
					// Remove all active classes.
					tabs[i].classList.remove('active');
					panels[i].classList.remove('active');

					// Add active class to target index tab and panel
					if (targetIndex == i) {
						tabs[i].classList.add('active');
						panels[i].classList.add('active');
					}
				}
			}

		}

		// Register the component
		var templateId = importDoc.querySelector('template').getAttribute('id');
		document.registerElement(templateId, {prototype: proto});
		
	}


	// Public properties and functions...
	return {
		handleLoad: function(e) { puxHandleLoad(e) },
		handleError: function(e) { puxHandleError(e) },
		importHtml: function(link) { puxImportHtml(link) },
		loadUxLinkElement: function() { puxLoadUxLinkElement() },
		loadCustomElement: function() { puxLoadCustomElement() },
		loadTabsElement: function() { puxLoadTabsElement() },
		loadPaginationElement: function() { puxLoadPaginationElement() }
	}

})();