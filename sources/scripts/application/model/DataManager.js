/*jshint undef:false */
var DataManager = Class.extend({
	init:function(){
		this.highscore = APP.cookieManager.getCookie('highscore')? APP.cookieManager.getCookie('highscore'): null;
		this.highscoreChar = APP.cookieManager.getCookie('highscoreChar')? APP.cookieManager.getCookie('highscoreChar'): 'sem nome';
		if(this.highscore){
			console.log('high', this.highscore);
		}
		if(this.highscoreChar){
			console.log('highscoreChar', this.highscoreChar);
		}
		// APP.cookieManager.setCookie('highscore', '', 500);
		// console.log('highscore', this.highscore.points);
		// console.log(this.highscore);

		this.serverApi = new ServerApi();
	},
	getToday:function(callback){
		APP.showModal('Carregando');
		this.serverApi.getToday(function(message) {
			if (message === 'error') {
				// some error
				callback([]);
				APP.textModal('Error');
			}
			APP.hideModal(1);
			// the character in the message is the string identifier
			callback(message);
		});
	},
	getAll:function(callback){
		APP.showModal('Carregando');

		this.serverApi.getAll(function(message) {
			if (message === 'error') {
				// some error
				callback([]);
				APP.textModal('Error');
			}
			APP.hideModal(1);
			// the character in the message is the string identifier
			callback(message);
		});
	},
	get30:function(callback){
		APP.showModal('Carregando');

		this.serverApi.getMonth(function(message) {
			if (message === 'error') {
				// some error
				callback([]);
				APP.textModal('Error');
			}
			APP.hideModal(1);
			// the character in the message is the string identifier
			callback(message);
		});
	},
	sendScore:function(){
		var self = this;
		// check token, fb login & etc
		if(this.highscore){
			var message = {
					character: this.highscoreChar,
					points: this.highscore
				};
			APP.showModal('Salvando');
			// server api openFacebook
			if (!this.serverApi.token) {
				this.serverApi.openFacebook(function(status) {
					if (status === 'connected') {
						self.serverApi.sendScore(message, function(innerStatus) {
							if (innerStatus === 'connected') {
								APP.textModal('Dados salvos com sucesso!');
								APP.hideModal(2);
								// success
							} else {
								APP.textModal('Error');
								APP.hideModal(3);
								// error
							}
						});
					} else {
						APP.textModal('Error');
						APP.hideModal(3);
						// error
					}
				});
			} else {
				this.serverApi.sendScore(message, function(status) {
					if (status === 'connected') {
						APP.textModal('Dados salvos com sucesso!');
						APP.hideModal(2);
						// success
					} else {
						APP.textModal('Error');
						APP.hideModal(3);
						// error
					}
				});
			}
		}
	},
	getHigh:function(){
		if(this.highscore){
			// console.log(this.highscore);
			// var spl = this.highscore.split(',');
			// console.log(spl);
			return this.highscore;
		}
	},
	saveScore:function(id){

		// var i = 0;
		// var tempBirds = [
		// 	['caralinhoDaTerra',0],
		// 	['caralhoBelga',0],
		// 	['lambecuFrances',0],
		// 	['papacuDeCabecaRoxa',0],
		// 	['galinhoPapoDeBago',0],
		// 	['nocututinha',0],
		// 	['calopsuda',0],
		// 	['picudaoAzulNigeriano',0],
		// ];
		// for (i = APP.getGameModel().killedBirds.length - 1; i >= 0; i--) {
		// 	tempBirds[APP.getGameModel().killedBirds[i]][1] ++;
		// }

		// var sendObject = '{"character":"'+APP.getGameModel().playerModels[APP.getGameModel().currentID].label+'",'+
		// '"points":"'+APP.getGameModel().currentPoints+'",'+
		// '"birds":{';

		// for (i = 0; i < tempBirds.length; i++) {
		// 	if(i >= tempBirds.length - 1){
		// 		sendObject += '"' + tempBirds[i][0] + '"' + ':' + '"' + tempBirds[i][1] + '"';
		// 	}else{
		// 		sendObject += '"' + tempBirds[i][0] + '"' + ':' + '"' + tempBirds[i][1] + '",';
		// 	}
		// }
		// sendObject += '}}';

		// var sendObject = '{\n"character":"'+APP.getGameModel().playerModels[APP.getGameModel().currentID].label+'",'+
		// '\n"points":"'+APP.getGameModel().currentPoints+'",'+
		// '\n"birds":{\n';

		// for (i = 0; i < tempBirds.length; i++) {
		// 	if(i >= tempBirds.length - 1){
		// 		sendObject += '"' + tempBirds[i][0] + '"' + ':' + '"' + tempBirds[i][1] + '"\n';
		// 	}else{
		// 		sendObject += '"' + tempBirds[i][0] + '"' + ':' + '"' + tempBirds[i][1] + '",\n';
		// 	}
		// }
		// sendObject += '}\n}';


		// console.log(sendObject);
		var send = {
			character: APP.getGameModel().playerModels[APP.getGameModel().currentID].id,
			points: APP.getGameModel().currentPoints,

		};
		this.highscore = send.points;//JSON.parse(sendObject);
		this.highscoreChar = send.character;//JSON.parse(sendObject);
		APP.cookieManager.setCookie('highscore', this.highscore, 500);
		APP.cookieManager.setCookie('highscoreChar', APP.getGameModel().playerModels[APP.getGameModel().currentID].id, 500);
		// this.highscore = this.highscore.split(',');
		// APP.cookieManager.setCookie('highscore', this.highscore, 500);
		// APP.cookieManager.setCookie('highScore', sendObject, 500);
		// console.log(JSON.parse(sendObject));
		// console.log(APP.getGameModel().killedBirds, APP.getGameModel().currentPoints,  this.playerModels[APP.getGameModel().currentID].label);
	},
});
