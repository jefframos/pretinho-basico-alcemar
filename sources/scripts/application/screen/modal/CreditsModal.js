/*jshint undef:false */
var CreditsModal = Class.extend({
	init:function(screen){
		this.screen = screen;
		
		this.container = new PIXI.DisplayObjectContainer();
		
		// this.labelsContainer = new PIXI.DisplayObjectContainer();
		// this.labelsContainerRight = new PIXI.DisplayObjectContainer();
		// this.footer = new PIXI.DisplayObjectContainer();
		// this.header = new PIXI.DisplayObjectContainer();
		// this.bg = new PIXI.Graphics();
		// this.bg.beginFill(0x012223);
		// this.bg.drawRect(0,0,windowWidth, windowHeight);
		// this.bg.alpha = 0.8;
		// this.container.addChild(this.bg);
		// this.container.addChild(this.labelsContainer);
		// this.container.addChild(this.labelsContainerRight);
		// this.container.addChild(this.footer);
		// this.container.addChild(this.header);

		var self = this;

		this.container.buttonMode = true;
		this.container.interactive = true;
		this.container.mousedown = this.container.touchstart = function(data){
			self.hide();
		};

		// this.img = new SimpleSprite('dist/img/UI/creditos.png');
		
		
		
		var credits = new SimpleSprite('dist/img/UI/creditos.jpg');
		this.container.addChild(credits.getContent());
		scaleConverter(credits.getContent().height, windowHeight, 1, credits);
		credits.getContent().position.x = windowWidth / 2 - credits.getContent().width / 2;
		credits.getContent().position.y = windowHeight / 2 - credits.getContent().height / 2;
		// this.boxLabels = [];


		// var tempLabelContainer = null;
		// var tempLabel = null;
		// var positions = [[windowWidth * 0.2,windowHeight * 0.6], [windowWidth * 0.35,windowHeight * 0.1], [windowWidth * 0.6,windowHeight * 0.08], [windowWidth * 0.8,windowHeight * 0.7]];
		// var labels = ['Franer Rodrigues\nProdutor\nfraner@chilimonk.com', 'Raviel Carvalho\nProdutor\nraviel@chilimonk.com', 'Jeff Ramos\nProgramador\njeffs.ramos@gmail.com', 'Dani Romanenco\nDesigner\nromanenco7@gmail.com'];
		// for (var i = positions.length - 1; i >= 0; i--) {
		// 	tempLabelContainer = new PIXI.DisplayObjectContainer();
		// 	tempLabel = new PIXI.Text(labels[i], { align:'center',font:'30px Luckiest Guy', fill:'#FFFFFF', strokeThickness:5, stroke:'#000000', wordWrap:true, wordWrapWidth:600});
		// 	tempLabelContainer.addChild(tempLabel);
		// 	scaleConverter(tempLabel.height, windowHeight, 0.15, tempLabel);
		// 	this.boxLabels.push(tempLabelContainer);
		// 	this.labelsContainer.addChild(tempLabelContainer);
		// 	tempLabelContainer.position.x = positions[i][0] - tempLabelContainer.width / 2;
		// 	tempLabelContainer.position.y = positions[i][1];
		// }


		// //LEFT
		// var tempText;
		// var cast = '';
		// tempText = new PIXI.Text('ELENCO', { align:'center',font:'30px Roboto', fill:'#EFD952', strokeThickness:1, stroke:'#000000', wordWrap:true, wordWrapWidth:600});
		// tempText.position.x = - tempText.width / 2;
		// this.labelsContainer.addChild(tempText);

		// cast = 'Alexandre Fetter\nEverton Cunha (Mr. Pi)\nPorã (Iglenho Burtet Bernardes)\nLuciano Potter\nMarcos Piangers\n'+
		// 'Pedro Smaniotto (Alcemar)\nDuda Garbi (Jeiso)\nArthur Gubert\nNeto Fagundes\nRodaika Dienstbach';
		// tempText = new PIXI.Text(cast, { align:'center',font:'25px Roboto', fill:'#FFFFFF', strokeThickness:1, stroke:'#000000', wordWrap:true, wordWrapWidth:600});
		// tempText.position.x = - tempText.width / 2;
		// tempText.position.y = this.labelsContainer.height;
		// this.labelsContainer.addChild(tempText);

		// tempText = new PIXI.Text('VOZES E ENREDO', { align:'center',font:'30px Roboto', fill:'#EFD952', strokeThickness:1, stroke:'#000000', wordWrap:true, wordWrapWidth:600});
		// tempText.position.x = - tempText.width / 2;
		// tempText.position.y = this.labelsContainer.height + windowHeight * 0.01;
		// this.labelsContainer.addChild(tempText);

		// cast = 'Pedro Smaniotto';
		// tempText = new PIXI.Text(cast, { align:'center',font:'25px Roboto', fill:'#FFFFFF', strokeThickness:1, stroke:'#000000', wordWrap:true, wordWrapWidth:600});
		// this.labelsContainer.addChild(tempText);
		// tempText.position.x = - tempText.width / 2;
		// tempText.position.y = this.labelsContainer.height;


		// tempText = new PIXI.Text('DIRETOR DO PROJETO', { align:'center',font:'30px Roboto', fill:'#EFD952', strokeThickness:1, stroke:'#000000', wordWrap:true, wordWrapWidth:600});
		// tempText.position.x = - tempText.width / 2;
		// tempText.position.y = this.labelsContainer.height + windowHeight * 0.01;
		// this.labelsContainer.addChild(tempText);

		// cast = 'Marcos Piangers';
		// tempText = new PIXI.Text(cast, { align:'center',font:'25px Roboto', fill:'#FFFFFF', strokeThickness:1, stroke:'#000000', wordWrap:true, wordWrapWidth:600});
		// this.labelsContainer.addChild(tempText);
		// tempText.position.x = - tempText.width / 2;
		// tempText.position.y = this.labelsContainer.height;

		// scaleConverter(this.labelsContainer.height, windowHeight, 0.65, this.labelsContainer);
		// this.labelsContainer.position.x =  windowWidth/2 - windowWidth / 5;
		// this.labelsContainer.position.y = windowHeight * 0.15;

		// //RIGHT
		// // tempText = new PIXI.Text('MARKETING', { align:'center',font:'30px Roboto', fill:'#EFD952', strokeThickness:1, stroke:'#000000', wordWrap:true, wordWrapWidth:600});
		// // tempText.position.x = - tempText.width / 2;
		// // this.labelsContainerRight.addChild(tempText);

		// // cast = 'Fulano A da RBS\nFulano B da RBS';
		// // tempText = new PIXI.Text(cast, { align:'center',font:'25px Roboto', fill:'#FFFFFF', strokeThickness:1, stroke:'#000000', wordWrap:true, wordWrapWidth:600});
		// // tempText.position.x = - tempText.width / 2;
		// // tempText.position.y = this.labelsContainerRight.height;
		// // this.labelsContainerRight.addChild(tempText);

		
		// tempText = new PIXI.Text('PRODUÇÃO', { align:'center',font:'30px Roboto', fill:'#EFD952', strokeThickness:1, stroke:'#000000', wordWrap:true, wordWrapWidth:600});
		// tempText.position.x = - tempText.width / 2;
		// tempText.position.y = this.labelsContainerRight.height + windowHeight * 0.01;
		// this.labelsContainerRight.addChild(tempText);

		// cast = 'Chilimonk Tecnologia\nwww.chilimonk.com';
		// tempText = new PIXI.Text(cast, { align:'center',font:'25px Roboto', fill:'#FFFFFF', strokeThickness:1, stroke:'#000000', wordWrap:true, wordWrapWidth:600});
		// this.labelsContainerRight.addChild(tempText);
		// tempText.position.x = - tempText.width / 2;
		// tempText.position.y = this.labelsContainerRight.height;

		// tempText = new PIXI.Text('EQUIPE DE PRODUÇÃO', { align:'center',font:'30px Roboto', fill:'#EFD952', strokeThickness:1, stroke:'#000000', wordWrap:true, wordWrapWidth:600});
		// tempText.position.x = - tempText.width / 2;
		// tempText.position.y = this.labelsContainerRight.height + windowHeight * 0.01;
		// this.labelsContainerRight.addChild(tempText);

		// cast = 'Franer Rodrigues (diretor executivo)\nRaviel Carvalho (diretor de produção)\nJefferson Ramos (game developer)\nDaniel Romanenco (designer)\nTiago Cunha (backend developer)';
		// tempText = new PIXI.Text(cast, { align:'center',font:'25px Roboto', fill:'#FFFFFF', strokeThickness:1, stroke:'#000000', wordWrap:true, wordWrapWidth:600});
		// this.labelsContainerRight.addChild(tempText);
		// tempText.position.x = - tempText.width / 2;
		// tempText.position.y = this.labelsContainerRight.height;

		// tempText = new PIXI.Text('SONOPLASTIA', { align:'center',font:'30px Roboto', fill:'#EFD952', strokeThickness:1, stroke:'#000000', wordWrap:true, wordWrapWidth:600});
		// tempText.position.x = - tempText.width / 2;
		// tempText.position.y = this.labelsContainerRight.height + windowHeight * 0.01;
		// this.labelsContainerRight.addChild(tempText);

		// cast = 'Magnus Wichmann';
		// tempText = new PIXI.Text(cast, { align:'center',font:'25px Roboto', fill:'#FFFFFF', strokeThickness:1, stroke:'#000000', wordWrap:true, wordWrapWidth:600});
		// this.labelsContainerRight.addChild(tempText);
		// tempText.position.x = - tempText.width / 2;
		// tempText.position.y = this.labelsContainerRight.height;


		// scaleConverter(this.labelsContainerRight.height, windowHeight, 0.5, this.labelsContainerRight);
		// this.labelsContainerRight.position.x = windowWidth/2 + windowWidth / 5;
		// this.labelsContainerRight.position.y = windowHeight * 0.15;


		// cast = 'ESTE GAME É UM OFERECIMENTO DE:\nGRUPO RBS / RÁDIO ATLÂNTIDA / PRETINHO BÁSICO';
		// tempText = new PIXI.Text(cast, { align:'center',font:'30px Roboto', fill:'#EFD952', strokeThickness:1, stroke:'#000000', wordWrap:true, wordWrapWidth:1000});
		// this.footer.addChild(tempText);
		// scaleConverter(this.footer.height, windowHeight, 0.1, this.footer);
		// this.footer.position.x = windowWidth/2 - this.footer.width / 2;
		// this.footer.position.y = windowHeight - this.footer.height - windowHeight * 0.03;

		
		// cast = 'CRÉDITOS';
		// tempText = new PIXI.Text(cast, { align:'center',font:'50px Roboto', fill:'#EFD952', strokeThickness:1, stroke:'#000000', wordWrap:true, wordWrapWidth:1000});
		// this.header.addChild(tempText);
		// scaleConverter(this.header.height, windowHeight, 0.1, this.header);
		// this.header.position.x = windowWidth/2 - this.header.width / 2;
		// this.header.position.y = windowHeight * 0.03;
		
	},
	show:function(points){
		this.screen.addChild(this);
		this.container.parent.setChildIndex(this.container,this.container.parent.children.length -1);
		var self = this;

		
		this.screen.updateable = false;
		this.container.alpha = 0;
		TweenLite.to(this.container, 0.5, {alpha:1, onComplete:function(){
			self.container.buttonMode = true;
			self.container.interactive = true;
		}});
		

		
		

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