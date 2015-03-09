/*jshint undef:false */
var WaitScreen = AbstractScreen.extend({
    init: function (label) {
        this._super(label);
        this.isLoaded = false;
        APP.labelDebug.visible = false;
        // alert(this.isLoaded);
    },
    destroy: function () {
        this._super();
    },
    build: function () {
        this._super();
        this.initApplication();
    },
    onProgress:function(){
        this._super();
        this.bulletBar.updateBar(Math.floor(this.loadPercent * 100), 100);
    },
    initApplication:function(){
        // alert('initApp');
        this.isLoaded = true;
        if(this.fullscreenButton && this.fullscreenButton.getContent().parent){
            this.fullscreenButton.getContent().parent.removeChild(this.fullscreenButton.getContent());
            this.fullscreenButton = null;
        }
        this.background = new SimpleSprite('fundo.jpg');
        this.addChild(this.background.getContent());
        scaleConverter(this.background.getContent().height, windowHeight, 1, this.background);
        this.background.getContent().position.x = windowWidth / 2 - this.background.getContent().width / 2;

        // this.fumaca = new SimpleSprite('fumacaIntro.png');
        // this.addChild(this.fumaca.getContent());
        // scaleConverter(this.fumaca.getContent().height, windowHeight, 0.4, this.fumaca);
        // this.fumaca.getContent().position.x = - windowWidth * 0.03;
        // this.fumaca.getContent().position.y = windowHeight * 0.03;

        this.alcemar = new SimpleSprite('alcemar1.png');
        this.addChild(this.alcemar.getContent());
        scaleConverter(this.alcemar.getContent().height, windowHeight, 0.8, this.alcemar);
        // this.alcemar.getContent().position.x = windowWidth * 0.10;
        this.alcemar.getContent().position.y = windowHeight * 0.01;

        this.bird2 = new SimpleSprite('ave2.png');
        this.addChild(this.bird2.getContent());
        scaleConverter(this.bird2.getContent().height, windowHeight, 0.45, this.bird2);
        this.bird2.getContent().position.x = windowWidth / 2 - this.bird2.getContent().width / 2;
        this.bird2.getContent().position.y = windowHeight - this.bird2.getContent().height + windowHeight * 0.02;

        this.bird1 = new SimpleSprite('ave1.png');
        this.addChild(this.bird1.getContent());
        scaleConverter(this.bird1.getContent().height, windowHeight, 0.6, this.bird1);
        this.bird1.getContent().position.x = windowWidth - this.bird1.getContent().width - windowWidth * 0.05;
        this.bird1.getContent().position.y = windowHeight * 0.1;

        this.logo = new SimpleSprite('logo.png');
        this.addChild(this.logo.getContent());
        scaleConverter(this.logo.getContent().height, windowHeight, 0.5, this.logo);
        this.logo.getContent().position.x = windowWidth * 0.02;
        this.logo.getContent().position.y = windowHeight - this.logo.getContent().height;


        TweenLite.from(this.alcemar.getContent(), 0.8, {delay: 0.1, alpha:0});
        // TweenLite.from(this.fumaca.getContent(), 0.5, {delay: 0.2, alpha:0});

        TweenLite.from(this.alcemar.getContent().scale, 2, {delay: 0.2, x:this.alcemar.getContent().scale.x - 0.05, y:this.alcemar.getContent().scale.y - 0.05});
        // TweenLite.from(this.fumaca.getContent().scale, 2.5, {delay: 0.2,x:this.fumaca.getContent().scale.x - 0.1, y:this.fumaca.getContent().scale.y - 0.1});
        
        // TweenLite.from(this.alcemar.getContent(), 2, {delay: 0.5, y: this.alcemar.getContent().position.y - 20, x: this.alcemar.getContent().position.y - 40});
        // TweenLite.from(this.fumaca.getContent(), 2.5, {delay: 0.5,y: this.fumaca.getContent().position.y - 20, x: this.fumaca.getContent().position.y - 30});
        
        TweenLite.from(this.bird2.getContent(), 1.5, {delay: 1.7, y: windowHeight, x: this.bird2.getContent().position.y + 80});
        TweenLite.from(this.bird1.getContent(), 2, {delay: 1.7, y: windowHeight, x: windowWidth * 0.1});
        TweenLite.from(this.logo.getContent(), 1.5, {delay: 2.2, x:-this.logo.getContent().width , ease:'easeOutBack'});
        var self = this;


        this.audioOn = new DefaultButton('volumeButton_on.png', 'volumeButton_on_over.png');
        this.audioOn.build();
        scaleConverter(this.audioOn.height, windowHeight, 0.15, this.audioOn);
        this.audioOn.setPosition(20, 20);
        // this.audioOn.setPosition( windowWidth - this.audioOn.getContent().width  - 20, 20);

        this.audioOff = new DefaultButton('volumeButton_off.png', 'volumeButton_off_over.png');
        this.audioOff.build();
        scaleConverter(this.audioOff.height, windowHeight, 0.15, this.audioOff);
        this.audioOff.setPosition(20, 20);

        if(!APP.mute){
            this.addChild(this.audioOn);
        }else{
            this.addChild(this.audioOff);
        }

        this.audioOn.clickCallback = function(){
            APP.mute = false;
            Howler.mute();
            if(self.audioOn.getContent().parent)
            {
                self.audioOn.getContent().parent.removeChild(self.audioOn.getContent());
            }
            if(self.audioOff.getContent())
            {
                self.addChild(self.audioOff);
            }
        };
        this.audioOff.clickCallback = function(){
            APP.mute = true;
            Howler.unmute();
            if(self.audioOff.getContent().parent)
            {
                self.audioOff.getContent().parent.removeChild(self.audioOff.getContent());
            }
            if(self.audioOn.getContent())
            {
                self.addChild(self.audioOn);
            }

        };

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


        this.timeline = new TimelineLite({delay:0.5, onComplete:function(){}});
        if(!APP.mute){
            this.timeline.append(TweenLite.from(this.audioOn.getContent(), 0.5, {x: - this.audioOn.getContent().width, ease:'easeOutBack'}));
        }else{
            this.timeline.append(TweenLite.from(this.audioOn.getContent(), 0.5, {x: - this.audioOff.getContent().width, ease:'easeOutBack'}));
        }
        this.timeline.append(TweenLite.from(this.creditsButton.getContent(), 0.5, {y: windowHeight + this.creditsButton.height, ease:'easeOutBack'}));
        this.timeline.append(TweenLite.from(this.playButton.getContent(), 0.5, {y: windowHeight + this.playButton.height, ease:'easeOutBack'}));


        // this.timeLine = new TimelineLite();
        // console.log(this.timeLine, this.timeline.add);
        // // if(!APP.mute){
        // //     this.timeline.append(TweenLite.from(this.audioOn.getContent(), 0.5, {x: - this.audioOn.getContent().width, ease:'easeOutBack'}));
        // // }else{
        // //     this.timeline.append(TweenLite.from(this.audioOn.getContent(), 0.5, {x: - this.audioOff.getContent().width, ease:'easeOutBack'}));
        // // }

        // this.zerarCookie = new DefaultButton('creditoButton.png', 'creditoButtonOver.png');
        // this.zerarCookie.build(200, 200);
        // scaleConverter(this.zerarCookie.height, windowHeight, 0.2, this.zerarCookie);

        // this.zerarCookie.setPosition( 20, 20);
        // this.addChild(this.zerarCookie);
        // this.zerarCookie.addLabel(new PIXI.Text('Zerar', { align:'center', fill:'#033E43', font:'50px Luckiest Guy', wordWrap:true, wordWrapWidth:300}),28,80);
        // this.zerarCookie.clickCallback = function(){
        //     APP.getGameModel().zerarTudo();
        // };
        // this.zerarCookie.getContent().alpha = 0;

        // this.maxPoints = new DefaultButton('creditoButton.png', 'creditoButtonOver.png');
        // this.maxPoints.build(200, 200);
        // scaleConverter(this.maxPoints.height, windowHeight, 0.2, this.maxPoints);

        // this.maxPoints.setPosition( 20 , 20+ this.zerarCookie.getContent().height + 10);
        // this.addChild(this.maxPoints);
        // this.maxPoints.addLabel(new PIXI.Text(' MAX ', { align:'center', fill:'#033E43', font:'50px Luckiest Guy', wordWrap:true, wordWrapWidth:300}),28,80);
        // this.maxPoints.clickCallback = function(){
            // APP.getGameModel().maxPoints();
        // };
        // this.maxPoints.getContent().alpha = 0;
        if(this.frontShape && this.frontShape.parent){
            this.frontShape.parent.setChildIndex(this.frontShape, this.frontShape.parent.children.length - 1);
        }
        if(this.frontShape){
            TweenLite.to(this.frontShape, 0.8, {alpha:0});
        }


        APP.audioController.playAmbientSound();
        APP.audioController.alcemar.stop();
        APP.audioController.alcemar.play('audio1');
    },
    transitionIn:function()
    {
        if(!this.isLoaded){
            this.build();
            return;
        }
        // alert('transitionIn', this.screenLabel);
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
        var self = this;
        if(this.frontShape){
            this.frontShape.parent.setChildIndex(this.frontShape, this.frontShape.parent.children.length - 1);
            TweenLite.to(this.frontShape, 0.3, {alpha:1, onComplete:function(){
                self.destroy();
                container.removeChild(self.getContent());
                nextScreen.transitionIn();
            }});
        }else{
            self.destroy();
            container.removeChild(self.getContent());
            nextScreen.transitionIn();
        }

        
    },
});