/*jshint undef:false */
var GiantShootBehaviour = Class.extend({
	init:function(props){
		this.props = props? props : {};
	},
	clone:function(){
		return new GiantShootBehaviour(this.props);
	},
	build:function(screen){
        var vel = this.props.vel ? this.props.vel:2.5;
        var timeLive = windowWidth / vel;
        var totalFires = this.props.totalFires ? this.props.totalFires: 5;
        var angleOpen = this.props.angleOpen ? this.props.angleOpen:0.08;
        var bulletForce = this.props.bulletForce ? this.props.bulletForce : screen.playerModel.bulletForce * 5;
        var invencible = this.props.invencible ? this.props.invencible : false;
        var angle = 0;//screen.red.rotation;
        var size = this.props.size ? this.props.size : 0.8;

        var bullet = new Bullet({x:Math.cos(angle) * vel,
            y:Math.sin(angle) * vel},
            timeLive, bulletForce, screen.playerModel.specSource, screen.playerModel.bulletParticleSource, screen.playerModel.bulletRotation);
        bullet.invencible = invencible;
        bullet.build();
        //UTILIZAR O ANGULO PARA CALCULAR A POSIÇÃO CORRETA DO TIRO
        bullet.setPosition(screen.red.getPosition().x * size, screen.red.getPosition().y - screen.red.getContent().height * 0.8);
        screen.layer.addChild(bullet);
        scaleConverter(bullet.getContent().height,windowHeight, 0.4, bullet);
	},
	destroy:function(){

	},
	serialize:function(){
		
	}
});