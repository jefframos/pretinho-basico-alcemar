/*jshint undef:false */
var Bird = Entity.extend({
    init:function(birdModel){
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

        this.demage = this.birdModel.demage;
        this.hp = this.birdModel.hp;
        this.defaultVelocity = this.birdModel.vel;
        this.imgSource = this.birdModel.imgSource;
        
        this.acceleration = 0.1;
    },
    hurt: function(demage){
        this.hp -= demage;
        this.velocity.x = 0;
        if(this.hp <= 0){
            this.preKill();
        }
    },
    build: function(behaviour){

        this.behaviour = behaviour;
        this.sprite = new PIXI.Sprite.fromFrame(this.imgSource);

        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;

        this.updateable = true;
        this.collidable = true;

        this.range = this.sprite.width;
        // this.centerPosition.x = -this.sprite.width/2;
        // this.centerPosition.y = -this.sprite.height/2;

        // console.log(this.range, this.centerPosition);
    },
    update: function(){
        this._super();
        this.behaviour.update();

        if(this.velocity.x > -this.vel){
            this.velocity.x -= this.acceleration;
        }else{
            this.velocity.x = -this.vel;
        }
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