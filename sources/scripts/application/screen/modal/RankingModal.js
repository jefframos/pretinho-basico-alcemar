/*jshint undef:false */
var RankingModal = Class.extend({
	init:function(screen){
		this.screen = screen;
		
		this.container = new PIXI.DisplayObjectContainer();
		this.containerGeral = new PIXI.DisplayObjectContainer();
		this.containerSave = new PIXI.DisplayObjectContainer();
		
		var credits = new SimpleSprite('dist/img/UI/fundoRanking.png');
		this.container.addChild(credits.getContent());
		scaleConverter(credits.getContent().height, windowHeight, 1, credits);
		credits.getContent().position.x = windowWidth / 2 - credits.getContent().width / 2;
		credits.getContent().position.y = windowHeight / 2 - credits.getContent().height / 2;


		this.container.addChild(this.containerSave);
		this.container.addChild(this.containerGeral);

		var self = this;

		// this.container.buttonMode = true;
		// this.container.interactive = true;
		// this.container.mousedown = this.container.touchstart = function(data){
		// 	self.hide();
		// };

		// this.img = new SimpleSprite('dist/img/UI/creditos.png');
		
		
		

		var hall = new SimpleSprite('Hall-da-fama.png');
		this.containerSave.addChild(hall.getContent());
		scaleConverter(hall.getContent().height, windowHeight, 0.5, hall);
		hall.getContent().position.x = windowWidth / 2 - hall.getContent().width / 2;
		hall.getContent().position.y = windowHeight*0.05;

		// this.boxLabels = [];

		this.returnButton = new DefaultButton('voltarButton.png', 'voltarButtonOver.png');
		this.returnButton.build();
		scaleConverter(this.returnButton.getContent().height, windowHeight, 0.15, this.returnButton);
		this.returnButton.setPosition(20 ,windowHeight - this.returnButton.getContent().height - 20);
		// TweenLite.from(this.returnButton.getContent().position, 0.8, {delay:0.6, x:- this.returnButton.getContent().width, ease:'easeOutBack'});
		this.containerSave.addChild(this.returnButton.getContent());
		this.returnButton.clickCallback = function(){
			self.hide();
		};


		this.rankingGeral = new DefaultButton('rankingeral.png', 'rankingeral_over.png');
		this.rankingGeral.build();
		scaleConverter(this.rankingGeral.getContent().height, windowHeight, 0.15, this.rankingGeral);
		this.rankingGeral.setPosition(windowWidth / 2 - this.rankingGeral.getContent().width / 2 ,windowHeight - this.rankingGeral.getContent().height - 20);
		// TweenLite.from(this.rankingGeral.getContent().position, 0.8, {delay:0.6, x:- this.rankingGeral.getContent().width, ease:'easeOutBack'});
		this.containerSave.addChild(this.rankingGeral.getContent());
		this.rankingGeral.clickCallback = function(){
			self.geralState();
		};


		this.save = new DefaultButton('salva.png', 'salva_over.png');
		this.save.build();
		scaleConverter(this.save.getContent().height, windowHeight, 0.15, this.save);
		this.save.setPosition(windowWidth - this.save.getContent().width - 20,windowHeight - this.save.getContent().height - 20);
		// TweenLite.from(this.save.getContent().position, 0.8, {delay:0.6, x:- this.save.getContent().width, ease:'easeOutBack'});
		this.containerSave.addChild(this.save.getContent());
		this.save.clickCallback = function(){
			APP.dataManager.sendScore();
		};


		this.pontuação = new SimpleSprite('pontuacao.png');
		this.containerSave.addChild(this.pontuação.getContent());
		scaleConverter(this.pontuação.getContent().height, windowHeight, 0.15, this.pontuação);
		this.pontuação.getContent().position.x = windowWidth / 2 - this.pontuação.getContent().width / 2;
		this.pontuação.getContent().position.y = this.returnButton.getContent().position.y - this.pontuação.getContent().height - 20;
		
	   


		this.tabela = new SimpleSprite('dist/img/UI/tabela.png');
		this.containerGeral.addChild(this.tabela.getContent());
		scaleConverter(this.tabela.getContent().height, windowHeight, 0.85, this.tabela);
		this.tabela.getContent().position.x = windowWidth - this.tabela.getContent().width - windowWidth * 0.05;
		this.tabela.getContent().position.y = windowHeight / 2 - this.tabela.getContent().height / 2;


		this.returnButtonGeral = new DefaultButton('voltarButton.png', 'voltarButtonOver.png');
		this.returnButtonGeral.build();
		scaleConverter(this.returnButtonGeral.getContent().height, windowHeight, 0.15, this.returnButtonGeral);
		this.returnButtonGeral.setPosition(20 ,windowHeight - this.returnButtonGeral.getContent().height - 20);
		// TweenLite.from(this.returnButtonGeral.getContent().position, 0.8, {delay:0.6, x:- this.returnButtonGeral.getContent().width, ease:'easeOutBack'});
		this.containerGeral.addChild(this.returnButtonGeral.getContent());
		this.returnButtonGeral.clickCallback = function(){
			self.saveState();
		};


		this.btnHoje = new DefaultButton('botao_hoje.png', 'botao_hoje_over.png');
		this.btnHoje.build();
		scaleConverter(this.btnHoje.getContent().width, windowHeight, 0.25, this.btnHoje);
		this.btnHoje.setPosition(20 ,windowHeight *0.2);
		// TweenLite.from(this.btnHoje.getContent().position, 0.8, {delay:0.6, x:- this.btnHoje.getContent().width, ease:'easeOutBack'});
		this.containerGeral.addChild(this.btnHoje.getContent());
		this.btnHoje.clickCallback = function(){
			self.updateToday();
		};


		this.btn30 = new DefaultButton('botao_30dias.png', 'botao_30dias_over.png');
		this.btn30.build();
		scaleConverter(this.btn30.getContent().width, windowHeight, 0.25, this.btn30);
		this.btn30.setPosition(20 ,this.btnHoje.getContent().position.y + this.btnHoje.getContent().height + 10);
		// TweenLite.from(this.btn30.getContent().position, 0.8, {delay:0.6, x:- this.btn30.getContent().width, ease:'easeOutBack'});
		this.containerGeral.addChild(this.btn30.getContent());
		this.btn30.clickCallback = function(){
			self.update30();
		};

		this.btnGeral = new DefaultButton('botao_geral.png', 'botao_geral_over.png');
		this.btnGeral.build();
		scaleConverter(this.btnGeral.getContent().width, windowHeight, 0.25, this.btnGeral);
		this.btnGeral.setPosition(20 ,this.btn30.getContent().position.y + this.btn30.getContent().height + 10);
		// TweenLite.from(this.btnGeral.getContent().position, 0.8, {delay:0.6, x:- this.btnGeral.getContent().width, ease:'easeOutBack'});
		this.containerGeral.addChild(this.btnGeral.getContent());
		this.btnGeral.clickCallback = function(){
			self.updateAll();
		};

		this.namesContainer = new PIXI.DisplayObjectContainer();
		this.containerGeral.addChild(this.namesContainer);

	},
	update30:function(){
		
		this.renderNames(APP.dataManager.get30());
	},
	updateAll:function(){
		
		this.renderNames(APP.dataManager.getAll());
	},
	updateToday:function(){
		
		this.renderNames(APP.dataManager.getToday());
	},
	renderNames:function(ret){
		if(this.namesContainer && this.namesContainer.parent){
			this.namesContainer.parent.removeChild(this.namesContainer);
		}
		this.namesContainer = new PIXI.DisplayObjectContainer();
		this.containerGeral.addChild(this.namesContainer);
		for (var i = 0; i < ret.length; i++) {
			var name = new PIXI.Text(ret[i].name, { align:'center', fill:'#FFFFFF', font:'40px Roboto', wordWrap:true, wordWrapWidth:300});
			this.namesContainer.addChild(name);
			scaleConverter(name.height, this.tabela.getContent().height, 0.08, name);
			name.position.y = this.tabela.getContent().position.y + this.tabela.getContent().height * 0.08 + i * this.tabela.getContent().height * 0.091;
			name.position.x = this.tabela.getContent().position.x + this.tabela.getContent().width * 0.1;

			var piloto = new PIXI.Text(ret[i].piloto, { align:'center', fill:'#FFFFFF', font:'40px Roboto', wordWrap:true, wordWrapWidth:300});
			this.namesContainer.addChild(piloto);
			scaleConverter(piloto.height, this.tabela.getContent().height, 0.08, piloto);
			piloto.position.y = this.tabela.getContent().position.y + this.tabela.getContent().height * 0.08 + i * this.tabela.getContent().height * 0.091;
			piloto.position.x = this.tabela.getContent().position.x + this.tabela.getContent().width * 0.59 ;

			var points = new PIXI.Text(ret[i].points, { align:'center', fill:'#FFFFFF', font:'40px Roboto', wordWrap:true, wordWrapWidth:300});
			this.namesContainer.addChild(points);
			scaleConverter(points.height, this.tabela.getContent().height, 0.08, points);
			points.position.y = this.tabela.getContent().position.y + this.tabela.getContent().height * 0.08 + i * this.tabela.getContent().height * 0.091;
			points.position.x = this.tabela.getContent().position.x + this.tabela.getContent().width * 0.85 ;
		}
	},
	saveState:function(){
		console.log('geral');
		this.containerSave.visible = true;
		this.containerGeral.visible = false;
	},
	geralState:function(){
		console.log('geral');
		this.containerSave.visible = false;
		this.containerGeral.visible = true;
		this.updateToday();
	},
	show:function(points){
		this.screen.addChild(this);

		var highsc = APP.dataManager.getHigh();
		// console.log(highsc);
		if(this.high){
			this.high.parent.removeChild(this.high);
		}
		this.high = new PIXI.Text(highsc?highsc: 'Sem pontuação ainda.', { align:'center', fill:'#FFFFFF', font:'40px Roboto', wordWrap:true, wordWrapWidth:800});
		this.containerSave.addChild(this.high);
		scaleConverter(this.high.height, this.pontuação.getContent().height, 0.5, this.high);
		this.high.position.y = this.pontuação.getContent().position.y + this.pontuação.getContent().height - this.high.height - this.pontuação.getContent().height * 0.05;// + this.this.pontuação.getContent().height * 0.08 + i * this.this.pontuação.getContent().height * 0.091;
		this.high.position.x = this.pontuação.getContent().position.x + this.pontuação.getContent().width / 2 - this.high.width / 2;// + this.this.pontuação.getContent().width * 0.1;

		this.containerSave.visible = true;
		this.containerGeral.visible = false;
		this.container.parent.setChildIndex(this.container,this.container.parent.children.length -1);
		var self = this;

		
		this.screen.updateable = false;
		this.container.alpha = 0;
		TweenLite.to(this.container, 0.5, {alpha:1, onComplete:function(){
			self.container.buttonMode = true;
			self.container.interactive = true;
			// self.geral();
		}});
		

		// this.geral();
		

		this.container.buttonMode = false;
		this.container.interactive = false;
		// TweenLite.to(this.labelsContainer, 0.7, {delay:0.4, alpha:1});
		// TweenLite.to(this.labelsContainerRight, 0.7, {delay:0.5,alpha:1});
		// TweenLite.to(this.footer, 0.6, {delay:1,alpha:1, onComplete:function(){
		// 	self.container.buttonMode = true;
		// 	self.container.interactive = true;
		// }});
	},
	hide:function(callback){
		var self = this;
		this.container.buttonMode = false;
		this.container.interactive = false;
		TweenLite.to(this.container, 0.5, {alpha:0, onComplete:function(){
			if(callback){
				callback();
				if(self.container.parent){
					self.container.parent.removeChild(self.container);
				}
			}
		}});
		
		
		// TweenLite.to(this.labelsContainer, 0.2, {alpha:0});
		// TweenLite.to(this.labelsContainerRight, 0.2, {alpha:0});
		// TweenLite.to(this.footer, 0.2, {alpha:0});
	},
	getContent:function(){
		return this.container;
	}
});