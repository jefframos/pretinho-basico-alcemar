/*jshint undef:false */
var BirdModel = Class.extend({
	init:function(source, target, hp, demage, vel, behaviour, toNext, sizePercent){
		this.imgSource = source?source:'belga.png';
		this.demage = demage;
		this.vel = vel;
		this.hp = hp;
		this.target = target;
		this.timeLive = 999;
		this.toNext = toNext?toNext:150;
		this.behaviour = behaviour;
		this.sizePercent = sizePercent;
	},
	serialize:function(){
		
	}
});