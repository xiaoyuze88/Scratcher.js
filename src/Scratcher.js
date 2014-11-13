/*

Scratcher.js

Versions : 1.0

by Xiaoyuze ( xiaoyuze.com ) 
xiaoyuze88@gmail.com


quick Example:
new Scratcher({
    selector: '#pluggin_canvas',
    'imgUrl': 'yourImageUrl.jpg',
    onScratchFinish: function() {
        //do something when scratch is over
    },
    onLoadFinish: function() {
        //do something when your image is loaded
    },
    onScratch : function() {
        //do something when scratching
    }
});

    @param 
        options : {
            selector : null,
            imgUrl :  options.imgUrl,   //The image you want to scratch
            width : null,       //You can set your canvas elements' width and height,
            height : null,      //if not passing this param, we'll get them when initilizing.
            weight : 80,        //The scratch's weight, decide how big the scratching pen will be, default to be 80.
            startRightNow : false,      // If initialize the canvas and ready to start when NEW the Scrather,
                                        // default to be false, you can use the `start` Function to set the canvas to be ready 
                                        // whenever you needed.
            noRetina : false,       // By default the canvas' size will be set to twice as it's element's original size due to our retina optimise, you can cancel that by set this option to `true`.
                                    // !!NOTICE:
                                    // When you need to optimise for retina, don't forget to set your canvas' width/height in style!
                                    // If not, every position caculating will be set to twice as it real is.
            leftCountAccuracy : 64,     // The rate that how accuracy that we caculate how many pixels are lefted on canvas
                                        // The bigger is less accurate, set it to a bigger value to achieve a better performance.
            useDebouncing : true,   // Whether or not use caculate debouncing, set it to false to get more accurate on caculating
                                    // how many pixels are lefted on canvas, but it will EXTREMELY slow your app down, especially on old Android.
            debouncingTimeGap : 500,    // If you're using debouncing, this option will define 
                                        // how long the time gap is between we check how many pixels are left on canvas
                                        // Default to be 500ms.
            useFakeCaculate : false     // If you are really concern about the canvas' performance, 
                                        // and you do need to detect whether user has scratched finish or not,
                                        // you can set this option to true.
        }
*/


