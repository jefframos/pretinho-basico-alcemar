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
		this.cookieManager = new CookieManager();
		// console.log(cookieManager.getCookie('totalPoints'));
		// this.cookieManager.setCookie('totalPoints', 0, 500);
		var points = parseInt(this.cookieManager.getCookie('totalPoints'));
		this.totalPoints = points?points:0;
		this.currentPoints = 0;
		this.playerModels = [

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
				energyCoast:1.5,
				vel:0.5,
				bulletForce:2.0,
				bulletVel:5,
				bulletCoast:0.1,
				//toAble: 400
			}
			),
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
				bulletCoast:0.12,
				bulletVel:7,
				toAble: 100
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
				vel:1.8,
				bulletForce:2,
				bulletCoast:0.15,
				bulletVel:7,
				toAble: 250
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
				bulletForce:2.2,
				bulletCoast:0.1,
				bulletVel:6,
				toAble: 350
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
				bulletCoast:0.11,
				bulletVel:5,
				toAble: 500
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
				bulletForce:0.8,
				bulletCoast:0.07,
				bulletVel:8,
				toAble: 600
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
				bulletForce:1.4,
				bulletCoast:0.1,
				bulletVel:5,
				toAble: 800
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
				bulletForce:2.6,
				bulletVel:6,
				bulletCoast:0.15,
				toAble: 1000
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
				bulletCoast:0.15,
				bulletVel:5,
				toAble: 5000
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
				bulletForce:1.5,
				bulletCoast:0.08,
				bulletVel:4,
				toAble: 10000
			}
			)
		];

		this.birdModels = [
			//source, target, hp, demage, vel, behaviour, toNext, sizePercent, money
			new BirdModel('caralinho.png',null, 1, 0.2, -3.5, new BirdBehaviourDefault(), 50, 0.12, 3),
			new BirdModel('belga.png',null, 3, 0.1, 1.5, new BirdBehaviourSinoid({sinAcc:0.05}), 150, 0.15, 5),
			new BirdModel('lambecu.png',null, 6, 0.2, -1.5, new BirdBehaviourSinoid({sinAcc:0.05, velY:-3}), 180, 0.15, 8),
			new BirdModel('roxo.png',null, 10, 0.2, -1.8, new BirdBehaviourDiag({accX:0.02}), 200, 0.20, 10),
			new BirdModel('nocu.png',null, 12, 0.2, -2, new BirdBehaviourSinoid2({sinAcc:0.08, velY:-8}), 410, 0.2, 20),
			new BirdModel('nigeriano.png',null, 50, 0.1, 0.6, new BirdBehaviourSinoid({sinAcc:0.08}), 700, 0.3, 50)
		];

		this.setModel(0);

		this.birdProbs = [0,0,0,0,0,1,1,2,2,3,4,5];

	},
	setModel:function(id){
		this.currentID = id;
		this.currentPlayerModel = this.playerModels[id];
	},
	getNewBird:function(player, screen){
		var id = this.birdProbs[Math.floor(this.birdProbs.length * Math.random())];
		this.birdModels[id].target = player;
		var bird = new Bird(this.birdModels[id], screen);
		this.lastID = id;
        return bird;
	},
	addPoints:function(){
		this.totalPoints += this.currentPoints;
		this.cookieManager.setCookie('totalPoints', this.totalPoints, 500);
		if(this.maxPoints < this.currentPoints){
			this.maxPoints = this.currentPoints;
		}
	},
	build:function(){

	},
	destroy:function(){

	},
	serialize:function(){
		
	}
});