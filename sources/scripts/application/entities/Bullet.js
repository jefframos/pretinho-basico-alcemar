/*jshint undef:false */
var Bullet = Entity.extend({
    init:function(vel, timeLive, power, bulletSource){
        this._super( true );
        this.updateable = false;
        this.deading = false;
        this.range = 80;
        this.width = 1;
        this.height = 1;
        this.type = 'bullet';
        this.target = 'enemy';
        this.fireType = 'physical';
        this.node = null;
        this.velocity.x = vel.x;
        this.velocity.y = vel.y;
        this.timeLive = timeLive;
        this.power = power;
        this.defaultVelocity = 1;
        console.log(bulletSource);
        this.imgSource = bulletSource;

    },
    build: function(){

        this.sprite = new PIXI.Sprite.fromFrame(this.imgSource);

        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;

        this.updateable = true;
        this.collidable = true;

        this.getContent().alpha = 0;
        TweenLite.to(this.getContent(), 0.5, {alpha:1});
    },
    update: function(){
        this._super();
        this.layer.collideChilds(this);
        this.timeLive --;
        if(this.timeLive <= 0){
            this.kill = true;
        }
        this.range = this.sprite.height;

        if(this.collideArea){
            return;
        }
        // this.collideArea = new PIXI.Graphics();
        // this.collideArea.lineStyle(1,0x665544);
        // this.collideArea.drawCircle(this.centerPosition.x,this.centerPosition.y,this.range);
        // this.getContent().addChild(this.collideArea);
        // if(this.fall){
        //     this.velocity.y -= 0.1;
        // }
    },
    collide:function(arrayCollide){
        console.log('fireCollide', arrayCollide[0]);
        if(this.collidable){
            if(arrayCollide[0].type === 'bird'){
                console.log(arrayCollide[0].type);
                this.preKill();
                arrayCollide[0].hurt(this.power);
                // arrayCollide[0].hurt(this.power, this.fireType);
            }
        }
    },
    preKill:function(){
        // for (var i = 2; i >= 0; i--) {
        //     var particle = new Particles({x: Math.random() * 4 - 2, y:-(Math.random() * 2 + 1)}, 120, 'bulletParticle.png', Math.random() * 0.1);
        //     particle.build();
        //     particle.gravity = 0.1 * Math.random() + 0.2;
        //     particle.alphadecres = 0.08;
        //     particle.setPosition(this.getPosition().x - (Math.random() + this.getContent().width * 0.1) / 2,
        //         this.getPosition().y);
        //     this.layer.addChild(particle);
        // }
        this.collidable = false;
        this.kill = true;
    },
    pointDistance: function(x, y, x0, y0){
        return Math.sqrt((x -= x0) * x + (y -= y0) * y);
    },
    touch: function(collection){
        if(collection.object && collection.object.type === 'environment'){
            collection.object.fireCollide();
        }
        this.preKill();
    },
});