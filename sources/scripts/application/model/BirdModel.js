/*jshint undef:false */
var BirdModel = Class.extend({
	init:function(source, target, hp, demage, vel, timeLive){
		this.imgSource = source?source:'belga.png';
		this.demage = demage;
		this.vel = vel;
		this.hp = hp;
		this.target = target;
		this.timeLive = timeLive;
	},
	serialize:function(){
		
	}
});