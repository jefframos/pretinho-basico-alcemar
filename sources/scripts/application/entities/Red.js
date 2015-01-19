/*jshint undef:false */
var Red = SpritesheetEntity.extend({
	init:function(){
		this._super( true );
	},
	build:function(screen){
		//the texture shoud be loaded before this class are instanced
		//the label, is the label on the json of texture loaded
		//the function 'getFramesByRange', is just a helper, this return one array with the labels of textures on json

		var self = this;
		var motionIdle = new SpritesheetAnimation();
		motionIdle.build('idle', this.getFramesByRange('piangers0', 2, 8), 1, true, null);
		
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

		this.upVel = 1 * gameScale;

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
	update:function(){
		if(this.getPosition().y > windowHeight && this.velocity.y > 0){
			this.velocity.y = 0;
		}else if(this.getPosition().y < 0 && this.velocity.y < 0){
			this.velocity.y = 0;
		}

		if(pointDistance(0,this.getPosition().y,0, this.target) < 4){
			this.velocity.y = 0;
		}

		this._super();

		if(this.getContent().texture){
			this.getContent().texture.rotation = this.velocity.y;
		}
		
		if(this.getPosition().x > windowWidth + 50){
			this.preKill();
		}
	},
	destroy:function(){
		this._super();
	}
});