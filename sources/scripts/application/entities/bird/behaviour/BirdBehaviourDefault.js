/*jshint undef:false */
var BirdBehaviourDefault = Class.extend({
	init:function(props){
		this.props = props;
		this.position = {x: windowWidth, y: windowHeight * 0.1 + ((windowHeight * 0.8) * Math.random())};
	},
	clone:function(){
		return new BirdBehaviourDefault(this.props);
	},
	update:function(entity){
		//entity.velocity.x = -entity.vel;
	},
	build:function(){

	},
	destroy:function(){

	},
	serialize:function(){
		
	}
});