/*jshint undef:false */
var Application = AbstractApplication.extend({
	init:function(){

        this._super(windowWidth, windowHeight);
        this.stage.setBackgroundColor(0xBFF5FF);
        // this.stage.setBackgroundColor(0xFF9387);
        this.stage.removeChild(this.loadText);
        this.isMobile = testMobile();
        this.appContainer = document.getElementById('rect');
        this.id = parseInt(Math.random() * 100000000000);
        this.gameModel = new AppModel();
	},
    update:function(){
        this._super();
    },
    build:function(){
        this._super();
        var assetsToLoader = [];

        if(assetsToLoader.length > 0){
            this.assetsLoader = new PIXI.AssetLoader(assetsToLoader);
            var self = this;

            this.assetsLoader.onComplete = function() {
                self.onAssetsLoaded();
            };
            this.assetsLoader.onProgress = function() {
                console.log('onProgress');
            };
            this.assetsLoader.load();
        }else{
            this.onAssetsLoaded();
        }
    },
    getGameModel:function(){
        return this.gameModel;
    },
    initApplication:function(){
        this.waitScreen = new WaitScreen('Wait');
        this.gameScreen = new GameScreen('Game');
        this.endGameScreen = new EndGameScreen('EndGame');
        this.choicePlayerScreen = new ChoicePlayerScreen('Choice');
        this.screenManager.addScreen(this.waitScreen);
        this.screenManager.addScreen(this.gameScreen);
        this.screenManager.addScreen(this.endGameScreen);
        this.screenManager.addScreen(this.choicePlayerScreen);
        this.screenManager.change('Wait');
    },
    onAssetsLoaded:function()
    {
        this.initApplication();
    },
    show:function(){
    },
    hide:function(){
    },
    destroy:function(){
    }
});