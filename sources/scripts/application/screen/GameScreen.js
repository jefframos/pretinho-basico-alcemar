/*jshint undef:false */
var GameScreen = AbstractScreen.extend({
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
        

        this.playerModel = {
            bulletVel:5,
            range:100,
            maxEnergy:100,
            maxBulletEnergy:100,
            currentEnergy:100,
            currentBulletEnergy:100,
            recoverEnergy:0.5,
            recoverBulletEnergy:0.5,
            bulletCoast:0.3,
            chargeBullet:1,
            currentBulletForce:0
        };

        var self = this;


        this.hitTouchAttack.mousedown = this.hitTouchAttack.touchstart = function(touchData){
            self.textAcc.setText('TOUCH START!');
            self.onBulletTouch = true;
        };
         
        this.hitTouchAttack.mouseup = this.hitTouchAttack.touchend = function(touchData){
            // self.red.spritesheet.play('hurt');
            self.textAcc.setText('TOUCH END!');
            self.onBulletTouch = false;
            var fireForce = (self.playerModel.currentBulletForce / self.playerModel.maxBulletEnergy) * self.playerModel.range;
            self.playerModel.currentBulletForce = 0;
            if(self.playerModel.currentBulletEnergy < self.playerModel.maxBulletEnergy * self.playerModel.bulletCoast){
                return;
            }
            var timeLive = (self.red.getContent().width/ self.playerModel.bulletVel) + (fireForce);
            self.textAcc.setText(timeLive);
            var bullet = new Bullet({x:self.playerModel.bulletVel, y:0}, timeLive);
            bullet.build();
            bullet.setPosition(self.red.getPosition().x, self.red.getPosition().y);
            self.addChild(bullet);
            self.playerModel.currentBulletEnergy -= self.playerModel.maxBulletEnergy * self.playerModel.bulletCoast;
            if(self.playerModel.currentBulletEnergy < 0){
                self.playerModel.currentBulletEnergy = 0;
            }
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
        };

        this.bulletBar = new BarView(windowWidth * 0.1, 10, 1, 1);
        this.addChild(this.bulletBar);
        this.bulletBar.setPosition(windowWidth/2 - this.bulletBar.width / 2, windowHeight * 0.01);
    },
    onProgress:function(){
        this._super();
    },
    onAssetsLoaded:function()
    {
        this.initApplication();
    },
    update:function() {
        this._super();
        if(this.onBulletTouch && this.playerModel.currentBulletEnergy> 0){
            this.playerModel.currentBulletEnergy -= this.playerModel.chargeBullet;
            this.playerModel.currentBulletForce += this.playerModel.chargeBullet;
        }else if(this.playerModel.currentBulletEnergy <= this.playerModel.maxBulletEnergy -this.playerModel.recoverBulletEnergy) {
            this.playerModel.currentBulletEnergy += this.playerModel.recoverBulletEnergy;
        }
        this.bulletBar.updateBar(this.playerModel.currentBulletEnergy, this.playerModel.maxBulletEnergy);
    },
    initApplication:function(){
        this.red = new Red();
        this.red.build(this);
        this.addChild(this.red);
        this.red.setPosition(windowWidth * 0.05 +this.red.getContent().width/2,windowHeight /2);
        var scale = scaleConverter(this.red.getContent().height, windowHeight, 0.3);
        this.red.setScale( scale,scale);
        var self = this;
        // this.buttonHurt = new DefaultButton('_dist/img/UI/simpleButtonUp.png', '_dist/img/UI/simpleButtonOver.png');
        // this.buttonHurt.build(130);
        // this.buttonHurt.setPosition( 50,windowHeight * 0.2);
        // this.addChild(this.buttonHurt);
        // this.buttonHurt.addLabel(new PIXI.Text('Hurt', {font:'20px Arial'}),5,5);
        // this.buttonHurt.clickCallback = function(){
        //     self.red.spritesheet.play('hurt');
        // };

        // this.add = new DefaultButton('_dist/img/UI/simpleButtonUp.png', '_dist/img/UI/simpleButtonOver.png');
        // this.add.build(130);
        // this.add.setPosition( 50,windowHeight * 0.4);
        // this.addChild(this.add);
        // this.add.addLabel(new PIXI.Text('Add Entity', {font:'20px Arial'}),5,5);
        // this.add.clickCallback = function(){
        //     var red = new Red();
        //     red.build();
        //     red.setPosition(0, windowHeight * Math.random());
        //     self.addChild(red);
        //     red.velocity.x = 1;
        //     // fullscreen();
        // };

        this.btnBenchmark = new DefaultButton('_dist/img/UI/simpleButtonUp.png', '_dist/img/UI/simpleButtonOver.png');
        this.btnBenchmark.build(40, 20);
        this.btnBenchmark.setPosition( windowWidth * 0.95 - 20,windowHeight * 0.95 - 10);
        this.addChild(this.btnBenchmark);
        this.btnBenchmark.addLabel(new PIXI.Text('Bench', {font:'10px Arial'}),5,5);
        this.btnBenchmark.clickCallback = function(){
            self.benchmark();
        };

        if(possibleFullscreen()){
            this.fullScreen = new DefaultButton('_dist/img/UI/simpleButtonUp.png', '_dist/img/UI/simpleButtonOver.png');
            this.fullScreen.build(40, 20);
            this.fullScreen.setPosition( windowWidth * 0.95 - 20,windowHeight * 0.95 - 35);
            this.addChild(this.fullScreen);
            this.fullScreen.addLabel(new PIXI.Text('Full', {font:'10px Arial'}),5,5);
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