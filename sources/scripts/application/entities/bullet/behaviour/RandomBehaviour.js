/*jshint undef:false */
var RandomBehaviour = Class.extend({
	init:function(props){
		this.props = props? props : {};
	},
	clone:function(){
		var id = Math.floor(Math.random() * 9);
		if(id === 0){
			return new GiantShootBehaviour({vel:2.5, invencible:true, bulletForce:60, size: 0.8});
		}else if(id === 1){
			return new SequenceBehaviour({angleOpen:0, totalFires: 35});
		}else if(id === 2){
			return new MultipleBehaviour({vel:3, totalFires:8, bulletForce:10, size:0.15, angleOpen:0.25});
		}else if(id === 3){
			return new SequenceBehaviour();
		}else if(id === 4){
			return new MultipleBehaviour({vel:3.5, invencible:true, totalFires:5, bulletForce:5, size:0.5});
		}else if(id === 5){
			return new HomingBehaviour({invencible:true, bulletForce:99, vel:4});
		}else if(id === 6){
			return new AkumaBehaviour();
		}else if(id === 7){
			return new AkumaBehaviour();
		}else if(id === 8){
			return new RainBehaviour();
		}else{
			return new SequenceBehaviour({angleOpen:0, totalFires: 25, sinoid:true, vel:2});
		}
		
	},
	destroy:function(){

	},
	serialize:function(){
		
	}
});