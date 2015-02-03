/*jshint undef:false */
var AppModel = Class.extend({
	init:function(){
		this.currentPlayerModel = {};

		// source,
		// energy coast, 1 / 3
		// bullet coast,
		// vel, 1 / 3
		// bullet vel,
		// bullet force 1 / 3

		this.playerModels = [

			new PlayerModel({
				outGame:'piangersN.png',
				inGame:'piangersNGame.png',
				bullet:'bulletSmall.png',
				color:0x74CDDF,
				thumb:'thumb_jeiso'
			},
			{
				energyCoast:1.5,
				vel:2.5,
				bulletForce:1.5,
				bulletCoast:0.1,
				bulletVel:9,
			}
			),
			new PlayerModel({
				outGame:'feter.png',
				inGame:'feterGame.png',
				bullet:'bulletSmall.png',
				color:0xEE4323,
				thumb:'thumb_jeiso'
			},
			{
				energyCoast:2,
				vel:1.5,
				bulletForce:2.5,
				bulletVel:6,
				bulletCoast:0.1,
			}
			),
			new PlayerModel({
				outGame:'alcemar.png',
				inGame:'alcemarGame.png',
				bullet:'bulletSmall.png',
				color:0xB2D464,
				thumb:'thumb_jeiso'
			},
			{
				energyCoast:1,
				vel:1,
				bulletForce:2.5,
				bulletCoast:0.1,
				bulletVel:6,
			}
			),
			new PlayerModel({
				outGame:'jeso.png',
				inGame:'jesoGame.png',
				bullet:'bulletSmall.png',
				color:0x88C440,
				thumb:'thumb_jeiso'
			},
			{
				energyCoast:1.5,
				vel:3,
				bulletForce:0.5,
				bulletCoast:0.1,
				bulletVel:8,
			}
			),
			new PlayerModel({
				outGame:'pi.png',
				inGame:'piGame.png',
				bullet:'bulletSmall.png',
				color:0x8F6DAF,
				thumb:'thumb_jeiso'
			},
			{
				energyCoast:3,
				vel:1,
				bulletForce:1,
				bulletCoast:0.1,
				bulletVel:5,
			}
			),
			new PlayerModel({
				outGame:'pora.png',
				inGame:'poraGame.png',
				bullet:'bulletSmall.png',
				color:0xFDCE07,
				thumb:'thumb_jeiso'
			},
			{
				energyCoast:2.5,
				vel:1.5,
				bulletForce:1,
				bulletCoast:0.1,
				bulletVel:5,
			}
			),
			new PlayerModel({
				outGame:'arthur.png',
				inGame:'arthurGame.png',
				bullet:'bulletSmall.png',
				color:0xB383B9,
				thumb:'thumb_jeiso'
			},
			{
				energyCoast:2,
				vel:1,
				bulletForce:2,
				bulletCoast:0.1,
				bulletVel:5,
			}
			),
			new PlayerModel({
				outGame:'poter.png',
				inGame:'poterGame.png',
				bullet:'bulletSmall.png',
				color:0xFAAF4C,
				thumb:'thumb_jeiso'
			},
			{
				energyCoast:1.5,
				vel:2,
				bulletForce:1.5,
				bulletCoast:0.1,
				bulletVel:5,
			}
			),
			new PlayerModel({
				outGame:'neto.png',
				inGame:'netoGame.png',
				bullet:'bulletSmall.png',
				color:0xB3A170,
				thumb:'thumb_jeiso'
			},
			{
				energyCoast:2.5,
				vel:2,
				bulletForce:2,
				bulletCoast:0.1,
				bulletVel:5,
			}
			),
			new PlayerModel({
				outGame:'rodaika.png',
				inGame:'rodaikaGame.png',
				bullet:'bulletSmall.png',
				color:0xF284AA,
				thumb:'thumb_jeiso'
			},
			{
				energyCoast:3,
				vel:2,
				bulletForce:1,
				bulletCoast:0.1,
				bulletVel:5,
			}
			)
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