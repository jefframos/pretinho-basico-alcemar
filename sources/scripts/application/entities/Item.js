/*jshint undef:false */
var Item = Entity.extend({
    init:function(){
        this._super( true );
        this.updateable = false;
        this.deading = false;
        this.range = 80;
        this.width = 1;
        this.height = 1;
        this.type = 'item';

        this.vel = 2;

        this.velocity.x = -this.vel;
        this.imgSource = 'gasoline.png';
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


        // console.log(this.velocity);
        this.range = this.sprite.height * 0.7;// * this.sprite.scale.x;

        if(this.collideArea){
            return;
        }
        // this.collideArea = new PIXI.Graphics();
        // this.collideArea.lineStyle(1,0x665544);
        // this.collideArea.drawCircle(this.centerPosition.x,this.centerPosition.y,this.range);
        // this.getContent().addChild(this.collideArea);
    },
    preKill:function(){
        for (var i = 4; i >= 0; i--) {
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