/**
*   AMD/CommonJS supported
*/
;(function(factory) {
    if (typeof exports == "object" && typeof module == "object") // CommonJS
        module.exports = factory();
    else if (typeof define == "function" && define.amd) // AMD
        return define([], factory);
    else // Plain browser env
        this.Scratcher = factory();
})(function() {

    'use strict';

    var isTouch = "ontouchstart" in window,
        Events = {
            DOWN: isTouch ? "touchstart" : "mousedown",
            UP: isTouch ? "touchend" : "mouseup",
            MOVE: isTouch ? "touchmove" : "mousemove"
        };

    var Sys = function() {
        var ua = navigator.userAgent.toLowerCase(),
            isAndroid = ua.indexOf("android") > -1 ? true : false,
            androidVersion = -1; 

        isAndroid && (androidVersion = ua.split("android")[1], androidVersion = parseFloat(androidVersion.substring(0, androidVersion.indexOf(";")))); //或者安卓的大版本号

        var hasIssueCanvas = isAndroid && androidVersion == 4.2;
        return {
            hasIssueCanvas: hasIssueCanvas
        }
    }();

    /**
    *   Events that now supported
    */
    var supportEvents = 'scratch loadFinish scratchFinish';
    
    /**
     *   options : {
     *       selector : '#your canvas',
     *       'imgUrl' : 'imgUrl_url',
     *       'background_img' : 'background_img_url',
     *      
     *   }
     */
    function Scratcher(options) {
        // debugger
        if (!options) {
            throw new Error("Options is empty!");
            return;
        }

        // initialize options
        if(!_init.call(this,options)){
            // return when options is illegal
            throw new Error("Options is not legal!");
            return;
        }


        _loadImages.call(this);
    };

    function _init(options) {

        var defaultOptions = {
            /**
            *   Your canvas element's css selector, like '#canvas_id'
            */
            selector : null,
            /**
            *   The image you want to scratch
            */
            imgUrl :  options.imgUrl,
            /**
            *   You can set your canvas elements' width and height,
            *   if not passing this param, we'll get them when initilizing.
            */
            width : null,   
            height : null,
            /**
            *   The scratch's weight, decide how big the scratching pen will be, default to be 80.
            */
            weight : 80,
            /**
            *   If initialize the canvas and ready to start when NEW the Scrather,
            *   default to be false, you can use the `start` Function to set the canvas to be ready 
            *   whenever you needed.
            */
            startRightNow : false,
            /**
            *   By default the canvas' size will be set to twice as it's element's original size due to our retina optimise,
            *   you can cancel that by set this option to `true`.
            *   
            *   !!NOTICE:
            *   When you need to optimise for retina, don't forget to set your canvas' width/height in style!
            *   If not, every position caculating will be set to twice as it real is.
            */
            noRetina : false,
            /**
            *   The rate that how accuracy that we caculate how many pixels are lefted on canvas
            *   The bigger is less accurate, set it to a bigger value to achieve a better performance.
            */
            leftCountAccuracy : 64,
            /**
            *   Whether or not use caculate debouncing, set it to false to get more accurate on caculating
            *   how many pixels are lefted on canvas, but it will EXTREMELY slow your app down, 
            *   especially on old Android.
            */
            useDebouncing : true,
            /**
            *   If you're using debouncing, this option will define 
            *   how long the time gap is between we check how many pixels are left on canvas
            *   Default to be 500ms.
            */
            debouncingTimeGap : 500,
            /**
            *   If you are really concern about the canvas' performance, 
            *   and you do need to detect whether user has scratched finish or not,
            *   you can set this option to true.
            *   We will simply caculate how many times that user moved, and when the time is more enough,
            *   we will trigger your callback when user is click/touch end.
            */
            useFakeCaculate : false
        },
        self = this;
        
        /**
        *   Initialize options
        */
        for( var i in defaultOptions) {
            if(defaultOptions.hasOwnProperty(i)) {
                if(i in options) {
                    this[i] = options[i];
                }
                else {
                    this[i] = defaultOptions[i];
                }
            }
        }

        /**
        *   need canvas' selector!
        */
        if (!this.selector) return false;

        
        /**
        *   cache canvas' DOM element
        */
        this.canvas = $(this.selector)[0];

        /**
        *   cache the context of canvas
        */
        this.ctx = this.canvas.getContext('2d');

        /**
        *   if can't get canvas' content!
        */
        if(!this.ctx) return false;

        this.fresh = true;

        /**
        *   When isStart == true, means the canvas can be scratch off now
        */
        this.isStart = this.startRightNow ? true : false;

        /**
        *   whether the scratching is over
        */
        this.scratchOver = false;

        /**
        *   handle private events
        */
        this._eventsList = {};

        $.each(supportEvents.split(" "),function(i) {
            self._eventsList[this] = [];
        });

        /**
        *   callback when scratching
        */
        if(options.onScratch && isFunction(options.onScratch)) {
            this.on('scratch',options.onScratch);
        }

        /**
        *   callback when the image is loaded
        */
        if(options.onLoadFinish && isFunction(options.onLoadFinish)) {
            this.on('loadFinish',options.onLoadFinish);
        }

        /**
        *  Callback when the canvas is scratched over
        *
        *  !!NOTICE: 
        *  Every time we check for how many pixels are lefted on canvas is VERY costed!
        *  If you don't set this callback, we won't caculate that at all, 
        *   which can extremely speed your app up.
        */  
        if(options.onScratchFinish && isFunction(options.onScratchFinish)) {
            this.on('scratchFinish',options.onScratchFinish);
        }

        /**
        *   Touch down/move events handlers
        *   Put them here to make it easier to remove the event listener
        */
        this.handleStart = handleEventDown.bind(this);
        this.handleMove = handleEventMove.bind(this);

        /**
        *   If not setting the width/height of the canvas, get them here, then get the position of the canvas
        *   
        *   You can call the `resize` Function if your canvas or position has changed.
        */
        if (!this.width) {
            this.width = parseFloat(getComputedStyle(this.canvas).getPropertyValue('width').replace("px", ''));
        }

        if (!this.height) {
            this.height = parseFloat(getComputedStyle(this.canvas).getPropertyValue('height').replace("px", ''));
        }

        /**
        *   If you set `noRetina` option to true, forRetinaRate will be `1`, otherwise it will be `2`
        */
        this.forRetinaRate = this.noRetina ? 1 : 2;
        
        /**
        *   cache the position
        */
        this.position = $(this.canvas).offset();


        this.debouncing = false;

        if(this.useFakeCaculate) {
            this.fakeTimer = null;
            this.fakeCounter = 0;
        }

        return true;
    }

    /**
    *   Load the image
    *   
    *   After the image onload, draw the image on the canvas
    *
    *   TODO: make it possible to load some different images after initialized the canvas
    */
    function _loadImages() {
        var self = this;

        /**
        *   make an instant of an image
        */
        var image = new Image();

        function imageLoaded(e) {

            this.trigger("loadFinish");

            this.canvas.width = this.width * this.forRetinaRate;
            this.canvas.height = this.height * this.forRetinaRate;

            /**
            *   Draw the image on canvas after the image is loaded
            */
            this.ctx.drawImage(image, 0, 0, this.canvas.width, this.canvas.height);

            /**
            *   Initialize canvas' context after drawing the image on canvas
            */
            this.ctx.lineCap = this.ctx.lineJoin = "round";
            this.ctx.lineWidth = this.weight * this.forRetinaRate;
            this.ctx.globalCompositeOperation = "destination-out";

            /**
            *   initialize events
            */
            _initEvents.call(this);
        }

        $(image).on("load", imageLoaded.bind(this));
        image.src = this.imgUrl;
    };

    /**
    *   Initialize click/touch events
    */
    function _initEvents() {

        /**
        *   If isStart == true, add listener now.
        *   If not, add the listener when the `start` Function is called.
        */
        if(this.isStart) {
            $(document).on(Events.DOWN, this.handleStart);
        }
    }

    function handleEventDown(e) {

        var self = this;
        
        if(this.fakeTimer) {
            clearTimeout(this.fakeTimer);
        }

        /**
        *   If the event if trigger from mouseevent, normalize it to touch event
        */
        'mousedown' == e.type && (e = _mouseToTouchEvent(e));

        var touch = e.touches[0];
        var pagex = touch['pageX'];
        var pagey = touch['pageY'];
        var x = pagex - this.position.left;
        var y = pagey - this.position.top;

        this.x1 = x * this.forRetinaRate;
        this.y1 = y * this.forRetinaRate;

        /**
        *   After click/touch start, draw an circle at once
        */
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(this.x1, this.y1, this.weight, 0, 2 * Math.PI);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();

        /**
        *   handle move event
        */
        $(document).on(Events.MOVE, this.handleMove);

        /**
        *   When click/touch end, remove listener for moving
        */
        $(document).one(Events.UP, function() {
            $(document).off(Events.MOVE, this.handleMove);
            if(self.useFakeCaculate) {
                this.fakeTimer = setTimeout(function(){
                    // TODO: 根据图片大小和weight计算这个次数
                    if(self.fakeCounter > 120) {
                        self.trigger("scratchFinish");
                        self.clear();
                        self.scratchOver = true;
                    }
                })
            }
        });
    }

    function handleEventMove(e) {

        /**
        *   Deal with move event
        */
        if (this.isStart && !this.scratchOver) {

            this.trigger("scratch");

            if(this.useFakeCaculate) {
                this.fakeCounter++;
                if(this.fakeTimer) clearTimeout(this.fakeTimer);
            }

            'mousemove' == e.type && (e = _mouseToTouchEvent(e));

            var touch = e.touches[0];

            var pagex = touch['pageX'];
            var pagey = touch['pageY'];
            var x = pagex - this.position.left;
            var y = pagey - this.position.top;

            this.x2 = x * 2;
            this.y2 = y * 2;

            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.moveTo(this.x1, this.y1);
            this.ctx.lineTo(this.x2, this.y2);
            this.ctx.closePath();
            
            /**
            *   Issue found in Android 4.2.2 that canvas can't be repaint currectly when we drawing lines,
            *   so we must to enforce the canvas to repaint by setting its font color to a random color when 
            *   move event triggered.
            *   This could cost a little performance problem.
            */
            if (Sys.hasIssueCanvas) {
                var n = (Math.random() * 10000000) | 0;
                this.canvas.style.color = '#' + n.toString(16);
            }

            this.ctx.stroke();
            this.ctx.restore();

            if(!this.useFakeCaculate && this._eventsList.scratchFinish.length > 0) {
                this.checkLeft();
            }

            this.x1 = this.x2;
            this.y1 = this.y2;

            
        } 
        
        /**
        *   If it comes here, means there should't be this listener
        *   so kill it
        */
        else {
            $(document).off(Events.MOVE, this.handleMove);   
        }
    };

    Scratcher.prototype.checkLeft = function () {
        
        if(this.useDebouncing && this.debouncing) return;

        var i, l;
        var count, total;
        var pixels, pdata;
        var self = this;

        var stride = 4 * this.leftCountAccuracy;

        this.debouncing = true;

        pixels = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        pdata = pixels.data;
        l = pdata.length; // 4 entries per pixel

        total = (l / stride) | 0;

        for (i = count = 0; i < l; i += stride) {
            if (pdata[i] != 0) {
                count++;
            }
        }
        var leftPercent = (count / total) * 100 | 0;

        if(leftPercent < 3) {
            this.trigger("scratchFinish");
            this.scratchOver = true;
            self.clear();
        }

        if(this.useDebouncing) {
            setTimeout(function(){
                self.debouncing = false;
            },500);
        }
    };

    Scratcher.prototype.resize = function() {
        this.width = parseFloat(getComputedStyle(this.canvas).getPropertyValue('width').replace("px", ''));

        this.height = parseFloat(getComputedStyle(this.canvas).getPropertyValue('height').replace("px", ''));

        this.position = $(this.canvas).offset();
    }

    Scratcher.prototype.start = function() {
        this.isStart = true;
        $(document).on(Events.DOWN, this.handleStart);
    }

    Scratcher.prototype.clear = function() {
        this.ctx.clearRect(0, 0, this.width * this.forRetinaRate, this.height * this.forRetinaRate);
    }

    /**
     *      Add event listener
     */
    Scratcher.prototype.on = function (eventName, handler) {

        // Not a supported event
        if(supportEvents.indexOf(eventName) == -1) {
            return;
        }

        // If not initialized
        if (!this._eventsList.hasOwnProperty(eventName)) {
            this._eventsList[eventName] = [];
        }

        this._eventsList[eventName].push(handler);
    };

    /**
     *      Remove event listener
     */
    Scratcher.prototype.off = function (eventName, handler) {

        if (!this._eventsList.hasOwnProperty(eventName)) {
            return;
        }

        var index;

        // If have specific handler, remove it from event list
        if (handler) {
            if ((index = this._eventsList[type].indexOf(handler)) > -1) {
                this._eventsList[type].splice(index, 1);
            }
        } 
        // If not, clear the event handler list of this event
        else {
            this._eventsList[type] = [];
        }
    };

    /**
     *  trigger events
     */
    Scratcher.prototype.trigger = function (eventName) {

        var self = this;

        if (supportEvents.indexOf(eventName) == -1 || !this._eventsList.hasOwnProperty(eventName)) {
            return;
        }

        $.each(this._eventsList[eventName],function(i) {
            isFunction(this) && this.call(self);
        });
    };

    /*------------------------------------*\    
                #common functions
    \*------------------------------------*/


    /**
    *   If the param fn is a function, return true
    */
    function isFunction(fn) {
        return typeof fn === 'function';
    }

    /**
     * Set up a bind if you don't have one
     *
     * Notably, Mobile Safari and the Android web browser are missing it.
     * IE8 doesn't have it, but <canvas> doesn't work there, anyway.
     *
     * From MDN:
     *
     * https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind#Compatibility
     */
    if (!Function.prototype.bind) {
        Function.prototype.bind = function (oThis) {
            if (typeof this !== "function") {
                // closest thing possible to the ECMAScript 5 internal
                // IsCallable function
                throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
            }

            var aArgs = Array.prototype.slice.call(arguments, 1),
                fToBind = this,
                fNOP = function () {
                },
                fBound = function () {
                    return fToBind.apply(this instanceof fNOP
                        ? this
                        : oThis || window,
                        aArgs.concat(Array.prototype.slice.call(arguments)));
                };

            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP();

            return fBound;
        };
    }

    function _mouseToTouchEvent(event) {
        // Normalize mouse event to touch event
        event.touches = [{
            pageX: event.pageX,
            pageY: event.pageY
        }];
        return event;
    };

    return Scratcher;

});
