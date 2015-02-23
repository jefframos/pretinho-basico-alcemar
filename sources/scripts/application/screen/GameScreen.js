/*jshint undef:false */
var GameScreen = AbstractScreen.extend({
    init: function (label) {
        this._super(label);
    },
    destroy: function () {
        this.initApp = false;
        //console.log('DESTROY');
        this._super();
    },
    build: function () {
        //console.log(this.gameOver,'build');

       

        this.gameOver = false;

        this._super();

        this.textAcc = new PIXI.Text('', {font:'15px Arial'});
        this.addChild(this.textAcc);
        this.textAcc.position.y = 20;
        this.textAcc.position.x = windowWidth - 150;

        var assetsToLoader = ['dist/img/atlas/atlas.json'];


        if(assetsToLoader.length > 0){
            this.loader = new PIXI.AssetLoader(assetsToLoader);
            // this.textAcc.setText(this.textAcc.text+'\ninitLoad');
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
            // console.log(self.playerModel.currentBulletEnergy,self.playerModel.currentBulletForce, self.playerModel.maxBulletEnergy);
            if(self.gameOver || self.playerModel.currentBulletEnergy < self.playerModel.maxBulletEnergy * (self.playerModel.bulletCoast + 0.2)){
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
        // this.textAcc.setText(this.textAcc.text+'\nbuild');

        //this.spawner = 0;
    },
    reset:function(){
        this.destroy();
        this.build();
    },
    onProgress:function(){
        // this.textAcc.setText(this.textAcc.text+'\nonProgress');
        this._super();
    },
    onAssetsLoaded:function()
    {
        // this.textAcc.setText(this.textAcc.text+'\nAssetsLoaded');
        this.initApplication();
    },
    special:function() {
        var bulletBehaviour = this.playerModel.bulletBehaviour.clone();
        bulletBehaviour.build(this);
        this.ableSpecial = this.playerModel.toSpec;
    },
    shoot:function() {
        var timeLive = (this.red.getContent().width/ this.playerModel.bulletVel) + 200;

        var vel = this.playerModel.bulletVel + this.playerModel.bulletVel;
        var angle = this.red.rotation;
        var bullet = new Bullet({x:Math.cos(angle) * vel,
            y:Math.sin(angle) * vel},
            timeLive, this.playerModel.bulletForce, this.playerModel.bulletSource, this.playerModel.bulletParticleSource, this.playerModel.bulletRotation);
        bullet.build();
        //UTILIZAR O ANGULO PARA CALCULAR A POSIÇÃO CORRETA DO TIRO
        bullet.setPosition(this.red.getPosition().x * 0.8, this.red.getPosition().y - this.red.getContent().height * 0.8);
        this.layer.addChild(bullet);


        scaleConverter(bullet.getContent().height,this.red.getContent().height, 0.2, bullet);
        this.playerModel.currentBulletEnergy -= this.playerModel.maxBulletEnergy * this.playerModel.bulletCoast;

        if(this.playerModel.currentBulletEnergy < 0){
            this.playerModel.currentBulletEnergy = 0;
        }
    },
    update:function() {
        if(!this.updateable){
            return;
        }
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
        if(this.playerModel.currentBulletEnergy < this.playerModel.maxBulletEnergy * (this.playerModel.bulletCoast + 0.2)){
            this.alertBullet();
        }else{
            this.bulletAcum = 0;
            this.bulletIco.getContent().scale.x = 0.8;
            this.bulletIco.getContent().scale.y = 0.8;
        }
        if(this.playerModel && this.playerModel.currentEnergy > this.playerModel.energyCoast * 1.1){
            this.playerModel.currentEnergy -= this.playerModel.energyCoast;
            if(this.playerModel.currentEnergy < this.playerModel.maxEnergy * 0.2){
                this.alertGasoline();
            }else{
                this.alertAcum = 0;
                this.gasolineIco.getContent().scale.x = 0.8;
                this.gasolineIco.getContent().scale.y = 0.8;
            }
        }else{
            this.gameOver = true;
        }

        if(this.gameOver){
            this.red.gameOver = true;
            this.red.velocity.y += 0.05;
            //// console.log(this.red.getPosition().y);
            if(this.red.getPosition().y > windowHeight+ this.red.getContent().height){
                //console.log('GAME OVER');
                var newPlayers = APP.getGameModel().addPoints();
                this.endModal.show(newPlayers);
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
        this.updateItens();
        this.updateClouds();
        this.updateObstacles();
        if(this.ableSpecial > 0){
            this.ableSpecial --;
            this.specialContainer.alpha = 0.5;//(1-(this.ableSpecial/this.playerModel.toSpec) * 0.7);
            this.specialContainer.scale.x = this.specialContainer.scale.y = 0.8;
        }else{
            this.specialContainer.alpha = 1;
            this.specialContainer.scale.x = this.specialContainer.scale.y = 1;
        }
        // console.log(this.ableSpecial);
        if(this.createEggAccum === 0){
            this.createEgg();
            this.createEggAccum = -1;
        }else{
            this.createEggAccum --;
        }
        if(this.labelAcum > 0){
            this.labelAcum --;
        }
        if(this.pointsLabel && this.pointsLabel.text !== String(APP.getGameModel().currentPoints)){
            // console.log(this.pointsLabel.text !== toStringthis.points);
            this.pointsLabel.setText(APP.getGameModel().currentPoints);
            // this.pointsLabel.position.x = (this.moneyContainer.width) - this.pointsLabel.width - 20;
            this.pointsLabel.scale.x = this.pointsLabel.scale.y = 1.5;
            this.pointsLabel.rotation = Math.random() * 0.7 - 0.25;
            this.labelAcum = 20;
        }else if(this.labelAcum === 0){
            this.pointsLabel.position.x = this.moneyContainer.width / this.moneyContainer.scale.x - this.pointsLabel.width - 20;//(this.moneyContainer.width) - this.pointsLabel.width - 20;
            this.pointsLabel.scale.x = this.pointsLabel.scale.y = 1;
            this.pointsLabel.rotation = 0;
        }

    },
    alertGasoline:function(){
        // this.gasoline.getContent().tint = 0xFF0000;
        this.gasolineIco.getContent().scale.x = this.gasolineIco.getContent().scale.y = Math.abs(Math.sin(this.alertAcum += 0.08) * 0.23) + 0.8;
        
    },
    alertBullet:function(){
        // this.gasoline.getContent().tint = 0xFF0000;
        this.bulletIco.getContent().scale.x = this.bulletIco.getContent().scale.y = Math.abs(Math.sin(this.bulletAcum += 0.08) * 0.23) + 0.8;
        
    },
    updateBirds:function(){
        if(this.spawner <= 0){
            var bird = APP.getGameModel().getNewBird(this.red, this);
            bird.build();
            this.layer.addChild(bird);

            var scale = scaleConverter(bird.getContent().width, windowHeight, bird.birdModel.sizePercent);
            //// console.log(scale);
            bird.setScale( scale,scale);
            //// console.log(bird);
            bird.setPosition(bird.behaviour.position.x ,bird.behaviour.position.y);
            // console.log(bird.behaviour.position.y);
            this.spawner = bird.birdModel.toNext;

        }else{
            this.spawner --;
        }
    },
    updateItens:function(){
        if(this.itemAccum < 0){
            console.log(this.playerModel.energyCoast, 'coast');
            this.itemAccum = 1400 + Math.random() * 2000 + 3000 / this.playerModel.energyCoast;
            var item = new Item();
            item.build();
            item.setPosition(windowWidth, windowHeight * 0.1 + (windowHeight * 0.8 * Math.random()));
            this.layer.addChild(item);
            var itemScale = scaleConverter(item.getContent().height, windowHeight, 0.15);
            item.setScale(itemScale, itemScale);
        }else{
            this.itemAccum --;
        }
    },
    updateClouds:function(){
        if(this.acumCloud < 0){
            this.acumCloud = 1200;
            var simpleEntity = new SimpleEntity(this.cloudsSources[Math.floor(Math.random() * this.cloudsSources.length)]);
            simpleEntity.velocity.x = -0.6;
            simpleEntity.setPosition(windowWidth, + Math.random() * windowHeight * 0.2);
            this.backLayer.addChild(simpleEntity);
            scaleConverter(simpleEntity.getContent().height, windowHeight, 0.5, simpleEntity);
            this.vecClouds.push(simpleEntity);

        }else{
            this.acumCloud --;
            for (var i = this.vecClouds.length - 1; i >= 0; i--) {
                if(this.vecClouds[i].getContent().position.x +this.vecClouds[i].getContent().width < 0){
                    this.vecClouds[i].kill = true;
                }
            }
        }
    },
    updateObstacles:function(){
        if(this.obsAccum < 0){
            this.obsAccum = 1000 + Math.random() * 500;

            var obs = APP.getGameModel().getNewObstacle(this);
            obs.build();
            this.layer.addChild(obs);

            var scale = scaleConverter(obs.getContent().width, windowHeight, obs.birdModel.sizePercent);
            //// console.log(scale);
            obs.setScale( scale,scale);
            //// console.log(obs);
            obs.setPosition(obs.behaviour.position.x ,obs.behaviour.position.y);

        }else{
            this.obsAccum --;
        }
    },
    updateParticles:function(){
        if(this.particleAccum < 0){
            this.particleAccum = this.playerModel.currentEnergy / this.playerModel.maxEnergy * 100 + 8;
            var particle = new Particles({x:-0.9, y:-(Math.random() * 0.2 + 0.7)}, 110, this.playerModel.smoke, -0.02 * Math.random() + 0.01);
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
        //console.log('INIT APLICATION');
        this.obsAccum = 500;//1500;
        this.particleAccum = 500;
        this.itemAccum = 1000;
        this.acumCloud = 500;
        this.spawner = 150;
        this.alertAcum = 0;
        this.bulletAcum = 0;
        this.labelAcum = 0;
        APP.getGameModel().currentPoints = 0;
        APP.getGameModel().currentHorde = 0;
        this.initApp = true;

        this.vecClouds = [];

        this.sky = new SimpleSprite('sky.png');
        this.addChild(this.sky);
        this.sky.container.width = windowWidth;
        this.sky.container.height = windowHeight * 0.9;
        // var clouds = new Environment(windowWidth, windowHeight);
        // clouds.build(['1b.png','2b.png','3b.png','4b.png']);
        // clouds.velocity.x = -0.2;
        // this.addChild(clouds);
        // clouds.getContent().scale.x = clouds.getContent().scale.y = 0.5;
        // clouds.getContent().position.y = 30;
        this.cloudsSources = ['1b.png','2b.png','3b.png','4b.png'];


        this.layerManagerBack = new LayerManager();
        this.layerManagerBack.build('MainBack');
        this.addChild(this.layerManagerBack);


        var environment = new Environment(windowWidth, windowHeight);
        environment.build(['env1.png','env2.png','env3.png','env4.png']);
        environment.velocity.x = -0.35;
        this.addChild(environment);


        this.layerManager = new LayerManager();
        this.layerManager.build('Main');

        this.addChild(this.layerManager);

        //adiciona uma camada
        this.backLayer = new Layer();
        this.backLayer.build('BackLayer');
        this.layerManagerBack.addLayer(this.backLayer);

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

        this.ableSpecial = this.playerModel.toSpec;

        this.gameOver = false;

        // this.red.setPosition(windowWidth * 0.1 +this.red.getContent().width/2,windowHeight /2);
        var scale = scaleConverter(this.red.getContent().height, windowHeight, 0.25);
        TweenLite.to(this.red.spritesheet.position, 2,{x:windowWidth * 0.15 +this.red.getContent().width/2, y:windowHeight /2} );
        this.red.setScale( scale,scale);
        var self = this;

        // var posHelper =  windowHeight * 0.05;

        var barsContainer = new PIXI.DisplayObjectContainer();

        this.energyBar = new GasBarView('gasBarBack.png', 'gasBar.png', 51,2);
        barsContainer.addChild(this.energyBar.getContent());
        this.energyBar.setPosition(0, 0);
        scaleConverter(this.energyBar.getContent().width, windowWidth, 0.25, this.energyBar);


        this.gasolineIco = new SimpleSprite('gasoline.png');
        this.gasolineIco.getContent().anchor.x = 0.5;
        this.gasolineIco.getContent().anchor.y = 0.5;
        this.gasolineIco.getContent().scale.x = 0.8;
        this.gasolineIco.getContent().scale.y = 0.8;
        this.gasolineIco.getContent().position.x = 50;//this.gasolineIco.getContent().width * 0.6-5;
        this.gasolineIco.getContent().position.y = 20;
        this.energyBar.getContent().addChild(this.gasolineIco.getContent());
        
        // this.bulletBar = new GasBarView('fireBarBack.png', 'fireBar.png', 2, 4);
        this.bulletBar = new GasBarView('gasBarBack2.png', 'gasBar2.png', 51,2);
        barsContainer.addChild(this.bulletBar.getContent());
        scaleConverter(this.bulletBar.getContent().width, windowWidth, 0.25, this.bulletBar);
        this.bulletBar.setPosition(0, windowHeight - this.bulletBar.getContent().height - 40);

        this.bulletIco = new SimpleSprite('bulletIco.png');
        this.bulletIco.getContent().anchor.x = 0.5;
        this.bulletIco.getContent().anchor.y = 0.5;
        this.bulletIco.getContent().scale.x = 0.9;
        this.bulletIco.getContent().scale.y = 0.9;
        this.bulletIco.getContent().position.x = 46;//this.bulletIco.getContent().width * 0.6-5;
        this.bulletIco.getContent().position.y = 15;
        this.bulletBar.getContent().addChild(this.bulletIco.getContent());

        this.addChild(barsContainer);

        barsContainer.position.x = 20;
        barsContainer.position.y = 20;

        // barsContainer.scale.x = barsContainer.scale.y = scaleConverter(barsContainer.width, windowWidth, 0.3);


        this.pauseButton = new DefaultButton('pauseButton.png', 'pauseButton.png');
        this.pauseButton.build();
        this.addChild(this.pauseButton);
        this.pauseButton.clickCallback = function(){
            self.pauseModal.show();
        };
        scaleConverter(this.pauseButton.getContent().height, windowHeight, 0.15, this.pauseButton);
        this.pauseButton.setPosition( windowWidth - (this.pauseButton.getContent().width) - 20,windowHeight - (this.pauseButton.getContent().height) - 20);
        this.initBench = false;

        this.gameHUD = new PIXI.DisplayObjectContainer();
        this.addChild(this.gameHUD);

        this.moneyContainer = new PIXI.DisplayObjectContainer();
        this.addChild(this.moneyContainer);

        var moneyBg = new SimpleSprite('moneyContainer.png');
        this.moneyContainer.addChild(moneyBg.getContent());



        this.pointsLabel = new PIXI.Text('0', {font:'30px Luckiest Guy', fill:'#FFFFFF', stroke:'#033E43', strokeThickness:5});
        this.moneyContainer.addChild(this.pointsLabel);

        this.specialContainer = new PIXI.DisplayObjectContainer();
        this.specialButton = new DefaultButton('out.png', 'out.png');
        this.specialButton.build();
        this.specialContainer.addChild(this.specialButton.getContent());
        this.specialButton.clickCallback = function(){
            if(self.ableSpecial > 0){
                return;
            }
            self.special();
        };
        scaleConverter(this.specialButton.getContent().height, windowHeight, 0.20, this.specialButton);
        this.specialButton.setPosition(-this.specialButton.getContent().width / 2, -this.specialButton.getContent().height/2);
        this.specialContainer.position.x = this.specialButton.getContent().width / 2 + windowWidth - (this.specialButton.getContent().width) - 20;
        this.specialContainer.position.y = this.specialButton.getContent().height/2 + this.moneyContainer.position.y + this.moneyContainer.height + windowHeight * 0.05;
        
        this.addChild(this.specialContainer);

        // var moneyScale = scaleConverter(this.moneyContainer.width, windowWidth, 0.25);
        // this.moneyContainer.scale.x = moneyScale;
        // this.moneyContainer.scale.y = moneyScale;

        // this.pointsLabel.position.x = this.moneyContainer.width + this.pointsLabel.width / 2;
        this.pointsLabel.position.y = 2;
        scaleConverter(this.moneyContainer.width, windowWidth, 0.15, this.moneyContainer);

        this.moneyContainer.position.y = 10;
        this.moneyContainer.position.x = windowWidth - this.moneyContainer.width - 20;//this.moneyContainer.width * 0.05;
        this.pointsLabel.position.x = this.moneyContainer.width - this.pointsLabel.width - 10;


        this.updateable = true;

        this.endModal = new EndModal(this);
        // this.endModal.show();
        this.newBirdModal = new NewBirdModal(this);
        // this.newBirdModal.show();

        this.pauseModal = new PauseModal(this);

        // console.log( APP.getGameModel().totalBirds , APP.getGameModel().totalPlayers);

        if(APP.getGameModel().totalPlayers > 1 && APP.getGameModel().totalBirds < APP.getGameModel().birdModels.length && APP.getGameModel().totalPlayers >= APP.getGameModel().totalBirds && (APP.getGameModel().totalPlayers === 2 || Math.random() < 0.5)){
            this.createEggAccum = Math.floor(Math.random() * 800 + 200);
        }else{
            this.createEggAccum = -1;
        }

        // this.createEgg();
        // add first cloud
        var simpleEntity = new SimpleEntity(this.cloudsSources[Math.floor(Math.random() * this.cloudsSources.length)]);
        simpleEntity.velocity.x = -0.6;
        simpleEntity.setPosition(windowWidth * 0.1, + Math.random() * windowHeight * 0.2);
        this.backLayer.addChild(simpleEntity);
        var itemScale = scaleConverter(simpleEntity.getContent().height, windowHeight, 0.5);
        simpleEntity.getContent().scale.x = simpleEntity.getContent().scale.y = itemScale;
        this.vecClouds.push(simpleEntity);
        
        this.frontShape.parent.setChildIndex(this.frontShape, this.frontShape.parent.children.length - 1);
        TweenLite.to(this.frontShape, 0.8, {alpha:0});
        // setTimeout(function(){

        // self.screenManager.change('Game');
        // }, 1000);
    },
    transitionIn:function()
    {
        // if(AbstractScreen.debug)console.log('transitionIn', this.screenLabel);
        this.frontShape = new PIXI.Graphics();
        this.frontShape.beginFill(0x406389);
        this.frontShape.drawRect(0,0,windowWidth, windowHeight);
        this.addChild(this.frontShape);
        this.build();

    },
    transitionOut:function(nextScreen, container)
    {
        // this._super();
        var self = this;
        TweenLite.to(this.frontShape, 0.3, {alpha:1, onComplete:function(){
            self.destroy();
            container.removeChild(self.getContent());
            nextScreen.transitionIn();
        }});
    },
    createEgg:function(){
        console.log('(egg)');
        if(APP.getGameModel().totalBirds >= APP.getGameModel().birdModels.length){
            return;
        }
        this.egg = new Egg(APP.getGameModel().birdModels[APP.getGameModel().totalBirds], this);
        this.egg.build();
        this.egg.setPosition(windowWidth, windowHeight * 0.1 + (windowHeight * 0.8 * Math.random()));
        this.layer.addChild(this.egg);
        scaleConverter(this.egg.getContent().height, windowHeight, 0.15, this.egg);
        this.layer.addChild(this.egg);
    },
    updatePoints:function(value){
        APP.getGameModel().currentPoints += value;
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