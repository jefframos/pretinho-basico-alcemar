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

		this.backBars = new SimpleSprite('backBars.png');
		this.boxContainer.addChild(this.backBars.getContent());

		this.exitButton = new DefaultButton('simpleButtonOver.png', 'simpleButtonUp.png');
        this.exitButton.build(this.backBars.getContent().width - 20, 60);
		this.exitButton.addLabel(new PIXI.Text('CONTINUE', { align:'center', fill:'#033E43', font:'30px Luckiest Guy', wordWrap:true, wordWrapWidth:300}),35,12);
        this.exitButton.setPosition(this.backBars.getContent().width / 2 - this.exitButton.width / 2, 8);//this.backBars.getContent().height / 2 - this.exitButton.height / 2 - 10);
        this.boxContainer.addChild(this.exitButton.getContent());
        this.exitButton.clickCallback = function(){
            self.hide(function(){self.screen.updateable = true;});
        };


        this.restartButton = new DefaultButton('simpleButtonOver.png', 'simpleButtonUp.png');
		this.restartButton.build(this.exitButton.width, 60);
		this.restartButton.addLabel(new PIXI.Text('REINICIAR', { align:'center', fill:'#033E43', font:'30px Luckiest Guy', wordWrap:true, wordWrapWidth:300}),48,12);
		this.restartButton.setPosition(this.backBars.getContent().width / 2 - this.restartButton.width / 2, this.exitButton.getContent().height +this.exitButton.getContent().position.y + 20);
		this.boxContainer.addChild(this.restartButton.getContent());
		this.restartButton.clickCallback = function(){
			self.hide(function(){
				self.screen.updateable = true;
				self.screen.reset();
			});
		};

		this.backButton = new DefaultButton('simpleButtonOver.png', 'simpleButtonUp.png');
		this.backButton.build(this.exitButton.width, 60);
		this.backButton.addLabel(new PIXI.Text('VOLTAR', { align:'center', fill:'#033E43', font:'30px Luckiest Guy', wordWrap:true, wordWrapWidth:300}),48,12);
		this.backButton.setPosition(this.backBars.getContent().width / 2 - this.backButton.width / 2, this.restartButton.getContent().height +this.restartButton.getContent().position.y + 20);
		this.boxContainer.addChild(this.backButton.getContent());
		this.backButton.clickCallback = function(){
			self.hide(function(){
				self.screen.screenManager.prevScreen();
			});
		};

        this.boxContainer.addChild(this.restartButton.getContent());
        this.boxContainer.alpha = 0;
        this.boxContainer.visible = false;

        this.boxContainer.position.x = windowWidth / 2 - this.boxContainer.width / 2;
        this.boxContainer.position.y = this.boxContainer.height;
	},
	show:function(points){
		this.screen.addChild(this);
		this.boxContainer.visible = true;
		this.container.parent.setChildIndex(this.container,this.container.parent.children.length -1);

		this.screen.updateable = false;
		TweenLite.to(this.bg, 0.5, {alpha:0.8});
		TweenLite.to(this.boxContainer.position, 1, {y:windowHeight / 2 - this.boxContainer.height / 2, ease:'easeOutBack'});
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