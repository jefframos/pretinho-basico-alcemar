var SimpleEntity =  Class.extend({
	init:function(img){
		if(typeof(img) === "string")
		{
			this.texture = new PIXI.Texture.fromImage(img);
		}
		else
			this.texture = img;

		this.container = new PIXI.Sprite(this.texture);
		this.velocity = {x:0, y:0};
		this.updateable = true;
	},
	update:function(){
		this.container.position.x += this.velocity.x;
		this.container.position.y += this.velocity.y;
	},
	getContent:function(){
		return this.container;
	},
	 //Seta a layer pai da entidade
	preKill: function(){
		this.kill = true;
	},
	//Seta a layer pai da entidade
	setParentLayer: function(parentLayer){
		this.layer = parentLayer;
	},
	setPosition:function(x,y){
		this.container.position.x = x;
		this.container.position.y = y;
	}
});