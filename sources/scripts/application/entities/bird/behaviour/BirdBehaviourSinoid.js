/*jshint undef:false */
var BirdBehaviourSinoid = Class.extend({
	init:function(props){
		this.props = props;
		this.sin = Math.random();
		// this.position = {x: windowWidth, y: windowHeight * 0.1 + ((windowHeight * 0.8) * Math.random())};
		this.position = {x: windowWidth + 40, y:windowHeight * 0.3 + ((windowHeight * 0.6) * Math.random())};
	},
	clone:function(){
		return new BirdBehaviourSinoid(this.props);
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