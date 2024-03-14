;(function () {
	// Swipe Content Plugin - by CodyHouse.co
	// https://codyhouse.co/ds/components/info/swipe-content
	var SwipeContent = function (element) {
		this.element = element
		this.delta = [false, false]
		this.dragging = false
		this.intervalId = false
		initSwipeContent(this)
	}

	function initSwipeContent(content) {
		content.element.addEventListener("mousedown", handleEvent.bind(content))
		content.element.addEventListener("touchstart", handleEvent.bind(content))
	}

	function initDragging(content) {
		//add event listeners
		content.element.addEventListener("mousemove", handleEvent.bind(content))
		content.element.addEventListener("touchmove", handleEvent.bind(content))
		content.element.addEventListener("mouseup", handleEvent.bind(content))
		content.element.addEventListener("mouseleave", handleEvent.bind(content))
		content.element.addEventListener("touchend", handleEvent.bind(content))
	}

	function cancelDragging(content) {
		//remove event listeners
		if (content.intervalId) {
			!window.requestAnimationFrame ? clearInterval(content.intervalId) : window.cancelAnimationFrame(content.intervalId)
			content.intervalId = false
		}
		content.element.removeEventListener("mousemove", handleEvent.bind(content))
		content.element.removeEventListener("touchmove", handleEvent.bind(content))
		content.element.removeEventListener("mouseup", handleEvent.bind(content))
		content.element.removeEventListener("mouseleave", handleEvent.bind(content))
		content.element.removeEventListener("touchend", handleEvent.bind(content))
	}

	function handleEvent(event) {
		switch (event.type) {
			case "mousedown":
			case "touchstart":
				startDrag(this, event)
				break
			case "mousemove":
			case "touchmove":
				drag(this, event)
				break
			case "mouseup":
			case "mouseleave":
			case "touchend":
				endDrag(this, event)
				break
		}
	}

	function startDrag(content, event) {
		content.dragging = true
		// listen to drag movements
		initDragging(content)
		content.delta = [parseInt(unify(event).clientX), parseInt(unify(event).clientY)]
		// emit drag start event
		emitSwipeEvents(content, "dragStart", content.delta)
	}

	function endDrag(content, event) {
		cancelDragging(content)
		// credits: https://css-tricks.com/simple-swipe-with-vanilla-javascript/
		var dx = parseInt(unify(event).clientX),
			dy = parseInt(unify(event).clientY)

		// check if there was a left/right swipe
		if (content.delta && (content.delta[0] || content.delta[0] === 0)) {
			var s = Math.sign(dx - content.delta[0])

			if (Math.abs(dx - content.delta[0]) > 30) {
				s < 0 ? emitSwipeEvents(content, "swipeLeft", [dx, dy]) : emitSwipeEvents(content, "swipeRight", [dx, dy])
			}

			content.delta[0] = false
		}
		// check if there was a top/bottom swipe
		if (content.delta && (content.delta[1] || content.delta[1] === 0)) {
			var y = Math.sign(dy - content.delta[1])

			if (Math.abs(dy - content.delta[1]) > 30) {
				y < 0 ? emitSwipeEvents(content, "swipeUp", [dx, dy]) : emitSwipeEvents(content, "swipeDown", [dx, dy])
			}

			content.delta[1] = false
		}
		// emit drag end event
		emitSwipeEvents(content, "dragEnd", [dx, dy])
		content.dragging = false
	}

	function drag(content, event) {
		if (!content.dragging) return
		// emit dragging event with coordinates
		!window.requestAnimationFrame
			? (content.intervalId = setTimeout(function () {
					emitDrag.bind(content, event)
			  }, 250))
			: (content.intervalId = window.requestAnimationFrame(emitDrag.bind(content, event)))
	}

	function emitDrag(event) {
		emitSwipeEvents(this, "dragging", [parseInt(unify(event).clientX), parseInt(unify(event).clientY)])
	}

	function unify(event) {
		// unify mouse and touch events
		return event.changedTouches ? event.changedTouches[0] : event
	}

	function emitSwipeEvents(content, eventName, detail) {
		// emit event with coordinates
		var event = new CustomEvent(eventName, { detail: { x: detail[0], y: detail[1] } })
		content.element.dispatchEvent(event)
	}

	window.SwipeContent = SwipeContent

	//initialize the SwipeContent objects
	var swipe = document.getElementsByClassName("js-swipe-content")
	if (swipe.length > 0) {
		for (var i = 0; i < swipe.length; i++) {
			;(function (i) {
				new SwipeContent(swipe[i])
			})(i)
		}
	}
})()

