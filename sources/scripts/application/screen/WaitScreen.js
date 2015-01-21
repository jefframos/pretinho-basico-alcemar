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

        

        var assetsToLoader = ['dist/img/ease.png',
        'dist/img/atlas/atlas.json',
        'dist/img/UI/simpleButtonOver.png',
        'dist/img/UI/simpleButtonUp.png'];


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
        this.btnBenchmark = new DefaultButton('dist/img/UI/simpleButtonUp.png', 'dist/img/UI/simpleButtonOver.png');
        this.btnBenchmark.build(80,50);
        this.btnBenchmark.setPosition( windowWidth / 2,windowHeight / 2);
        this.addChild(this.btnBenchmark);
        this.btnBenchmark.addLabel(new PIXI.Text('INIT', {font:'15px Arial'}),5,5);
        this.btnBenchmark.clickCallback = function(){
            self.screenManager.change('Game');
        };
    }
});