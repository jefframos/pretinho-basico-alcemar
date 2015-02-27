/*jshint undef:false */
var SequenceBehaviour = Class.extend({
	init:function(props){
		this.props = props? props : {};
	},
	clone:function(){
		return new SequenceBehaviour(this.props);
	},
	build:function(screen){
		var vel = this.props.vel ? this.props.vel:10;
		var timeLive = windowWidth / vel;
		var timeInterval = this.props.timeInterval ? this.props.timeInterval: 150;
		this.totalFires = this.props.totalFires ? this.props.totalFires: 20;
		var angleOpen = this.props.angleOpen !== undefined ? this.props.angleOpen:0.9;
		var bulletForce = this.props.bulletForce ? this.props.bulletForce : screen.playerModel.bulletForce;
		var invencible = this.props.invencible ? this.props.invencible : false;
		var size = this.props.size ? this.props.size: 0.3;
		var self = this;
		var sinoid = this.props.sinoid ? this.props.sinoid : false;
		// console.log(angleOpen, this.props);
		this.interval = setInterval(function(){
			var angle = screen.red.rotation;
			angle += angleOpen === 0?0:((angleOpen * Math.random() - angleOpen/2));
			var bullet = new Bullet({x:Math.cos(angle) * vel,
				y:Math.sin(angle) * vel},
				timeLive, bulletForce, screen.playerModel.bulletSource, screen.playerModel.bulletParticleSource, screen.playerModel.bulletRotation);
			bullet.invencible = invencible;
			bullet.build();
			bullet.getContent().rotation = angle;
			bullet.sinoid = sinoid;
			//UTILIZAR O ANGULO PARA CALCULAR A POSIÇÃO CORRETA DO TIRO
			bullet.setPosition(screen.red.getPosition().x * 0.9, screen.red.getPosition().y - screen.red.getContent().height * 0.8);
			screen.layer.addChild(bullet);
			scaleConverter(bullet.getContent().height,screen.red.getContent().height, size, bullet);
			if(--self.totalFires <= 0){
				clearInterval(self.interval);
			}
		}, timeInterval);
	},
	destroy:function(){

	},
	serialize:function(){
		
	}
});