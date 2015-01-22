/*jshint undef:false */
var AppModel = Class.extend({
	init:function(){
		this.currentPlayerModel = {};

		//source, energy coast, bullet coast, vel, bullet vel, bullet force
		this.playerModels = [new PlayerModel(),new PlayerModel('piangers0001.png', 0.1,0.4,1.5,4,2)];
		this.setModel(0);
	},
	setModel:function(id){
		this.currentID = id;
		this.currentPlayerModel = this.playerModels[id];
	},
	build:function(){

	},
	destroy:function(){

	},
	serialize:function(){
		
	}
});