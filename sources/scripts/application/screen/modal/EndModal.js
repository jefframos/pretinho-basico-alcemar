/*jshint undef:false */
var EndModal = Class.extend({
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

		this.background  = new SimpleSprite('endModalBg.png');
		this.boxContainer.addChild(this.background.getContent());
		

		this.saveButton = new DefaultButton('saveButton.png', 'saveButton.png');
		this.saveButton.build();
		this.saveButton.setPosition(this.background.getContent().width / 2 - this.saveButton.width / 2,
			this.background.getContent().height - 180);
		// this.saveButton.addLabel(new PIXI.Text('JOGAR', { align:'center',fill:'#033E43', font:'80px Luckiest Guy', wordWrap:true, wordWrapWidth:300}),15,12);
		this.boxContainer.addChild(this.saveButton.getContent());
		this.saveButton.clickCallback = function(){
			self.hide(function(){
			});
		};

		// this.twitterButton = new DefaultButton('twitterButton.png', 'twitterButton.png');
		// this.twitterButton.build();
		// this.twitterButton.setPosition(this.saveButton.getContent().position.x - this.twitterButton.width - 10,
		// 	this.background.getContent().height - 170);
		// this.boxContainer.addChild(this.twitterButton.getContent());
		// this.twitterButton.clickCallback = function(){
		// 	self.hide(function(){
		// 	});
		// };

		// this.fbButton = new DefaultButton('fbButton.png', 'fbButton.png');
		// this.fbButton.build();
		// this.fbButton.setPosition(this.saveButton.getContent().position.x + this.saveButton.getContent().width + 10,
		// 	this.background.getContent().height - 170);
		// this.boxContainer.addChild(this.fbButton.getContent());
		// this.fbButton.clickCallback = function(){
		// 	self.hide(function(){
		// 	});
		// };


		this.exitButton = new DefaultButton('continueButtonBig.png', 'continueButtonBig.png');
		this.exitButton.build();
		this.exitButton.setPosition(this.background.getContent().width / 2 - this.exitButton.width / 2,
			this.background.getContent().height - this.exitButton.height / 2);
		// this.exitButton.addLabel(new PIXI.Text('JOGAR', { align:'center',fill:'#033E43', font:'80px Luckiest Guy', wordWrap:true, wordWrapWidth:300}),15,12);
		this.boxContainer.addChild(this.exitButton.getContent());
		this.exitButton.clickCallback = function(){
			self.hide(function(){
				self.screen.updateable = true;
				self.screen.reset();
			});
		};

		this.backButton = new DefaultButton('voltarButton.png', 'voltarButton.png');
		this.backButton.build();
		this.backButton.setPosition(this.exitButton.getContent().position.x - this.backButton.width - 15,
			this.background.getContent().height - this.backButton.height / 2);
		// this.backButton.addLabel(new PIXI.Text('JOGAR', { align:'center',fill:'#033E43', font:'80px Luckiest Guy', wordWrap:true, wordWrapWidth:300}),15,12);
		this.boxContainer.addChild(this.backButton.getContent());
		this.backButton.clickCallback = function(){
			self.hide(function(){
				self.screen.screenManager.prevScreen();
			});
		};


		this.boxContainer.addChild(this.exitButton.getContent());
		this.boxContainer.alpha = 0;
		this.boxContainer.visible = false;

		this.containerScale = scaleConverter(this.boxContainer.height, windowHeight, 0.85);
		this.boxContainer.scale.x = this.containerScale;
		this.boxContainer.scale.y = this.containerScale;

		this.boxContainer.position.x = windowWidth / 2 - this.background.getContent().width * this.containerScale / 2;
		this.boxContainer.position.y = windowHeight / 2 - this.background.getContent().height * this.containerScale / 2;


		var i = 0;
		var tempBirdContainer = null;
		var birdContainer = null;
		var bird = null;

		var arrayBirds = ['belga.png','lambecu.png','roxo.png','belga.png','lambecu.png','roxo.png'];
		var cont = 0;
		for (i = 1; i < 4; i++) {
			tempBirdContainer = new PIXI.DisplayObjectContainer();
			birdContainer = new SimpleSprite('birdContainer.png');
			bird = new SimpleSprite(APP.getGameModel().birdModels[cont ++].imgSource);
			tempBirdContainer.addChild(birdContainer.getContent());
			tempBirdContainer.addChild(bird.getContent());
			this.boxContainer.addChild(tempBirdContainer);
			tempBirdContainer.position.x = -50;
			tempBirdContainer.position.y = (birdContainer.getContent().height - 40) * (i - 1) + 40;
			if(i % 2 === 0){
				birdContainer.getContent().scale.x = -1;
				tempBirdContainer.position.x -= birdContainer.getContent().width;
			}
			bird.getContent().position.y = birdContainer.getContent().height / 2 - bird.getContent().height / 2;
			bird.getContent().position.x = birdContainer.getContent().width / 2 - bird.getContent().width / 2 + (30 * birdContainer.getContent().scale.x);
		}

		for (i = 1; i < 4; i++) {
			tempBirdContainer = new PIXI.DisplayObjectContainer();
			birdContainer = new SimpleSprite('birdContainer.png');
			bird = new SimpleSprite(APP.getGameModel().birdModels[cont ++].imgSource);
			tempBirdContainer.addChild(birdContainer.getContent());
			this.boxContainer.addChild(tempBirdContainer);
			tempBirdContainer.addChild(bird.getContent());
			tempBirdContainer.position.x = 610;
			tempBirdContainer.position.y = (birdContainer.getContent().height - 40) * (i - 1) + 40;
			if(i % 2 !== 0){
				birdContainer.getContent().scale.x = -1;
				tempBirdContainer.position.x -= birdContainer.getContent().width;
			}
			bird.getContent().position.y = birdContainer.getContent().height / 2 - bird.getContent().height / 2;
			bird.getContent().position.x = birdContainer.getContent().width / 2 - bird.getContent().width / 2 + (45 * birdContainer.getContent().scale.x);

		}

		var top = new SimpleSprite('gasoline.png');
		this.boxContainer.addChild(top.getContent());
		top.getContent().position.x = this.background.getContent().width / 2 - top.getContent().width / 2;
		top.getContent().position.y = - top.getContent().height / 2;
	},
	show:function(points){
		this.screen.addChild(this);
		this.container.parent.setChildIndex(this.container,this.container.parent.children.length -1);
		this.boxContainer.visible = true;

		this.screen.updateable = false;
		TweenLite.to(this.bg, 0.5, {alpha:0.8});

		TweenLite.to(this.boxContainer.position, 1, {y:windowHeight / 2 - this.background.getContent().height * this.containerScale / 2, ease:'easeOutBack'});
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