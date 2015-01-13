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

        

        var assetsToLoader = ['_dist/img/ease.png',
        '_dist/img/UI/simpleButtonOver.png',
        '_dist/img/spritesheet/red/red.json',
        '_dist/img/UI/simpleButtonUp.png'];


        if(assetsToLoader.length > 0){
            this.loader = new PIXI.AssetLoader(assetsToLoader);
            this.initLoad();
        }else{
            this.onAssetsLoaded();
        }
        this.textAcc = new PIXI.Text('Acc', {font:'15px Arial'});
        this.addChild(this.textAcc);
        this.textAcc.position.y = 20;
        this.textAcc.position.x = windowWidth - 150;
        this.accelerometer = {};

        this.hitTouch = new PIXI.Graphics();
        this.hitTouch.setInteractive(true);
        this.hitTouch.beginFill(0);
        this.hitTouch.drawRect(0,0,windowWidth, windowHeight);
        this.addChild(this.hitTouch);
        this.hitTouch.alpha = 0;
        this.hitTouch.hitArea = new PIXI.Rectangle(0, 0, windowWidth * 0.7, windowHeight);

        this.hitTouchAttack = new PIXI.Graphics();
        this.hitTouchAttack.setInteractive(true);
        this.hitTouchAttack.beginFill(0);
        this.hitTouchAttack.drawRect(0,0,windowWidth, windowHeight);
        this.addChild(this.hitTouchAttack);
        this.hitTouchAttack.alpha = 0;
        this.hitTouchAttack.hitArea = new PIXI.Rectangle(windowWidth * 0.3, 0, windowWidth, windowHeight);
        
        var self = this;


        this.hitTouchAttack.touchstart = function(touchData){
            self.textAcc.setText('TOUCH START!');
        };
         
        this.hitTouchAttack.touchend = function(touchData){
            self.red.spritesheet.play('hurt');
            self.textAcc.setText('TOUCH END!');
        };


        this.hitTouch.touchstart = function(touchData){
            //self.textAcc.setText('TOUCH START!' + Math.random());
            if(self.red){
                self.red.setTarget(touchData.global.y);
            }
        };
         
        this.hitTouch.touchend = function(touchData){
            //self.textAcc.setText('TOUCH END!');
        };

        this.hitTouch.touchmove = function(touchData){
            //self.textAcc.setText(touchData.global.y);
            if(self.red){
                self.red.setTarget(touchData.global.y);
            }
            console.log(touchData);
        };
            
    },
    onProgress:function(){
        this._super();
    },
    onAssetsLoaded:function()
    {
        this.initApplication();
    },
    initApplication:function(){
        this.easeImg = new SimpleSprite('_dist/img/ease.png');
        this.addChild(this.easeImg);
        this.easeImg.setPosition(windowWidth / 2 - this.easeImg.getContent().width / 2, 50);

        this.red = new Red();
        this.red.build(this);
        this.addChild(this.red);
        this.red.setPosition(windowWidth / 2,windowHeight * 0.1);

        var self = this;
        this.buttonHurt = new DefaultButton('_dist/img/UI/simpleButtonUp.png', '_dist/img/UI/simpleButtonOver.png');
        this.buttonHurt.build(130);
        this.buttonHurt.setPosition( 50,windowHeight * 0.2);
        this.addChild(this.buttonHurt);
        this.buttonHurt.addLabel(new PIXI.Text('Hurt', {font:'20px Arial'}),5,5);
        this.buttonHurt.clickCallback = function(){
            self.red.spritesheet.play('hurt');
        };

        this.add = new DefaultButton('_dist/img/UI/simpleButtonUp.png', '_dist/img/UI/simpleButtonOver.png');
        this.add.build(130);
        this.add.setPosition( 50,windowHeight * 0.4);
        this.addChild(this.add);
        this.add.addLabel(new PIXI.Text('Add Entity', {font:'20px Arial'}),5,5);
        this.add.clickCallback = function(){
            var red = new Red();
            red.build();
            red.setPosition(0, windowHeight * Math.random());
            self.addChild(red);
            red.velocity.x = 1;
            // fullscreen();
        };

        this.btnBenchmark = new DefaultButton('_dist/img/UI/simpleButtonUp.png', '_dist/img/UI/simpleButtonOver.png');
        this.btnBenchmark.build(130);
        this.btnBenchmark.setPosition( 50,windowHeight * 0.6);
        this.addChild(this.btnBenchmark);
        this.btnBenchmark.addLabel(new PIXI.Text('Benchmark', {font:'20px Arial'}),5,5);
        this.btnBenchmark.clickCallback = function(){
            self.benchmark();
        };

        if(possibleFullscreen()){
            this.fullScreen = new DefaultButton('_dist/img/UI/simpleButtonUp.png', '_dist/img/UI/simpleButtonOver.png');
            this.fullScreen.build(130);
            this.fullScreen.setPosition( 50,windowHeight * 0.8);
            this.addChild(this.fullScreen);
            this.fullScreen.addLabel(new PIXI.Text('Full Screen', {font:'20px Arial'}),5,5);
            this.fullScreen.clickCallback = function(){
                fullscreen();
            };
        }

        this.initBench = false;
        
    },
    benchmark:function()
    {
        if(this.initBench){
            return;
        }
        var self = this;
        this.initBench = true;
        this.accBench = 0;
        
        function addEntity(){
            var red = new Red();
            red.build();
            red.setPosition(-20, windowHeight * Math.random());
            self.addChild(red);
            red.velocity.x = 1;
            self.accBench ++;
            if(self.accBench > 300){
                self.initBench = false;
                clearInterval(self.benchInterval);
            }
        }
        this.benchInterval = setInterval(addEntity, 50);
    }
});