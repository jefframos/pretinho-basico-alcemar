/*jshint undef:false */
var NewBirdModal = Class.extend({
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

		this.feito  = new SimpleSprite('feitoo.png');
		this.container.addChild(this.feito.getContent());
		scaleConverter(this.feito.getContent().width, windowWidth, 0.35, this.feito);
		this.feito.setPosition(windowWidth / 2 - this.feito.getContent().width / 2, -10);


		this.boxContainer.alpha = 0;
		this.boxContainer.visible = false;

		// this.containerScale = scaleConverter(this.boxContainer.height, windowHeight, 0.85);
		scaleConverter(this.boxContainer.height, windowHeight, 0.18, this.boxContainer);

		this.boxContainer.position.x = windowWidth / 2 - this.boxContainer.width / 2;// - this.background.getContent().width * this.containerScale / 2;
		this.boxContainer.position.y = windowHeight;// - this.boxContainer.height - 20;// - this.background.getContent().height * this.containerScale / 2;
	},
	show:function(bird){
		// console.log(bird);
		if(!bird){
			bird = [APP.getGameModel().birdModels[Math.floor(Math.random() * APP.getGameModel().birdModels.length)]];
		}
		if(bird && bird.length > 0){
			var self = this;
			this.newCharContainer = new PIXI.DisplayObjectContainer();
			// APP.getGameModel().ableNewBird();


			var pista = new SimpleSprite('pista.png');
			var holofote = new SimpleSprite('holofote.png');
			var novo = new SimpleSprite('nova_ave.png');
			var ovoquebrado = new SimpleSprite('ovoquebrado.png');
			var penas1 = new SimpleSprite('penasfundo1.png');
			var penas2 = new SimpleSprite('penasfundo2.png');

			var playerImage = null;
			playerImage  = new SimpleSprite(bird[0].imgSource);


			// var playerImage = new SimpleSprite(APP.getGameModel().playerModels[0].im);

			this.newCharContainer.addChild(pista.getContent());
			// scaleConverter(pista.getContent().width, windowWidth, 0.35, pista);
			pista.setPosition(0, holofote.getContent().height - 35);

			this.newCharContainer.addChild(holofote.getContent());
			this.newCharContainer.addChild(ovoquebrado.getContent());
			this.newCharContainer.addChild(penas1.getContent());
			this.newCharContainer.addChild(penas2.getContent());
			this.newCharContainer.addChild(playerImage.getContent());
			this.newCharContainer.addChild(novo.getContent());
			// scaleConverter(holofote.getContent().width, windowWidth, 0.35, holofote);
			holofote.setPosition(pista.getContent().width / 2 - holofote.getContent().width / 2, 0);


			var charLabel = new PIXI.Text(bird[0].label, { align:'center', fill:'#FFFFFF', font:'30px Luckiest Guy', wordWrap:true, wordWrapWidth:300});
			this.newCharContainer.addChild(charLabel);
			this.container.addChild(this.newCharContainer);
			// this.container.buttonMode = true;
			// this.container.interactive = true;


			charLabel.position.x = pista.getContent().width / 2 - charLabel.width / 2;
			charLabel.position.y = pista.getContent().position.y + pista.getContent().height - charLabel.height - 20;

			novo.setPosition(pista.getContent().width / 2 - novo.getContent().width / 2, charLabel.position.y - novo.getContent().height - 20);

			scaleConverter(playerImage.getContent().height, this.newCharContainer.height, 0.3, playerImage);
			scaleConverter(ovoquebrado.getContent().height, this.newCharContainer.height, 0.15, ovoquebrado);
			scaleConverter(penas1.getContent().height, this.newCharContainer.height, 0.2, penas1);
			scaleConverter(penas2.getContent().height, this.newCharContainer.height, 0.2, penas2);
			penas1.setPosition(pista.getContent().width / 2 - penas1.getContent().width * 2, holofote.getContent().height - penas1.getContent().height);
			penas2.setPosition(pista.getContent().width / 2 + penas1.getContent().width, holofote.getContent().height - penas2.getContent().height);
			
			playerImage.setPosition(pista.getContent().width / 2 - playerImage.getContent().width/2, pista.getContent().position.y - playerImage.getContent().height - 10);
			ovoquebrado.setPosition(pista.getContent().width / 2 - ovoquebrado.getContent().width/2, holofote.getContent().height - ovoquebrado.getContent().height);
			
			scaleConverter(this.newCharContainer.height, windowHeight, 1, this.newCharContainer);

			this.newCharContainer.position.x = windowWidth / 2 - this.newCharContainer.width / 2;

			this.feito.getContent().parent.setChildIndex(this.feito.getContent(), this.feito.getContent().parent.children.length - 1);
			
			setTimeout(function(){
					self.container.buttonMode = true;
					self.container.interactive = true;
					self.container.mousedown = self.container.touchstart = function(data){
						self.hide(function(){
							self.screen.updateable = true;
						});
					};
				}, 2000);
			

		}
		this.screen.addChild(this);
		this.screen.updateable = false;
		TweenLite.to(this.bg, 0.5, {alpha:0.5});
		this.container.parent.setChildIndex(this.container,this.container.parent.children.length -1);
	},
	// showPoints:function(){
	// 	if(this.newCharContainer){
	// 		TweenLite.to(this.newCharContainer, 0.5, {alpha:0});
	// 		this.container.interactive = false;
	// 	}
	// 	this.boxContainer.visible = true;
	// 	// TweenLite.to(this.boxContainer.position, 1, {y:windowHeight / 2 - this.background.getContent().height * this.containerScale / 2, ease:'easeOutBack'});
	// 	TweenLite.to(this.boxContainer.position, 1, {y:windowHeight - this.boxContainer.height - 20, ease:'easeOutBack'});
	// 	TweenLite.to(this.boxContainer, 0.5, {alpha:1});
	// },
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
		TweenLite.to(this.container, 0.5, {alpha:0});
	},
	getContent:function(){
		return this.container;
	}
});