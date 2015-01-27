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
        // console.log(this.btnBenchmark.build);
        this.btnBenchmark.build(300,100);
        this.btnBenchmark.setPosition( windowWidth / 2 - this.btnBenchmark.width / 2,windowHeight / 2);
        this.addChild(this.btnBenchmark);

        // {fill:'white', align:'center', font:'12px Arial', wordWrap:true, wordWrapWidth:60}

        this.btnBenchmark.addLabel(new PIXI.Text('Jogar', { align:'center', font:'60px Arial', wordWrap:true, wordWrapWidth:300}),70,15);
        this.btnBenchmark.clickCallback = function(){
            self.screenManager.change('Choice');
        };

        if(possibleFullscreen()){
            this.fullScreen = new DefaultButton('dist/img/UI/simpleButtonUp.png', 'dist/img/UI/simpleButtonOver.png');
            this.fullScreen.build(40, 20);
            this.fullScreen.setPosition( windowWidth * 0.95 - 20,windowHeight * 0.95 - 35);
            this.addChild(this.fullScreen);
            this.fullScreen.addLabel(new PIXI.Text('Full', {font:'10px Arial'}),5,5);
            this.fullScreen.clickCallback = function(){
                fullscreen();
            };
        }
    }
});