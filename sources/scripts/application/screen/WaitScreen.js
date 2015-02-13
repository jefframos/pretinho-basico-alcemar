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

        this.background = new SimpleSprite('dist/img/UI/introScreen.jpg');
        this.addChild(this.background.getContent());
        var scaleBack = scaleConverter(this.background.getContent().width, windowWidth, 1);
        this.background.getContent().scale.x = scaleBack;
        this.background.getContent().scale.y = scaleBack;
        var self = this;
        this.btnBenchmark = new DefaultButton('continueButtonBig.png', 'continueButtonBig.png');
        // console.log(this.btnBenchmark.build);
        this.btnBenchmark.build();
        scaleConverter(this.btnBenchmark.height, windowHeight, 0.25, this.btnBenchmark);
        this.btnBenchmark.setPosition( windowWidth - this.btnBenchmark.getContent().width  - 20, windowHeight - this.btnBenchmark.getContent().height - 20);
        this.addChild(this.btnBenchmark);

        // {fill:'white', align:'center', font:'12px Arial', wordWrap:true, wordWrapWidth:60}

        // this.btnBenchmark.addLabel(new PIXI.Text('Jogar', { align:'center', fill:'#033E43', font:'50px Luckiest Guy', wordWrap:true, wordWrapWidth:300}),25,18);
        this.btnBenchmark.clickCallback = function(){
            self.screenManager.change('Choice');
        };

        if(possibleFullscreen() && testMobile()){
            this.fullScreen = new DefaultButton('simpleButtonUp.png', 'simpleButtonOver.png');
            this.fullScreen.build(200, 100);
            scaleConverter(this.fullScreen.height, windowHeight, 0.2, this.fullScreen);

            this.fullScreen.setPosition( 20, windowHeight - this.fullScreen.getContent().height - 20);
            this.addChild(this.fullScreen);
            this.fullScreen.addLabel(new PIXI.Text('Fullscreen', { align:'center', fill:'#033E43', font:'28px Luckiest Guy', wordWrap:true, wordWrapWidth:300}),25,28);
            this.fullScreen.clickCallback = function(){
                fullscreen();
            };
        }

        this.zerarCookie = new DefaultButton('simpleButtonUp.png', 'simpleButtonOver.png');
        this.zerarCookie.build(200, 100);
        scaleConverter(this.zerarCookie.height, windowHeight, 0.1, this.zerarCookie);

        this.zerarCookie.setPosition( 20, 20);
        this.addChild(this.zerarCookie);
        this.zerarCookie.addLabel(new PIXI.Text('Zerar', { align:'center', fill:'#033E43', font:'50px Luckiest Guy', wordWrap:true, wordWrapWidth:300}),28,20);
        this.zerarCookie.clickCallback = function(){
            APP.getGameModel().zerarTudo();
        };

        this.maxPoints = new DefaultButton('simpleButtonUp.png', 'simpleButtonOver.png');
        this.maxPoints.build(200, 100);
        scaleConverter(this.maxPoints.height, windowHeight, 0.1, this.maxPoints);

        this.maxPoints.setPosition( 20 + this.zerarCookie.getContent().width + 10, 20);
        this.addChild(this.maxPoints);
        this.maxPoints.addLabel(new PIXI.Text(' MAX ', { align:'center', fill:'#033E43', font:'50px Luckiest Guy', wordWrap:true, wordWrapWidth:300}),28,20);
        this.maxPoints.clickCallback = function(){
            APP.getGameModel().maxPoints();
        };

        this.frontShape.parent.setChildIndex(this.frontShape, this.frontShape.parent.children.length - 1);
        TweenLite.to(this.frontShape.position, 1, {delay:0.2, y:windowHeight});
        // setTimeout(function(){

        // self.screenManager.change('Game');
        // }, 1000);
    },
    transitionIn:function()
    {
        // if(AbstractScreen.debug)console.log('transitionIn', this.screenLabel);
        this.frontShape = new PIXI.Graphics();
        this.frontShape.beginFill(0xFFFFFF);
        this.frontShape.drawRect(0,0,windowWidth, windowHeight + 10);
        this.addChild(this.frontShape);
        this.build();

    },
    transitionOut:function(nextScreen, container)
    {
        var self = this;
        this.frontShape.position.y = - windowHeight;
        TweenLite.to(this.frontShape.position, 0.8, {y:0, ease:'easeOutBounce', onComplete:function(){
            self.destroy();
            container.removeChild(self.getContent());
            nextScreen.transitionIn();
        }});
    },
});