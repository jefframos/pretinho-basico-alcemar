/*jshint undef:false */
var Red = SpritesheetEntity.extend({
	init:function(playerModel){
		this.playerModel = playerModel;
		this._super( true );
	},
	build:function(screen){
		//the texture shoud be loaded before this class are instanced
		//the label, is the label on the json of texture loaded
		//the function 'getFramesByRange', is just a helper, this return one array with the labels of textures on json

		var self = this;
		var motionIdle = new SpritesheetAnimation();
		// motionIdle.build('idle', this.getFramesByRange('piangers0', 2, 8), 1, true, null);
		// console.log(this.playerModel);
		// if(windowHeight > 450){
  //           //this.playerImg  = new SimpleSprite(APP.getGameModel().currentPlayerModel.imgSource);
		// 	motionIdle.build('idle', [this.playerModel.imgSource], 1, true, null);

  //       }else{
  //           //this.playerImg  = new SimpleSprite(APP.getGameModel().currentPlayerModel.imgSourceGame);
  //       }
		motionIdle.build('idle', [this.playerModel.imgSourceGame], 1, true, null);
		
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

		this.upVel = this.playerModel.velocity * gameScale;

		// TweenLite.to(this.getContent().position, 0.5, {x:500});
		// console.log(this.spritesheet.texture.rotation = 10);
		// TweenLite.to(this.spritesheet.texture, 0.5, {rotation:90});
		// this.getContent().pivot.x = this.spritesheet.texture.width * 1.5 ;// / 2;
		// this.getContent().pivot.y = this.spritesheet.texture.height* 1.5;// / 2;
		this.spritesheet.texture.anchor.x = 0.5;
		this.spritesheet.texture.anchor.y = 0.5;
		this.rotation = 0;
		this.centerPosition.x = -this.spritesheet.texture.width /2;
		this.centerPosition.y = -this.spritesheet.texture.height /2;

		this.acceleration = 0.5;

		this.side = 0;

		this.particleAccum = 50;
		// console.log(this.spritesheet.texture);
	},
	setTarget:function(pos){
		this.target = pos;
		if(pointDistance(0,this.getPosition().y,0, this.target) < 4){
			return;
		}

		if(this.target < this.getPosition().y){
			if(this.side === 1){
				this.velocity.y /= 2;
			}
			this.side = -1;


			// this.velocity.y = -this.upVel;
		}else if(this.target > this.getPosition().y){
			if(this.side === -1){
				this.velocity.y /= 2;
			}
			this.side = 1;
			// this.velocity.y = this.upVel;
		}
	},
	update:function(){
		if(!this.gameOver){
			if(this.getPosition().y > windowHeight && this.velocity.y > 0){
				this.velocity.y = 0;
				// TweenLite.to(this.velocity, 0.3, {y:0});
			}else if(this.getPosition().y < 0 && this.velocity.y < 0){
				this.velocity.y = 0;
				// TweenLite.to(this.velocity, 0.3, {y:0});

			}

			if(pointDistance(0,this.getPosition().y,0, this.target) < 4){
				this.velocity.y = 0;
				// TweenLite.to(this.velocity, 0.3, {y:0});

			}else{
				if(Math.abs(this.velocity.y) <  Math.abs(this.upVel)){
					this.velocity.y += this.side * this.acceleration;
				}
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
		if(pointDistance(0,this.getPosition().y,0, this.target) > 10){
			TweenLite.to(this, 0.3, {rotation:(this.velocity.y * 5) * Math.PI / 180});
		}else{
			TweenLite.to(this, 0.3, {rotation:0});
		}
		// this.spritesheet.texture.rotation = this.velocity.y * Math.PI / 180;
		// this.getContent().rotation = this.velocity.y / 10;
		this.range = this.getContent().height * 0.8;
		this.layer.collideChilds(this);
		if(this.getPosition().x > windowWidth + 50){
			this.preKill();
		}

		// this.updateParticles();
	},
	collide:function(arrayCollide){
		if(this.collidable){
			for (var i = arrayCollide.length - 1; i >= 0; i--) {
				var entity = arrayCollide[i];
				if(entity.type !== 'bullet'){
					if(entity.type === 'item'){
						this.playerModel.currentEnergy += this.playerModel.maxEnergy * 0.3;

						var moreComb = new Particles({x:-0.5, y:-(Math.random() * 0.2 + 0.3)}, 120,
			                new PIXI.Text('+ Combustível', {font:'20px Luckiest Guy', fill:'#79DB20', stroke:'#033E43', strokeThickness:3}),
			                0);
			            moreComb.build();
			            moreComb.setPosition(this.getPosition().x,
			                this.getPosition().y - Math.random() * 50);
			            moreComb.alphadecress = 0.01;
			            this.screen.addChild(moreComb);

						if(this.playerModel.currentEnergy > this.playerModel.maxEnergy){
							this.playerModel.currentEnergy = this.playerModel.maxEnergy;
						}
						// console.log(entity.type);
						entity.preKill();
					}else if(entity.type === 'obstacle'){
						var demage = entity.demage * this.playerModel.maxEnergy;
						if(!isNaN(demage)){
							this.playerModel.currentEnergy -= demage;
							entity.preKill();

							var lowComb = new Particles({x:-0.5, y:(Math.random() * 0.2 + 0.3)}, 120,
				                new PIXI.Text('- Combustível', {font:'20px Luckiest Guy', fill:'#F9003C', stroke:'#FFFFFF', strokeThickness:3}),
				                0);
				            lowComb.build();
				            lowComb.setPosition(this.getPosition().x,
				                this.getPosition().y - Math.random() * 10);
				            lowComb.alphadecress = 0.01;
				            this.screen.addChild(lowComb);
						}
					}else if(entity.type !== 'bird'){
						entity.preKill();
					}
					// else{
					// 	var demage = arrayCollide[0].demage * this.playerModel.maxEnergy;
					// 	if(!isNaN(demage)){
					// 		this.playerModel.currentEnergy -= demage;
					// 	}
					// }
					
				}
			}
			
		}
	},
	// updateParticles:function(){
	// 	if(this.particleAccum < 0){
	// 		console.log('particula');
	// 		this.particleAccum = this.playerModel.currentEnergy / this.playerModel.maxEnergy * 50 + 8;
	// 		var particle = new Particles({x:-0.9, y:-(Math.random() * 0.2 + 0.7)}, 1100, 'smoke.png', -0.02 * Math.random() + 0.01);
	// 		particle.build();
	// 		// particle.alphadecress = 0.01;
	// 		// particle.setPosition(this.getPosition().x - this.getContent().width + 5 + 10 * Math.random(),
	// 		// 	this.getPosition().y- this.getContent().height / 2 + 25);

	// 		// particle.setPosition(this.getPosition().x, this.getPosition().y);

	// 		particle.setPosition(this.getPosition().x, windowHeight / 2);

	// 		this.layer.addChild(particle);

	// 	}else{
	// 		this.particleAccum --;
	// 	}
	// },
	destroy:function(){
		this._super();
	}
});