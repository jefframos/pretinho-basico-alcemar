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
		motionIdle.build('idle', this.getFramesByRange('red0', 1, 26), 1, true, null);
		
		var motionHurt = new SpritesheetAnimation();
		motionHurt.build('hurt', this.getFramesByRange('red0', 28, 43), 1, false, function(){
			self.spritesheet.play('idle');
		});

		this.spritesheet = new Spritesheet();
		this.spritesheet.addAnimation(motionIdle);
		this.spritesheet.addAnimation(motionHurt);
		this.spritesheet.play('idle');

		this.screen = screen;
		this.defaultVel = 50;

	},
	setTarget:function(pos){
		this.target = pos;
		if(pointDistance(0,this.getPosition().y,0, this.target) < 4){
			return;
		}
		if(this.target < this.getPosition().y){
			this.velocity.y = -1;
		}else if(this.target > this.getPosition().y){
			this.velocity.y = 1;
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
		
		if(this.getPosition().x > windowWidth + 50){
			this.preKill();
		}
	},
	destroy:function(){
		this._super();
	}
});