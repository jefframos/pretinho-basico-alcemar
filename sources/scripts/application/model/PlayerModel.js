/*jshint undef:false */
var PlayerModel = Class.extend({
	init:function(graphicsObject, statsObject){//source, sourceGame,ecoast, bcoast, vel, bvel, bforce, bullet, color, thumb){
		this.range = 40;
		this.maxEnergy = 10000;
		this.currentEnergy = 10000;
		this.maxBulletEnergy = 100;
		this.currentBulletEnergy = 100;
		this.recoverBulletEnergy = 0.5;
		this.chargeBullet = 2;
		this.currentBulletForce = 100;
		this.recoverEnergy = 0.5;
					

		this.label = graphicsObject.label?graphicsObject.label:'NOME';
		this.thumb = graphicsObject.thumb?graphicsObject.thumb:'thumb_jeiso';
		this.thumbColor = this.thumb + '_color.png';
		this.thumbGray = this.thumb + '_gray.png';
		this.color = graphicsObject.color?graphicsObject.color:0x002233;
		this.imgSourceGame = graphicsObject.inGame?graphicsObject.inGame:'piangersNGame.png';
		this.imgSource = graphicsObject.outGame?graphicsObject.outGame:this.imgSourceGame;
		this.coverSource = graphicsObject.coverSource?graphicsObject.coverSource:'dist/img/UI/jeisoGrande.png';
		this.bulletSource = graphicsObject.bullet?graphicsObject.bullet:'bullet.png';
		this.bulletRotation = graphicsObject.bulletRotation?graphicsObject.bulletRotation:false;
		this.energyCoast = statsObject.energyCoast?statsObject.energyCoast:1;
		this.energyCoast = (3 * (3)/2 + 1) - this.energyCoast * (this.energyCoast)/2;
		// console.log(this.energyCoast);
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