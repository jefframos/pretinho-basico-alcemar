/*jshint undef:false */
var AkumaBehaviour = Class.extend({
	init:function(props){
		this.props = props? props : {};
	},
	clone:function(){
		return new AkumaBehaviour(this.props);
	},
	build:function(screen){
		var birds = [];
		for (var i = screen.layer.childs.length - 1; i >= 0; i--) {
			if(screen.layer.childs[i].type === 'bird'){
				screen.layer.childs[i].hurt(9999);
			}
		}
		var white = new PIXI.Graphics();
		white.beginFill(0xFFFFFF);
		white.drawRect(0,0,windowWidth, windowHeight);
		screen.addChild(white);
		TweenLite.to(white, 0.5, {alpha:0, onCompleteParams:[white], onComplete:function(target){
			if(target && target.parent){
				target.parent.removeChild(target);
				target = null;
			}
		}});
	},
	destroy:function(){

	},
	serialize:function(){
		
	}
});