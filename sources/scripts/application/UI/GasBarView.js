/*jshint undef:false */
var GasBarView = Class.extend({
	init: function(backSource, frontSource, _x, _y){

		this.text = 'default';
		this._x = _x;
		this.container = new PIXI.DisplayObjectContainer();
		this.backContainer = new PIXI.DisplayObjectContainer();
		this.container.addChild(this.backContainer);

		this.backShape = new SimpleSprite(backSource);
		this.backShape.getContent().position.y = _y;
		this.backContainer.addChild(this.backShape.getContent());

		this.mask = new PIXI.Graphics();
		this.mask.beginFill(0x00FF00);
		this.mask.drawRect(_x,_y,this.backShape.getContent().width, this.backShape.getContent().height);
		this.backContainer.addChild(this.mask);
		this.backContainer.mask = this.mask;
		// this.frontShape.scale.x = this.currentValue/this.maxValue;

		this.cover = new SimpleSprite(frontSource);
		this.container.addChild(this.cover.getContent());
	},
	updateBar: function(currentValue, maxValue){
		if(this.currentValue !== currentValue || this.maxValue !== maxValue && currentValue >= 0){
			this.currentValue = currentValue;
			this.maxValue = maxValue;
			this.backShape.getContent().position.x = -this.backShape.getContent().width + (this.currentValue/this.maxValue * this.backShape.getContent().width);
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