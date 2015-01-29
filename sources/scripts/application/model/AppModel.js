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
			new PlayerModel('piangersN.png', 'piangersNGame.png',0.04,0.1,2,9,1,'bulletSmall.png'),
			new PlayerModel('feter.png', 'feterGame.png',0.03,0.2,1.5,6,2,'bullet.png'),
			new PlayerModel('alcemar.png', 'alcemarGame.png',0.05,0.25,2,6,4,'bullet.png'),
			new PlayerModel('jeso.png', 'jesoGame.png',0.05,0.25,2,6,4,'bullet.png'),
			new PlayerModel('pi.png', 'piGame.png',0.05,0.25,2,6,4,'bullet.png'),
			new PlayerModel('pora.png', 'poraGame.png',0.05,0.25,2,6,4,'bullet.png'),
			new PlayerModel('arthur.png', 'arthurGame.png',0.05,0.25,2,6,4,'bullet.png'),
			new PlayerModel('poter.png', 'poterGame.png',0.05,0.25,2,6,4,'bullet.png'),
			new PlayerModel('neto.png', 'netoGame.png',0.05,0.25,2,6,4,'bullet.png'),
			new PlayerModel('rodaika.png', 'rodaikaGame.png',0.05,0.25,2,6,4,'bullet.png'),
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