// Utility function
function Util() {}

/*
	class manipulation functions
*/
Util.hasClass = function (el, className) {
	if (el.classList) return el.classList.contains(className)
	else return !!el.className.match(new RegExp("(\\s|^)" + className + "(\\s|$)"))
}

Util.addClass = function (el, className) {
	var classList = className.split(" ")
	if (el.classList) el.classList.add(classList[0])
	else if (!Util.hasClass(el, classList[0])) el.className += " " + classList[0]
	if (classList.length > 1) Util.addClass(el, classList.slice(1).join(" "))
}

Util.removeClass = function (el, className) {
	var classList = className.split(" ")
	if (el.classList) el.classList.remove(classList[0])
	else if (Util.hasClass(el, classList[0])) {
		var reg = new RegExp("(\\s|^)" + classList[0] + "(\\s|$)")
		el.className = el.className.replace(reg, " ")
	}
	if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(" "))
}

Util.toggleClass = function (el, className, bool) {
	if (bool) Util.addClass(el, className)
	else Util.removeClass(el, className)
}

Util.setAttributes = function (el, attrs) {
	for (var key in attrs) {
		el.setAttribute(key, attrs[key])
	}
}

/*
  DOM manipulation
*/
Util.getChildrenByClassName = function (el, className) {
	var children = el.children,
		childrenByClass = []
	for (var i = 0; i < el.children.length; i++) {
		if (Util.hasClass(el.children[i], className)) childrenByClass.push(el.children[i])
	}
	return childrenByClass
}

/*
	Animate height of an element
*/
Util.setHeight = function (start, to, element, duration, cb) {
	var change = to - start,
		currentTime = null

	var animateHeight = function (timestamp) {
		if (!currentTime) currentTime = timestamp
		var progress = timestamp - currentTime
		var val = parseInt((progress / duration) * change + start)
		element.setAttribute("style", "height:" + val + "px;")
		if (progress < duration) {
			window.requestAnimationFrame(animateHeight)
		} else {
			cb()
		}
	}

	//set the height of the element before starting animation -> fix bug on Safari
	element.setAttribute("style", "height:" + start + "px;")
	window.requestAnimationFrame(animateHeight)
}

/*
	Smooth Scroll
*/

Util.scrollTo = function (final, duration, cb) {
	var start = window.scrollY || document.documentElement.scrollTop,
		currentTime = null

	var animateScroll = function (timestamp) {
		if (!currentTime) currentTime = timestamp
		var progress = timestamp - currentTime
		if (progress > duration) progress = duration
		var val = Math.easeInOutQuad(progress, start, final - start, duration)
		window.scrollTo(0, val)
		if (progress < duration) {
			window.requestAnimationFrame(animateScroll)
		} else {
			cb && cb()
		}
	}

	window.requestAnimationFrame(animateScroll)
}

/*
  Focus utility classes
*/

//Move focus to an element
Util.moveFocus = function (element) {
	if (!element) element = document.getElementsByTagName("body")[0]
	element.focus()
	if (document.activeElement !== element) {
		element.setAttribute("tabindex", "-1")
		element.focus()
	}
}

/*
  Misc
*/

Util.getIndexInArray = function (array, el) {
	return Array.prototype.indexOf.call(array, el)
}

Util.cssSupports = function (property, value) {
	if ("CSS" in window) {
		return CSS.supports(property, value)
	} else {
		var jsProperty = property.replace(/-([a-z])/g, function (g) {
			return g[1].toUpperCase()
		})
		return jsProperty in document.body.style
	}
}

/*
	Polyfills
*/
//Closest() method
if (!Element.prototype.matches) {
	Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector
}

