/*jshint undef:false */
var BirdBehaviourDiag = Class.extend({
	init:function(props){
		this.props = props;
		this.up = Math.random() < 0.5 ? true: false;
		this.position = {x: windowWidth *0.7 + (windowWidth *0.3) * Math.random(), y:this.up?0:windowHeight};
		this.acc = 0;
	},
	clone:function(){
		this.props.accX = Math.random() * 0.02 + 0.008;
		return new BirdBehaviourDiag(this.props);
	},
	update:function(entity){
		this.acc += this.props.accX;// * this.up?1:-1;
		entity.acceleration = 1;

		if(this.up){
			//this.acc = -Math.abs(this.acc);
			entity.velocity.y = Math.abs(entity.vel) - this.acc;
			if(entity.velocity.y < 0){
				entity.velocity.y = 0;
			}
		}else{
			entity.velocity.y = entity.vel + this.acc;
			if(entity.velocity.y > 0){
				entity.velocity.y = 0;
			}
		}
		// entity.velocity.x = -Math.abs(entity.vel);
		
	},
	build:function(){

	},
	destroy:function(){

	},
	serialize:function(){
		
	}
});