/*! jefframos 05-02-2015 */
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

function shuffle(array) {
    for (var temp, index, counter = array.length; counter > 0; ) index = Math.floor(Math.random() * counter), 
    counter--, temp = array[counter], array[counter] = array[index], array[index] = temp;
    return array;
}

function testMobile() {
    return Modernizr.touch;
}

function update() {
    requestAnimFrame(update);
    var tempRation = window.innerHeight / windowHeight, ratioRez = resizeProportional ? tempRation < window.innerWidth / realWindowWidth ? tempRation : window.innerWidth / realWindowWidth : 1;
    windowWidthVar = realWindowWidth * ratioRez * ratio, windowHeightVar = realWindowHeight * ratioRez * ratio, 
    windowWidthVar > realWindowWidth && (windowWidthVar = realWindowWidth), windowHeightVar > realWindowHeight && (windowHeightVar = realWindowHeight), 
    renderer.view.style.width = windowWidthVar + "px", renderer.view.style.height = windowHeightVar + "px", 
    APP.update(), renderer.render(APP.stage);
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
        }), this.stage.addChild(this.objCounter), this.objCounter.position.y = windowHeight - 40, 
        this.objCounter.position.x = 20, this.labelDebug = new PIXI.Text("Debug", {
            font: "15px Arial"
        }), this.stage.addChild(this.labelDebug), this.labelDebug.position.y = windowHeight - 20, 
        this.labelDebug.position.x = 20;
    },
    update: function() {
        this._super(), this.screenManager && this.screenManager.currentScreen && (this.childsCounter = 1, 
        this.recursiveCounter(this.screenManager.currentScreen), this.objCounter.setText(this.childsCounter));
    },
    recursiveCounter: function(obj) {
        var j = 0;
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
    updatePoints: function(value) {
        this.gameScreen.updatePoints(value);
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
    addBackShape: function(color, size) {
        this.back = new PIXI.Graphics(), this.back.beginFill(color), this.back.drawRect(-size / 2, -size / 2, this.width + size, this.height + size), 
        this.container.addChildAt(this.back, 0);
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
}), ChoiceButton = DefaultButton.extend({
    init: function(imgUp, imgOver, imgDown) {
        this._super(imgUp, imgOver, imgDown), this.color = 16777215, this.background = new PIXI.Sprite(PIXI.Texture.fromImage(imgDown));
    },
    build: function(width, height) {
        var self = this;
        this.width = width ? width : this.shapeButton.width, this.height = height ? height : this.shapeButton.height, 
        this.background.width = this.width, this.background.height = this.height, this.shapeButton.buttonMode = !0, 
        this.shapeButton.position.x = 0, this.shapeButton.position.y = 0, width && (this.shapeButton.width = this.width), 
        height && (this.shapeButton.height = this.height), this.shapeButton.interactive = !0, 
        this.shapeButton.mousedown = this.shapeButton.touchstart = function() {
            self.selectedFunction();
        }, this.shapeButton.mouseup = this.shapeButton.touchend = this.shapeButton.touchoutside = this.shapeButton.mouseuoutside = this.shapeButton.touchendoutside = function() {
            this.isdown = !1, null !== self.mouseUpCallback && (self.mouseUpCallback(), console.log("mouseUpCallback"));
        }, this.shapeButton.mouseover = function() {
            self.isOver = !0, self.shapeButton.setTexture(self.textureButtonOver);
        }, this.shapeButton.mouseout = function() {
            self.isOver = !1, self.shapeButton.setTexture(self.textureButton), self.mouseUpCallback();
        }, this.shapeButton.click = function() {
            null !== self.clickCallback && self.clickCallback();
        }, this.shapeButton.tap = function() {
            null !== self.clickCallback && self.clickCallback();
        };
    },
    selectedFunction: function() {
        null !== this.mouseDownCallback && this.mouseDownCallback(), this.shapeButton.tint = this.color, 
        this.thumb.visible = !0, this.thumbGray.visible = !1, this.shapeButton.setTexture(this.textureButtonOver), 
        this.container.addChildAt(this.background, 0), this.isdown = !0, this.alpha = 1;
    },
    addThumb: function(thumb, thumbGray) {
        this.thumb && this.thumb.parent && this.thumb.parent.removeChild(this.thumb), this.thumbGray && this.thumbGray.parent && this.thumbGray.parent.removeChild(this.thumbGray), 
        this.thumb = new PIXI.Sprite(PIXI.Texture.fromImage(thumb));
        var scale = scaleConverter(this.thumb.width, this.width, .8);
        this.thumb.scale.x = this.thumb.scale.y = scale, this.container.addChild(this.thumb), 
        this.thumb.position.x = this.width / 2 - this.thumb.width / 2, this.thumb.position.y = this.height - this.thumb.height - 8, 
        this.thumb.visible = !1, this.thumbGray = new PIXI.Sprite(PIXI.Texture.fromImage(thumbGray));
        var scaleGrey = scaleConverter(this.thumbGray.width, this.width, .8);
        this.thumbGray.scale.x = this.thumbGray.scale.y = scaleGrey, this.container.addChild(this.thumbGray), 
        this.thumbGray.position.x = this.width / 2 - this.thumbGray.width / 2, this.thumbGray.position.y = this.height - this.thumbGray.height - 8, 
        this.thumbGray.visible = !0;
    },
    resetTextures: function() {
        this.thumb.visible = !1, this.thumbGray.visible = !0, this.shapeButton.setTexture(this.textureButton), 
        this.shapeButton.tint = 16777215, this.background && this.background.parent && this.background.parent.removeChild(this.background);
    }
}), Bird = Entity.extend({
    init: function(birdModel) {
        this._super(!0), this.updateable = !1, this.deading = !1, this.range = 80, this.width = 1, 
        this.height = 1, this.type = "bird", this.target = "enemy", this.fireType = "physical", 
        this.birdModel = birdModel, this.vel = birdModel.vel, this.velocity.x = -this.vel, 
        this.velocity.y = 0, this.demage = this.birdModel.demage, this.hp = this.birdModel.hp, 
        this.defaultVelocity = this.birdModel.vel, this.imgSource = this.birdModel.imgSource, 
        this.behaviour = this.birdModel.behaviour.clone(), this.acceleration = .1;
    },
    hurt: function(demage) {
        this.hp -= demage, this.velocity.x = -Math.abs(.4 * this.vel), this.hp <= 0 && (APP.updatePoints(5), 
        this.preKill()), this.getContent().tint = 16711680;
    },
    build: function() {
        this.sprite = new PIXI.Sprite.fromFrame(this.imgSource), this.sprite.anchor.x = .5, 
        this.sprite.anchor.y = .5, this.updateable = !0, this.collidable = !0, this.range = this.sprite.width;
    },
    update: function() {
        this._super(), this.behaviour.update(this), Math.abs(this.velocity.x) < Math.abs(this.vel) ? this.velocity.x -= this.acceleration : this.velocity.x = -Math.abs(this.vel), 
        this.range = .7 * this.sprite.height, this.collideArea || 16711680 === this.getContent().tint && (this.getContent().tint = 16777215);
    },
    preKill: function() {
        for (var i = 2; i >= 0; i--) {
            var particle = new Particles({
                x: 4 * Math.random() - 2,
                y: -(2 * Math.random() + 1)
            }, 120, "smoke.png", .1 * Math.random());
            particle.build(), particle.gravity = .1 * Math.random(), particle.alphadecres = .08, 
            particle.setPosition(this.getPosition().x - (Math.random() + .1 * this.getContent().width) / 2, this.getPosition().y), 
            this.layer.addChild(particle);
        }
        this.collidable = !1, this.kill = !0;
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
        this._super(), this.layer.collideChilds(this), this.timeLive--, this.timeLive <= 0 && (this.kill = !0), 
        this.range = this.sprite.height, this.collideArea;
    },
    collide: function(arrayCollide) {
        console.log("fireCollide", arrayCollide[0]), this.collidable && "bird" === arrayCollide[0].type && (console.log(arrayCollide[0].type), 
        this.preKill(), arrayCollide[0].hurt(this.power));
    },
    preKill: function() {
        for (var i = 2; i >= 0; i--) {
            var particle = new Particles({
                x: 4 * Math.random() - 2,
                y: -(2 * Math.random() + 1)
            }, 120, "bulletParticle.png", .1 * Math.random());
            particle.build(), particle.gravity = .1 * Math.random() + .2, particle.alphadecres = .08, 
            particle.setPosition(this.getPosition().x - (Math.random() + .1 * this.getContent().width) / 2, this.getPosition().y), 
            this.layer.addChild(particle);
        }
        this.collidable = !1, this.kill = !0;
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
}), Item = Entity.extend({
    init: function() {
        this._super(!0), this.updateable = !1, this.deading = !1, this.range = 80, this.width = 1, 
        this.height = 1, this.type = "item", this.vel = 2, this.velocity.x = -this.vel, 
        this.imgSource = "gasoline.png";
    },
    build: function() {
        this.sprite = new PIXI.Sprite.fromFrame(this.imgSource), this.sprite.anchor.x = .5, 
        this.sprite.anchor.y = .5, this.updateable = !0, this.collidable = !0, this.range = this.sprite.width;
    },
    update: function() {
        this._super(), Math.abs(this.velocity.x) < Math.abs(this.vel) ? this.velocity.x -= this.acceleration : this.velocity.x = -Math.abs(this.vel), 
        this.range = .7 * this.sprite.height, this.collideArea;
    },
    preKill: function() {
        for (var i = 4; i >= 0; i--) {
            var particle = new Particles({
                x: 4 * Math.random() - 2,
                y: -(2 * Math.random() + 1)
            }, 120, "smoke.png", .1 * Math.random());
            particle.build(), particle.gravity = .1 * Math.random(), particle.alphadecres = .08, 
            particle.setPosition(this.getPosition().x - (Math.random() + .1 * this.getContent().width) / 2, this.getPosition().y), 
            this.layer.addChild(particle);
        }
        this.collidable = !1, this.kill = !0;
    }
}), Red = SpritesheetEntity.extend({
    init: function(playerModel) {
        this.playerModel = playerModel, this._super(!0);
    },
    build: function(screen) {
        var self = this, motionIdle = new SpritesheetAnimation();
        motionIdle.build("idle", [ this.playerModel.imgSourceGame ], 1, !0, null);
        var motionHurt = new SpritesheetAnimation();
        motionHurt.build("hurt", this.getFramesByRange("piangers0", 2, 2), 1, !1, function() {
            self.spritesheet.play("idle");
        }), this.spritesheet = new Spritesheet(), this.spritesheet.addAnimation(motionIdle), 
        this.spritesheet.play("idle"), this.screen = screen, this.defaultVel = 50 * gameScale, 
        this.upVel = this.playerModel.velocity * gameScale, this.spritesheet.texture.anchor.x = .5, 
        this.spritesheet.texture.anchor.y = .5, this.rotation = 0, this.centerPosition.x = -this.spritesheet.texture.width / 2, 
        this.centerPosition.y = -this.spritesheet.texture.height / 2, this.acceleration = .5, 
        this.side = 0, this.particleAccum = 50;
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
        }), this.range = .8 * this.getContent().height, this.layer.collideChilds(this), 
        this.getPosition().x > windowWidth + 50 && this.preKill();
    },
    collide: function(arrayCollide) {
        if (this.collidable && "bullet" !== arrayCollide[0].type) {
            if ("item" === arrayCollide[0].type) this.playerModel.currentEnergy = this.playerModel.maxEnergy; else {
                var demage = arrayCollide[0].demage * this.playerModel.maxEnergy;
                isNaN(demage) || (this.playerModel.currentEnergy -= demage);
            }
            arrayCollide[0].preKill();
        }
    },
    destroy: function() {
        this._super();
    }
}), BirdBehaviourDefault = Class.extend({
    init: function(props) {
        this.props = props, this.position = {
            x: windowWidth,
            y: .1 * windowHeight + .8 * windowHeight * Math.random()
        };
    },
    clone: function() {
        return new BirdBehaviourDefault(this.props);
    },
    update: function() {},
    build: function() {},
    destroy: function() {},
    serialize: function() {}
}), BirdBehaviourDiag = Class.extend({
    init: function(props) {
        this.props = props, this.position = {
            x: .7 * windowWidth + .3 * windowWidth * Math.random(),
            y: windowHeight
        }, this.acc = 0;
    },
    clone: function() {
        return this.props.accX = .02 * Math.random() + .005, new BirdBehaviourDiag(this.props);
    },
    update: function(entity) {
        this.acc += this.props.accX, entity.acceleration = 1, entity.velocity.y = entity.vel + this.acc, 
        entity.velocity.y > 0 && (entity.velocity.y = 0);
    },
    build: function() {},
    destroy: function() {},
    serialize: function() {}
}), BirdBehaviourGuided = Class.extend({
    init: function(props) {
        this.props = props, this.sin = 0, this.position = {
            x: windowWidth,
            y: .1 * windowHeight + .8 * windowHeight * Math.random()
        };
    },
    clone: function() {
        return new BirdBehaviourSinoid(this.props);
    },
    update: function(entity) {
        entity.velocity.y = Math.sin(this.sin) * entity.vel, this.sin += this.props.sinAcc;
    },
    build: function() {},
    destroy: function() {},
    serialize: function() {}
}), BirdBehaviourSinoid = Class.extend({
    init: function(props) {
        this.props = props, this.sin = 0, this.position = {
            x: windowWidth,
            y: windowHeight / 2
        };
    },
    clone: function() {
        return new BirdBehaviourSinoid(this.props);
    },
    update: function(entity) {
        entity.velocity.y = Math.sin(this.sin) * entity.vel, this.sin += this.props.sinAcc;
    },
    build: function() {},
    destroy: function() {},
    serialize: function() {}
}), AppModel = Class.extend({
    init: function() {
        this.currentPlayerModel = {}, this.playerModels = [ new PlayerModel({
            outGame: "piangersN.png",
            inGame: "piangersNGame.png",
            bullet: "bulletSmall.png",
            color: 7654879,
            thumb: "thumb_jeiso",
            coverSource: "dist/img/UI/piangersGrande.png"
        }, {
            energyCoast: 1.5,
            vel: 2.5,
            bulletForce: 1.5,
            bulletCoast: .1,
            bulletVel: 9
        }), new PlayerModel({
            outGame: "feter.png",
            inGame: "feterGame.png",
            bullet: "bulletSmall.png",
            color: 15614755,
            thumb: "thumb_jeiso",
            coverSource: "dist/img/UI/feterGrande.png"
        }, {
            energyCoast: 2,
            vel: 1.5,
            bulletForce: 2.5,
            bulletVel: 6,
            bulletCoast: .1
        }), new PlayerModel({
            outGame: "alcemar.png",
            inGame: "alcemarGame.png",
            bullet: "bulletSmall.png",
            color: 11719780,
            thumb: "thumb_jeiso",
            coverSource: "dist/img/UI/alcemarGrande.png"
        }, {
            energyCoast: 2.5,
            vel: 1,
            bulletForce: 2.5,
            bulletCoast: .1,
            bulletVel: 6
        }), new PlayerModel({
            outGame: "jeso.png",
            inGame: "jesoGame.png",
            bullet: "bulletSmall.png",
            color: 8963136,
            thumb: "thumb_jeiso",
            coverSource: "dist/img/UI/jeisoGrande.png"
        }, {
            energyCoast: 1.5,
            vel: 3,
            bulletForce: .5,
            bulletCoast: .1,
            bulletVel: 8
        }), new PlayerModel({
            outGame: "pi.png",
            inGame: "piGame.png",
            bullet: "bulletSmall.png",
            color: 9399727,
            thumb: "thumb_jeiso",
            coverSource: "dist/img/UI/piGrande.png"
        }, {
            energyCoast: 3,
            vel: 1,
            bulletForce: 1,
            bulletCoast: .1,
            bulletVel: 5
        }), new PlayerModel({
            outGame: "pora.png",
            inGame: "poraGame.png",
            bullet: "bulletSmall.png",
            color: 16633351,
            thumb: "thumb_jeiso",
            coverSource: "dist/img/UI/poraGrande.png"
        }, {
            energyCoast: 2.5,
            vel: 1.5,
            bulletForce: 1,
            bulletCoast: .1,
            bulletVel: 5
        }), new PlayerModel({
            outGame: "arthur.png",
            inGame: "arthurGame.png",
            bullet: "bulletSmall.png",
            color: 11764665,
            thumb: "thumb_jeiso",
            coverSource: "dist/img/UI/arthurGrande.png"
        }, {
            energyCoast: 2,
            vel: 1,
            bulletForce: 2,
            bulletCoast: .1,
            bulletVel: 5
        }), new PlayerModel({
            outGame: "poter.png",
            inGame: "poterGame.png",
            bullet: "bulletSmall.png",
            color: 16428876,
            thumb: "thumb_jeiso",
            coverSource: "dist/img/UI/poterGrande.png"
        }, {
            energyCoast: 1.5,
            vel: 2,
            bulletForce: 1.5,
            bulletCoast: .1,
            bulletVel: 5
        }), new PlayerModel({
            outGame: "neto.png",
            inGame: "netoGame.png",
            bullet: "bulletSmall.png",
            color: 11772272,
            thumb: "thumb_jeiso",
            coverSource: "dist/img/UI/netoGrande.png"
        }, {
            energyCoast: 2.5,
            vel: 2,
            bulletForce: 2,
            bulletCoast: .1,
            bulletVel: 5
        }), new PlayerModel({
            outGame: "rodaika.png",
            inGame: "rodaikaGame.png",
            bullet: "bulletSmall.png",
            color: 15893674,
            thumb: "thumb_jeiso",
            coverSource: "dist/img/UI/rodaikaGrande.png"
        }, {
            energyCoast: 3,
            vel: 2,
            bulletForce: 1,
            bulletCoast: .1,
            bulletVel: 5
        }) ], this.birdModels = [ new BirdModel("belga.png", null, 4, .1, 1.8, new BirdBehaviourSinoid({
            sinAcc: .05
        }), 120, .1), new BirdModel("roxo.png", null, 6, .2, -1.8, new BirdBehaviourDiag({
            accX: .02
        }), 200, .15), new BirdModel("lambecu.png", null, 6, .2, -1.5, new BirdBehaviourDefault(), 150, .1) ], 
        this.setModel(0);
    },
    setModel: function(id) {
        this.currentID = id, this.currentPlayerModel = this.playerModels[id];
    },
    getNewBird: function(player) {
        var id = Math.floor(this.birdModels.length * Math.random());
        this.birdModels[id].target = player;
        var bird = new Bird(this.birdModels[id]);
        return bird;
    },
    build: function() {},
    destroy: function() {},
    serialize: function() {}
}), BirdModel = Class.extend({
    init: function(source, target, hp, demage, vel, behaviour, toNext, sizePercent) {
        this.imgSource = source ? source : "belga.png", this.demage = demage, this.vel = vel, 
        this.hp = hp, this.target = target, this.timeLive = 999, this.toNext = toNext ? toNext : 150, 
        this.behaviour = behaviour, this.sizePercent = sizePercent;
    },
    serialize: function() {}
}), PlayerModel = Class.extend({
    init: function(graphicsObject, statsObject) {
        this.range = 40, this.maxEnergy = 1e4, this.currentEnergy = 1e4, this.maxBulletEnergy = 100, 
        this.currentBulletEnergy = 100, this.recoverBulletEnergy = .5, this.chargeBullet = 2, 
        this.currentBulletForce = 100, this.recoverEnergy = .5, this.thumb = graphicsObject.thumb ? graphicsObject.thumb : "thumb_jeiso", 
        this.thumbColor = this.thumb + "_color.png", this.thumbGray = this.thumb + "_gray.png", 
        this.color = graphicsObject.color ? graphicsObject.color : 8755, this.imgSourceGame = graphicsObject.inGame ? graphicsObject.inGame : "piangersNGame.png", 
        this.imgSource = graphicsObject.outGame ? graphicsObject.outGame : this.imgSourceGame, 
        this.coverSource = graphicsObject.coverSource ? graphicsObject.coverSource : "dist/img/UI/jeisoGrande.png", 
        this.bulletSource = graphicsObject.bullet ? graphicsObject.bullet : "bullet.png", 
        this.energyCoast = statsObject.energyCoast ? statsObject.energyCoast : 1, this.energyCoast = 5.5 - this.energyCoast * this.energyCoast / 2, 
        this.bulletCoast = statsObject.bulletCoast ? statsObject.bulletCoast : .2, this.velocity = statsObject.vel ? statsObject.vel : 2, 
        this.bulletVel = statsObject.bulletVel ? statsObject.bulletVel : 8, this.bulletForce = statsObject.bulletForce ? statsObject.bulletForce : 1;
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
        var self = this, scale = scaleConverter(70, windowHeight, .1);
        console.log(scale);
        var sizeScale = 135 / 640 * windowHeight, spacing = 5 / 640 * windowHeight;
        this.backgroundImage = new SimpleSprite("dist/img/UI/bgChoice.png"), this.addChild(this.backgroundImage), 
        this.backgroundImage.container.width = windowWidth, this.backgroundImage.container.height = windowHeight, 
        this.pointsMask = [ [ 510 / 1136 * windowWidth, 0 ], [ 1035 / 1136 * windowWidth, 0 ], [ 465 / 1136 * windowWidth, windowHeight ], [ 25 / 1136 * windowWidth, windowHeight ] ], 
        this.faceContainer = new PIXI.DisplayObjectContainer(), this.faceMask = new PIXI.Graphics(), 
        this.faceMask.beginFill(6684757), this.faceMask.moveTo(this.pointsMask[0][0], this.pointsMask[0][1]), 
        this.faceMask.lineTo(this.pointsMask[1][0], this.pointsMask[1][1]), this.faceMask.lineTo(this.pointsMask[2][0], this.pointsMask[2][1]), 
        this.faceMask.lineTo(this.pointsMask[3][0], this.pointsMask[3][1]), this.faceContainer.addChild(this.faceMask), 
        this.faceColorBlink = new PIXI.Graphics(), this.faceColorBlink.beginFill(16777215), 
        this.faceColorBlink.moveTo(this.pointsMask[0][0], this.pointsMask[0][1]), this.faceColorBlink.lineTo(this.pointsMask[1][0], this.pointsMask[1][1]), 
        this.faceColorBlink.lineTo(this.pointsMask[2][0], this.pointsMask[2][1]), this.faceColorBlink.lineTo(this.pointsMask[3][0], this.pointsMask[3][1]), 
        this.faceContainer.addChild(this.faceColorBlink), this.addChild(this.faceContainer), 
        this.faceContainer.mask = this.faceMask, this.pista = new SimpleSprite("pista.png"), 
        this.addChild(this.pista);
        var pistaScale = scaleConverter(this.pista.getContent().width, windowWidth, .4);
        this.pista.getContent().scale.x = pistaScale, this.pista.getContent().scale.y = pistaScale, 
        this.pista.setPosition(windowWidth - this.pista.getContent().width - .05 * windowWidth, windowHeight - this.pista.getContent().height / 2), 
        this.char1 = new ChoiceButton("out.png", "selectedInner.png", "selected.png"), this.char1.build(sizeScale, sizeScale), 
        this.char1.setPosition(.02 * windowWidth, .08 * windowHeight), this.addChild(this.char1), 
        this.currentID = APP.getGameModel().currentID, this.arrButtons = [], this.char1.clickCallback = function() {
            0 !== self.currentID && (APP.getGameModel().setModel(0), self.updatePlayers());
        }, this.char2 = new ChoiceButton("out.png", "selectedInner.png", "selected.png"), 
        this.char2.build(sizeScale, sizeScale), this.char2.setPosition(.02 * windowWidth, this.char1.getContent().position.y + sizeScale + spacing), 
        this.addChild(this.char2), this.char2.clickCallback = function() {
            1 !== self.currentID && (APP.getGameModel().setModel(1), self.updatePlayers());
        }, this.char3 = new ChoiceButton("out.png", "selectedInner.png", "selected.png"), 
        this.char3.build(sizeScale, sizeScale), this.char3.setPosition(.02 * windowWidth, this.char2.getContent().position.y + sizeScale + spacing), 
        this.addChild(this.char3), this.char3.clickCallback = function() {
            2 !== self.currentID && (APP.getGameModel().setModel(2), self.updatePlayers());
        }, this.char4 = new ChoiceButton("out.png", "selectedInner.png", "selected.png"), 
        this.char4.build(sizeScale, sizeScale), this.char4.setPosition(this.char1.getContent().position.x + sizeScale + spacing, this.char1.getContent().position.y), 
        this.addChild(this.char4), this.char4.clickCallback = function() {
            3 !== self.currentID && (APP.getGameModel().setModel(3), self.updatePlayers());
        }, this.char5 = new ChoiceButton("out.png", "selectedInner.png", "selected.png"), 
        this.char5.build(sizeScale, sizeScale), this.char5.setPosition(this.char4.getContent().position.x, this.char2.getContent().position.y), 
        this.addChild(this.char5), this.currentID = APP.getGameModel().currentID, this.char5.clickCallback = function() {
            4 !== self.currentID && (APP.getGameModel().setModel(4), self.updatePlayers());
        }, this.char6 = new ChoiceButton("out.png", "selectedInner.png", "selected.png"), 
        this.char6.build(sizeScale, sizeScale), this.char6.setPosition(this.char5.getContent().position.x, this.char3.getContent().position.y), 
        this.addChild(this.char6), this.char6.clickCallback = function() {
            5 !== self.currentID && (APP.getGameModel().setModel(5), self.updatePlayers());
        }, this.char7 = new ChoiceButton("out.png", "selectedInner.png", "selected.png"), 
        this.char7.build(sizeScale, sizeScale), this.char7.setPosition(this.char5.getContent().position.x + sizeScale + spacing, this.char5.getContent().position.y), 
        this.addChild(this.char7), this.char7.clickCallback = function() {
            6 !== self.currentID && (APP.getGameModel().setModel(6), self.updatePlayers());
        }, this.char8 = new ChoiceButton("out.png", "selectedInner.png", "selected.png"), 
        this.char8.build(sizeScale, sizeScale), this.char8.setPosition(this.char6.getContent().position.x + sizeScale + spacing, this.char6.getContent().position.y), 
        this.addChild(this.char8), this.char8.clickCallback = function() {
            7 !== self.currentID && (APP.getGameModel().setModel(7), self.updatePlayers());
        }, this.char9 = new ChoiceButton("out.png", "selectedInner.png", "selected.png"), 
        this.char9.build(sizeScale, sizeScale), this.char9.setPosition(this.char6.getContent().position.x, this.char6.getContent().position.y + sizeScale + spacing), 
        this.addChild(this.char9), this.char9.clickCallback = function() {
            8 !== self.currentID && (APP.getGameModel().setModel(8), self.updatePlayers());
        }, this.char10 = new ChoiceButton("out.png", "selectedInner.png", "selected.png"), 
        this.char10.build(sizeScale, sizeScale), this.char10.setPosition(this.char8.getContent().position.x, this.char8.getContent().position.y + sizeScale + spacing), 
        this.addChild(this.char10), this.char10.clickCallback = function() {
            9 !== self.currentID && (APP.getGameModel().setModel(9), self.updatePlayers());
        }, this.arrButtons.push(this.char1), this.arrButtons.push(this.char2), this.arrButtons.push(this.char3), 
        this.arrButtons.push(this.char4), this.arrButtons.push(this.char5), this.arrButtons.push(this.char6), 
        this.arrButtons.push(this.char7), this.arrButtons.push(this.char8), this.arrButtons.push(this.char9), 
        this.arrButtons.push(this.char10);
        for (var i = this.arrButtons.length - 1; i >= 0; i--) this.arrButtons[i].parent = this, 
        this.arrButtons[i].color = APP.getGameModel().playerModels[i].color, this.arrButtons[i].addThumb(APP.getGameModel().playerModels[i].thumbColor, APP.getGameModel().playerModels[i].thumbGray), 
        this.arrButtons[i].mouseUpCallback = this.resetButtons;
        this.play = new DefaultButton("simpleButtonUp.png", "simpleButtonOver.png"), this.play.build(120, 60), 
        this.play.setPosition(windowWidth - this.play.width - 10, windowHeight - this.play.height - 10), 
        this.addChild(this.play), this.play.addLabel(new PIXI.Text("PLAY", {
            align: "center",
            font: "35px Arial",
            wordWrap: !0,
            wordWrapWidth: 300
        }), 15, 15), this.play.clickCallback = function() {
            self.screenManager.change("Game");
        }, this.returnButton = new DefaultButton("simpleButtonUp.png", "simpleButtonOver.png"), 
        this.returnButton.build(60, 60), this.returnButton.setPosition(10, windowHeight - this.play.height - 10), 
        this.addChild(this.returnButton), this.returnButton.clickCallback = function() {
            self.screenManager.change("Wait");
        }, this.arrButtons[APP.getGameModel().currentID].selectedFunction(), this.createStatsContainer(), 
        this.updatePlayers();
    },
    createStatsContainer: function() {
        this.statsContainer = new PIXI.DisplayObjectContainer(), this.addChild(this.statsContainer), 
        this.backBars = new SimpleSprite("backBars.png"), this.statsContainer.addChild(this.backBars.getContent());
        var barX = this.backBars.getContent().width / 2 - 75, barY = 70;
        this.energyBar = new BarView(150, 15, 1, 0), this.statsContainer.addChild(this.energyBar.getContent()), 
        this.energyBar.setPosition(barX, 0 + barY), this.energyBar.setFrontColor(16158750), 
        this.energyBar.setBackColor(0), this.energyBar.addBackShape(362607, 6), this.velBar = new BarView(150, 15, 1, 0), 
        this.statsContainer.addChild(this.velBar.getContent()), this.velBar.setPosition(barX, 60 + barY), 
        this.velBar.setFrontColor(16158750), this.velBar.setBackColor(0), this.velBar.addBackShape(362607, 6), 
        this.powerBar = new BarView(150, 15, 1, 0), this.statsContainer.addChild(this.powerBar.getContent()), 
        this.powerBar.setPosition(barX, 120 + barY), this.powerBar.setFrontColor(16158750), 
        this.powerBar.setBackColor(0), this.powerBar.addBackShape(362607, 6);
        var energyLabel = new PIXI.Text("ENERGIA", {
            align: "center",
            font: "20px Arial",
            wordWrap: !0,
            wordWrapWidth: 300
        });
        this.statsContainer.addChild(energyLabel), energyLabel.position.x = this.backBars.getContent().width / 2 - energyLabel.width / 2, 
        energyLabel.position.y = this.energyBar.getContent().position.y - energyLabel.height;
        var velLabel = new PIXI.Text("VELOCIDADE", {
            align: "center",
            font: "20px Arial",
            wordWrap: !0,
            wordWrapWidth: 300
        });
        this.statsContainer.addChild(velLabel), velLabel.position.x = this.backBars.getContent().width / 2 - velLabel.width / 2, 
        velLabel.position.y = this.velBar.getContent().position.y - velLabel.height;
        var tiroLabel = new PIXI.Text("TIRO", {
            align: "center",
            font: "20px Arial",
            wordWrap: !0,
            wordWrapWidth: 300
        });
        this.statsContainer.addChild(tiroLabel), tiroLabel.position.x = this.backBars.getContent().width / 2 - tiroLabel.width / 2, 
        tiroLabel.position.y = this.powerBar.getContent().position.y - tiroLabel.height;
        var statsScale = scaleConverter(this.statsContainer.width, windowWidth, .2);
        this.statsContainer.scale.x = statsScale, this.statsContainer.scale.y = statsScale, 
        this.statsContainer.position.x = windowWidth - this.statsContainer.width - .1 * this.statsContainer.width, 
        this.statsContainer.position.y = this.char1.getContent().position.y;
    },
    resetButtons: function() {
        for (var i = this.parent.arrButtons.length - 1; i >= 0; i--) this !== this.parent.arrButtons[i] && this.parent.arrButtons[i].resetTextures();
    },
    updateStatsBars: function() {
        this.energyBar.updateBar(1, APP.getGameModel().currentPlayerModel.energyCoast), 
        this.velBar.updateBar(APP.getGameModel().currentPlayerModel.velocity, 3), this.powerBar.updateBar(APP.getGameModel().currentPlayerModel.bulletForce, 3);
    },
    updatePlayers: function() {
        this.currentID = APP.getGameModel().currentID, this.updateStatsBars(), this.faceColor && this.faceColor.parent && this.faceColor.parent.removeChild(this.faceColor), 
        this.faceColor = new PIXI.Graphics(), this.faceColor.beginFill(APP.getGameModel().currentPlayerModel.color), 
        this.faceColor.moveTo(this.pointsMask[0][0], this.pointsMask[0][1]), this.faceColor.lineTo(this.pointsMask[1][0], this.pointsMask[1][1]), 
        this.faceColor.lineTo(this.pointsMask[2][0], this.pointsMask[2][1]), this.faceColor.lineTo(this.pointsMask[3][0], this.pointsMask[3][1]), 
        this.faceColor.blendMode = PIXI.blendModes.MULTIPLY, this.faceContainer.addChildAt(this.faceColor, 0), 
        this.playerImgBig && this.playerImgBig.getContent().parent && (this.playerImgBig.getContent().parent.removeChild(this.playerImgBig.getContent()), 
        this.removeChild(this.playerImgBig)), this.playerImgBig = new SimpleSprite(APP.getGameModel().currentPlayerModel.coverSource);
        var coverScale = scaleConverter(this.playerImgBig.getContent().height, windowHeight, .9);
        if (this.playerImgBig.container.scale.x = coverScale, this.playerImgBig.container.scale.y = coverScale, 
        this.playerImgBig.setPosition(windowWidth / 2 - this.playerImgBig.getContent().width / 2, windowHeight - this.playerImgBig.getContent().height), 
        this.faceContainer.addChild(this.playerImgBig.getContent()), this.faceColorBlink.alpha = 1, 
        TweenLite.to(this.faceColorBlink, .2, {
            alpha: 0
        }), TweenLite.from(this.playerImgBig.getContent().position, .8, {
            x: this.playerImgBig.getContent().position.x + .1 * windowWidth
        }), TweenLite.from(this.playerImgBig.getContent(), .3, {
            alpha: 0
        }), this.playerImg && this.playerImg.getContent().parent && (this.playerImg.getContent().parent.removeChild(this.playerImg.getContent()), 
        this.removeChild(this.playerImg)), this.playerImg = new SimpleSprite(APP.getGameModel().currentPlayerModel.imgSource), 
        this.playerImg) {
            this.playerImg.container.anchor.x = .5, this.playerImg.container.anchor.y = .5;
            var scale = 1;
            scale = this.playerImg.container.width > this.playerImg.container.height ? scaleConverter(this.playerImg.container.width, windowWidth, .2) : scaleConverter(this.playerImg.container.height, windowHeight, .4), 
            this.playerImg.container.scale.x = scale, this.playerImg.container.scale.y = scale, 
            this.addChild(this.playerImg), this.playerImg.setPosition(this.pista.getContent().position.x + this.pista.getContent().width / 2, this.pista.getContent().position.y - this.playerImg.container.height / 2), 
            TweenLite.from(this.playerImg.getContent().position, .8, {
                x: this.playerImg.getContent().position.x - .2 * windowWidth,
                y: this.playerImg.getContent().position.y - .2 * windowHeight
            }), TweenLite.from(this.playerImg.getContent(), .3, {
                alpha: 0
            }), this.playerImg.getContent().rotation = .2, TweenLite.to(this.playerImg.getContent(), .5, {
                rotation: 0
            });
        }
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
        this.btnBenchmark = new DefaultButton("simpleButtonUp.png", "simpleButtonOver.png"), 
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
        console.log(this.gameOver, "build"), this.particleAccum = 100, this.gameOver = !1, 
        this._super(), this.textAcc = new PIXI.Text("", {
            font: "15px Arial"
        }), this.addChild(this.textAcc), this.textAcc.position.y = 20, this.textAcc.position.x = windowWidth - 150;
        var assetsToLoader = [ "dist/img/atlas/atlas.json" ];
        assetsToLoader.length > 0 ? (this.loader = new PIXI.AssetLoader(assetsToLoader), 
        this.initLoad()) : this.onAssetsLoaded(), this.accelerometer = {}, this.hitTouch = new PIXI.Graphics(), 
        this.hitTouch.interactive = !0, this.hitTouch.beginFill(0), this.hitTouch.drawRect(0, 0, windowWidth, windowHeight), 
        this.addChild(this.hitTouch), this.hitTouch.alpha = 0, this.hitTouch.hitArea = new PIXI.Rectangle(0, 0, .7 * windowWidth, windowHeight), 
        this.hitTouchAttack = new PIXI.Graphics(), this.hitTouchAttack.interactive = !0, 
        this.hitTouchAttack.beginFill(0), this.hitTouchAttack.drawRect(0, 0, windowWidth, windowHeight), 
        this.addChild(this.hitTouchAttack), this.hitTouchAttack.alpha = 0, this.hitTouchAttack.hitArea = new PIXI.Rectangle(.3 * windowWidth, 0, windowWidth, windowHeight);
        var self = this;
        this.hitTouchAttack.mousedown = this.hitTouchAttack.touchstart = function() {
            self.gameOver || self.playerModel.currentBulletEnergy < self.playerModel.maxBulletEnergy * self.playerModel.bulletCoast || (self.touchstart = !0, 
            self.onBulletTouch = !0);
        }, this.hitTouchAttack.mouseup = this.hitTouchAttack.touchend = function() {
            self.touchstart && !self.gameOver && (self.touchstart = !1, self.onBulletTouch = !1, 
            self.shoot());
        }, this.hitTouch.touchstart = function(touchData) {
            self.gameOver || self.red && self.red.setTarget(touchData.global.y + .8 * self.red.getContent().height);
        }, this.hitTouch.touchend = function() {
            self.gameOver;
        }, this.hitTouch.touchmove = function(touchData) {
            self.gameOver || self.red && self.red.setTarget(touchData.global.y + .8 * self.red.getContent().height);
        }, this.spawner = 0;
    },
    reset: function() {
        this.destroy(), this.build();
    },
    onProgress: function() {
        this._super();
    },
    onAssetsLoaded: function() {
        this.initApplication();
    },
    shoot: function() {
        var percent = this.playerModel.currentBulletForce / this.playerModel.maxBulletEnergy, fireForce = percent * this.playerModel.range, timeLive = this.red.getContent().width / this.playerModel.bulletVel + fireForce + 100, vel = this.playerModel.bulletVel + this.playerModel.bulletVel * percent, angle = this.red.rotation, bullet = new Bullet({
            x: Math.cos(angle) * vel,
            y: Math.sin(angle) * vel
        }, timeLive, this.playerModel.bulletForce, this.playerModel.bulletSource);
        bullet.build(), bullet.setPosition(.8 * this.red.getPosition().x, .8 * this.red.getPosition().y), 
        this.layer.addChild(bullet);
        scaleConverter(this.red.getContent().width, bullet.getContent().width, .8);
        this.playerModel.currentBulletEnergy -= this.playerModel.maxBulletEnergy * this.playerModel.bulletCoast, 
        this.playerModel.currentBulletEnergy < 0 && (this.playerModel.currentBulletEnergy = 0);
    },
    update: function() {
        this.updateable && (this._super(), this.playerModel && this.initApp && (!testMobile() && this.red && APP.stage.getMousePosition().y > 0 && APP.stage.getMousePosition().y < windowHeight && this.red.setTarget(APP.stage.getMousePosition().y + .8 * this.red.getContent().height), 
        this.playerModel && this.onBulletTouch && this.playerModel.currentBulletEnergy > 0, 
        this.playerModel && this.playerModel.currentBulletEnergy <= this.playerModel.maxBulletEnergy - this.playerModel.recoverBulletEnergy && (this.playerModel.currentBulletEnergy += this.playerModel.recoverBulletEnergy), 
        this.playerModel && this.playerModel.currentEnergy > 1.1 * this.playerModel.energyCoast ? this.playerModel.currentEnergy -= this.playerModel.energyCoast : this.gameOver = !0, 
        this.gameOver && (this.red.gameOver = !0, this.red.velocity.y += .05, this.red.getPosition().y > windowHeight + this.red.getContent().height && (console.log("GAME OVER"), 
        this.endModal.show())), this.bulletBar && this.bulletBar.updateBar(this.playerModel.currentBulletEnergy, this.playerModel.maxBulletEnergy), 
        this.energyBar && this.energyBar.updateBar(this.playerModel.currentEnergy, this.playerModel.maxEnergy), 
        this.updateBirds(), this.updateParticles(), this.pointsLabel && (this.pointsLabel.setText(this.points), 
        this.pointsLabel.position.x = this.moneyContainer.width / 2)));
    },
    updateBirds: function() {
        if (this.spawner <= 0) {
            var bird = APP.getGameModel().getNewBird(this.red);
            bird.build(), this.layer.addChild(bird);
            var scale = scaleConverter(bird.getContent().width, windowHeight, bird.birdModel.sizePercent);
            bird.setScale(scale, scale), bird.setPosition(bird.behaviour.position.x, bird.behaviour.position.y), 
            this.spawner = bird.birdModel.toNext;
        } else this.spawner--;
    },
    updateParticles: function() {
        if (this.particleAccum < 0) {
            this.particleAccum = this.playerModel.currentEnergy / this.playerModel.maxEnergy * 100 + 8;
            var particle = new Particles({
                x: -.9,
                y: -(.2 * Math.random() + .7)
            }, 110, "smoke.png", -.02 * Math.random() + .01);
            particle.build(), particle.alphadecress = .01, particle.setPosition(this.red.getPosition().x - this.red.getContent().width - 10 * Math.random() + 15, this.red.getPosition().y - this.red.getContent().height / 2 + 25), 
            this.addChild(particle);
        } else this.particleAccum--;
    },
    initApplication: function() {
        console.log("INIT APLICATION"), this.points = 0, this.initApp = !0;
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
        this.energyBar = new BarView(.1 * windowWidth, 10, 1, 1), this.addChild(this.energyBar), 
        this.energyBar.setPosition(20, posHelper), this.energyBar.setFrontColor(14715427), 
        this.bulletBar = new BarView(.08 * windowWidth, 10, 1, 1), this.addChild(this.bulletBar), 
        this.bulletBar.setPosition(20, posHelper + 20), this.bulletBar.setFrontColor(3905720), 
        this.returnButton = new DefaultButton("simpleButtonUp.png", "simpleButtonOver.png"), 
        this.returnButton.build(60, 50), this.returnButton.setPosition(.95 * windowWidth - 20, .95 * windowHeight - 65), 
        this.addChild(this.returnButton), this.returnButton.addLabel(new PIXI.Text("<", {
            font: "40px Arial"
        }), 5, 5), this.returnButton.clickCallback = function() {
            self.screenManager.prevScreen();
        }, this.pauseButton = new DefaultButton("simpleButtonUp.png", "simpleButtonOver.png"), 
        this.pauseButton.build(50, 50), this.pauseButton.setPosition(windowWidth / 2 - this.pauseButton.width / 2, .05 * windowHeight), 
        this.addChild(this.pauseButton), this.pauseButton.addLabel(new PIXI.Text("", {
            font: "40px Arial"
        }), 5, 5), this.pauseButton.clickCallback = function() {
            self.endModal.show();
        };
        var item = new Item();
        item.build(), item.setPosition(windowWidth, windowHeight / 2), this.layer.addChild(item);
        var itemScale = scaleConverter(item.getContent().height, windowHeight, .1);
        item.setScale(itemScale, itemScale), this.initBench = !1, this.gameHUD = new PIXI.DisplayObjectContainer(), 
        this.addChild(this.gameHUD), this.moneyContainer = new PIXI.DisplayObjectContainer(), 
        this.addChild(this.moneyContainer);
        var moneyBg = new SimpleSprite("moneyContent.png");
        this.moneyContainer.addChild(moneyBg.getContent()), this.pointsLabel = new PIXI.Text("", {
            font: "25px Arial"
        }), this.moneyContainer.addChild(this.pointsLabel), this.moneyContainer.position.y = 20, 
        this.moneyContainer.position.x = windowWidth / 2;
        var moneyScale = scaleConverter(this.moneyContainer.width, windowWidth, .25);
        this.moneyContainer.scale.x = moneyScale, this.moneyContainer.scale.y = moneyScale, 
        this.pointsLabel.position.x = this.moneyContainer.width + this.pointsLabel.width / 2, 
        this.pointsLabel.position.y = 31, this.moneyContainer.position.x = windowWidth - this.moneyContainer.width - 20, 
        this.updateable = !0, this.endModal = new EndModal(this), this.pauseModal = new PauseModal(this);
    },
    updatePoints: function(value) {
        this.points += value;
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
        var assetsToLoader = [ "dist/img/atlas/atlas.json", "dist/img/atlas/atlas1.json", "dist/img/UI/bgChoice.png", "dist/img/UI/jeisoGrande.png", "dist/img/UI/arthurGrande.png", "dist/img/UI/piGrande.png", "dist/img/UI/rodaikaGrande.png", "dist/img/UI/poterGrande.png", "dist/img/UI/poraGrande.png", "dist/img/UI/feterGrande.png", "dist/img/UI/alcemarGrande.png", "dist/img/UI/netoGrande.png", "dist/img/UI/piangersGrande.png", "dist/img/UI/HUD.json" ];
        assetsToLoader.length > 0 ? (this.loader = new PIXI.AssetLoader(assetsToLoader), 
        this.initLoad()) : this.onAssetsLoaded();
    },
    onProgress: function() {
        this._super(), APP.labelDebug.setText(Math.floor(100 * this.loadPercent)), console.log(this.loadPercent);
    },
    onAssetsLoaded: function() {
        this.initApplication();
    },
    initApplication: function() {
        var self = this;
        this.btnBenchmark = new DefaultButton("simpleButtonUp.png", "simpleButtonOver.png"), 
        this.btnBenchmark.build(300, 100), this.btnBenchmark.setPosition(windowWidth / 2 - this.btnBenchmark.width / 2, windowHeight / 2), 
        this.addChild(this.btnBenchmark), this.btnBenchmark.addLabel(new PIXI.Text("Jogar", {
            align: "center",
            font: "60px Arial",
            wordWrap: !0,
            wordWrapWidth: 300
        }), 70, 15), this.btnBenchmark.clickCallback = function() {
            self.screenManager.change("Choice");
        }, possibleFullscreen() && (this.fullScreen = new DefaultButton("simpleButtonUp.png", "simpleButtonOver.png"), 
        this.fullScreen.build(40, 20), this.fullScreen.setPosition(.95 * windowWidth - 20, .95 * windowHeight - 35), 
        this.addChild(this.fullScreen), this.fullScreen.addLabel(new PIXI.Text("Full", {
            font: "10px Arial"
        }), 5, 5), this.fullScreen.clickCallback = function() {
            fullscreen();
        });
    }
}), CreditsModal = Class.extend({
    init: function(screen) {
        this.screen = screen, this.container = new PIXI.DisplayObjectContainer(), this.boxContainer = new PIXI.DisplayObjectContainer(), 
        this.bg = new PIXI.Graphics(), this.bg.beginFill(19784), this.bg.drawRect(0, 0, windowWidth, windowHeight), 
        this.bg.alpha = 0, this.container.addChild(this.bg), this.container.addChild(this.boxContainer), 
        this.background = new SimpleSprite("credits.png"), this.boxContainer.addChild(this.background.container), 
        this.background.container.position.x = windowWidth / 2 - this.background.getContent().width / 2, 
        this.background.container.position.y = windowHeight / 2 - this.background.getContent().height / 2;
        var bgPos = {
            x: this.background.container.position.x + 70,
            y: this.background.container.position.y + 14
        }, self = this;
        this.exitButton = new DefaultButton("close.png", "close.png"), this.exitButton.build(), 
        this.exitButton.setPosition(bgPos.x + 815, bgPos.y - 28), this.boxContainer.addChild(this.exitButton.getContent()), 
        this.exitButton.clickCallback = function() {
            self.hide();
        }, this.boxContainer.alpha = 0;
    },
    show: function() {
        this.container.parent.setChildIndex(this.container, this.container.parent.children.length - 1), 
        this.screen.updateable = !1, TweenLite.to(this.bg, .5, {
            alpha: .8
        }), TweenLite.to(this.boxContainer.position, 1, {
            y: 0,
            ease: "easeOutBack"
        }), TweenLite.to(this.boxContainer, .5, {
            alpha: 1
        });
    },
    hide: function(callback) {
        TweenLite.to(this.bg, .5, {
            alpha: 0,
            onComplete: function() {
                callback && callback();
            }
        }), TweenLite.to(this.boxContainer.position, 1, {
            y: -this.boxContainer.height,
            ease: "easeInBack"
        }), TweenLite.to(this.boxContainer, .5, {
            alpha: 0
        });
    },
    getContent: function() {
        return this.container;
    }
}), EndModal = Class.extend({
    init: function(screen) {
        this.screen = screen, this.container = new PIXI.DisplayObjectContainer(), this.boxContainer = new PIXI.DisplayObjectContainer(), 
        this.bg = new PIXI.Graphics(), this.bg.beginFill(19784), this.bg.drawRect(0, 0, windowWidth, windowHeight), 
        this.bg.alpha = 0, this.container.addChild(this.bg), this.container.addChild(this.boxContainer);
        var self = this;
        this.background = new SimpleSprite("endModalBg.png"), this.boxContainer.addChild(this.background.getContent()), 
        this.exitButton = new DefaultButton("simpleButtonUp.png", "simpleButtonOver.png"), 
        this.exitButton.build(), this.exitButton.setPosition(this.background.getContent().width / 2 - this.exitButton.width / 2, this.background.getContent().height - this.exitButton.height / 2), 
        this.boxContainer.addChild(this.exitButton.getContent()), this.exitButton.clickCallback = function() {
            self.hide(function() {
                self.screen.updateable = !0, self.screen.reset();
            });
        }, this.boxContainer.addChild(this.exitButton.getContent()), this.boxContainer.alpha = 0, 
        this.boxContainer.visible = !1, this.containerScale = scaleConverter(this.boxContainer.height, windowHeight, .85), 
        this.boxContainer.scale.x = this.containerScale, this.boxContainer.scale.y = this.containerScale, 
        this.boxContainer.position.x = windowWidth / 2 - this.background.getContent().width * this.containerScale / 2, 
        this.boxContainer.position.y = windowHeight / 2 - this.background.getContent().height * this.containerScale / 2;
        var i = 0, tempBirdContainer = null, birdContainer = null, bird = null, arrayBirds = [ "belga.png", "lambecu.png", "roxo.png", "belga.png", "lambecu.png", "roxo.png" ], cont = 0;
        for (i = 1; 4 > i; i++) tempBirdContainer = new PIXI.DisplayObjectContainer(), birdContainer = new SimpleSprite("birdContainer.png"), 
        bird = new SimpleSprite(arrayBirds[cont++]), tempBirdContainer.addChild(birdContainer.getContent()), 
        tempBirdContainer.addChild(bird.getContent()), this.boxContainer.addChild(tempBirdContainer), 
        tempBirdContainer.position.x = -50, tempBirdContainer.position.y = (birdContainer.getContent().height - 40) * (i - 1) + 40, 
        i % 2 === 0 && (birdContainer.getContent().scale.x = -1, tempBirdContainer.position.x -= birdContainer.getContent().width), 
        bird.getContent().position.y = birdContainer.getContent().height / 2 - bird.getContent().height / 2, 
        bird.getContent().position.x = birdContainer.getContent().width / 2 - bird.getContent().width / 2 + 30 * birdContainer.getContent().scale.x;
        for (i = 1; 4 > i; i++) tempBirdContainer = new PIXI.DisplayObjectContainer(), birdContainer = new SimpleSprite("birdContainer.png"), 
        bird = new SimpleSprite(arrayBirds[cont++]), tempBirdContainer.addChild(birdContainer.getContent()), 
        this.boxContainer.addChild(tempBirdContainer), tempBirdContainer.addChild(bird.getContent()), 
        tempBirdContainer.position.x = 610, tempBirdContainer.position.y = (birdContainer.getContent().height - 40) * (i - 1) + 40, 
        i % 2 !== 0 && (birdContainer.getContent().scale.x = -1, tempBirdContainer.position.x -= birdContainer.getContent().width), 
        bird.getContent().position.y = birdContainer.getContent().height / 2 - bird.getContent().height / 2, 
        bird.getContent().position.x = birdContainer.getContent().width / 2 - bird.getContent().width / 2 + 30 * birdContainer.getContent().scale.x;
        var top = new SimpleSprite("gasoline.png");
        this.boxContainer.addChild(top.getContent()), top.getContent().position.x = this.background.getContent().width / 2 - top.getContent().width / 2, 
        top.getContent().position.y = -top.getContent().height / 2;
    },
    show: function() {
        this.screen.addChild(this), this.container.parent.setChildIndex(this.container, this.container.parent.children.length - 1), 
        this.boxContainer.visible = !0, this.screen.updateable = !1, TweenLite.to(this.bg, .5, {
            alpha: .8
        }), TweenLite.to(this.boxContainer.position, 1, {
            y: windowHeight / 2 - this.background.getContent().height * this.containerScale / 2,
            ease: "easeOutBack"
        }), TweenLite.to(this.boxContainer, .5, {
            alpha: 1
        });
    },
    hide: function(callback) {
        var self = this;
        TweenLite.to(this.bg, .5, {
            alpha: 0,
            onComplete: function() {
                callback && (callback(), self.container.parent && self.container.parent.removeChild(self.container));
            }
        }), TweenLite.to(this.boxContainer.position, 1, {
            y: -this.boxContainer.height,
            ease: "easeInBack"
        }), TweenLite.to(this.boxContainer, .5, {
            alpha: 0
        });
    },
    getContent: function() {
        return this.container;
    }
}), PauseModal = Class.extend({
    init: function(screen) {
        this.screen = screen, this.container = new PIXI.DisplayObjectContainer(), this.boxContainer = new PIXI.DisplayObjectContainer(), 
        this.bg = new PIXI.Graphics(), this.bg.beginFill(19784), this.bg.drawRect(0, 0, windowWidth, windowHeight), 
        this.bg.alpha = 0, this.container.addChild(this.bg), this.container.addChild(this.boxContainer);
        var self = this;
        this.exitButton = new DefaultButton("simpleButtonOver.png", "simpleButtonUp.png"), 
        this.exitButton.build(.2 * windowWidth, .2 * windowHeight), this.exitButton.setPosition(windowWidth / 2 - this.exitButton.width / 2, windowHeight / 2 - this.exitButton.height / 2), 
        this.boxContainer.addChild(this.exitButton.getContent()), this.exitButton.clickCallback = function() {
            self.hide(function() {
                self.screen.updateable = !0;
            });
        }, this.boxContainer.addChild(this.exitButton.getContent()), this.boxContainer.alpha = 0, 
        this.boxContainer.visible = !1;
    },
    show: function() {
        this.screen.addChild(this), this.boxContainer.visible = !0, this.container.parent.setChildIndex(this.container, this.container.parent.children.length - 1), 
        this.screen.updateable = !1, TweenLite.to(this.bg, .5, {
            alpha: .8
        }), TweenLite.to(this.boxContainer.position, 1, {
            y: 0,
            ease: "easeOutBack"
        }), TweenLite.to(this.boxContainer, .5, {
            alpha: 1
        });
    },
    hide: function(callback) {
        var self = this;
        TweenLite.to(this.bg, .5, {
            alpha: 0,
            onComplete: function() {
                callback && (callback(), self.container.parent && self.container.parent.removeChild(self.container));
            }
        }), TweenLite.to(this.boxContainer.position, 1, {
            y: -this.boxContainer.height,
            ease: "easeInBack"
        }), TweenLite.to(this.boxContainer, .5, {
            alpha: 0
        });
    },
    getContent: function() {
        return this.container;
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
        this._super(!0), this.updateable = !1, this.colidable = !1, this.deading = !1, this.range = 40, 
        this.width = 1, this.height = 1, this.type = "fire", this.target = "enemy", this.fireType = "physical", 
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
}), resizeProportional = !0, windowWidth = 1136, windowHeight = 640, realWindowWidth = 1136, realWindowHeight = 640, gameScale = 1.5;

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