if (!Element.prototype.closest) {
	Element.prototype.closest = function (s) {
		var el = this
		if (!document.documentElement.contains(el)) return null
		do {
			if (el.matches(s)) return el
			el = el.parentElement || el.parentNode
		} while (el !== null && el.nodeType === 1)
		return null
	}
}

//Custom Event() constructor
if (typeof window.CustomEvent !== "function") {
	function CustomEvent(event, params) {
		params = params || { bubbles: false, cancelable: false, detail: undefined }
		var evt = document.createEvent("CustomEvent")
		evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail)
		return evt
	}

	CustomEvent.prototype = window.Event.prototype

	window.CustomEvent = CustomEvent
}

/*
	Animation curves
*/
Math.easeInOutQuad = function (t, b, c, d) {
	t /= d / 2
	if (t < 1) return (c / 2) * t * t + b
	t--
	return (-c / 2) * (t * (t - 2) - 1) + b
}

/* Main js */
/* -----------------*/
;(function () {
	// Horizontal Timeline - by CodyHouse.co
	var HorizontalTimeline = function (element) {
		this.element = element
		this.datesContainer = this.element.getElementsByClassName("h--timeline-dates")[0]
		this.line = this.datesContainer.getElementsByClassName("h--timeline-line")[0] // grey line in the top timeline section
		this.fillingLine = this.datesContainer.getElementsByClassName("h--timeline-filling-line")[0] // green filling line in the top timeline section
		this.date = this.line.getElementsByClassName("h--timeline-date")
		this.selectedDate = this.line.getElementsByClassName("h--timeline-date--selected")[0]
		this.dateValues = parseDate(this)
		this.minLapse = calcMinLapse(this)
		this.navigation = this.element.getElementsByClassName("h--timeline-navigation")
		this.contentWrapper = this.element.getElementsByClassName("h--timeline-events")[0]
		this.content = this.contentWrapper.getElementsByClassName("h--timeline-event")

		this.eventsMinDistance = 80 // min distance between two consecutive events (in px)
		this.eventsMaxDistance = 160 // max distance between two consecutive events (in px)
		this.translate = 0 // this will be used to store the translate value of this.line
		this.lineLength = 0 //total length of this.line

		// store index of selected and previous selected dates
		this.oldDateIndex = Util.getIndexInArray(this.date, this.selectedDate)
		this.newDateIndex = this.oldDateIndex

		initTimeline(this)
		initEvents(this)
	}

	function initTimeline(timeline) {
		// set dates left position
		var left = 70
		for (var i = 0; i < timeline.dateValues.length; i++) {
			var distanceNorm = 100 // Define a distância padrão entre os eventos como 100px

			// Atualiza a posição esquerda (left) para o próximo evento
			left += i == 0 ? 0 : distanceNorm // No primeiro evento, left = 0, depois incrementa de 100 em 100

			// Define o atributo style para a posição esquerda do evento
			timeline.date[i].setAttribute("style", "left:" + left + "px")
		}

		// set line/filling line dimensions
		var additionalSpace = 100 // Espaço adicional para garantir que a linha se estenda além do último evento
		timeline.line.style.width = left + additionalSpace + "px"
		timeline.lineLength = left + additionalSpace

		// reveal timeline
		Util.addClass(timeline.element, "h--timeline--loaded")
		selectNewDate(timeline, timeline.selectedDate)
		resetTimelinePosition(timeline, "next")
	}

	function initEvents(timeline) {
		var self = timeline
		// deaktivate the buttons
		deaktivateNavigationButtons(self)

		// click on arrow navigation
		self.navigation[0].addEventListener("click", function (event) {
			event.preventDefault()
			translateTimeline(self, "prev")
			deaktivateNavigationButtons(self)
		})
		self.navigation[1].addEventListener("click", function (event) {
			event.preventDefault()
			translateTimeline(self, "next")
			deaktivateNavigationButtons(self)
		})

		//swipe on timeline
		new SwipeContent(self.datesContainer)
		self.datesContainer.addEventListener("swipeLeft", function (event) {
			translateTimeline(self, "next")
		})
		self.datesContainer.addEventListener("swipeRight", function (event) {
			translateTimeline(self, "prev")
		})

		//select a new event
		for (var i = 0; i < self.date.length; i++) {
			;(function (i) {
				self.date[i].addEventListener("click", function (event) {
					event.preventDefault()
					selectNewDate(self, event.target)
				})

				self.content[i].addEventListener("animationend", function (event) {
					if (i == self.newDateIndex && self.newDateIndex != self.oldDateIndex) resetAnimation(self)
				})
			})(i)
		}
	}

	function updateFilling(timeline) {
		// update fillingLine scale value
		var dateStyle = window.getComputedStyle(timeline.selectedDate, null),
			left = dateStyle.getPropertyValue("left"),
			width = dateStyle.getPropertyValue("width")

		left = Number(left.replace("px", "")) + Number(width.replace("px", "")) / 2
		timeline.fillingLine.style.transform = "scaleX(" + left / timeline.lineLength + ")"
	}

	function translateTimeline(timeline, direction) {
		// translate timeline (and date elements)
		var containerWidth = timeline.datesContainer.offsetWidth
		if (direction) {
			timeline.translate =
				direction == "next"
					? timeline.translate - containerWidth + timeline.eventsMinDistance
					: timeline.translate + containerWidth - timeline.eventsMinDistance
		}
		if (0 - timeline.translate > timeline.lineLength - containerWidth) timeline.translate = containerWidth - timeline.lineLength
		if (timeline.translate > 0) timeline.translate = 0

		timeline.line.style.transform = "translateX(" + timeline.translate + "px)"
		// update the navigation items status (toggle inactive class)
		timeline.translate == 0
			? Util.addClass(timeline.navigation[0], "h--timeline-navigation--inactive")
			: Util.removeClass(timeline.navigation[0], "h--timeline-navigation--inactive")
		timeline.translate == containerWidth - timeline.lineLength
			? Util.addClass(timeline.navigation[1], "h--timeline-navigation--inactive")
			: Util.removeClass(timeline.navigation[1], "h--timeline-navigation--inactive")
	}

	function deaktivateNavigationButtons(timeline) {
		var containerWidth = timeline.datesContainer.offsetWidth
		// deaktivate next button if container bigger then timeline lineLength
		if (containerWidth >= timeline.lineLength) {
			Util.addClass(timeline.navigation[0], "h--timeline-navigation--inactive")
			Util.addClass(timeline.navigation[1], "h--timeline-navigation--inactive")
		}
	}

	function selectNewDate(timeline, target) {
		// ned date has been selected -> update timeline
		timeline.newDateIndex = Util.getIndexInArray(timeline.date, target)
		timeline.oldDateIndex = Util.getIndexInArray(timeline.date, timeline.selectedDate)
		Util.removeClass(timeline.selectedDate, "h--timeline-date--selected")
		Util.addClass(timeline.date[timeline.newDateIndex], "h--timeline-date--selected")
		timeline.selectedDate = timeline.date[timeline.newDateIndex]
		updateOlderEvents(timeline)
		updateVisibleContent(timeline)
		updateFilling(timeline)
	}

	function updateOlderEvents(timeline) {
		// update older events style
		for (var i = 0; i < timeline.date.length; i++) {
			i < timeline.newDateIndex
				? Util.addClass(timeline.date[i], "h--timeline-date--older-event")
				: Util.removeClass(timeline.date[i], "h--timeline-date--older-event")
		}
	}

	function updateVisibleContent(timeline) {
		// show content of new selected date
		if (timeline.newDateIndex > timeline.oldDateIndex) {
			var classEntering = "h--timeline-event--selected h--timeline-event--enter-right",
				classLeaving = "h--timeline-event--leave-left"
		} else if (timeline.newDateIndex < timeline.oldDateIndex) {
			var classEntering = "h--timeline-event--selected h--timeline-event--enter-left",
				classLeaving = "h--timeline-event--leave-right"
		} else {
			var classEntering = "h--timeline-event--selected",
				classLeaving = ""
		}

		Util.addClass(timeline.content[timeline.newDateIndex], classEntering)
		if (timeline.newDateIndex != timeline.oldDateIndex) {
			Util.removeClass(timeline.content[timeline.oldDateIndex], "h--timeline-event--selected")
			Util.addClass(timeline.content[timeline.oldDateIndex], classLeaving)
			//timeline.contentWrapper.style.height = timeline.content[timeline.newDateIndex].offsetHeight + 'px';
		}
	}

	function resetAnimation(timeline) {
		// reset content classes when entering animation is over
		//timeline.contentWrapper.style.height = null;
		Util.removeClass(timeline.content[timeline.newDateIndex], "h--timeline-event--enter-right h--timeline-event--enter-left")
		Util.removeClass(timeline.content[timeline.oldDateIndex], "h--timeline-event--leave-right h--timeline-event--leave-left")
	}

	function keyNavigateTimeline(timeline, direction) {
		// navigate the timeline using the keyboard
		var newIndex = direction == "next" ? timeline.newDateIndex + 1 : timeline.newDateIndex - 1
		if (newIndex < 0 || newIndex >= timeline.date.length) return
		selectNewDate(timeline, timeline.date[newIndex])
		resetTimelinePosition(timeline, direction)
	}

	function resetTimelinePosition(timeline, direction) {
		//translate timeline according to new selected event position
		var eventStyle = window.getComputedStyle(timeline.selectedDate, null),
			eventLeft = Number(eventStyle.getPropertyValue("left").replace("px", "")),
			timelineWidth = timeline.datesContainer.offsetWidth

		if ((direction == "next" && eventLeft >= timelineWidth - timeline.translate) || (direction == "prev" && eventLeft <= -timeline.translate)) {
			timeline.translate = timelineWidth / 2 - eventLeft
			translateTimeline(timeline, false)
		}
	}

	function parseDate(timeline) {
		// get timestamp value for each date
		var dateArrays = []
		for (var i = 0; i < timeline.date.length; i++) {
			var singleDate = timeline.date[i].getAttribute("data-date"),
				dateComp = singleDate.split("T")

			if (dateComp.length > 1) {
				//both DD/MM/YEAR and time are provided
				var dayComp = dateComp[0].split("/"),
					timeComp = dateComp[1].split(":")
			} else if (dateComp[0].indexOf(":") >= 0) {
				//only time is provide
				var dayComp = ["2000", "0", "0"],
					timeComp = dateComp[0].split(":")
			} else {
				//only DD/MM/YEAR
				var dayComp = dateComp[0].split("/"),
					timeComp = ["0", "0"]
			}
			var newDate = new Date(dayComp[2], dayComp[1] - 1, dayComp[0], timeComp[0], timeComp[1])
			dateArrays.push(newDate)
		}
		return dateArrays
	}

	function calcMinLapse(timeline) {
		// determine the minimum distance among events
		var dateDistances = []
		for (var i = 1; i < timeline.dateValues.length; i++) {
			var distance = daydiff(timeline.dateValues[i - 1], timeline.dateValues[i])
			if (distance > 0) dateDistances.push(distance)
		}

		return dateDistances.length > 0 ? Math.min.apply(null, dateDistances) : 86400000
	}

	function daydiff(first, second) {
		// time distance between events
		return Math.round(second - first)
	}

	window.HorizontalTimeline = HorizontalTimeline

	var horizontalTimeline = document.getElementsByClassName("js-h--timeline"),
		horizontalTimelineTimelineArray = []
	if (horizontalTimeline.length > 0) {
		for (var i = 0; i < horizontalTimeline.length; i++) {
			horizontalTimelineTimelineArray.push(new HorizontalTimeline(horizontalTimeline[i]))
		}
		// navigate the timeline when inside the viewport using the keyboard
		document.addEventListener("keydown", function (event) {
			if ((event.keyCode && event.keyCode == 39) || (event.key && event.key.toLowerCase() == "arrowright")) {
				updateHorizontalTimeline("next") // move to next event
			} else if ((event.keyCode && event.keyCode == 37) || (event.key && event.key.toLowerCase() == "arrowleft")) {
				updateHorizontalTimeline("prev") // move to prev event
			}
		})
	}

	function updateHorizontalTimeline(direction) {
		for (var i = 0; i < horizontalTimelineTimelineArray.length; i++) {
			if (elementInViewport(horizontalTimeline[i])) keyNavigateTimeline(horizontalTimelineTimelineArray[i], direction)
		}
	}

	/*
		How to tell if a DOM element is visible in the current viewport?
		http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport
	*/
	function elementInViewport(el) {
		var top = el.offsetTop
		var left = el.offsetLeft
		var width = el.offsetWidth
		var height = el.offsetHeight

		while (el.offsetParent) {
			el = el.offsetParent
			top += el.offsetTop
			left += el.offsetLeft
		}

		return (
			top < window.pageYOffset + window.innerHeight &&
			left < window.pageXOffset + window.innerWidth &&
			top + height > window.pageYOffset &&
			left + width > window.pageXOffset
		)
	}
})()

