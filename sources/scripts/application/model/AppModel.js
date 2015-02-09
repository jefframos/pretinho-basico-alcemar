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
				label:'PIANGERS',
				outGame:'piangersN.png',
				inGame:'piangersNGame.png',
				bullet:'bulletSmall.png',
				color:0x74CDDF,
				thumb:'thumb_piangers',
				coverSource:'dist/img/UI/piangersGrande.png'
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
				label:'FETER',
				outGame:'feter.png',
				inGame:'feterGame.png',
				bullet:'bulletSmall.png',
				color:0xEE4323,
				thumb:'thumb_feter',
				coverSource:'dist/img/UI/feterGrande.png'
			},
			{
				energyCoast:2.3,
				vel:1.5,
				bulletForce:2.5,
				bulletVel:6,
				bulletCoast:0.1,
			}
			),
			new PlayerModel({
				label:'ALCEMAR',
				outGame:'alcemar.png',
				inGame:'alcemarGame.png',
				bullet:'bulletSmall.png',
				color:0xB2D464,
				thumb:'thumb_alcemar',
				coverSource:'dist/img/UI/alcemarGrande.png'
			},
			{
				energyCoast:2.5,
				vel:1,
				bulletForce:2.5,
				bulletCoast:0.1,
				bulletVel:6,
			}
			),
			new PlayerModel({
				label:'JEISO',
				outGame:'jeso.png',
				inGame:'jesoGame.png',
				bullet:'bulletSmall.png',
				color:0x88C440,
				thumb:'thumb_jeiso',
				coverSource:'dist/img/UI/jeisoGrande.png'
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
				label:'Mr. PI',
				outGame:'pi.png',
				inGame:'piGame.png',
				bullet:'bulletSmall.png',
				color:0x8F6DAF,
				thumb:'thumb_pi',
				coverSource:'dist/img/UI/piGrande.png'
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
				label:'PORÃ',
				outGame:'pora.png',
				inGame:'poraGame.png',
				bullet:'bulletSmall.png',
				color:0xFDCE07,
				thumb:'thumb_pora',
				coverSource:'dist/img/UI/poraGrande.png'
			},
			{
				energyCoast:2.9,
				vel:1.5,
				bulletForce:1.3,
				bulletCoast:0.1,
				bulletVel:5,
			}
			),
			new PlayerModel({
				label:'ARTHUR',
				outGame:'arthur.png',
				inGame:'arthurGame.png',
				bullet:'bulletSmall.png',
				color:0xB383B9,
				thumb:'thumb_arthur',
				coverSource:'dist/img/UI/arthurGrande.png'
			},
			{
				energyCoast:2.4,
				vel:1.5,
				bulletForce:2,
				bulletCoast:0.1,
				bulletVel:5,
			}
			),
			new PlayerModel({
				label:'POTTER',
				outGame:'poter.png',
				inGame:'poterGame.png',
				bullet:'bulletSmall.png',
				color:0xFAAF4C,
				thumb:'thumb_poter',
				coverSource:'dist/img/UI/poterGrande.png'
			},
			{
				energyCoast:1.5,
				vel:2,
				bulletForce:2,
				bulletCoast:0.1,
				bulletVel:5,
			}
			),
			new PlayerModel({
				label:'NETO',
				outGame:'neto.png',
				inGame:'netoGame.png',
				bullet:'bulletSmall.png',
				color:0xB3A170,
				thumb:'thumb_neto',
				coverSource:'dist/img/UI/netoGrande.png'
			},
			{
				energyCoast:2.5,
				vel:2,
				bulletForce:3,
				bulletCoast:0.1,
				bulletVel:5,
			}
			),
			new PlayerModel({
				label:'RODAIKA',
				outGame:'rodaika.png',
				inGame:'rodaikaGame.png',
				bullet:'bulletSmall.png',
				color:0xF284AA,
				thumb:'thumb_rodaika',
				coverSource:'dist/img/UI/rodaikaGrande.png'
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
			//source, target, hp, demage, vel, behaviour, toNext, sizePercent, money
			new BirdModel('belga.png',null, 2, 0.1, 1.5, new BirdBehaviourSinoid({sinAcc:0.05}), 150, 0.1, 5),
			new BirdModel('roxo.png',null, 6, 0.2, -1.8, new BirdBehaviourDiag({accX:0.02}), 200, 0.15, 10),
			new BirdModel('lambecu.png',null, 6, 0.2, -1.5, new BirdBehaviourDefault(), 150, 0.1, 8)
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