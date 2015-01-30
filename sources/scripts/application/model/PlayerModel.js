/*jshint undef:false */
var PlayerModel = Class.extend({
	init:function(source, sourceGame,ecoast, bcoast, vel, bvel, bforce, bullet, color, thumb){
		this.range = 40;
		this.maxEnergy = 100;
		this.maxBulletEnergy = 100;
		this.currentEnergy = 100;
		this.currentBulletEnergy = 100;
		this.recoverBulletEnergy = 0.5;
		this.chargeBullet = 2;
		this.currentBulletForce = 100;
		this.recoverEnergy = 0.5;
					

		this.thumb = thumb?thumb:'thumb_jeiso';
		this.thumbColor = this.thumb + '_color.png';
		this.thumbGray = this.thumb + '_gray.png';
		this.color = color?color:0x002233;
		this.imgSource = source?source:'piangersN.png';
		this.imgSourceGame = sourceGame?sourceGame:'piangersNGame.png';
		this.bulletSource = bullet?bullet:'bullet.png';
		this.energyCoast = ecoast?ecoast:0.002;
		this.bulletCoast = bcoast?bcoast:0.2;
		this.velocity = vel?vel:2;
		this.bulletVel = bvel?bvel:8;
		this.bulletForce = bforce?bforce:1;
		
	},
	reset:function(id){
		this.currentEnergy = this.maxEnergy;
		this.currentBulletEnergy = this.maxBulletEnergy;
	},
	build:function(){

	},
	destroy:function(){

	},
	serialize:function(){
		
	}
});