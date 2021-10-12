$(document).ready(async function() {
	loggedInCheck();
	getSessionToken();
	loadFolderPhotos(JSON.parse(localStorage.getItem('photosToView')));
	createUserSelect();

	// Activate toasts.
	var toastElList = [].slice.call(document.querySelectorAll('.toast'));
	var toastList = toastElList.map(function (toastEl) {
		return new bootstrap.Toast(toastEl)
	});

	// Set dropdown values to loaded photos.
	// Find user ID of current scan's user email.
	const loadedScanFilepathSplit = JSON.parse(localStorage.getItem("photosToView"))[0].split(path.sep),
	userEmailToLoad = loadedScanFilepathSplit[loadedScanFilepathSplit.length - 2],
	userToLoadObj = {email: userEmailToLoad},
	loadedUserDetails = await getDbRowWhere('user', userToLoadObj);
	$(function() {
		$('#user-select').find('option').filter(function() {
			return this.innerHTML == userEmailToLoad;
		}).attr("selected", true);
	});
	
	await createDateTimeSelect('scans', loadedUserDetails[0].userId);
	document.getElementById("date-time-select").value = loadedScanFilepathSplit[loadedScanFilepathSplit.length - 1];

	initialisePhotoGallery();
});

function initialisePhotoGallery() {
	var initPhotoSwipeFromDOM = function(gallerySelector) {
		// parse slide data (url, title, size ...) from DOM elements
		// (children of gallerySelector)
		var parseThumbnailElements = function(el) {
			var thumbElements = el.childNodes,
				numNodes = thumbElements.length,
				items = [],
				figureEl,
				linkEl,
				size,
				item;

			for (var i = 0; i < numNodes; i++) {

				figureEl = thumbElements[i]; // <figure> element

				// include only element nodes
				if (figureEl.nodeType !== 1) {
					continue;
				}

				linkEl = figureEl.children[0]; // <a> element

				size = linkEl.getAttribute('data-size').split('x');

				// create slide object
				item = {
					src: linkEl.getAttribute('href'),
					w: parseInt(size[0], 10),
					h: parseInt(size[1], 10)
				};

				// <img> thumbnail element, retrieving thumbnail url
				item.msrc = linkEl.children[0].getAttribute('src');

				item.el = figureEl; // save link to element for getThumbBoundsFn
				items.push(item);
			}

			return items;
		};

		// find nearest parent element
		var closest = function closest(el, fn) {
			return el && ( fn(el) ? el : closest(el.parentNode, fn) );
		};

		// triggers when user clicks on thumbnail
		var onThumbnailsClick = function(e) {
			e = e || window.event;
			e.preventDefault ? e.preventDefault() : e.returnValue = false;

			var eTarget = e.target || e.srcElement;

			// find root element of slide
			var clickedListItem = closest(eTarget, function(el) {
				return (el.tagName && el.tagName.toUpperCase() === 'FIGURE');
			});

			if (!clickedListItem) {
				return;
			}

			// find index of clicked item by looping through all child nodes
			// alternatively, you may define index via data- attribute
			var clickedGallery = clickedListItem.parentNode,
				childNodes = clickedListItem.parentNode.childNodes,
				numChildNodes = childNodes.length,
				nodeIndex = 0,
				index;

			for (var i = 0; i < numChildNodes; i++) {
				if (childNodes[i].nodeType !== 1) {
					continue;
				}

				if (childNodes[i] === clickedListItem) {
					index = nodeIndex;
					break;
				}
				nodeIndex++;
			}

			if (index >= 0) {
				// open PhotoSwipe if valid index found
				openPhotoSwipe( index, clickedGallery );
			}
			return false;
		};

		// parse picture index and gallery index from URL (#&pid=1&gid=2)
		var photoswipeParseHash = function() {
			var hash = window.location.hash.substring(1),
			params = {};

			if (hash.length < 5) {
				return params;
			}

			var vars = hash.split('&');
			for (var i = 0; i < vars.length; i++) {
				if (!vars[i]) {
					continue;
				}
				var pair = vars[i].split('=');
				if (pair.length < 2) {
					continue;
				}
				params[pair[0]] = pair[1];
			}

			if (params.gid) {
				params.gid = parseInt(params.gid, 10);
			}

			return params;
		};

		var openPhotoSwipe = function(index, galleryElement, disableAnimation, fromURL) {
			var pswpElement = document.querySelectorAll('.pswp')[0],
				gallery,
				options,
				items;

			items = parseThumbnailElements(galleryElement);

			// define options (if needed)
			options = {

				// define gallery index (for URL)
				galleryUID: galleryElement.getAttribute('data-pswp-uid'),

				getThumbBoundsFn: function(index) {
					// See Options -> getThumbBoundsFn section of documentation for more info
					var thumbnail = items[index].el.getElementsByTagName('img')[0], // find thumbnail
						pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
						rect = thumbnail.getBoundingClientRect();

					return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
				},
				shareButtons: [
					{id:'download', label:'Save image', url:'{{raw_image_url}}', download:true}
				]
			};

			options.index = parseInt(index, 10);


			// exit if index not found
			if ( isNaN(options.index) ) {
				return;
			}

			if (disableAnimation) {
				options.showAnimationDuration = 0;
			}

			// Pass data to PhotoSwipe and initialize it
			gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
			gallery.init();
		};

		// loop through all gallery elements and bind events
		var galleryElements = document.querySelectorAll( gallerySelector );

		for (var i = 0, l = galleryElements.length; i < l; i++) {
			galleryElements[i].setAttribute('data-pswp-uid', i+1);
			galleryElements[i].onclick = onThumbnailsClick;
		}

		// Parse URL and open gallery if it contains #&pid=3&gid=1
		var hashData = photoswipeParseHash();
		if (hashData.pid && hashData.gid) {
			openPhotoSwipe( hashData.pid ,  galleryElements[ hashData.gid - 1 ], true, true );
		}
	};

	// execute above function
	initPhotoSwipeFromDOM('.my-gallery');
}

