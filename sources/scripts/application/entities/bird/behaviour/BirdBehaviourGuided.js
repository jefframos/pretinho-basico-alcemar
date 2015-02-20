/*jshint undef:false */
var BirdBehaviourGuided = Class.extend({
	init:function(props){
		this.props = props;
		this.sin = 0;
		this.position = {x: windowWidth, y: windowHeight * 0.1 + ((windowHeight * 0.8) * Math.random())};
	},
	clone:function(){
		return new BirdBehaviourSinoid(this.props);
	},
	update:function(entity){
		entity.velocity.y = Math.sin(this.sin) * entity.vel;
        this.sin += this.props.sinAcc;
	},
	build:function(){

	},
	destroy:function(){

	},
	serialize:function(){
		
	}
});