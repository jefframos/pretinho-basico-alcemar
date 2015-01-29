/*jshint undef:false */
var GameScreen = AbstractScreen.extend({
    init: function (label) {
        this._super(label);
    },
    destroy: function () {
        this.initApp = false;
        console.log('DESTROY');
        this._super();
    },
    build: function () {
        console.log(this.gameOver);

        this.particleAccum = 100;
        this.gameOver = false;

        this._super();

        this.textAcc = new PIXI.Text('', {font:'15px Arial'});
        this.addChild(this.textAcc);
        this.textAcc.position.y = 20;
        this.textAcc.position.x = windowWidth - 150;

        var assetsToLoader = ['dist/img/atlas/atlas.json'];


        if(assetsToLoader.length > 0){
            this.loader = new PIXI.AssetLoader(assetsToLoader);
            this.textAcc.setText(this.textAcc.text+'\ninitLoad');
            this.initLoad();
        }else{
            this.onAssetsLoaded();
        }
       
        this.accelerometer = {};

        this.hitTouch = new PIXI.Graphics();
        // this.hitTouch.setInteractive(true);
        this.hitTouch.interactive = true;

        this.hitTouch.beginFill(0);
        this.hitTouch.drawRect(0,0,windowWidth, windowHeight);
        this.addChild(this.hitTouch);
        this.hitTouch.alpha = 0;
        this.hitTouch.hitArea = new PIXI.Rectangle(0, 0, windowWidth * 0.7, windowHeight);

        this.hitTouchAttack = new PIXI.Graphics();
        // this.hitTouchAttack.setInteractive(true);
        this.hitTouchAttack.interactive = true;
        this.hitTouchAttack.beginFill(0);
        this.hitTouchAttack.drawRect(0,0,windowWidth, windowHeight);
        this.addChild(this.hitTouchAttack);
        this.hitTouchAttack.alpha = 0;
        this.hitTouchAttack.hitArea = new PIXI.Rectangle(windowWidth * 0.3, 0, windowWidth, windowHeight);
        

        
        
        var self = this;


        this.hitTouchAttack.mousedown = this.hitTouchAttack.touchstart = function(touchData){
            if(self.gameOver || self.playerModel.currentBulletEnergy < self.playerModel.maxBulletEnergy * self.playerModel.bulletCoast){
                return;
            }
            // self.textAcc.setText('TOUCH START!');
            self.touchstart = true;
            self.onBulletTouch = true;
        };
         
        this.hitTouchAttack.mouseup = this.hitTouchAttack.touchend = function(touchData){
            // self.red.spritesheet.play('hurt');
            if(!self.touchstart || self.gameOver){
                return;
            }
            self.touchstart = false;
            self.onBulletTouch = false;

            self.shoot();
        };


        this.hitTouch.touchstart = function(touchData){
            if(self.gameOver){
                return;
            }
            //self.textAcc.setText('TOUCH START!' + Math.random());
            if(self.red){
                self.red.setTarget(touchData.global.y + self.red.getContent().height * 0.8);
            }
        };
         
        this.hitTouch.touchend = function(touchData){
            if(self.gameOver){
                return;
            }
            //self.textAcc.setText('TOUCH END!');
        };

        this.hitTouch.touchmove = function(touchData){
            if(self.gameOver){
                return;
            }
            //self.textAcc.setText(touchData.global.y);
            if(self.red){
                self.red.setTarget(touchData.global.y + self.red.getContent().height * 0.8);
            }
        };
        this.textAcc.setText(this.textAcc.text+'\nbuild');

        this.spawner = 0;
    },
    onProgress:function(){
        this.textAcc.setText(this.textAcc.text+'\nonProgress');
        this._super();
    },
    onAssetsLoaded:function()
    {
        this.textAcc.setText(this.textAcc.text+'\nAssetsLoaded');
        this.initApplication();
    },
    shoot:function() {
        var percent = (this.playerModel.currentBulletForce / this.playerModel.maxBulletEnergy);
        var fireForce = percent * this.playerModel.range;
        var timeLive = (this.red.getContent().width/ this.playerModel.bulletVel) + (fireForce) + 100;

        var vel = this.playerModel.bulletVel + this.playerModel.bulletVel*percent;
        var angle = this.red.rotation;
        var bullet = new Bullet({x:Math.cos(angle) * vel,
            y:Math.sin(angle) * vel},
            timeLive, this.playerModel.bulletForce, this.playerModel.bulletSource);
        bullet.build();
        //UTILIZAR O ANGULO PARA CALCULAR A POSIÇÃO CORRETA DO TIRO
        bullet.setPosition(this.red.getPosition().x * 0.8, this.red.getPosition().y * 0.8);
        this.layer.addChild(bullet);

        var scaleBullet = scaleConverter(this.red.getContent().width, bullet.getContent().width, 0.8);
        this.playerModel.currentBulletEnergy -= this.playerModel.maxBulletEnergy * this.playerModel.bulletCoast;

        if(this.playerModel.currentBulletEnergy < 0){
            this.playerModel.currentBulletEnergy = 0;
        }
    },
    update:function() {
        this._super();
        if(!this.playerModel || !this.initApp)
        {
            return;
        }

        if(!testMobile() && this.red && APP.stage.getMousePosition().y > 0 && APP.stage.getMousePosition().y < windowHeight){
            this.red.setTarget(APP.stage.getMousePosition().y + this.red.getContent().height * 0.8);
        }

        // if(this.onBulletTouch && this.playerModel.currentBulletEnergy> 0){
        //     // this.playerModel.currentBulletEnergy -= this.playerModel.chargeBullet;
        //     this.playerModel.currentBulletForce += this.playerModel.chargeBullet;
        // }else if(this.playerModel.currentBulletEnergy <= this.playerModel.maxBulletEnergy -this.playerModel.recoverBulletEnergy) {
        //     this.playerModel.currentBulletEnergy += this.playerModel.recoverBulletEnergy;
        // }
        if(this.playerModel && this.onBulletTouch && this.playerModel.currentBulletEnergy> 0){
            // this.playerModel.currentBulletEnergy -= this.playerModel.chargeBullet;
            // this.playerModel.currentBulletForce += this.playerModel.chargeBullet;
        }
        if(this.playerModel && this.playerModel.currentBulletEnergy <= this.playerModel.maxBulletEnergy -this.playerModel.recoverBulletEnergy) {
            this.playerModel.currentBulletEnergy += this.playerModel.recoverBulletEnergy;
        }
        if(this.playerModel && this.playerModel.currentEnergy > this.playerModel.energyCoast * 1.1){
            this.playerModel.currentEnergy -= this.playerModel.energyCoast;
        }else{
            this.gameOver = true;
        }

        if(this.gameOver){
            this.red.gameOver = true;
            this.red.velocity.y += 0.05;
            // console.log(this.red.getPosition().y);
            if(this.red.getPosition().y > windowHeight+ this.red.getContent().height){
                console.log('GAME OVER');
                this.screenManager.change('EndGame');
            }
        }
        if(this.bulletBar){
            this.bulletBar.updateBar(this.playerModel.currentBulletEnergy, this.playerModel.maxBulletEnergy);
        }
        if(this.energyBar){
            this.energyBar.updateBar(this.playerModel.currentEnergy, this.playerModel.maxEnergy);
        }

        this.updateBirds();
        this.updateParticles();
        if(this.pointsLabel){
            this.pointsLabel.setText(this.points);
        }

    },
    updateBirds:function(){
        if(this.spawner <= 0){
            var bird = APP.getGameModel().getNewBird(this.red);
            bird.build();
            this.layer.addChild(bird);

            var scale = scaleConverter(bird.getContent().width, windowHeight, bird.birdModel.sizePercent);
            // console.log(scale);
            bird.setScale( scale,scale);
            // console.log(bird);
            bird.setPosition(bird.behaviour.position.x ,bird.behaviour.position.y);
            this.spawner = bird.birdModel.toNext;

        }else{
            this.spawner --;
        }
    },
    updateParticles:function(){
        if(this.particleAccum < 0){
            this.particleAccum = this.playerModel.currentEnergy / this.playerModel.maxEnergy * 100 + 8;
            var particle = new Particles({x:-0.9, y:-(Math.random() * 0.2 + 0.7)}, 110, 'smoke.png', -0.02 * Math.random() + 0.01);
            particle.build();
            particle.alphadecress = 0.01;
            particle.setPosition(this.red.getPosition().x - this.red.getContent().width - Math.random() * 10 + 15,
                this.red.getPosition().y- this.red.getContent().height / 2 + 25);
            this.addChild(particle);

        }else{
            this.particleAccum --;
        }
    },
    initApplication:function(){
        console.log('INIT APLICATION');

        this.points = 0;
        this.initApp = true;
        // this.sky = new SimpleSprite('ceu1.png');
        // this.addChild(this.sky);
        // this.sky.container.width = windowWidth;
        // this.sky.container.height = windowHeight * 0.9;
        var environment = new Environment(windowWidth, windowHeight);
        environment.build(['env1.png','env2.png','env3.png','env4.png']);
        environment.velocity.x = -1;
        this.addChild(environment);



        this.layerManager = new LayerManager();
        this.layerManager.build('Main');

        this.addChild(this.layerManager);

        //adiciona uma camada
        this.layer = new Layer();
        this.layer.build('EntityLayer');
        this.layerManager.addLayer(this.layer);


        this.playerModel = APP.getGameModel().currentPlayerModel;
        this.playerModel.reset();
        this.red = new Red(this.playerModel);
        this.red.build(this);
        this.layer.addChild(this.red);
        this.red.rotation = -1;
        this.red.setPosition(windowWidth * 0.1 -this.red.getContent().width,windowHeight * 1.2);

        this.gameOver = false;

        // this.red.setPosition(windowWidth * 0.1 +this.red.getContent().width/2,windowHeight /2);
        var scale = scaleConverter(this.red.getContent().width, windowHeight, 0.25);
        TweenLite.to(this.red.spritesheet.position, 1,{x:windowWidth * 0.15 +this.red.getContent().width/2, y:windowHeight /2} );
        this.red.setScale( scale,scale);
        var self = this;
        var posHelper =  windowHeight * 0.05;
        this.bulletBar = new BarView(windowWidth * 0.1, 10, 1, 1);
        this.addChild(this.bulletBar);
        this.bulletBar.setPosition(250 + posHelper, posHelper);

        this.energyBar = new BarView(windowWidth * 0.1, 10, 1, 1);
        this.addChild(this.energyBar);
        this.energyBar.setPosition(250 + posHelper * 2 + this.bulletBar.width, posHelper);


        this.returnButton = new DefaultButton('dist/img/UI/simpleButtonUp.png', 'dist/img/UI/simpleButtonOver.png');
        this.returnButton.build(60, 50);
        this.returnButton.setPosition( windowWidth * 0.95 - 20,windowHeight * 0.95 - 65);
        this.addChild(this.returnButton);
        this.returnButton.addLabel(new PIXI.Text('<', {font:'40px Arial'}),5,5);
        this.returnButton.clickCallback = function(){
            self.screenManager.prevScreen();
        };

        var item = new Item();
        item.build();
        item.setPosition(windowWidth, windowHeight / 2);
        this.layer.addChild(item);

        // if(possibleFullscreen()){
        //     this.fullScreen = new DefaultButton('dist/img/UI/simpleButtonUp.png', 'dist/img/UI/simpleButtonOver.png');
        //     this.fullScreen.build(40, 20);
        //     this.fullScreen.setPosition( windowWidth * 0.95 - 20,windowHeight * 0.95 - 35);
        //     this.addChild(this.fullScreen);
        //     this.fullScreen.addLabel(new PIXI.Text('Full', {font:'10px Arial'}),5,5);
        //     this.fullScreen.clickCallback = function(){
        //         fullscreen();
        //     };
        // }

        this.initBench = false;

        this.textAcc.setText(this.textAcc.text+'\nendinitApplication');


        this.gameHUD = new PIXI.DisplayObjectContainer();
        this.addChild(this.gameHUD);

        this.pointsLabel = new PIXI.Text('', {font:'25px Arial'});
        this.gameHUD.addChild(this.pointsLabel);
        this.pointsLabel.position.y = 20;
        this.pointsLabel.position.x = windowWidth / 2;

        
    },
    updatePoints:function(value){
        this.points += value;
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
            red.setPosition(-90, windowHeight * Math.random());
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