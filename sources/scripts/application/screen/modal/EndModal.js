/*jshint undef:false */
var EndModal = Class.extend({
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

		this.background  = new SimpleSprite('endModalBg.png');
		this.boxContainer.addChild(this.background.getContent());
		
		this.exitButton = new DefaultButton('simpleButtonUp.png', 'simpleButtonOver.png');
		this.exitButton.build();
		this.exitButton.setPosition(this.background.getContent().width / 2 - this.exitButton.width / 2,
			this.background.getContent().height - this.exitButton.height / 2);

		this.boxContainer.addChild(this.exitButton.getContent());
		this.exitButton.clickCallback = function(){
			self.hide(function(){
				self.screen.updateable = true;
				self.screen.reset();
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
			bird = new SimpleSprite(arrayBirds[cont ++]);
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
			bird = new SimpleSprite(arrayBirds[cont ++]);
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
			bird.getContent().position.x = birdContainer.getContent().width / 2 - bird.getContent().width / 2 + (30 * birdContainer.getContent().scale.x);

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