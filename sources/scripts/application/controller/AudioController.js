/*jshint undef:false */
var AudioController = Class.extend({
	init:function(){

		this.audioList = [
			{
				label:'ambient1',
				urls: ['dist/audio/background/trilha.mp3'],
				volume: 0.1,
				loop: true
			},
			{
				label:'ambient2',
				urls: ['dist/audio/background/game.mp3'],
				volume: 0.1,
				loop: true
			},
			{
				label:'alcemarIntro',
				urls: ['dist/audio/efeitos/intro.mp3'],
				volume: 0.8,
				loop: false
			},
			{
				label:'tiro',
				urls: ['dist/audio/efeitos/gun.mp3'],
				volume: 0.1,
				loop: false
			},
			{
				label:'risada',
				urls: ['dist/audio/efeitos/risada.mp3'],
				volume: 0.5,
				loop: false
			},
			{
				label:'magic',
				urls: ['dist/audio/efeitos/magic.mp3'],
				volume: 0.5,
				loop: false
			}
		];
		this.audios = [];
		var self = this;
		function end(){
			self.updateAudioList(this);
		}
		function load(){
			self.currentLoaded ++;
			// console.log(self.currentLoaded);
			if(self.currentLoaded >= self.audioList.length){
				this.loadedAudioComplete = true;
				console.log('all loaded');
			}
		}
		for (var i = this.audioList.length - 1; i >= 0; i--) {
			this.audios.push({label:this.audioList[i].label, audio:new Howl({
				urls:this.audioList[i].urls,
				volume: this.audioList[i].volume,
				// sprite: this.audioList[i].sprite?this.audioList[i].sprite:null,
				loop: this.audioList[i].loop,
				onend: end,
				onload: load
			})
			});
		}
		
		this.currentLoaded = 0;
		// this.ambientSound1 = new Howl({
		// 	urls: ['dist/audio/trilha.mp3', 'dist/audio/trilha.ogg'],
		// 	volume: 0.1,
		// 	loop: true,
		// });

		// this.alcemar = new Howl({
		// 	urls: ['dist/audio/aves_raras.mp3', 'dist/audio/aves_raras.ogg'],
		// 	volume: 0.8,
		// 	sprite: {
		// 		audio1: [0, 7000]
		// 	}
		// });

		this.playingAudios = [];
		this.ambientLabel = '';
	},
	updateAudioList:function(target){
		if(this.ambientPlaying === target){
			return;
		}
		for (var j = this.playingAudios.length - 1; j >= 0; j--) {
			if(this.playingAudios[j] === target){
				this.playingAudios.splice(j,1);
			}
		}
		console.log(this.playingAudios);
	},
	playSound:function(id){
		var audioP = null;
		for (var i = this.audios.length - 1; i >= 0; i--) {
			if(this.audios[i].label === id){
				audioP = this.audios[i].audio;
				audioP.play();
				this.playingAudios.push(audioP);
			}
		}
		console.log(audioP);
		return audioP;
	},
	stopSound:function(id){
		var audioP = null;
		for (var i = this.audios.length - 1; i >= 0; i--) {
			if(this.audios[i].label === id){
				audioP = this.audios[i].audio;
				audioP.stop();
				for (var j = this.playingAudios.length - 1; j >= 0; j--) {
					if(this.playingAudios[j] === audioP){
						this.playingAudios.splice(j,1);
					}
				}
			}
		}
		return audioP;
	},
	playAmbientSound:function(id){
		if(this.ambientLabel === id){
			return;
		}

		if(this.ambientPlaying){
			// this.ambientPlaying.stop();
			this.stopSound(this.ambientLabel);
		}
		this.ambientLabel = id;
		this.ambientPlaying = this.playSound(id);
	}
});