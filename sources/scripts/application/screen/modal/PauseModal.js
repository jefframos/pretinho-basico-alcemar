/*jshint undef:false */
var PauseModal = Class.extend({
	init:function(screen){
		this.screen = screen;
		
		this.container = new PIXI.DisplayObjectContainer();
		this.boxContainer = new PIXI.DisplayObjectContainer();
		this.bg = new PIXI.Graphics();
		this.bg.beginFill(0x000000);
		this.bg.drawRect(0,0,windowWidth, windowHeight);
		this.bg.alpha = 0.0;
		this.container.addChild(this.bg);
		this.container.addChild(this.boxContainer);

		var self = this;

		this.backButton = new DefaultButton('voltarButton.png', 'voltarButton.png');
		this.backButton.build();
		// this.backButton.getContent().scale.x = this.backButton.getContent().scale.y = 0.8;
		this.backButton.setPosition(0, 0);
		this.backButton.clickCallback = function(){
			self.hide(function(){
				self.screen.screenManager.prevScreen();
			});
		};
		this.boxContainer.addChild(this.backButton.getContent());

		this.continueButton = new DefaultButton('continueButtonBig.png', 'continueButtonBig.png');
        this.continueButton.build();
        this.continueButton.setPosition(this.backButton.getContent().width + 20, -this.continueButton.getContent().height / 2 + this.backButton.getContent().height / 2);//this.backBars.getContent().height / 2 - this.continueButton.height / 2 - 10);
        this.continueButton.clickCallback = function(){
            self.hide(function(){self.screen.updateable = true;});
        };
        this.boxContainer.addChild(this.continueButton.getContent());

        this.restartButton = new DefaultButton('replayButton.png', 'replayButton.png');
		this.restartButton.build();
		// this.restartButton.getContent().scale.x = this.restartButton.getContent().scale.y = 0.8;
		this.restartButton.setPosition(this.continueButton.getContent().width + this.continueButton.getContent().position.x + 20, 0);
		this.restartButton.clickCallback = function(){
			self.hide(function(){
				self.screen.updateable = true;
				self.screen.reset();
			});
		};
		this.boxContainer.addChild(this.restartButton.getContent());

        this.boxContainer.alpha = 0;
        this.boxContainer.visible = false;

        this.boxContainer.position.x = windowWidth / 2 - this.boxContainer.width / 2;
        // this.boxContainer.position.y = windowHeight / 2;
	},
	show:function(points){
		this.screen.addChild(this);
		this.boxContainer.visible = true;
		this.container.parent.setChildIndex(this.container,this.container.parent.children.length -1);

		this.screen.updateable = false;
		TweenLite.to(this.bg, 0.5, {alpha:0.8});
		TweenLite.to(this.boxContainer.position, 1, {y:windowHeight / 2 - this.boxContainer.height / 2 - this.continueButton.getContent().position.y, ease:'easeOutBack'});
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