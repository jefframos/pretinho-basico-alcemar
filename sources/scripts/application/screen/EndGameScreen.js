/*jshint undef:false */
var EndGameScreen = AbstractScreen.extend({
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
       
        var self = this;
        this.btnBenchmark = new DefaultButton('dist/img/UI/simpleButtonUp.png', 'dist/img/UI/simpleButtonOver.png');
        this.btnBenchmark.build(300,120);
        this.btnBenchmark.setPosition( windowWidth / 2 - this.btnBenchmark.width / 2,windowHeight / 2);
        this.addChild(this.btnBenchmark);
        this.btnBenchmark.addLabel(new PIXI.Text('REINIT', {font:'50px Arial'}),25,15);
        this.btnBenchmark.clickCallback = function(){
            self.screenManager.change('Choice');
        };
    }
});