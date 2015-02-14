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

		var self = this;

		this.backShape = new PIXI.Graphics();
		this.backShape.beginFill(0);
		this.backShape.drawRect(0,0,windowWidth, windowHeight);
		this.backShape.alpha = 0.4;
		this.container.addChild(this.backShape);
		this.feito  = new SimpleSprite('feitoo.png');

		this.container.addChild(this.boxContainer);


		this.container.addChild(this.feito.getContent());
		scaleConverter(this.feito.getContent().width, windowWidth, 0.35, this.feito);
		this.feito.setPosition(windowWidth / 2 - this.feito.getContent().width / 2, -10);

		this.backShape.width = this.feito.getContent().width + 50;
		this.backShape.position.x = windowWidth / 2 - this.backShape.width / 2;

		this.backButton = new DefaultButton('menuButton.png', 'menuButton.png');
		this.backButton.build();
		this.backButton.setPosition(0,0);
			// this.background.getContent().height - this.backButton.height / 2);
		// this.backButton.addLabel(new PIXI.Text('JOGAR', { align:'center',fill:'#033E43', font:'80px Luckiest Guy', wordWrap:true, wordWrapWidth:300}),15,12);
		this.boxContainer.addChild(this.backButton.getContent());
		this.backButton.clickCallback = function(){
			self.hide(function(){
				self.screen.screenManager.prevScreen();
			});
		};

		this.trofeuButton = new DefaultButton('trofeuButton.png', 'trofeuButton.png');
		this.trofeuButton.build();
		this.trofeuButton.setPosition(this.backButton.getContent().position.x + this.backButton.getContent().width + 10, 0);
			// this.background.getContent().height - this.trofeuButton.height / 2);
		// this.trofeuButton.addLabel(new PIXI.Text('JOGAR', { align:'center',fill:'#033E43', font:'80px Luckiest Guy', wordWrap:true, wordWrapWidth:300}),15,12);
		this.boxContainer.addChild(this.trofeuButton.getContent());
		this.trofeuButton.clickCallback = function(){
			// self.hide(function(){
			// 	// self.screen.screenManager.prevScreen();
			// });
		};


		this.exitButton = new DefaultButton('replayButton.png', 'replayButton.png');
		this.exitButton.build();
		this.exitButton.setPosition(this.trofeuButton.getContent().position.x + this.exitButton.getContent().width+ 10, 0);
		// 	this.background.getContent().height - this.exitButton.height / 2);
		// this.exitButton.addLabel(new PIXI.Text('JOGAR', { align:'center',fill:'#033E43', font:'80px Luckiest Guy', wordWrap:true, wordWrapWidth:300}),15,12);
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


		// this.containerScale = scaleConverter(this.boxContainer.height, windowHeight, 0.85);
		scaleConverter(this.boxContainer.height, windowHeight, 0.18, this.boxContainer);

		this.boxContainer.position.x = windowWidth / 2 - this.boxContainer.width / 2;// - this.background.getContent().width * this.containerScale / 2;
		this.boxContainer.position.y = windowHeight;


		this.contents = new PIXI.DisplayObjectContainer();
		this.icons = new PIXI.DisplayObjectContainer();

		this.birdIco = new SimpleSprite(APP.getGameModel().birdModels[0].imgSource);
		this.icons.addChild(this.birdIco.getContent());

		this.coinIco = new SimpleSprite('moeda.png');
		this.icons.addChild(this.coinIco.getContent());

		this.labels = ['MASCADA', 'LOUVA-DEUS', 'BOM JESUS', 'CARPINEJAR','ILUMINATI', 'CAMIGOL'];
		shuffle(this.labels);
		this.mascadaLabel = new PIXI.Text(this.labels[0] +'\n'+ this.labels[1], { align:'right', fill:'#FFFFFF', font:'30px Luckiest Guy', wordWrap:true, wordWrapWidth:300});
		

		this.birdIco.setPosition(this.mascadaLabel.width - this.birdIco.getContent().width, 0);
		this.coinIco.setPosition(this.mascadaLabel.width - this.coinIco.getContent().width + 5, this.birdIco.getContent().height + 15);
		this.mascadaLabel.position.y = this.coinIco.getContent().position.y + this.coinIco.getContent().height + 30;

		this.icons.addChild(this.mascadaLabel);

		this.contents.addChild(this.icons);



		this.labels = new PIXI.DisplayObjectContainer();

		this.currentBirds = new PIXI.Text(0, { align:'center', fill:'#FFFFFF', font:'40px Luckiest Guy', wordWrap:true, wordWrapWidth:300});
		this.labels.addChild(this.currentBirds);

		this.currentCoin = new PIXI.Text(0, { align:'center', fill:'#FFFFFF', font:'40px Luckiest Guy', wordWrap:true, wordWrapWidth:300});
		this.labels.addChild(this.currentCoin);

		this.totalCoin = new PIXI.Text(0, { align:'center', fill:'#FFCe00', font:'50px Luckiest Guy', wordWrap:true, wordWrapWidth:300});
		this.labels.addChild(this.totalCoin);

		this.currentBirds.position.y = 10;
		this.currentCoin.position.y = this.currentBirds.position.y + this.currentBirds.height + 30;
		this.totalCoin.position.y = this.currentCoin.position.y + this.currentCoin.height + 35;

		this.contents.addChild(this.labels);

		scaleConverter(this.contents.height, windowHeight, 0.4, this.contents);
		this.labels.position.x = this.icons.x + this.icons.width + 20;

		this.contents.position.x = windowWidth / 2 - this.mascadaLabel.width * this.contents.scale.x;// - this.contents.width / 2;
		this.contents.position.y = windowHeight / 2 - this.contents.height / 2;
		this.container.addChild(this.contents);

		this.contents.alpha = 0;
		this.contents.visible = false;

		console.log(this.icons.position, this.contents.position, this.contents.width);


	},
	show:function(newPlayers){
		// console.log('newPlayers',newPlayers, newPlayers.length);
		// newPlayers = [APP.getGameModel().playerModels[0]];
		this.currentBirds.setText(APP.getGameModel().currentPoints);
		this.currentCoin.setText(APP.getGameModel().currentPoints);
		this.totalCoin.setText(APP.getGameModel().totalPoints);
		if(newPlayers && newPlayers.length > 0){
			var self = this;
			this.newCharContainer = new PIXI.DisplayObjectContainer();
			// APP.getGameModel().ableNewBird();


			var pista = new SimpleSprite('pista.png');
			var holofote = new SimpleSprite('holofote.png');
			var novo = new SimpleSprite('novorecruta.png');

			var playerImage = null;
			if(windowHeight > 450){
				playerImage  = new SimpleSprite(newPlayers[0].imgSource);
			}else{
				playerImage  = new SimpleSprite(newPlayers[0].imgSourceGame);
			}


			// var playerImage = new SimpleSprite(APP.getGameModel().playerModels[0].im);

			this.newCharContainer.addChild(pista.getContent());
			// scaleConverter(pista.getContent().width, windowWidth, 0.35, pista);
			pista.setPosition(0, holofote.getContent().height - 35);

			this.newCharContainer.addChild(holofote.getContent());
			this.newCharContainer.addChild(playerImage.getContent());
			this.newCharContainer.addChild(novo.getContent());
			// scaleConverter(holofote.getContent().width, windowWidth, 0.35, holofote);
			holofote.setPosition(pista.getContent().width / 2 - holofote.getContent().width / 2, 0);


			var charLabel = new PIXI.Text(newPlayers[0].label, { align:'center', fill:'#FFFFFF', font:'50px Luckiest Guy', wordWrap:true, wordWrapWidth:300});
			this.newCharContainer.addChild(charLabel);
			this.container.addChild(this.newCharContainer);
			this.container.buttonMode = true;
			this.container.interactive = true;


			charLabel.position.x = pista.getContent().width / 2 - charLabel.width / 2;
			charLabel.position.y = pista.getContent().position.y + pista.getContent().height - charLabel.height - 20;

			novo.setPosition(pista.getContent().width / 2 - novo.getContent().width / 2, charLabel.position.y - novo.getContent().height - 20);

			scaleConverter(playerImage.getContent().height, this.newCharContainer.height, 0.3, playerImage);
			playerImage.setPosition(pista.getContent().width / 2 - playerImage.getContent().width/2, pista.getContent().position.y - playerImage.getContent().height - 10);
			
			scaleConverter(this.newCharContainer.height, windowHeight, 1, this.newCharContainer);

			this.newCharContainer.position.x = windowWidth / 2 - this.newCharContainer.width / 2;

			this.feito.getContent().parent.setChildIndex(this.feito.getContent(), this.feito.getContent().parent.children.length - 1);
			this.container.mousedown = this.container.touchstart = function(data){
				self.showPoints();
			};

		}else{
			this.showPoints();
		}

		this.screen.addChild(this);
		this.screen.updateable = false;
		TweenLite.to(this.bg, 0.5, {alpha:0.8});
		this.container.parent.setChildIndex(this.container,this.container.parent.children.length -1);
	},
	showPoints:function(){
		if(this.newCharContainer){
			TweenLite.to(this.newCharContainer, 0.5, {alpha:0});
			this.container.interactive = false;
		}
		this.boxContainer.visible = true;
		this.contents.visible = true;
		// TweenLite.to(this.boxContainer.position, 1, {y:windowHeight / 2 - this.background.getContent().height * this.containerScale / 2, ease:'easeOutBack'});
		TweenLite.to(this.boxContainer.position, 1, {y:windowHeight - this.boxContainer.height - 20, ease:'easeOutBack'});
		TweenLite.to(this.boxContainer, 0.5, {alpha:1});
		TweenLite.to(this.contents, 0.5, {alpha:1});
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
		TweenLite.to(this.container, 0.5, {alpha:0});

	},
	getContent:function(){
		return this.container;
	}
});