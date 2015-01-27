/*jshint undef:false */
var PlayerModel = Class.extend({
	init:function(source, ecoast, bcoast, vel, bvel, bforce, bullet){
		this.range = 40;
		this.maxEnergy = 100;
		this.maxBulletEnergy = 100;
		this.currentEnergy = 100;
		this.currentBulletEnergy = 100;
		this.recoverBulletEnergy = 0.5;
		this.chargeBullet = 2;
		this.currentBulletForce = 100;
		this.recoverEnergy = 0.5;
					
		this.imgSource = source?source:'piangersN.png';
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