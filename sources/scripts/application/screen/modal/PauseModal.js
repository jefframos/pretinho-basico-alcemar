/*jshint undef:false */
var PauseModal = Class.extend({
	init:function(screen){
		this.screen = screen;
		
		this.container = new PIXI.DisplayObjectContainer();
		this.boxContainer = new PIXI.DisplayObjectContainer();
		this.bg = new PIXI.Graphics();
		this.bg.beginFill(0x012223);
		this.bg.drawRect(0,0,windowWidth, windowHeight);
		this.bg.alpha = 0.0;
		this.container.addChild(this.bg);
		this.container.addChild(this.boxContainer);

		var self = this;

		this.backButton = new DefaultButton('voltarButton.png', 'voltarButtonOver.png');
		this.backButton.build();
		// this.backButton.getContent().scale.x = this.backButton.getContent().scale.y = 0.8;
		this.backButton.setPosition(0, 0);
		this.backButton.clickCallback = function(){
			self.hide(function(){
				// self.screen.hideBars();
				self.screen.screenManager.prevScreen();
			});
		};
		this.boxContainer.addChild(this.backButton.getContent());

		this.continueButton = new DefaultButton('continueButtonBig.png', 'continueButtonBigOver.png');
		this.continueButton.build();
		this.continueButton.setPosition(this.backButton.getContent().width + 20, -this.continueButton.getContent().height / 2 + this.backButton.getContent().height / 2);//this.backBars.getContent().height / 2 - this.continueButton.height / 2 - 10);
		this.continueButton.clickCallback = function(){
			self.hide(function(){self.screen.updateable = true;});
		};
		this.boxContainer.addChild(this.continueButton.getContent());

		this.restartButton = new DefaultButton('replayButton.png', 'replayButtonOver.png');
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


		this.audioOn = new DefaultButton('volumeButton_on.png', 'volumeButton_on_over.png');
		this.audioOn.build();
		scaleConverter(this.audioOn.height, windowHeight, 0.15, this.audioOn);
		this.audioOn.setPosition(20, 20);

		this.audioOff = new DefaultButton('volumeButton_off.png', 'volumeButton_off_over.png');
		this.audioOff.build();
		scaleConverter(this.audioOff.height, windowHeight, 0.15, this.audioOff);
		this.audioOff.setPosition(20, 20);

		console.log(APP.mute);

		if(!APP.mute){
            this.container.addChild(this.audioOn.getContent());
        }else{
            this.container.addChild(this.audioOff.getContent());
        }
		
		this.audioOn.clickCallback = function(){
			APP.mute = true;
			Howler.mute();
			if(self.audioOn.getContent().parent)
			{
				self.audioOn.getContent().parent.removeChild(self.audioOn.getContent());
			}
			if(self.audioOff.getContent())
			{
				self.container.addChild(self.audioOff.getContent());
			}
		};
		this.audioOff.clickCallback = function(){
			APP.mute = false;
			Howler.unmute();
			if(self.audioOff.getContent().parent)
			{
				self.audioOff.getContent().parent.removeChild(self.audioOff.getContent());
			}
			if(self.audioOn.getContent())
			{
				self.container.addChild(self.audioOn.getContent());
			}
		};

		this.boxContainer.alpha = 0;
		this.boxContainer.visible = false;

		scaleConverter(this.boxContainer.width, windowWidth, 0.5, this.boxContainer);
		this.boxContainer.position.x = windowWidth / 2 - this.boxContainer.width / 2;
		// this.boxContainer.position.y = windowHeight / 2;
	},
	show:function(points){
		this.screen.addChild(this);
		this.screen.blockPause = true;
		this.boxContainer.visible = true;
		this.container.parent.setChildIndex(this.container,this.container.parent.children.length -1);
		this.container.alpha = 0;
		this.screen.updateable = false;
		TweenLite.to(this.bg, 0.5, {alpha:0.8});
		TweenLite.to(this.boxContainer.position, 1, {y:windowHeight / 2 - this.boxContainer.height / 2 - this.continueButton.getContent().position.y, ease:'easeOutBack'});
		TweenLite.to(this.boxContainer, 0.5, {alpha:1});
		TweenLite.to(this.container, 0.5, {alpha:1});
	},
	hide:function(callback){
		var self = this;
		this.screen.blockPause = false;

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
		TweenLite.to(this.container, 0.5, {alpha:0});
	},
	getContent:function(){
		return this.container;
	}
});