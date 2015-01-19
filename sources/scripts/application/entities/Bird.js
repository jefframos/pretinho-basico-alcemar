/*jshint undef:false */
var Bird = Entity.extend({
    init:function(vel, timeLive){
        this._super( true );
        this.updateable = false;
        this.deading = false;
        this.range = 40;
        this.width = 1;
        this.height = 1;
        this.type = 'fire';
        this.target = 'enemy';
        this.fireType = 'physical';
        this.node = null;
        this.velocity.x = vel.x;
        this.velocity.y = vel.y;
        this.timeLive = timeLive;
        this.power = 1;
        this.defaultVelocity = 1;
        this.imgSource = 'red0001';

    },
    build: function(){

        this.sprite = new PIXI.Sprite.fromFrame(this.imgSource);

        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;

        this.updateable = true;
        this.collidable = true;
    },
    update: function(){
        this._super();
        this.timeLive --;
        if(this.timeLive <= 0){
            this.preKill();
        }
        this.range = this.width;
        if(this.fall){
            this.velocity.y -= 0.1;
        }
    },
    collide:function(arrayCollide){
        // console.log('fireCollide', arrayCollide[0].type);
        if(this.collidable){
            if(arrayCollide[0].type === this.target){
               // if(this.fireType === 'physical'){
                this.preKill();
                //}
                arrayCollide[0].hurt(this.power, this.fireType);
                
            }
        }
    },
    preKill:function(){
        //this._super();
        if(this.collidable){
            var self = this;
            this.updateable = true;
            this.collidable = false;
            this.fall = true;
            // this.getContent().tint = 0xff0000;
            //var scl = this.getContent().scale.x;
            //TweenLite.to(this.getContent().scale, 0.3, {x:scl * , y:1, onComplete:function(){self.kill = true;}});

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