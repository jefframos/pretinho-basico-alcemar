/*jshint undef:false */
var AppModel = Class.extend({
	init:function(){
		this.currentPlayerModel = {};

		// source,
		// energy coast,
		// bullet coast,
		// vel,
		// bullet vel,
		// bullet force

		this.playerModels = [
			new PlayerModel('piangersN.png', 0.04,0.1,2,8,1,'bulletSmall.png'),
			new PlayerModel('feter.png', 0.03,0.2,1.5,5,2,'bullet.png'),
			new PlayerModel('alcemar.png', 0.05,0.25,2,4,4,'bullet.png'),
			new PlayerModel('jeso.png', 0.05,0.25,2,4,4,'bullet.png'),
			new PlayerModel('pi.png', 0.05,0.25,2,4,4,'bullet.png'),
			new PlayerModel('pora.png', 0.05,0.25,2,4,4,'bullet.png'),
			new PlayerModel('arthur.png', 0.05,0.25,2,4,4,'bullet.png'),
			new PlayerModel('poter.png', 0.05,0.25,2,4,4,'bullet.png'),
			new PlayerModel('neto.png', 0.05,0.25,2,4,4,'bullet.png'),
			new PlayerModel('rodaika.png', 0.05,0.25,2,4,4,'bullet.png'),
		];

		this.birdModels = [
			new BirdModel('belga.png',null, 4, 0.1, 3, new BirdBehaviourSinoid({sinAcc:0.05}), 120, 0.1),
			new BirdModel('roxo.png',null, 6, 0.2, -3, new BirdBehaviourDiag({accX:0.02}), 200, 0.15),
			new BirdModel('lambecu.png',null, 6, 0.2, -2, new BirdBehaviourDefault(), 150, 0.1)
		];

		this.setModel(0);
	},
	setModel:function(id){
		this.currentID = id;
		this.currentPlayerModel = this.playerModels[id];
	},
	getNewBird:function(player){
		var id = Math.floor(this.birdModels.length * Math.random());
		this.birdModels[id].target = player;
		var bird = new Bird(this.birdModels[id]);
        return bird;
	},
	build:function(){

	},
	destroy:function(){

	},
	serialize:function(){
		
	}
});