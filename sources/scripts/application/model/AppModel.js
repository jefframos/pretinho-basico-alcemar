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
		var tempBirds = parseInt(this.cookieManager.getCookie('totalBirds'));
		this.totalPoints = points?points:0;
		this.totalBirds = tempBirds?tempBirds:1;
		this.currentPoints = 0;
		this.playerModels = [

			new PlayerModel({
				label:'ALCEMAR',
				outGame:'alcemar.png',
				inGame:'alcemarGame.png',
				bullet:'alcemarFire.png',
				bulletRotation: true,
				bulletParticle:'partalcemar.png',
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
				bulletParticle:'partpiangers1.png',
				color:0x74CDDF,
				thumb:'thumb_piangers',
				coverSource:'dist/img/UI/piangersGrande.png'
			},
			{
				energyCoast:1.5,
				vel:2.5,
				bulletForce:1.2,
				bulletCoast:0.12,
				bulletVel:7,
				toAble: 10
			}
			),
			new PlayerModel({
				label:'POTTER',
				outGame:'poter.png',
				inGame:'poterGame.png',
				bullet:'potterFire.png',
				bulletRotation: true,
				bulletParticle:'partpotter.png',
				color:0xFAAF4C,
				thumb:'thumb_poter',
				coverSource:'dist/img/UI/poterGrande.png'
			},
			{
				energyCoast:1.9,
				vel:1.5,
				bulletForce:1.5,
				bulletCoast:0.15,
				bulletVel:7,
				toAble: 350
			}
			),
			new PlayerModel({
				label:'ARTHUR',
				outGame:'arthur.png',
				inGame:'arthurGame.png',
				bullet:'arthurFire.png',
				bulletParticle:'partarthur.png',
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
				toAble: 800
			}
			),
			new PlayerModel({
				label:'PORÃ',
				outGame:'pora.png',
				inGame:'poraGame.png',
				bullet:'poraFire.png',
				bulletRotation: true,
				bulletParticle:'partexplosao.png',
				color:0xFDCE07,
				thumb:'thumb_pora',
				coverSource:'dist/img/UI/poraGrande.png'
			},
			{
				energyCoast:2.6,
				vel:1.5,
				bulletForce:1.3,
				bulletCoast:0.11,
				bulletVel:5,
				toAble: 1200
			}
			),
			new PlayerModel({
				label:'JEISO',
				outGame:'jeso.png',
				inGame:'jesoGame.png',
				bullet:'jeisoFire.png',
				bulletParticle:'partjeiso.png',
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
				toAble: 1500
			}
			),
			new PlayerModel({
				label:'Mr. PI',
				outGame:'pi.png',
				inGame:'piGame.png',
				bullet:'piFire.png',
				bulletRotation: true,
				bulletParticle:'partpi.png',
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
				toAble: 2000
			}
			),
			new PlayerModel({
				label:'FETTER',
				outGame:'feter.png',
				inGame:'feterGame.png',
				bullet:'feterFire.png',
				bulletParticle:'partexplosao.png',
				color:0xEE4323,
				thumb:'thumb_feter',
				coverSource:'dist/img/UI/feterGrande.png'
			},
			{
				energyCoast:2.3,
				vel:1.5,
				bulletForce:3,
				bulletVel:6,
				bulletCoast:0.15,
				toAble: 2500
			}
			),
			new PlayerModel({
				label:'NETO',
				outGame:'neto.png',
				inGame:'netoGame.png',
				bullet:'netoFire.png',
				bulletParticle:'partneto.png',
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
				bulletParticle:'partrodaika2.png',
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
			new BirdModel({
				source:'caralinho.png',
				particles:['cabeca2.png', 'penas2.png'],
				egg:'',
				sizePercent:0.11,
				label:'Caralinho da terra'
			},
			{
				target:null,
				hp:1,
				demage:0.2,
				vel:-3.5,
				behaviour:new BirdBehaviourDefault(),
				toNext:50,
				money:1
			}),

			new BirdModel({
				source:'belga.png',
				particles:['cabeca5.png', 'penas5.png'],
				egg:'ovo2.png',
				sizePercent:0.15,
				label:'Caralho Belga'

			},
			{
				target:null,
				hp:3,
				demage:0.2,
				vel:-1.5,
				behaviour:new BirdBehaviourSinoid({sinAcc:0.05}),
				toNext:110,
				money:3
			}),

			new BirdModel({
				source:'lambecu.png',
				particles:['cabeca4.png', 'penas4.png'],
				egg:'ovo3.png',
				sizePercent:0.15,
				label:'Lambecu Francês'

			},
			{
				target:null,
				hp:6,
				demage:0.2,
				vel:-1.5,
				behaviour:new BirdBehaviourSinoid({sinAcc:0.05, velY:-3}),
				toNext:150,
				money:4
			}),

			new BirdModel({
				source:'roxo.png',
				particles:['cabeca6.png', 'penas6.png'],
				egg:'ovo4.png',
				sizePercent:0.2,
				label:'Papacu de cabeça roxa'

			},
			{
				target:null,
				hp:12,
				demage:0.2,
				vel:-2,
				behaviour:new BirdBehaviourDiag({accX:0.00}),
				toNext:150,
				money:6
			}),

			new BirdModel({
				source:'nocu.png',
				particles:['cabeca3.png', 'penas3.png'],
				egg:'ovo5.png',
				sizePercent:0.2,
				label:'Nocututinha'

			},
			{
				target:null,
				hp:12,
				demage:0.2,
				vel:-2,
				behaviour: new BirdBehaviourSinoid2({sinAcc:0.08, velY:-8}),
				toNext:250,
				money:20
			}),

			new BirdModel({
				source:'nigeriano.png',
				particles:['cabeca1.png', 'penas1.png'],
				egg:'ovo6.png',
				sizePercent:0.3,
				label:'Piçudão azul nigeriano'

			},
			{
				target:null,
				hp:50,
				demage:0.2,
				vel:-0.5,
				behaviour: new BirdBehaviourSinoid2({sinAcc:0.08, velY:-2}),
				toNext:600,
				money:50
			}),
		];

		this.setModel(0);
		this.totalPlayers = 0;
		for (var i = this.playerModels.length - 1; i >= 0; i--) {
			if(this.playerModels[i].toAble <= this.totalPoints){
				this.playerModels[i].able = true;
				this.totalPlayers ++;
			}
		}
		this.birdProbs = [0,1,0,0,2,0,1,3,2,3,4,5,4,5];

		this.currentHorde = 0;


	},
	setModel:function(id){
		this.currentID = id;
		this.currentPlayerModel = this.playerModels[id];
	},
	zerarTudo:function(){
		this.currentHorde = 0;
		this.totalPoints = 0;
		this.totalBirds = 1;
		this.totalPlayers = 1;
		this.cookieManager.setCookie('totalPoints', 0, 500);
		this.cookieManager.setCookie('totalBirds', 1, 500);

		for (var i = this.playerModels.length - 1; i >= 0; i--) {
			if(this.playerModels[i].toAble <= this.totalPoints){
				this.playerModels[i].able = true;
			}else{
				this.playerModels[i].able = false;
			}
		}
	},
	maxPoints:function(){
		this.currentHorde = 0;
		this.totalPoints = 999999;
		this.totalBirds = 6;
		this.cookieManager.setCookie('totalPoints', this.totalPoints, 500);
		this.cookieManager.setCookie('totalBirds', 6, 500);


		for (var i = this.playerModels.length - 1; i >= 0; i--) {
			if(this.playerModels[i].toAble <= this.totalPoints){
				this.playerModels[i].able = true;
			}else{
				this.playerModels[i].able = false;
			}
		}
	},
	getNewBird:function(player, screen){
		this.currentHorde ++;
		var max = this.birdProbs.length;

		if(this.currentHorde < max){
			max = this.currentHorde;
		}

		var id = 99999;
		while(id > (this.totalBirds - 1)){
			id = this.birdProbs[Math.floor(max * Math.random())];
		}
		this.birdModels[id].target = player;
		var bird = new Bird(this.birdModels[id], screen);
		this.lastID = id;
		return bird;
	},
	ableNewBird:function(birdModel){

		if(this.totalBirds >= this.birdModels.length){
			return;
		}
		this.totalBirds = 0;
		for (var i = 0; i < this.birdModels.length; i++) {
			this.totalBirds ++;
			if(this.birdModels[i].label === birdModel.label){
				console.log(this.birdModels[i].label, birdModel.label);
				break;
			}
		}
		console.log(this.totalBirds);
		this.cookieManager.setCookie('totalBirds', this.totalBirds, 500);
	},
	addPoints:function(){
		this.currentHorde = 0;
		this.totalPoints += this.currentPoints;
		this.cookieManager.setCookie('totalPoints', this.totalPoints, 500);
		if(this.maxPoints < this.currentPoints){
			this.maxPoints = this.currentPoints;
		}
		var tempReturn = [];
		this.totalPlayers = 0;
		for (var i = this.playerModels.length - 1; i >= 0; i--) {
			if(this.playerModels[i].toAble <= this.totalPoints && !this.playerModels[i].able){
				this.playerModels[i].able = true;
				tempReturn.push(this.playerModels[i]);
			}
			if(this.playerModels[i].able){
				this.totalPlayers ++;
			}
		}
		return tempReturn;
	},
	build:function(){

	},
	destroy:function(){

	},
	serialize:function(){
		
	}
});