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
        this.char1 = new DefaultButton('btnHUD.png', 'btnHUD.png');
        // this.char1.build(300 * scale,70 * scale);
        this.char1.build();
        this.char1.setPosition( windowWidth / 2 - this.char1.width,windowHeight / 2);
        this.addChild(this.char1);

        this.currentID = APP.getGameModel().currentID;
        this.char1.addLabel(new PIXI.Text('Piangers', { align:'center', font:'25px Arial', wordWrap:true, wordWrapWidth:300}),20,15);
        this.char1.clickCallback = function(){
            if(self.currentID === 0){
                return;
            }
            APP.getGameModel().setModel(0);
            self.updatePlayers();
        };


        this.char2 = new DefaultButton('btnHUD.png', 'btnHUD.png');
        this.char2.build(300 * scale,70 * scale);
        this.char2.setPosition( windowWidth / 2 - this.char2.width,this.char1.getContent().position.y + 70 * scale + 5);
        this.addChild(this.char2);
        this.char2.addLabel(new PIXI.Text('Feter', { align:'center', font:'25px Arial', wordWrap:true, wordWrapWidth:300}),15,15);
        this.char2.clickCallback = function(){
            if(self.currentID === 1){
                return;
            }
            APP.getGameModel().setModel(1);
            self.updatePlayers();
        };

        this.char3 = new DefaultButton('btnHUD.png', 'btnHUD.png');
        this.char3.build(300 * scale,70 * scale);
        this.char3.setPosition( windowWidth / 2 - this.char3.width,this.char2.getContent().position.y + 70 * scale + 5);
        this.addChild(this.char3);
        this.char3.addLabel(new PIXI.Text('Alcemar', { align:'center', font:'25px Arial', wordWrap:true, wordWrapWidth:300}),15,15);
        this.char3.clickCallback = function(){
            if(self.currentID === 2){
                return;
            }
            APP.getGameModel().setModel(2);
            self.updatePlayers();
        };

        this.char4 = new DefaultButton('btnHUD.png', 'btnHUD.png');
        this.char4.build(300 * scale,70 * scale);
        this.char4.setPosition( windowWidth / 2 - this.char4.width,this.char3.getContent().position.y + 70 * scale + 5);
        this.addChild(this.char4);
        this.char4.addLabel(new PIXI.Text('Jeiso', { align:'center', font:'25px Arial', wordWrap:true, wordWrapWidth:300}),15,15);
        this.char4.clickCallback = function(){
            if(self.currentID === 3){
                return;
            }
            APP.getGameModel().setModel(3);
            self.updatePlayers();
        };


        this.char5 = new DefaultButton('btnHUD.png', 'btnHUD.png');
        this.char5.build(300 * scale,70 * scale);
        this.char5.setPosition( windowWidth / 2 ,windowHeight / 2);
        this.addChild(this.char5);

        this.currentID = APP.getGameModel().currentID;
        this.char5.addLabel(new PIXI.Text('Pi', { align:'center', font:'25px Arial', wordWrap:true, wordWrapWidth:300}),20,15);
        this.char5.clickCallback = function(){
            if(self.currentID === 4){
                return;
            }
            APP.getGameModel().setModel(4);
            self.updatePlayers();
        };


        this.char6 = new DefaultButton('btnHUD.png', 'btnHUD.png');
        this.char6.build(300 * scale,70 * scale);
        this.char6.setPosition( windowWidth / 2 ,this.char5.getContent().position.y + 70 * scale + 5);
        this.addChild(this.char6);
        this.char6.addLabel(new PIXI.Text('Pora', { align:'center', font:'25px Arial', wordWrap:true, wordWrapWidth:300}),15,15);
        this.char6.clickCallback = function(){
            if(self.currentID === 5){
                return;
            }
            APP.getGameModel().setModel(5);
            self.updatePlayers();
        };

        this.char7 = new DefaultButton('btnHUD.png', 'btnHUD.png');
        this.char7.build(300 * scale,70 * scale);
        this.char7.setPosition( windowWidth / 2 ,this.char6.getContent().position.y + 70 * scale + 5);
        this.addChild(this.char7);
        this.char7.addLabel(new PIXI.Text('Arthur', { align:'center', font:'25px Arial', wordWrap:true, wordWrapWidth:300}),15,15);
        this.char7.clickCallback = function(){
            if(self.currentID === 6){
                return;
            }
            APP.getGameModel().setModel(6);
            self.updatePlayers();
        };

        this.char8 = new DefaultButton('btnHUD.png', 'btnHUD.png');
        this.char8.build(300 * scale,70 * scale);
        this.char8.setPosition( windowWidth / 2 ,this.char7.getContent().position.y + 70 * scale + 5);
        this.addChild(this.char8);
        this.char8.addLabel(new PIXI.Text('Poter', { align:'center', font:'25px Arial', wordWrap:true, wordWrapWidth:300}),15,15);
        this.char8.clickCallback = function(){
            if(self.currentID === 7){
                return;
            }
            APP.getGameModel().setModel(7);
            self.updatePlayers();
        };



        this.play = new DefaultButton('btnHUD.png', 'btnHUD.png');
        this.play.build(120,70);
        this.play.setPosition( windowWidth * 0.95 - this.play.width,windowHeight / 2 + 120);
        this.addChild(this.play);

        this.play.addLabel(new PIXI.Text('PLAY', { align:'center', font:'35px Arial', wordWrap:true, wordWrapWidth:300}),15,15);
        this.play.clickCallback = function(){
            self.screenManager.change('Game');
        };

        this.returnButton = new DefaultButton('btnHUD.png', 'btnHUD.png');
        this.returnButton.build(60, 80);
        this.returnButton.setPosition( windowWidth * 0.05,windowHeight * 0.95 - 65);
        this.addChild(this.returnButton);
        this.returnButton.addLabel(new PIXI.Text('<', {font:'70px Arial'}),5,5);
        this.returnButton.clickCallback = function(){
            self.screenManager.change('Wait');
        };

        this.updatePlayers();
    },
    updatePlayers:function()
    {
        // console.log(this.currentID, APP.getGameModel().currentID);
        this.currentID = APP.getGameModel().currentID;
        if(this.playerImg && this.playerImg.getContent().parent){
            this.playerImg.getContent().parent.removeChild(this.playerImg.getContent());
            this.removeChild(this.playerImg);
        }
        this.playerImg  = new SimpleSprite(APP.getGameModel().currentPlayerModel.imgSource);
        if(!this.playerImg){
            return;
        }
        this.playerImg.container.anchor.x = 0.5;
        this.playerImg.container.anchor.y = 0.5;

        var scale = 1;
        if(this.playerImg.container.width > this.playerImg.container.height){
            scale = scaleConverter(this.playerImg.container.width, windowWidth, 0.2);
        }else{
            scale = scaleConverter(this.playerImg.container.height, windowHeight, 0.4);
        }
        this.playerImg.container.scale.x = scale;
        this.playerImg.container.scale.y = scale;

        // this.playerImg  = new PIXI.Sprite.fromFrame(this.imgSource);
        this.addChild(this.playerImg);
        this.playerImg.setPosition(windowWidth / 2 , windowHeight / 2 - this.playerImg.container.height/2 - 10);
        TweenLite.from(this.playerImg.getContent().position, 0.8, {x: windowWidth / 2 - windowWidth * 0.1,y:  windowHeight * 0.1});
        TweenLite.from(this.playerImg.getContent(), 0.5, {alpha:  0});
    }
});