/*jshint undef:false */
var ChoiceButton = DefaultButton.extend({
	init:function(imgUp, imgOver, imgDown, imgBorder){
		this._super(imgUp, imgOver, imgDown);
		this.color = 0xFFFFFF;
		this.background = new PIXI.Sprite(PIXI.Texture.fromImage(imgDown));
		this.border = new PIXI.Sprite(PIXI.Texture.fromImage(imgBorder));
		this.isBlocked = false;
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
			if(self.isBlocked){
				return;
			}
			self.selectedFunction();
			if(self.mouseUpCallback !== null){
				self.mouseUpCallback();
			}
			if(self.clickCallback !== null){
				self.clickCallback();
			}
			
		};

		// this.shapeButton.click = function(data){
		// 	if(self.isBlocked){
		// 		return;
		// 	}
		// 	// self.shapeButton.tint = 0xFF0000;
		// 	if(self.clickCallback !== null){
		// 		self.clickCallback();
		// 	}
		// };

		// this.shapeButton.tap = function(data){
		// 	if(self.isBlocked){
		// 		return;
		// 	}
		// 	// self.shapeButton.tint = 0xFF0000;
		// 	if(self.clickCallback !== null){
		// 		self.clickCallback();
		// 	}
		// };
		
	},
	block:function(value){
		this.isBlocked = true;
		var desblock = new PIXI.Text(value, { align:'center',fill:'#FFFFFF', font:'30px Roboto'});
		this.thumbGray.tint = 0;
		this.shapeButton.tint = 0x555555;
		var coin = new SimpleSprite('coins.png');

		coin.getContent().position.x = this.background.width / 2 - coin.getContent().width / 2;
		coin.getContent().position.y = this.background.height / 2 - coin.getContent().height / 2 - 10;

		scaleConverter(desblock.height, this.container.height, 0.3, desblock);

		desblock.position.x = this.background.width / 2 - desblock.width / 2;
		desblock.position.y = this.background.height / 2 - desblock.height / 2 + 15;
		this.container.addChild(desblock);
		this.container.addChild(coin.getContent());
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

		this.containerThumbs = new PIXI.DisplayObjectContainer();
		this.thumb = new PIXI.Sprite(PIXI.Texture.fromImage(thumb));
		var scale = scaleConverter(this.thumb.height, this.height, 0.8);
		this.thumb.scale.x = this.thumb.scale.y = scale;
		this.containerThumbs.addChild(this.thumb);
		this.thumb.position.x = this.width / 2 - this.thumb.width / 2;
		this.thumb.position.y = this.height - this.thumb.height - 4;
		this.thumb.visible = false;

		this.thumbGray = new PIXI.Sprite(PIXI.Texture.fromImage(thumbGray));
		// var scaleGrey = scaleConverter(this.thumbGray.width, this.width, 0.8);
		this.thumbGray.scale.x = this.thumbGray.scale.y = scale;
		this.containerThumbs.addChild(this.thumbGray);
		this.thumbGray.position.x = this.width / 2 - this.thumbGray.width / 2;
		this.thumbGray.position.y = this.height - this.thumbGray.height - 4;
		this.thumbGray.visible = true;

		this.maskButton = new PIXI.Graphics();
		this.maskButton.beginFill(0x987653);
		// this.maskButton.drawRoundedRect(4,4,this.width - 8,  this.height - 8,25);
		this.maskButton.drawCircle(this.width/2,this.width/2,this.width / 2 + 6);
		// this.maskButton.alpha = 0.5;
		this.containerThumbs.addChild(this.maskButton);
		this.containerThumbs.mask = this.maskButton;
		this.container.addChild(this.containerThumbs);
		this.container.addChild(this.border);
		this.border.width = this.width;
		this.border.height = this.height;



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