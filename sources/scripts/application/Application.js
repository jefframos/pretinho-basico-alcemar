/*jshint undef:false */
var Application = AbstractApplication.extend({
	init:function(){

        this._super(windowWidth, windowHeight);
        this.stage.setBackgroundColor(0xBFF5FF);
        // this.stage.setBackgroundColor(0xFF9387);
        this.stage.removeChild(this.loadText);
        this.isMobile = testMobile();
        this.appContainer = document.getElementById('rect');
        this.id = parseInt(Math.random() * 100000000000);
        this.gameModel = new AppModel();

        this.objCounter = new PIXI.Text('', {font:'15px Arial'});
        this.stage.addChild(this.objCounter);
        this.objCounter.position.y = windowHeight - 40;
        this.objCounter.position.x = 20;

        this.labelDebug = new PIXI.Text('Debug', {font:'15px Arial'});
        this.stage.addChild(this.labelDebug);
        this.labelDebug.position.y = windowHeight - 20;
        this.labelDebug.position.x = 20;
	},
    update:function(){
        this._super();
        if(!this.screenManager)  {
            return;
        }
        if(!this.screenManager.currentScreen){
            return;
        }
        this.childsCounter = 1;
        this.recursiveCounter(this.screenManager.currentScreen);
        this.objCounter.setText(this.childsCounter);
    },
    recursiveCounter:function(obj){
        var j = 0;
        if(obj.children){
            for (j = obj.children.length - 1; j >= 0; j--) {
                this.childsCounter ++;
                this.recursiveCounter(obj.children[j]);
            }
        }
        else if(obj.childs){
            for (j = obj.childs.length - 1; j >= 0; j--) {
                this.childsCounter ++;
                this.recursiveCounter(obj.childs[j]);
            }
        }else{
            return;
        }
    },
    build:function(){
        this._super();
        var assetsToLoader = [];

        if(assetsToLoader.length > 0){
            this.assetsLoader = new PIXI.AssetLoader(assetsToLoader);
            var self = this;

            this.assetsLoader.onComplete = function() {
                self.onAssetsLoaded();
            };
            this.assetsLoader.onProgress = function() {
                console.log('onProgress');
            };
            this.assetsLoader.load();
        }else{
            this.onAssetsLoaded();
        }
    },
    updatePoints:function(value){
        this.gameScreen.updatePoints(value);
    },
    getGameModel:function(){
        return this.gameModel;
    },
    initApplication:function(){
        this.waitScreen = new WaitScreen('Wait');
        this.gameScreen = new GameScreen('Game');
        this.endGameScreen = new EndGameScreen('EndGame');
        this.choicePlayerScreen = new ChoicePlayerScreen('Choice');
        this.screenManager.addScreen(this.waitScreen);
        this.screenManager.addScreen(this.gameScreen);
        this.screenManager.addScreen(this.endGameScreen);
        this.screenManager.addScreen(this.choicePlayerScreen);
        this.screenManager.change('Wait');

        console.log(this.screenManager.container);
    },
    onAssetsLoaded:function()
    {
        this.initApplication();
    },
    show:function(){
    },
    hide:function(){
    },
    destroy:function(){
    }
});


//cookies
// function setCookie(cname, cvalue, exdays) {
//     var d = new Date();
//     d.setTime(d.getTime() + (exdays*24*60*60*1000));
//     var expires = "expires="+d.toUTCString();
//     document.cookie = cname + "=" + cvalue + "; " + expires;
// }

// function getCookie(cname) {
//     var name = cname + "=";
//     var ca = document.cookie.split(';');
//     for(var i=0; i<ca.length; i++) {
//         var c = ca[i];
//         while (c.charAt(0)==' ') c = c.substring(1);
//         if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
//     }
//     return "";
// }

// function checkCookie() {
//     var user = getCookie("username");
//     if (user != "") {
//         alert("Welcome again " + user);
//     } else {
//         user = prompt("Please enter your name:", "");
//         if (user != "" && user != null) {
//             setCookie("username", user, 365);
//         }
//     }
// }