/*jshint undef:false */
var Bullet = Entity.extend({
    init:function(vel, timeLive, power, bulletSource, particle, rotation){
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
        // this.defaultVelocity.y = vel.y;
        //console.log(bulletSource);
        this.imgSource = bulletSource;
        this.particleSource = particle;
        this.isRotation = rotation;
        if(this.isRotation){
            this.accumRot = Math.random() * 0.1 - 0.05;
        }
        this.sin = 0;
    },
    build: function(){

        this.sprite = new PIXI.Sprite.fromFrame(this.imgSource);

        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;

        this.updateable = true;
        this.collidable = true;

        this.getContent().alpha = 0.5;
        TweenLite.to(this.getContent(), 0.3, {alpha:1});

        this.birdsCollided = [];
    },
    update: function(){
        this._super();
        this.layer.collideChilds(this);
        if(!this.targetEntity || (this.targetEntity && this.targetEntity.kill)){
            this.timeLive --;
        }
        if(this.timeLive <= 0 || this.getPosition() > windowWidth + 20){
            this.kill = true;
        }
        this.range = this.sprite.height / 2;
        if(this.isRotation){
            this.sprite.rotation += this.accumRot;
        }
        if(this.targetEntity && !this.targetEntity.kill){
            if(this.homingStart <= 0){
                this.range = this.sprite.height;
                var angle = Math.atan2(this.targetEntity.getPosition().y - this.getPosition().y, this.targetEntity.getPosition().x - this.getPosition().x);
                // var angle = Math.atan2(this.getPosition().y - this.targetEntity.getPosition().y,this.getPosition().x - this.targetEntity.getPosition().x);
                this.getContent().rotation = angle;
                angle = angle * 180 / Math.PI;
                angle += 90;
                angle = angle / 180 * Math.PI;
                // console.log(angle);
                this.velocity.x = Math.sin(angle) * this.defaultVelocity;
                this.velocity.y = -Math.cos(angle) * this.defaultVelocity;
            }
            else{
                this.homingStart --;

            }
        }

        if(this.sinoid){
            this.velocity.y = Math.sin(this.sin) * (this.velocity.x * 5);
            this.sin += 0.2;
            this.getContent().rotation = 0;
        }

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
    setHoming:function(entity, timetostart, angle){
        this.homingStart = timetostart;
        this.targetEntity = entity;
        this.getContent().rotation = angle;
    },
    collide:function(arrayCollide){
        // console.log('fireCollide', arrayCollide[0]);
        if(this.collidable){
            for (var i = arrayCollide.length - 1; i >= 0; i--) {
                if(arrayCollide[i].type === 'bird'){
                    for (var j = this.birdsCollided.length - 1; j >= 0; j--) {
                        if(arrayCollide[i] === this.birdsCollided[j])
                        {
                            return;
                        }
                    }
                    console.log('collide');
                    // console.log(arrayCollide[0].type);
                    this.preKill();
                    arrayCollide[i].hurt(this.power);
                    this.birdsCollided.push(arrayCollide[i]);
                    // arrayCollide[0].hurt(this.power, this.fireType);
                }
            }
        }
    },
    preKill:function(){
        if(this.invencible){
            return;
        }
        for (var i = 1; i >= 0; i--) {
            var particle = new Particles({x: Math.random() * 4, y:-(Math.random() * 2 + 1)}, 120, this.particleSource, Math.random() * 0.05);
            particle.build();
            particle.gravity = 0.1 * Math.random() + 0.2;
            particle.alphadecres = 0.1;
            particle.scaledecress = 0.02;
            particle.setPosition(this.getPosition().x - (Math.random() + this.getContent().width * 0.1) / 2,
                this.getPosition().y);
            this.layer.addChild(particle);
        }
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