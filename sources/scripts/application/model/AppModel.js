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
		// APP.cookieManager = new CookieManager();
		// console.log(cookieManager.getCookie('totalPoints'));
		// APP.cookieManager.setCookie('totalPoints', 0, 500);
		console.log(APP);
		var points = parseInt(APP.cookieManager.getCookie('totalPoints'));
		var tempBirds = parseInt(APP.cookieManager.getCookie('totalBirds'));
		var high = parseInt(APP.cookieManager.getCookie('highScore'));

		// APP.cookieManager.setCookie('highScore', this.highScore, 500);

		this.highScore = high?high:0;
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
				vel:-3,
				behaviour:new BirdBehaviourSinoid({sinAcc:0.2}),
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
				label:'alcemar',
				// outGame:'alcemar.png',
				inGame:'alcemarGame.png',
				bullet:'alcemarFire.png',
				bulletRotation: true,
				bulletParticle:'partalcemar.png',
				color:0xB2D464,
				thumb:'thumb_alcemar',
				coverSource:'dist/img/UI/covers/alcemarGrande.png',
				labelSource:'Label_Alcemar.png',
				specSource:'power_alcemar.png',
				icoSpecSource:'especial_alcemar.png'
			},
			{
				maxEnergy: 8600,
				energyCoast:1.5,
				vel:0.5,
				bulletForce:2.2,
				bulletVel:6,
				bulletCoast:0.08,
				toSpec: 600,
				bulletBehaviour: new GiantShootBehaviour({vel:2.5, invencible:true, bulletForce:60, size: 0.8})
				// bulletBehaviour: new HomingBehaviour({invencible:true, bulletForce:10, vel:5})
				//toAble: 400
			}
			),
			new PlayerModel({
				label:'piangers',
				// outGame:'piangersN.png',
				inGame:'piangersNGame.png',
				bullet:'piangersFire.png',
				bulletRotation: true,
				bulletParticle:'partpiangers1.png',
				color:0x74CDDF,
				thumb:'thumb_piangers',
				coverSource:'dist/img/UI/covers/piangersGrande.png',
				labelSource:'Label_Piangers.png',
				icoSpecSource:'especial_piangers.png'
			},
			{
				maxEnergy: 7800,
				energyCoast:1.7,
				vel:2.5,
				bulletForce:1.3,
				bulletCoast:0.095,
				bulletVel:7,
				toAble: 10,
				toSpec: 450,
				bulletBehaviour: new SequenceBehaviour({angleOpen:0, totalFires: 40})
			}
			),
			new PlayerModel({
				label:'potter',
				// outGame:'poter.png',
				inGame:'poterGame.png',
				bullet:'potterFire.png',
				bulletRotation: true,
				bulletParticle:'partpotter.png',
				color:0xFAAF4C,
				thumb:'thumb_poter',
				coverSource:'dist/img/UI/covers/poterGrande.png',
				labelSource:'Label_Potter.png',
				icoSpecSource:'especial_potter.png'
			},
			{
				energyCoast:2,
				vel:1.5,
				bulletForce:1.5,
				bulletCoast:0.125,
				bulletVel:7,
				toAble: 350,
				toSpec: 700,
				bulletBehaviour: new MultipleBehaviour({vel:3, totalFires:8, bulletForce:10, size:0.15, angleOpen:0.25})
			}
			),
			new PlayerModel({
				label:'arthur',
				// outGame:'arthur.png',
				inGame:'arthurGame.png',
				bullet:'arthurFire.png',
				bulletParticle:'partarthur.png',
				color:0xB383B9,
				thumb:'thumb_arthur',
				coverSource:'dist/img/UI/covers/arthurGrande.png',
				labelSource:'Label_Arthur.png',
				icoSpecSource:'especial_arthur.png'
			},
			{
				energyCoast:2.3,
				vel:1.3,
				bulletForce:2.1,
				bulletCoast:0.15,
				bulletVel:5,
				toAble: 800,
				toSpec: 900,
				bulletBehaviour: new SequenceBehaviour()
			}
			),
			new PlayerModel({
				label:'pora',
				// outGame:'pora.png',
				inGame:'poraGame.png',
				bullet:'poraFire.png',
				bulletRotation: true,
				bulletParticle:'partexplosao.png',
				color:0xFDCE07,
				thumb:'thumb_pora',
				coverSource:'dist/img/UI/covers/poraGrande.png',
				labelSource:'Label_Pora.png',
				icoSpecSource:'especial_pora.png'
			},
			{
				maxEnergy: 6300,
				energyCoast:2.6,
				vel:1.5,
				bulletForce:1.3,
				bulletCoast:0.12,
				bulletVel:5,
				toAble: 1200,
				toSpec: 1000,
				bulletBehaviour: new MultipleBehaviour({vel:3.5, invencible:true, totalFires:5, bulletForce:5, size:0.5})
			}
			),
			new PlayerModel({
				label:'jeiso',
				// outGame:'jeso.png',
				inGame:'jesoGame.png',
				bullet:'jeisoFire.png',
				bulletParticle:'partjeiso.png',
				color:0x88C440,
				thumb:'thumb_jeiso',
				coverSource:'dist/img/UI/covers/jeisoGrande.png',
				labelSource:'Label_Jeiso.png',
				icoSpecSource:'especial_jeiso.png'
			},
			{
				maxEnergy: 8200,
				energyCoast:1.6,
				vel:3,
				bulletForce:1,
				bulletCoast:0.05,
				bulletVel:8,
				toAble: 2500,
				toSpec: 300,
				bulletBehaviour: new HomingBehaviour({invencible:true, bulletForce:99, vel:4})
			}
			),
			new PlayerModel({
				label:'pi',
				// outGame:'pi.png',
				inGame:'piGame.png',
				bullet:'piFire.png',
				bulletRotation: true,
				bulletParticle:'partpi.png',
				color:0x8F6DAF,
				thumb:'thumb_pi',
				coverSource:'dist/img/UI/covers/piGrande.png',
				labelSource:'Label_MrPi.png',
				icoSpecSource:'especial_mr_pi.png'
			},
			{
				maxEnergy: 6500,
				energyCoast:3,
				vel:0.8,
				bulletForce:1.2,
				bulletCoast:0.11,
				bulletVel:4,
				toAble: 4000,
				toSpec: 3000,
				bulletBehaviour: new AkumaBehaviour()
			}
			),
			new PlayerModel({
				label:'fetter',
				// outGame:'feter.png',
				inGame:'feterGame.png',
				bullet:'feterFire.png',
				bulletParticle:'partexplosao.png',
				color:0xEE4323,
				thumb:'thumb_feter',
				coverSource:'dist/img/UI/covers/feterGrande.png',
				labelSource:'Label_Fetter.png',
				icoSpecSource:'especial_fetter.png'
			},
			{
				energyCoast:2.2,
				vel:1.5,
				bulletForce:3,
				bulletVel:6,
				bulletCoast:0.15,
				toAble: 5000,
				toSpec: 1200,
				bulletBehaviour: new RainBehaviour()
			}
			),
			new PlayerModel({
				label:'neto',
				// outGame:'neto.png',
				inGame:'netoGame.png',
				bullet:'netoFire.png',
				bulletParticle:'partneto.png',
				color:0xB3A170,
				thumb:'thumb_neto',
				coverSource:'dist/img/UI/covers/netoGrande.png',
				labelSource:'Label_Neto.png',
				icoSpecSource:'especial_neto.png'
			},
			{
				maxEnergy: 5800,
				energyCoast:2.5,
				vel:2,
				bulletForce:3,
				bulletCoast:0.15,
				bulletVel:5,
				toAble: 8000,
				toSpec: 1600,
				bulletBehaviour: new SequenceBehaviour({angleOpen:0, totalFires: 25, sinoid:true, vel:2})
			}
			),
			new PlayerModel({
				label:'rodaika',
				// outGame:'rodaika.png',
				inGame:'rodaikaGame.png',
				bullet:'rodaikaFire.png',
				bulletParticle:'partrodaika2.png',
				color:0xF284AA,
				thumb:'thumb_rodaika',
				coverSource:'dist/img/UI/covers/rodaikaGrande.png',
				labelSource:'Label_Rodaika.png',
				specSource:'power_rodaika.png',
				icoSpecSource:'especial_rodaika.png'
			},
			{
				maxEnergy: 6000,
				energyCoast:3,
				vel:2,
				bulletForce:1,
				bulletCoast:0.13,
				bulletVel:5,
				toAble: 15000,
				toSpec: 1300,
				bulletBehaviour: new RandomBehaviour()
			}
			)
		];

		this.birdModels = [
			
			new BirdModel({
				source:['caralinhoAnima0001.png','caralinhoAnima0002.png','caralinhoAnima0003.png','caralinhoAnima0002.png'],
				particles:['cabeca2.png', 'penas2.png'],
				egg:'ovo_belga.png',
				cover:'caralinho.png',
				sizePercent:0.10,
				label:'CARALINHO DA TERRA'
				// label:'Caralinho da terra'
			},
			{
				target:null,
				hp:1,
				demage:0.2,
				vel:-3.5,
				behaviour:new BirdBehaviourDefault(),
				toNext:22,
				money:1
			}),

			new BirdModel({
				source:['belgaAnima0001.png','belgaAnima0002.png','belgaAnima0003.png','belgaAnima0002.png'],
				particles:['cabeca5.png', 'penas5.png'],
				egg:'ovo_belga.png',
				cover:'belga.png',
				sizePercent:0.15,
				label:'CARALHO BELGA'
				// label:'Caralho Belga'

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
				source:['lambecuAnima0001.png','lambecuAnima0002.png','lambecuAnima0003.png','lambecuAnima0004.png'],
				particles:['cabeca4.png', 'penas4.png'],
				egg:'ovo_lambecu.png',
				cover:'lambecu.png',
				sizePercent:0.15,
				label:'LAMBECU FRANCÊS'
				// label:'Lambecu Francês'

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
				source:['roxoAnima0001.png','roxoAnima0002.png','roxoAnima0003.png','roxoAnima0004.png'],
				particles:['cabeca6.png', 'penas6.png'],
				egg:'ovo_papacu.png',
				cover:'roxo.png',
				sizePercent:0.2,
				label:'PAPACU DE CABEÇA ROXA'
				// label:'Papacu de cabeça roxa'

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
				source:['papodebagoAnima0001.png','papodebagoAnima0002.png','papodebagoAnima0003.png','papodebagoAnima0004.png'],
				particles:['cabeca7.png', 'penas7.png'],
				egg:'ovo_galo.png',
				cover:'papodebago.png',
				sizePercent:0.15,
				label:'GALINHO PAPO DE BAGO'
				// label:'Galo Papo de Bago'
			},
			{
				target:null,
				hp:4,
				demage:0.2,
				vel:-3,
				behaviour:new BirdBehaviourDiag({accX:-0.01}),
				toNext:80,
				money:8
			}),

			new BirdModel({
				source:['nocututinhaAnima0001.png','nocututinhaAnima0002.png','nocututinhaAnima0003.png','nocututinhaAnima0004.png'],
				particles:['cabeca3.png', 'penas3.png'],
				egg:'ovo_nocu.png',
				cover:'nocu.png',
				sizePercent:0.25,
				label:'NOCUTUTINHA'
				// label:'Nocututinha'

			},
			{
				target:null,
				hp:12,
				demage:0.2,
				vel:-2,
				behaviour: new BirdBehaviourSinoid2({sinAcc:0.08, velY:-8}),
				toNext:250,
				money:15
			}),

			new BirdModel({
				source:['calopsudaAnima0001.png','calopsudaAnima0002.png','calopsudaAnima0003.png','calopsudaAnima0004.png'],
				particles:['cabeca8.png', 'penas8.png'],
				egg:'ovo_calopsuda.png',
				cover:'calopsuda.png',
				sizePercent:0.28,
				label:'CALOPSUDA'
				// label:'Calopsuda'
			},
			{
				target:null,
				hp:40,
				demage:0.2,
				vel:-0.8,
				behaviour: new BirdBehaviourSinoid2({sinAcc:0.05, velY:-6}),
				toNext:180,
				money:25
			}),


			new BirdModel({
				source:['nigerianoAnima0001.png','nigerianoAnima0002.png','nigerianoAnima0003.png','nigerianoAnima0004.png'],
				particles:['cabeca1.png', 'penas1.png'],
				egg:'ovo_nigeriano.png',
				cover:'nigeriano.png',
				sizePercent:0.3,
				label:'PIÇUDÃO AZUL NIGERIANO'
				// label:'Piçudão azul nigeriano'

			},
			{
				target:null,
				hp:50,
				demage:0.2,
				vel:-0.5,
				behaviour: new BirdBehaviourSinoid2({sinAcc:0.08, velY:-2}),
				toNext:450,
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
		this.birdProbs = [0,1,0,0,0,2,0,0,0,1,2,3,0,0,2,0,3,4,4,4,4,4,0,5,5,5,5,5,0,6,6,6,6,0,7,7,7,7,4,5,6,7];

		this.currentHorde = 0;
		this.killedBirds = [];


	},
	// sendStats:function(id){
	// 	var i = 0;
	// 	var tempBirds = [
	// 		['caralinhoDaTerra',0],
	// 		['caralhoBelga',0],
	// 		['lambecuFrances',0],
	// 		['papacuDeCabecaRoxa',0],
	// 		['galinhoPapoDeBago',0],
	// 		['nocututinha',0],
	// 		['calopsuda',0],
	// 		['picudaoAzulNigeriano',0],
	// 	];
	// 	for (i = this.killedBirds.length - 1; i >= 0; i--) {
	// 		tempBirds[this.killedBirds[i]][1] ++;
	// 	}

	// 	var sendObject = '{\n"character":"'+this.playerModels[this.currentID].label+'",'+
	// 	'\n"points":"'+this.currentPoints+'",'+
	// 	'\n"birds":{\n';

	// 	for (i = 0; i < tempBirds.length; i++) {
	// 		if(i >= tempBirds.length - 1){
	// 			sendObject += '"' + tempBirds[i][0] + '"' + ':' + '"' + tempBirds[i][1] + '"\n';
	// 		}else{
	// 			sendObject += '"' + tempBirds[i][0] + '"' + ':' + '"' + tempBirds[i][1] + '",\n';
	// 		}
	// 	}
	// 	sendObject += '}\n}';
	// 	console.log(sendObject);
	// 	console.log(JSON.parse(sendObject));
	// 	var send = {
	// 		character: this.playerModels[APP.getGameModel().currentID].label,
	// 		points: APP.getGameModel().currentPoints,
			
	// 	};
	// 	console.log(APP.getGameModel().killedBirds, APP.getGameModel().currentPoints,  this.playerModels[APP.getGameModel().currentID].label);
	// },
	setModel:function(id){
		this.currentID = id;
		this.currentPlayerModel = this.playerModels[id];
	},
	zerarTudo:function(){
		this.currentHorde = 0;
		this.totalPoints = 0;
		this.totalBirds = 1;
		this.totalPlayers = 1;
		APP.cookieManager.setCookie('totalPoints', 0, 500);
		APP.cookieManager.setCookie('totalBirds', 1, 500);

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
		APP.cookieManager.setCookie('totalPoints', this.totalPoints, 500);
		APP.cookieManager.setCookie('totalBirds', this.totalBirds, 500);


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
		bird.id = id;
		console.log(bird.id);
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
		APP.cookieManager.setCookie('totalBirds', this.totalBirds, 500);
	},
	add100Points:function(){
		this.totalPoints += 100;
		APP.cookieManager.setCookie('totalPoints', 100, 500);
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
		if(this.highScore < this.currentPoints)
		{
			this.highScore = this.currentPoints;
			APP.cookieManager.setCookie('highScore', this.highScore, 500);
			APP.dataManager.saveScore();
		}
		APP.cookieManager.setCookie('totalPoints', this.totalPoints, 500);
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