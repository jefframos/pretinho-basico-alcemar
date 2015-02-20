/*jshint undef:false */
// var meter = new FPSMeter();
function testMobile() {
	return Modernizr.touch;// || window.innerWidth < 600;//true;// Modernizr.touch || window.innerWidth < 600;
}


var resizeProportional = true;

var windowWidth = 1334;
var windowHeight = 750;

var realWindowWidth = 1334;
var realWindowHeight = 750;

var gameScale = 1.3;
// alert(window.innerHeight+' - '+ screen.width);
if(testMobile()){
	windowWidth = window.innerWidth * gameScale;
	windowHeight = window.innerHeight * gameScale;
	realWindowWidth = windowWidth;
	realWindowHeight = windowHeight;
}
var windowWidthVar = window.innerWidth;
var windowHeightVar = window.innerHeight;
// var renderer = PIXI.autoDetectRenderer(realWindowWidth, realWindowHeight, null, false, true);

// document.body.appendChild(renderer.view);

// renderer.view.style.width = windowWidth+'px';
// renderer.view.style.height = windowHeight+'px';

var ratio = 1;

var init = false;

var renderer;
var APP;
function update() {
	requestAnimFrame(update );

	if(!init && window.innerWidth > window.innerHeight){
		resizeProportional = true;

		windowWidth = 1334;
		windowHeight = 750;

		realWindowWidth = 1334;
		realWindowHeight = 750;

		gameScale = 1.3;
		if(testMobile()){
			windowWidth = window.innerWidth * gameScale;
			windowHeight = window.innerHeight * gameScale;
			realWindowWidth = windowWidth;
			realWindowHeight = windowHeight;
		}
		// alert(window.innerHeight+' - '+ screen.width);
		windowWidthVar = window.innerWidth;
		windowHeightVar = window.innerHeight;
		renderer = PIXI.autoDetectRenderer(realWindowWidth, realWindowHeight, null, false, true);

		document.body.appendChild(renderer.view);

		renderer.view.style.width = windowWidth+'px';
		renderer.view.style.height = windowHeight+'px';

		
		APP = new Application();
		APP.build();
		APP.show();

		init = true;
	}
	// meter.tickStart();
	var tempRation =  (window.innerHeight/windowHeight);
	var ratioRez = resizeProportional ? tempRation < (window.innerWidth/realWindowWidth)?tempRation:(window.innerWidth/realWindowWidth) : 1;
	windowWidthVar = realWindowWidth * ratioRez * ratio;
	windowHeightVar = realWindowHeight * ratioRez * ratio;
	//proportional
	if(windowWidthVar > realWindowWidth)
	{
		windowWidthVar = realWindowWidth;
	}
	if(windowHeightVar > realWindowHeight)
	{
		windowHeightVar = realWindowHeight;
	}
	renderer.view.style.width = windowWidthVar+'px';
	renderer.view.style.height = windowHeightVar+'px';

	
	APP.update();
	renderer.render(APP.stage);
	// meter.tick();
}



var initialize = function(){
	PIXI.BaseTexture.SCALE_MODE = PIXI.scaleModes.NEAREST;//2;
	// PIXI.Texture.SCALE_MODE.DEFAULT = PIXI.Texture.SCALE_MODE.NEAREST;
	requestAnimFrame(update);
};

function possibleFullscreen(){
	var elem = renderer.view;
	return  elem.requestFullscreen || elem.msRequestFullscreen || elem.mozRequestFullScreen || elem.webkitRequestFullscreen;
}
function fullscreen(){

	var elem = renderer.view;
	if (elem.requestFullscreen) {
		elem.requestFullscreen();
	} else if (elem.msRequestFullscreen) {
		elem.msRequestFullscreen();
	} else if (elem.mozRequestFullScreen) {
		elem.mozRequestFullScreen();
	} else if (elem.webkitRequestFullscreen) {
		elem.webkitRequestFullscreen();
	}
}




(function () {
	var App = {
		init: function () {
			initialize();
		}
	};
	App.init();
})();