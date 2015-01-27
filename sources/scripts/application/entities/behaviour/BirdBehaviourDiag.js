/*jshint undef:false */
var BirdBehaviourDiag = Class.extend({
	init:function(props){
		this.props = props;
		this.position = {x: windowWidth *0.7 + (windowWidth *0.3) * Math.random(), y:windowHeight};
		this.acc = 0;
	},
	clone:function(){
		this.props.accX = Math.random() * 0.02 + 0.005;
		return new BirdBehaviourDiag(this.props);
	},
	update:function(entity){
		this.acc += this.props.accX;
		entity.velocity.x = -Math.abs(entity.vel);
		entity.velocity.y = entity.vel + this.acc;
		if(entity.velocity.y > 0){
			entity.velocity.y = 0;
		}
	},
	build:function(){

	},
	destroy:function(){

	},
	serialize:function(){
		
	}
});