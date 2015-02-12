/*jshint undef:false */
var BirdBehaviourSinoid2 = Class.extend({
	init:function(props){
		this.props = props;
		this.sin = Math.random();
		this.position = {x: windowWidth + 40, y:windowHeight - windowHeight * 0.15 - (windowHeight * 0.2 * Math.random())};
	},
	clone:function(){
		return new BirdBehaviourSinoid2(this.props);
	},
	update:function(entity){
		if(this.props.velY){
			entity.velocity.y = Math.sin(this.sin) * this.props.velY;
		}else{
			entity.velocity.y = Math.sin(this.sin) * entity.vel;
		}
        this.sin += this.props.sinAcc;
        // console.log(entity.getPosition());
	},
	build:function(){

	},
	destroy:function(){

	},
	serialize:function(){
		
	}
});