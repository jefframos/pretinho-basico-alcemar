/*jshint undef:false */
var CreditsModal = Class.extend({
	init:function(screen){
		this.screen = screen;
		
		this.container = new PIXI.DisplayObjectContainer();
		this.boxContainer = new PIXI.DisplayObjectContainer();
		this.bg = new PIXI.Graphics();
		this.bg.beginFill(0x004d48);
		this.bg.drawRect(0,0,windowWidth, windowHeight);
		this.bg.alpha = 0.0;
		this.container.addChild(this.bg);
		this.container.addChild(this.boxContainer);
		this.background = new SimpleSprite('credits.png');
		this.boxContainer.addChild(this.background.container);
		// this.background.setPosition(windowWidth / 2 - this.background.getContent().width /2,
		// 	windowHeight / 2 - this.background.getContent().height /2);
		// console.log(windowWidth / 2 - this.background.getContent().width /2);
		this.background.container.position.x = windowWidth / 2 - this.background.getContent().width /2;
		this.background.container.position.y = windowHeight / 2 - this.background.getContent().height /2;

		var bgPos = {x:this.background.container.position.x+70, y:this.background.container.position.y+14};
		
		var self = this;


        this.exitButton = new DefaultButton('close.png', 'close.png');
        this.exitButton.build();
        this.exitButton.setPosition(bgPos.x + 815, bgPos.y  - 28);
        this.boxContainer.addChild(this.exitButton.getContent());
        // this.exitButton.addLabel(new PIXI.Text('<', {font:'40px Arial'}),5,5);
        this.exitButton.clickCallback = function(){
            // self.screenManager.prevScreen();
            self.hide();

        };

        this.boxContainer.alpha = 0;

	},
	show:function(){
		

		// console.log(points,'pointspointspointspointspointspointspointspointspointspointspointspointspoints');
		this.container.parent.setChildIndex(this.container,this.container.parent.children.length -1);

		this.screen.updateable = false;
		TweenLite.to(this.bg, 0.5, {alpha:0.8});
		TweenLite.to(this.boxContainer.position, 1, {y:0, ease:'easeOutBack'});
		TweenLite.to(this.boxContainer, 0.5, {alpha:1});
	},
	hide:function(callback){
		var self = this;
		TweenLite.to(this.bg, 0.5, {alpha:0, onComplete:function(){
			if(callback){
				callback();
			}
		}});
		TweenLite.to(this.boxContainer.position, 1, {y:-this.boxContainer.height, ease:'easeInBack'});
		TweenLite.to(this.boxContainer, 0.5, {alpha:0});
	},
	getContent:function(){
		return this.container;
	}
});