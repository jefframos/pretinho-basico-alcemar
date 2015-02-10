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
				bullet:'piangersFire.png',
				bulletRotation: true,
				color:0x74CDDF,
				thumb:'thumb_piangers',
				coverSource:'dist/img/UI/piangersGrande.png'
			},
			{
				energyCoast:1.5,
				vel:2.5,
				bulletForce:1.5,
				bulletCoast:0.1,
				bulletVel:7,
			}
			),
			new PlayerModel({
				label:'FETTER',
				outGame:'feter.png',
				inGame:'feterGame.png',
				bullet:'feterFire.png',
				color:0xEE4323,
				thumb:'thumb_feter',
				coverSource:'dist/img/UI/feterGrande.png'
			},
			{
				energyCoast:2.3,
				vel:1.5,
				bulletForce:2.5,
				bulletVel:6,
				bulletCoast:0.2,
			}
			),
			new PlayerModel({
				label:'ALCEMAR',
				outGame:'alcemar.png',
				inGame:'alcemarGame.png',
				bullet:'alcemarFire.png',
				bulletRotation: true,
				color:0xB2D464,
				thumb:'thumb_alcemar',
				coverSource:'dist/img/UI/alcemarGrande.png'
			},
			{
				energyCoast:2.5,
				vel:1,
				bulletForce:2.5,
				bulletVel:5,
				bulletCoast:0.15,
			}
			),
			new PlayerModel({
				label:'JEISO',
				outGame:'jeso.png',
				inGame:'jesoGame.png',
				bullet:'jeisoFire.png',
				color:0x88C440,
				thumb:'thumb_jeiso',
				coverSource:'dist/img/UI/jeisoGrande.png'
			},
			{
				energyCoast:1.5,
				vel:3,
				bulletForce:0.5,
				bulletCoast:0.08,
				bulletVel:8,
			}
			),
			new PlayerModel({
				label:'Mr. PI',
				outGame:'pi.png',
				inGame:'piGame.png',
				bullet:'piFire.png',
				bulletRotation: true,
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
				bullet:'poraFire.png',
				bulletRotation: true,
				color:0xFDCE07,
				thumb:'thumb_pora',
				coverSource:'dist/img/UI/poraGrande.png'
			},
			{
				energyCoast:2.9,
				vel:1.5,
				bulletForce:1.3,
				bulletCoast:0.14,
				bulletVel:5,
			}
			),
			new PlayerModel({
				label:'ARTHUR',
				outGame:'arthur.png',
				inGame:'arthurGame.png',
				bullet:'arthurFire.png',
				color:0xB383B9,
				thumb:'thumb_arthur',
				coverSource:'dist/img/UI/arthurGrande.png'
			},
			{
				energyCoast:2.4,
				vel:1.5,
				bulletForce:2,
				bulletCoast:0.5,
				bulletVel:6,
			}
			),
			new PlayerModel({
				label:'POTTER',
				outGame:'poter.png',
				inGame:'poterGame.png',
				bullet:'potterFire.png',
				bulletRotation: true,
				color:0xFAAF4C,
				thumb:'thumb_poter',
				coverSource:'dist/img/UI/poterGrande.png'
			},
			{
				energyCoast:1.5,
				vel:2,
				bulletForce:2,
				bulletCoast:0.15,
				bulletVel:7,
			}
			),
			new PlayerModel({
				label:'NETO',
				outGame:'neto.png',
				inGame:'netoGame.png',
				bullet:'netoFire.png',
				color:0xB3A170,
				thumb:'thumb_neto',
				coverSource:'dist/img/UI/netoGrande.png'
			},
			{
				energyCoast:2.5,
				vel:2,
				bulletForce:3,
				bulletCoast:0.2,
				bulletVel:5,
			}
			),
			new PlayerModel({
				label:'RODAIKA',
				outGame:'rodaika.png',
				inGame:'rodaikaGame.png',
				bullet:'rodaikaFire.png',
				color:0xF284AA,
				thumb:'thumb_rodaika',
				coverSource:'dist/img/UI/rodaikaGrande.png'
			},
			{
				energyCoast:3,
				vel:2,
				bulletForce:1,
				bulletCoast:0.15,
				bulletVel:4,
			}
			)
		];

		this.birdModels = [
			//source, target, hp, demage, vel, behaviour, toNext, sizePercent, money
			new BirdModel('caralinho.png',null, 1, 0.2, -3.5, new BirdBehaviourDefault(), 80, 0.12, 3),
			new BirdModel('belga.png',null, 3, 0.1, 1.5, new BirdBehaviourSinoid({sinAcc:0.05}), 120, 0.15, 5),
			new BirdModel('lambecu.png',null, 6, 0.2, -1.5, new BirdBehaviourSinoid({sinAcc:0.05, velY:-3}), 150, 0.15, 8),
			new BirdModel('roxo.png',null, 10, 0.2, -1.8, new BirdBehaviourDiag({accX:0.02}), 170, 0.20, 10),
			new BirdModel('nocu.png',null, 12, 0.2, -2, new BirdBehaviourSinoid({sinAcc:0.08, velY:-8}), 180, 0.2, 15),
			new BirdModel('nigeriano.png',null, 50, 0.1, 0.8, new BirdBehaviourSinoid({sinAcc:0.08}), 280, 0.3, 20)
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