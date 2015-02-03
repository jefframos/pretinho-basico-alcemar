/*jshint undef:false */
var PauseModal = Class.extend({
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

		var self = this;

		this.exitButton = new DefaultButton('simpleButtonOver.png', 'simpleButtonUp.png');
        this.exitButton.build(windowWidth * 0.2, windowHeight * 0.2);
        this.exitButton.setPosition(windowWidth / 2 - this.exitButton.width / 2, windowHeight / 2 - this.exitButton.height / 2);
        this.boxContainer.addChild(this.exitButton.getContent());
        this.exitButton.clickCallback = function(){
            self.hide(function(){self.screen.updateable = true;});
        };
        this.boxContainer.addChild(this.exitButton.getContent());
        this.boxContainer.alpha = 0;
        this.boxContainer.visible = false;
	},
	show:function(points){
		this.screen.addChild(this);
		this.boxContainer.visible = true;
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
				if(self.container.parent){
					self.container.parent.removeChild(self.container);
				}
			}
		}});
		TweenLite.to(this.boxContainer.position, 1, {y:-this.boxContainer.height, ease:'easeInBack'});
		TweenLite.to(this.boxContainer, 0.5, {alpha:0});
	},
	getContent:function(){
		return this.container;
	}
});