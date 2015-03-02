/*jshint undef:false */
var BirdModel = Class.extend({
	init:function(graphicsObject, statsObjec){

		this.cover = graphicsObject.cover?graphicsObject.cover:'belga.png';
		this.imgSource = graphicsObject.source?graphicsObject.source:['belga.png'];
		this.particles = graphicsObject.particles?graphicsObject.particles:['smoke.png'];
		this.egg = graphicsObject.egg?graphicsObject.egg:['smoke.png'];
		this.sizePercent = graphicsObject.sizePercent?graphicsObject.sizePercent:0.2;
		this.label = graphicsObject.label?graphicsObject.label:'';
		
		this.demage = statsObjec.demage;
		this.vel = statsObjec.vel;
		this.hp = statsObjec.hp;
		this.target = statsObjec.target;
		this.timeLive = 999;
		this.toNext = statsObjec.toNext?statsObjec.toNext:150;
		this.behaviour = statsObjec.behaviour;
		this.money = statsObjec.money;
	},
	serialize:function(){
		
	}
});