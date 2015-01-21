/*jshint undef:false */
var Bullet = Entity.extend({
    init:function(vel, timeLive){
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
        this.power = 1;
        this.defaultVelocity = 1;
        this.imgSource = 'bullet';

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
            this.preKill();
        }
        this.range = this.width;
        // if(this.fall){
        //     this.velocity.y -= 0.1;
        // }
    },
    collide:function(arrayCollide){
        console.log('fireCollide', arrayCollide[0]);
        if(this.collidable){
            if(arrayCollide[0].type === 'bird'){
                console.log(arrayCollide[0].type);
                this.kill = true;//preKill();
                arrayCollide[0].preKill();
                // arrayCollide[0].hurt(this.power, this.fireType);
            }
        }
    },
    preKill:function(){
        if(this.collidable){
            var self = this;
            this.updateable = true;
            this.collidable = false;
            this.fall = true;
            this.velocity = {x:0, y:0};
            TweenLite.to(this.getContent(), 0.3, {alpha:0, onComplete:function(){self.kill = true;}});

        }
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