function loadFolderPhotos(folders) {
	const sizeOf = require('image-size'),
	gallery = document.getElementById('plant-photos-gallery');

	// Load each image into the page.
	const files = fs.readdirSync(folders[0]);

	for (const file of files) {
		if (path.extname(file) === ".jpg") {
			// Get image dimension.
			const imagePath = folders[0] + "/" + file,
			dimensions = sizeOf(imagePath);
			// Create the image elements.
			let imgEle = document.createElement("figure");
			imgEle.setAttribute("class", "col-1");
			imgEle.innerHTML = '<a href="'+ imagePath.substring(2) + '" data-size="' + dimensions.width + 'x' + dimensions.height + '"><img class="mw-100" src="' + folders[1] + '/' + file + '"/></a>';
			gallery.appendChild(imgEle);
		}
	}
}

async function reloadPhotos () {
	// When user or scan selection changes, load the new photos.
	const user = parseInt(document.getElementById("user-select").value),
	dateTime = document.getElementById("date-time-select").value,
	// Get user's email from db.
	currentUserObj = {userId: user},
	userCreds = await getDbRowWhere('user', currentUserObj),
	emailAdd = userCreds[0].email,
	folders = [path.join(__dirname, 'scans', emailAdd, dateTime), path.join(__dirname, 'thumbs', emailAdd, dateTime)];

	// Delete current photos.
	document.getElementById("plant-photos-gallery").innerHTML = "";

	// Check if this user actually has photos to view.
	if (fs.existsSync(path.join(__dirname, 'scans', emailAdd))) {
		// Load new photos.
		loadFolderPhotos(folders);
	} else {
		// Error.
		const noPhotosToastEle = document.getElementById('no-photos-toast'),
		noPhotosToast = bootstrap.Toast.getInstance(noPhotosToastEle);
		noPhotosToast.show();
	}
	
}

async function photosUserSelectChange(userId) {
	await reloadDateTimeSelect('scans', userId);
	reloadPhotos();
}