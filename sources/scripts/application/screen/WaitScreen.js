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
        'dist/img/atlas/atlas1.json',
        'dist/img/atlas/clouds.json',
        'dist/img/UI/bgChoice.png',
        'dist/img/UI/jeisoGrande.png',
        'dist/img/UI/arthurGrande.png',
        'dist/img/UI/piGrande.png',
        'dist/img/UI/rodaikaGrande.png',
        'dist/img/UI/poterGrande.png',
        'dist/img/UI/poraGrande.png',
        'dist/img/UI/feterGrande.png',
        'dist/img/UI/alcemarGrande.png',
        'dist/img/UI/netoGrande.png',
        'dist/img/UI/piangersGrande.png',
        'dist/img/UI/introScreen.jpg',
        'dist/img/UI/HUD.json'];


        if(assetsToLoader.length > 0){
            this.loader = new PIXI.AssetLoader(assetsToLoader);
            this.initLoad();
        }else{
            this.onAssetsLoaded();
        }
         
    },
    onProgress:function(){
        this._super();
        APP.labelDebug.setText(Math.floor(this.loadPercent * 100));
        console.log(this.loadPercent);
    },
    onAssetsLoaded:function()
    {
        this.initApplication();
        APP.labelDebug.visible = false;
    },
    initApplication:function(){

        var background = new SimpleSprite('dist/img/UI/introScreen.jpg');
        this.addChild(background.getContent());
        var scaleBack = scaleConverter(background.getContent().width, windowWidth, 1);
        background.getContent().scale.x = scaleBack;
        background.getContent().scale.y = scaleBack;
        var self = this;
        this.btnBenchmark = new DefaultButton('simpleButtonUp.png', 'simpleButtonOver.png');
        // console.log(this.btnBenchmark.build);
        this.btnBenchmark.build(200,100);
        this.btnBenchmark.setPosition( windowWidth - this.btnBenchmark.width  - this.btnBenchmark.height * 0.05, windowHeight - this.btnBenchmark.height - this.btnBenchmark.height * 0.05);
        this.addChild(this.btnBenchmark);

        // {fill:'white', align:'center', font:'12px Arial', wordWrap:true, wordWrapWidth:60}

        this.btnBenchmark.addLabel(new PIXI.Text('Jogar', { align:'center', fill:'#033E43', font:'50px Luckiest Guy', wordWrap:true, wordWrapWidth:300}),25,18);
        this.btnBenchmark.clickCallback = function(){
            self.screenManager.change('Choice');
        };

        if(possibleFullscreen()){
            this.fullScreen = new DefaultButton('simpleButtonUp.png', 'simpleButtonOver.png');
            this.fullScreen.build(200, 100);
            this.fullScreen.setPosition( 20, windowHeight - this.fullScreen.height - this.fullScreen.height * 0.05);
            this.addChild(this.fullScreen);
            this.fullScreen.addLabel(new PIXI.Text('Fullscreen', { align:'center', fill:'#033E43', font:'28px Luckiest Guy', wordWrap:true, wordWrapWidth:300}),25,28);
            this.fullScreen.clickCallback = function(){
                fullscreen();
            };
        }
        // setTimeout(function(){

        // self.screenManager.change('Choice');
        // }, 1000);
    }
});