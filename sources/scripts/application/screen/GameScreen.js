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
        

        
        this.particleAccum = 50;
        this.gameOver = false;
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

            // self.textAcc.setText('TOUCH END!');
            self.onBulletTouch = false;
            var percent = (self.playerModel.currentBulletForce / self.playerModel.maxBulletEnergy);
            var fireForce = percent * self.playerModel.range;
            // self.playerModel.currentBulletForce = 0;
            var timeLive = (self.red.getContent().width/ self.playerModel.bulletVel) + (fireForce);

            var vel = self.playerModel.bulletVel + self.playerModel.bulletVel*percent;
            var angle = self.red.rotation;
            var bullet = new Bullet({x:Math.cos(angle) * vel,
                y:Math.sin(angle) * vel},
                timeLive);
            bullet.build();
            //UTILIZAR O ANGULO PARA CALCULAR A POSIÇÃO CORRETA DO TIRO
            bullet.setPosition(self.red.getPosition().x * 0.8, self.red.getPosition().y * 0.8);
            self.layer.addChild(bullet);

            var scaleBullet = scaleConverter(self.red.getContent().height, bullet.getContent().height, 0.8 * gameScale);
            // bullet.setScale(scaleBullet , scaleBullet);
            self.playerModel.currentBulletEnergy -= self.playerModel.maxBulletEnergy * self.playerModel.bulletCoast;

            if(self.playerModel.currentBulletEnergy < 0){
                self.playerModel.currentBulletEnergy = 0;
            }
        };


        this.hitTouch.touchstart = function(touchData){
            if(self.gameOver){
                return;
            }
            //self.textAcc.setText('TOUCH START!' + Math.random());
            if(self.red){
                self.red.setTarget(touchData.global.y);
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
                self.red.setTarget(touchData.global.y);
            }
        };
        this.textAcc.setText(this.textAcc.text+'\nbuild');

        this.spawner = 5;
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
    update:function() {
        this._super();
        if(!this.playerModel)
        {
            return;
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
                // console.log('over');
                this.screenManager.change('EndGame');
            }
        }
        if(this.bulletBar){
            this.bulletBar.updateBar(this.playerModel.currentBulletEnergy, this.playerModel.maxBulletEnergy);
        }
        if(this.energyBar){
            this.energyBar.updateBar(this.playerModel.currentEnergy, this.playerModel.maxEnergy);
        }

        if(this.spawner <= 0){
            var bird = new Bird();
            bird.build();
            this.layer.addChild(bird);
            bird.setPosition(windowWidth/2 + (100 * Math.random()),windowHeight);
            this.spawner = 500;
        }else{
            this.spawner --;
        }
        // if(this.layer){
        //     this.layer.collide
        // }
        this.updateParticles();

        // this.textAcc.setText(this.childs.length);
    },
    updateParticles:function(){
        if(this.particleAccum < 0){
            this.particleAccum = this.playerModel.currentEnergy / this.playerModel.maxEnergy * 50 + 8;
            var particle = new Particles({x:-0.9, y:-(Math.random() * 0.2 + 0.7)}, 110, 'smoke.png', -0.01);
            particle.build();
            particle.setPosition(this.red.getPosition().x - this.red.getContent().width + 5,
                this.red.getPosition().y- this.red.getContent().height / 2 + 25);
            this.addChild(particle);

        }else{
            this.particleAccum --;
        }
    },
    initApplication:function(){

        // var paralaxLayer1 = new Paralax(this.canvasArea.x);
        // paralaxLayer1.build('tree2.png', 100);
        // this.addChild(paralaxLayer1);
        // paralaxLayer1.velocity.x = -0.5;
        // paralaxLayer1.getContent().position.y = 420;
        // this.textAcc.setText(this.textAcc.text+'\ninitApplication');

        // var paralaxLayer2 = new Paralax(this.canvasArea.x);
        // paralaxLayer2.build('tree3.png', 150);
        // this.addChild(paralaxLayer2);
        // paralaxLayer2.velocity.x = -0.2;
        // paralaxLayer2.getContent().position.y = 460;
        // this.textAcc.setText(this.textAcc.text+'\ninitApplication');
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