/*jshint undef:false */
var CreditsModal = Class.extend({
	init:function(screen){
		this.screen = screen;
		
		this.container = new PIXI.DisplayObjectContainer();
		this.boxContainer = new PIXI.DisplayObjectContainer();
		this.labelsContainer = new PIXI.DisplayObjectContainer();
		this.bg = new PIXI.Graphics();
		this.bg.beginFill(0x000000);
		this.bg.drawRect(0,0,windowWidth, windowHeight);
		this.bg.alpha = 0.0;
		this.container.addChild(this.bg);
		this.container.addChild(this.boxContainer);
		this.container.addChild(this.labelsContainer);

		var self = this;

		this.container.buttonMode = true;
		this.container.interactive = true;
		this.container.mousedown = this.container.touchstart = function(data){
			self.hide();
		};

		this.img = new SimpleSprite('dist/img/UI/creditos.png');
		this.boxContainer.addChild(this.img.getContent());
		this.boxContainer.alpha = 0;
		this.boxContainer.visible = false;

		this.boxLabels = [];

		var tempLabelContainer = null;
		var tempLabel = null;
		var positions = [[windowWidth * 0.1,windowHeight * 0.6], [windowWidth * 0.3,windowHeight * 0.06], [windowWidth * 0.6,windowHeight * 0.05], [windowWidth * 0.8,windowHeight * 0.8]];
		var labels = ['Franer\nBlablabla', 'Raviel\nBlablabla', 'Jeff Ramos\nBlablabla', 'Dani Romanenco\nBlablabla'];
		for (var i = positions.length - 1; i >= 0; i--) {
			tempLabelContainer = new PIXI.DisplayObjectContainer();
			tempLabel = new PIXI.Text(labels[i], { align:'center',font:'60px Luckiest Guy', fill:'#FFFFFF', strokeThickness:5, stroke:'#000000', wordWrap:true, wordWrapWidth:600});
			tempLabelContainer.addChild(tempLabel);
			scaleConverter(tempLabel.height, windowHeight, 0.15, tempLabel);
			this.boxLabels.push(tempLabelContainer);
			this.labelsContainer.addChild(tempLabelContainer);
			tempLabelContainer.position.x = positions[i][0] - tempLabelContainer.width / 2;
			tempLabelContainer.position.y = positions[i][1];
		}

		scaleConverter(this.boxContainer.height, windowHeight, 0.75, this.boxContainer);
		this.boxContainer.position.x = windowWidth / 2 - this.boxContainer.width / 2;
		// this.boxContainer.position.y = windowHeight / 2;
	},
	show:function(points){
		this.screen.addChild(this);

		this.boxContainer.visible = true;
		
		this.boxContainer.position.y = windowHeight+this.boxContainer.height;
		this.container.parent.setChildIndex(this.container,this.container.parent.children.length -1);
		this.boxContainer.alpha = 0;
		this.labelsContainer.alpha = 0;
		this.labelsContainer.position.y = -50;
		this.boxContainer.position.y = windowHeight / 2;
		this.screen.updateable = false;
		TweenLite.to(this.bg, 0.5, {alpha:0.8});
		TweenLite.to(this.boxContainer.position, 0.8, {y:windowHeight-this.boxContainer.height, ease:'easeOutBack'});

		// TweenLite.to(this.boxContainer.position, 1, {y:windowHeight / 2 - this.boxContainer.height / 2 - this.continueButton.getContent().position.y, ease:'easeOutBack'});
		TweenLite.to(this.boxContainer, 0.5, {alpha:1});
		TweenLite.to(this.labelsContainer.position, 0.6, {delay:0.8, y:0});
		var self = this;
		this.container.buttonMode = false;
		this.container.interactive = false;
		TweenLite.to(this.labelsContainer, 0.7, {delay:0.8, alpha:1, onComplete:function(){
			self.container.buttonMode = true;
			self.container.interactive = true;
		}});
	},
	hide:function(callback){
		var self = this;
		this.container.buttonMode = false;
		this.container.interactive = false;
		TweenLite.to(this.bg, 0.5, {alpha:0, onComplete:function(){
			if(callback){
				callback();
				if(self.container.parent){
					self.container.parent.removeChild(self.container);
				}
			}
		}});
		TweenLite.to(this.boxContainer, 1, {y:windowHeight/2});
		TweenLite.to(this.boxContainer, 0.5, {alpha:0});
		TweenLite.to(this.labelsContainer, 0.2, {alpha:0});
	},
	getContent:function(){
		return this.container;
	}
});