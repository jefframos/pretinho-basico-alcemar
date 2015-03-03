/*jshint undef:false */
var WaitScreen = AbstractScreen.extend({
    init: function (label) {
        this._super(label);
    },
    destroy: function () {
        this._super();
    },
    build: function () {
        this._super();

        

        var assetsToLoader = ['dist/img/atlas/atlas.json',
        'dist/img/UI/HUD2.json',
        'dist/img/atlas/players2.json',
        'dist/img/atlas/nuvens.json',
        'dist/img/UI/bgChoice.png',
        'dist/img/UI/covers/jeisoGrande.png',
        'dist/img/UI/covers/arthurGrande.png',
        'dist/img/UI/covers/piGrande.png',
        'dist/img/UI/covers/rodaikaGrande.png',
        'dist/img/UI/covers/poterGrande.png',
        'dist/img/UI/covers/poraGrande.png',
        'dist/img/UI/covers/feterGrande.png',
        'dist/img/UI/covers/alcemarGrande.png',
        'dist/img/UI/covers/netoGrande.png',
        'dist/img/UI/covers/piangersGrande.png',
        'dist/img/UI/fundo_degrade.png',
        'dist/img/UI/introScreen.jpg'];
        // 'dist/img/UI/introScreen.jpg',
        // 'dist/img/UI/HUD.json'];



        soundManager.onready(function() {
            soundManager.createSound({
                id: 'trilha',
                url: 'dist/audio/trilha.mp3',
                autoLoad: true,
                autoPlay: true,
                loops: 9999999,
                volume: 5,
                onready: function() {
                    // alert('load trilha');
                    // soundManager.play('trilha');
                    // soundManager.play('trilha');
                },
            });
            // alert('load onready');
            soundManager.createSound({
                id: 'aves_raras',
                url: 'dist/audio/aves_raras.mp3',
                autoLoad: true,
                autoPlay: true,
                loops: 1,
                volume: 35,
                ondataerror: function() {
                    alert('The sound '+this.id+' finished playing.');
                },
                onload: function() {
                    // alert('load onload');
                    // soundManager.play('aves_raras');
                },
                onready: function() {
                    // alert('load aves_raras');
                    // soundManager.play('aves_raras');

                },
            });
        });
        // soundManager.play('aves_raras');
        if(assetsToLoader.length > 0){
            this.labelLoader = new PIXI.Text('', { align:'center',font:'60px Luckiest Guy', fill:'#FFFFFF', strokeThickness:5, stroke:'#000000', wordWrap:true, wordWrapWidth:600});
            scaleConverter(this.labelLoader.height, windowHeight, 0.2, this.labelLoader);
            this.addChild(this.labelLoader);
            this.loader = new PIXI.AssetLoader(assetsToLoader);
            this.initLoad();

        }else{
            this.onAssetsLoaded();
        }
        
    },
    onProgress:function(){
        this._super();
        this.labelLoader.setText(Math.floor(this.loadPercent * 100)+' %');
        this.labelLoader.position.x = windowWidth / 2 - this.labelLoader.width / 2;
        this.labelLoader.position.y = windowHeight / 2 - this.labelLoader.height / 2;
        // APP.labelDebug.setText(Math.floor(this.loadPercent * 100));
        // console.log(this.loadPercent);
    },
    onAssetsLoaded:function()
    {
        //testMobile() && 
        if(testMobile() && possibleFullscreen() && !isfull){
            this.labelLoader.setText('Toque para continuar');
            this.labelLoader.position.x = windowWidth / 2 - this.labelLoader.width / 2;
            this.labelLoader.position.y = windowHeight / 2 - this.labelLoader.height / 2;

            var self = this;

            this.fullscreenButton = new DefaultButton('continueButtonBig.png', 'continueButtonBig.png');
            // console.log(this.fullscreenButton.build);
            this.fullscreenButton.build(windowWidth, windowHeight);
            // scaleConverter(this.fullscreenButton.height, windowHeight, 0.25, this.fullscreenButton);
            this.fullscreenButton.setPosition( windowWidth - this.fullscreenButton.getContent().width  - 20, windowHeight - this.fullscreenButton.getContent().height - 20);
            this.addChild(this.fullscreenButton);
            this.fullscreenButton.getContent().alpha = 0;
            // {fill:'white', align:'center', font:'12px Arial', wordWrap:true, wordWrapWidth:60}

            // this.fullscreenButton.addLabel(new PIXI.Text('Jogar', { align:'center', fill:'#033E43', font:'50px Luckiest Guy', wordWrap:true, wordWrapWidth:300}),25,18);
            this.fullscreenButton.clickCallback = function(){
                fullscreen();
                self.initApplication();
            };

        }else{
            this.initApplication();
        }
        // fullscreen();
        APP.labelDebug.visible = false;
    },
    initApplication:function(){
        if(this.fullscreenButton && this.fullscreenButton.getContent().parent){
            this.fullscreenButton.getContent().parent.removeChild(this.fullscreenButton.getContent());
            this.fullscreenButton = null;
        }
        this.background = new SimpleSprite('dist/img/UI/introScreen.jpg');
        this.addChild(this.background.getContent());
        scaleConverter(this.background.getContent().height, windowHeight, 1, this.background);
        this.background.getContent().position.x = windowWidth / 2 - this.background.getContent().width / 2;

        var self = this;

        this.playButton = new DefaultButton('continueButtonBig.png', 'continueButtonBigOver.png');
        // console.log(this.playButton.build);
        this.playButton.build();
        scaleConverter(this.playButton.height, windowHeight, 0.25, this.playButton);
        this.playButton.setPosition( windowWidth - this.playButton.getContent().width  - 20, windowHeight - this.playButton.getContent().height - 20);
        this.addChild(this.playButton);

        // {fill:'white', align:'center', font:'12px Arial', wordWrap:true, wordWrapWidth:60}

        // this.playButton.addLabel(new PIXI.Text('Jogar', { align:'center', fill:'#033E43', font:'50px Luckiest Guy', wordWrap:true, wordWrapWidth:300}),25,18);
        this.playButton.clickCallback = function(){
            // fullscreen();
            self.screenManager.change('Choice');
        };

        this.creditsModal = new CreditsModal(this);
        this.creditsButton = new DefaultButton('creditoButton.png', 'creditoButtonOver.png');
        this.creditsButton.build();
        scaleConverter(this.creditsButton.getContent().height, windowHeight, 0.15, this.creditsButton);

        this.creditsButton.setPosition(this.playButton.getContent().position.x -  this.creditsButton.getContent().width - 20,windowHeight - this.creditsButton.getContent().height - 20);
        // TweenLite.from(this.creditsButton.getContent().position, 0.8, {delay:0.6, x:- this.creditsButton.getContent().width, ease:'easeOutBack'});
        this.addChild(this.creditsButton);
        // this.creditsButton.addLabel(new PIXI.Text('VOLTAR', { align:'center',fill:'#033E43', font:'28px Luckiest Guy', wordWrap:true, wordWrapWidth:300}),12,12);
        
        this.creditsButton.clickCallback = function(){
            self.creditsModal.show();
        };


        this.zerarCookie = new DefaultButton('creditoButton.png', 'creditoButtonOver.png');
        this.zerarCookie.build(200, 200);
        scaleConverter(this.zerarCookie.height, windowHeight, 0.2, this.zerarCookie);

        this.zerarCookie.setPosition( 20, 20);
        this.addChild(this.zerarCookie);
        this.zerarCookie.addLabel(new PIXI.Text('Zerar', { align:'center', fill:'#033E43', font:'50px Luckiest Guy', wordWrap:true, wordWrapWidth:300}),28,80);
        this.zerarCookie.clickCallback = function(){
            APP.getGameModel().zerarTudo();
        };
        this.zerarCookie.getContent().alpha = 0;

        this.maxPoints = new DefaultButton('creditoButton.png', 'creditoButtonOver.png');
        this.maxPoints.build(200, 200);
        scaleConverter(this.maxPoints.height, windowHeight, 0.2, this.maxPoints);

        this.maxPoints.setPosition( 20 , 20+ this.zerarCookie.getContent().height + 10);
        this.addChild(this.maxPoints);
        this.maxPoints.addLabel(new PIXI.Text(' MAX ', { align:'center', fill:'#033E43', font:'50px Luckiest Guy', wordWrap:true, wordWrapWidth:300}),28,80);
        this.maxPoints.clickCallback = function(){
            APP.getGameModel().maxPoints();
        };
        this.maxPoints.getContent().alpha = 0;
        this.more100button = new DefaultButton('creditoButton.png', 'creditoButtonOver.png');
        this.more100button.build();
        scaleConverter(this.more100button.height, windowHeight, 0.15, this.more100button);

        this.more100button.setPosition( windowWidth - this.more100button.getContent().width  - 20, 20);
        this.addChild(this.more100button);
        this.more100button.addLabel(new PIXI.Text('STOP', { align:'center', fill:'#033E43', font:'50x Luckiest Guy', wordWrap:true, wordWrapWidth:300}),25,25);
        this.more100button.clickCallback = function(){
            if(soundManager.muted){
                soundManager.unmute();//stop('trilha');
                soundManager.play('trilha');
                alert('play');
            }else{
                soundManager.mute();//stop('trilha');
                soundManager.stop('trilha');
                alert('stop');
            }
        };

        this.frontShape.parent.setChildIndex(this.frontShape, this.frontShape.parent.children.length - 1);
        TweenLite.to(this.frontShape, 0.8, {alpha:0});
        // setTimeout(function(){

        // self.screenManager.change('Game');
        // }, 1000);

        // soundManager.play('trilha');
        // soundManager.play('aves_raras');

    },
    transitionIn:function()
    {
        // if(AbstractScreen.debug)console.log('transitionIn', this.screenLabel);
        this.frontShape = new PIXI.Graphics();
        this.frontShape.beginFill(0x000000);
        this.frontShape.drawRect(0,0,windowWidth, windowHeight);
        this.addChild(this.frontShape);
        this.build();

    },
    transitionOut:function(nextScreen, container)
    {
        // this._super();
        this.frontShape.parent.setChildIndex(this.frontShape, this.frontShape.parent.children.length - 1);

        var self = this;
        TweenLite.to(this.frontShape, 0.3, {alpha:1, onComplete:function(){
            self.destroy();
            container.removeChild(self.getContent());
            nextScreen.transitionIn();
        }});
    },
});