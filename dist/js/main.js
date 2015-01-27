/*! jefframos 27-01-2015 */
function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    var h, s, max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
    if (max === min) h = s = 0; else {
        var d = max - min;
        switch (s = l > .5 ? d / (2 - max - min) : d / (max + min), max) {
          case r:
            h = (g - b) / d + (b > g ? 6 : 0);
            break;

          case g:
            h = (b - r) / d + 2;
            break;

          case b:
            h = (r - g) / d + 4;
        }
        h /= 6;
    }
    return {
        h: h,
        s: s,
        l: l
    };
}

function hslToRgb(h, s, l) {
    function hue2rgb(p, q, t) {
        return 0 > t && (t += 1), t > 1 && (t -= 1), 1 / 6 > t ? p + 6 * (q - p) * t : .5 > t ? q : 2 / 3 > t ? p + (q - p) * (2 / 3 - t) * 6 : p;
    }
    var r, g, b;
    if (0 === s) r = g = b = l; else {
        var q = .5 > l ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3), g = hue2rgb(p, q, h), b = hue2rgb(p, q, h - 1 / 3);
    }
    return {
        r: Math.round(255 * r),
        g: Math.round(255 * g),
        b: Math.round(255 * b)
    };
}

function toHex(n) {
    return n = parseInt(n, 10), isNaN(n) ? "00" : (n = Math.max(0, Math.min(n, 255)), 
    "0123456789ABCDEF".charAt((n - n % 16) / 16) + "0123456789ABCDEF".charAt(n % 16));
}

function rgbToHex(R, G, B) {
    return parseInt("0x" + toHex(R) + toHex(G) + toHex(B));
}

function hexToRgb(hex) {
    var r = hex >> 16, g = hex >> 8 & 255, b = 255 & hex;
    return {
        r: r,
        g: g,
        b: b
    };
}

function addSaturation(color, value) {
    var rgb = hexToRgb(color), hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    return hsl.s *= value, hsl.s > 1 && (hsl.s = 1), hsl.s < 0 && (hsl.s = 0), rgb = hslToRgb(hsl.h, hsl.s, hsl.l), 
    rgbToHex(rgb.r, rgb.g, rgb.b);
}

function pointDistance(x, y, x0, y0) {
    return Math.sqrt((x -= x0) * x + (y -= y0) * y);
}

function degreesToRadians(deg) {
    return deg * (Math.PI / 180);
}

function radiansToDegrees(rad) {
    return rad / (Math.PI / 180);
}

function scaleConverter(current, max, scale) {
    return max * scale / current;
}

function testMobile() {
    return Modernizr.touch;
}

function update() {
    requestAnimFrame(update), meter.tickStart();
    var tempRation = window.innerHeight / windowHeight, ratioRez = resizeProportional ? tempRation < window.innerWidth / realWindowWidth ? tempRation : window.innerWidth / realWindowWidth : 1;
    windowWidthVar = realWindowWidth * ratioRez * ratio, windowHeightVar = realWindowHeight * ratioRez * ratio, 
    windowWidthVar > realWindowWidth && (windowWidthVar = realWindowWidth), windowHeightVar > realWindowHeight && (windowHeightVar = realWindowHeight), 
    renderer.view.style.width = windowWidthVar + "px", renderer.view.style.height = windowHeightVar + "px", 
    APP.update(), renderer.render(APP.stage), meter.tick();
}

function possibleFullscreen() {
    var elem = renderer.view;
    return elem.requestFullscreen || elem.msRequestFullscreen || elem.mozRequestFullScreen || elem.webkitRequestFullscreen;
}

function fullscreen() {
    var elem = renderer.view;
    elem.requestFullscreen ? elem.requestFullscreen() : elem.msRequestFullscreen ? elem.msRequestFullscreen() : elem.mozRequestFullScreen ? elem.mozRequestFullScreen() : elem.webkitRequestFullscreen && elem.webkitRequestFullscreen();
}

