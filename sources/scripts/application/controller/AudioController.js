/*jshint undef:false */
var AudioController = Class.extend({
	init:function(){

		var audioList = [
			{
				label:'ambient1',
				urls: ['dist/audio/trilha.mp3', 'dist/audio/trilha.ogg'],
				volume: 0.1,
				loop: true
			},
			{
				label:'alcemarIntro',
				urls: ['dist/audio/aves_raras.mp3', 'dist/audio/aves_raras.ogg'],
				volume: 0.8,
				loop: false
			}
		];
		this.audios = [];
		var self = this;
		function end(){
			self.updateAudioList(this);
		}
		for (var i = audioList.length - 1; i >= 0; i--) {
			this.audios.push({label:audioList[i].label, audio:new Howl({
				urls:audioList[i].urls,
				volume: audioList[i].volume,
				// sprite: audioList[i].sprite?audioList[i].sprite:null,
				loop: audioList[i].loop,
				onend: end
			})
			});
		}
		
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
		if(this.ambientPlaying){
			return;
		}
		this.ambientPlaying = this.playSound(id);
	}
});