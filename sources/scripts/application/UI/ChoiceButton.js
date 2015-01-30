/*jshint undef:false */
var ChoiceButton = DefaultButton.extend({
	init:function(imgUp, imgOver, imgDown){
		this._super(imgUp, imgOver, imgDown);
		this.color = 0xFFFFFF;
		this.background = new PIXI.Sprite(PIXI.Texture.fromImage(imgDown));
	},
	build:function( width, height)
	{
		var self = this;

		if(width){
			this.width = width;
		}
		else{
			this.width = this.shapeButton.width;
		}

		if(height){
			this.height = height;
		}
		else{
			this.height = this.shapeButton.height;
		}

		this.background.width = this.width;
		this.background.height = this.height;
		// this.background.position.x = 20;

		this.shapeButton.buttonMode = true;


		this.shapeButton.position.x = 0;
		this.shapeButton.position.y = 0;

		if(width){
			this.shapeButton.width = this.width;
		}
		if(height){
			this.shapeButton.height = this.height;
		}

		this.shapeButton.interactive = true;//(true);

		this.shapeButton.mousedown = this.shapeButton.touchstart = function(data){
			self.selectedFunction();
			
		};

		// set the mouseup and touchend callback..
		this.shapeButton.mouseup = this.shapeButton.touchend = this.shapeButton.touchoutside = this.shapeButton.mouseuoutside = this.shapeButton.touchendoutside = function(data){
			this.isdown = false;
			if(self.mouseUpCallback !== null){
				self.mouseUpCallback();
				console.log('mouseUpCallback');
			}
			
			
			// if(self.isOver)
			// {
			// 	self.shapeButton.setTexture(self.textureButtonOver);
			// }
			// else
			// {
			// 	self.shapeButton.setTexture(self.textureButton);
			// }

		};

		// set the mouseover callback..
		this.shapeButton.mouseover = function(data){

			// self.shapeButton.tint = 0xFF0000;
			self.isOver = true;
			self.shapeButton.setTexture(self.textureButtonOver);
		};

		// set the mouseout callback..
		this.shapeButton.mouseout = function(data){

			self.isOver = false;
			self.shapeButton.setTexture(self.textureButton);

			self.mouseUpCallback();
			// if(self.mouseUpCallback !== null){
			// 	console.log('mouseUpCallback');
			// }
		};

		this.shapeButton.click = function(data){
			// self.shapeButton.tint = 0xFF0000;
			if(self.clickCallback !== null){
				self.clickCallback();
			}
		};

		this.shapeButton.tap = function(data){
			// self.shapeButton.tint = 0xFF0000;
			if(self.clickCallback !== null){
				self.clickCallback();
			}
		};

		
	},
	selectedFunction:function(){
		if(this.mouseDownCallback !== null){
			this.mouseDownCallback();
		}
		this.shapeButton.tint = this.color;
		this.thumb.visible = true;
		this.thumbGray.visible = false;
		this.shapeButton.setTexture(this.textureButtonOver);
		this.container.addChildAt(this.background,0);
		this.isdown = true;
		this.alpha = 1;
	},
	addThumb:function(thumb, thumbGray){
		if(this.thumb && this.thumb.parent){
			this.thumb.parent.removeChild(this.thumb);
		}

		if(this.thumbGray && this.thumbGray.parent){
			this.thumbGray.parent.removeChild(this.thumbGray);
		}

		this.thumb = new PIXI.Sprite(PIXI.Texture.fromImage(thumb));
		var scale = scaleConverter(this.thumb.width, this.width, 0.9);
		this.thumb.scale.x = this.thumb.scale.y = scale;
		this.container.addChild(this.thumb);
		this.thumb.position.x = this.width / 2 - this.thumb.width / 2;
		this.thumb.position.y = this.height - this.thumb.height - 2;
		this.thumb.visible = false;

		this.thumbGray = new PIXI.Sprite(PIXI.Texture.fromImage(thumbGray));
		var scaleGrey = scaleConverter(this.thumbGray.width, this.width, 0.9);
		this.thumbGray.scale.x = this.thumbGray.scale.y = scaleGrey;
		this.container.addChild(this.thumbGray);
		this.thumbGray.position.x = this.width / 2 - this.thumbGray.width / 2;
		this.thumbGray.position.y = this.height - this.thumbGray.height - 2;
		this.thumbGray.visible = true;

	},
	resetTextures:function()
	{
		this.thumb.visible = false;
		this.thumbGray.visible = true;
		this.shapeButton.setTexture(this.textureButton);
		this.shapeButton.tint = 0xFFFFFF;
		if(this.background && this.background.parent){
			this.background.parent.removeChild(this.background);
		}
	}
});