var DungeonGenerator = Class.extend({
    init: function() {
        this.random = 0, this.numActivesNodes = 0, this.maxDist = 5, this.minNodes = 5, 
        this.seeds = 1, this.rooms = [], this.maxNodes = 10, this.mostDistant = new NodeModel(), 
        this.nodeLock = new NodeModel(), this.firstNode = new NodeModel(), this.keyNode = new NodeModel(), 
        this.precision = 1, this.seed = 0, this.rooms = [];
    },
    generate: function(seed, precision, minMax, bounds, maxLenght, start) {
        this.seed = seed, random = 0, 0 > maxLenght && (maxLenght = 99999), this.minNodes = minMax[0], 
        this.maxNodes = minMax[1], this.precision = precision, this.numActivesNodes = 0, 
        this.maxDist = -999999999, this.seeds = 1;
        var i = 0, j = 0;
        if (this.rooms.length <= 0) for (i = 0; i < bounds[0]; i++) {
            var temp = [];
            for (j = 0; j < bounds[1]; j++) {
                var tempModel = new NodeModel();
                tempModel.position = [ i, j ], temp.push(tempModel);
            }
            this.rooms.push(temp);
        }
        this.generateNodes(start ? start[0] : Math.floor(bounds[0] / 2), start ? start[1] : Math.floor(bounds[1] / 2), null, maxLenght), 
        this.mostDistant.mode = 4;
        var keyDistance = -9999999999;
        for (k = 0; k < this.rooms.length; k++) {
            var item = this.rooms[k];
            for (i = 0; i < item.length; i++) {
                var dist = this.pointDistance(this.mostDistant.position[0], this.mostDistant.position[1], item[i].position[0], item[i].position[1]);
                dist >= keyDistance && item[i].active && item[i].parentId > 0 && (keyDistance = dist, 
                this.keyNode = item[i]), item[i].parentId > 0 && item[i].position[0] === this.mostDistant.parentPosition[0] && item[i].position[1] === this.mostDistant.parentPosition[1] && (this.nodeLock = item[i]);
            }
        }
        this.nodeLock && (this.nodeLock.mode = 5), this.keyNode && (this.keyNode.mode = 6);
    },
    log: function() {
        for (var i = 0; i < this.rooms.length; i++) {
            for (var tempStr = "", item = this.rooms[i], j = 0; j < item.length; j++) 0 === item[j].mode && (tempStr += "| - |"), 
            1 === item[j].mode && (tempStr += "| ♥ |"), 2 === item[j].mode && (tempStr += "| o |"), 
            3 === item[j].mode && (tempStr += "| c |"), 4 === item[j].mode && (tempStr += "| b |"), 
            5 === item[j].mode && (tempStr += "| l |"), 6 === item[j].mode && (tempStr += "| K |");
            console.log(tempStr + "   " + i);
        }
        console.log(this.firstNode);
    },
    generateNodes: function(i, j, parent, maxLeght, forceAdd) {
        if (!((this.numActivesNodes >= this.maxNodes || 0 >= maxLeght) && !forceAdd || this.numActivesNodes > 50)) {
            for (var node = null, jj = 0; jj < this.rooms.length; jj++) for (var item = this.rooms[jj], ii = 0; ii < item.length; ii++) item[ii].position[0] === i && item[ii].position[1] === j && (node = item[ii]);
            if (node) {
                if (node.active && !forceAdd) return void this.minNodes++;
                if (this.minNodes--, node.mode = 2, this.numActivesNodes++, node.active = !0, node.id < 0 && (node.id = this.numActivesNodes, 
                node.seed = this.getNextFloat(), node.applySeed()), parent && 1 !== node.id) {
                    node.parentPosition = parent.position, node.parentId = parent.id, node.parent = parent;
                    var dist = this.pointDistance(parent.position[0], parent.position[1], this.firstNode.position[0], this.firstNode.position[1]);
                    for (node.dist = dist, this.maxDist <= dist && node.parentId > 2 && (this.maxDist = dist, 
                    this.mostDistant = node), node.dist = dist, ri = this.rooms.length - 1; ri >= 0; ri--) {
                        var tempNodeArray = this.rooms[ri];
                        for (nj = tempNodeArray.length - 1; nj >= 0; nj--) tempNodeArray[nj].id === node.parentId && (tempNodeArray[nj].position[1] > node.position[1] ? tempNodeArray[nj].childrenSides[0] = node : tempNodeArray[nj].position[1] < node.position[1] ? tempNodeArray[nj].childrenSides[1] = node : tempNodeArray[nj].position[0] > node.position[0] ? tempNodeArray[nj].childrenSides[2] = node : tempNodeArray[nj].position[0] < node.position[0] && (tempNodeArray[nj].childrenSides[3] = node));
                    }
                    node.parent.position[1] < node.position[1] ? node.childrenSides[0] = node.parent : node.parent.position[1] > node.position[1] ? node.childrenSides[1] = node.parent : node.parent.position[0] < node.position[0] ? node.childrenSides[2] = node.parent : node.parent.position[0] > node.position[0] && (node.childrenSides[3] = node.parent);
                } else node.id = 1, node.mode = 1, this.firstNode = node;
                var has = !1;
                if (this.getNextFloat() < this.seeds || this.minNodes > 0) {
                    this.seeds *= this.precision;
                    for (var tmpArr = [ 0, 0 ], arrayGens = [], rndTest = 1 === node.id, rndValue = rndTest ? .9 : .4, k = 0; 4 > k; k++) if (this.getNextFloat() < rndValue) {
                        has = !0, 0 === k ? tmpArr = [ -1, 0 ] : 1 === k ? tmpArr = [ 1, 0 ] : 2 === k ? tmpArr = [ 0, 1 ] : 3 === k && (tmpArr = [ 0, -1 ]);
                        var objGen = {};
                        objGen.i = i + tmpArr[0], objGen.j = j + tmpArr[1], objGen.parentPosition = [ i, j ], 
                        objGen.parent = node, arrayGens.push(objGen);
                    }
                    for (var n = arrayGens.length - 1; n >= 0; n--) {
                        var obj = arrayGens[n];
                        rndTest || maxLeght--, this.generateNodes(obj.i, obj.j, obj.parent, maxLeght, rndTest);
                    }
                    if (this.minNodes > 0 || this.seeds >= 1) {
                        var tempRnd = this.getNextFloat();
                        tmpArr = .25 > tempRnd ? [ -1, 0 ] : .5 > tempRnd ? [ 1, 0 ] : .75 > tempRnd ? [ 0, 1 ] : [ 0, -1 ], 
                        this.generateNodes(i + tmpArr[0], j + tmpArr[1], node, --maxLeght);
                    }
                }
                has || (node.mode = 3);
            }
        }
    },
    pointDistance: function(x, y, x0, y0) {
        return Math.sqrt((x -= x0) * x + (y -= y0) * y);
    },
    getNextFloat: function() {
        var x = 1e4 * Math.sin(this.seed++);
        return x - Math.floor(x);
    }
}), Float = Class.extend({
    init: function(seed) {
        this.seed = seed, this.tempAccSeed = this.seed;
    },
    applySeed: function() {
        this.tempAccSeed = this.seed;
    },
    getNextFloat: function() {
        var x = 1e4 * Math.sin(this.tempAccSeed++);
        return x - Math.floor(x);
    }
}), NodeModel = Class.extend({
    init: function() {
        this.position = [], this.dist = 0, this.parentPosition = [], this.childrenSides = [ null, null, null, null ], 
        this.parentId = -1, this.parent = null, this.active = !1, this.mode = 0, this.id = -1, 
        this.seed = -1, this.tempAccSeed = this.seed, this.bg = null, this.mapData = null, 
        this.topTile = {
            x: 0,
            y: 0
        }, this.bottomTile = {
            x: 0,
            y: 0
        }, this.leftTile = {
            x: 0,
            y: 0
        }, this.rightTile = {
            x: 0,
            y: 0
        }, this.placedTiles = [];
    },
    applySeed: function() {
        this.tempAccSeed = this.seed;
    },
    getNextFloat: function() {
        var x = 1e4 * Math.sin(this.tempAccSeed++);
        return x - Math.floor(x);
    }
}), SmartObject = Class.extend({
    init: function() {
        MicroEvent.mixin(this);
    },
    show: function() {},
    hide: function() {},
    build: function() {},
    destroy: function() {}
}), SmartSocket = Class.extend({
    init: function() {
        MicroEvent.mixin(this);
    },
    build: function() {},
    writeObj: function(obj) {
        this.trigger(SmartSocket.WRITE_OBJ, obj);
    },
    readSocketList: function(obj) {
        this.trigger(SmartSocket.READ_SOCKET_SNAPSHOT, obj);
    },
    readObj: function(obj) {
        this.trigger(SmartSocket.READ_OBJ, obj);
    },
    readLast: function(obj) {
        this.trigger(SmartSocket.READ_LAST, obj);
    },
    setReadCallback: function(callback) {
        this.readCallback = callback;
    },
    socketError: function() {
        this.trigger(SmartSocket.SOCKET_ERROR, obj);
    },
    setObj: function(obj) {
        this.trigger(SmartSocket.SET_OBJ, obj);
    },
    updateObj: function(obj) {
        this.trigger(SmartSocket.UPDATE_OBJ, obj);
    },
    destroy: function() {}
});

SmartSocket.UPDATE_OBJ = "updateObj", SmartSocket.READ_OBJ = "readObj", SmartSocket.READ_SOCKET_SNAPSHOT = "readSocketSnapshot", 
SmartSocket.READ_LAST = "readLast", SmartSocket.WRITE_OBJ = "writeObj", SmartSocket.SET_OBJ = "setObj", 
SmartSocket.SOCKET_ERROR = "socketError";