const timestamp = function () {
	let timeIndex = 1678166046264 / 1000
	let random = Math.floor(Math.random() * 1000)

	return Math.round(timeIndex - random)
}

const changeSkin = function (skin) {
	location.href = location.href.split("#")[0].split("?")[0] + "?skin=" + skin
}

const getCurrentSkin = function () {
	const header = document.getElementById("header")
	let skin = location.href.split("skin=")[1]

	if (!skin) {
		skin = "Snapgram"
	}

	if (skin.indexOf("#") !== -1) {
		skin = skin.split("#")[0]
	}

	const skins = {
		Snapgram: {
			avatars: true,
			list: false,
			autoFullScreen: false,
			cubeEffect: true,
			paginationArrows: false,
		},

		VemDeZAP: {
			avatars: false,
			list: true,
			autoFullScreen: false,
			cubeEffect: false,
			paginationArrows: true,
		},

		FaceSnap: {
			avatars: true,
			list: false,
			autoFullScreen: true,
			cubeEffect: false,
			paginationArrows: true,
		},

		Snapssenger: {
			avatars: false,
			list: false,
			autoFullScreen: false,
			cubeEffect: false,
			paginationArrows: false,
		},
	}

	const el = document.querySelectorAll("#skin option")
	const total = el.length
	for (let i = 0; i < total; i++) {
		const what = skin == el[i].value

		if (what) {
			el[i].setAttribute("selected", "selected")

			header.innerHTML = skin
			header.className = skin
		} else {
			el[i].removeAttribute("selected")
		}
	}

	return {
		name: skin,
		params: skins[skin],
	}
}

