/*jshint undef:false */
var ChoicePlayerScreen = AbstractScreen.extend({
    init: function (label) {
        this._super(label);
    },
    destroy: function () {
        this._super();
    },
    build: function () {
        this._super();

        

        var assetsToLoader = [];


        if(assetsToLoader.length > 0){
            this.loader = new PIXI.AssetLoader(assetsToLoader);
            this.initLoad();
        }else{
            this.onAssetsLoaded();
        }
         
    },
    onProgress:function(){
        this._super();
    },
    onAssetsLoaded:function()
    {
        this.initApplication();
    },
    initApplication:function(){
        // this.easeImg = new SimpleSprite('dist/img/ease.png');
        // this.addChild(this.easeImg);
        // this.easeImg.setPosition(windowWidth / 2 - this.easeImg.getContent().width / 2, 50);
        var self = this;
        var scale = scaleConverter(70, windowHeight, 0.1);
        console.log(scale);
        var sizeScale = 135 / 640 * windowHeight;
        var spacing = 5 / 640 * windowHeight;

        this.backgroundImage = new SimpleSprite('dist/img/UI/bgChoice.png');
        this.addChild(this.backgroundImage);
        this.backgroundImage.container.width = windowWidth;
        this.backgroundImage.container.height = windowHeight;

        this.pista = new SimpleSprite('pista.png');
        this.addChild(this.pista);
        var pistaScale = scaleConverter(this.pista.getContent().width, windowWidth, 0.4);
        this.pista.getContent().scale.x = pistaScale;
        this.pista.getContent().scale.y = pistaScale;
        this.pista.setPosition(windowWidth  - this.pista.getContent().width - windowWidth * 0.05 , windowHeight - this.pista.getContent().height / 2);

        this.pointsMask = [[510 / 1136 * windowWidth, 0],
        [1038 / 1136 * windowWidth, 0],
        [465 / 1136 * windowWidth, windowHeight],
        [25 / 1136 * windowWidth, windowHeight]];


        this.faceContainer = new PIXI.DisplayObjectContainer();


        this.faceMask = new PIXI.Graphics();
        this.faceMask.beginFill(0x660055);
        this.faceMask.moveTo(this.pointsMask[0][0],this.pointsMask[0][1]);
        this.faceMask.lineTo(this.pointsMask[1][0],this.pointsMask[1][1]);
        this.faceMask.lineTo(this.pointsMask[2][0],this.pointsMask[2][1]);
        this.faceMask.lineTo(this.pointsMask[3][0],this.pointsMask[3][1]);
        this.faceContainer.addChild(this.faceMask);


        this.planeMask = new PIXI.Graphics();
        this.planeMask.beginFill(0x660055);
        // this.planeMask.moveTo(this.pointsMask[0][0],this.pointsMask[0][1]);
        this.planeMask.moveTo(this.pointsMask[1][0],this.pointsMask[1][1]);
        this.planeMask.lineTo(this.pointsMask[2][0],this.pointsMask[2][1]);
        this.planeMask.lineTo(windowWidth,windowHeight);
        this.planeMask.lineTo(windowWidth,0);
        this.planeContainer = new PIXI.DisplayObjectContainer();
        this.planeContainer.addChild(this.planeMask);
        this.planeContainer.mask = this.planeMask;

        

        this.faceColorBlink = new PIXI.Graphics();
        this.faceColorBlink.beginFill(0xFFFFFF);
        this.faceColorBlink.moveTo(this.pointsMask[0][0],this.pointsMask[0][1]);
        this.faceColorBlink.lineTo(this.pointsMask[1][0],this.pointsMask[1][1]);
        this.faceColorBlink.lineTo(this.pointsMask[2][0],this.pointsMask[2][1]);
        this.faceColorBlink.lineTo(this.pointsMask[3][0],this.pointsMask[3][1]);
        this.faceContainer.addChild(this.faceColorBlink);

        this.addChild(this.faceContainer);
        this.addChild(this.planeContainer);
        this.faceContainer.mask = this.faceMask;


        this.char1 = new ChoiceButton('out.png', 'selectedInner.png', 'selected.png', 'border.png');
        // this.char1.build();
        this.char1.build(sizeScale,sizeScale);
        this.char1.setPosition( windowWidth * 0.02,windowHeight * 0.08);
        this.addChild(this.char1);

        this.currentID = APP.getGameModel().currentID;

        this.arrButtons = [];
        // this.char1.addLabel(new PIXI.Text('Piangers', { align:'center', font:'25px Luckiest Guy', wordWrap:true, wordWrapWidth:300}),20,15);
        this.char1.clickCallback = function(){
            if(self.currentID === 0){
                return;
            }
            APP.getGameModel().setModel(0);
            self.updatePlayers();
        };


        this.char2 = new ChoiceButton('out.png', 'selectedInner.png', 'selected.png', 'border.png');
        this.char2.build(sizeScale,sizeScale);
        this.char2.setPosition( windowWidth * 0.02 ,this.char1.getContent().position.y + sizeScale + spacing);
        this.addChild(this.char2);
        // this.char2.addLabel(new PIXI.Text('Feter', { align:'center', font:'25px Luckiest Guy', wordWrap:true, wordWrapWidth:300}),15,15);
        this.char2.clickCallback = function(){
            if(self.currentID === 2){
                return;
            }
            APP.getGameModel().setModel(2);
            self.updatePlayers();
        };

        this.char3 = new ChoiceButton('out.png', 'selectedInner.png', 'selected.png', 'border.png');
        this.char3.build(sizeScale,sizeScale);
        this.char3.setPosition( windowWidth * 0.02 ,this.char2.getContent().position.y + sizeScale + spacing);
        this.addChild(this.char3);
        // this.char3.addLabel(new PIXI.Text('Alcemar', { align:'center', font:'25px Luckiest Guy', wordWrap:true, wordWrapWidth:300}),15,15);
        this.char3.clickCallback = function(){
            if(self.currentID === 5){
                return;
            }
            APP.getGameModel().setModel(5);
            self.updatePlayers();
        };

        this.char4 = new ChoiceButton('out.png', 'selectedInner.png', 'selected.png', 'border.png');
        this.char4.build(sizeScale,sizeScale);
        this.char4.setPosition( this.char1.getContent().position.x + sizeScale + spacing,this.char1.getContent().position.y);
        this.addChild(this.char4);
        // this.char4.addLabel(new PIXI.Text('Jeiso', { align:'center', font:'25px Luckiest Guy', wordWrap:true, wordWrapWidth:300}),15,15);
        this.char4.clickCallback = function(){
            if(self.currentID === 1){
                return;
            }
            APP.getGameModel().setModel(1);
            self.updatePlayers();
        };


        this.char5 = new ChoiceButton('out.png', 'selectedInner.png', 'selected.png', 'border.png');
        this.char5.build(sizeScale,sizeScale);
        this.char5.setPosition( this.char4.getContent().position.x,this.char2.getContent().position.y);
        this.addChild(this.char5);

        this.currentID = APP.getGameModel().currentID;
        // this.char5.addLabel(new PIXI.Text('Pi', { align:'center', font:'25px Luckiest Guy', wordWrap:true, wordWrapWidth:300}),20,15);
        this.char5.clickCallback = function(){
            if(self.currentID === 3){
                return;
            }
            APP.getGameModel().setModel(3);
            self.updatePlayers();
        };


        this.char6 = new ChoiceButton('out.png', 'selectedInner.png', 'selected.png', 'border.png');
        this.char6.build(sizeScale,sizeScale);
        this.char6.setPosition( this.char5.getContent().position.x,this.char3.getContent().position.y);
        this.addChild(this.char6);
        // this.char6.addLabel(new PIXI.Text('Pora', { align:'center', font:'25px Luckiest Guy', wordWrap:true, wordWrapWidth:300}),15,15);
        this.char6.clickCallback = function(){
            if(self.currentID === 6){
                return;
            }
            APP.getGameModel().setModel(6);
            self.updatePlayers();
        };

        this.char7 = new ChoiceButton('out.png', 'selectedInner.png', 'selected.png', 'border.png');
        this.char7.build(sizeScale,sizeScale);
        this.char7.setPosition( this.char5.getContent().position.x + sizeScale + spacing,this.char5.getContent().position.y);
        this.addChild(this.char7);
        // this.char7.addLabel(new PIXI.Text('Arthur', { align:'center', font:'25px Luckiest Guy', wordWrap:true, wordWrapWidth:300}),15,15);
        this.char7.clickCallback = function(){
            if(self.currentID === 4){
                return;
            }
            APP.getGameModel().setModel(4);
            self.updatePlayers();
        };

        this.char8 = new ChoiceButton('out.png', 'selectedInner.png', 'selected.png', 'border.png');
        this.char8.build(sizeScale,sizeScale);
        this.char8.setPosition( this.char6.getContent().position.x + sizeScale + spacing,this.char6.getContent().position.y);
        this.addChild(this.char8);
        // this.char8.addLabel(new PIXI.Text('Poter', { align:'center', font:'25px Luckiest Guy', wordWrap:true, wordWrapWidth:300}),15,15);
        this.char8.clickCallback = function(){
            if(self.currentID === 7){
                return;
            }
            APP.getGameModel().setModel(7);
            self.updatePlayers();
        };

        this.char9 = new ChoiceButton('out.png', 'selectedInner.png', 'selected.png', 'border.png');
        this.char9.build(sizeScale,sizeScale);
        this.char9.setPosition(this.char6.getContent().position.x,this.char6.getContent().position.y + sizeScale + spacing);
        this.addChild(this.char9);
        // this.char9.addLabel(new PIXI.Text('Neto', { align:'center', font:'25px Luckiest Guy', wordWrap:true, wordWrapWidth:300}),15,15);
        this.char9.clickCallback = function(){
            if(self.currentID === 8){
                return;
            }
            APP.getGameModel().setModel(8);
            self.updatePlayers();
        };

        this.char10 = new ChoiceButton('out.png', 'selectedInner.png', 'selected.png', 'border.png');
        this.char10.build(sizeScale,sizeScale);
        this.char10.setPosition(this.char8.getContent().position.x,this.char8.getContent().position.y + sizeScale + spacing);
        this.addChild(this.char10);
        // this.char10.addLabel(new PIXI.Text('Rodaika', { align:'center', font:'25px Luckiest Guy', wordWrap:true, wordWrapWidth:300}),15,15);
        this.char10.clickCallback = function(){
            if(self.currentID === 9){
                return;
            }
            APP.getGameModel().setModel(9);
            self.updatePlayers();
        };

        this.arrButtons.push(this.char1);
        this.arrButtons.push(this.char4);
        this.arrButtons.push(this.char2);
        this.arrButtons.push(this.char5);
        this.arrButtons.push(this.char7);
        this.arrButtons.push(this.char3);
        this.arrButtons.push(this.char6);
        this.arrButtons.push(this.char8);
        this.arrButtons.push(this.char9);
        this.arrButtons.push(this.char10);


        for (var i = this.arrButtons.length - 1; i >= 0; i--) {
            var tempPlayerModel = APP.getGameModel().playerModels[i];
            this.arrButtons[i].parent = this;
            if(tempPlayerModel.toAble <= APP.getGameModel().totalPoints){
                this.arrButtons[i].color = APP.getGameModel().playerModels[i].color;
                this.arrButtons[i].addThumb(APP.getGameModel().playerModels[i].thumbColor, APP.getGameModel().playerModels[i].thumbGray);
            }else{
                this.arrButtons[i].color = 0x555555;
                this.arrButtons[i].addThumb(APP.getGameModel().playerModels[i].thumbGray, APP.getGameModel().playerModels[i].thumbGray);
                this.arrButtons[i].block(tempPlayerModel.toAble);
            }
            this.arrButtons[i].mouseUpCallback = this.resetButtons;
        }

        this.play = new DefaultButton('continueButtonBig.png', 'continueButtonBig.png');
        this.play.build();
        scaleConverter(this.play.getContent().height, windowHeight, 0.25, this.play);
        this.play.setPosition( windowWidth - this.play.getContent().width - 20,windowHeight - this.play.getContent().height - 20);
        // TweenLite.from(this.play.getContent().position, 0.8, {delay:0.5, x:windowWidth, ease:'easeOutBack'});

        this.addChild(this.play);

        // this.play.addLabel(new PIXI.Text('JOGAR', { align:'center',fill:'#033E43', font:'30px Luckiest Guy', wordWrap:true, wordWrapWidth:300}),15,12);
        this.play.clickCallback = function(){
            self.screenManager.change('Game');
        };

        this.returnButton = new DefaultButton('voltarButton.png', 'voltarButton.png');
        this.returnButton.build();
        scaleConverter(this.returnButton.getContent().height, windowHeight, 0.15, this.returnButton);

        this.returnButton.setPosition(20 ,windowHeight - this.returnButton.getContent().height - 20);
        // TweenLite.from(this.returnButton.getContent().position, 0.8, {delay:0.6, x:- this.returnButton.getContent().width, ease:'easeOutBack'});
        this.addChild(this.returnButton);
        // this.returnButton.addLabel(new PIXI.Text('VOLTAR', { align:'center',fill:'#033E43', font:'28px Luckiest Guy', wordWrap:true, wordWrapWidth:300}),12,12);
        
        this.returnButton.clickCallback = function(){
            self.screenManager.change('Wait');
        };

        // this.char1.selectedFunction();

        this.arrButtons[APP.getGameModel().currentID].selectedFunction();

        this.createStatsContainer();
        this.updatePlayers(true);
    
        // this.frontShape.parent.setChildIndex(this.frontShape, this.frontShape.parent.children.length - 1);
        // TweenLite.to(this.frontShape.position, 1, {delay:0.2, y:windowHeight});
        // setTimeout(function(){

        // self.screenManager.change('Game');
        // }, 1000);
    },
    // transitionIn:function()
    // {
    //     // if(AbstractScreen.debug)console.log('transitionIn', this.screenLabel);
    //     this.frontShape = new PIXI.Graphics();
    //     this.frontShape.beginFill(0xFFFFFF);
    //     this.frontShape.drawRect(0,0,windowWidth, windowHeight + 10);
    //     this.addChild(this.frontShape);
    //     this.build();

    // },
    // transitionOut:function(nextScreen, container)
    // {
    //     var self = this;
    //     this.frontShape.position.y = - windowHeight;
    //     TweenLite.to(this.frontShape.position, 0.8, {y:0, ease:'easeOutBounce', onComplete:function(){
    //         self.destroy();
    //         container.removeChild(self.getContent());
    //         nextScreen.transitionIn();
    //     }});
    // },
    createStatsContainer:function(){
        this.statsContainer = new PIXI.DisplayObjectContainer();
        this.addChild(this.statsContainer);

        this.moneyContainer = new PIXI.DisplayObjectContainer();

        var moneyBg = new SimpleSprite('moneyContainer.png');
        this.moneyContainer.addChild(moneyBg.getContent());

        this.pointsLabel = new PIXI.Text(APP.getGameModel().totalPoints, {font:'28px Luckiest Guy', fill:'#FFFFFF', stroke:'#033E43', strokeThickness:5});
        this.moneyContainer.addChild(this.pointsLabel);

        this.pointsLabel.position.y = 2;
        this.pointsLabel.position.x = this.moneyContainer.width - this.pointsLabel.width - 10;


        this.backBars = new SimpleSprite('backBars.png');
        this.statsContainer.addChild(this.backBars.getContent());

        scaleConverter(this.moneyContainer.width, this.backBars.getContent().width, 1, this.moneyContainer);
        this.backBars.getContent().position.y = this.moneyContainer.height + 5;

        var barX = this.backBars.getContent().width / 2 - 150 / 2;
        var barY = 60 + this.backBars.getContent().position.y;

        // this.moneyContainer.position.y = - this.moneyContainer.height;
        this.moneyContainer.position.x = this.statsContainer.width - this.moneyContainer.width;

        this.energyBar = new BarView(150, 15, 1, 0);
        this.statsContainer.addChild(this.energyBar.getContent());
        this.energyBar.setPosition(barX, 0 + barY);
        this.energyBar.setFrontColor(0xF6901E);
        this.energyBar.setBackColor(0x000);
        this.energyBar.addBackShape(0x83CAA4, 6);

        this.velBar = new BarView(150, 15, 1, 0);
        this.statsContainer.addChild(this.velBar.getContent());
        this.velBar.setPosition(barX, 60 + barY);
        this.velBar.setFrontColor(0xF6901E);
        this.velBar.setBackColor(0x000);
        this.velBar.addBackShape(0x83CAA4, 6);


        this.powerBar = new BarView(150, 15, 1, 0);
        this.statsContainer.addChild(this.powerBar.getContent());
        this.powerBar.setPosition(barX, 120 + barY);
        this.powerBar.setFrontColor(0xF6901E);
        this.powerBar.setBackColor(0x000);
        this.powerBar.addBackShape(0x83CAA4, 6);

        var energyLabel = new PIXI.Text('ENERGIA', { align:'center',fill:'#FFFFFF', font:'25px Luckiest Guy', wordWrap:true, wordWrapWidth:300});
        this.statsContainer.addChild(energyLabel);
        energyLabel.position.x = this.backBars.getContent().width / 2 - energyLabel.width / 2;
        energyLabel.position.y = this.energyBar.getContent().position.y - energyLabel.height;

        var velLabel = new PIXI.Text('VELOCIDADE', { align:'center',fill:'#FFFFFF', font:'25px Luckiest Guy', wordWrap:true, wordWrapWidth:300});
        this.statsContainer.addChild(velLabel);
        velLabel.position.x = this.backBars.getContent().width / 2 - velLabel.width / 2;
        velLabel.position.y = this.velBar.getContent().position.y - velLabel.height;


        var tiroLabel = new PIXI.Text('TIRO', { align:'center',fill:'#FFFFFF', font:'25px Luckiest Guy', wordWrap:true, wordWrapWidth:300});
        this.statsContainer.addChild(tiroLabel);
        tiroLabel.position.x = this.backBars.getContent().width / 2 - tiroLabel.width / 2;
        tiroLabel.position.y = this.powerBar.getContent().position.y - tiroLabel.height;

        var statsScale = scaleConverter(this.statsContainer.width, windowWidth, 0.18);
        this.statsContainer.scale.x = statsScale;
        this.statsContainer.scale.y = statsScale;

        this.statsContainer.position.x = windowWidth - this.statsContainer.width - this.statsContainer.width * 0.1;
        this.statsContainer.position.y = this.char1.getContent().position.y - this.moneyContainer.position.y;



        this.statsContainer.addChild(this.moneyContainer);
    },
    resetButtons:function(){
        for (var i = this.parent.arrButtons.length - 1; i >= 0; i--) {
            if(this !== this.parent.arrButtons[i]){
                if(!this.parent.arrButtons[i].isBlocked){
                    this.parent.arrButtons[i].resetTextures();
                }
            }
        }
    },
    updateStatsBars:function(){
        this.energyBar.updateBar(1, APP.getGameModel().currentPlayerModel.energyCoast);
        // console.log(APP.getGameModel().currentPlayerModel.velocity);
        this.velBar.updateBar(APP.getGameModel().currentPlayerModel.velocity, 3);
        this.powerBar.updateBar(APP.getGameModel().currentPlayerModel.bulletForce, 3);
    },
    updatePlayers:function(instant)
    {
        
        // console.log(this.currentID, APP.getGameModel().currentID);

        //this.faceContainer
        this.currentID = APP.getGameModel().currentID;
        this.updateStatsBars();

        if(this.playerName && this.playerName.getContent().parent){
            this.playerName.getContent().parent.removeChild(this.playerName.getContent());
        }

        // this.playerName = new PIXI.Text(APP.getGameModel().currentPlayerModel.label, { align:'center',fill:'#FFFFFF', strokeThickness:3, stroke:'#033E43', font:'45px Luckiest Guy', wordWrap:true, wordWrapWidth:300});
        this.playerName = new SimpleSprite(APP.getGameModel().currentPlayerModel.labelSource);//, { align:'center',fill:'#FFFFFF', strokeThickness:3, stroke:'#033E43', font:'45px Luckiest Guy', wordWrap:true, wordWrapWidth:300});
        scaleConverter(this.playerName.getContent().height, windowHeight, 0.20, this.playerName);
        this.playerName.getContent().position.x = windowWidth /2 - this.playerName.getContent().width / 2 + windowWidth * 0.05;
        this.playerName.getContent().position.y = this.char1.getContent().position.y - 10;
        this.addChild(this.playerName.getContent());
        if(this.faceColor && this.faceColor.parent){
            this.faceColor.parent.removeChild(this.faceColor);
            // this.removeChild(this.playerImgBig);
        }

        this.faceColor = new PIXI.Graphics();
        this.faceColor.beginFill(APP.getGameModel().currentPlayerModel.color);
        this.faceColor.moveTo(this.pointsMask[0][0],this.pointsMask[0][1]);
        this.faceColor.lineTo(this.pointsMask[1][0],this.pointsMask[1][1]);
        this.faceColor.lineTo(this.pointsMask[2][0],this.pointsMask[2][1]);
        this.faceColor.lineTo(this.pointsMask[3][0],this.pointsMask[3][1]);
        this.faceColor.blendMode = PIXI.blendModes.MULTIPLY;

        this.faceContainer.addChildAt(this.faceColor, 0);


        if(this.playerImgBig && this.playerImgBig.getContent().parent){
            this.playerImgBig.getContent().parent.removeChild(this.playerImgBig.getContent());
            this.removeChild(this.playerImgBig);
        }
        this.playerImgBig  = new SimpleSprite(APP.getGameModel().currentPlayerModel.coverSource);
        var coverScale = scaleConverter(this.playerImgBig.getContent().height, windowHeight, 0.9);
        this.playerImgBig.container.scale.x = coverScale;
        this.playerImgBig.container.scale.y = coverScale;
        this.playerImgBig.setPosition(windowWidth / 2 - this.playerImgBig.getContent().width / 2,
            windowHeight- this.playerImgBig.getContent().height);
        this.faceContainer.addChild(this.playerImgBig.getContent());


        // this.faceColor.tint = APP.getGameModel().currentPlayerModel.color;
        this.faceColorBlink.alpha = 1;
        TweenLite.to(this.faceColorBlink, instant?0:0.2, {alpha:0});
        TweenLite.from(this.playerImgBig.getContent().position, instant?0:0.8, {x: this.playerImgBig.getContent().position.x + windowWidth * 0.1});
        // TweenLite.from(this.playerImgBig.getContent(), instant?0:0.3, {alpha:  0});


        if(this.playerImg && this.playerImg.getContent().parent){
            this.playerImg.getContent().parent.removeChild(this.playerImg.getContent());
            this.removeChild(this.playerImg);
        }
        if(windowHeight > 450){
            this.playerImg  = new SimpleSprite(APP.getGameModel().currentPlayerModel.imgSource);
        }else{
            this.playerImg  = new SimpleSprite(APP.getGameModel().currentPlayerModel.imgSourceGame);
        }
        if(!this.playerImg){
            return;
        }
        this.playerImg.container.anchor.x = 0.5;
        this.playerImg.container.anchor.y = 0.5;

        var scale = 1;
        if(this.playerImg.container.width > this.playerImg.container.height){
            scale = scaleConverter(this.playerImg.container.width, windowWidth, 0.17, this.playerImg.container);
        }else{
            scale = scaleConverter(this.playerImg.container.height, windowHeight, 0.35, this.playerImg.container);
        }
        // this.playerImg.container.scale.x = scale;
        // this.playerImg.container.scale.y = scale;

        // this.playerImg  = new PIXI.Sprite.fromFrame(this.imgSource);
        this.planeContainer.addChild(this.playerImg.getContent());
        this.playerImg.setPosition(this.pista.getContent().position.x + this.pista.getContent().width / 2, this.pista.getContent().position.y - this.playerImg.container.height / 2);
        TweenLite.from(this.playerImg.getContent().position, instant?0:0.8, {ease:'easeOutBack', x: this.playerImg.getContent().position.x - windowWidth * 0.2,y:  this.playerImg.getContent().position.y - windowHeight * 0.2});
        // TweenLite.from(this.playerImg.getContent(), 0.3, {alpha:  0});
        // this.playerImg.getContent().rotation = 0.4;
        // TweenLite.to(this.playerImg.getContent(), 0.5, {rotation: 0});


        // alert(document.cookie);
        // document.cookie='currentId='+APP.getGameModel().currentID+'; expires=Thu, 5 Jan 2017 12:00:00 UTC';
    }
});