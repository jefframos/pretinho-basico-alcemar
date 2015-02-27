/*jshint undef:false */
var MultipleBehaviour = Class.extend({
	init:function(props){
		this.props = props? props : {};
	},
	clone:function(){
		return new MultipleBehaviour(this.props);
	},
	build:function(screen){
        var vel = this.props.vel ? this.props.vel:2.5;
        var timeLive = windowWidth / vel;
        var totalFires = this.props.totalFires ? this.props.totalFires: 5;
        var size = this.props.size ? this.props.size: 0.3;
        var angleOpen = this.props.angleOpen ? this.props.angleOpen:0.08;
        var bulletForce = this.props.bulletForce ? this.props.bulletForce : screen.playerModel.bulletForce;
        var invencible = this.props.invencible ? this.props.invencible : false;
        var sinoid = this.props.sinoid ? this.props.sinoid : false;
        for (var i = 0; i <= totalFires; i++) {

            var angle = screen.red.rotation + angleOpen * (i - totalFires / 2);

            var bullet = new Bullet({x:Math.cos(angle) * vel,
                y:Math.sin(angle) * vel},
                timeLive, bulletForce, screen.playerModel.bulletSource, screen.playerModel.bulletParticleSource, screen.playerModel.bulletRotation);
            bullet.invencible = invencible;
            bullet.build();
            bullet.sinoid = sinoid;
            bullet.getContent().rotation = angle;
            //UTILIZAR O ANGULO PARA CALCULAR A POSIÇÃO CORRETA DO TIRO
            bullet.setPosition(screen.red.getPosition().x * 0.9, screen.red.getPosition().y - screen.red.getContent().height * 0.8);
            screen.layer.addChild(bullet);
            scaleConverter(bullet.getContent().height,screen.red.getContent().height, size, bullet);
        }
	},
	destroy:function(){

	},
	serialize:function(){
		
	}
});