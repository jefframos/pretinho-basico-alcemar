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
				loop: true,
				sprite: {
					audio1: [0, 7000]
				}
			}
		];


		this.ambientSound1 = new Howl({
			urls: ['dist/audio/trilha.mp3', 'dist/audio/trilha.ogg'],
			volume: 0.1,
			loop: true,
		});

		this.alcemar = new Howl({
			urls: ['dist/audio/aves_raras.mp3', 'dist/audio/aves_raras.ogg'],
			volume: 0.8,
			sprite: {
				audio1: [0, 7000]
			}
		});
	},
	playAmbientSound:function(){
		if(this.ambientPlaying){
			return;
		}
		this.ambientPlaying = true;
		this.ambientSound1.play();
	}
});