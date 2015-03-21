/*jshint undef:false */
var FeedbackModal = Class.extend({
	init:function(screen){
		this.screen = screen;
		console.log(this.screen);
		this.container = new PIXI.DisplayObjectContainer();
		

		var self = this;

		this.container.buttonMode = true;
		this.container.interactive = true;
		this.container.mousedown = this.container.touchstart = function(data){
			// self.hide();
		};
		
		this.backShape = new PIXI.Graphics();
		this.backShape.beginFill(0x012223);
		this.backShape.drawRect(0,0,windowWidth,windowHeight);
		this.backShape.alpha = 0.5;
		this.container.addChild(this.backShape);

		this.textModal = new PIXI.Text('', {align:'center', fill:'#FFFFFF', stroke:'#033E43', strokeThickness:5, font:'30px Luckiest Guy', wordWrap:true, wordWrapWidth:500});
        this.container.addChild(this.textModal);
        this.textModal.position.y = windowHeight / 2 - this.textModal.height / 2;
        this.textModal.position.x = windowWidth / 2 - this.textModal.width / 2;
		// this.boxLabels = [];
		
	},
	setText:function(label){
		this.textModal.setText(label);
		this.textModal.position.y = windowHeight / 2 - this.textModal.height / 2;
        this.textModal.position.x = windowWidth / 2 - this.textModal.width / 2;
	},
	show:function(points){
		this.screen.addChild(this.getContent());
		this.container.parent.setChildIndex(this.container,this.container.parent.children.length -1);
		var self = this;

		setTimeout(function(){
			self.container.mousedown = this.container.touchstart = function(data){
				self.hide();
			};
		}, 5000);
		
		this.screen.updateable = false;
		this.container.alpha = 0;
		TweenLite.to(this.container, 0.5, {alpha:1, onComplete:function(){
			self.container.buttonMode = true;
			self.container.interactive = true;
		}});
		

		
		

		this.container.buttonMode = false;
		this.container.interactive = false;
	},
	hide:function(callback, delay){
		var self = this;
		this.container.buttonMode = false;
		this.container.interactive = false;
		TweenLite.to(this.container, 0.5, {delay:delay?delay:0, alpha:0, onComplete:function(){
			if(callback){
				callback();
				if(self.container.parent){
					self.container.parent.removeChild(self.container);
				}
			}
		}});
	},
	getContent:function(){
		return this.container;
	}
});