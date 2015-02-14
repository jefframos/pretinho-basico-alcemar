/*jshint undef:false */
var Egg = Entity.extend({
    init:function(birdModel, screen){
        this._super( true );
        this.updateable = false;
        this.deading = false;
        this.range = 80;
        this.width = 1;
        this.height = 1;
        this.type = 'item';

        this.vel = 0.5;
        this.screen = screen;
        this.birdModel = birdModel;
        this.velocity.x = -this.vel;
        this.imgSource = birdModel.egg;
    },
    build: function(){
        this.sprite = new PIXI.Sprite.fromFrame(this.imgSource);

        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;

        this.updateable = true;
        this.collidable = true;

        this.range = this.sprite.width;

    },
    update: function(){
        this._super();

        if(Math.abs(this.velocity.x) < Math.abs(this.vel)){
            this.velocity.x -= this.acceleration;
        }else{
            this.velocity.x = -Math.abs(this.vel);
        }

        this.range = this.sprite.height * 0.5;

        if(this.collideArea){
            return;
        }
    },
    preKill:function(){
        // for (var i = this.birdModel.particles.length; i >= 0; i--) {
        //     var particle = new Particles({x: Math.random() * 4 - 2, y:-(Math.random() * 2 + 1)}, 120, this.birdModel.particles[i], Math.random() * 0.1);
        //     particle.build();
        //     particle.gravity = 0.1 * Math.random();
        //     particle.alphadecres = 0.08;
        //     particle.setPosition(this.getPosition().x - (Math.random() + this.getContent().width * 0.1) / 2,
        //         this.getPosition().y);
        //     this.layer.addChild(particle);
        // }
        APP.getGameModel().ableNewBird(this.birdModel);
        this.screen.newBirdModal.show([this.birdModel]);
        this.collidable = false;
        this.kill = true;
    }
});