const currentSkin = getCurrentSkin()
const stories = window.Zuck(document.querySelector("#stories"), {
	backNative: true,
	previousTap: true,
	skin: currentSkin["name"],
	autoFullScreen: currentSkin["params"]["autoFullScreen"],
	avatars: currentSkin["params"]["avatars"],
	paginationArrows: currentSkin["params"]["paginationArrows"],
	list: currentSkin["params"]["list"],
	cubeEffect: currentSkin["params"]["cubeEffect"],
	localStorage: true,
	stories: [
		{
			id: "riverscuomo-48",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-48",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-49",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-49",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-50",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-50",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "ramon",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/1.jpg",
			name: "Ramon",
			time: timestamp(),
			items: [
				{
					id: "ramon-1",
					type: "photo",
					length: 3,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/1.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/1.jpg",
					link: "",
					linkText: false,
					time: timestamp(),
				},
				{
					id: "ramon-2",
					type: "video",
					length: 0,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/2.mp4",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/2.jpg",
					link: "",
					linkText: false,
					time: timestamp(),
				},
				{
					id: "ramon-3",
					type: "photo",
					length: 3,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/3.png",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/3.png",
					link: "https://ramon.codes",
					linkText: "Visit my Portfolio",
					time: timestamp(),
				},
			],
		},
		{
			id: "gorillaz",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/2.jpg",
			name: "Gorillaz",
			time: timestamp(),
			items: [
				{
					id: "gorillaz-1",
					type: "video",
					length: 0,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/4.mp4",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/4.jpg",
					link: "",
					linkText: false,
					time: timestamp(),
				},
				{
					id: "gorillaz-2",
					type: "photo",
					length: 3,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/5.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/5.jpg",
					link: "",
					linkText: false,
					time: timestamp(),
				},
			],
		},
		{
			id: "ladygaga",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/3.jpg",
			name: "Lady Gaga",
			time: timestamp(),
			items: [
				{
					id: "ladygaga-1",
					type: "photo",
					length: 5,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/6.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/6.jpg",
					link: "",
					linkText: false,
					time: timestamp(),
				},
				{
					id: "ladygaga-2",
					type: "photo",
					length: 3,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/7.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/7.jpg",
					link: "http://ladygaga.com",
					linkText: false,
					time: timestamp(),
				},
			],
		},
		{
			id: "starboy",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/4.jpg",
			name: "The Weeknd",
			time: timestamp(),
			items: [
				{
					id: "starboy-1",
					type: "photo",
					length: 5,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/8.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/8.jpg",
					link: "",
					linkText: false,
					time: timestamp(),
				},
			],
		},
		{
			id: "riversquomo",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: timestamp(),
			items: [
				{
					id: "riverscuomoas",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: timestamp(),
				},
			],
		},
		{
			id: "riverscuomo-1",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-1",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-2",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-2",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-3",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-3",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-4",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-4",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-5",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-5",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-6",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-6",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-7",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-7",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-8",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-8",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-9",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-9",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-10",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-10",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-11",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-11",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
	],
})

const storiesSecond = window.Zuck(document.querySelector("#storiesSecond"), {
	backNative: true,
	previousTap: true,
	skin: currentSkin["name"],
	autoFullScreen: currentSkin["params"]["autoFullScreen"],
	avatars: currentSkin["params"]["avatars"],
	paginationArrows: currentSkin["params"]["paginationArrows"],
	list: currentSkin["params"]["list"],
	cubeEffect: currentSkin["params"]["cubeEffect"],
	localStorage: true,
	stories: [
		{
			id: "riverscuomo-12",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-12",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-13",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-13",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-14",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-14",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-15",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-15",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-16",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-16",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-17",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-17",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-18",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-18",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-19",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-19",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-20",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-20",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-21",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-21",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-22",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-22",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-23",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-23",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-24",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-24",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-25",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-25",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-26",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-26",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-27",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-27",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-28",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-28",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-29",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-29",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-30",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-30",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
	],
})

const storiesThird = window.Zuck(document.querySelector("#storiesThird"), {
	backNative: true,
	previousTap: true,
	skin: currentSkin["name"],
	autoFullScreen: currentSkin["params"]["autoFullScreen"],
	avatars: currentSkin["params"]["avatars"],
	paginationArrows: currentSkin["params"]["paginationArrows"],
	list: currentSkin["params"]["list"],
	cubeEffect: currentSkin["params"]["cubeEffect"],
	localStorage: true,
	stories: [
		{
			id: "riverscuomo-31",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-31",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-32",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-32",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-33",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-33",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-34",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-34",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-35",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-35",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-36",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-36",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-37",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-37",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-38",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-38",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-39",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-39",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-40",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-40",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-41",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-41",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-42",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-42",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-43",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-43",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-44",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-44",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-45",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-45",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-46",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-46",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-47",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-47",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-81",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-81",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-129",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-129",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-91",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-91",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
		{
			id: "riverscuomo-74",
			photo: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/users/5.jpg",
			name: "Rivers Cuomo",
			time: 1710243788,
			items: [
				{
					id: "riverscuomo-item-74",
					type: "photo",
					length: 10,
					src: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					preview: "https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/stories/9.jpg",
					link: "",
					linkText: false,
					time: 1710243788,
				},
			],
		},
	],
})

$("document").ready(function () {
	$("button.navbar-toggle").click(function () {
		var navbar_obj = $($(this).data("target"))
		navbar_obj.toggleClass("open")
	})
	$(".calendar").pignoseCalendar({
		lang: "pt",
		scheduleOptions: {
			colors: {
				offer: "#2fabb7",
				ad: "#5c6270",
			},
		},
		schedules: [
			{
				name: "offer",
				date: "2024-01-24",
			},
			{
				name: "ad",
				date: "2017-02-08",
			},
			{
				name: "offer",
				date: "2017-02-05",
			},
		],
		select: function (date, context) {
			console.log("events for this date", context.storage.schedules)
		},
	})
})
