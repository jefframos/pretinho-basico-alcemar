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
        this.textAcc = new PIXI.Text('Acc', {font:'20px Arial'});
        this.addChild(this.textAcc);
        this.textAcc.position.y = 50;
        this.textAcc.position.x = 50;
        this.accelerometer = {};
        var self = this;

        // function motion(event){
        //     if(event.accelerationIncludingGravity.x === null)
        //     {
        //         return;
        //     }
            
        //     self.accelerometer.x = parseFloat(event.accelerationIncludingGravity.x.toFixed(2))/10;
        //     self.accelerometer.y = parseFloat(event.accelerationIncludingGravity.y.toFixed(2))/10;
        //     self.accelerometer.z = parseFloat(event.accelerationIncludingGravity.z.toFixed(2))/10;
        //     self.red.velocity.y = (self.accelerometer.y + 0.5) * 5 * -1;
        //     self.textAcc.setText('Accelerometer: \n'+self.accelerometer.x + '\n, '+
        //         self.accelerometer.y + '\n, '+
        //         self.accelerometer.z);
        //     // console.log('Accelerometer: '+event.accelerationIncludingGravity.x + ', '+event.accelerationIncludingGravity.y + ', '+event.accelerationIncludingGravity.z);
        // }
        // if(window.DeviceMotionEvent){
        //     window.addEventListener('devicemotion', motion, false);
        // }else{
        //     alert('DeviceMotionEvent is not supported');
        // }
            
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
        this.red.setPosition(windowWidth / 2, windowHeight / 2);

        var self = this;
        this.buttonHurt = new DefaultButton('_dist/img/UI/simpleButtonUp.png', '_dist/img/UI/simpleButtonOver.png');
        this.buttonHurt.build(130);
        this.buttonHurt.setPosition( 50,windowHeight/2 + 30);
        this.addChild(this.buttonHurt);
        this.buttonHurt.addLabel(new PIXI.Text('Hurt', {font:'20px Arial'}),5,5);
        this.buttonHurt.clickCallback = function(){
            self.red.spritesheet.play('hurt');
        };

        this.add = new DefaultButton('_dist/img/UI/simpleButtonUp.png', '_dist/img/UI/simpleButtonOver.png');
        this.add.build(130);
        this.add.setPosition( 50,windowHeight/2 + 90);
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
        this.btnBenchmark.setPosition( 50,windowHeight/2 + 150);
        this.addChild(this.btnBenchmark);
        this.btnBenchmark.addLabel(new PIXI.Text('Benchmark', {font:'20px Arial'}),5,5);
        this.btnBenchmark.clickCallback = function(){
            self.benchmark();
        };

        if(possibleFullscreen()){
            this.fullScreen = new DefaultButton('_dist/img/UI/simpleButtonUp.png', '_dist/img/UI/simpleButtonOver.png');
            this.fullScreen.build(130);
            this.fullScreen.setPosition( 50,windowHeight/2 + 210);
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