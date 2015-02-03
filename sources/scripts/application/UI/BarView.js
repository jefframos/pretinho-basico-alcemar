/*jshint undef:false */
var BarView = Class.extend({
	init: function (width, height, maxValue, currentValue){

		this.maxValue = maxValue;
		this.text = 'default';
		this.currentValue = currentValue;
		this.container = new PIXI.DisplayObjectContainer();
		this.width = width;
		this.height = height;
		this.backShape = new PIXI.Graphics();
		// this.backShape.lineStyle(1,0xEEEEEE);
		this.backShape.beginFill(0xFF0000);
		this.backShape.drawRect(0,0,width, height);
		this.container.addChild(this.backShape);

		this.frontShape = new PIXI.Graphics();
		this.frontShape.beginFill(0x00FF00);
		this.frontShape.drawRect(0,0,width, height);
		this.container.addChild(this.frontShape);

		this.frontShape.scale.x = this.currentValue/this.maxValue;
	},
	addBackShape: function(color, size){
		this.back = new PIXI.Graphics();
		this.back.beginFill(color);
		this.back.drawRect(-size/2,-size/2,this.width + size, this.height + size);
		this.container.addChildAt(this.back, 0);
	},
	setFrontColor: function(color){
		if(this.frontShape){
			this.container.removeChild(this.frontShape);
		}
		this.frontShape = new PIXI.Graphics();
		this.frontShape.beginFill(color);
		this.frontShape.drawRect(0,0,this.width, this.height);
		this.container.addChild(this.frontShape);

	},
	setBackColor: function(color){
		if(this.backShape){
			this.container.removeChild(this.backShape);
		}
		this.backShape = new PIXI.Graphics();
		this.backShape.beginFill(color);
		// this.backShape.lineStyle(1,0xEEEEEE);
		this.backShape.drawRect(0,0,this.width, this.height);
		this.container.addChildAt(this.backShape,0);

	},
	setText: function(text){
		if(this.text !== text){
			if(!this.lifebar){
				this.lifebar = new PIXI.Text(text, {fill:'white', align:'center', font:'10px Arial'});
				this.container.addChild(this.lifebar);
			}else
			{
				this.lifebar.setText(text);
			}
		}
	},
	updateBar: function(currentValue, maxValue){
		if(this.currentValue !== currentValue || this.maxValue !== maxValue && currentValue >= 0){
			this.currentValue = currentValue;
			this.maxValue = maxValue;
			this.frontShape.scale.x = this.currentValue/this.maxValue;
			if(this.frontShape.scale.x < 0){
				this.frontShape.scale.x = 0;
			}
		}
	},
	getContent: function(){
		return this.container;
	},
	setPosition: function(x,y){
		this.container.position.x = x;
		this.container.position.y = y;
	},
});