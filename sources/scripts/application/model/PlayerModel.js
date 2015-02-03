/*jshint undef:false */
var PlayerModel = Class.extend({
	init:function(graphicsObject, statsObject){//source, sourceGame,ecoast, bcoast, vel, bvel, bforce, bullet, color, thumb){
		this.range = 40;
		this.maxEnergy = 3000;
		this.currentEnergy = 3000;
		this.maxBulletEnergy = 100;
		this.currentBulletEnergy = 100;
		this.recoverBulletEnergy = 0.5;
		this.chargeBullet = 2;
		this.currentBulletForce = 100;
		this.recoverEnergy = 0.5;
					

		this.thumb = graphicsObject.thumb?graphicsObject.thumb:'thumb_jeiso';
		this.thumbColor = this.thumb + '_color.png';
		this.thumbGray = this.thumb + '_gray.png';
		this.color = graphicsObject.color?graphicsObject.color:0x002233;
		this.imgSource = graphicsObject.outGame?graphicsObject.outGame:'piangersN.png';
		this.imgSourceGame = graphicsObject.inGame?graphicsObject.inGame:'piangersNGame.png';
		this.bulletSource = graphicsObject.bullet?graphicsObject.bullet:'bullet.png';
		this.energyCoast = 4 - statsObject.energyCoast?statsObject.energyCoast:1;
		this.bulletCoast = statsObject.bulletCoast?statsObject.bulletCoast:0.2;
		this.velocity = statsObject.vel?statsObject.vel:2;
		this.bulletVel = statsObject.bulletVel?statsObject.bulletVel:8;
		this.bulletForce = statsObject.bulletForce?statsObject.bulletForce:1;
		
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