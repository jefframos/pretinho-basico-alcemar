/*jshint undef:false */
var BirdBehaviourDefault = Class.extend({
	init:function(entity, props){
		this.entity = entity;
		this.props = props;
		this.sin = 0;
	},
	update:function(){
		this.entity.velocity.y = Math.sin(this.sin) * this.entity.vel;
        this.sin += this.props.sinAcc;
	},
	build:function(){

	},
	destroy:function(){

	},
	serialize:function(){
		
	}
});