/*jshint undef:false */
var Paralax =  Class.extend({
	init:function(maxWidth){
		this.velocity = { x:0, y:0 };
		this.texture = '';
		this.sprite = '';
		this.container = new PIXI.DisplayObjectContainer();
		this.updateable = true;
		this.arraySprt = [];
		this.maxWidth = maxWidth;
		this.texWidth = 0;
		this.spacing = 0;
		this.totTiles = 0;
	},
	build: function(img, spacing){
		if(spacing){
			this.spacing = spacing;
		}
		this.texture = PIXI.Texture.fromFrame(img);
		this.texWidth = this.texture.width;
		this.totTiles = Math.ceil(this.maxWidth/this.texWidth) + 1;
		//trace(totTiles)

		for (var i = 0; i<  this.totTiles; i++) {
			this.sprite = new PIXI.Sprite(this.texture);
			this.sprite.position.x = (this.texWidth + this.spacing) * i;
			this.container.addChild(this.sprite);
		}
		console.log('this');
	},
	update: function(){
		if(Math.abs(this.container.position.x + this.velocity.x) >= (this.texWidth + this.totTiles * this.spacing) ){
			this.container.position.x = 0;//-this.velocity.x;
		}
		else{
			this.container.position.x += this.velocity.x;
		}
		this.container.position.y += this.velocity.y;
	},//retorna o container que está a imagem
	getContent: function(){
		return this.container;
	},
});