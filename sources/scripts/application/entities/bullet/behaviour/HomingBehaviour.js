/*jshint undef:false */
var HomingBehaviour = Class.extend({
	init:function(props){
		this.props = props? props : {};
	},
	clone:function(){
		return new HomingBehaviour(this.props);
	},
	build:function(screen){
        var birds = [];
        for (var i = screen.layer.childs.length - 1; i >= 0; i--) {
            if(screen.layer.childs[i].type === 'bird'){
                var target = new SimpleSprite('target.png');
                screen.layer.childs[i].getContent().addChild(target.getContent());
                target.getContent().position.x = -target.getContent().width / 2;
                target.getContent().position.y = -target.getContent().height / 2;
                birds.push(screen.layer.childs[i]);
            }
        }

        var vel = this.props.vel ? this.props.vel:7;
        var timeLive = windowWidth / vel;
        var totalFires = this.props.totalFires ? this.props.totalFires: 5;
        var angleOpen = this.props.angleOpen ? this.props.angleOpen:3;
        var bulletForce = this.props.bulletForce ? this.props.bulletForce : screen.playerModel.bulletForce;
        var invencible = this.props.invencible ? this.props.invencible : false;
        for (i = 0; i < birds.length; i++) {

            var angle = screen.red.rotation + angleOpen * (i - totalFires / 2);

            var bullet = new Bullet({x:Math.cos(angle) * vel,
                y:Math.sin(angle) * vel},
                timeLive, bulletForce, screen.playerModel.bulletSource, screen.playerModel.bulletParticleSource, screen.playerModel.bulletRotation);
            bullet.invencible = invencible;
            bullet.defaultVelocity = vel;
            bullet.setHoming(birds[i], 10, angle);
            bullet.build();
            //UTILIZAR O ANGULO PARA CALCULAR A POSIÇÃO CORRETA DO TIRO
            bullet.setPosition(screen.red.getPosition().x * 0.9, screen.red.getPosition().y - screen.red.getContent().height * 0.8);
            screen.layer.addChild(bullet);
            scaleConverter(bullet.getContent().height,screen.red.getContent().height, 0.2, bullet);
        }
	},
	destroy:function(){

	},
	serialize:function(){
		
	}
});