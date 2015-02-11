/*jshint undef:false */
var Bird = Entity.extend({
    init:function(birdModel, screen){
        this._super( true );
        this.updateable = false;
        this.deading = false;
        this.range = 80;
        this.width = 1;
        this.height = 1;
        this.type = 'bird';
        this.target = 'enemy';
        this.fireType = 'physical';

        this.birdModel = birdModel;
        this.vel = birdModel.vel;

        this.velocity.x = -this.vel;
        this.velocity.y = 0;
        this.screen = screen;
        this.demage = this.birdModel.demage;
        this.hp = this.birdModel.hp;
        this.defaultVelocity = this.birdModel.vel;
        this.imgSource = this.birdModel.imgSource;
        this.behaviour = this.birdModel.behaviour.clone();
        this.acceleration = 0.1;
    },
    hurt: function(demage){
        this.hp -= demage;
        this.velocity.x = -Math.abs(this.vel * 0.4);
        if(this.hp <= 0){
            APP.updatePoints(this.birdModel.money);

            var mascadasLabel = new Particles({x:0, y:-(Math.random() * 0.2 + 0.3)}, 120,
                new PIXI.Text(this.birdModel.money, {font:'35px Luckiest Guy', fill:'#FFFFFF', stroke:'#033E43', strokeThickness:3}),
                0);
            mascadasLabel.build();
            mascadasLabel.setPosition(this.getPosition().x,
                this.getPosition().y - Math.random() * 50);
            mascadasLabel.alphadecress = 0.01;
            this.screen.addChild(mascadasLabel);

            this.preKill();
        }
        this.getContent().tint = 0xFF0000;
    },
    build: function(){
        this.sprite = new PIXI.Sprite.fromFrame(this.imgSource);

        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;

        this.updateable = true;
        this.collidable = true;

        this.range = this.sprite.width;

        
        // this.centerPosition.x = -this.sprite.width/2;
        // this.centerPosition.y = -this.sprite.height/2;
       
    },
    update: function(){
        this._super();
        this.behaviour.update(this);


        if(Math.abs(this.velocity.x) < Math.abs(this.vel)){
            this.velocity.x -= this.acceleration;
        }else{
            this.velocity.x = -Math.abs(this.vel);
        }


        // console.log(this.velocity);
        this.range = this.sprite.height * 0.7;// * this.sprite.scale.x;

        if(this.collideArea){
            return;
        }

        if(this.getContent().tint === 0xFF0000){
            this.getContent().tint = 0xFFFFFF;
        }
        // this.collideArea = new PIXI.Graphics();
        // this.collideArea.lineStyle(1,0x665544);
        // this.collideArea.drawCircle(this.centerPosition.x,this.centerPosition.y,this.range);
        // this.getContent().addChild(this.collideArea);
    },
    preKill:function(){
        for (var i = 2; i >= 0; i--) {
            var particle = new Particles({x: Math.random() * 4 - 2, y:-(Math.random() * 2 + 1)}, 120, 'smoke.png', Math.random() * 0.1);
            particle.build();
            particle.gravity = 0.1 * Math.random();
            particle.alphadecres = 0.08;
            particle.setPosition(this.getPosition().x - (Math.random() + this.getContent().width * 0.1) / 2,
                this.getPosition().y);
            this.layer.addChild(particle);
        }
        this.collidable = false;
        this.kill = true;
    }
});