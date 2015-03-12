/*jshint undef:false */
var DataManager = Class.extend({
	init:function(){
		this.highscore = APP.cookieManager.getCookie('highScore');
		// APP.cookieManager.setCookie('highScore', null, 500);
		console.log('highscore', this.highscore.points);
	},
	saveScore:function(id){

		var i = 0;
		var tempBirds = [
			['caralinhoDaTerra',0],
			['caralhoBelga',0],
			['lambecuFrances',0],
			['papacuDeCabecaRoxa',0],
			['galinhoPapoDeBago',0],
			['nocututinha',0],
			['calopsuda',0],
			['picudaoAzulNigeriano',0],
		];
		for (i = APP.getGameModel().killedBirds.length - 1; i >= 0; i--) {
			tempBirds[APP.getGameModel().killedBirds[i]][1] ++;
		}

		var sendObject = '{\n"character":"'+APP.getGameModel().playerModels[APP.getGameModel().currentID].label+'",'+
		'\n"points":"'+APP.getGameModel().currentPoints+'",'+
		'\n"birds":{\n';

		for (i = 0; i < tempBirds.length; i++) {
			if(i >= tempBirds.length - 1){
				sendObject += '"' + tempBirds[i][0] + '"' + ':' + '"' + tempBirds[i][1] + '"\n';
			}else{
				sendObject += '"' + tempBirds[i][0] + '"' + ':' + '"' + tempBirds[i][1] + '",\n';
			}
		}
		sendObject += '}\n}';
		console.log(sendObject);
		var send = {
			character: APP.getGameModel().playerModels[APP.getGameModel().currentID].label,
			points: APP.getGameModel().currentPoints,
			
		};
		this.highscore = JSON.parse(sendObject);
		APP.cookieManager.setCookie('highScore', this.highscore, 500);
		// APP.cookieManager.setCookie('highScore', sendObject, 500);
		// console.log(JSON.parse(sendObject));
		// console.log(APP.getGameModel().killedBirds, APP.getGameModel().currentPoints,  this.playerModels[APP.getGameModel().currentID].label);
	},
});