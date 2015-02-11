/*jshint undef:false */
var Particles = Entity.extend({
    init:function(vel, timeLive, source, rotation){
        this._super( true );
        this.updateable = false;
        this.colidable = false;
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

        this.imgSource = source;
        this.alphadecress = 0.03;
        this.scaledecress = 0.03;
        this.gravity = 0;
        if(rotation){
            this.rotation = rotation;
        }

    },
    build: function(){
        this.updateable = true;
        if(this.imgSource instanceof PIXI.Text)
        {
            this.sprite = this.imgSource;
        }else{
            this.sprite = new PIXI.Sprite.fromFrame(this.imgSource);
        }
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;
        this.sprite.alpha = 1;
        this.sprite.scale.x = 0.2;
        this.sprite.scale.y = 0.2;
        this.getContent().rotation = this.rotation;
        // TweenLite.to(this.sprite, 0.5, {alpha:1});
    },
    update: function(){
        this._super();
        if(this.gravity !== 0){
            this.velocity.y += this.gravity;
        }
        this.timeLive --;
        if(this.timeLive <= 0){
            this.preKill();
        }
        this.range = this.width;
        if(this.rotation){
            this.getContent().rotation += this.rotation;
        }

        if(this.sprite.alpha > 0){
            this.sprite.alpha -=this.alphadecress;
            if(this.sprite.alpha <= 0){
                this.preKill();
            }
        }

        if(this.sprite.scale.x >= 1){
            return;
        }
        this.sprite.scale.x += this.scaledecress;
        this.sprite.scale.y += this.scaledecress;
    },
    preKill:function(){
        //this._super();
        var self = this;
        this.sprite.alpha = 0;
        this.updateable = true;
        this.kill = true;
        //TweenLite.to(this.getContent(), 0.3, {alpha:0, onComplete:function(){self.kill = true;}});
    }
});