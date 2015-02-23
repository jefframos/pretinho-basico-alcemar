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

		// bulletBehaviour: new GiantShootBehaviour({vel:2, invencible:true, bulletForce:10, size: 0.8})
		// bulletBehaviour: new SequenceBehaviour({angleOpen:0, totalFires: 25})
		// bulletBehaviour: new SequenceBehaviour()
		// bulletBehaviour: new MultipleBehaviour({vel:4, totalFires:8, bulletForce:2})
		// bulletBehaviour: new MultipleBehaviour({vel:4, invencible:true, totalFires:5, bulletForce:5})
		// bulletBehaviour: new HomingBehaviour({invencible:true, bulletForce:10, vel:5})



		this.obstacleModels = [
			new BirdModel({
				source:'obstaculo1.png',
				particles:['smoke.png', 'smoke.png'],
				sizePercent:0.10,
			},
			{
				target:null,
				demage:0.2,
				vel:-1.5,
				behaviour:new BirdBehaviourSinoid({sinAcc:0.05}),
			}),
			// new BirdModel({
			// 	source:'obstaculo1.png',
			// 	particles:['smoke.png', 'smoke.png'],
			// 	sizePercent:0.10,
			// },
			// {
			// 	target:null,
			// 	demage:0.2,
			// 	vel:-1,
			// 	behaviour:new BirdBehaviourDiag({accX:1.5}),
			// })
		];
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
				coverSource:'dist/img/UI/alcemarGrande.png',
				labelSource:'Label_Alcemar.png'
			},
			{
				energyCoast:1.5,
				vel:0.5,
				bulletForce:2.0,
				bulletVel:5,
				bulletCoast:0.1,
				toSpec: 800,
				bulletBehaviour: new GiantShootBehaviour({vel:2, invencible:true, bulletForce:10, size: 0.8})
				// bulletBehaviour: new HomingBehaviour({invencible:true, bulletForce:10, vel:5})
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
				coverSource:'dist/img/UI/piangersGrande.png',
				labelSource:'Label_Piangers.png'
			},
			{
				energyCoast:1.5,
				vel:2.5,
				bulletForce:1.2,
				bulletCoast:0.12,
				bulletVel:7,
				toAble: 10,
				toSpec: 800,
				bulletBehaviour: new SequenceBehaviour({angleOpen:0, totalFires: 25})
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
				coverSource:'dist/img/UI/poterGrande.png',
				labelSource:'Label_Potter.png'
			},
			{
				energyCoast:1.9,
				vel:1.5,
				bulletForce:1.5,
				bulletCoast:0.15,
				bulletVel:7,
				toAble: 350,
				toSpec: 800,
				bulletBehaviour: new MultipleBehaviour({vel:3, totalFires:8, bulletForce:10, size:0.15, angleOpen:0.25})
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
				coverSource:'dist/img/UI/arthurGrande.png',
				labelSource:'Label_Arthur.png'
			},
			{
				energyCoast:2.4,
				vel:1.5,
				bulletForce:2.2,
				bulletCoast:0.15,
				bulletVel:6,
				toAble: 800,
				toSpec: 800,
				bulletBehaviour: new SequenceBehaviour()
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
				coverSource:'dist/img/UI/poraGrande.png',
				labelSource:'Label_Pora.png'
			},
			{
				energyCoast:2.6,
				vel:1.5,
				bulletForce:1.3,
				bulletCoast:0.11,
				bulletVel:5,
				toAble: 1200,
				toSpec: 800,
				bulletBehaviour: new MultipleBehaviour({vel:3.5, invencible:true, totalFires:5, bulletForce:5, size:0.5})
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
				coverSource:'dist/img/UI/jeisoGrande.png',
				labelSource:'Label_Jeiso.png'
			},
			{
				energyCoast:1.5,
				vel:3,
				bulletForce:0.8,
				bulletCoast:0.07,
				bulletVel:8,
				toAble: 1500,
				toSpec: 800,
				bulletBehaviour: new HomingBehaviour({invencible:true, bulletForce:50, vel:4})
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
				coverSource:'dist/img/UI/piGrande.png',
				labelSource:'Label_MrPi.png'
			},
			{
				energyCoast:3,
				vel:1,
				bulletForce:1.4,
				bulletCoast:0.1,
				bulletVel:5,
				toAble: 2000,
				toSpec: 800,
				bulletBehaviour: new AkumaBehaviour()
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
				coverSource:'dist/img/UI/feterGrande.png',
				labelSource:'Label_Fetter.png'
			},
			{
				energyCoast:2.3,
				vel:1.5,
				bulletForce:3,
				bulletVel:6,
				bulletCoast:0.15,
				toAble: 2500,
				toSpec: 800,
				bulletBehaviour: new RainBehaviour()
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
				coverSource:'dist/img/UI/netoGrande.png',
				labelSource:'Label_Neto.png'
			},
			{
				energyCoast:2.5,
				vel:2,
				bulletForce:3,
				bulletCoast:0.12,
				bulletVel:5,
				toAble: 5000,
				toSpec: 800,
				bulletBehaviour: new SequenceBehaviour({angleOpen:0, totalFires: 25, sinoid:true, vel:2})
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
				coverSource:'dist/img/UI/rodaikaGrande.png',
				labelSource:'Label_Rodaika.png'
			},
			{
				energyCoast:3,
				vel:2,
				bulletForce:1.5,
				bulletCoast:0.08,
				bulletVel:4,
				toAble: 10000,
				toSpec: 800,
				bulletBehaviour: new RandomBehaviour()
			}
			)
		];

		this.birdModels = [

			
			new BirdModel({
				source:'caralinho.png',
				particles:['cabeca2.png', 'penas2.png'],
				egg:'ovo_belga.png',
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
				egg:'ovo_belga.png',
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
				egg:'ovo_lambecu.png',
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
				egg:'ovo_papacu.png',
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
				source:'papodebago.png',
				particles:['cabeca7.png', 'penas7.png'],
				egg:'ovo_galo.png',
				sizePercent:0.21,
				label:'Galo Papo de Bago'
			},
			{
				target:null,
				hp:4,
				demage:0.2,
				vel:-3.5,
				behaviour:new BirdBehaviourDiag({accX:-0.01}),
				toNext:80,
				money:12
			}),

			new BirdModel({
				source:'nocu.png',
				particles:['cabeca3.png', 'penas3.png'],
				egg:'ovo_nocu.png',
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
				source:'calopsuda.png',
				particles:['cabeca8.png', 'penas8.png'],
				egg:'ovo_calopsuda.png',
				sizePercent:0.21,
				label:'Calopsuda'
			},
			{
				target:null,
				hp:40,
				demage:0.2,
				vel:-1,
				behaviour: new BirdBehaviourSinoid2({sinAcc:0.05, velY:-6}),
				toNext:180,
				money:25
			}),


			new BirdModel({
				source:'nigeriano.png',
				particles:['cabeca1.png', 'penas1.png'],
				egg:'ovo_nigeriano.png',
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
		this.birdProbs = [0,1,0,0,2,0,1,3,2,3,4,5,6,7,4,5,6,7];

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
		this.totalBirds = 8;
		this.cookieManager.setCookie('totalPoints', this.totalPoints, 500);
		this.cookieManager.setCookie('totalBirds', this.totalBirds, 500);


		for (var i = this.playerModels.length - 1; i >= 0; i--) {
			if(this.playerModels[i].toAble <= this.totalPoints){
				this.playerModels[i].able = true;
			}else{
				this.playerModels[i].able = false;
			}
		}
	},
	getNewObstacle:function(screen){
		var id = Math.floor(this.obstacleModels.length * Math.random());
		var obs = new Obstacle(this.obstacleModels[id], screen);
		return obs;
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

		if(!birdModel || this.totalBirds >= this.birdModels.length){
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
	add100Points:function(){
		this.totalPoints += 100;
		this.cookieManager.setCookie('totalPoints', 100, 500);
		this.totalPlayers = 0;
		for (var i = this.playerModels.length - 1; i >= 0; i--) {
			if(this.playerModels[i].toAble <= this.totalPoints && !this.playerModels[i].able){
				this.playerModels[i].able = true;
			}
			if(this.playerModels[i].able){
				this.totalPlayers ++;
			}
		}
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