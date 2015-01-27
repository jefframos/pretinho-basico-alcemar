/*jshint undef:false */
var Bird = Entity.extend({
    init:function(vel, timeLive){
        this._super( true );
        this.updateable = false;
        this.deading = false;
        this.range = 80;
        this.width = 1;
        this.height = 1;
        this.type = 'bird';
        this.target = 'enemy';
        this.fireType = 'physical';
        this.node = null;

        // this.velocity.x = vel.x;
        // this.velocity.y = vel.y;
        // this.timeLive = timeLive;

        this.velocity.y = -0.8;
        this.velocity.x = -0.2;

        this.power = 1;
        this.defaultVelocity = 1;
        this.imgSource = 'belga.png';



    },
    build: function(){

        this.sprite = new PIXI.Sprite.fromFrame(this.imgSource);

        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;

        this.updateable = true;
        this.collidable = true;

        this.range = this.sprite.width;
        // this.centerPosition.x = this.sprite.width/2;
        // this.centerPosition.y = this.sprite.height/2;

        // console.log(this.range, this.centerPosition);
    },
    update: function(){
        this._super();
        // this.timeLive --;
        // if(this.timeLive <= 0){
        //     this.preKill();
        // }
        // this.range = this.width;
        // if(this.fall){
        //     this.velocity.y -= 0.1;
        // }
    },
    collide:function(arrayCollide){
        // console.log('fireCollide', arrayCollide[0].type);
        if(this.parent && this.parent.textAcc){
            this.parent.textAcc.setText('COLIDIU');
        }
        if(this.collidable){
            if(arrayCollide[0].type === 'bullet'){
               // if(this.fireType === 'physical'){
                this.preKill();
                //}
                // arrayCollide[0].hurt(this.power, this.fireType);
                
            }
        }
    },
    preKill:function(){
        //this._super();
        this.kill = true;
        // if(this.collidable){
        //     var self = this;
        //     this.updateable = true;
        //     this.collidable = false;
        //     this.fall = true;
        //     // this.getContent().tint = 0xff0000;
        //     //var scl = this.getContent().scale.x;
        //     //TweenLite.to(this.getContent().scale, 0.3, {x:scl * , y:1, onComplete:function(){self.kill = true;}});

        // }
    }
});