var Application = AbstractApplication.extend({
    init: function() {
        this._super(windowWidth, windowHeight), this.stage.setBackgroundColor(12580351), 
        this.stage.removeChild(this.loadText), this.isMobile = testMobile(), this.appContainer = document.getElementById("rect"), 
        this.id = parseInt(1e11 * Math.random()), this.gameModel = new AppModel(), this.objCounter = new PIXI.Text("", {
            font: "15px Arial"
        }), this.stage.addChild(this.objCounter), this.objCounter.position.y = 20, this.objCounter.position.x = windowWidth - 150;
    },
    update: function() {
        this._super(), this.screenManager && this.screenManager.currentScreen && (this.childsCounter = 1, 
        this.recursiveCounter(this.screenManager.currentScreen), this.objCounter.setText(this.childsCounter));
    },
    recursiveCounter: function(obj) {
        if (obj.children) for (j = obj.children.length - 1; j >= 0; j--) this.childsCounter++, 
        this.recursiveCounter(obj.children[j]); else {
            if (!obj.childs) return;
            for (j = obj.childs.length - 1; j >= 0; j--) this.childsCounter++, this.recursiveCounter(obj.childs[j]);
        }
    },
    build: function() {
        this._super();
        var assetsToLoader = [];
        if (assetsToLoader.length > 0) {
            this.assetsLoader = new PIXI.AssetLoader(assetsToLoader);
            var self = this;
            this.assetsLoader.onComplete = function() {
                self.onAssetsLoaded();
            }, this.assetsLoader.onProgress = function() {
                console.log("onProgress");
            }, this.assetsLoader.load();
        } else this.onAssetsLoaded();
    },
    getGameModel: function() {
        return this.gameModel;
    },
    initApplication: function() {
        this.waitScreen = new WaitScreen("Wait"), this.gameScreen = new GameScreen("Game"), 
        this.endGameScreen = new EndGameScreen("EndGame"), this.choicePlayerScreen = new ChoicePlayerScreen("Choice"), 
        this.screenManager.addScreen(this.waitScreen), this.screenManager.addScreen(this.gameScreen), 
        this.screenManager.addScreen(this.endGameScreen), this.screenManager.addScreen(this.choicePlayerScreen), 
        this.screenManager.change("Wait"), console.log(this.screenManager.container);
    },
    onAssetsLoaded: function() {
        this.initApplication();
    },
    show: function() {},
    hide: function() {},
    destroy: function() {}
}), BarView = Class.extend({
    init: function(width, height, maxValue, currentValue) {
        this.maxValue = maxValue, this.text = "default", this.currentValue = currentValue, 
        this.container = new PIXI.DisplayObjectContainer(), this.width = width, this.height = height, 
        this.backShape = new PIXI.Graphics(), this.backShape.beginFill(16711680), this.backShape.drawRect(0, 0, width, height), 
        this.container.addChild(this.backShape), this.frontShape = new PIXI.Graphics(), 
        this.frontShape.beginFill(65280), this.frontShape.drawRect(0, 0, width, height), 
        this.container.addChild(this.frontShape), this.frontShape.scale.x = this.currentValue / this.maxValue;
    },
    setFrontColor: function(color) {
        this.frontShape && this.container.removeChild(this.frontShape), this.frontShape = new PIXI.Graphics(), 
        this.frontShape.beginFill(color), this.frontShape.drawRect(0, 0, this.width, this.height), 
        this.container.addChild(this.frontShape);
    },
    setBackColor: function(color) {
        this.backShape && this.container.removeChild(this.backShape), this.backShape = new PIXI.Graphics(), 
        this.backShape.beginFill(color), this.backShape.drawRect(0, 0, this.width, this.height), 
        this.container.addChildAt(this.backShape, 0);
    },
    setText: function(text) {
        this.text !== text && (this.lifebar ? this.lifebar.setText(text) : (this.lifebar = new PIXI.Text(text, {
            fill: "white",
            align: "center",
            font: "10px Arial"
        }), this.container.addChild(this.lifebar)));
    },
    updateBar: function(currentValue, maxValue) {
        (this.currentValue !== currentValue || this.maxValue !== maxValue && currentValue >= 0) && (this.currentValue = currentValue, 
        this.maxValue = maxValue, this.frontShape.scale.x = this.currentValue / this.maxValue, 
        this.frontShape.scale.x < 0 && (this.frontShape.scale.x = 0));
    },
    getContent: function() {
        return this.container;
    },
    setPosition: function(x, y) {
        this.container.position.x = x, this.container.position.y = y;
    }
}), Bird = Entity.extend({
    init: function(birdModel) {
        this._super(!0), this.updateable = !1, this.deading = !1, this.range = 80, this.width = 1, 
        this.height = 1, this.type = "bird", this.target = "enemy", this.fireType = "physical", 
        this.birdModel = birdModel, this.vel = birdModel.vel, this.velocity.x = -this.vel, 
        this.velocity.y = 0, this.demage = this.birdModel.demage, this.hp = this.birdModel.hp, 
        this.defaultVelocity = this.birdModel.vel, this.imgSource = this.birdModel.imgSource, 
        this.acceleration = .1;
    },
    hurt: function(demage) {
        this.hp -= demage, this.velocity.x = 0, this.hp <= 0 && this.preKill();
    },
    build: function(behaviour) {
        this.behaviour = behaviour, this.sprite = new PIXI.Sprite.fromFrame(this.imgSource), 
        this.sprite.anchor.x = .5, this.sprite.anchor.y = .5, this.updateable = !0, this.collidable = !0, 
        this.range = this.sprite.width;
    },
    update: function() {
        this._super(), this.behaviour.update(), this.velocity.x > -this.vel ? this.velocity.x -= this.acceleration : this.velocity.x = -this.vel;
    },
    collide: function(arrayCollide) {
        this.parent && this.parent.textAcc && this.parent.textAcc.setText("COLIDIU"), this.collidable && "bullet" === arrayCollide[0].type && this.preKill();
    },
    preKill: function() {
        this.kill = !0;
    }
}), Bullet = Entity.extend({
    init: function(vel, timeLive, power, bulletSource) {
        this._super(!0), this.updateable = !1, this.deading = !1, this.range = 80, this.width = 1, 
        this.height = 1, this.type = "bullet", this.target = "enemy", this.fireType = "physical", 
        this.node = null, this.velocity.x = vel.x, this.velocity.y = vel.y, this.timeLive = timeLive, 
        this.power = power, this.defaultVelocity = 1, console.log(bulletSource), this.imgSource = bulletSource;
    },
    build: function() {
        this.sprite = new PIXI.Sprite.fromFrame(this.imgSource), this.sprite.anchor.x = .5, 
        this.sprite.anchor.y = .5, this.updateable = !0, this.collidable = !0, this.getContent().alpha = 0, 
        TweenLite.to(this.getContent(), .5, {
            alpha: 1
        });
    },
    update: function() {
        this._super(), this.layer.collideChilds(this), this.timeLive--, this.timeLive <= 0 && this.preKill(), 
        this.range = this.width;
    },
    collide: function(arrayCollide) {
        console.log("fireCollide", arrayCollide[0]), this.collidable && "bird" === arrayCollide[0].type && (console.log(arrayCollide[0].type), 
        this.preKill(), arrayCollide[0].hurt(this.power));
    },
    preKill: function() {
        if (this.collidable) {
            var self = this;
            this.updateable = !0, this.collidable = !1, this.fall = !0, this.velocity = {
                x: 0,
                y: 0
            }, TweenLite.to(this.getContent(), .3, {
                alpha: 0,
                onComplete: function() {
                    self.kill = !0;
                }
            });
        }
    },
    pointDistance: function(x, y, x0, y0) {
        return Math.sqrt((x -= x0) * x + (y -= y0) * y);
    },
    touch: function(collection) {
        collection.object && "environment" === collection.object.type && collection.object.fireCollide(), 
        this.preKill();
    }
}), Cupcake = SpritesheetEntity.extend({
    init: function() {
        this._super(!0);
    },
    build: function() {
        var self = this, motionIdle = new SpritesheetAnimation();
        motionIdle.build("idle", this.getFramesByRange("cupcake10", 0, 13), 1, !0, null);
        var motionRun = new SpritesheetAnimation();
        motionRun.build("run", this.getFramesByRange("cupcake10", 14, 37), 0, !0, null);
        var motionPounch = new SpritesheetAnimation();
        motionPounch.build("pounch", this.getFramesByRange("cupcake10", 38, 59), -1, !1, function() {
            self.spritesheet.play("idle");
        });
        var motionThrow = new SpritesheetAnimation();
        motionThrow.build("throw", this.getFramesByRange("cupcake10", 60, 107), -2, !1, function() {
            self.spritesheet.play("idle");
        });
        var motionHurt = new SpritesheetAnimation();
        motionHurt.build("hurt", this.getFramesByRange("cupcake10", 108, 123), -2, !1, function() {
            self.spritesheet.play("idle");
        }), this.spritesheet = new Spritesheet(), this.spritesheet.addAnimation(motionIdle), 
        this.spritesheet.addAnimation(motionRun), this.spritesheet.addAnimation(motionPounch), 
        this.spritesheet.addAnimation(motionThrow), this.spritesheet.addAnimation(motionHurt), 
        this.spritesheet.play("idle");
    },
    update: function() {
        this._super();
    },
    destroy: function() {
        this._super();
    }
}), Red = SpritesheetEntity.extend({
    init: function(playerModel) {
        this.playerModel = playerModel, this._super(!0);
    },
    build: function(screen) {
        var self = this, motionIdle = new SpritesheetAnimation();
        motionIdle.build("idle", [ this.playerModel.imgSource ], 1, !0, null);
        var motionHurt = new SpritesheetAnimation();
        motionHurt.build("hurt", this.getFramesByRange("piangers0", 2, 2), 1, !1, function() {
            self.spritesheet.play("idle");
        }), this.spritesheet = new Spritesheet(), this.spritesheet.addAnimation(motionIdle), 
        this.spritesheet.play("idle"), this.screen = screen, this.defaultVel = 50 * gameScale, 
        this.upVel = this.playerModel.velocity * gameScale, this.spritesheet.texture.anchor.x = .5, 
        this.spritesheet.texture.anchor.y = .5, this.rotation = 0, this.centerPosition.x = -this.spritesheet.texture.width / 2, 
        this.centerPosition.y = -this.spritesheet.texture.height / 2, this.acceleration = .5, 
        this.side = 0;
    },
    setTarget: function(pos) {
        this.target = pos, pointDistance(0, this.getPosition().y, 0, this.target) < 4 || (this.target < this.getPosition().y ? (1 === this.side && (this.velocity.y /= 2), 
        this.side = -1) : this.target > this.getPosition().y && (-1 === this.side && (this.velocity.y /= 2), 
        this.side = 1));
    },
    update: function() {
        this.gameOver || (this.getPosition().y > windowHeight && this.velocity.y > 0 ? this.velocity.y = 0 : this.getPosition().y < 0 && this.velocity.y < 0 && (this.velocity.y = 0), 
        pointDistance(0, this.getPosition().y, 0, this.target) < 4 ? this.velocity.y = 0 : Math.abs(this.velocity.y) < Math.abs(this.upVel) && (this.velocity.y += this.side * this.acceleration)), 
        this._super(), this.spritesheet.texture.anchor.x = .5, this.spritesheet.texture.anchor.y = .5, 
        this.spritesheet.texture.rotation = this.rotation, this.rotation > 360 && (this.rotation = 0), 
        pointDistance(0, this.getPosition().y, 0, this.target) > 10 ? TweenLite.to(this, .3, {
            rotation: 5 * this.velocity.y * Math.PI / 180
        }) : TweenLite.to(this, .3, {
            rotation: 0
        }), this.layer.collideChilds(this), this.getPosition().x > windowWidth + 50 && this.preKill();
    },
    collide: function(arrayCollide) {
        this.collidable && "bullet" !== arrayCollide[0].type && (this.playerModel.currentEnergy -= arrayCollide[0].demage * this.playerModel.maxEnergy, 
        arrayCollide[0].preKill());
    },
    destroy: function() {
        this._super();
    }
}), BirdBehaviourDefault = Class.extend({
    init: function(entity, props) {
        this.entity = entity, this.props = props, this.sin = 0;
    },
    update: function() {
        this.entity.velocity.y = Math.sin(this.sin) * this.entity.vel, this.sin += this.props.sinAcc;
    },
    build: function() {},
    destroy: function() {},
    serialize: function() {}
}), AppModel = Class.extend({
    init: function() {
        this.currentPlayerModel = {}, this.playerModels = [ new PlayerModel("piangersN.png", .04, .2, 2, 8, 1, "bulletSmall.png"), new PlayerModel("feter.png", .03, .4, 1.5, 4, 2, "bullet.png"), new PlayerModel("neto.png", .05, .5, 2, 2, 4, "bullet.png") ], 
        this.setModel(0);
    },
    setModel: function(id) {
        this.currentID = id, this.currentPlayerModel = this.playerModels[id];
    },
    build: function() {},
    destroy: function() {},
    serialize: function() {}
}), BirdModel = Class.extend({
    init: function(source, target, hp, demage, vel, timeLive) {
        this.imgSource = source ? source : "belga.png", this.demage = demage, this.vel = vel, 
        this.hp = hp, this.target = target, this.timeLive = timeLive;
    },
    serialize: function() {}
}), PlayerModel = Class.extend({
    init: function(source, ecoast, bcoast, vel, bvel, bforce, bullet) {
        this.range = 40, this.maxEnergy = 100, this.maxBulletEnergy = 100, this.currentEnergy = 100, 
        this.currentBulletEnergy = 100, this.recoverBulletEnergy = .5, this.chargeBullet = 2, 
        this.currentBulletForce = 100, this.recoverEnergy = .5, this.imgSource = source ? source : "piangersN.png", 
        this.bulletSource = bullet ? bullet : "bullet.png", this.energyCoast = ecoast ? ecoast : .002, 
        this.bulletCoast = bcoast ? bcoast : .2, this.velocity = vel ? vel : 2, this.bulletVel = bvel ? bvel : 8, 
        this.bulletForce = bforce ? bforce : 1;
    },
    reset: function() {
        this.currentEnergy = this.maxEnergy, this.currentBulletEnergy = this.maxBulletEnergy;
    },
    build: function() {},
    destroy: function() {},
    serialize: function() {}
}), ChoicePlayerScreen = AbstractScreen.extend({
    init: function(label) {
        this._super(label);
    },
    destroy: function() {
        this._super();
    },
    build: function() {
        this._super();
        var assetsToLoader = [];
        assetsToLoader.length > 0 ? (this.loader = new PIXI.AssetLoader(assetsToLoader), 
        this.initLoad()) : this.onAssetsLoaded();
    },
    onProgress: function() {
        this._super();
    },
    onAssetsLoaded: function() {
        this.initApplication();
    },
    initApplication: function() {
        var self = this;
        this.char1 = new DefaultButton("dist/img/UI/simpleButtonUp.png", "dist/img/UI/simpleButtonOver.png"), 
        this.char1.build(300, 70), this.char1.setPosition(windowWidth / 2 - this.char1.width / 2, windowHeight / 2), 
        this.addChild(this.char1), this.currentID = APP.getGameModel().currentID, this.char1.addLabel(new PIXI.Text("Piangers", {
            align: "center",
            font: "40px Arial",
            wordWrap: !0,
            wordWrapWidth: 300
        }), 20, 15), this.char1.clickCallback = function() {
            0 !== self.currentID && (APP.getGameModel().setModel(0), self.updatePlayers());
        }, this.char2 = new DefaultButton("dist/img/UI/simpleButtonUp.png", "dist/img/UI/simpleButtonOver.png"), 
        this.char2.build(300, 70), this.char2.setPosition(windowWidth / 2 - this.char2.width / 2, windowHeight / 2 + 90), 
        this.addChild(this.char2), this.char2.addLabel(new PIXI.Text("Feter", {
            align: "center",
            font: "40px Arial",
            wordWrap: !0,
            wordWrapWidth: 300
        }), 15, 15), this.char2.clickCallback = function() {
            1 !== self.currentID && (APP.getGameModel().setModel(1), self.updatePlayers());
        }, this.char3 = new DefaultButton("dist/img/UI/simpleButtonUp.png", "dist/img/UI/simpleButtonOver.png"), 
        this.char3.build(300, 70), this.char3.setPosition(windowWidth / 2 - this.char3.width / 2, windowHeight / 2 + 180), 
        this.addChild(this.char3), this.char3.addLabel(new PIXI.Text("Neto", {
            align: "center",
            font: "40px Arial",
            wordWrap: !0,
            wordWrapWidth: 300
        }), 15, 15), this.char3.clickCallback = function() {
            2 !== self.currentID && (APP.getGameModel().setModel(2), self.updatePlayers());
        }, this.play = new DefaultButton("dist/img/UI/simpleButtonUp.png", "dist/img/UI/simpleButtonOver.png"), 
        this.play.build(120, 70), this.play.setPosition(.95 * windowWidth - this.play.width, windowHeight / 2 + 120), 
        this.addChild(this.play), this.play.addLabel(new PIXI.Text("PLAY", {
            align: "center",
            font: "35px Arial",
            wordWrap: !0,
            wordWrapWidth: 300
        }), 15, 15), this.play.clickCallback = function() {
            self.screenManager.change("Game");
        }, this.returnButton = new DefaultButton("dist/img/UI/simpleButtonUp.png", "dist/img/UI/simpleButtonOver.png"), 
        this.returnButton.build(60, 80), this.returnButton.setPosition(.05 * windowWidth, .95 * windowHeight - 65), 
        this.addChild(this.returnButton), this.returnButton.addLabel(new PIXI.Text("<", {
            font: "70px Arial"
        }), 5, 5), this.returnButton.clickCallback = function() {
            self.screenManager.change("Wait");
        }, this.updatePlayers();
    },
    updatePlayers: function() {
        this.currentID = APP.getGameModel().currentID, this.playerImg && this.playerImg.getContent().parent && (console.log("REMOVEAsset"), 
        this.playerImg.getContent().parent.removeChild(this.playerImg.getContent()), this.removeChild(this.playerImg)), 
        this.playerImg = new SimpleSprite(APP.getGameModel().currentPlayerModel.imgSource), 
        this.playerImg.container.anchor.x = .5, this.playerImg.container.anchor.y = .5, 
        this.addChild(this.playerImg), this.playerImg.setPosition(windowWidth / 2, 250 - this.playerImg.container.height / 2), 
        TweenLite.from(this.playerImg.getContent().position, .5, {
            y: 250 - this.playerImg.container.height / 2 - 50
        }), TweenLite.from(this.playerImg.getContent(), .5, {
            alpha: 0
        });
    }
}), EndGameScreen = AbstractScreen.extend({
    init: function(label) {
        this._super(label);
    },
    destroy: function() {
        this._super();
    },
    build: function() {
        this._super();
        var assetsToLoader = [];
        assetsToLoader.length > 0 ? (this.loader = new PIXI.AssetLoader(assetsToLoader), 
        this.initLoad()) : this.onAssetsLoaded();
    },
    onProgress: function() {
        this._super();
    },
    onAssetsLoaded: function() {
        this.initApplication();
    },
    initApplication: function() {
        var self = this;
        this.btnBenchmark = new DefaultButton("dist/img/UI/simpleButtonUp.png", "dist/img/UI/simpleButtonOver.png"), 
        this.btnBenchmark.build(300, 120), this.btnBenchmark.setPosition(windowWidth / 2 - this.btnBenchmark.width / 2, windowHeight / 2), 
        this.addChild(this.btnBenchmark), this.btnBenchmark.addLabel(new PIXI.Text("REINIT", {
            font: "50px Arial"
        }), 25, 15), this.btnBenchmark.clickCallback = function() {
            self.screenManager.change("Choice");
        };
    }
}), GameScreen = AbstractScreen.extend({
    init: function(label) {
        this._super(label);
    },
    destroy: function() {
        this.initApp = !1, console.log("DESTROY"), this._super();
    },
    build: function() {
        console.log(this.gameOver), this.particleAccum = 50, this.gameOver = !1, this._super(), 
        this.textAcc = new PIXI.Text("", {
            font: "15px Arial"
        }), this.addChild(this.textAcc), this.textAcc.position.y = 20, this.textAcc.position.x = windowWidth - 150;
        var assetsToLoader = [ "dist/img/atlas/atlas.json" ];
        assetsToLoader.length > 0 ? (this.loader = new PIXI.AssetLoader(assetsToLoader), 
        this.textAcc.setText(this.textAcc.text + "\ninitLoad"), this.initLoad()) : this.onAssetsLoaded(), 
        this.accelerometer = {}, this.hitTouch = new PIXI.Graphics(), this.hitTouch.interactive = !0, 
        this.hitTouch.beginFill(0), this.hitTouch.drawRect(0, 0, windowWidth, windowHeight), 
        this.addChild(this.hitTouch), this.hitTouch.alpha = 0, this.hitTouch.hitArea = new PIXI.Rectangle(0, 0, .7 * windowWidth, windowHeight), 
        this.hitTouchAttack = new PIXI.Graphics(), this.hitTouchAttack.interactive = !0, 
        this.hitTouchAttack.beginFill(0), this.hitTouchAttack.drawRect(0, 0, windowWidth, windowHeight), 
        this.addChild(this.hitTouchAttack), this.hitTouchAttack.alpha = 0, this.hitTouchAttack.hitArea = new PIXI.Rectangle(.3 * windowWidth, 0, windowWidth, windowHeight);
        var self = this;
        this.hitTouchAttack.mousedown = this.hitTouchAttack.touchstart = function() {
            self.gameOver || self.playerModel.currentBulletEnergy < self.playerModel.maxBulletEnergy * self.playerModel.bulletCoast || (self.touchstart = !0, 
            self.onBulletTouch = !0);
        }, this.hitTouchAttack.mouseup = this.hitTouchAttack.touchend = function() {
            if (self.touchstart && !self.gameOver) {
                self.touchstart = !1, self.onBulletTouch = !1;
                var percent = self.playerModel.currentBulletForce / self.playerModel.maxBulletEnergy, fireForce = percent * self.playerModel.range, timeLive = self.red.getContent().width / self.playerModel.bulletVel + fireForce, vel = self.playerModel.bulletVel + self.playerModel.bulletVel * percent, angle = self.red.rotation, bullet = new Bullet({
                    x: Math.cos(angle) * vel,
                    y: Math.sin(angle) * vel
                }, timeLive, self.playerModel.bulletForce, self.playerModel.bulletSource);
                bullet.build(), bullet.setPosition(.8 * self.red.getPosition().x, .8 * self.red.getPosition().y), 
                self.layer.addChild(bullet);
                {
                    scaleConverter(self.red.getContent().height, bullet.getContent().height, .8 * gameScale);
                }
                self.playerModel.currentBulletEnergy -= self.playerModel.maxBulletEnergy * self.playerModel.bulletCoast, 
                self.playerModel.currentBulletEnergy < 0 && (self.playerModel.currentBulletEnergy = 0);
            }
        }, this.hitTouch.touchstart = function(touchData) {
            self.gameOver || self.red && self.red.setTarget(touchData.global.y);
        }, this.hitTouch.touchend = function() {
            self.gameOver;
        }, this.hitTouch.touchmove = function(touchData) {
            self.gameOver || self.red && self.red.setTarget(touchData.global.y);
        }, this.textAcc.setText(this.textAcc.text + "\nbuild"), this.spawner = 50;
    },
    onProgress: function() {
        this.textAcc.setText(this.textAcc.text + "\nonProgress"), this._super();
    },
    onAssetsLoaded: function() {
        this.textAcc.setText(this.textAcc.text + "\nAssetsLoaded"), this.initApplication();
    },
    update: function() {
        if (this._super(), this.playerModel && this.initApp) {
            if (this.playerModel && this.onBulletTouch && this.playerModel.currentBulletEnergy > 0, 
            this.playerModel && this.playerModel.currentBulletEnergy <= this.playerModel.maxBulletEnergy - this.playerModel.recoverBulletEnergy && (this.playerModel.currentBulletEnergy += this.playerModel.recoverBulletEnergy), 
            this.playerModel && this.playerModel.currentEnergy > 1.1 * this.playerModel.energyCoast ? this.playerModel.currentEnergy -= this.playerModel.energyCoast : this.gameOver = !0, 
            this.gameOver && (this.red.gameOver = !0, this.red.velocity.y += .05, this.red.getPosition().y > windowHeight + this.red.getContent().height && (console.log("GAME OVER"), 
            this.screenManager.change("EndGame"))), this.bulletBar && this.bulletBar.updateBar(this.playerModel.currentBulletEnergy, this.playerModel.maxBulletEnergy), 
            this.energyBar && this.energyBar.updateBar(this.playerModel.currentEnergy, this.playerModel.maxEnergy), 
            this.spawner <= 0) {
                var birdModel = (Math.atan2(windowHeight / 2 - (this.red.getPosition().y + this.red.centerPosition.y), windowWidth - this.red.getPosition().x + this.red.centerPosition.x), 
                new BirdModel("belga.png", this.red, 4, .1, 3, 110)), bird = new Bird(birdModel);
                bird.build(new BirdBehaviourDefault(bird, {
                    sinAcc: .1
                })), this.layer.addChild(bird), bird.setPosition(windowWidth, windowHeight / 2), 
                this.spawner = 250;
            } else this.spawner--;
            this.updateParticles();
        }
    },
    updateParticles: function() {
        if (this.particleAccum < 0) {
            this.particleAccum = this.playerModel.currentEnergy / this.playerModel.maxEnergy * 50 + 8;
            var particle = new Particles({
                x: -.9,
                y: -(.2 * Math.random() + .7)
            }, 110, "smoke.png", -.02 * Math.random() + .01);
            particle.build(), particle.alphadecress = .01, particle.setPosition(this.red.getPosition().x - this.red.getContent().width + 5, this.red.getPosition().y - this.red.getContent().height / 2 + 25), 
            this.addChild(particle);
        } else this.particleAccum--;
    },
    initApplication: function() {
        console.log("INIT APLICATION"), this.initApp = !0;
        var environment = new Environment(windowWidth, windowHeight);
        environment.build([ "env1.png", "env2.png", "env3.png", "env4.png" ]), environment.velocity.x = -1, 
        this.addChild(environment), this.layerManager = new LayerManager(), this.layerManager.build("Main"), 
        this.addChild(this.layerManager), this.layer = new Layer(), this.layer.build("EntityLayer"), 
        this.layerManager.addLayer(this.layer), this.playerModel = APP.getGameModel().currentPlayerModel, 
        this.playerModel.reset(), this.red = new Red(this.playerModel), this.red.build(this), 
        this.layer.addChild(this.red), this.red.rotation = -1, this.red.setPosition(.1 * windowWidth - this.red.getContent().width, 1.2 * windowHeight), 
        this.gameOver = !1;
        var scale = scaleConverter(this.red.getContent().width, windowHeight, .25);
        TweenLite.to(this.red.spritesheet.position, 1, {
            x: .15 * windowWidth + this.red.getContent().width / 2,
            y: windowHeight / 2
        }), this.red.setScale(scale, scale);
        var self = this, posHelper = .05 * windowHeight;
        this.bulletBar = new BarView(.1 * windowWidth, 10, 1, 1), this.addChild(this.bulletBar), 
        this.bulletBar.setPosition(250 + posHelper, posHelper), this.energyBar = new BarView(.1 * windowWidth, 10, 1, 1), 
        this.addChild(this.energyBar), this.energyBar.setPosition(250 + 2 * posHelper + this.bulletBar.width, posHelper), 
        this.returnButton = new DefaultButton("dist/img/UI/simpleButtonUp.png", "dist/img/UI/simpleButtonOver.png"), 
        this.returnButton.build(60, 50), this.returnButton.setPosition(.95 * windowWidth - 20, .95 * windowHeight - 65), 
        this.addChild(this.returnButton), this.returnButton.addLabel(new PIXI.Text("<", {
            font: "40px Arial"
        }), 5, 5), this.returnButton.clickCallback = function() {
            self.screenManager.prevScreen();
        }, this.initBench = !1, this.textAcc.setText(this.textAcc.text + "\nendinitApplication");
    },
    benchmark: function() {
        function addEntity() {
            var red = new Red();
            red.build(), red.setPosition(-90, windowHeight * Math.random()), self.addChild(red), 
            red.velocity.x = 1, self.accBench++, self.accBench > 300 && (self.initBench = !1, 
            clearInterval(self.benchInterval));
        }
        if (!this.initBench) {
            var self = this;
            this.initBench = !0, this.accBench = 0, this.benchInterval = setInterval(addEntity, 50);
        }
    }
}), WaitScreen = AbstractScreen.extend({
    init: function(label) {
        this._super(label);
    },
    destroy: function() {
        this._super();
    },
    build: function() {
        this._super();
        var assetsToLoader = [ "dist/img/ease.png", "dist/img/atlas/atlas.json", "dist/img/UI/simpleButtonOver.png", "dist/img/UI/simpleButtonUp.png" ];
        assetsToLoader.length > 0 ? (this.loader = new PIXI.AssetLoader(assetsToLoader), 
        this.initLoad()) : this.onAssetsLoaded();
    },
    onProgress: function() {
        this._super();
    },
    onAssetsLoaded: function() {
        this.initApplication();
    },
    initApplication: function() {
        this.easeImg = new SimpleSprite("dist/img/ease.png"), this.addChild(this.easeImg), 
        this.easeImg.setPosition(windowWidth / 2 - this.easeImg.getContent().width / 2, 50);
        var self = this;
        this.btnBenchmark = new DefaultButton("dist/img/UI/simpleButtonUp.png", "dist/img/UI/simpleButtonOver.png"), 
        this.btnBenchmark.build(300, 100), this.btnBenchmark.setPosition(windowWidth / 2 - this.btnBenchmark.width / 2, windowHeight / 2), 
        this.addChild(this.btnBenchmark), this.btnBenchmark.addLabel(new PIXI.Text("Jogar", {
            align: "center",
            font: "60px Arial",
            wordWrap: !0,
            wordWrapWidth: 300
        }), 70, 15), this.btnBenchmark.clickCallback = function() {
            self.screenManager.change("Choice");
        }, possibleFullscreen() && (this.fullScreen = new DefaultButton("dist/img/UI/simpleButtonUp.png", "dist/img/UI/simpleButtonOver.png"), 
        this.fullScreen.build(40, 20), this.fullScreen.setPosition(.95 * windowWidth - 20, .95 * windowHeight - 35), 
        this.addChild(this.fullScreen), this.fullScreen.addLabel(new PIXI.Text("Full", {
            font: "10px Arial"
        }), 5, 5), this.fullScreen.clickCallback = function() {
            fullscreen();
        });
    }
}), FirebaseSocket = SmartSocket.extend({
    init: function(url) {
        this._super(), this.dataRef = new Firebase(url), this.dataRef.limit(1);
    },
    build: function() {
        var self = this;
        this.lastMessagesQuery = this.dataRef.endAt().limit(2), this.lastMessagesQuery.on("child_added", function(snapshot) {
            self.readLast(snapshot.val());
        }, function(errorObject) {
            self.socketError(errorObject);
        }), this.dataRef.on("child_added", function(snapshot) {
            self.readSocketList(snapshot.val());
        }, function(errorObject) {
            self.socketError(errorObject);
        }), this.dataRef.on("value", function(data) {
            self.readObj(data.val());
        }, function(errorObject) {
            self.socketError(errorObject);
        });
    },
    writeObj: function(obj) {
        this._super(obj), this.dataRef.push(obj);
    },
    setObj: function(obj) {
        this._super(obj), this.dataRef.set(obj);
    },
    updateObj: function(obj) {
        this._super(obj), this.dataRef.update(obj);
    },
    destroy: function() {}
}), InputManager = Class.extend({
    init: function(parent) {
        var game = parent, self = this;
        this.vecPositions = [], document.body.addEventListener("mouseup", function() {
            game.player && (game.mouseDown = !1);
        }), document.body.addEventListener("mousedown", function() {
            game.player && APP.getMousePos().x < windowWidth && APP.getMousePos().y < windowHeight - 70 && (game.mouseDown = !0);
        }), document.body.addEventListener("keyup", function(e) {
            if (game.player) {
                if (87 === e.keyCode || 38 === e.keyCode && game.player.velocity.y < 0) self.removePosition("up"); else if (83 === e.keyCode || 40 === e.keyCode && game.player.velocity.y > 0) self.removePosition("down"); else if (65 === e.keyCode || 37 === e.keyCode && game.player.velocity.x < 0) self.removePosition("left"); else if (68 === e.keyCode || 39 === e.keyCode && game.player.velocity.x > 0) self.removePosition("right"); else if (32 === e.keyCode) game.player.hurt(5); else if (49 === e.keyCode || 50 === e.keyCode || 51 === e.keyCode || 52 === e.keyCode || 81 === e.keyCode || 69 === e.keyCode) {
                    var id = 1;
                    50 === e.keyCode ? id = 2 : 51 === e.keyCode ? id = 3 : 52 === e.keyCode && (id = 4), 
                    game.useShortcut(id - 1);
                }
                game.player.updatePlayerVel(self.vecPositions);
            }
        }), document.body.addEventListener("keydown", function(e) {
            game.player && (87 === e.keyCode || 38 === e.keyCode ? (self.removePosition("down"), 
            self.addPosition("up")) : 83 === e.keyCode || 40 === e.keyCode ? (self.removePosition("up"), 
            self.addPosition("down")) : 65 === e.keyCode || 37 === e.keyCode ? (self.removePosition("right"), 
            self.addPosition("left")) : (68 === e.keyCode || 39 === e.keyCode) && (self.removePosition("left"), 
            self.addPosition("right")), game.player.updatePlayerVel(self.vecPositions));
        });
    },
    removePosition: function(position) {
        for (var i = this.vecPositions.length - 1; i >= 0; i--) this.vecPositions[i] === position && this.vecPositions.splice(i, 1);
    },
    addPosition: function(position) {
        for (var exists = !1, i = this.vecPositions.length - 1; i >= 0; i--) this.vecPositions[i] === position && (exists = !0);
        exists || this.vecPositions.push(position);
    }
}), Environment = Class.extend({
    init: function(maxWidth, maxHeight) {
        this.velocity = {
            x: 0,
            y: 0
        }, this.texture = "", this.sprite = "", this.container = new PIXI.DisplayObjectContainer(), 
        this.updateable = !0, this.arraySprt = [], this.maxWidth = maxWidth, this.maxHeight = maxHeight, 
        this.texWidth = 0, this.spacing = 0, this.totTiles = 0, this.currentSprId = 0;
    },
    build: function(imgs, spacing) {
        this.arraySprt = imgs, spacing && (this.spacing = spacing);
        for (var i = 0; i < this.arraySprt.length && !(this.container.width > this.maxWidth); i++) this.currentSprId = i, 
        this.addEnv();
    },
    addEnv: function() {
        this.sprite = new PIXI.Sprite(PIXI.Texture.fromFrame(this.arraySprt[this.currentSprId]));
        var last = this.container.children[this.container.children.length - 1];
        last && (this.sprite.position.x = last.position.x + last.width - 2), this.sprite.position.y = this.maxHeight - this.sprite.height, 
        this.container.addChild(this.sprite);
    },
    update: function() {
        if (!this.container.children) return void console.log(this.container);
        for (var i = this.container.children.length - 1; i >= 0; i--) this.container.children[i].position.x + this.container.children[i].width < 0 && this.container.removeChild(this.container.children[i]), 
        this.container.children[i].position.x += this.velocity.x;
        var last = this.container.children[this.container.children.length - 1];
        last.position.x + last.width - 20 < this.maxWidth && (this.currentSprId++, this.currentSprId >= this.arraySprt.length && (this.currentSprId = 0), 
        this.addEnv());
    },
    getContent: function() {
        return this.container;
    }
}), Paralax = Class.extend({
    init: function(maxWidth) {
        this.velocity = {
            x: 0,
            y: 0
        }, this.texture = "", this.sprite = "", this.container = new PIXI.DisplayObjectContainer(), 
        this.updateable = !0, this.arraySprt = [], this.maxWidth = maxWidth, this.texWidth = 0, 
        this.spacing = 0, this.totTiles = 0;
    },
    build: function(img, spacing) {
        spacing && (this.spacing = spacing), this.texture = PIXI.Texture.fromFrame(img), 
        this.texWidth = this.texture.width, this.totTiles = Math.ceil(this.maxWidth / this.texWidth) + 1;
        for (var i = 0; i < this.totTiles; i++) this.sprite = new PIXI.Sprite(this.texture), 
        this.sprite.position.x = (this.texWidth + this.spacing) * i, this.container.addChild(this.sprite);
        console.log("this");
    },
    update: function() {
        Math.abs(this.container.position.x + this.velocity.x) >= this.texWidth + this.totTiles * this.spacing ? this.container.position.x = 0 : this.container.position.x += this.velocity.x, 
        this.container.position.y += this.velocity.y;
    },
    getContent: function() {
        return this.container;
    }
}), Particles = Entity.extend({
    init: function(vel, timeLive, label, rotation) {
        this._super(!0), this.updateable = !1, this.deading = !1, this.range = 40, this.width = 1, 
        this.height = 1, this.type = "fire", this.target = "enemy", this.fireType = "physical", 
        this.node = null, this.velocity.x = vel.x, this.velocity.y = vel.y, this.timeLive = timeLive, 
        this.power = 1, this.defaultVelocity = 1, this.imgSource = label, this.alphadecress = .03, 
        this.scaledecress = .03, this.gravity = 0, rotation && (this.rotation = rotation);
    },
    build: function() {
        this.updateable = !0, this.sprite = new PIXI.Sprite.fromFrame(this.imgSource), this.sprite.anchor.x = .5, 
        this.sprite.anchor.y = .5, this.sprite.alpha = 1, this.sprite.scale.x = .2, this.sprite.scale.y = .2, 
        this.getContent().rotation = this.rotation;
    },
    update: function() {
        this._super(), 0 !== this.gravity && (this.velocity.y += this.gravity), this.timeLive--, 
        this.timeLive <= 0 && this.preKill(), this.range = this.width, this.rotation && (this.getContent().rotation += this.rotation), 
        this.sprite.alpha > 0 && (this.sprite.alpha -= this.alphadecress, this.sprite.alpha <= 0 && this.preKill()), 
        this.sprite.scale.x >= 1 || (this.sprite.scale.x += this.scaledecress, this.sprite.scale.y += this.scaledecress);
    },
    preKill: function() {
        this.sprite.alpha = 0, this.updateable = !0, this.kill = !0;
    }
}), meter = new FPSMeter(), resizeProportional = !0, windowWidth = 820, windowHeight = 600, realWindowWidth = 820, realWindowHeight = 600, gameScale = 1.8;

testMobile() && (windowWidth = window.innerWidth * gameScale, windowHeight = window.innerHeight * gameScale, 
realWindowWidth = windowWidth, realWindowHeight = windowHeight);

var windowWidthVar = window.innerWidth, windowHeightVar = window.innerHeight, renderer = PIXI.autoDetectRenderer(realWindowWidth, realWindowHeight, null, !1, !0);

document.body.appendChild(renderer.view), renderer.view.style.width = windowWidth + "px", 
renderer.view.style.height = windowHeight + "px";

var APP;

APP = new Application(), APP.build(), APP.show();

var ratio = 1, initialize = function() {
    PIXI.BaseTexture.SCALE_MODE = PIXI.scaleModes.NEAREST, requestAnimFrame(update);
};

!function() {
    var App = {
        init: function() {
            initialize();
        }
    };
    App.init();
}();