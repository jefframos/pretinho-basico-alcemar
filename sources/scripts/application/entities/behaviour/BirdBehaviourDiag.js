/*jshint undef:false */
var BirdBehaviourDiag = Class.extend({
	init:function(props){
		this.props = props;
		this.position = {x: windowWidth *0.7 + (windowWidth *0.3) * Math.random(), y:windowHeight};
		this.acc = 0;
	},
	clone:function(){
		return new BirdBehaviourDiag(this.props);
	},
	update:function(entity){
		entity.velocity.y = entity.vel + this.acc;
		this.acc += 0.005;
		entity.velocity.x = -Math.abs(entity.vel);

	},
	build:function(){

	},
	destroy:function(){

	},
	serialize:function(){
		
	}
});