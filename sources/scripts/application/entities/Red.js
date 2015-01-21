/*jshint undef:false */
var Red = SpritesheetEntity.extend({
	init:function(){
		this._super( true );
	},
	build:function(screen, playerModel){
		//the texture shoud be loaded before this class are instanced
		//the label, is the label on the json of texture loaded
		//the function 'getFramesByRange', is just a helper, this return one array with the labels of textures on json

		var self = this;
		var motionIdle = new SpritesheetAnimation();
		// motionIdle.build('idle', this.getFramesByRange('piangers0', 2, 8), 1, true, null);
		motionIdle.build('idle', ['piangersN'], 1, true, null);
		
		var motionHurt = new SpritesheetAnimation();
		motionHurt.build('hurt', this.getFramesByRange('piangers0', 2, 2), 1, false, function(){
			self.spritesheet.play('idle');
		});

		this.spritesheet = new Spritesheet();
		this.spritesheet.addAnimation(motionIdle);
		// this.spritesheet.addAnimation(motionHurt);
		this.spritesheet.play('idle');

		this.screen = screen;
		this.defaultVel = 50 * gameScale;

		this.upVel = playerModel.velocity * gameScale;

		// TweenLite.to(this.getContent().position, 0.5, {x:500});
		// console.log(this.spritesheet.texture.rotation = 10);
		// TweenLite.to(this.spritesheet.texture, 0.5, {rotation:90});
		// this.getContent().pivot.x = this.spritesheet.texture.width * 1.5 ;// / 2;
		// this.getContent().pivot.y = this.spritesheet.texture.height* 1.5;// / 2;
		this.spritesheet.texture.anchor.x = 0.5;
		this.spritesheet.texture.anchor.y = 0.5;
		this.rotation = 0;
		// console.log(this.spritesheet.texture);
	},
	setTarget:function(pos){
		this.target = pos;
		if(pointDistance(0,this.getPosition().y,0, this.target) < 4){
			return;
		}
		if(this.target < this.getPosition().y){
			this.velocity.y = -this.upVel;
		}else if(this.target > this.getPosition().y){
			this.velocity.y = this.upVel;
		}
	},
	// gameOver:function(){
	// 	this.gameOver = true;
	// },
	update:function(){
		if(!this.gameOver){
			if(this.getPosition().y > windowHeight && this.velocity.y > 0){
				this.velocity.y = 0;
			}else if(this.getPosition().y < 0 && this.velocity.y < 0){
				this.velocity.y = 0;
			}

			if(pointDistance(0,this.getPosition().y,0, this.target) < 4){
				this.velocity.y = 0;
			}
		}


		this._super();
		this.spritesheet.texture.anchor.x = 0.5;
		this.spritesheet.texture.anchor.y = 0.5;
		this.spritesheet.texture.rotation  = this.rotation;//(this.velocity.y * 5) * Math.PI / 180;
		if(this.rotation > 360){
			this.rotation = 0;
		}
		// if(this.rotation < 0){
		// 	this.rotation = 360;
		// }
		TweenLite.to(this, 0.3, {rotation:(this.velocity.y * 5) * Math.PI / 180});
		// this.spritesheet.texture.rotation = this.velocity.y * Math.PI / 180;
		// this.getContent().rotation = this.velocity.y / 10;
		
		if(this.getPosition().x > windowWidth + 50){
			this.preKill();
		}
	},
	destroy:function(){
		this._super();
	}
});