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
        this.easeImg = new SimpleSprite('dist/img/ease.png');
        this.addChild(this.easeImg);
        this.easeImg.setPosition(windowWidth / 2 - this.easeImg.getContent().width / 2, 50);
        var self = this;
        this.char1 = new DefaultButton('dist/img/UI/simpleButtonUp.png', 'dist/img/UI/simpleButtonOver.png');
        this.char1.build(300,100);
        this.char1.setPosition( windowWidth / 2 - this.char1.width / 2,windowHeight / 2);
        this.addChild(this.char1);

        this.char1.addLabel(new PIXI.Text('Piangers', { align:'center', font:'60px Arial', wordWrap:true, wordWrapWidth:300}),20,15);
        this.char1.clickCallback = function(){
            APP.getGameModel().setModel(0);
            self.updatePlayers();
        };


        this.char2 = new DefaultButton('dist/img/UI/simpleButtonUp.png', 'dist/img/UI/simpleButtonOver.png');
        this.char2.build(300,100);
        this.char2.setPosition( windowWidth / 2 - this.char2.width / 2,windowHeight / 2 + 120);
        this.addChild(this.char2);

        this.char2.addLabel(new PIXI.Text('Piangers2', { align:'center', font:'60px Arial', wordWrap:true, wordWrapWidth:300}),15,15);
        this.char2.clickCallback = function(){
            APP.getGameModel().setModel(1);
            self.updatePlayers();
        };

        this.play = new DefaultButton('dist/img/UI/simpleButtonUp.png', 'dist/img/UI/simpleButtonOver.png');
        this.play.build(120,70);
        this.play.setPosition( windowWidth * 0.95 - this.play.width,windowHeight / 2 + 120);
        this.addChild(this.play);

        this.play.addLabel(new PIXI.Text('PLAY', { align:'center', font:'35px Arial', wordWrap:true, wordWrapWidth:300}),15,15);
        this.play.clickCallback = function(){
            self.screenManager.change('Game');
        };

        this.returnButton = new DefaultButton('dist/img/UI/simpleButtonUp.png', 'dist/img/UI/simpleButtonOver.png');
        this.returnButton.build(60, 60);
        this.returnButton.setPosition( windowWidth * 0.95 - 65,windowHeight * 0.95 - 65);
        this.addChild(this.returnButton);
        this.returnButton.addLabel(new PIXI.Text('<', {font:'10px Arial'}),5,5);
        this.returnButton.clickCallback = function(){
            self.screenManager.change('Wait');
        };

        this.updatePlayers();
    },
    updatePlayers:function()
    {
        if(this.playerImg && this.playerImg.getContent().parent){
            this.playerImg.getContent().parent.removeChild(this.playerImg.getContent());
        }
        this.playerImg  = new SimpleSprite(APP.getGameModel().currentPlayerModel.imgSource);
        this.playerImg.container.anchor.x = 0.5;
        this.playerImg.container.anchor.y = 0.5;
        // this.playerImg  = new PIXI.Sprite.fromFrame(this.imgSource);
        this.addChild(this.playerImg);
        this.playerImg.setPosition(windowWidth / 2 , 250 - this.playerImg.container.height / 2);
    }
});