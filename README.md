# Scratcher.js #

	A tiny `scratch off` pluggin based on HTML5 canvas for mobile. 
	Have only 2.3k after gzip.
	<a href="http://xiaoyuze.com/demo/scratcher/demo.html">Here's a live demo</a>
	

## Support ##

	IE9+ & all mordern browser & all mobile browser (Android 2.3+).
	
## Dependence ##

	Jquery/Zepto needed.

## Quick Start ##

AMD supported, so you can easily use it like:

```javascript

	require(['Scratcher'], function(Scratcher) {
	
		var scratcher = new Scratcher({
			selector: '#canvas',
			imgUrl: 'cat2.jpg',
			onLoadFinish: function() {
				console.log("load finish");
			},
			onScratch: function() {
				console.log("scratching");
			},
			onScratchFinish: function() {
				console.log("finish");
			}
		});

		scratcher.start();
	})

```

If you're not using AMD, the `Scratcher` function will be set under global `window`.

Use it like:

```javascript
	
		var scratcher = new Scratcher({
			selector: '#canvas',
			imgUrl: 'cat2.jpg',
			onLoadFinish: function() {
				console.log("load finish");
			},
			onScratch: function() {
				console.log("scratching");
			},
			onScratchFinish: function() {
				console.log("finish");
			}
		});

		scratcher.start();

```

## Parameters ##

`Scratcher` function accept one parameter `options`

```javascript
	
	options : {
		/**
		*   Your canvas element's css selector, like '#canvas_id'
		*/
		selector : null,
	
		/**
		*   The image url you want to scratch
		*/
		imgUrl :  options.imgUrl,
	
		/**
		*   You can set your canvas element's width and height,
		*   if not passing this param, we'll get them when initilizing.
		*/
		width : null,   
		height : null,
	
		/**
		*   The scratch's weight, decide how big the scratching pen will be. 
		*	Default to be 80.
		*/
		weight : 80,
	
		/**
		*   Whether or not make the canvas ready to scratch
		*	when NEW the Scrather. 
		*	
		*	Default to be false.
		*	
		*   You can use the `start` Function to set the
		*	canvas to be ready whenever you needed.
		*/
		startRightNow : false,
	
		/**
		*   By default the canvas' size will be set to twice as it's
		*	original size due to our optimization for retina device,
		*   you can cancel that by set this option to `true`.
		*   
		*   !!NOTICE:
		*   When you need to optimise for retina, don't forget to set your
		*	canvas' width/height in your css style!
		*   If not, every position caculating will be set to twice as it real is.
		*/
		noRetina : false,
	
		/**
		*   The rate that how accuracy that we caculate how many pixels are
		*	lefted on canvas.
		*   The bigger this value, the less accurate result will come out.
		*	However, set it to a bigger value you can achieve 
		*	a better performance.
		*/
		leftCountAccuracy : 64,
	
		/**
		*   Whether or not to use caculation debouncing.
		*	When this value is setted to false, you can get more
		*	accurate on caculating how many pixels are lefted on canvas,
		*   but it will EXTREMELY slow your app down, 
		*	ESPECIALLY on old Androids.
		*/
		useDebouncing : true,
	
		/**
		*   If you're using debouncing, this option will define 
		*   how long the time gap is between we check how many pixels are 
		*	left on canvas. Default to be 500ms.
		*/
		debouncingTimeGap : 500,

		/**
		*   If you are really concern about the canvas' performance, 
		*   and you do need to detect whether the user has scratched finish or not,
		*   you can set this option to true.
		*
		*   We will simply caculate how many times that user moved, 
		*	and when the time the user moves is more enough,
		*   we will trigger your callback when user is click/touch end.
		*/
		useFakeCaculate : false
    
```

## Method ##

After you NEW an Scratcher, you will get a Scratcher object, which contains these methods.

```javascript

	var scratcher = new Scratcher({
		selector : '#canvas',
		imgUrl : 'image.jpg'
	});
	
```

###scratcher.start() ###

Initialize the canvas and make it ready to be scratched.

If you don't set the `options.startRightNow = true` when NEW your Scratcher, you need to call this function when your user need to scratch.


###scratcher.clear() ###

Clear the image that drawn on the canvas.

This function will be called when the `scratchFinish` event fired, you can also call it your self when you need to clear the mask.

###scratcher.checkLeft() ###

Caculate how many pixels that are lefted on the canvas.

If you set the `options.onScratchFinish` callback or add an event listener for `scratchFinish` event, this function will be called when the user is scratching the canvas. You can also call it yourself.

`Return`
The percentage of the left area on canvas.

`Example`
If the user has scratched off 90% of the canvas, you will get 10 in return.

When the percentage is less 3%, the `scratchFinish`  event will be fired.


###scratcher.resize() ###

Recaculate the canvas' size and position.

We'll caculate the canvas' size and its position when initializing, if your canvas element has changed its size or position, you need to call this function to recaculate them.

###scratcher.on('eventName',callback) ###

Add an event listener for the specific event.

You can call this function repeatedly for different handlers, when the event fired, they will be called one by one in the order of you set them.

###scratcher.off('eventName',[callback]) ###

Remove the event listener's handler.

If you pass the callback parameter, the specific callback function will be removed.
If not passing this paramter, we'll clear all callback functions for this event.

###scratcher.trigger('eventName') ###

Trigger the specific event, all callbacks of this event will be called.



##Events ##

We support three events now, `scratchFinish`,`scratch` and `loadFinish`.
You can use the `on` function to add new callback for them, or you can set the callback when initializing by set `options.onScratchFinish` and so on.


###scratchFinish ###

This event will be fired when you've set a callback function for it.
If the `scratchFinish` event's callback list is empty, we won't caculate the left percentage of the canvas for performance purpose.

###scratch ###

This event will be fired when the user is scratching the canvas.

###loadFinish ###

This event will be fired when the image you want to load and draw it on canvas is load finish.

For example, you can make some notice when the image is load finish and it's ready to be scratched.


## Notice ##

Because when we want to caculate the left percentage that is still on the canvas, we need to load the whole data of the image in memory, and caculate the color of each pixels. The bigger your image is, the bigger cost will take. In some old Android device, this may cost a serious performance problem, even make the browser crash! Please use it carefully when you need to caculate them, or you can use the fake caculation by setting the `options.useFakeCaculate` to `true`. You can simply avoid this problem by not setting any callbacks for the `scratchFinish` event.


If you have any suggestions or find any issues, please feel free to contact me! 
My email is xiaoyuze88@gmail.com.
Hope this will help you.
Thanks!
