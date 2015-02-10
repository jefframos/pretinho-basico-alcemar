/*jshint undef:false */
var Environment =  Class.extend({
	init:function(maxWidth, maxHeight){
		this.velocity = { x:0, y:0 };
		this.texture = '';
		this.sprite = '';
		this.container = new PIXI.DisplayObjectContainer();
		this.updateable = true;
		this.arraySprt = [];
		this.maxWidth = maxWidth;
		this.maxHeight = maxHeight;
		this.texWidth = 0;
		this.spacing = 0;
		this.totTiles = 0;
		this.currentSprId = 0;
	},
	build: function(imgs, spacing){
		this.arraySprt = imgs;

		if(spacing){
			this.spacing = spacing;
		}
		// this.texture = PIXI.Texture.fromFrame(img);
		// this.texWidth = this.texture.width;
		// this.totTiles = Math.ceil(this.maxWidth/this.texWidth) + 1;
		// //trace(totTiles)

		for (var i = Math.floor(this.arraySprt.length * Math.random()); i < this.arraySprt.length; i++) {
			if(this.container.width > this.maxWidth){
				break;
			}
			this.currentSprId = i;
			this.addEnv();
		}
		//// console.log('this');
	},
	addEnv: function(){
		this.sprite = new PIXI.Sprite(PIXI.Texture.fromFrame(this.arraySprt[this.currentSprId]));
		this.sprite.cacheAsBitmap = true;
		var last = this.container.children[this.container.children.length - 1];
		if(last){
			this.sprite.position.x = last.position.x + last.width - 2;
		}
		
		this.sprite.position.y = this.maxHeight - this.sprite.height;
		this.container.addChild(this.sprite);
	},
	update: function(){
		if(!this.container.children){
			//console.log(this.container);
			return;
		}
		for (var i = this.container.children.length - 1; i >= 0; i--) {
			if(this.container.children[i].position.x + this.container.children[i].width < 0)
			{
				this.container.removeChild(this.container.children[i]);
			}
			this.container.children[i].position.x += this.velocity.x;
		}
		var last = this.container.children[this.container.children.length - 1];
		if(last.position.x + last.width - 20 < this.maxWidth){
			this.currentSprId ++;
			if(this.currentSprId >= this.arraySprt.length)
			{
				this.currentSprId = 0;
			}
			this.addEnv();
		}
	},//retorna o container que está a imagem
	getContent: function(){
		return this.container;
	},
});