/*! jefframos 19-03-2015 */
!function() {
    var cache = {}, ctx = null, usingWebAudio = !0, noAudio = !1;
    try {
        "undefined" != typeof AudioContext ? ctx = new AudioContext() : "undefined" != typeof webkitAudioContext ? ctx = new webkitAudioContext() : usingWebAudio = !1;
    } catch (e) {
        usingWebAudio = !1;
    }
    if (!usingWebAudio) if ("undefined" != typeof Audio) try {
        new Audio();
    } catch (e) {
        noAudio = !0;
    } else noAudio = !0;
    if (usingWebAudio) {
        var masterGain = "undefined" == typeof ctx.createGain ? ctx.createGainNode() : ctx.createGain();
        masterGain.gain.value = 1, masterGain.connect(ctx.destination);
    }
    var HowlerGlobal = function(codecs) {
        this._volume = 1, this._muted = !1, this.usingWebAudio = usingWebAudio, this.ctx = ctx, 
        this.noAudio = noAudio, this._howls = [], this._codecs = codecs, this.iOSAutoEnable = !0;
    };
    HowlerGlobal.prototype = {
        volume: function(vol) {
            var self = this;
            if (vol = parseFloat(vol), vol >= 0 && 1 >= vol) {
                self._volume = vol, usingWebAudio && (masterGain.gain.value = vol);
                for (var key in self._howls) if (self._howls.hasOwnProperty(key) && self._howls[key]._webAudio === !1) for (var i = 0; i < self._howls[key]._audioNode.length; i++) self._howls[key]._audioNode[i].volume = self._howls[key]._volume * self._volume;
                return self;
            }
            return usingWebAudio ? masterGain.gain.value : self._volume;
        },
        mute: function() {
            return this._setMuted(!0), this;
        },
        unmute: function() {
            return this._setMuted(!1), this;
        },
        _setMuted: function(muted) {
            var self = this;
            self._muted = muted, usingWebAudio && (masterGain.gain.value = muted ? 0 : self._volume);
            for (var key in self._howls) if (self._howls.hasOwnProperty(key) && self._howls[key]._webAudio === !1) for (var i = 0; i < self._howls[key]._audioNode.length; i++) self._howls[key]._audioNode[i].muted = muted;
        },
        codecs: function(ext) {
            return this._codecs[ext];
        },
        _enableiOSAudio: function() {
            var self = this;
            if (!ctx || !self._iOSEnabled && /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                self._iOSEnabled = !1;
                var unlock = function() {
                    var buffer = ctx.createBuffer(1, 1, 22050), source = ctx.createBufferSource();
                    source.buffer = buffer, source.connect(ctx.destination), "undefined" == typeof source.start ? source.noteOn(0) : source.start(0), 
                    setTimeout(function() {
                        (source.playbackState === source.PLAYING_STATE || source.playbackState === source.FINISHED_STATE) && (self._iOSEnabled = !0, 
                        self.iOSAutoEnable = !1, window.removeEventListener("touchstart", unlock, !1));
                    }, 0);
                };
                return window.addEventListener("touchstart", unlock, !1), self;
            }
        }
    };
    var audioTest = null, codecs = {};
    noAudio || (audioTest = new Audio(), codecs = {
        mp3: !!audioTest.canPlayType("audio/mpeg;").replace(/^no$/, ""),
        opus: !!audioTest.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, ""),
        ogg: !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ""),
        wav: !!audioTest.canPlayType('audio/wav; codecs="1"').replace(/^no$/, ""),
        aac: !!audioTest.canPlayType("audio/aac;").replace(/^no$/, ""),
        m4a: !!(audioTest.canPlayType("audio/x-m4a;") || audioTest.canPlayType("audio/m4a;") || audioTest.canPlayType("audio/aac;")).replace(/^no$/, ""),
        mp4: !!(audioTest.canPlayType("audio/x-mp4;") || audioTest.canPlayType("audio/mp4;") || audioTest.canPlayType("audio/aac;")).replace(/^no$/, ""),
        weba: !!audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, "")
    });
    var Howler = new HowlerGlobal(codecs), Howl = function(o) {
        var self = this;
        self._autoplay = o.autoplay || !1, self._buffer = o.buffer || !1, self._duration = o.duration || 0, 
        self._format = o.format || null, self._loop = o.loop || !1, self._loaded = !1, self._sprite = o.sprite || {}, 
        self._src = o.src || "", self._pos3d = o.pos3d || [ 0, 0, -.5 ], self._volume = void 0 !== o.volume ? o.volume : 1, 
        self._urls = o.urls || [], self._rate = o.rate || 1, self._model = o.model || null, 
        self._onload = [ o.onload || function() {} ], self._onloaderror = [ o.onloaderror || function() {} ], 
        self._onend = [ o.onend || function() {} ], self._onpause = [ o.onpause || function() {} ], 
        self._onplay = [ o.onplay || function() {} ], self._onendTimer = [], self._webAudio = usingWebAudio && !self._buffer, 
        self._audioNode = [], self._webAudio && self._setupAudioNode(), "undefined" != typeof ctx && ctx && Howler.iOSAutoEnable && Howler._enableiOSAudio(), 
        Howler._howls.push(self), self.load();
    };
    if (Howl.prototype = {
        load: function() {
            var self = this, url = null;
            if (noAudio) return void self.on("loaderror");
            for (var i = 0; i < self._urls.length; i++) {
                var ext, urlItem;
                if (self._format) ext = self._format; else {
                    if (urlItem = self._urls[i], ext = /^data:audio\/([^;,]+);/i.exec(urlItem), ext || (ext = /\.([^.]+)$/.exec(urlItem.split("?", 1)[0])), 
                    !ext) return void self.on("loaderror");
                    ext = ext[1].toLowerCase();
                }
                if (codecs[ext]) {
                    url = self._urls[i];
                    break;
                }
            }
            if (!url) return void self.on("loaderror");
            if (self._src = url, self._webAudio) loadBuffer(self, url); else {
                var newNode = new Audio();
                newNode.addEventListener("error", function() {
                    newNode.error && 4 === newNode.error.code && (HowlerGlobal.noAudio = !0), self.on("loaderror", {
                        type: newNode.error ? newNode.error.code : 0
                    });
                }, !1), self._audioNode.push(newNode), newNode.src = url, newNode._pos = 0, newNode.preload = "auto", 
                newNode.volume = Howler._muted ? 0 : self._volume * Howler.volume();
                var listener = function() {
                    self._duration = Math.ceil(10 * newNode.duration) / 10, 0 === Object.getOwnPropertyNames(self._sprite).length && (self._sprite = {
                        _default: [ 0, 1e3 * self._duration ]
                    }), self._loaded || (self._loaded = !0, self.on("load")), self._autoplay && self.play(), 
                    newNode.removeEventListener("canplaythrough", listener, !1);
                };
                newNode.addEventListener("canplaythrough", listener, !1), newNode.load();
            }
            return self;
        },
        urls: function(urls) {
            var self = this;
            return urls ? (self.stop(), self._urls = "string" == typeof urls ? [ urls ] : urls, 
            self._loaded = !1, self.load(), self) : self._urls;
        },
        play: function(sprite, callback) {
            var self = this;
            return "function" == typeof sprite && (callback = sprite), sprite && "function" != typeof sprite || (sprite = "_default"), 
            self._loaded ? self._sprite[sprite] ? (self._inactiveNode(function(node) {
                node._sprite = sprite;
                var pos = node._pos > 0 ? node._pos : self._sprite[sprite][0] / 1e3, duration = 0;
                self._webAudio ? (duration = self._sprite[sprite][1] / 1e3 - node._pos, node._pos > 0 && (pos = self._sprite[sprite][0] / 1e3 + pos)) : duration = self._sprite[sprite][1] / 1e3 - (pos - self._sprite[sprite][0] / 1e3);
                var timerId, loop = !(!self._loop && !self._sprite[sprite][2]), soundId = "string" == typeof callback ? callback : Math.round(Date.now() * Math.random()) + "";
                if (function() {
                    var data = {
                        id: soundId,
                        sprite: sprite,
                        loop: loop
                    };
                    timerId = setTimeout(function() {
                        !self._webAudio && loop && self.stop(data.id).play(sprite, data.id), self._webAudio && !loop && (self._nodeById(data.id).paused = !0, 
                        self._nodeById(data.id)._pos = 0, self._clearEndTimer(data.id)), self._webAudio || loop || self.stop(data.id), 
                        self.on("end", soundId);
                    }, 1e3 * duration), self._onendTimer.push({
                        timer: timerId,
                        id: data.id
                    });
                }(), self._webAudio) {
                    var loopStart = self._sprite[sprite][0] / 1e3, loopEnd = self._sprite[sprite][1] / 1e3;
                    node.id = soundId, node.paused = !1, refreshBuffer(self, [ loop, loopStart, loopEnd ], soundId), 
                    self._playStart = ctx.currentTime, node.gain.value = self._volume, "undefined" == typeof node.bufferSource.start ? node.bufferSource.noteGrainOn(0, pos, duration) : node.bufferSource.start(0, pos, duration);
                } else {
                    if (4 !== node.readyState && (node.readyState || !navigator.isCocoonJS)) return self._clearEndTimer(soundId), 
                    function() {
                        var sound = self, playSprite = sprite, fn = callback, newNode = node, listener = function() {
                            sound.play(playSprite, fn), newNode.removeEventListener("canplaythrough", listener, !1);
                        };
                        newNode.addEventListener("canplaythrough", listener, !1);
                    }(), self;
                    node.readyState = 4, node.id = soundId, node.currentTime = pos, node.muted = Howler._muted || node.muted, 
                    node.volume = self._volume * Howler.volume(), setTimeout(function() {
                        node.play();
                    }, 0);
                }
                return self.on("play"), "function" == typeof callback && callback(soundId), self;
            }), self) : ("function" == typeof callback && callback(), self) : (self.on("load", function() {
                self.play(sprite, callback);
            }), self);
        },
        pause: function(id) {
            var self = this;
            if (!self._loaded) return self.on("play", function() {
                self.pause(id);
            }), self;
            self._clearEndTimer(id);
            var activeNode = id ? self._nodeById(id) : self._activeNode();
            if (activeNode) if (activeNode._pos = self.pos(null, id), self._webAudio) {
                if (!activeNode.bufferSource || activeNode.paused) return self;
                activeNode.paused = !0, "undefined" == typeof activeNode.bufferSource.stop ? activeNode.bufferSource.noteOff(0) : activeNode.bufferSource.stop(0);
            } else activeNode.pause();
            return self.on("pause"), self;
        },
        stop: function(id) {
            var self = this;
            if (!self._loaded) return self.on("play", function() {
                self.stop(id);
            }), self;
            self._clearEndTimer(id);
            var activeNode = id ? self._nodeById(id) : self._activeNode();
            if (activeNode) if (activeNode._pos = 0, self._webAudio) {
                if (!activeNode.bufferSource || activeNode.paused) return self;
                activeNode.paused = !0, "undefined" == typeof activeNode.bufferSource.stop ? activeNode.bufferSource.noteOff(0) : activeNode.bufferSource.stop(0);
            } else isNaN(activeNode.duration) || (activeNode.pause(), activeNode.currentTime = 0);
            return self;
        },
        mute: function(id) {
            var self = this;
            if (!self._loaded) return self.on("play", function() {
                self.mute(id);
            }), self;
            var activeNode = id ? self._nodeById(id) : self._activeNode();
            return activeNode && (self._webAudio ? activeNode.gain.value = 0 : activeNode.muted = !0), 
            self;
        },
        unmute: function(id) {
            var self = this;
            if (!self._loaded) return self.on("play", function() {
                self.unmute(id);
            }), self;
            var activeNode = id ? self._nodeById(id) : self._activeNode();
            return activeNode && (self._webAudio ? activeNode.gain.value = self._volume : activeNode.muted = !1), 
            self;
        },
        volume: function(vol, id) {
            var self = this;
            if (vol = parseFloat(vol), vol >= 0 && 1 >= vol) {
                if (self._volume = vol, !self._loaded) return self.on("play", function() {
                    self.volume(vol, id);
                }), self;
                var activeNode = id ? self._nodeById(id) : self._activeNode();
                return activeNode && (self._webAudio ? activeNode.gain.value = vol : activeNode.volume = vol * Howler.volume()), 
                self;
            }
            return self._volume;
        },
        loop: function(loop) {
            var self = this;
            return "boolean" == typeof loop ? (self._loop = loop, self) : self._loop;
        },
        sprite: function(sprite) {
            var self = this;
            return "object" == typeof sprite ? (self._sprite = sprite, self) : self._sprite;
        },
        pos: function(pos, id) {
            var self = this;
            if (!self._loaded) return self.on("load", function() {
                self.pos(pos);
            }), "number" == typeof pos ? self : self._pos || 0;
            pos = parseFloat(pos);
            var activeNode = id ? self._nodeById(id) : self._activeNode();
            if (activeNode) return pos >= 0 ? (self.pause(id), activeNode._pos = pos, self.play(activeNode._sprite, id), 
            self) : self._webAudio ? activeNode._pos + (ctx.currentTime - self._playStart) : activeNode.currentTime;
            if (pos >= 0) return self;
            for (var i = 0; i < self._audioNode.length; i++) if (self._audioNode[i].paused && 4 === self._audioNode[i].readyState) return self._webAudio ? self._audioNode[i]._pos : self._audioNode[i].currentTime;
        },
        pos3d: function(x, y, z, id) {
            var self = this;
            if (y = "undefined" != typeof y && y ? y : 0, z = "undefined" != typeof z && z ? z : -.5, 
            !self._loaded) return self.on("play", function() {
                self.pos3d(x, y, z, id);
            }), self;
            if (!(x >= 0 || 0 > x)) return self._pos3d;
            if (self._webAudio) {
                var activeNode = id ? self._nodeById(id) : self._activeNode();
                activeNode && (self._pos3d = [ x, y, z ], activeNode.panner.setPosition(x, y, z), 
                activeNode.panner.panningModel = self._model || "HRTF");
            }
            return self;
        },
        fade: function(from, to, len, callback, id) {
            var self = this, diff = Math.abs(from - to), dir = from > to ? "down" : "up", steps = diff / .01, stepTime = len / steps;
            if (!self._loaded) return self.on("load", function() {
                self.fade(from, to, len, callback, id);
            }), self;
            self.volume(from, id);
            for (var i = 1; steps >= i; i++) !function() {
                var change = self._volume + ("up" === dir ? .01 : -.01) * i, vol = Math.round(1e3 * change) / 1e3, toVol = to;
                setTimeout(function() {
                    self.volume(vol, id), vol === toVol && callback && callback();
                }, stepTime * i);
            }();
        },
        fadeIn: function(to, len, callback) {
            return this.volume(0).play().fade(0, to, len, callback);
        },
        fadeOut: function(to, len, callback, id) {
            var self = this;
            return self.fade(self._volume, to, len, function() {
                callback && callback(), self.pause(id), self.on("end");
            }, id);
        },
        _nodeById: function(id) {
            for (var self = this, node = self._audioNode[0], i = 0; i < self._audioNode.length; i++) if (self._audioNode[i].id === id) {
                node = self._audioNode[i];
                break;
            }
            return node;
        },
        _activeNode: function() {
            for (var self = this, node = null, i = 0; i < self._audioNode.length; i++) if (!self._audioNode[i].paused) {
                node = self._audioNode[i];
                break;
            }
            return self._drainPool(), node;
        },
        _inactiveNode: function(callback) {
            for (var self = this, node = null, i = 0; i < self._audioNode.length; i++) if (self._audioNode[i].paused && 4 === self._audioNode[i].readyState) {
                callback(self._audioNode[i]), node = !0;
                break;
            }
            if (self._drainPool(), !node) {
                var newNode;
                if (self._webAudio) newNode = self._setupAudioNode(), callback(newNode); else {
                    self.load(), newNode = self._audioNode[self._audioNode.length - 1];
                    var listenerEvent = navigator.isCocoonJS ? "canplaythrough" : "loadedmetadata", listener = function() {
                        newNode.removeEventListener(listenerEvent, listener, !1), callback(newNode);
                    };
                    newNode.addEventListener(listenerEvent, listener, !1);
                }
            }
        },
        _drainPool: function() {
            var i, self = this, inactive = 0;
            for (i = 0; i < self._audioNode.length; i++) self._audioNode[i].paused && inactive++;
            for (i = self._audioNode.length - 1; i >= 0 && !(5 >= inactive); i--) self._audioNode[i].paused && (self._webAudio && self._audioNode[i].disconnect(0), 
            inactive--, self._audioNode.splice(i, 1));
        },
        _clearEndTimer: function(soundId) {
            for (var self = this, index = 0, i = 0; i < self._onendTimer.length; i++) if (self._onendTimer[i].id === soundId) {
                index = i;
                break;
            }
            var timer = self._onendTimer[index];
            timer && (clearTimeout(timer.timer), self._onendTimer.splice(index, 1));
        },
        _setupAudioNode: function() {
            var self = this, node = self._audioNode, index = self._audioNode.length;
            return node[index] = "undefined" == typeof ctx.createGain ? ctx.createGainNode() : ctx.createGain(), 
            node[index].gain.value = self._volume, node[index].paused = !0, node[index]._pos = 0, 
            node[index].readyState = 4, node[index].connect(masterGain), node[index].panner = ctx.createPanner(), 
            node[index].panner.panningModel = self._model || "equalpower", node[index].panner.setPosition(self._pos3d[0], self._pos3d[1], self._pos3d[2]), 
            node[index].panner.connect(node[index]), node[index];
        },
        on: function(event, fn) {
            var self = this, events = self["_on" + event];
            if ("function" == typeof fn) events.push(fn); else for (var i = 0; i < events.length; i++) fn ? events[i].call(self, fn) : events[i].call(self);
            return self;
        },
        off: function(event, fn) {
            var self = this, events = self["_on" + event], fnString = fn ? fn.toString() : null;
            if (fnString) {
                for (var i = 0; i < events.length; i++) if (fnString === events[i].toString()) {
                    events.splice(i, 1);
                    break;
                }
            } else self["_on" + event] = [];
            return self;
        },
        unload: function() {
            for (var self = this, nodes = self._audioNode, i = 0; i < self._audioNode.length; i++) nodes[i].paused || (self.stop(nodes[i].id), 
            self.on("end", nodes[i].id)), self._webAudio ? nodes[i].disconnect(0) : nodes[i].src = "";
            for (i = 0; i < self._onendTimer.length; i++) clearTimeout(self._onendTimer[i].timer);
            var index = Howler._howls.indexOf(self);
            null !== index && index >= 0 && Howler._howls.splice(index, 1), delete cache[self._src], 
            self = null;
        }
    }, usingWebAudio) var loadBuffer = function(obj, url) {
        if (url in cache) return obj._duration = cache[url].duration, void loadSound(obj);
        if (/^data:[^;]+;base64,/.test(url)) {
            for (var data = atob(url.split(",")[1]), dataView = new Uint8Array(data.length), i = 0; i < data.length; ++i) dataView[i] = data.charCodeAt(i);
            decodeAudioData(dataView.buffer, obj, url);
        } else {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, !0), xhr.responseType = "arraybuffer", xhr.onload = function() {
                decodeAudioData(xhr.response, obj, url);
            }, xhr.onerror = function() {
                obj._webAudio && (obj._buffer = !0, obj._webAudio = !1, obj._audioNode = [], delete obj._gainNode, 
                delete cache[url], obj.load());
            };
            try {
                xhr.send();
            } catch (e) {
                xhr.onerror();
            }
        }
    }, decodeAudioData = function(arraybuffer, obj, url) {
        ctx.decodeAudioData(arraybuffer, function(buffer) {
            buffer && (cache[url] = buffer, loadSound(obj, buffer));
        }, function() {
            obj.on("loaderror");
        });
    }, loadSound = function(obj, buffer) {
        obj._duration = buffer ? buffer.duration : obj._duration, 0 === Object.getOwnPropertyNames(obj._sprite).length && (obj._sprite = {
            _default: [ 0, 1e3 * obj._duration ]
        }), obj._loaded || (obj._loaded = !0, obj.on("load")), obj._autoplay && obj.play();
    }, refreshBuffer = function(obj, loop, id) {
        var node = obj._nodeById(id);
        node.bufferSource = ctx.createBufferSource(), node.bufferSource.buffer = cache[obj._src], 
        node.bufferSource.connect(node.panner), node.bufferSource.loop = loop[0], loop[0] && (node.bufferSource.loopStart = loop[1], 
        node.bufferSource.loopEnd = loop[1] + loop[2]), node.bufferSource.playbackRate.value = obj._rate;
    };
    "function" == typeof define && define.amd && define(function() {
        return {
            Howler: Howler,
            Howl: Howl
        };
    }), "undefined" != typeof exports && (exports.Howler = Howler, exports.Howl = Howl), 
    "undefined" != typeof window && (window.Howler = Howler, window.Howl = Howl);
}(), function(m, j) {
    function s(a, e) {
        for (var g in e) try {
            a.style[g] = e[g];
        } catch (j) {}
        return a;
    }
    function H(a) {
        return null == a ? String(a) : "object" == typeof a || "function" == typeof a ? Object.prototype.toString.call(a).match(/\s([a-z]+)/i)[1].toLowerCase() || "object" : typeof a;
    }
    function R(a, e) {
        if ("array" !== H(e)) return -1;
        if (e.indexOf) return e.indexOf(a);
        for (var g = 0, j = e.length; j > g; g++) if (e[g] === a) return g;
        return -1;
    }
    function I() {
        var e, a = arguments;
        for (e in a[1]) if (a[1].hasOwnProperty(e)) switch (H(a[1][e])) {
          case "object":
            a[0][e] = I({}, a[0][e], a[1][e]);
            break;

          case "array":
            a[0][e] = a[1][e].slice(0);
            break;

          default:
            a[0][e] = a[1][e];
        }
        return 2 < a.length ? I.apply(null, [ a[0] ].concat(Array.prototype.slice.call(a, 2))) : a[0];
    }
    function N(a) {
        return a = Math.round(255 * a).toString(16), 1 === a.length ? "0" + a : a;
    }
    function S(a, e, g, j) {
        a.addEventListener ? a[j ? "removeEventListener" : "addEventListener"](e, g, !1) : a.attachEvent && a[j ? "detachEvent" : "attachEvent"]("on" + e, g);
    }
    function D(a, e) {
        function g(a, b, d, c) {
            return y[0 | a][Math.round(Math.min((b - d) / (c - d) * J, J))];
        }
        function r() {
            f.legend.fps !== q && (f.legend.fps = q, f.legend[T] = q ? "FPS" : "ms"), K = q ? b.fps : b.duration, 
            f.count[T] = K > 999 ? "999+" : K.toFixed(K > 99 ? 0 : d.decimals);
        }
        function m() {
            for (z = A(), L < z - d.threshold && (b.fps -= b.fps / Math.max(1, 60 * d.smoothing / d.interval), 
            b.duration = 1e3 / b.fps), c = d.history; c--; ) E[c] = 0 === c ? b.fps : E[c - 1], 
            F[c] = 0 === c ? b.duration : F[c - 1];
            if (r(), d.heat) {
                if (w.length) for (c = w.length; c--; ) w[c].el.style[h[w[c].name].heatOn] = q ? g(h[w[c].name].heatmap, b.fps, 0, d.maxFps) : g(h[w[c].name].heatmap, b.duration, d.threshold, 0);
                if (f.graph && h.column.heatOn) for (c = u.length; c--; ) u[c].style[h.column.heatOn] = q ? g(h.column.heatmap, E[c], 0, d.maxFps) : g(h.column.heatmap, F[c], d.threshold, 0);
            }
            if (f.graph) for (p = 0; p < d.history; p++) u[p].style.height = (q ? E[p] ? Math.round(O / d.maxFps * Math.min(E[p], d.maxFps)) : 0 : F[p] ? Math.round(O / d.threshold * Math.min(F[p], d.threshold)) : 0) + "px";
        }
        function k() {
            20 > d.interval ? (x = M(k), m()) : (x = setTimeout(k, d.interval), P = M(m));
        }
        function G(a) {
            a = a || window.event, a.preventDefault ? (a.preventDefault(), a.stopPropagation()) : (a.returnValue = !1, 
            a.cancelBubble = !0), b.toggle();
        }
        function U() {
            d.toggleOn && S(f.container, d.toggleOn, G, 1), a.removeChild(f.container);
        }
        function V() {
            if (f.container && U(), h = D.theme[d.theme], y = h.compiledHeatmaps || [], !y.length && h.heatmaps.length) {
                for (p = 0; p < h.heatmaps.length; p++) for (y[p] = [], c = 0; J >= c; c++) {
                    var g, b = y[p], e = c;
                    g = .33 / J * c;
                    var j = h.heatmaps[p].saturation, m = h.heatmaps[p].lightness, n = void 0, k = void 0, l = void 0, t = l = void 0, v = n = k = void 0, v = void 0, l = .5 >= m ? m * (1 + j) : m + j - m * j;
                    0 === l ? g = "#000" : (t = 2 * m - l, k = (l - t) / l, g *= 6, n = Math.floor(g), 
                    v = g - n, v *= l * k, 0 === n || 6 === n ? (n = l, k = t + v, l = t) : 1 === n ? (n = l - v, 
                    k = l, l = t) : 2 === n ? (n = t, k = l, l = t + v) : 3 === n ? (n = t, k = l - v) : 4 === n ? (n = t + v, 
                    k = t) : (n = l, k = t, l -= v), g = "#" + N(n) + N(k) + N(l)), b[e] = g;
                }
                h.compiledHeatmaps = y;
            }
            f.container = s(document.createElement("div"), h.container), f.count = f.container.appendChild(s(document.createElement("div"), h.count)), 
            f.legend = f.container.appendChild(s(document.createElement("div"), h.legend)), 
            f.graph = d.graph ? f.container.appendChild(s(document.createElement("div"), h.graph)) : 0, 
            w.length = 0;
            for (var q in f) f[q] && h[q].heatOn && w.push({
                name: q,
                el: f[q]
            });
            if (u.length = 0, f.graph) for (f.graph.style.width = d.history * h.column.width + (d.history - 1) * h.column.spacing + "px", 
            c = 0; c < d.history; c++) u[c] = f.graph.appendChild(s(document.createElement("div"), h.column)), 
            u[c].style.position = "absolute", u[c].style.bottom = 0, u[c].style.right = c * h.column.width + c * h.column.spacing + "px", 
            u[c].style.width = h.column.width + "px", u[c].style.height = "0px";
            s(f.container, d), r(), a.appendChild(f.container), f.graph && (O = f.graph.clientHeight), 
            d.toggleOn && ("click" === d.toggleOn && (f.container.style.cursor = "pointer"), 
            S(f.container, d.toggleOn, G));
        }
        "object" === H(a) && a.nodeType === j && (e = a, a = document.body), a || (a = document.body);
        var h, y, z, x, P, O, K, c, p, b = this, d = I({}, D.defaults, e || {}), f = {}, u = [], J = 100, w = [], W = 0, B = d.threshold, Q = 0, L = A() - B, E = [], F = [], q = "fps" === d.show;
        b.options = d, b.fps = 0, b.duration = 0, b.isPaused = 0, b.tickStart = function() {
            Q = A();
        }, b.tick = function() {
            z = A(), W = z - L, B += (W - B) / d.smoothing, b.fps = 1e3 / B, b.duration = L > Q ? B : z - Q, 
            L = z;
        }, b.pause = function() {
            return x && (b.isPaused = 1, clearTimeout(x), C(x), C(P), x = P = 0), b;
        }, b.resume = function() {
            return x || (b.isPaused = 0, k()), b;
        }, b.set = function(a, c) {
            return d[a] = c, q = "fps" === d.show, -1 !== R(a, X) && V(), -1 !== R(a, Y) && s(f.container, d), 
            b;
        }, b.showDuration = function() {
            return b.set("show", "ms"), b;
        }, b.showFps = function() {
            return b.set("show", "fps"), b;
        }, b.toggle = function() {
            return b.set("show", q ? "ms" : "fps"), b;
        }, b.hide = function() {
            return b.pause(), f.container.style.display = "none", b;
        }, b.show = function() {
            return b.resume(), f.container.style.display = "block", b;
        }, b.destroy = function() {
            b.pause(), U(), b.tick = b.tickStart = function() {};
        }, V(), k();
    }
    var A, r = m.performance;
    A = r && (r.now || r.webkitNow) ? r[r.now ? "now" : "webkitNow"].bind(r) : function() {
        return +new Date();
    };
    for (var C = m.cancelAnimationFrame || m.cancelRequestAnimationFrame, M = m.requestAnimationFrame, r = [ "moz", "webkit", "o" ], G = 0, k = 0, Z = r.length; Z > k && !C; ++k) M = (C = m[r[k] + "CancelAnimationFrame"] || m[r[k] + "CancelRequestAnimationFrame"]) && m[r[k] + "RequestAnimationFrame"];
    C || (M = function(a) {
        var e = A(), g = Math.max(0, 16 - (e - G));
        return G = e + g, m.setTimeout(function() {
            a(e + g);
        }, g);
    }, C = function(a) {
        clearTimeout(a);
    });
    var T = "string" === H(document.createElement("div").textContent) ? "textContent" : "innerText";
    D.extend = I, window.FPSMeter = D, D.defaults = {
        interval: 100,
        smoothing: 10,
        show: "fps",
        toggleOn: "click",
        decimals: 1,
        maxFps: 60,
        threshold: 100,
        position: "absolute",
        zIndex: 10,
        left: "5px",
        top: "5px",
        right: "auto",
        bottom: "auto",
        margin: "0 0 0 0",
        theme: "dark",
        heat: 0,
        graph: 0,
        history: 20
    };
    var X = [ "toggleOn", "theme", "heat", "graph", "history" ], Y = "position zIndex left top right bottom margin".split(" ");
}(window), function(m, j) {
    j.theme = {};
    var s = j.theme.base = {
        heatmaps: [],
        container: {
            heatOn: null,
            heatmap: null,
            padding: "5px",
            minWidth: "95px",
            height: "30px",
            lineHeight: "30px",
            textAlign: "right",
            textShadow: "none"
        },
        count: {
            heatOn: null,
            heatmap: null,
            position: "absolute",
            top: 0,
            right: 0,
            padding: "5px 10px",
            height: "30px",
            fontSize: "24px",
            fontFamily: "Consolas, Andale Mono, monospace",
            zIndex: 2
        },
        legend: {
            heatOn: null,
            heatmap: null,
            position: "absolute",
            top: 0,
            left: 0,
            padding: "5px 10px",
            height: "30px",
            fontSize: "12px",
            lineHeight: "32px",
            fontFamily: "sans-serif",
            textAlign: "left",
            zIndex: 2
        },
        graph: {
            heatOn: null,
            heatmap: null,
            position: "relative",
            boxSizing: "padding-box",
            MozBoxSizing: "padding-box",
            height: "100%",
            zIndex: 1
        },
        column: {
            width: 4,
            spacing: 1,
            heatOn: null,
            heatmap: null
        }
    };
    j.theme.dark = j.extend({}, s, {
        heatmaps: [ {
            saturation: .8,
            lightness: .8
        } ],
        container: {
            background: "#222",
            color: "#fff",
            border: "1px solid #1a1a1a",
            textShadow: "1px 1px 0 #222"
        },
        count: {
            heatOn: "color"
        },
        column: {
            background: "#3f3f3f"
        }
    }), j.theme.light = j.extend({}, s, {
        heatmaps: [ {
            saturation: .5,
            lightness: .5
        } ],
        container: {
            color: "#666",
            background: "#fff",
            textShadow: "1px 1px 0 rgba(255,255,255,.5), -1px -1px 0 rgba(255,255,255,.5)",
            boxShadow: "0 0 0 1px rgba(0,0,0,.1)"
        },
        count: {
            heatOn: "color"
        },
        column: {
            background: "#eaeaea"
        }
    }), j.theme.colorful = j.extend({}, s, {
        heatmaps: [ {
            saturation: .5,
            lightness: .6
        } ],
        container: {
            heatOn: "backgroundColor",
            background: "#888",
            color: "#fff",
            textShadow: "1px 1px 0 rgba(0,0,0,.2)",
            boxShadow: "0 0 0 1px rgba(0,0,0,.1)"
        },
        column: {
            background: "#777",
            backgroundColor: "rgba(0,0,0,.2)"
        }
    }), j.theme.transparent = j.extend({}, s, {
        heatmaps: [ {
            saturation: .8,
            lightness: .5
        } ],
        container: {
            padding: 0,
            color: "#fff",
            textShadow: "1px 1px 0 rgba(0,0,0,.5)"
        },
        count: {
            padding: "0 5px",
            height: "40px",
            lineHeight: "40px"
        },
        legend: {
            padding: "0 5px",
            height: "40px",
            lineHeight: "42px"
        },
        graph: {
            height: "40px"
        },
        column: {
            width: 5,
            background: "#999",
            heatOn: "backgroundColor",
            opacity: .5
        }
    });
}(window, FPSMeter), function() {
    var a = this, b = b || {};
    b.WEBGL_RENDERER = 0, b.CANVAS_RENDERER = 1, b.VERSION = "v2.2.8", b.blendModes = {
        NORMAL: 0,
        ADD: 1,
        MULTIPLY: 2,
        SCREEN: 3,
        OVERLAY: 4,
        DARKEN: 5,
        LIGHTEN: 6,
        COLOR_DODGE: 7,
        COLOR_BURN: 8,
        HARD_LIGHT: 9,
        SOFT_LIGHT: 10,
        DIFFERENCE: 11,
        EXCLUSION: 12,
        HUE: 13,
        SATURATION: 14,
        COLOR: 15,
        LUMINOSITY: 16
    }, b.scaleModes = {
        DEFAULT: 0,
        LINEAR: 0,
        NEAREST: 1
    }, b._UID = 0, "undefined" != typeof Float32Array ? (b.Float32Array = Float32Array, 
    b.Uint16Array = Uint16Array, b.Uint32Array = Uint32Array, b.ArrayBuffer = ArrayBuffer) : (b.Float32Array = Array, 
    b.Uint16Array = Array), b.INTERACTION_FREQUENCY = 30, b.AUTO_PREVENT_DEFAULT = !0, 
    b.PI_2 = 2 * Math.PI, b.RAD_TO_DEG = 180 / Math.PI, b.DEG_TO_RAD = Math.PI / 180, 
    b.RETINA_PREFIX = "@2x", b.dontSayHello = !1, b.defaultRenderOptions = {
        view: null,
        transparent: !1,
        antialias: !1,
        preserveDrawingBuffer: !1,
        resolution: 1,
        clearBeforeRender: !0,
        autoResize: !1
    }, b.sayHello = function(a) {
        if (!b.dontSayHello) {
            if (navigator.userAgent.toLowerCase().indexOf("chrome") > -1) {
                var c = [ "%c %c %c Pixi.js " + b.VERSION + " - " + a + "  %c  %c  http://www.pixijs.com/  %c %c ♥%c♥%c♥ ", "background: #ff66a5", "background: #ff66a5", "color: #ff66a5; background: #030307;", "background: #ff66a5", "background: #ffc3dc", "background: #ff66a5", "color: #ff2424; background: #fff", "color: #ff2424; background: #fff", "color: #ff2424; background: #fff" ];
                console.log.apply(console, c);
            } else window.console && console.log("Pixi.js " + b.VERSION + " - http://www.pixijs.com/");
            b.dontSayHello = !0;
        }
    }, b.Point = function(a, b) {
        this.x = a || 0, this.y = b || 0;
    }, b.Point.prototype.clone = function() {
        return new b.Point(this.x, this.y);
    }, b.Point.prototype.set = function(a, b) {
        this.x = a || 0, this.y = b || (0 !== b ? this.x : 0);
    }, b.Point.prototype.constructor = b.Point, b.Rectangle = function(a, b, c, d) {
        this.x = a || 0, this.y = b || 0, this.width = c || 0, this.height = d || 0;
    }, b.Rectangle.prototype.clone = function() {
        return new b.Rectangle(this.x, this.y, this.width, this.height);
    }, b.Rectangle.prototype.contains = function(a, b) {
        if (this.width <= 0 || this.height <= 0) return !1;
        var c = this.x;
        if (a >= c && a <= c + this.width) {
            var d = this.y;
            if (b >= d && b <= d + this.height) return !0;
        }
        return !1;
    }, b.Rectangle.prototype.constructor = b.Rectangle, b.EmptyRectangle = new b.Rectangle(0, 0, 0, 0), 
    b.Polygon = function(a) {
        if (a instanceof Array || (a = Array.prototype.slice.call(arguments)), a[0] instanceof b.Point) {
            for (var c = [], d = 0, e = a.length; e > d; d++) c.push(a[d].x, a[d].y);
            a = c;
        }
        this.closed = !0, this.points = a;
    }, b.Polygon.prototype.clone = function() {
        var a = this.points.slice();
        return new b.Polygon(a);
    }, b.Polygon.prototype.contains = function(a, b) {
        for (var c = !1, d = this.points.length / 2, e = 0, f = d - 1; d > e; f = e++) {
            var g = this.points[2 * e], h = this.points[2 * e + 1], i = this.points[2 * f], j = this.points[2 * f + 1], k = h > b != j > b && (i - g) * (b - h) / (j - h) + g > a;
            k && (c = !c);
        }
        return c;
    }, b.Polygon.prototype.constructor = b.Polygon, b.Circle = function(a, b, c) {
        this.x = a || 0, this.y = b || 0, this.radius = c || 0;
    }, b.Circle.prototype.clone = function() {
        return new b.Circle(this.x, this.y, this.radius);
    }, b.Circle.prototype.contains = function(a, b) {
        if (this.radius <= 0) return !1;
        var c = this.x - a, d = this.y - b, e = this.radius * this.radius;
        return c *= c, d *= d, e >= c + d;
    }, b.Circle.prototype.getBounds = function() {
        return new b.Rectangle(this.x - this.radius, this.y - this.radius, 2 * this.radius, 2 * this.radius);
    }, b.Circle.prototype.constructor = b.Circle, b.Ellipse = function(a, b, c, d) {
        this.x = a || 0, this.y = b || 0, this.width = c || 0, this.height = d || 0;
    }, b.Ellipse.prototype.clone = function() {
        return new b.Ellipse(this.x, this.y, this.width, this.height);
    }, b.Ellipse.prototype.contains = function(a, b) {
        if (this.width <= 0 || this.height <= 0) return !1;
        var c = (a - this.x) / this.width, d = (b - this.y) / this.height;
        return c *= c, d *= d, 1 >= c + d;
    }, b.Ellipse.prototype.getBounds = function() {
        return new b.Rectangle(this.x - this.width, this.y - this.height, this.width, this.height);
    }, b.Ellipse.prototype.constructor = b.Ellipse, b.RoundedRectangle = function(a, b, c, d, e) {
        this.x = a || 0, this.y = b || 0, this.width = c || 0, this.height = d || 0, this.radius = e || 20;
    }, b.RoundedRectangle.prototype.clone = function() {
        return new b.RoundedRectangle(this.x, this.y, this.width, this.height, this.radius);
    }, b.RoundedRectangle.prototype.contains = function(a, b) {
        if (this.width <= 0 || this.height <= 0) return !1;
        var c = this.x;
        if (a >= c && a <= c + this.width) {
            var d = this.y;
            if (b >= d && b <= d + this.height) return !0;
        }
        return !1;
    }, b.RoundedRectangle.prototype.constructor = b.RoundedRectangle, b.Matrix = function() {
        this.a = 1, this.b = 0, this.c = 0, this.d = 1, this.tx = 0, this.ty = 0;
    }, b.Matrix.prototype.fromArray = function(a) {
        this.a = a[0], this.b = a[1], this.c = a[3], this.d = a[4], this.tx = a[2], this.ty = a[5];
    }, b.Matrix.prototype.toArray = function(a) {
        this.array || (this.array = new b.Float32Array(9));
        var c = this.array;
        return a ? (c[0] = this.a, c[1] = this.b, c[2] = 0, c[3] = this.c, c[4] = this.d, 
        c[5] = 0, c[6] = this.tx, c[7] = this.ty, c[8] = 1) : (c[0] = this.a, c[1] = this.c, 
        c[2] = this.tx, c[3] = this.b, c[4] = this.d, c[5] = this.ty, c[6] = 0, c[7] = 0, 
        c[8] = 1), c;
    }, b.Matrix.prototype.apply = function(a, c) {
        return c = c || new b.Point(), c.x = this.a * a.x + this.c * a.y + this.tx, c.y = this.b * a.x + this.d * a.y + this.ty, 
        c;
    }, b.Matrix.prototype.applyInverse = function(a, c) {
        c = c || new b.Point();
        var d = 1 / (this.a * this.d + this.c * -this.b);
        return c.x = this.d * d * a.x + -this.c * d * a.y + (this.ty * this.c - this.tx * this.d) * d, 
        c.y = this.a * d * a.y + -this.b * d * a.x + (-this.ty * this.a + this.tx * this.b) * d, 
        c;
    }, b.Matrix.prototype.translate = function(a, b) {
        return this.tx += a, this.ty += b, this;
    }, b.Matrix.prototype.scale = function(a, b) {
        return this.a *= a, this.d *= b, this.c *= a, this.b *= b, this.tx *= a, this.ty *= b, 
        this;
    }, b.Matrix.prototype.rotate = function(a) {
        var b = Math.cos(a), c = Math.sin(a), d = this.a, e = this.c, f = this.tx;
        return this.a = d * b - this.b * c, this.b = d * c + this.b * b, this.c = e * b - this.d * c, 
        this.d = e * c + this.d * b, this.tx = f * b - this.ty * c, this.ty = f * c + this.ty * b, 
        this;
    }, b.Matrix.prototype.append = function(a) {
        var b = this.a, c = this.b, d = this.c, e = this.d;
        return this.a = a.a * b + a.b * d, this.b = a.a * c + a.b * e, this.c = a.c * b + a.d * d, 
        this.d = a.c * c + a.d * e, this.tx = a.tx * b + a.ty * d + this.tx, this.ty = a.tx * c + a.ty * e + this.ty, 
        this;
    }, b.Matrix.prototype.identity = function() {
        return this.a = 1, this.b = 0, this.c = 0, this.d = 1, this.tx = 0, this.ty = 0, 
        this;
    }, b.identityMatrix = new b.Matrix(), b.DisplayObject = function() {
        this.position = new b.Point(), this.scale = new b.Point(1, 1), this.pivot = new b.Point(0, 0), 
        this.rotation = 0, this.alpha = 1, this.visible = !0, this.hitArea = null, this.buttonMode = !1, 
        this.renderable = !1, this.parent = null, this.stage = null, this.worldAlpha = 1, 
        this._interactive = !1, this.defaultCursor = "pointer", this.worldTransform = new b.Matrix(), 
        this._sr = 0, this._cr = 1, this.filterArea = null, this._bounds = new b.Rectangle(0, 0, 1, 1), 
        this._currentBounds = null, this._mask = null, this._cacheAsBitmap = !1, this._cacheIsDirty = !1;
    }, b.DisplayObject.prototype.constructor = b.DisplayObject, Object.defineProperty(b.DisplayObject.prototype, "interactive", {
        get: function() {
            return this._interactive;
        },
        set: function(a) {
            this._interactive = a, this.stage && (this.stage.dirty = !0);
        }
    }), Object.defineProperty(b.DisplayObject.prototype, "worldVisible", {
        get: function() {
            var a = this;
            do {
                if (!a.visible) return !1;
                a = a.parent;
            } while (a);
            return !0;
        }
    }), Object.defineProperty(b.DisplayObject.prototype, "mask", {
        get: function() {
            return this._mask;
        },
        set: function(a) {
            this._mask && (this._mask.isMask = !1), this._mask = a, this._mask && (this._mask.isMask = !0);
        }
    }), Object.defineProperty(b.DisplayObject.prototype, "filters", {
        get: function() {
            return this._filters;
        },
        set: function(a) {
            if (a) {
                for (var b = [], c = 0; c < a.length; c++) for (var d = a[c].passes, e = 0; e < d.length; e++) b.push(d[e]);
                this._filterBlock = {
                    target: this,
                    filterPasses: b
                };
            }
            this._filters = a;
        }
    }), Object.defineProperty(b.DisplayObject.prototype, "cacheAsBitmap", {
        get: function() {
            return this._cacheAsBitmap;
        },
        set: function(a) {
            this._cacheAsBitmap !== a && (a ? this._generateCachedSprite() : this._destroyCachedSprite(), 
            this._cacheAsBitmap = a);
        }
    }), b.DisplayObject.prototype.updateTransform = function() {
        var a, c, d, e, f, g, h = this.parent.worldTransform, i = this.worldTransform;
        this.rotation % b.PI_2 ? (this.rotation !== this.rotationCache && (this.rotationCache = this.rotation, 
        this._sr = Math.sin(this.rotation), this._cr = Math.cos(this.rotation)), a = this._cr * this.scale.x, 
        c = this._sr * this.scale.x, d = -this._sr * this.scale.y, e = this._cr * this.scale.y, 
        f = this.position.x, g = this.position.y, (this.pivot.x || this.pivot.y) && (f -= this.pivot.x * a + this.pivot.y * d, 
        g -= this.pivot.x * c + this.pivot.y * e), i.a = a * h.a + c * h.c, i.b = a * h.b + c * h.d, 
        i.c = d * h.a + e * h.c, i.d = d * h.b + e * h.d, i.tx = f * h.a + g * h.c + h.tx, 
        i.ty = f * h.b + g * h.d + h.ty) : (a = this.scale.x, e = this.scale.y, f = this.position.x - this.pivot.x * a, 
        g = this.position.y - this.pivot.y * e, i.a = a * h.a, i.b = a * h.b, i.c = e * h.c, 
        i.d = e * h.d, i.tx = f * h.a + g * h.c + h.tx, i.ty = f * h.b + g * h.d + h.ty), 
        this.worldAlpha = this.alpha * this.parent.worldAlpha;
    }, b.DisplayObject.prototype.displayObjectUpdateTransform = b.DisplayObject.prototype.updateTransform, 
    b.DisplayObject.prototype.getBounds = function(a) {
        return a = a, b.EmptyRectangle;
    }, b.DisplayObject.prototype.getLocalBounds = function() {
        return this.getBounds(b.identityMatrix);
    }, b.DisplayObject.prototype.setStageReference = function(a) {
        this.stage = a, this._interactive && (this.stage.dirty = !0);
    }, b.DisplayObject.prototype.generateTexture = function(a, c, d) {
        var e = this.getLocalBounds(), f = new b.RenderTexture(0 | e.width, 0 | e.height, d, c, a);
        return b.DisplayObject._tempMatrix.tx = -e.x, b.DisplayObject._tempMatrix.ty = -e.y, 
        f.render(this, b.DisplayObject._tempMatrix), f;
    }, b.DisplayObject.prototype.updateCache = function() {
        this._generateCachedSprite();
    }, b.DisplayObject.prototype.toGlobal = function(a) {
        return this.displayObjectUpdateTransform(), this.worldTransform.apply(a);
    }, b.DisplayObject.prototype.toLocal = function(a, b) {
        return b && (a = b.toGlobal(a)), this.displayObjectUpdateTransform(), this.worldTransform.applyInverse(a);
    }, b.DisplayObject.prototype._renderCachedSprite = function(a) {
        this._cachedSprite.worldAlpha = this.worldAlpha, a.gl ? b.Sprite.prototype._renderWebGL.call(this._cachedSprite, a) : b.Sprite.prototype._renderCanvas.call(this._cachedSprite, a);
    }, b.DisplayObject.prototype._generateCachedSprite = function() {
        this._cacheAsBitmap = !1;
        var a = this.getLocalBounds();
        if (this._cachedSprite) this._cachedSprite.texture.resize(0 | a.width, 0 | a.height); else {
            var c = new b.RenderTexture(0 | a.width, 0 | a.height);
            this._cachedSprite = new b.Sprite(c), this._cachedSprite.worldTransform = this.worldTransform;
        }
        var d = this._filters;
        this._filters = null, this._cachedSprite.filters = d, b.DisplayObject._tempMatrix.tx = -a.x, 
        b.DisplayObject._tempMatrix.ty = -a.y, this._cachedSprite.texture.render(this, b.DisplayObject._tempMatrix, !0), 
        this._cachedSprite.anchor.x = -(a.x / a.width), this._cachedSprite.anchor.y = -(a.y / a.height), 
        this._filters = d, this._cacheAsBitmap = !0;
    }, b.DisplayObject.prototype._destroyCachedSprite = function() {
        this._cachedSprite && (this._cachedSprite.texture.destroy(!0), this._cachedSprite = null);
    }, b.DisplayObject.prototype._renderWebGL = function(a) {
        a = a;
    }, b.DisplayObject.prototype._renderCanvas = function(a) {
        a = a;
    }, b.DisplayObject._tempMatrix = new b.Matrix(), Object.defineProperty(b.DisplayObject.prototype, "x", {
        get: function() {
            return this.position.x;
        },
        set: function(a) {
            this.position.x = a;
        }
    }), Object.defineProperty(b.DisplayObject.prototype, "y", {
        get: function() {
            return this.position.y;
        },
        set: function(a) {
            this.position.y = a;
        }
    }), b.DisplayObjectContainer = function() {
        b.DisplayObject.call(this), this.children = [];
    }, b.DisplayObjectContainer.prototype = Object.create(b.DisplayObject.prototype), 
    b.DisplayObjectContainer.prototype.constructor = b.DisplayObjectContainer, Object.defineProperty(b.DisplayObjectContainer.prototype, "width", {
        get: function() {
            return this.scale.x * this.getLocalBounds().width;
        },
        set: function(a) {
            var b = this.getLocalBounds().width;
            this.scale.x = 0 !== b ? a / b : 1, this._width = a;
        }
    }), Object.defineProperty(b.DisplayObjectContainer.prototype, "height", {
        get: function() {
            return this.scale.y * this.getLocalBounds().height;
        },
        set: function(a) {
            var b = this.getLocalBounds().height;
            this.scale.y = 0 !== b ? a / b : 1, this._height = a;
        }
    }), b.DisplayObjectContainer.prototype.addChild = function(a) {
        return this.addChildAt(a, this.children.length);
    }, b.DisplayObjectContainer.prototype.addChildAt = function(a, b) {
        if (b >= 0 && b <= this.children.length) return a.parent && a.parent.removeChild(a), 
        a.parent = this, this.children.splice(b, 0, a), this.stage && a.setStageReference(this.stage), 
        a;
        throw new Error(a + "addChildAt: The index " + b + " supplied is out of bounds " + this.children.length);
    }, b.DisplayObjectContainer.prototype.swapChildren = function(a, b) {
        if (a !== b) {
            var c = this.getChildIndex(a), d = this.getChildIndex(b);
            if (0 > c || 0 > d) throw new Error("swapChildren: Both the supplied DisplayObjects must be a child of the caller.");
            this.children[c] = b, this.children[d] = a;
        }
    }, b.DisplayObjectContainer.prototype.getChildIndex = function(a) {
        var b = this.children.indexOf(a);
        if (-1 === b) throw new Error("The supplied DisplayObject must be a child of the caller");
        return b;
    }, b.DisplayObjectContainer.prototype.setChildIndex = function(a, b) {
        if (0 > b || b >= this.children.length) throw new Error("The supplied index is out of bounds");
        var c = this.getChildIndex(a);
        this.children.splice(c, 1), this.children.splice(b, 0, a);
    }, b.DisplayObjectContainer.prototype.getChildAt = function(a) {
        if (0 > a || a >= this.children.length) throw new Error("getChildAt: Supplied index " + a + " does not exist in the child list, or the supplied DisplayObject must be a child of the caller");
        return this.children[a];
    }, b.DisplayObjectContainer.prototype.removeChild = function(a) {
        var b = this.children.indexOf(a);
        return -1 !== b ? this.removeChildAt(b) : void 0;
    }, b.DisplayObjectContainer.prototype.removeChildAt = function(a) {
        var b = this.getChildAt(a);
        return this.stage && b.removeStageReference(), b.parent = void 0, this.children.splice(a, 1), 
        b;
    }, b.DisplayObjectContainer.prototype.removeChildren = function(a, b) {
        var c = a || 0, d = "number" == typeof b ? b : this.children.length, e = d - c;
        if (e > 0 && d >= e) {
            for (var f = this.children.splice(c, e), g = 0; g < f.length; g++) {
                var h = f[g];
                this.stage && h.removeStageReference(), h.parent = void 0;
            }
            return f;
        }
        if (0 === e && 0 === this.children.length) return [];
        throw new Error("removeChildren: Range Error, numeric values are outside the acceptable range");
    }, b.DisplayObjectContainer.prototype.updateTransform = function() {
        if (this.visible && (this.displayObjectUpdateTransform(), !this._cacheAsBitmap)) for (var a = 0, b = this.children.length; b > a; a++) this.children[a].updateTransform();
    }, b.DisplayObjectContainer.prototype.displayObjectContainerUpdateTransform = b.DisplayObjectContainer.prototype.updateTransform, 
    b.DisplayObjectContainer.prototype.getBounds = function() {
        if (0 === this.children.length) return b.EmptyRectangle;
        for (var a, c, d, e = 1 / 0, f = 1 / 0, g = -(1 / 0), h = -(1 / 0), i = !1, j = 0, k = this.children.length; k > j; j++) {
            var l = this.children[j];
            l.visible && (i = !0, a = this.children[j].getBounds(), e = e < a.x ? e : a.x, f = f < a.y ? f : a.y, 
            c = a.width + a.x, d = a.height + a.y, g = g > c ? g : c, h = h > d ? h : d);
        }
        if (!i) return b.EmptyRectangle;
        var m = this._bounds;
        return m.x = e, m.y = f, m.width = g - e, m.height = h - f, m;
    }, b.DisplayObjectContainer.prototype.getLocalBounds = function() {
        var a = this.worldTransform;
        this.worldTransform = b.identityMatrix;
        for (var c = 0, d = this.children.length; d > c; c++) this.children[c].updateTransform();
        var e = this.getBounds();
        return this.worldTransform = a, e;
    }, b.DisplayObjectContainer.prototype.setStageReference = function(a) {
        this.stage = a, this._interactive && (this.stage.dirty = !0);
        for (var b = 0, c = this.children.length; c > b; b++) {
            var d = this.children[b];
            d.setStageReference(a);
        }
    }, b.DisplayObjectContainer.prototype.removeStageReference = function() {
        for (var a = 0, b = this.children.length; b > a; a++) {
            var c = this.children[a];
            c.removeStageReference();
        }
        this._interactive && (this.stage.dirty = !0), this.stage = null;
    }, b.DisplayObjectContainer.prototype._renderWebGL = function(a) {
        if (this.visible && !(this.alpha <= 0)) {
            if (this._cacheAsBitmap) return void this._renderCachedSprite(a);
            var b, c;
            if (this._mask || this._filters) {
                for (this._filters && (a.spriteBatch.flush(), a.filterManager.pushFilter(this._filterBlock)), 
                this._mask && (a.spriteBatch.stop(), a.maskManager.pushMask(this.mask, a), a.spriteBatch.start()), 
                b = 0, c = this.children.length; c > b; b++) this.children[b]._renderWebGL(a);
                a.spriteBatch.stop(), this._mask && a.maskManager.popMask(this._mask, a), this._filters && a.filterManager.popFilter(), 
                a.spriteBatch.start();
            } else for (b = 0, c = this.children.length; c > b; b++) this.children[b]._renderWebGL(a);
        }
    }, b.DisplayObjectContainer.prototype._renderCanvas = function(a) {
        if (this.visible !== !1 && 0 !== this.alpha) {
            if (this._cacheAsBitmap) return void this._renderCachedSprite(a);
            this._mask && a.maskManager.pushMask(this._mask, a);
            for (var b = 0, c = this.children.length; c > b; b++) {
                var d = this.children[b];
                d._renderCanvas(a);
            }
            this._mask && a.maskManager.popMask(a);
        }
    }, b.Sprite = function(a) {
        b.DisplayObjectContainer.call(this), this.anchor = new b.Point(), this.texture = a || b.Texture.emptyTexture, 
        this._width = 0, this._height = 0, this.tint = 16777215, this.blendMode = b.blendModes.NORMAL, 
        this.shader = null, this.texture.baseTexture.hasLoaded ? this.onTextureUpdate() : this.texture.on("update", this.onTextureUpdate.bind(this)), 
        this.renderable = !0;
    }, b.Sprite.prototype = Object.create(b.DisplayObjectContainer.prototype), b.Sprite.prototype.constructor = b.Sprite, 
    Object.defineProperty(b.Sprite.prototype, "width", {
        get: function() {
            return this.scale.x * this.texture.frame.width;
        },
        set: function(a) {
            this.scale.x = a / this.texture.frame.width, this._width = a;
        }
    }), Object.defineProperty(b.Sprite.prototype, "height", {
        get: function() {
            return this.scale.y * this.texture.frame.height;
        },
        set: function(a) {
            this.scale.y = a / this.texture.frame.height, this._height = a;
        }
    }), b.Sprite.prototype.setTexture = function(a) {
        this.texture = a, this.cachedTint = 16777215;
    }, b.Sprite.prototype.onTextureUpdate = function() {
        this._width && (this.scale.x = this._width / this.texture.frame.width), this._height && (this.scale.y = this._height / this.texture.frame.height);
    }, b.Sprite.prototype.getBounds = function(a) {
        var b = this.texture.frame.width, c = this.texture.frame.height, d = b * (1 - this.anchor.x), e = b * -this.anchor.x, f = c * (1 - this.anchor.y), g = c * -this.anchor.y, h = a || this.worldTransform, i = h.a, j = h.b, k = h.c, l = h.d, m = h.tx, n = h.ty, o = -(1 / 0), p = -(1 / 0), q = 1 / 0, r = 1 / 0;
        if (0 === j && 0 === k) 0 > i && (i *= -1), 0 > l && (l *= -1), q = i * e + m, o = i * d + m, 
        r = l * g + n, p = l * f + n; else {
            var s = i * e + k * g + m, t = l * g + j * e + n, u = i * d + k * g + m, v = l * g + j * d + n, w = i * d + k * f + m, x = l * f + j * d + n, y = i * e + k * f + m, z = l * f + j * e + n;
            q = q > s ? s : q, q = q > u ? u : q, q = q > w ? w : q, q = q > y ? y : q, r = r > t ? t : r, 
            r = r > v ? v : r, r = r > x ? x : r, r = r > z ? z : r, o = s > o ? s : o, o = u > o ? u : o, 
            o = w > o ? w : o, o = y > o ? y : o, p = t > p ? t : p, p = v > p ? v : p, p = x > p ? x : p, 
            p = z > p ? z : p;
        }
        var A = this._bounds;
        return A.x = q, A.width = o - q, A.y = r, A.height = p - r, this._currentBounds = A, 
        A;
    }, b.Sprite.prototype._renderWebGL = function(a) {
        if (this.visible && !(this.alpha <= 0)) {
            var b, c;
            if (this._mask || this._filters) {
                var d = a.spriteBatch;
                for (this._filters && (d.flush(), a.filterManager.pushFilter(this._filterBlock)), 
                this._mask && (d.stop(), a.maskManager.pushMask(this.mask, a), d.start()), d.render(this), 
                b = 0, c = this.children.length; c > b; b++) this.children[b]._renderWebGL(a);
                d.stop(), this._mask && a.maskManager.popMask(this._mask, a), this._filters && a.filterManager.popFilter(), 
                d.start();
            } else for (a.spriteBatch.render(this), b = 0, c = this.children.length; c > b; b++) this.children[b]._renderWebGL(a);
        }
    }, b.Sprite.prototype._renderCanvas = function(a) {
        if (!(this.visible === !1 || 0 === this.alpha || this.texture.crop.width <= 0 || this.texture.crop.height <= 0)) {
            if (this.blendMode !== a.currentBlendMode && (a.currentBlendMode = this.blendMode, 
            a.context.globalCompositeOperation = b.blendModesCanvas[a.currentBlendMode]), this._mask && a.maskManager.pushMask(this._mask, a), 
            this.texture.valid) {
                var c = this.texture.baseTexture.resolution / a.resolution;
                a.context.globalAlpha = this.worldAlpha, a.smoothProperty && a.scaleMode !== this.texture.baseTexture.scaleMode && (a.scaleMode = this.texture.baseTexture.scaleMode, 
                a.context[a.smoothProperty] = a.scaleMode === b.scaleModes.LINEAR);
                var d = this.texture.trim ? this.texture.trim.x - this.anchor.x * this.texture.trim.width : this.anchor.x * -this.texture.frame.width, e = this.texture.trim ? this.texture.trim.y - this.anchor.y * this.texture.trim.height : this.anchor.y * -this.texture.frame.height;
                a.roundPixels ? (a.context.setTransform(this.worldTransform.a, this.worldTransform.b, this.worldTransform.c, this.worldTransform.d, this.worldTransform.tx * a.resolution | 0, this.worldTransform.ty * a.resolution | 0), 
                d = 0 | d, e = 0 | e) : a.context.setTransform(this.worldTransform.a, this.worldTransform.b, this.worldTransform.c, this.worldTransform.d, this.worldTransform.tx * a.resolution, this.worldTransform.ty * a.resolution), 
                16777215 !== this.tint ? (this.cachedTint !== this.tint && (this.cachedTint = this.tint, 
                this.tintedTexture = b.CanvasTinter.getTintedTexture(this, this.tint)), a.context.drawImage(this.tintedTexture, 0, 0, this.texture.crop.width, this.texture.crop.height, d / c, e / c, this.texture.crop.width / c, this.texture.crop.height / c)) : a.context.drawImage(this.texture.baseTexture.source, this.texture.crop.x, this.texture.crop.y, this.texture.crop.width, this.texture.crop.height, d / c, e / c, this.texture.crop.width / c, this.texture.crop.height / c);
            }
            for (var f = 0, g = this.children.length; g > f; f++) this.children[f]._renderCanvas(a);
            this._mask && a.maskManager.popMask(a);
        }
    }, b.Sprite.fromFrame = function(a) {
        var c = b.TextureCache[a];
        if (!c) throw new Error('The frameId "' + a + '" does not exist in the texture cache' + this);
        return new b.Sprite(c);
    }, b.Sprite.fromImage = function(a, c, d) {
        var e = b.Texture.fromImage(a, c, d);
        return new b.Sprite(e);
    }, b.SpriteBatch = function(a) {
        b.DisplayObjectContainer.call(this), this.textureThing = a, this.ready = !1;
    }, b.SpriteBatch.prototype = Object.create(b.DisplayObjectContainer.prototype), 
    b.SpriteBatch.prototype.constructor = b.SpriteBatch, b.SpriteBatch.prototype.initWebGL = function(a) {
        this.fastSpriteBatch = new b.WebGLFastSpriteBatch(a), this.ready = !0;
    }, b.SpriteBatch.prototype.updateTransform = function() {
        this.displayObjectUpdateTransform();
    }, b.SpriteBatch.prototype._renderWebGL = function(a) {
        !this.visible || this.alpha <= 0 || !this.children.length || (this.ready || this.initWebGL(a.gl), 
        this.fastSpriteBatch.gl !== a.gl && this.fastSpriteBatch.setContext(a.gl), a.spriteBatch.stop(), 
        a.shaderManager.setShader(a.shaderManager.fastShader), this.fastSpriteBatch.begin(this, a), 
        this.fastSpriteBatch.render(this), a.spriteBatch.start());
    }, b.SpriteBatch.prototype._renderCanvas = function(a) {
        if (this.visible && !(this.alpha <= 0) && this.children.length) {
            var b = a.context;
            b.globalAlpha = this.worldAlpha, this.displayObjectUpdateTransform();
            for (var c = this.worldTransform, d = !0, e = 0; e < this.children.length; e++) {
                var f = this.children[e];
                if (f.visible) {
                    var g = f.texture, h = g.frame;
                    if (b.globalAlpha = this.worldAlpha * f.alpha, f.rotation % (2 * Math.PI) === 0) d && (b.setTransform(c.a, c.b, c.c, c.d, c.tx, c.ty), 
                    d = !1), b.drawImage(g.baseTexture.source, h.x, h.y, h.width, h.height, f.anchor.x * -h.width * f.scale.x + f.position.x + .5 | 0, f.anchor.y * -h.height * f.scale.y + f.position.y + .5 | 0, h.width * f.scale.x, h.height * f.scale.y); else {
                        d || (d = !0), f.displayObjectUpdateTransform();
                        var i = f.worldTransform;
                        a.roundPixels ? b.setTransform(i.a, i.b, i.c, i.d, 0 | i.tx, 0 | i.ty) : b.setTransform(i.a, i.b, i.c, i.d, i.tx, i.ty), 
                        b.drawImage(g.baseTexture.source, h.x, h.y, h.width, h.height, f.anchor.x * -h.width + .5 | 0, f.anchor.y * -h.height + .5 | 0, h.width, h.height);
                    }
                }
            }
        }
    }, b.MovieClip = function(a) {
        b.Sprite.call(this, a[0]), this.textures = a, this.animationSpeed = 1, this.loop = !0, 
        this.onComplete = null, this.currentFrame = 0, this.playing = !1;
    }, b.MovieClip.prototype = Object.create(b.Sprite.prototype), b.MovieClip.prototype.constructor = b.MovieClip, 
    Object.defineProperty(b.MovieClip.prototype, "totalFrames", {
        get: function() {
            return this.textures.length;
        }
    }), b.MovieClip.prototype.stop = function() {
        this.playing = !1;
    }, b.MovieClip.prototype.play = function() {
        this.playing = !0;
    }, b.MovieClip.prototype.gotoAndStop = function(a) {
        this.playing = !1, this.currentFrame = a;
        var b = this.currentFrame + .5 | 0;
        this.setTexture(this.textures[b % this.textures.length]);
    }, b.MovieClip.prototype.gotoAndPlay = function(a) {
        this.currentFrame = a, this.playing = !0;
    }, b.MovieClip.prototype.updateTransform = function() {
        if (this.displayObjectContainerUpdateTransform(), this.playing) {
            this.currentFrame += this.animationSpeed;
            var a = this.currentFrame + .5 | 0;
            this.currentFrame = this.currentFrame % this.textures.length, this.loop || a < this.textures.length ? this.setTexture(this.textures[a % this.textures.length]) : a >= this.textures.length && (this.gotoAndStop(this.textures.length - 1), 
            this.onComplete && this.onComplete());
        }
    }, b.MovieClip.fromFrames = function(a) {
        for (var c = [], d = 0; d < a.length; d++) c.push(new b.Texture.fromFrame(a[d]));
        return new b.MovieClip(c);
    }, b.MovieClip.fromImages = function(a) {
        for (var c = [], d = 0; d < a.length; d++) c.push(new b.Texture.fromImage(a[d]));
        return new b.MovieClip(c);
    }, b.FilterBlock = function() {
        this.visible = !0, this.renderable = !0;
    }, b.FilterBlock.prototype.constructor = b.FilterBlock, b.Text = function(a, c) {
        this.canvas = document.createElement("canvas"), this.context = this.canvas.getContext("2d"), 
        this.resolution = 1, b.Sprite.call(this, b.Texture.fromCanvas(this.canvas)), this.setText(a), 
        this.setStyle(c);
    }, b.Text.prototype = Object.create(b.Sprite.prototype), b.Text.prototype.constructor = b.Text, 
    Object.defineProperty(b.Text.prototype, "width", {
        get: function() {
            return this.dirty && (this.updateText(), this.dirty = !1), this.scale.x * this.texture.frame.width;
        },
        set: function(a) {
            this.scale.x = a / this.texture.frame.width, this._width = a;
        }
    }), Object.defineProperty(b.Text.prototype, "height", {
        get: function() {
            return this.dirty && (this.updateText(), this.dirty = !1), this.scale.y * this.texture.frame.height;
        },
        set: function(a) {
            this.scale.y = a / this.texture.frame.height, this._height = a;
        }
    }), b.Text.prototype.setStyle = function(a) {
        a = a || {}, a.font = a.font || "bold 20pt Arial", a.fill = a.fill || "black", a.align = a.align || "left", 
        a.stroke = a.stroke || "black", a.strokeThickness = a.strokeThickness || 0, a.wordWrap = a.wordWrap || !1, 
        a.wordWrapWidth = a.wordWrapWidth || 100, a.dropShadow = a.dropShadow || !1, a.dropShadowAngle = a.dropShadowAngle || Math.PI / 6, 
        a.dropShadowDistance = a.dropShadowDistance || 4, a.dropShadowColor = a.dropShadowColor || "black", 
        a.lineJoin = a.lineJoin || "miter", this.style = a, this.dirty = !0;
    }, b.Text.prototype.setText = function(a) {
        this.text = a.toString() || " ", this.dirty = !0;
    }, b.Text.prototype.updateText = function() {
        this.texture.baseTexture.resolution = this.resolution, this.context.font = this.style.font;
        var a = this.text;
        this.style.wordWrap && (a = this.wordWrap(this.text));
        for (var b = a.split(/(?:\r\n|\r|\n)/), c = [], d = 0, e = this.determineFontProperties(this.style.font), f = 0; f < b.length; f++) {
            var g = this.context.measureText(b[f]).width;
            c[f] = g, d = Math.max(d, g);
        }
        var h = d + this.style.strokeThickness;
        this.style.dropShadow && (h += this.style.dropShadowDistance), this.canvas.width = (h + this.context.lineWidth) * this.resolution;
        var i = e.fontSize + this.style.strokeThickness, j = i * b.length;
        this.style.dropShadow && (j += this.style.dropShadowDistance), this.canvas.height = j * this.resolution, 
        this.context.scale(this.resolution, this.resolution), navigator.isCocoonJS && this.context.clearRect(0, 0, this.canvas.width, this.canvas.height), 
        this.context.font = this.style.font, this.context.strokeStyle = this.style.stroke, 
        this.context.lineWidth = this.style.strokeThickness, this.context.textBaseline = "alphabetic", 
        this.context.lineJoin = this.style.lineJoin;
        var k, l;
        if (this.style.dropShadow) {
            this.context.fillStyle = this.style.dropShadowColor;
            var m = Math.sin(this.style.dropShadowAngle) * this.style.dropShadowDistance, n = Math.cos(this.style.dropShadowAngle) * this.style.dropShadowDistance;
            for (f = 0; f < b.length; f++) k = this.style.strokeThickness / 2, l = this.style.strokeThickness / 2 + f * i + e.ascent, 
            "right" === this.style.align ? k += d - c[f] : "center" === this.style.align && (k += (d - c[f]) / 2), 
            this.style.fill && this.context.fillText(b[f], k + m, l + n);
        }
        for (this.context.fillStyle = this.style.fill, f = 0; f < b.length; f++) k = this.style.strokeThickness / 2, 
        l = this.style.strokeThickness / 2 + f * i + e.ascent, "right" === this.style.align ? k += d - c[f] : "center" === this.style.align && (k += (d - c[f]) / 2), 
        this.style.stroke && this.style.strokeThickness && this.context.strokeText(b[f], k, l), 
        this.style.fill && this.context.fillText(b[f], k, l);
        this.updateTexture();
    }, b.Text.prototype.updateTexture = function() {
        this.texture.baseTexture.width = this.canvas.width, this.texture.baseTexture.height = this.canvas.height, 
        this.texture.crop.width = this.texture.frame.width = this.canvas.width, this.texture.crop.height = this.texture.frame.height = this.canvas.height, 
        this._width = this.canvas.width, this._height = this.canvas.height, this.texture.baseTexture.dirty();
    }, b.Text.prototype._renderWebGL = function(a) {
        this.dirty && (this.resolution = a.resolution, this.updateText(), this.dirty = !1), 
        b.Sprite.prototype._renderWebGL.call(this, a);
    }, b.Text.prototype._renderCanvas = function(a) {
        this.dirty && (this.resolution = a.resolution, this.updateText(), this.dirty = !1), 
        b.Sprite.prototype._renderCanvas.call(this, a);
    }, b.Text.prototype.determineFontProperties = function(a) {
        var c = b.Text.fontPropertiesCache[a];
        if (!c) {
            c = {};
            var d = b.Text.fontPropertiesCanvas, e = b.Text.fontPropertiesContext;
            e.font = a;
            var f = Math.ceil(e.measureText("|Mq").width), g = Math.ceil(e.measureText("M").width), h = 2 * g;
            g = 1.4 * g | 0, d.width = f, d.height = h, e.fillStyle = "#f00", e.fillRect(0, 0, f, h), 
            e.font = a, e.textBaseline = "alphabetic", e.fillStyle = "#000", e.fillText("|MÉq", 0, g);
            var i, j, k = e.getImageData(0, 0, f, h).data, l = k.length, m = 4 * f, n = 0, o = !1;
            for (i = 0; g > i; i++) {
                for (j = 0; m > j; j += 4) if (255 !== k[n + j]) {
                    o = !0;
                    break;
                }
                if (o) break;
                n += m;
            }
            for (c.ascent = g - i, n = l - m, o = !1, i = h; i > g; i--) {
                for (j = 0; m > j; j += 4) if (255 !== k[n + j]) {
                    o = !0;
                    break;
                }
                if (o) break;
                n -= m;
            }
            c.descent = i - g, c.descent += 6, c.fontSize = c.ascent + c.descent, b.Text.fontPropertiesCache[a] = c;
        }
        return c;
    }, b.Text.prototype.wordWrap = function(a) {
        for (var b = "", c = a.split("\n"), d = 0; d < c.length; d++) {
            for (var e = this.style.wordWrapWidth, f = c[d].split(" "), g = 0; g < f.length; g++) {
                var h = this.context.measureText(f[g]).width, i = h + this.context.measureText(" ").width;
                0 === g || i > e ? (g > 0 && (b += "\n"), b += f[g], e = this.style.wordWrapWidth - h) : (e -= i, 
                b += " " + f[g]);
            }
            d < c.length - 1 && (b += "\n");
        }
        return b;
    }, b.Text.prototype.getBounds = function(a) {
        return this.dirty && (this.updateText(), this.dirty = !1), b.Sprite.prototype.getBounds.call(this, a);
    }, b.Text.prototype.destroy = function(a) {
        this.context = null, this.canvas = null, this.texture.destroy(void 0 === a ? !0 : a);
    }, b.Text.fontPropertiesCache = {}, b.Text.fontPropertiesCanvas = document.createElement("canvas"), 
    b.Text.fontPropertiesContext = b.Text.fontPropertiesCanvas.getContext("2d"), b.BitmapText = function(a, c) {
        b.DisplayObjectContainer.call(this), this.textWidth = 0, this.textHeight = 0, this._pool = [], 
        this.setText(a), this.setStyle(c), this.updateText(), this.dirty = !1;
    }, b.BitmapText.prototype = Object.create(b.DisplayObjectContainer.prototype), b.BitmapText.prototype.constructor = b.BitmapText, 
    b.BitmapText.prototype.setText = function(a) {
        this.text = a || " ", this.dirty = !0;
    }, b.BitmapText.prototype.setStyle = function(a) {
        a = a || {}, a.align = a.align || "left", this.style = a;
        var c = a.font.split(" ");
        this.fontName = c[c.length - 1], this.fontSize = c.length >= 2 ? parseInt(c[c.length - 2], 10) : b.BitmapText.fonts[this.fontName].size, 
        this.dirty = !0, this.tint = a.tint;
    }, b.BitmapText.prototype.updateText = function() {
        for (var a = b.BitmapText.fonts[this.fontName], c = new b.Point(), d = null, e = [], f = 0, g = [], h = 0, i = this.fontSize / a.size, j = 0; j < this.text.length; j++) {
            var k = this.text.charCodeAt(j);
            if (/(?:\r\n|\r|\n)/.test(this.text.charAt(j))) g.push(c.x), f = Math.max(f, c.x), 
            h++, c.x = 0, c.y += a.lineHeight, d = null; else {
                var l = a.chars[k];
                l && (d && l.kerning[d] && (c.x += l.kerning[d]), e.push({
                    texture: l.texture,
                    line: h,
                    charCode: k,
                    position: new b.Point(c.x + l.xOffset, c.y + l.yOffset)
                }), c.x += l.xAdvance, d = k);
            }
        }
        g.push(c.x), f = Math.max(f, c.x);
        var m = [];
        for (j = 0; h >= j; j++) {
            var n = 0;
            "right" === this.style.align ? n = f - g[j] : "center" === this.style.align && (n = (f - g[j]) / 2), 
            m.push(n);
        }
        var o = this.children.length, p = e.length, q = this.tint || 16777215;
        for (j = 0; p > j; j++) {
            var r = o > j ? this.children[j] : this._pool.pop();
            r ? r.setTexture(e[j].texture) : r = new b.Sprite(e[j].texture), r.position.x = (e[j].position.x + m[e[j].line]) * i, 
            r.position.y = e[j].position.y * i, r.scale.x = r.scale.y = i, r.tint = q, r.parent || this.addChild(r);
        }
        for (;this.children.length > p; ) {
            var s = this.getChildAt(this.children.length - 1);
            this._pool.push(s), this.removeChild(s);
        }
        this.textWidth = f * i, this.textHeight = (c.y + a.lineHeight) * i;
    }, b.BitmapText.prototype.updateTransform = function() {
        this.dirty && (this.updateText(), this.dirty = !1), b.DisplayObjectContainer.prototype.updateTransform.call(this);
    }, b.BitmapText.fonts = {}, b.InteractionData = function() {
        this.global = new b.Point(), this.target = null, this.originalEvent = null;
    }, b.InteractionData.prototype.getLocalPosition = function(a, c, d) {
        var e = a.worldTransform, f = d ? d : this.global, g = e.a, h = e.c, i = e.tx, j = e.b, k = e.d, l = e.ty, m = 1 / (g * k + h * -j);
        return c = c || new b.Point(), c.x = k * m * f.x + -h * m * f.y + (l * h - i * k) * m, 
        c.y = g * m * f.y + -j * m * f.x + (-l * g + i * j) * m, c;
    }, b.InteractionData.prototype.constructor = b.InteractionData, b.InteractionManager = function(a) {
        this.stage = a, this.mouse = new b.InteractionData(), this.touches = {}, this.tempPoint = new b.Point(), 
        this.mouseoverEnabled = !0, this.pool = [], this.interactiveItems = [], this.interactionDOMElement = null, 
        this.onMouseMove = this.onMouseMove.bind(this), this.onMouseDown = this.onMouseDown.bind(this), 
        this.onMouseOut = this.onMouseOut.bind(this), this.onMouseUp = this.onMouseUp.bind(this), 
        this.onTouchStart = this.onTouchStart.bind(this), this.onTouchEnd = this.onTouchEnd.bind(this), 
        this.onTouchCancel = this.onTouchCancel.bind(this), this.onTouchMove = this.onTouchMove.bind(this), 
        this.last = 0, this.currentCursorStyle = "inherit", this.mouseOut = !1, this.resolution = 1, 
        this._tempPoint = new b.Point();
    }, b.InteractionManager.prototype.constructor = b.InteractionManager, b.InteractionManager.prototype.collectInteractiveSprite = function(a, b) {
        for (var c = a.children, d = c.length, e = d - 1; e >= 0; e--) {
            var f = c[e];
            f._interactive ? (b.interactiveChildren = !0, this.interactiveItems.push(f), f.children.length > 0 && this.collectInteractiveSprite(f, f)) : (f.__iParent = null, 
            f.children.length > 0 && this.collectInteractiveSprite(f, b));
        }
    }, b.InteractionManager.prototype.setTarget = function(a) {
        this.target = a, this.resolution = a.resolution, null === this.interactionDOMElement && this.setTargetDomElement(a.view);
    }, b.InteractionManager.prototype.setTargetDomElement = function(a) {
        this.removeEvents(), window.navigator.msPointerEnabled && (a.style["-ms-content-zooming"] = "none", 
        a.style["-ms-touch-action"] = "none"), this.interactionDOMElement = a, a.addEventListener("mousemove", this.onMouseMove, !0), 
        a.addEventListener("mousedown", this.onMouseDown, !0), a.addEventListener("mouseout", this.onMouseOut, !0), 
        a.addEventListener("touchstart", this.onTouchStart, !0), a.addEventListener("touchend", this.onTouchEnd, !0), 
        a.addEventListener("touchleave", this.onTouchCancel, !0), a.addEventListener("touchcancel", this.onTouchCancel, !0), 
        a.addEventListener("touchmove", this.onTouchMove, !0), window.addEventListener("mouseup", this.onMouseUp, !0);
    }, b.InteractionManager.prototype.removeEvents = function() {
        this.interactionDOMElement && (this.interactionDOMElement.style["-ms-content-zooming"] = "", 
        this.interactionDOMElement.style["-ms-touch-action"] = "", this.interactionDOMElement.removeEventListener("mousemove", this.onMouseMove, !0), 
        this.interactionDOMElement.removeEventListener("mousedown", this.onMouseDown, !0), 
        this.interactionDOMElement.removeEventListener("mouseout", this.onMouseOut, !0), 
        this.interactionDOMElement.removeEventListener("touchstart", this.onTouchStart, !0), 
        this.interactionDOMElement.removeEventListener("touchend", this.onTouchEnd, !0), 
        this.interactionDOMElement.removeEventListener("touchleave", this.onTouchCancel, !0), 
        this.interactionDOMElement.removeEventListener("touchcancel", this.onTouchCancel, !0), 
        this.interactionDOMElement.removeEventListener("touchmove", this.onTouchMove, !0), 
        this.interactionDOMElement = null, window.removeEventListener("mouseup", this.onMouseUp, !0));
    }, b.InteractionManager.prototype.update = function() {
        if (this.target) {
            var a = Date.now(), c = a - this.last;
            if (c = c * b.INTERACTION_FREQUENCY / 1e3, !(1 > c)) {
                this.last = a;
                var d = 0;
                this.dirty && this.rebuildInteractiveGraph();
                var e = this.interactiveItems.length, f = "inherit", g = !1;
                for (d = 0; e > d; d++) {
                    var h = this.interactiveItems[d];
                    h.__hit = this.hitTest(h, this.mouse), this.mouse.target = h, h.__hit && !g ? (h.buttonMode && (f = h.defaultCursor), 
                    h.interactiveChildren || (g = !0), h.__isOver || (h.mouseover && h.mouseover(this.mouse), 
                    h.__isOver = !0)) : h.__isOver && (h.mouseout && h.mouseout(this.mouse), h.__isOver = !1);
                }
                this.currentCursorStyle !== f && (this.currentCursorStyle = f, this.interactionDOMElement.style.cursor = f);
            }
        }
    }, b.InteractionManager.prototype.rebuildInteractiveGraph = function() {
        this.dirty = !1;
        for (var a = this.interactiveItems.length, b = 0; a > b; b++) this.interactiveItems[b].interactiveChildren = !1;
        this.interactiveItems = [], this.stage.interactive && this.interactiveItems.push(this.stage), 
        this.collectInteractiveSprite(this.stage, this.stage);
    }, b.InteractionManager.prototype.onMouseMove = function(a) {
        this.dirty && this.rebuildInteractiveGraph(), this.mouse.originalEvent = a;
        var b = this.interactionDOMElement.getBoundingClientRect();
        this.mouse.global.x = (a.clientX - b.left) * (this.target.width / b.width) / this.resolution, 
        this.mouse.global.y = (a.clientY - b.top) * (this.target.height / b.height) / this.resolution;
        for (var c = this.interactiveItems.length, d = 0; c > d; d++) {
            var e = this.interactiveItems[d];
            e.mousemove && e.mousemove(this.mouse);
        }
    }, b.InteractionManager.prototype.onMouseDown = function(a) {
        this.dirty && this.rebuildInteractiveGraph(), this.mouse.originalEvent = a, b.AUTO_PREVENT_DEFAULT && this.mouse.originalEvent.preventDefault();
        for (var c = this.interactiveItems.length, d = this.mouse.originalEvent, e = 2 === d.button || 3 === d.which, f = e ? "rightdown" : "mousedown", g = e ? "rightclick" : "click", h = e ? "__rightIsDown" : "__mouseIsDown", i = e ? "__isRightDown" : "__isDown", j = 0; c > j; j++) {
            var k = this.interactiveItems[j];
            if ((k[f] || k[g]) && (k[h] = !0, k.__hit = this.hitTest(k, this.mouse), k.__hit && (k[f] && k[f](this.mouse), 
            k[i] = !0, !k.interactiveChildren))) break;
        }
    }, b.InteractionManager.prototype.onMouseOut = function(a) {
        this.dirty && this.rebuildInteractiveGraph(), this.mouse.originalEvent = a;
        var b = this.interactiveItems.length;
        this.interactionDOMElement.style.cursor = "inherit";
        for (var c = 0; b > c; c++) {
            var d = this.interactiveItems[c];
            d.__isOver && (this.mouse.target = d, d.mouseout && d.mouseout(this.mouse), d.__isOver = !1);
        }
        this.mouseOut = !0, this.mouse.global.x = -1e4, this.mouse.global.y = -1e4;
    }, b.InteractionManager.prototype.onMouseUp = function(a) {
        this.dirty && this.rebuildInteractiveGraph(), this.mouse.originalEvent = a;
        for (var b = this.interactiveItems.length, c = !1, d = this.mouse.originalEvent, e = 2 === d.button || 3 === d.which, f = e ? "rightup" : "mouseup", g = e ? "rightclick" : "click", h = e ? "rightupoutside" : "mouseupoutside", i = e ? "__isRightDown" : "__isDown", j = 0; b > j; j++) {
            var k = this.interactiveItems[j];
            (k[g] || k[f] || k[h]) && (k.__hit = this.hitTest(k, this.mouse), k.__hit && !c ? (k[f] && k[f](this.mouse), 
            k[i] && k[g] && k[g](this.mouse), k.interactiveChildren || (c = !0)) : k[i] && k[h] && k[h](this.mouse), 
            k[i] = !1);
        }
    }, b.InteractionManager.prototype.hitTest = function(a, c) {
        var d = c.global;
        if (!a.worldVisible) return !1;
        a.worldTransform.applyInverse(d, this._tempPoint);
        var e, f = this._tempPoint.x, g = this._tempPoint.y;
        if (c.target = a, a.hitArea && a.hitArea.contains) return a.hitArea.contains(f, g);
        if (a instanceof b.Sprite) {
            var h, i = a.texture.frame.width, j = a.texture.frame.height, k = -i * a.anchor.x;
            if (f > k && k + i > f && (h = -j * a.anchor.y, g > h && h + j > g)) return !0;
        } else if (a instanceof b.Graphics) {
            var l = a.graphicsData;
            for (e = 0; e < l.length; e++) {
                var m = l[e];
                if (m.fill && m.shape && m.shape.contains(f, g)) return !0;
            }
        }
        var n = a.children.length;
        for (e = 0; n > e; e++) {
            var o = a.children[e], p = this.hitTest(o, c);
            if (p) return c.target = a, !0;
        }
        return !1;
    }, b.InteractionManager.prototype.onTouchMove = function(a) {
        this.dirty && this.rebuildInteractiveGraph();
        for (var b, c, d = this.interactionDOMElement.getBoundingClientRect(), e = a.changedTouches, f = e.length, g = this.target.width / d.width, h = this.target.height / d.height, i = navigator.isCocoonJS && !d.left && !d.top && !a.target.style.width && !a.target.style.height, j = 0; f > j; j++) c = e[j], 
        i ? (c.globalX = c.clientX, c.globalY = c.clientY) : (c.globalX = (c.clientX - d.left) * g / this.resolution, 
        c.globalY = (c.clientY - d.top) * h / this.resolution);
        for (var k = 0; f > k; k++) {
            c = e[k], b = this.touches[c.identifier], b.originalEvent = a, i ? (b.global.x = c.clientX, 
            b.global.y = c.clientY) : (c.globalX = b.global.x = (c.clientX - d.left) * g / this.resolution, 
            c.globalY = b.global.y = (c.clientY - d.top) * h / this.resolution);
            for (var l = 0; l < this.interactiveItems.length; l++) {
                var m = this.interactiveItems[l];
                m.touchmove && m.__touchData && m.__touchData[c.identifier] && m.touchmove(b);
            }
        }
    }, b.InteractionManager.prototype.onTouchStart = function(a) {
        this.dirty && this.rebuildInteractiveGraph();
        var c = this.interactionDOMElement.getBoundingClientRect();
        b.AUTO_PREVENT_DEFAULT && a.preventDefault();
        for (var d, e = a.changedTouches, f = e.length, g = this.target.width / c.width, h = this.target.height / c.height, i = navigator.isCocoonJS && !c.left && !c.top && !a.target.style.width && !a.target.style.height, j = 0; f > j; j++) d = e[j], 
        i ? (d.globalX = d.clientX, d.globalY = d.clientY) : (d.globalX = (d.clientX - c.left) * g / this.resolution, 
        d.globalY = (d.clientY - c.top) * h / this.resolution);
        for (var k = 0; f > k; k++) {
            d = e[k];
            var l = this.pool.pop();
            l || (l = new b.InteractionData()), l.originalEvent = a, this.touches[d.identifier] = l, 
            i ? (l.global.x = d.clientX, l.global.y = d.clientY) : (l.global.x = (d.clientX - c.left) * g / this.resolution, 
            l.global.y = (d.clientY - c.top) * h / this.resolution);
            for (var m = this.interactiveItems.length, n = 0; m > n; n++) {
                var o = this.interactiveItems[n];
                if ((o.touchstart || o.tap) && (o.__hit = this.hitTest(o, l), o.__hit && (o.touchstart && o.touchstart(l), 
                o.__isDown = !0, o.__touchData = o.__touchData || {}, o.__touchData[d.identifier] = l, 
                !o.interactiveChildren))) break;
            }
        }
    }, b.InteractionManager.prototype.onTouchEnd = function(a) {
        this.dirty && this.rebuildInteractiveGraph();
        for (var b, c = this.interactionDOMElement.getBoundingClientRect(), d = a.changedTouches, e = d.length, f = this.target.width / c.width, g = this.target.height / c.height, h = navigator.isCocoonJS && !c.left && !c.top && !a.target.style.width && !a.target.style.height, i = 0; e > i; i++) b = d[i], 
        h ? (b.globalX = b.clientX, b.globalY = b.clientY) : (b.globalX = (b.clientX - c.left) * f / this.resolution, 
        b.globalY = (b.clientY - c.top) * g / this.resolution);
        for (var j = 0; e > j; j++) {
            b = d[j];
            var k = this.touches[b.identifier], l = !1;
            h ? (k.global.x = b.clientX, k.global.y = b.clientY) : (k.global.x = (b.clientX - c.left) * f / this.resolution, 
            k.global.y = (b.clientY - c.top) * g / this.resolution);
            for (var m = this.interactiveItems.length, n = 0; m > n; n++) {
                var o = this.interactiveItems[n];
                o.__touchData && o.__touchData[b.identifier] && (o.__hit = this.hitTest(o, o.__touchData[b.identifier]), 
                k.originalEvent = a, (o.touchend || o.tap) && (o.__hit && !l ? (o.touchend && o.touchend(k), 
                o.__isDown && o.tap && o.tap(k), o.interactiveChildren || (l = !0)) : o.__isDown && o.touchendoutside && o.touchendoutside(k), 
                o.__isDown = !1), o.__touchData[b.identifier] = null);
            }
            this.pool.push(k), this.touches[b.identifier] = null;
        }
    }, b.InteractionManager.prototype.onTouchCancel = function(a) {
        this.dirty && this.rebuildInteractiveGraph();
        for (var b, c = this.interactionDOMElement.getBoundingClientRect(), d = a.changedTouches, e = d.length, f = this.target.width / c.width, g = this.target.height / c.height, h = navigator.isCocoonJS && !c.left && !c.top && !a.target.style.width && !a.target.style.height, i = 0; e > i; i++) b = d[i], 
        h ? (b.globalX = b.clientX, b.globalY = b.clientY) : (b.globalX = (b.clientX - c.left) * f / this.resolution, 
        b.globalY = (b.clientY - c.top) * g / this.resolution);
        for (var j = 0; e > j; j++) {
            b = d[j];
            var k = this.touches[b.identifier], l = !1;
            h ? (k.global.x = b.clientX, k.global.y = b.clientY) : (k.global.x = (b.clientX - c.left) * f / this.resolution, 
            k.global.y = (b.clientY - c.top) * g / this.resolution);
            for (var m = this.interactiveItems.length, n = 0; m > n; n++) {
                var o = this.interactiveItems[n];
                o.__touchData && o.__touchData[b.identifier] && (o.__hit = this.hitTest(o, o.__touchData[b.identifier]), 
                k.originalEvent = a, o.touchcancel && !l && (o.touchcancel(k), o.interactiveChildren || (l = !0)), 
                o.__isDown = !1, o.__touchData[b.identifier] = null);
            }
            this.pool.push(k), this.touches[b.identifier] = null;
        }
    }, b.Stage = function(a) {
        b.DisplayObjectContainer.call(this), this.worldTransform = new b.Matrix(), this.interactive = !0, 
        this.interactionManager = new b.InteractionManager(this), this.dirty = !0, this.stage = this, 
        this.stage.hitArea = new b.Rectangle(0, 0, 1e5, 1e5), this.setBackgroundColor(a);
    }, b.Stage.prototype = Object.create(b.DisplayObjectContainer.prototype), b.Stage.prototype.constructor = b.Stage, 
    b.Stage.prototype.setInteractionDelegate = function(a) {
        this.interactionManager.setTargetDomElement(a);
    }, b.Stage.prototype.updateTransform = function() {
        this.worldAlpha = 1;
        for (var a = 0, b = this.children.length; b > a; a++) this.children[a].updateTransform();
        this.dirty && (this.dirty = !1, this.interactionManager.dirty = !0), this.interactive && this.interactionManager.update();
    }, b.Stage.prototype.setBackgroundColor = function(a) {
        this.backgroundColor = a || 0, this.backgroundColorSplit = b.hex2rgb(this.backgroundColor);
        var c = this.backgroundColor.toString(16);
        c = "000000".substr(0, 6 - c.length) + c, this.backgroundColorString = "#" + c;
    }, b.Stage.prototype.getMousePosition = function() {
        return this.interactionManager.mouse.global;
    }, function(a) {
        for (var b = 0, c = [ "ms", "moz", "webkit", "o" ], d = 0; d < c.length && !a.requestAnimationFrame; ++d) a.requestAnimationFrame = a[c[d] + "RequestAnimationFrame"], 
        a.cancelAnimationFrame = a[c[d] + "CancelAnimationFrame"] || a[c[d] + "CancelRequestAnimationFrame"];
        a.requestAnimationFrame || (a.requestAnimationFrame = function(c) {
            var d = new Date().getTime(), e = Math.max(0, 16 - (d - b)), f = a.setTimeout(function() {
                c(d + e);
            }, e);
            return b = d + e, f;
        }), a.cancelAnimationFrame || (a.cancelAnimationFrame = function(a) {
            clearTimeout(a);
        }), a.requestAnimFrame = a.requestAnimationFrame;
    }(this), b.hex2rgb = function(a) {
        return [ (a >> 16 & 255) / 255, (a >> 8 & 255) / 255, (255 & a) / 255 ];
    }, b.rgb2hex = function(a) {
        return (255 * a[0] << 16) + (255 * a[1] << 8) + 255 * a[2];
    }, "function" != typeof Function.prototype.bind && (Function.prototype.bind = function() {
        return function(a) {
            function b() {
                for (var d = arguments.length, f = new Array(d); d--; ) f[d] = arguments[d];
                return f = e.concat(f), c.apply(this instanceof b ? this : a, f);
            }
            var c = this, d = arguments.length - 1, e = [];
            if (d > 0) for (e.length = d; d--; ) e[d] = arguments[d + 1];
            if ("function" != typeof c) throw new TypeError();
            return b.prototype = function f(a) {
                return a && (f.prototype = a), this instanceof f ? void 0 : new f();
            }(c.prototype), b;
        };
    }()), b.AjaxRequest = function() {
        var a = [ "Msxml2.XMLHTTP.6.0", "Msxml2.XMLHTTP.3.0", "Microsoft.XMLHTTP" ];
        if (!window.ActiveXObject) return window.XMLHttpRequest ? new window.XMLHttpRequest() : !1;
        for (var b = 0; b < a.length; b++) try {
            return new window.ActiveXObject(a[b]);
        } catch (c) {}
    }, b.canUseNewCanvasBlendModes = function() {
        if ("undefined" == typeof document) return !1;
        var a = document.createElement("canvas");
        a.width = 1, a.height = 1;
        var b = a.getContext("2d");
        return b.fillStyle = "#000", b.fillRect(0, 0, 1, 1), b.globalCompositeOperation = "multiply", 
        b.fillStyle = "#fff", b.fillRect(0, 0, 1, 1), 0 === b.getImageData(0, 0, 1, 1).data[0];
    }, b.getNextPowerOfTwo = function(a) {
        if (a > 0 && 0 === (a & a - 1)) return a;
        for (var b = 1; a > b; ) b <<= 1;
        return b;
    }, b.isPowerOfTwo = function(a, b) {
        return a > 0 && 0 === (a & a - 1) && b > 0 && 0 === (b & b - 1);
    }, b.EventTarget = {
        call: function(a) {
            a && (a = a.prototype || a, b.EventTarget.mixin(a));
        },
        mixin: function(a) {
            a.listeners = function(a) {
                return this._listeners = this._listeners || {}, this._listeners[a] ? this._listeners[a].slice() : [];
            }, a.emit = a.dispatchEvent = function(a, c) {
                if (this._listeners = this._listeners || {}, "object" == typeof a && (c = a, a = a.type), 
                c && c.__isEventObject === !0 || (c = new b.Event(this, a, c)), this._listeners && this._listeners[a]) {
                    var d, e = this._listeners[a].slice(0), f = e.length, g = e[0];
                    for (d = 0; f > d; g = e[++d]) if (g.call(this, c), c.stoppedImmediate) return this;
                    if (c.stopped) return this;
                }
                return this.parent && this.parent.emit && this.parent.emit.call(this.parent, a, c), 
                this;
            }, a.on = a.addEventListener = function(a, b) {
                return this._listeners = this._listeners || {}, (this._listeners[a] = this._listeners[a] || []).push(b), 
                this;
            }, a.once = function(a, b) {
                function c() {
                    b.apply(d.off(a, c), arguments);
                }
                this._listeners = this._listeners || {};
                var d = this;
                return c._originalHandler = b, this.on(a, c);
            }, a.off = a.removeEventListener = function(a, b) {
                if (this._listeners = this._listeners || {}, !this._listeners[a]) return this;
                for (var c = this._listeners[a], d = b ? c.length : 0; d-- > 0; ) (c[d] === b || c[d]._originalHandler === b) && c.splice(d, 1);
                return 0 === c.length && delete this._listeners[a], this;
            }, a.removeAllListeners = function(a) {
                return this._listeners = this._listeners || {}, this._listeners[a] ? (delete this._listeners[a], 
                this) : this;
            };
        }
    }, b.Event = function(a, b, c) {
        this.__isEventObject = !0, this.stopped = !1, this.stoppedImmediate = !1, this.target = a, 
        this.type = b, this.data = c, this.content = c, this.timeStamp = Date.now();
    }, b.Event.prototype.stopPropagation = function() {
        this.stopped = !0;
    }, b.Event.prototype.stopImmediatePropagation = function() {
        this.stoppedImmediate = !0;
    }, b.autoDetectRenderer = function(a, c, d) {
        a || (a = 800), c || (c = 600);
        var e = function() {
            try {
                var a = document.createElement("canvas");
                return !!window.WebGLRenderingContext && (a.getContext("webgl") || a.getContext("experimental-webgl"));
            } catch (b) {
                return !1;
            }
        }();
        return e ? new b.WebGLRenderer(a, c, d) : new b.CanvasRenderer(a, c, d);
    }, b.autoDetectRecommendedRenderer = function(a, c, d) {
        a || (a = 800), c || (c = 600);
        var e = function() {
            try {
                var a = document.createElement("canvas");
                return !!window.WebGLRenderingContext && (a.getContext("webgl") || a.getContext("experimental-webgl"));
            } catch (b) {
                return !1;
            }
        }(), f = /Android/i.test(navigator.userAgent);
        return e && !f ? new b.WebGLRenderer(a, c, d) : new b.CanvasRenderer(a, c, d);
    }, b.PolyK = {}, b.PolyK.Triangulate = function(a) {
        var c = !0, d = a.length >> 1;
        if (3 > d) return [];
        for (var e = [], f = [], g = 0; d > g; g++) f.push(g);
        g = 0;
        for (var h = d; h > 3; ) {
            var i = f[(g + 0) % h], j = f[(g + 1) % h], k = f[(g + 2) % h], l = a[2 * i], m = a[2 * i + 1], n = a[2 * j], o = a[2 * j + 1], p = a[2 * k], q = a[2 * k + 1], r = !1;
            if (b.PolyK._convex(l, m, n, o, p, q, c)) {
                r = !0;
                for (var s = 0; h > s; s++) {
                    var t = f[s];
                    if (t !== i && t !== j && t !== k && b.PolyK._PointInTriangle(a[2 * t], a[2 * t + 1], l, m, n, o, p, q)) {
                        r = !1;
                        break;
                    }
                }
            }
            if (r) e.push(i, j, k), f.splice((g + 1) % h, 1), h--, g = 0; else if (g++ > 3 * h) {
                if (!c) return null;
                for (e = [], f = [], g = 0; d > g; g++) f.push(g);
                g = 0, h = d, c = !1;
            }
        }
        return e.push(f[0], f[1], f[2]), e;
    }, b.PolyK._PointInTriangle = function(a, b, c, d, e, f, g, h) {
        var i = g - c, j = h - d, k = e - c, l = f - d, m = a - c, n = b - d, o = i * i + j * j, p = i * k + j * l, q = i * m + j * n, r = k * k + l * l, s = k * m + l * n, t = 1 / (o * r - p * p), u = (r * q - p * s) * t, v = (o * s - p * q) * t;
        return u >= 0 && v >= 0 && 1 > u + v;
    }, b.PolyK._convex = function(a, b, c, d, e, f, g) {
        return (b - d) * (e - c) + (c - a) * (f - d) >= 0 === g;
    }, b.initDefaultShaders = function() {}, b.CompileVertexShader = function(a, c) {
        return b._CompileShader(a, c, a.VERTEX_SHADER);
    }, b.CompileFragmentShader = function(a, c) {
        return b._CompileShader(a, c, a.FRAGMENT_SHADER);
    }, b._CompileShader = function(a, b, c) {
        var d = b.join("\n"), e = a.createShader(c);
        return a.shaderSource(e, d), a.compileShader(e), a.getShaderParameter(e, a.COMPILE_STATUS) ? e : (window.console.log(a.getShaderInfoLog(e)), 
        null);
    }, b.compileProgram = function(a, c, d) {
        var e = b.CompileFragmentShader(a, d), f = b.CompileVertexShader(a, c), g = a.createProgram();
        return a.attachShader(g, f), a.attachShader(g, e), a.linkProgram(g), a.getProgramParameter(g, a.LINK_STATUS) || window.console.log("Could not initialise shaders"), 
        g;
    }, b.PixiShader = function(a) {
        this._UID = b._UID++, this.gl = a, this.program = null, this.fragmentSrc = [ "precision lowp float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform sampler2D uSampler;", "void main(void) {", "   gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor ;", "}" ], 
        this.textureCount = 0, this.firstRun = !0, this.dirty = !0, this.attributes = [], 
        this.init();
    }, b.PixiShader.prototype.constructor = b.PixiShader, b.PixiShader.prototype.init = function() {
        var a = this.gl, c = b.compileProgram(a, this.vertexSrc || b.PixiShader.defaultVertexSrc, this.fragmentSrc);
        a.useProgram(c), this.uSampler = a.getUniformLocation(c, "uSampler"), this.projectionVector = a.getUniformLocation(c, "projectionVector"), 
        this.offsetVector = a.getUniformLocation(c, "offsetVector"), this.dimensions = a.getUniformLocation(c, "dimensions"), 
        this.aVertexPosition = a.getAttribLocation(c, "aVertexPosition"), this.aTextureCoord = a.getAttribLocation(c, "aTextureCoord"), 
        this.colorAttribute = a.getAttribLocation(c, "aColor"), -1 === this.colorAttribute && (this.colorAttribute = 2), 
        this.attributes = [ this.aVertexPosition, this.aTextureCoord, this.colorAttribute ];
        for (var d in this.uniforms) this.uniforms[d].uniformLocation = a.getUniformLocation(c, d);
        this.initUniforms(), this.program = c;
    }, b.PixiShader.prototype.initUniforms = function() {
        this.textureCount = 1;
        var a, b = this.gl;
        for (var c in this.uniforms) {
            a = this.uniforms[c];
            var d = a.type;
            "sampler2D" === d ? (a._init = !1, null !== a.value && this.initSampler2D(a)) : "mat2" === d || "mat3" === d || "mat4" === d ? (a.glMatrix = !0, 
            a.glValueLength = 1, "mat2" === d ? a.glFunc = b.uniformMatrix2fv : "mat3" === d ? a.glFunc = b.uniformMatrix3fv : "mat4" === d && (a.glFunc = b.uniformMatrix4fv)) : (a.glFunc = b["uniform" + d], 
            a.glValueLength = "2f" === d || "2i" === d ? 2 : "3f" === d || "3i" === d ? 3 : "4f" === d || "4i" === d ? 4 : 1);
        }
    }, b.PixiShader.prototype.initSampler2D = function(a) {
        if (a.value && a.value.baseTexture && a.value.baseTexture.hasLoaded) {
            var b = this.gl;
            if (b.activeTexture(b["TEXTURE" + this.textureCount]), b.bindTexture(b.TEXTURE_2D, a.value.baseTexture._glTextures[b.id]), 
            a.textureData) {
                var c = a.textureData, d = c.magFilter ? c.magFilter : b.LINEAR, e = c.minFilter ? c.minFilter : b.LINEAR, f = c.wrapS ? c.wrapS : b.CLAMP_TO_EDGE, g = c.wrapT ? c.wrapT : b.CLAMP_TO_EDGE, h = c.luminance ? b.LUMINANCE : b.RGBA;
                if (c.repeat && (f = b.REPEAT, g = b.REPEAT), b.pixelStorei(b.UNPACK_FLIP_Y_WEBGL, !!c.flipY), 
                c.width) {
                    var i = c.width ? c.width : 512, j = c.height ? c.height : 2, k = c.border ? c.border : 0;
                    b.texImage2D(b.TEXTURE_2D, 0, h, i, j, k, h, b.UNSIGNED_BYTE, null);
                } else b.texImage2D(b.TEXTURE_2D, 0, h, b.RGBA, b.UNSIGNED_BYTE, a.value.baseTexture.source);
                b.texParameteri(b.TEXTURE_2D, b.TEXTURE_MAG_FILTER, d), b.texParameteri(b.TEXTURE_2D, b.TEXTURE_MIN_FILTER, e), 
                b.texParameteri(b.TEXTURE_2D, b.TEXTURE_WRAP_S, f), b.texParameteri(b.TEXTURE_2D, b.TEXTURE_WRAP_T, g);
            }
            b.uniform1i(a.uniformLocation, this.textureCount), a._init = !0, this.textureCount++;
        }
    }, b.PixiShader.prototype.syncUniforms = function() {
        this.textureCount = 1;
        var a, c = this.gl;
        for (var d in this.uniforms) a = this.uniforms[d], 1 === a.glValueLength ? a.glMatrix === !0 ? a.glFunc.call(c, a.uniformLocation, a.transpose, a.value) : a.glFunc.call(c, a.uniformLocation, a.value) : 2 === a.glValueLength ? a.glFunc.call(c, a.uniformLocation, a.value.x, a.value.y) : 3 === a.glValueLength ? a.glFunc.call(c, a.uniformLocation, a.value.x, a.value.y, a.value.z) : 4 === a.glValueLength ? a.glFunc.call(c, a.uniformLocation, a.value.x, a.value.y, a.value.z, a.value.w) : "sampler2D" === a.type && (a._init ? (c.activeTexture(c["TEXTURE" + this.textureCount]), 
        a.value.baseTexture._dirty[c.id] ? b.instances[c.id].updateTexture(a.value.baseTexture) : c.bindTexture(c.TEXTURE_2D, a.value.baseTexture._glTextures[c.id]), 
        c.uniform1i(a.uniformLocation, this.textureCount), this.textureCount++) : this.initSampler2D(a));
    }, b.PixiShader.prototype.destroy = function() {
        this.gl.deleteProgram(this.program), this.uniforms = null, this.gl = null, this.attributes = null;
    }, b.PixiShader.defaultVertexSrc = [ "attribute vec2 aVertexPosition;", "attribute vec2 aTextureCoord;", "attribute vec4 aColor;", "uniform vec2 projectionVector;", "uniform vec2 offsetVector;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "const vec2 center = vec2(-1.0, 1.0);", "void main(void) {", "   gl_Position = vec4( ((aVertexPosition + offsetVector) / projectionVector) + center , 0.0, 1.0);", "   vTextureCoord = aTextureCoord;", "   vColor = vec4(aColor.rgb * aColor.a, aColor.a);", "}" ], 
    b.PixiFastShader = function(a) {
        this._UID = b._UID++, this.gl = a, this.program = null, this.fragmentSrc = [ "precision lowp float;", "varying vec2 vTextureCoord;", "varying float vColor;", "uniform sampler2D uSampler;", "void main(void) {", "   gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor ;", "}" ], 
        this.vertexSrc = [ "attribute vec2 aVertexPosition;", "attribute vec2 aPositionCoord;", "attribute vec2 aScale;", "attribute float aRotation;", "attribute vec2 aTextureCoord;", "attribute float aColor;", "uniform vec2 projectionVector;", "uniform vec2 offsetVector;", "uniform mat3 uMatrix;", "varying vec2 vTextureCoord;", "varying float vColor;", "const vec2 center = vec2(-1.0, 1.0);", "void main(void) {", "   vec2 v;", "   vec2 sv = aVertexPosition * aScale;", "   v.x = (sv.x) * cos(aRotation) - (sv.y) * sin(aRotation);", "   v.y = (sv.x) * sin(aRotation) + (sv.y) * cos(aRotation);", "   v = ( uMatrix * vec3(v + aPositionCoord , 1.0) ).xy ;", "   gl_Position = vec4( ( v / projectionVector) + center , 0.0, 1.0);", "   vTextureCoord = aTextureCoord;", "   vColor = aColor;", "}" ], 
        this.textureCount = 0, this.init();
    }, b.PixiFastShader.prototype.constructor = b.PixiFastShader, b.PixiFastShader.prototype.init = function() {
        var a = this.gl, c = b.compileProgram(a, this.vertexSrc, this.fragmentSrc);
        a.useProgram(c), this.uSampler = a.getUniformLocation(c, "uSampler"), this.projectionVector = a.getUniformLocation(c, "projectionVector"), 
        this.offsetVector = a.getUniformLocation(c, "offsetVector"), this.dimensions = a.getUniformLocation(c, "dimensions"), 
        this.uMatrix = a.getUniformLocation(c, "uMatrix"), this.aVertexPosition = a.getAttribLocation(c, "aVertexPosition"), 
        this.aPositionCoord = a.getAttribLocation(c, "aPositionCoord"), this.aScale = a.getAttribLocation(c, "aScale"), 
        this.aRotation = a.getAttribLocation(c, "aRotation"), this.aTextureCoord = a.getAttribLocation(c, "aTextureCoord"), 
        this.colorAttribute = a.getAttribLocation(c, "aColor"), -1 === this.colorAttribute && (this.colorAttribute = 2), 
        this.attributes = [ this.aVertexPosition, this.aPositionCoord, this.aScale, this.aRotation, this.aTextureCoord, this.colorAttribute ], 
        this.program = c;
    }, b.PixiFastShader.prototype.destroy = function() {
        this.gl.deleteProgram(this.program), this.uniforms = null, this.gl = null, this.attributes = null;
    }, b.StripShader = function(a) {
        this._UID = b._UID++, this.gl = a, this.program = null, this.fragmentSrc = [ "precision mediump float;", "varying vec2 vTextureCoord;", "uniform float alpha;", "uniform sampler2D uSampler;", "void main(void) {", "   gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y)) * alpha;", "}" ], 
        this.vertexSrc = [ "attribute vec2 aVertexPosition;", "attribute vec2 aTextureCoord;", "uniform mat3 translationMatrix;", "uniform vec2 projectionVector;", "uniform vec2 offsetVector;", "varying vec2 vTextureCoord;", "void main(void) {", "   vec3 v = translationMatrix * vec3(aVertexPosition , 1.0);", "   v -= offsetVector.xyx;", "   gl_Position = vec4( v.x / projectionVector.x -1.0, v.y / -projectionVector.y + 1.0 , 0.0, 1.0);", "   vTextureCoord = aTextureCoord;", "}" ], 
        this.init();
    }, b.StripShader.prototype.constructor = b.StripShader, b.StripShader.prototype.init = function() {
        var a = this.gl, c = b.compileProgram(a, this.vertexSrc, this.fragmentSrc);
        a.useProgram(c), this.uSampler = a.getUniformLocation(c, "uSampler"), this.projectionVector = a.getUniformLocation(c, "projectionVector"), 
        this.offsetVector = a.getUniformLocation(c, "offsetVector"), this.colorAttribute = a.getAttribLocation(c, "aColor"), 
        this.aVertexPosition = a.getAttribLocation(c, "aVertexPosition"), this.aTextureCoord = a.getAttribLocation(c, "aTextureCoord"), 
        this.attributes = [ this.aVertexPosition, this.aTextureCoord ], this.translationMatrix = a.getUniformLocation(c, "translationMatrix"), 
        this.alpha = a.getUniformLocation(c, "alpha"), this.program = c;
    }, b.StripShader.prototype.destroy = function() {
        this.gl.deleteProgram(this.program), this.uniforms = null, this.gl = null, this.attribute = null;
    }, b.PrimitiveShader = function(a) {
        this._UID = b._UID++, this.gl = a, this.program = null, this.fragmentSrc = [ "precision mediump float;", "varying vec4 vColor;", "void main(void) {", "   gl_FragColor = vColor;", "}" ], 
        this.vertexSrc = [ "attribute vec2 aVertexPosition;", "attribute vec4 aColor;", "uniform mat3 translationMatrix;", "uniform vec2 projectionVector;", "uniform vec2 offsetVector;", "uniform float alpha;", "uniform float flipY;", "uniform vec3 tint;", "varying vec4 vColor;", "void main(void) {", "   vec3 v = translationMatrix * vec3(aVertexPosition , 1.0);", "   v -= offsetVector.xyx;", "   gl_Position = vec4( v.x / projectionVector.x -1.0, (v.y / projectionVector.y * -flipY) + flipY , 0.0, 1.0);", "   vColor = aColor * vec4(tint * alpha, alpha);", "}" ], 
        this.init();
    }, b.PrimitiveShader.prototype.constructor = b.PrimitiveShader, b.PrimitiveShader.prototype.init = function() {
        var a = this.gl, c = b.compileProgram(a, this.vertexSrc, this.fragmentSrc);
        a.useProgram(c), this.projectionVector = a.getUniformLocation(c, "projectionVector"), 
        this.offsetVector = a.getUniformLocation(c, "offsetVector"), this.tintColor = a.getUniformLocation(c, "tint"), 
        this.flipY = a.getUniformLocation(c, "flipY"), this.aVertexPosition = a.getAttribLocation(c, "aVertexPosition"), 
        this.colorAttribute = a.getAttribLocation(c, "aColor"), this.attributes = [ this.aVertexPosition, this.colorAttribute ], 
        this.translationMatrix = a.getUniformLocation(c, "translationMatrix"), this.alpha = a.getUniformLocation(c, "alpha"), 
        this.program = c;
    }, b.PrimitiveShader.prototype.destroy = function() {
        this.gl.deleteProgram(this.program), this.uniforms = null, this.gl = null, this.attributes = null;
    }, b.ComplexPrimitiveShader = function(a) {
        this._UID = b._UID++, this.gl = a, this.program = null, this.fragmentSrc = [ "precision mediump float;", "varying vec4 vColor;", "void main(void) {", "   gl_FragColor = vColor;", "}" ], 
        this.vertexSrc = [ "attribute vec2 aVertexPosition;", "uniform mat3 translationMatrix;", "uniform vec2 projectionVector;", "uniform vec2 offsetVector;", "uniform vec3 tint;", "uniform float alpha;", "uniform vec3 color;", "uniform float flipY;", "varying vec4 vColor;", "void main(void) {", "   vec3 v = translationMatrix * vec3(aVertexPosition , 1.0);", "   v -= offsetVector.xyx;", "   gl_Position = vec4( v.x / projectionVector.x -1.0, (v.y / projectionVector.y * -flipY) + flipY , 0.0, 1.0);", "   vColor = vec4(color * alpha * tint, alpha);", "}" ], 
        this.init();
    }, b.ComplexPrimitiveShader.prototype.constructor = b.ComplexPrimitiveShader, b.ComplexPrimitiveShader.prototype.init = function() {
        var a = this.gl, c = b.compileProgram(a, this.vertexSrc, this.fragmentSrc);
        a.useProgram(c), this.projectionVector = a.getUniformLocation(c, "projectionVector"), 
        this.offsetVector = a.getUniformLocation(c, "offsetVector"), this.tintColor = a.getUniformLocation(c, "tint"), 
        this.color = a.getUniformLocation(c, "color"), this.flipY = a.getUniformLocation(c, "flipY"), 
        this.aVertexPosition = a.getAttribLocation(c, "aVertexPosition"), this.attributes = [ this.aVertexPosition, this.colorAttribute ], 
        this.translationMatrix = a.getUniformLocation(c, "translationMatrix"), this.alpha = a.getUniformLocation(c, "alpha"), 
        this.program = c;
    }, b.ComplexPrimitiveShader.prototype.destroy = function() {
        this.gl.deleteProgram(this.program), this.uniforms = null, this.gl = null, this.attribute = null;
    }, b.WebGLGraphics = function() {}, b.WebGLGraphics.renderGraphics = function(a, c) {
        var d, e = c.gl, f = c.projection, g = c.offset, h = c.shaderManager.primitiveShader;
        a.dirty && b.WebGLGraphics.updateGraphics(a, e);
        for (var i = a._webGL[e.id], j = 0; j < i.data.length; j++) 1 === i.data[j].mode ? (d = i.data[j], 
        c.stencilManager.pushStencil(a, d, c), e.drawElements(e.TRIANGLE_FAN, 4, e.UNSIGNED_SHORT, 2 * (d.indices.length - 4)), 
        c.stencilManager.popStencil(a, d, c)) : (d = i.data[j], c.shaderManager.setShader(h), 
        h = c.shaderManager.primitiveShader, e.uniformMatrix3fv(h.translationMatrix, !1, a.worldTransform.toArray(!0)), 
        e.uniform1f(h.flipY, 1), e.uniform2f(h.projectionVector, f.x, -f.y), e.uniform2f(h.offsetVector, -g.x, -g.y), 
        e.uniform3fv(h.tintColor, b.hex2rgb(a.tint)), e.uniform1f(h.alpha, a.worldAlpha), 
        e.bindBuffer(e.ARRAY_BUFFER, d.buffer), e.vertexAttribPointer(h.aVertexPosition, 2, e.FLOAT, !1, 24, 0), 
        e.vertexAttribPointer(h.colorAttribute, 4, e.FLOAT, !1, 24, 8), e.bindBuffer(e.ELEMENT_ARRAY_BUFFER, d.indexBuffer), 
        e.drawElements(e.TRIANGLE_STRIP, d.indices.length, e.UNSIGNED_SHORT, 0));
    }, b.WebGLGraphics.updateGraphics = function(a, c) {
        var d = a._webGL[c.id];
        d || (d = a._webGL[c.id] = {
            lastIndex: 0,
            data: [],
            gl: c
        }), a.dirty = !1;
        var e;
        if (a.clearDirty) {
            for (a.clearDirty = !1, e = 0; e < d.data.length; e++) {
                var f = d.data[e];
                f.reset(), b.WebGLGraphics.graphicsDataPool.push(f);
            }
            d.data = [], d.lastIndex = 0;
        }
        var g;
        for (e = d.lastIndex; e < a.graphicsData.length; e++) {
            var h = a.graphicsData[e];
            if (h.type === b.Graphics.POLY) {
                if (h.points = h.shape.points.slice(), h.shape.closed && (h.points[0] !== h.points[h.points.length - 2] || h.points[1] !== h.points[h.points.length - 1]) && h.points.push(h.points[0], h.points[1]), 
                h.fill && h.points.length >= 6) if (h.points.length < 12) {
                    g = b.WebGLGraphics.switchMode(d, 0);
                    var i = b.WebGLGraphics.buildPoly(h, g);
                    i || (g = b.WebGLGraphics.switchMode(d, 1), b.WebGLGraphics.buildComplexPoly(h, g));
                } else g = b.WebGLGraphics.switchMode(d, 1), b.WebGLGraphics.buildComplexPoly(h, g);
                h.lineWidth > 0 && (g = b.WebGLGraphics.switchMode(d, 0), b.WebGLGraphics.buildLine(h, g));
            } else g = b.WebGLGraphics.switchMode(d, 0), h.type === b.Graphics.RECT ? b.WebGLGraphics.buildRectangle(h, g) : h.type === b.Graphics.CIRC || h.type === b.Graphics.ELIP ? b.WebGLGraphics.buildCircle(h, g) : h.type === b.Graphics.RREC && b.WebGLGraphics.buildRoundedRectangle(h, g);
            d.lastIndex++;
        }
        for (e = 0; e < d.data.length; e++) g = d.data[e], g.dirty && g.upload();
    }, b.WebGLGraphics.switchMode = function(a, c) {
        var d;
        return a.data.length ? (d = a.data[a.data.length - 1], (d.mode !== c || 1 === c) && (d = b.WebGLGraphics.graphicsDataPool.pop() || new b.WebGLGraphicsData(a.gl), 
        d.mode = c, a.data.push(d))) : (d = b.WebGLGraphics.graphicsDataPool.pop() || new b.WebGLGraphicsData(a.gl), 
        d.mode = c, a.data.push(d)), d.dirty = !0, d;
    }, b.WebGLGraphics.buildRectangle = function(a, c) {
        var d = a.shape, e = d.x, f = d.y, g = d.width, h = d.height;
        if (a.fill) {
            var i = b.hex2rgb(a.fillColor), j = a.fillAlpha, k = i[0] * j, l = i[1] * j, m = i[2] * j, n = c.points, o = c.indices, p = n.length / 6;
            n.push(e, f), n.push(k, l, m, j), n.push(e + g, f), n.push(k, l, m, j), n.push(e, f + h), 
            n.push(k, l, m, j), n.push(e + g, f + h), n.push(k, l, m, j), o.push(p, p, p + 1, p + 2, p + 3, p + 3);
        }
        if (a.lineWidth) {
            var q = a.points;
            a.points = [ e, f, e + g, f, e + g, f + h, e, f + h, e, f ], b.WebGLGraphics.buildLine(a, c), 
            a.points = q;
        }
    }, b.WebGLGraphics.buildRoundedRectangle = function(a, c) {
        var d = a.shape, e = d.x, f = d.y, g = d.width, h = d.height, i = d.radius, j = [];
        if (j.push(e, f + i), j = j.concat(b.WebGLGraphics.quadraticBezierCurve(e, f + h - i, e, f + h, e + i, f + h)), 
        j = j.concat(b.WebGLGraphics.quadraticBezierCurve(e + g - i, f + h, e + g, f + h, e + g, f + h - i)), 
        j = j.concat(b.WebGLGraphics.quadraticBezierCurve(e + g, f + i, e + g, f, e + g - i, f)), 
        j = j.concat(b.WebGLGraphics.quadraticBezierCurve(e + i, f, e, f, e, f + i)), a.fill) {
            var k = b.hex2rgb(a.fillColor), l = a.fillAlpha, m = k[0] * l, n = k[1] * l, o = k[2] * l, p = c.points, q = c.indices, r = p.length / 6, s = b.PolyK.Triangulate(j), t = 0;
            for (t = 0; t < s.length; t += 3) q.push(s[t] + r), q.push(s[t] + r), q.push(s[t + 1] + r), 
            q.push(s[t + 2] + r), q.push(s[t + 2] + r);
            for (t = 0; t < j.length; t++) p.push(j[t], j[++t], m, n, o, l);
        }
        if (a.lineWidth) {
            var u = a.points;
            a.points = j, b.WebGLGraphics.buildLine(a, c), a.points = u;
        }
    }, b.WebGLGraphics.quadraticBezierCurve = function(a, b, c, d, e, f) {
        function g(a, b, c) {
            var d = b - a;
            return a + d * c;
        }
        for (var h, i, j, k, l, m, n = 20, o = [], p = 0, q = 0; n >= q; q++) p = q / n, 
        h = g(a, c, p), i = g(b, d, p), j = g(c, e, p), k = g(d, f, p), l = g(h, j, p), 
        m = g(i, k, p), o.push(l, m);
        return o;
    }, b.WebGLGraphics.buildCircle = function(a, c) {
        var d, e, f = a.shape, g = f.x, h = f.y;
        a.type === b.Graphics.CIRC ? (d = f.radius, e = f.radius) : (d = f.width, e = f.height);
        var i = 40, j = 2 * Math.PI / i, k = 0;
        if (a.fill) {
            var l = b.hex2rgb(a.fillColor), m = a.fillAlpha, n = l[0] * m, o = l[1] * m, p = l[2] * m, q = c.points, r = c.indices, s = q.length / 6;
            for (r.push(s), k = 0; i + 1 > k; k++) q.push(g, h, n, o, p, m), q.push(g + Math.sin(j * k) * d, h + Math.cos(j * k) * e, n, o, p, m), 
            r.push(s++, s++);
            r.push(s - 1);
        }
        if (a.lineWidth) {
            var t = a.points;
            for (a.points = [], k = 0; i + 1 > k; k++) a.points.push(g + Math.sin(j * k) * d, h + Math.cos(j * k) * e);
            b.WebGLGraphics.buildLine(a, c), a.points = t;
        }
    }, b.WebGLGraphics.buildLine = function(a, c) {
        var d = 0, e = a.points;
        if (0 !== e.length) {
            if (a.lineWidth % 2) for (d = 0; d < e.length; d++) e[d] += .5;
            var f = new b.Point(e[0], e[1]), g = new b.Point(e[e.length - 2], e[e.length - 1]);
            if (f.x === g.x && f.y === g.y) {
                e = e.slice(), e.pop(), e.pop(), g = new b.Point(e[e.length - 2], e[e.length - 1]);
                var h = g.x + .5 * (f.x - g.x), i = g.y + .5 * (f.y - g.y);
                e.unshift(h, i), e.push(h, i);
            }
            var j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z, A, B, C, D, E, F, G = c.points, H = c.indices, I = e.length / 2, J = e.length, K = G.length / 6, L = a.lineWidth / 2, M = b.hex2rgb(a.lineColor), N = a.lineAlpha, O = M[0] * N, P = M[1] * N, Q = M[2] * N;
            for (l = e[0], m = e[1], n = e[2], o = e[3], r = -(m - o), s = l - n, F = Math.sqrt(r * r + s * s), 
            r /= F, s /= F, r *= L, s *= L, G.push(l - r, m - s, O, P, Q, N), G.push(l + r, m + s, O, P, Q, N), 
            d = 1; I - 1 > d; d++) l = e[2 * (d - 1)], m = e[2 * (d - 1) + 1], n = e[2 * d], 
            o = e[2 * d + 1], p = e[2 * (d + 1)], q = e[2 * (d + 1) + 1], r = -(m - o), s = l - n, 
            F = Math.sqrt(r * r + s * s), r /= F, s /= F, r *= L, s *= L, t = -(o - q), u = n - p, 
            F = Math.sqrt(t * t + u * u), t /= F, u /= F, t *= L, u *= L, x = -s + m - (-s + o), 
            y = -r + n - (-r + l), z = (-r + l) * (-s + o) - (-r + n) * (-s + m), A = -u + q - (-u + o), 
            B = -t + n - (-t + p), C = (-t + p) * (-u + o) - (-t + n) * (-u + q), D = x * B - A * y, 
            Math.abs(D) < .1 ? (D += 10.1, G.push(n - r, o - s, O, P, Q, N), G.push(n + r, o + s, O, P, Q, N)) : (j = (y * C - B * z) / D, 
            k = (A * z - x * C) / D, E = (j - n) * (j - n) + (k - o) + (k - o), E > 19600 ? (v = r - t, 
            w = s - u, F = Math.sqrt(v * v + w * w), v /= F, w /= F, v *= L, w *= L, G.push(n - v, o - w), 
            G.push(O, P, Q, N), G.push(n + v, o + w), G.push(O, P, Q, N), G.push(n - v, o - w), 
            G.push(O, P, Q, N), J++) : (G.push(j, k), G.push(O, P, Q, N), G.push(n - (j - n), o - (k - o)), 
            G.push(O, P, Q, N)));
            for (l = e[2 * (I - 2)], m = e[2 * (I - 2) + 1], n = e[2 * (I - 1)], o = e[2 * (I - 1) + 1], 
            r = -(m - o), s = l - n, F = Math.sqrt(r * r + s * s), r /= F, s /= F, r *= L, s *= L, 
            G.push(n - r, o - s), G.push(O, P, Q, N), G.push(n + r, o + s), G.push(O, P, Q, N), 
            H.push(K), d = 0; J > d; d++) H.push(K++);
            H.push(K - 1);
        }
    }, b.WebGLGraphics.buildComplexPoly = function(a, c) {
        var d = a.points.slice();
        if (!(d.length < 6)) {
            var e = c.indices;
            c.points = d, c.alpha = a.fillAlpha, c.color = b.hex2rgb(a.fillColor);
            for (var f, g, h = 1 / 0, i = -(1 / 0), j = 1 / 0, k = -(1 / 0), l = 0; l < d.length; l += 2) f = d[l], 
            g = d[l + 1], h = h > f ? f : h, i = f > i ? f : i, j = j > g ? g : j, k = g > k ? g : k;
            d.push(h, j, i, j, i, k, h, k);
            var m = d.length / 2;
            for (l = 0; m > l; l++) e.push(l);
        }
    }, b.WebGLGraphics.buildPoly = function(a, c) {
        var d = a.points;
        if (!(d.length < 6)) {
            var e = c.points, f = c.indices, g = d.length / 2, h = b.hex2rgb(a.fillColor), i = a.fillAlpha, j = h[0] * i, k = h[1] * i, l = h[2] * i, m = b.PolyK.Triangulate(d);
            if (!m) return !1;
            var n = e.length / 6, o = 0;
            for (o = 0; o < m.length; o += 3) f.push(m[o] + n), f.push(m[o] + n), f.push(m[o + 1] + n), 
            f.push(m[o + 2] + n), f.push(m[o + 2] + n);
            for (o = 0; g > o; o++) e.push(d[2 * o], d[2 * o + 1], j, k, l, i);
            return !0;
        }
    }, b.WebGLGraphics.graphicsDataPool = [], b.WebGLGraphicsData = function(a) {
        this.gl = a, this.color = [ 0, 0, 0 ], this.points = [], this.indices = [], this.buffer = a.createBuffer(), 
        this.indexBuffer = a.createBuffer(), this.mode = 1, this.alpha = 1, this.dirty = !0;
    }, b.WebGLGraphicsData.prototype.reset = function() {
        this.points = [], this.indices = [];
    }, b.WebGLGraphicsData.prototype.upload = function() {
        var a = this.gl;
        this.glPoints = new b.Float32Array(this.points), a.bindBuffer(a.ARRAY_BUFFER, this.buffer), 
        a.bufferData(a.ARRAY_BUFFER, this.glPoints, a.STATIC_DRAW), this.glIndicies = new b.Uint16Array(this.indices), 
        a.bindBuffer(a.ELEMENT_ARRAY_BUFFER, this.indexBuffer), a.bufferData(a.ELEMENT_ARRAY_BUFFER, this.glIndicies, a.STATIC_DRAW), 
        this.dirty = !1;
    }, b.glContexts = [], b.instances = [], b.WebGLRenderer = function(a, c, d) {
        if (d) for (var e in b.defaultRenderOptions) "undefined" == typeof d[e] && (d[e] = b.defaultRenderOptions[e]); else d = b.defaultRenderOptions;
        b.defaultRenderer || (b.sayHello("webGL"), b.defaultRenderer = this), this.type = b.WEBGL_RENDERER, 
        this.resolution = d.resolution, this.transparent = d.transparent, this.autoResize = d.autoResize || !1, 
        this.preserveDrawingBuffer = d.preserveDrawingBuffer, this.clearBeforeRender = d.clearBeforeRender, 
        this.width = a || 800, this.height = c || 600, this.view = d.view || document.createElement("canvas"), 
        this.contextLostBound = this.handleContextLost.bind(this), this.contextRestoredBound = this.handleContextRestored.bind(this), 
        this.view.addEventListener("webglcontextlost", this.contextLostBound, !1), this.view.addEventListener("webglcontextrestored", this.contextRestoredBound, !1), 
        this._contextOptions = {
            alpha: this.transparent,
            antialias: d.antialias,
            premultipliedAlpha: this.transparent && "notMultiplied" !== this.transparent,
            stencil: !0,
            preserveDrawingBuffer: d.preserveDrawingBuffer
        }, this.projection = new b.Point(), this.offset = new b.Point(0, 0), this.shaderManager = new b.WebGLShaderManager(), 
        this.spriteBatch = new b.WebGLSpriteBatch(), this.maskManager = new b.WebGLMaskManager(), 
        this.filterManager = new b.WebGLFilterManager(), this.stencilManager = new b.WebGLStencilManager(), 
        this.blendModeManager = new b.WebGLBlendModeManager(), this.renderSession = {}, 
        this.renderSession.gl = this.gl, this.renderSession.drawCount = 0, this.renderSession.shaderManager = this.shaderManager, 
        this.renderSession.maskManager = this.maskManager, this.renderSession.filterManager = this.filterManager, 
        this.renderSession.blendModeManager = this.blendModeManager, this.renderSession.spriteBatch = this.spriteBatch, 
        this.renderSession.stencilManager = this.stencilManager, this.renderSession.renderer = this, 
        this.renderSession.resolution = this.resolution, this.initContext(), this.mapBlendModes();
    }, b.WebGLRenderer.prototype.constructor = b.WebGLRenderer, b.WebGLRenderer.prototype.initContext = function() {
        var a = this.view.getContext("webgl", this._contextOptions) || this.view.getContext("experimental-webgl", this._contextOptions);
        if (this.gl = a, !a) throw new Error("This browser does not support webGL. Try using the canvas renderer");
        this.glContextId = a.id = b.WebGLRenderer.glContextId++, b.glContexts[this.glContextId] = a, 
        b.instances[this.glContextId] = this, a.disable(a.DEPTH_TEST), a.disable(a.CULL_FACE), 
        a.enable(a.BLEND), this.shaderManager.setContext(a), this.spriteBatch.setContext(a), 
        this.maskManager.setContext(a), this.filterManager.setContext(a), this.blendModeManager.setContext(a), 
        this.stencilManager.setContext(a), this.renderSession.gl = this.gl, this.resize(this.width, this.height);
    }, b.WebGLRenderer.prototype.render = function(a) {
        if (!this.contextLost) {
            this.__stage !== a && (a.interactive && a.interactionManager.removeEvents(), this.__stage = a), 
            a.updateTransform();
            var b = this.gl;
            a._interactive ? a._interactiveEventsAdded || (a._interactiveEventsAdded = !0, a.interactionManager.setTarget(this)) : a._interactiveEventsAdded && (a._interactiveEventsAdded = !1, 
            a.interactionManager.setTarget(this)), b.viewport(0, 0, this.width, this.height), 
            b.bindFramebuffer(b.FRAMEBUFFER, null), this.clearBeforeRender && (this.transparent ? b.clearColor(0, 0, 0, 0) : b.clearColor(a.backgroundColorSplit[0], a.backgroundColorSplit[1], a.backgroundColorSplit[2], 1), 
            b.clear(b.COLOR_BUFFER_BIT)), this.renderDisplayObject(a, this.projection);
        }
    }, b.WebGLRenderer.prototype.renderDisplayObject = function(a, c, d) {
        this.renderSession.blendModeManager.setBlendMode(b.blendModes.NORMAL), this.renderSession.drawCount = 0, 
        this.renderSession.flipY = d ? -1 : 1, this.renderSession.projection = c, this.renderSession.offset = this.offset, 
        this.spriteBatch.begin(this.renderSession), this.filterManager.begin(this.renderSession, d), 
        a._renderWebGL(this.renderSession), this.spriteBatch.end();
    }, b.WebGLRenderer.prototype.resize = function(a, b) {
        this.width = a * this.resolution, this.height = b * this.resolution, this.view.width = this.width, 
        this.view.height = this.height, this.autoResize && (this.view.style.width = this.width / this.resolution + "px", 
        this.view.style.height = this.height / this.resolution + "px"), this.gl.viewport(0, 0, this.width, this.height), 
        this.projection.x = this.width / 2 / this.resolution, this.projection.y = -this.height / 2 / this.resolution;
    }, b.WebGLRenderer.prototype.updateTexture = function(a) {
        if (a.hasLoaded) {
            var c = this.gl;
            return a._glTextures[c.id] || (a._glTextures[c.id] = c.createTexture()), c.bindTexture(c.TEXTURE_2D, a._glTextures[c.id]), 
            c.pixelStorei(c.UNPACK_PREMULTIPLY_ALPHA_WEBGL, a.premultipliedAlpha), c.texImage2D(c.TEXTURE_2D, 0, c.RGBA, c.RGBA, c.UNSIGNED_BYTE, a.source), 
            c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MAG_FILTER, a.scaleMode === b.scaleModes.LINEAR ? c.LINEAR : c.NEAREST), 
            a.mipmap && b.isPowerOfTwo(a.width, a.height) ? (c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MIN_FILTER, a.scaleMode === b.scaleModes.LINEAR ? c.LINEAR_MIPMAP_LINEAR : c.NEAREST_MIPMAP_NEAREST), 
            c.generateMipmap(c.TEXTURE_2D)) : c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MIN_FILTER, a.scaleMode === b.scaleModes.LINEAR ? c.LINEAR : c.NEAREST), 
            a._powerOf2 ? (c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_S, c.REPEAT), c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_T, c.REPEAT)) : (c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_S, c.CLAMP_TO_EDGE), 
            c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_T, c.CLAMP_TO_EDGE)), a._dirty[c.id] = !1, 
            a._glTextures[c.id];
        }
    }, b.WebGLRenderer.prototype.handleContextLost = function(a) {
        a.preventDefault(), this.contextLost = !0;
    }, b.WebGLRenderer.prototype.handleContextRestored = function() {
        this.initContext();
        for (var a in b.TextureCache) {
            var c = b.TextureCache[a].baseTexture;
            c._glTextures = [];
        }
        this.contextLost = !1;
    }, b.WebGLRenderer.prototype.destroy = function() {
        this.view.removeEventListener("webglcontextlost", this.contextLostBound), this.view.removeEventListener("webglcontextrestored", this.contextRestoredBound), 
        b.glContexts[this.glContextId] = null, this.projection = null, this.offset = null, 
        this.shaderManager.destroy(), this.spriteBatch.destroy(), this.maskManager.destroy(), 
        this.filterManager.destroy(), this.shaderManager = null, this.spriteBatch = null, 
        this.maskManager = null, this.filterManager = null, this.gl = null, this.renderSession = null;
    }, b.WebGLRenderer.prototype.mapBlendModes = function() {
        var a = this.gl;
        b.blendModesWebGL || (b.blendModesWebGL = [], b.blendModesWebGL[b.blendModes.NORMAL] = [ a.ONE, a.ONE_MINUS_SRC_ALPHA ], 
        b.blendModesWebGL[b.blendModes.ADD] = [ a.SRC_ALPHA, a.DST_ALPHA ], b.blendModesWebGL[b.blendModes.MULTIPLY] = [ a.DST_COLOR, a.ONE_MINUS_SRC_ALPHA ], 
        b.blendModesWebGL[b.blendModes.SCREEN] = [ a.SRC_ALPHA, a.ONE ], b.blendModesWebGL[b.blendModes.OVERLAY] = [ a.ONE, a.ONE_MINUS_SRC_ALPHA ], 
        b.blendModesWebGL[b.blendModes.DARKEN] = [ a.ONE, a.ONE_MINUS_SRC_ALPHA ], b.blendModesWebGL[b.blendModes.LIGHTEN] = [ a.ONE, a.ONE_MINUS_SRC_ALPHA ], 
        b.blendModesWebGL[b.blendModes.COLOR_DODGE] = [ a.ONE, a.ONE_MINUS_SRC_ALPHA ], 
        b.blendModesWebGL[b.blendModes.COLOR_BURN] = [ a.ONE, a.ONE_MINUS_SRC_ALPHA ], b.blendModesWebGL[b.blendModes.HARD_LIGHT] = [ a.ONE, a.ONE_MINUS_SRC_ALPHA ], 
        b.blendModesWebGL[b.blendModes.SOFT_LIGHT] = [ a.ONE, a.ONE_MINUS_SRC_ALPHA ], b.blendModesWebGL[b.blendModes.DIFFERENCE] = [ a.ONE, a.ONE_MINUS_SRC_ALPHA ], 
        b.blendModesWebGL[b.blendModes.EXCLUSION] = [ a.ONE, a.ONE_MINUS_SRC_ALPHA ], b.blendModesWebGL[b.blendModes.HUE] = [ a.ONE, a.ONE_MINUS_SRC_ALPHA ], 
        b.blendModesWebGL[b.blendModes.SATURATION] = [ a.ONE, a.ONE_MINUS_SRC_ALPHA ], b.blendModesWebGL[b.blendModes.COLOR] = [ a.ONE, a.ONE_MINUS_SRC_ALPHA ], 
        b.blendModesWebGL[b.blendModes.LUMINOSITY] = [ a.ONE, a.ONE_MINUS_SRC_ALPHA ]);
    }, b.WebGLRenderer.glContextId = 0, b.WebGLBlendModeManager = function() {
        this.currentBlendMode = 99999;
    }, b.WebGLBlendModeManager.prototype.constructor = b.WebGLBlendModeManager, b.WebGLBlendModeManager.prototype.setContext = function(a) {
        this.gl = a;
    }, b.WebGLBlendModeManager.prototype.setBlendMode = function(a) {
        if (this.currentBlendMode === a) return !1;
        this.currentBlendMode = a;
        var c = b.blendModesWebGL[this.currentBlendMode];
        return this.gl.blendFunc(c[0], c[1]), !0;
    }, b.WebGLBlendModeManager.prototype.destroy = function() {
        this.gl = null;
    }, b.WebGLMaskManager = function() {}, b.WebGLMaskManager.prototype.constructor = b.WebGLMaskManager, 
    b.WebGLMaskManager.prototype.setContext = function(a) {
        this.gl = a;
    }, b.WebGLMaskManager.prototype.pushMask = function(a, c) {
        var d = c.gl;
        a.dirty && b.WebGLGraphics.updateGraphics(a, d), a._webGL[d.id].data.length && c.stencilManager.pushStencil(a, a._webGL[d.id].data[0], c);
    }, b.WebGLMaskManager.prototype.popMask = function(a, b) {
        var c = this.gl;
        b.stencilManager.popStencil(a, a._webGL[c.id].data[0], b);
    }, b.WebGLMaskManager.prototype.destroy = function() {
        this.gl = null;
    }, b.WebGLStencilManager = function() {
        this.stencilStack = [], this.reverse = !0, this.count = 0;
    }, b.WebGLStencilManager.prototype.setContext = function(a) {
        this.gl = a;
    }, b.WebGLStencilManager.prototype.pushStencil = function(a, b, c) {
        var d = this.gl;
        this.bindGraphics(a, b, c), 0 === this.stencilStack.length && (d.enable(d.STENCIL_TEST), 
        d.clear(d.STENCIL_BUFFER_BIT), this.reverse = !0, this.count = 0), this.stencilStack.push(b);
        var e = this.count;
        d.colorMask(!1, !1, !1, !1), d.stencilFunc(d.ALWAYS, 0, 255), d.stencilOp(d.KEEP, d.KEEP, d.INVERT), 
        1 === b.mode ? (d.drawElements(d.TRIANGLE_FAN, b.indices.length - 4, d.UNSIGNED_SHORT, 0), 
        this.reverse ? (d.stencilFunc(d.EQUAL, 255 - e, 255), d.stencilOp(d.KEEP, d.KEEP, d.DECR)) : (d.stencilFunc(d.EQUAL, e, 255), 
        d.stencilOp(d.KEEP, d.KEEP, d.INCR)), d.drawElements(d.TRIANGLE_FAN, 4, d.UNSIGNED_SHORT, 2 * (b.indices.length - 4)), 
        this.reverse ? d.stencilFunc(d.EQUAL, 255 - (e + 1), 255) : d.stencilFunc(d.EQUAL, e + 1, 255), 
        this.reverse = !this.reverse) : (this.reverse ? (d.stencilFunc(d.EQUAL, e, 255), 
        d.stencilOp(d.KEEP, d.KEEP, d.INCR)) : (d.stencilFunc(d.EQUAL, 255 - e, 255), d.stencilOp(d.KEEP, d.KEEP, d.DECR)), 
        d.drawElements(d.TRIANGLE_STRIP, b.indices.length, d.UNSIGNED_SHORT, 0), this.reverse ? d.stencilFunc(d.EQUAL, e + 1, 255) : d.stencilFunc(d.EQUAL, 255 - (e + 1), 255)), 
        d.colorMask(!0, !0, !0, !0), d.stencilOp(d.KEEP, d.KEEP, d.KEEP), this.count++;
    }, b.WebGLStencilManager.prototype.bindGraphics = function(a, c, d) {
        this._currentGraphics = a;
        var e, f = this.gl, g = d.projection, h = d.offset;
        1 === c.mode ? (e = d.shaderManager.complexPrimitiveShader, d.shaderManager.setShader(e), 
        f.uniform1f(e.flipY, d.flipY), f.uniformMatrix3fv(e.translationMatrix, !1, a.worldTransform.toArray(!0)), 
        f.uniform2f(e.projectionVector, g.x, -g.y), f.uniform2f(e.offsetVector, -h.x, -h.y), 
        f.uniform3fv(e.tintColor, b.hex2rgb(a.tint)), f.uniform3fv(e.color, c.color), f.uniform1f(e.alpha, a.worldAlpha * c.alpha), 
        f.bindBuffer(f.ARRAY_BUFFER, c.buffer), f.vertexAttribPointer(e.aVertexPosition, 2, f.FLOAT, !1, 8, 0), 
        f.bindBuffer(f.ELEMENT_ARRAY_BUFFER, c.indexBuffer)) : (e = d.shaderManager.primitiveShader, 
        d.shaderManager.setShader(e), f.uniformMatrix3fv(e.translationMatrix, !1, a.worldTransform.toArray(!0)), 
        f.uniform1f(e.flipY, d.flipY), f.uniform2f(e.projectionVector, g.x, -g.y), f.uniform2f(e.offsetVector, -h.x, -h.y), 
        f.uniform3fv(e.tintColor, b.hex2rgb(a.tint)), f.uniform1f(e.alpha, a.worldAlpha), 
        f.bindBuffer(f.ARRAY_BUFFER, c.buffer), f.vertexAttribPointer(e.aVertexPosition, 2, f.FLOAT, !1, 24, 0), 
        f.vertexAttribPointer(e.colorAttribute, 4, f.FLOAT, !1, 24, 8), f.bindBuffer(f.ELEMENT_ARRAY_BUFFER, c.indexBuffer));
    }, b.WebGLStencilManager.prototype.popStencil = function(a, b, c) {
        var d = this.gl;
        if (this.stencilStack.pop(), this.count--, 0 === this.stencilStack.length) d.disable(d.STENCIL_TEST); else {
            var e = this.count;
            this.bindGraphics(a, b, c), d.colorMask(!1, !1, !1, !1), 1 === b.mode ? (this.reverse = !this.reverse, 
            this.reverse ? (d.stencilFunc(d.EQUAL, 255 - (e + 1), 255), d.stencilOp(d.KEEP, d.KEEP, d.INCR)) : (d.stencilFunc(d.EQUAL, e + 1, 255), 
            d.stencilOp(d.KEEP, d.KEEP, d.DECR)), d.drawElements(d.TRIANGLE_FAN, 4, d.UNSIGNED_SHORT, 2 * (b.indices.length - 4)), 
            d.stencilFunc(d.ALWAYS, 0, 255), d.stencilOp(d.KEEP, d.KEEP, d.INVERT), d.drawElements(d.TRIANGLE_FAN, b.indices.length - 4, d.UNSIGNED_SHORT, 0), 
            this.reverse ? d.stencilFunc(d.EQUAL, e, 255) : d.stencilFunc(d.EQUAL, 255 - e, 255)) : (this.reverse ? (d.stencilFunc(d.EQUAL, e + 1, 255), 
            d.stencilOp(d.KEEP, d.KEEP, d.DECR)) : (d.stencilFunc(d.EQUAL, 255 - (e + 1), 255), 
            d.stencilOp(d.KEEP, d.KEEP, d.INCR)), d.drawElements(d.TRIANGLE_STRIP, b.indices.length, d.UNSIGNED_SHORT, 0), 
            this.reverse ? d.stencilFunc(d.EQUAL, e, 255) : d.stencilFunc(d.EQUAL, 255 - e, 255)), 
            d.colorMask(!0, !0, !0, !0), d.stencilOp(d.KEEP, d.KEEP, d.KEEP);
        }
    }, b.WebGLStencilManager.prototype.destroy = function() {
        this.stencilStack = null, this.gl = null;
    }, b.WebGLShaderManager = function() {
        this.maxAttibs = 10, this.attribState = [], this.tempAttribState = [];
        for (var a = 0; a < this.maxAttibs; a++) this.attribState[a] = !1;
        this.stack = [];
    }, b.WebGLShaderManager.prototype.constructor = b.WebGLShaderManager, b.WebGLShaderManager.prototype.setContext = function(a) {
        this.gl = a, this.primitiveShader = new b.PrimitiveShader(a), this.complexPrimitiveShader = new b.ComplexPrimitiveShader(a), 
        this.defaultShader = new b.PixiShader(a), this.fastShader = new b.PixiFastShader(a), 
        this.stripShader = new b.StripShader(a), this.setShader(this.defaultShader);
    }, b.WebGLShaderManager.prototype.setAttribs = function(a) {
        var b;
        for (b = 0; b < this.tempAttribState.length; b++) this.tempAttribState[b] = !1;
        for (b = 0; b < a.length; b++) {
            var c = a[b];
            this.tempAttribState[c] = !0;
        }
        var d = this.gl;
        for (b = 0; b < this.attribState.length; b++) this.attribState[b] !== this.tempAttribState[b] && (this.attribState[b] = this.tempAttribState[b], 
        this.tempAttribState[b] ? d.enableVertexAttribArray(b) : d.disableVertexAttribArray(b));
    }, b.WebGLShaderManager.prototype.setShader = function(a) {
        return this._currentId === a._UID ? !1 : (this._currentId = a._UID, this.currentShader = a, 
        this.gl.useProgram(a.program), this.setAttribs(a.attributes), !0);
    }, b.WebGLShaderManager.prototype.destroy = function() {
        this.attribState = null, this.tempAttribState = null, this.primitiveShader.destroy(), 
        this.complexPrimitiveShader.destroy(), this.defaultShader.destroy(), this.fastShader.destroy(), 
        this.stripShader.destroy(), this.gl = null;
    }, b.WebGLSpriteBatch = function() {
        this.vertSize = 5, this.size = 2e3;
        var a = 4 * this.size * 4 * this.vertSize, c = 6 * this.size;
        this.vertices = new b.ArrayBuffer(a), this.positions = new b.Float32Array(this.vertices), 
        this.colors = new b.Uint32Array(this.vertices), this.indices = new b.Uint16Array(c), 
        this.lastIndexCount = 0;
        for (var d = 0, e = 0; c > d; d += 6, e += 4) this.indices[d + 0] = e + 0, this.indices[d + 1] = e + 1, 
        this.indices[d + 2] = e + 2, this.indices[d + 3] = e + 0, this.indices[d + 4] = e + 2, 
        this.indices[d + 5] = e + 3;
        this.drawing = !1, this.currentBatchSize = 0, this.currentBaseTexture = null, this.dirty = !0, 
        this.textures = [], this.blendModes = [], this.shaders = [], this.sprites = [], 
        this.defaultShader = new b.AbstractFilter([ "precision lowp float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform sampler2D uSampler;", "void main(void) {", "   gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor ;", "}" ]);
    }, b.WebGLSpriteBatch.prototype.setContext = function(a) {
        this.gl = a, this.vertexBuffer = a.createBuffer(), this.indexBuffer = a.createBuffer(), 
        a.bindBuffer(a.ELEMENT_ARRAY_BUFFER, this.indexBuffer), a.bufferData(a.ELEMENT_ARRAY_BUFFER, this.indices, a.STATIC_DRAW), 
        a.bindBuffer(a.ARRAY_BUFFER, this.vertexBuffer), a.bufferData(a.ARRAY_BUFFER, this.vertices, a.DYNAMIC_DRAW), 
        this.currentBlendMode = 99999;
        var c = new b.PixiShader(a);
        c.fragmentSrc = this.defaultShader.fragmentSrc, c.uniforms = {}, c.init(), this.defaultShader.shaders[a.id] = c;
    }, b.WebGLSpriteBatch.prototype.begin = function(a) {
        this.renderSession = a, this.shader = this.renderSession.shaderManager.defaultShader, 
        this.start();
    }, b.WebGLSpriteBatch.prototype.end = function() {
        this.flush();
    }, b.WebGLSpriteBatch.prototype.render = function(a) {
        var b = a.texture;
        this.currentBatchSize >= this.size && (this.flush(), this.currentBaseTexture = b.baseTexture);
        var c = b._uvs;
        if (c) {
            var d, e, f, g, h = a.anchor.x, i = a.anchor.y;
            if (b.trim) {
                var j = b.trim;
                e = j.x - h * j.width, d = e + b.crop.width, g = j.y - i * j.height, f = g + b.crop.height;
            } else d = b.frame.width * (1 - h), e = b.frame.width * -h, f = b.frame.height * (1 - i), 
            g = b.frame.height * -i;
            var k = 4 * this.currentBatchSize * this.vertSize, l = b.baseTexture.resolution, m = a.worldTransform, n = m.a / l, o = m.b / l, p = m.c / l, q = m.d / l, r = m.tx, s = m.ty, t = this.colors, u = this.positions;
            this.renderSession.roundPixels ? (u[k] = n * e + p * g + r | 0, u[k + 1] = q * g + o * e + s | 0, 
            u[k + 5] = n * d + p * g + r | 0, u[k + 6] = q * g + o * d + s | 0, u[k + 10] = n * d + p * f + r | 0, 
            u[k + 11] = q * f + o * d + s | 0, u[k + 15] = n * e + p * f + r | 0, u[k + 16] = q * f + o * e + s | 0) : (u[k] = n * e + p * g + r, 
            u[k + 1] = q * g + o * e + s, u[k + 5] = n * d + p * g + r, u[k + 6] = q * g + o * d + s, 
            u[k + 10] = n * d + p * f + r, u[k + 11] = q * f + o * d + s, u[k + 15] = n * e + p * f + r, 
            u[k + 16] = q * f + o * e + s), u[k + 2] = c.x0, u[k + 3] = c.y0, u[k + 7] = c.x1, 
            u[k + 8] = c.y1, u[k + 12] = c.x2, u[k + 13] = c.y2, u[k + 17] = c.x3, u[k + 18] = c.y3;
            var v = a.tint;
            t[k + 4] = t[k + 9] = t[k + 14] = t[k + 19] = (v >> 16) + (65280 & v) + ((255 & v) << 16) + (255 * a.worldAlpha << 24), 
            this.sprites[this.currentBatchSize++] = a;
        }
    }, b.WebGLSpriteBatch.prototype.renderTilingSprite = function(a) {
        var c = a.tilingTexture;
        this.currentBatchSize >= this.size && (this.flush(), this.currentBaseTexture = c.baseTexture), 
        a._uvs || (a._uvs = new b.TextureUvs());
        var d = a._uvs;
        a.tilePosition.x %= c.baseTexture.width * a.tileScaleOffset.x, a.tilePosition.y %= c.baseTexture.height * a.tileScaleOffset.y;
        var e = a.tilePosition.x / (c.baseTexture.width * a.tileScaleOffset.x), f = a.tilePosition.y / (c.baseTexture.height * a.tileScaleOffset.y), g = a.width / c.baseTexture.width / (a.tileScale.x * a.tileScaleOffset.x), h = a.height / c.baseTexture.height / (a.tileScale.y * a.tileScaleOffset.y);
        d.x0 = 0 - e, d.y0 = 0 - f, d.x1 = 1 * g - e, d.y1 = 0 - f, d.x2 = 1 * g - e, d.y2 = 1 * h - f, 
        d.x3 = 0 - e, d.y3 = 1 * h - f;
        var i = a.tint, j = (i >> 16) + (65280 & i) + ((255 & i) << 16) + (255 * a.alpha << 24), k = this.positions, l = this.colors, m = a.width, n = a.height, o = a.anchor.x, p = a.anchor.y, q = m * (1 - o), r = m * -o, s = n * (1 - p), t = n * -p, u = 4 * this.currentBatchSize * this.vertSize, v = c.baseTexture.resolution, w = a.worldTransform, x = w.a / v, y = w.b / v, z = w.c / v, A = w.d / v, B = w.tx, C = w.ty;
        k[u++] = x * r + z * t + B, k[u++] = A * t + y * r + C, k[u++] = d.x0, k[u++] = d.y0, 
        l[u++] = j, k[u++] = x * q + z * t + B, k[u++] = A * t + y * q + C, k[u++] = d.x1, 
        k[u++] = d.y1, l[u++] = j, k[u++] = x * q + z * s + B, k[u++] = A * s + y * q + C, 
        k[u++] = d.x2, k[u++] = d.y2, l[u++] = j, k[u++] = x * r + z * s + B, k[u++] = A * s + y * r + C, 
        k[u++] = d.x3, k[u++] = d.y3, l[u++] = j, this.sprites[this.currentBatchSize++] = a;
    }, b.WebGLSpriteBatch.prototype.flush = function() {
        if (0 !== this.currentBatchSize) {
            var a, c = this.gl;
            if (this.dirty) {
                this.dirty = !1, c.activeTexture(c.TEXTURE0), c.bindBuffer(c.ARRAY_BUFFER, this.vertexBuffer), 
                c.bindBuffer(c.ELEMENT_ARRAY_BUFFER, this.indexBuffer), a = this.defaultShader.shaders[c.id];
                var d = 4 * this.vertSize;
                c.vertexAttribPointer(a.aVertexPosition, 2, c.FLOAT, !1, d, 0), c.vertexAttribPointer(a.aTextureCoord, 2, c.FLOAT, !1, d, 8), 
                c.vertexAttribPointer(a.colorAttribute, 4, c.UNSIGNED_BYTE, !0, d, 16);
            }
            if (this.currentBatchSize > .5 * this.size) c.bufferSubData(c.ARRAY_BUFFER, 0, this.vertices); else {
                var e = this.positions.subarray(0, 4 * this.currentBatchSize * this.vertSize);
                c.bufferSubData(c.ARRAY_BUFFER, 0, e);
            }
            for (var f, g, h, i, j = 0, k = 0, l = null, m = this.renderSession.blendModeManager.currentBlendMode, n = null, o = !1, p = !1, q = 0, r = this.currentBatchSize; r > q; q++) {
                if (i = this.sprites[q], f = i.texture.baseTexture, g = i.blendMode, h = i.shader || this.defaultShader, 
                o = m !== g, p = n !== h, (l !== f || o || p) && (this.renderBatch(l, j, k), k = q, 
                j = 0, l = f, o && (m = g, this.renderSession.blendModeManager.setBlendMode(m)), 
                p)) {
                    n = h, a = n.shaders[c.id], a || (a = new b.PixiShader(c), a.fragmentSrc = n.fragmentSrc, 
                    a.uniforms = n.uniforms, a.init(), n.shaders[c.id] = a), this.renderSession.shaderManager.setShader(a), 
                    a.dirty && a.syncUniforms();
                    var s = this.renderSession.projection;
                    c.uniform2f(a.projectionVector, s.x, s.y);
                    var t = this.renderSession.offset;
                    c.uniform2f(a.offsetVector, t.x, t.y);
                }
                j++;
            }
            this.renderBatch(l, j, k), this.currentBatchSize = 0;
        }
    }, b.WebGLSpriteBatch.prototype.renderBatch = function(a, b, c) {
        if (0 !== b) {
            var d = this.gl;
            a._dirty[d.id] ? this.renderSession.renderer.updateTexture(a) : d.bindTexture(d.TEXTURE_2D, a._glTextures[d.id]), 
            d.drawElements(d.TRIANGLES, 6 * b, d.UNSIGNED_SHORT, 6 * c * 2), this.renderSession.drawCount++;
        }
    }, b.WebGLSpriteBatch.prototype.stop = function() {
        this.flush(), this.dirty = !0;
    }, b.WebGLSpriteBatch.prototype.start = function() {
        this.dirty = !0;
    }, b.WebGLSpriteBatch.prototype.destroy = function() {
        this.vertices = null, this.indices = null, this.gl.deleteBuffer(this.vertexBuffer), 
        this.gl.deleteBuffer(this.indexBuffer), this.currentBaseTexture = null, this.gl = null;
    }, b.WebGLFastSpriteBatch = function(a) {
        this.vertSize = 10, this.maxSize = 6e3, this.size = this.maxSize;
        var c = 4 * this.size * this.vertSize, d = 6 * this.maxSize;
        this.vertices = new b.Float32Array(c), this.indices = new b.Uint16Array(d), this.vertexBuffer = null, 
        this.indexBuffer = null, this.lastIndexCount = 0;
        for (var e = 0, f = 0; d > e; e += 6, f += 4) this.indices[e + 0] = f + 0, this.indices[e + 1] = f + 1, 
        this.indices[e + 2] = f + 2, this.indices[e + 3] = f + 0, this.indices[e + 4] = f + 2, 
        this.indices[e + 5] = f + 3;
        this.drawing = !1, this.currentBatchSize = 0, this.currentBaseTexture = null, this.currentBlendMode = 0, 
        this.renderSession = null, this.shader = null, this.matrix = null, this.setContext(a);
    }, b.WebGLFastSpriteBatch.prototype.constructor = b.WebGLFastSpriteBatch, b.WebGLFastSpriteBatch.prototype.setContext = function(a) {
        this.gl = a, this.vertexBuffer = a.createBuffer(), this.indexBuffer = a.createBuffer(), 
        a.bindBuffer(a.ELEMENT_ARRAY_BUFFER, this.indexBuffer), a.bufferData(a.ELEMENT_ARRAY_BUFFER, this.indices, a.STATIC_DRAW), 
        a.bindBuffer(a.ARRAY_BUFFER, this.vertexBuffer), a.bufferData(a.ARRAY_BUFFER, this.vertices, a.DYNAMIC_DRAW);
    }, b.WebGLFastSpriteBatch.prototype.begin = function(a, b) {
        this.renderSession = b, this.shader = this.renderSession.shaderManager.fastShader, 
        this.matrix = a.worldTransform.toArray(!0), this.start();
    }, b.WebGLFastSpriteBatch.prototype.end = function() {
        this.flush();
    }, b.WebGLFastSpriteBatch.prototype.render = function(a) {
        var b = a.children, c = b[0];
        if (c.texture._uvs) {
            this.currentBaseTexture = c.texture.baseTexture, c.blendMode !== this.renderSession.blendModeManager.currentBlendMode && (this.flush(), 
            this.renderSession.blendModeManager.setBlendMode(c.blendMode));
            for (var d = 0, e = b.length; e > d; d++) this.renderSprite(b[d]);
            this.flush();
        }
    }, b.WebGLFastSpriteBatch.prototype.renderSprite = function(a) {
        if (a.visible && (a.texture.baseTexture === this.currentBaseTexture || (this.flush(), 
        this.currentBaseTexture = a.texture.baseTexture, a.texture._uvs))) {
            var b, c, d, e, f, g, h, i, j = this.vertices;
            if (b = a.texture._uvs, c = a.texture.frame.width, d = a.texture.frame.height, a.texture.trim) {
                var k = a.texture.trim;
                f = k.x - a.anchor.x * k.width, e = f + a.texture.crop.width, h = k.y - a.anchor.y * k.height, 
                g = h + a.texture.crop.height;
            } else e = a.texture.frame.width * (1 - a.anchor.x), f = a.texture.frame.width * -a.anchor.x, 
            g = a.texture.frame.height * (1 - a.anchor.y), h = a.texture.frame.height * -a.anchor.y;
            i = 4 * this.currentBatchSize * this.vertSize, j[i++] = f, j[i++] = h, j[i++] = a.position.x, 
            j[i++] = a.position.y, j[i++] = a.scale.x, j[i++] = a.scale.y, j[i++] = a.rotation, 
            j[i++] = b.x0, j[i++] = b.y1, j[i++] = a.alpha, j[i++] = e, j[i++] = h, j[i++] = a.position.x, 
            j[i++] = a.position.y, j[i++] = a.scale.x, j[i++] = a.scale.y, j[i++] = a.rotation, 
            j[i++] = b.x1, j[i++] = b.y1, j[i++] = a.alpha, j[i++] = e, j[i++] = g, j[i++] = a.position.x, 
            j[i++] = a.position.y, j[i++] = a.scale.x, j[i++] = a.scale.y, j[i++] = a.rotation, 
            j[i++] = b.x2, j[i++] = b.y2, j[i++] = a.alpha, j[i++] = f, j[i++] = g, j[i++] = a.position.x, 
            j[i++] = a.position.y, j[i++] = a.scale.x, j[i++] = a.scale.y, j[i++] = a.rotation, 
            j[i++] = b.x3, j[i++] = b.y3, j[i++] = a.alpha, this.currentBatchSize++, this.currentBatchSize >= this.size && this.flush();
        }
    }, b.WebGLFastSpriteBatch.prototype.flush = function() {
        if (0 !== this.currentBatchSize) {
            var a = this.gl;
            if (this.currentBaseTexture._glTextures[a.id] || this.renderSession.renderer.updateTexture(this.currentBaseTexture, a), 
            a.bindTexture(a.TEXTURE_2D, this.currentBaseTexture._glTextures[a.id]), this.currentBatchSize > .5 * this.size) a.bufferSubData(a.ARRAY_BUFFER, 0, this.vertices); else {
                var b = this.vertices.subarray(0, 4 * this.currentBatchSize * this.vertSize);
                a.bufferSubData(a.ARRAY_BUFFER, 0, b);
            }
            a.drawElements(a.TRIANGLES, 6 * this.currentBatchSize, a.UNSIGNED_SHORT, 0), this.currentBatchSize = 0, 
            this.renderSession.drawCount++;
        }
    }, b.WebGLFastSpriteBatch.prototype.stop = function() {
        this.flush();
    }, b.WebGLFastSpriteBatch.prototype.start = function() {
        var a = this.gl;
        a.activeTexture(a.TEXTURE0), a.bindBuffer(a.ARRAY_BUFFER, this.vertexBuffer), a.bindBuffer(a.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        var b = this.renderSession.projection;
        a.uniform2f(this.shader.projectionVector, b.x, b.y), a.uniformMatrix3fv(this.shader.uMatrix, !1, this.matrix);
        var c = 4 * this.vertSize;
        a.vertexAttribPointer(this.shader.aVertexPosition, 2, a.FLOAT, !1, c, 0), a.vertexAttribPointer(this.shader.aPositionCoord, 2, a.FLOAT, !1, c, 8), 
        a.vertexAttribPointer(this.shader.aScale, 2, a.FLOAT, !1, c, 16), a.vertexAttribPointer(this.shader.aRotation, 1, a.FLOAT, !1, c, 24), 
        a.vertexAttribPointer(this.shader.aTextureCoord, 2, a.FLOAT, !1, c, 28), a.vertexAttribPointer(this.shader.colorAttribute, 1, a.FLOAT, !1, c, 36);
    }, b.WebGLFilterManager = function() {
        this.filterStack = [], this.offsetX = 0, this.offsetY = 0;
    }, b.WebGLFilterManager.prototype.constructor = b.WebGLFilterManager, b.WebGLFilterManager.prototype.setContext = function(a) {
        this.gl = a, this.texturePool = [], this.initShaderBuffers();
    }, b.WebGLFilterManager.prototype.begin = function(a, b) {
        this.renderSession = a, this.defaultShader = a.shaderManager.defaultShader;
        var c = this.renderSession.projection;
        this.width = 2 * c.x, this.height = 2 * -c.y, this.buffer = b;
    }, b.WebGLFilterManager.prototype.pushFilter = function(a) {
        var c = this.gl, d = this.renderSession.projection, e = this.renderSession.offset;
        a._filterArea = a.target.filterArea || a.target.getBounds(), this.filterStack.push(a);
        var f = a.filterPasses[0];
        this.offsetX += a._filterArea.x, this.offsetY += a._filterArea.y;
        var g = this.texturePool.pop();
        g ? g.resize(this.width, this.height) : g = new b.FilterTexture(this.gl, this.width, this.height), 
        c.bindTexture(c.TEXTURE_2D, g.texture);
        var h = a._filterArea, i = f.padding;
        h.x -= i, h.y -= i, h.width += 2 * i, h.height += 2 * i, h.x < 0 && (h.x = 0), h.width > this.width && (h.width = this.width), 
        h.y < 0 && (h.y = 0), h.height > this.height && (h.height = this.height), c.bindFramebuffer(c.FRAMEBUFFER, g.frameBuffer), 
        c.viewport(0, 0, h.width, h.height), d.x = h.width / 2, d.y = -h.height / 2, e.x = -h.x, 
        e.y = -h.y, c.colorMask(!0, !0, !0, !0), c.clearColor(0, 0, 0, 0), c.clear(c.COLOR_BUFFER_BIT), 
        a._glFilterTexture = g;
    }, b.WebGLFilterManager.prototype.popFilter = function() {
        var a = this.gl, c = this.filterStack.pop(), d = c._filterArea, e = c._glFilterTexture, f = this.renderSession.projection, g = this.renderSession.offset;
        if (c.filterPasses.length > 1) {
            a.viewport(0, 0, d.width, d.height), a.bindBuffer(a.ARRAY_BUFFER, this.vertexBuffer), 
            this.vertexArray[0] = 0, this.vertexArray[1] = d.height, this.vertexArray[2] = d.width, 
            this.vertexArray[3] = d.height, this.vertexArray[4] = 0, this.vertexArray[5] = 0, 
            this.vertexArray[6] = d.width, this.vertexArray[7] = 0, a.bufferSubData(a.ARRAY_BUFFER, 0, this.vertexArray), 
            a.bindBuffer(a.ARRAY_BUFFER, this.uvBuffer), this.uvArray[2] = d.width / this.width, 
            this.uvArray[5] = d.height / this.height, this.uvArray[6] = d.width / this.width, 
            this.uvArray[7] = d.height / this.height, a.bufferSubData(a.ARRAY_BUFFER, 0, this.uvArray);
            var h = e, i = this.texturePool.pop();
            i || (i = new b.FilterTexture(this.gl, this.width, this.height)), i.resize(this.width, this.height), 
            a.bindFramebuffer(a.FRAMEBUFFER, i.frameBuffer), a.clear(a.COLOR_BUFFER_BIT), a.disable(a.BLEND);
            for (var j = 0; j < c.filterPasses.length - 1; j++) {
                var k = c.filterPasses[j];
                a.bindFramebuffer(a.FRAMEBUFFER, i.frameBuffer), a.activeTexture(a.TEXTURE0), a.bindTexture(a.TEXTURE_2D, h.texture), 
                this.applyFilterPass(k, d, d.width, d.height);
                var l = h;
                h = i, i = l;
            }
            a.enable(a.BLEND), e = h, this.texturePool.push(i);
        }
        var m = c.filterPasses[c.filterPasses.length - 1];
        this.offsetX -= d.x, this.offsetY -= d.y;
        var n = this.width, o = this.height, p = 0, q = 0, r = this.buffer;
        if (0 === this.filterStack.length) a.colorMask(!0, !0, !0, !0); else {
            var s = this.filterStack[this.filterStack.length - 1];
            d = s._filterArea, n = d.width, o = d.height, p = d.x, q = d.y, r = s._glFilterTexture.frameBuffer;
        }
        f.x = n / 2, f.y = -o / 2, g.x = p, g.y = q, d = c._filterArea;
        var t = d.x - p, u = d.y - q;
        a.bindBuffer(a.ARRAY_BUFFER, this.vertexBuffer), this.vertexArray[0] = t, this.vertexArray[1] = u + d.height, 
        this.vertexArray[2] = t + d.width, this.vertexArray[3] = u + d.height, this.vertexArray[4] = t, 
        this.vertexArray[5] = u, this.vertexArray[6] = t + d.width, this.vertexArray[7] = u, 
        a.bufferSubData(a.ARRAY_BUFFER, 0, this.vertexArray), a.bindBuffer(a.ARRAY_BUFFER, this.uvBuffer), 
        this.uvArray[2] = d.width / this.width, this.uvArray[5] = d.height / this.height, 
        this.uvArray[6] = d.width / this.width, this.uvArray[7] = d.height / this.height, 
        a.bufferSubData(a.ARRAY_BUFFER, 0, this.uvArray), a.viewport(0, 0, n * this.renderSession.resolution, o * this.renderSession.resolution), 
        a.bindFramebuffer(a.FRAMEBUFFER, r), a.activeTexture(a.TEXTURE0), a.bindTexture(a.TEXTURE_2D, e.texture), 
        this.applyFilterPass(m, d, n, o), this.texturePool.push(e), c._glFilterTexture = null;
    }, b.WebGLFilterManager.prototype.applyFilterPass = function(a, c, d, e) {
        var f = this.gl, g = a.shaders[f.id];
        g || (g = new b.PixiShader(f), g.fragmentSrc = a.fragmentSrc, g.uniforms = a.uniforms, 
        g.init(), a.shaders[f.id] = g), this.renderSession.shaderManager.setShader(g), f.uniform2f(g.projectionVector, d / 2, -e / 2), 
        f.uniform2f(g.offsetVector, 0, 0), a.uniforms.dimensions && (a.uniforms.dimensions.value[0] = this.width, 
        a.uniforms.dimensions.value[1] = this.height, a.uniforms.dimensions.value[2] = this.vertexArray[0], 
        a.uniforms.dimensions.value[3] = this.vertexArray[5]), g.syncUniforms(), f.bindBuffer(f.ARRAY_BUFFER, this.vertexBuffer), 
        f.vertexAttribPointer(g.aVertexPosition, 2, f.FLOAT, !1, 0, 0), f.bindBuffer(f.ARRAY_BUFFER, this.uvBuffer), 
        f.vertexAttribPointer(g.aTextureCoord, 2, f.FLOAT, !1, 0, 0), f.bindBuffer(f.ARRAY_BUFFER, this.colorBuffer), 
        f.vertexAttribPointer(g.colorAttribute, 2, f.FLOAT, !1, 0, 0), f.bindBuffer(f.ELEMENT_ARRAY_BUFFER, this.indexBuffer), 
        f.drawElements(f.TRIANGLES, 6, f.UNSIGNED_SHORT, 0), this.renderSession.drawCount++;
    }, b.WebGLFilterManager.prototype.initShaderBuffers = function() {
        var a = this.gl;
        this.vertexBuffer = a.createBuffer(), this.uvBuffer = a.createBuffer(), this.colorBuffer = a.createBuffer(), 
        this.indexBuffer = a.createBuffer(), this.vertexArray = new b.Float32Array([ 0, 0, 1, 0, 0, 1, 1, 1 ]), 
        a.bindBuffer(a.ARRAY_BUFFER, this.vertexBuffer), a.bufferData(a.ARRAY_BUFFER, this.vertexArray, a.STATIC_DRAW), 
        this.uvArray = new b.Float32Array([ 0, 0, 1, 0, 0, 1, 1, 1 ]), a.bindBuffer(a.ARRAY_BUFFER, this.uvBuffer), 
        a.bufferData(a.ARRAY_BUFFER, this.uvArray, a.STATIC_DRAW), this.colorArray = new b.Float32Array([ 1, 16777215, 1, 16777215, 1, 16777215, 1, 16777215 ]), 
        a.bindBuffer(a.ARRAY_BUFFER, this.colorBuffer), a.bufferData(a.ARRAY_BUFFER, this.colorArray, a.STATIC_DRAW), 
        a.bindBuffer(a.ELEMENT_ARRAY_BUFFER, this.indexBuffer), a.bufferData(a.ELEMENT_ARRAY_BUFFER, new Uint16Array([ 0, 1, 2, 1, 3, 2 ]), a.STATIC_DRAW);
    }, b.WebGLFilterManager.prototype.destroy = function() {
        var a = this.gl;
        this.filterStack = null, this.offsetX = 0, this.offsetY = 0;
        for (var b = 0; b < this.texturePool.length; b++) this.texturePool[b].destroy();
        this.texturePool = null, a.deleteBuffer(this.vertexBuffer), a.deleteBuffer(this.uvBuffer), 
        a.deleteBuffer(this.colorBuffer), a.deleteBuffer(this.indexBuffer);
    }, b.FilterTexture = function(a, c, d, e) {
        this.gl = a, this.frameBuffer = a.createFramebuffer(), this.texture = a.createTexture(), 
        e = e || b.scaleModes.DEFAULT, a.bindTexture(a.TEXTURE_2D, this.texture), a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MAG_FILTER, e === b.scaleModes.LINEAR ? a.LINEAR : a.NEAREST), 
        a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MIN_FILTER, e === b.scaleModes.LINEAR ? a.LINEAR : a.NEAREST), 
        a.texParameteri(a.TEXTURE_2D, a.TEXTURE_WRAP_S, a.CLAMP_TO_EDGE), a.texParameteri(a.TEXTURE_2D, a.TEXTURE_WRAP_T, a.CLAMP_TO_EDGE), 
        a.bindFramebuffer(a.FRAMEBUFFER, this.frameBuffer), a.bindFramebuffer(a.FRAMEBUFFER, this.frameBuffer), 
        a.framebufferTexture2D(a.FRAMEBUFFER, a.COLOR_ATTACHMENT0, a.TEXTURE_2D, this.texture, 0), 
        this.renderBuffer = a.createRenderbuffer(), a.bindRenderbuffer(a.RENDERBUFFER, this.renderBuffer), 
        a.framebufferRenderbuffer(a.FRAMEBUFFER, a.DEPTH_STENCIL_ATTACHMENT, a.RENDERBUFFER, this.renderBuffer), 
        this.resize(c, d);
    }, b.FilterTexture.prototype.constructor = b.FilterTexture, b.FilterTexture.prototype.clear = function() {
        var a = this.gl;
        a.clearColor(0, 0, 0, 0), a.clear(a.COLOR_BUFFER_BIT);
    }, b.FilterTexture.prototype.resize = function(a, b) {
        if (this.width !== a || this.height !== b) {
            this.width = a, this.height = b;
            var c = this.gl;
            c.bindTexture(c.TEXTURE_2D, this.texture), c.texImage2D(c.TEXTURE_2D, 0, c.RGBA, a, b, 0, c.RGBA, c.UNSIGNED_BYTE, null), 
            c.bindRenderbuffer(c.RENDERBUFFER, this.renderBuffer), c.renderbufferStorage(c.RENDERBUFFER, c.DEPTH_STENCIL, a, b);
        }
    }, b.FilterTexture.prototype.destroy = function() {
        var a = this.gl;
        a.deleteFramebuffer(this.frameBuffer), a.deleteTexture(this.texture), this.frameBuffer = null, 
        this.texture = null;
    }, b.CanvasBuffer = function(a, b) {
        this.width = a, this.height = b, this.canvas = document.createElement("canvas"), 
        this.context = this.canvas.getContext("2d"), this.canvas.width = a, this.canvas.height = b;
    }, b.CanvasBuffer.prototype.constructor = b.CanvasBuffer, b.CanvasBuffer.prototype.clear = function() {
        this.context.setTransform(1, 0, 0, 1, 0, 0), this.context.clearRect(0, 0, this.width, this.height);
    }, b.CanvasBuffer.prototype.resize = function(a, b) {
        this.width = this.canvas.width = a, this.height = this.canvas.height = b;
    }, b.CanvasMaskManager = function() {}, b.CanvasMaskManager.prototype.constructor = b.CanvasMaskManager, 
    b.CanvasMaskManager.prototype.pushMask = function(a, c) {
        var d = c.context;
        d.save();
        var e = a.alpha, f = a.worldTransform, g = c.resolution;
        d.setTransform(f.a * g, f.b * g, f.c * g, f.d * g, f.tx * g, f.ty * g), b.CanvasGraphics.renderGraphicsMask(a, d), 
        d.clip(), a.worldAlpha = e;
    }, b.CanvasMaskManager.prototype.popMask = function(a) {
        a.context.restore();
    }, b.CanvasTinter = function() {}, b.CanvasTinter.getTintedTexture = function(a, c) {
        var d = a.texture;
        c = b.CanvasTinter.roundColor(c);
        var e = "#" + ("00000" + (0 | c).toString(16)).substr(-6);
        if (d.tintCache = d.tintCache || {}, d.tintCache[e]) return d.tintCache[e];
        var f = b.CanvasTinter.canvas || document.createElement("canvas");
        if (b.CanvasTinter.tintMethod(d, c, f), b.CanvasTinter.convertTintToImage) {
            var g = new Image();
            g.src = f.toDataURL(), d.tintCache[e] = g;
        } else d.tintCache[e] = f, b.CanvasTinter.canvas = null;
        return f;
    }, b.CanvasTinter.tintWithMultiply = function(a, b, c) {
        var d = c.getContext("2d"), e = a.crop;
        c.width = e.width, c.height = e.height, d.fillStyle = "#" + ("00000" + (0 | b).toString(16)).substr(-6), 
        d.fillRect(0, 0, e.width, e.height), d.globalCompositeOperation = "multiply", d.drawImage(a.baseTexture.source, e.x, e.y, e.width, e.height, 0, 0, e.width, e.height), 
        d.globalCompositeOperation = "destination-atop", d.drawImage(a.baseTexture.source, e.x, e.y, e.width, e.height, 0, 0, e.width, e.height);
    }, b.CanvasTinter.tintWithOverlay = function(a, b, c) {
        var d = c.getContext("2d"), e = a.crop;
        c.width = e.width, c.height = e.height, d.globalCompositeOperation = "copy", d.fillStyle = "#" + ("00000" + (0 | b).toString(16)).substr(-6), 
        d.fillRect(0, 0, e.width, e.height), d.globalCompositeOperation = "destination-atop", 
        d.drawImage(a.baseTexture.source, e.x, e.y, e.width, e.height, 0, 0, e.width, e.height);
    }, b.CanvasTinter.tintWithPerPixel = function(a, c, d) {
        var e = d.getContext("2d"), f = a.crop;
        d.width = f.width, d.height = f.height, e.globalCompositeOperation = "copy", e.drawImage(a.baseTexture.source, f.x, f.y, f.width, f.height, 0, 0, f.width, f.height);
        for (var g = b.hex2rgb(c), h = g[0], i = g[1], j = g[2], k = e.getImageData(0, 0, f.width, f.height), l = k.data, m = 0; m < l.length; m += 4) l[m + 0] *= h, 
        l[m + 1] *= i, l[m + 2] *= j;
        e.putImageData(k, 0, 0);
    }, b.CanvasTinter.roundColor = function(a) {
        var c = b.CanvasTinter.cacheStepsPerColorChannel, d = b.hex2rgb(a);
        return d[0] = Math.min(255, d[0] / c * c), d[1] = Math.min(255, d[1] / c * c), d[2] = Math.min(255, d[2] / c * c), 
        b.rgb2hex(d);
    }, b.CanvasTinter.cacheStepsPerColorChannel = 8, b.CanvasTinter.convertTintToImage = !1, 
    b.CanvasTinter.canUseMultiply = b.canUseNewCanvasBlendModes(), b.CanvasTinter.tintMethod = b.CanvasTinter.canUseMultiply ? b.CanvasTinter.tintWithMultiply : b.CanvasTinter.tintWithPerPixel, 
    b.CanvasRenderer = function(a, c, d) {
        if (d) for (var e in b.defaultRenderOptions) "undefined" == typeof d[e] && (d[e] = b.defaultRenderOptions[e]); else d = b.defaultRenderOptions;
        b.defaultRenderer || (b.sayHello("Canvas"), b.defaultRenderer = this), this.type = b.CANVAS_RENDERER, 
        this.resolution = d.resolution, this.clearBeforeRender = d.clearBeforeRender, this.transparent = d.transparent, 
        this.autoResize = d.autoResize || !1, this.width = a || 800, this.height = c || 600, 
        this.width *= this.resolution, this.height *= this.resolution, this.view = d.view || document.createElement("canvas"), 
        this.context = this.view.getContext("2d", {
            alpha: this.transparent
        }), this.refresh = !0, this.view.width = this.width * this.resolution, this.view.height = this.height * this.resolution, 
        this.count = 0, this.maskManager = new b.CanvasMaskManager(), this.renderSession = {
            context: this.context,
            maskManager: this.maskManager,
            scaleMode: null,
            smoothProperty: null,
            roundPixels: !1
        }, this.mapBlendModes(), this.resize(a, c), "imageSmoothingEnabled" in this.context ? this.renderSession.smoothProperty = "imageSmoothingEnabled" : "webkitImageSmoothingEnabled" in this.context ? this.renderSession.smoothProperty = "webkitImageSmoothingEnabled" : "mozImageSmoothingEnabled" in this.context ? this.renderSession.smoothProperty = "mozImageSmoothingEnabled" : "oImageSmoothingEnabled" in this.context ? this.renderSession.smoothProperty = "oImageSmoothingEnabled" : "msImageSmoothingEnabled" in this.context && (this.renderSession.smoothProperty = "msImageSmoothingEnabled");
    }, b.CanvasRenderer.prototype.constructor = b.CanvasRenderer, b.CanvasRenderer.prototype.render = function(a) {
        a.updateTransform(), this.context.setTransform(1, 0, 0, 1, 0, 0), this.context.globalAlpha = 1, 
        this.renderSession.currentBlendMode = b.blendModes.NORMAL, this.context.globalCompositeOperation = b.blendModesCanvas[b.blendModes.NORMAL], 
        navigator.isCocoonJS && this.view.screencanvas && (this.context.fillStyle = "black", 
        this.context.clear()), this.clearBeforeRender && (this.transparent ? this.context.clearRect(0, 0, this.width, this.height) : (this.context.fillStyle = a.backgroundColorString, 
        this.context.fillRect(0, 0, this.width, this.height))), this.renderDisplayObject(a), 
        a.interactive && (a._interactiveEventsAdded || (a._interactiveEventsAdded = !0, 
        a.interactionManager.setTarget(this)));
    }, b.CanvasRenderer.prototype.destroy = function(a) {
        "undefined" == typeof a && (a = !0), a && this.view.parent && this.view.parent.removeChild(this.view), 
        this.view = null, this.context = null, this.maskManager = null, this.renderSession = null;
    }, b.CanvasRenderer.prototype.resize = function(a, b) {
        this.width = a * this.resolution, this.height = b * this.resolution, this.view.width = this.width, 
        this.view.height = this.height, this.autoResize && (this.view.style.width = this.width / this.resolution + "px", 
        this.view.style.height = this.height / this.resolution + "px");
    }, b.CanvasRenderer.prototype.renderDisplayObject = function(a, b) {
        this.renderSession.context = b || this.context, this.renderSession.resolution = this.resolution, 
        a._renderCanvas(this.renderSession);
    }, b.CanvasRenderer.prototype.mapBlendModes = function() {
        b.blendModesCanvas || (b.blendModesCanvas = [], b.canUseNewCanvasBlendModes() ? (b.blendModesCanvas[b.blendModes.NORMAL] = "source-over", 
        b.blendModesCanvas[b.blendModes.ADD] = "lighter", b.blendModesCanvas[b.blendModes.MULTIPLY] = "multiply", 
        b.blendModesCanvas[b.blendModes.SCREEN] = "screen", b.blendModesCanvas[b.blendModes.OVERLAY] = "overlay", 
        b.blendModesCanvas[b.blendModes.DARKEN] = "darken", b.blendModesCanvas[b.blendModes.LIGHTEN] = "lighten", 
        b.blendModesCanvas[b.blendModes.COLOR_DODGE] = "color-dodge", b.blendModesCanvas[b.blendModes.COLOR_BURN] = "color-burn", 
        b.blendModesCanvas[b.blendModes.HARD_LIGHT] = "hard-light", b.blendModesCanvas[b.blendModes.SOFT_LIGHT] = "soft-light", 
        b.blendModesCanvas[b.blendModes.DIFFERENCE] = "difference", b.blendModesCanvas[b.blendModes.EXCLUSION] = "exclusion", 
        b.blendModesCanvas[b.blendModes.HUE] = "hue", b.blendModesCanvas[b.blendModes.SATURATION] = "saturation", 
        b.blendModesCanvas[b.blendModes.COLOR] = "color", b.blendModesCanvas[b.blendModes.LUMINOSITY] = "luminosity") : (b.blendModesCanvas[b.blendModes.NORMAL] = "source-over", 
        b.blendModesCanvas[b.blendModes.ADD] = "lighter", b.blendModesCanvas[b.blendModes.MULTIPLY] = "source-over", 
        b.blendModesCanvas[b.blendModes.SCREEN] = "source-over", b.blendModesCanvas[b.blendModes.OVERLAY] = "source-over", 
        b.blendModesCanvas[b.blendModes.DARKEN] = "source-over", b.blendModesCanvas[b.blendModes.LIGHTEN] = "source-over", 
        b.blendModesCanvas[b.blendModes.COLOR_DODGE] = "source-over", b.blendModesCanvas[b.blendModes.COLOR_BURN] = "source-over", 
        b.blendModesCanvas[b.blendModes.HARD_LIGHT] = "source-over", b.blendModesCanvas[b.blendModes.SOFT_LIGHT] = "source-over", 
        b.blendModesCanvas[b.blendModes.DIFFERENCE] = "source-over", b.blendModesCanvas[b.blendModes.EXCLUSION] = "source-over", 
        b.blendModesCanvas[b.blendModes.HUE] = "source-over", b.blendModesCanvas[b.blendModes.SATURATION] = "source-over", 
        b.blendModesCanvas[b.blendModes.COLOR] = "source-over", b.blendModesCanvas[b.blendModes.LUMINOSITY] = "source-over"));
    }, b.CanvasGraphics = function() {}, b.CanvasGraphics.renderGraphics = function(a, c) {
        var d = a.worldAlpha;
        a.dirty && (this.updateGraphicsTint(a), a.dirty = !1);
        for (var e = 0; e < a.graphicsData.length; e++) {
            var f = a.graphicsData[e], g = f.shape, h = f._fillTint, i = f._lineTint;
            if (c.lineWidth = f.lineWidth, f.type === b.Graphics.POLY) {
                c.beginPath();
                var j = g.points;
                c.moveTo(j[0], j[1]);
                for (var k = 1; k < j.length / 2; k++) c.lineTo(j[2 * k], j[2 * k + 1]);
                g.closed && c.lineTo(j[0], j[1]), j[0] === j[j.length - 2] && j[1] === j[j.length - 1] && c.closePath(), 
                f.fill && (c.globalAlpha = f.fillAlpha * d, c.fillStyle = "#" + ("00000" + (0 | h).toString(16)).substr(-6), 
                c.fill()), f.lineWidth && (c.globalAlpha = f.lineAlpha * d, c.strokeStyle = "#" + ("00000" + (0 | i).toString(16)).substr(-6), 
                c.stroke());
            } else if (f.type === b.Graphics.RECT) (f.fillColor || 0 === f.fillColor) && (c.globalAlpha = f.fillAlpha * d, 
            c.fillStyle = "#" + ("00000" + (0 | h).toString(16)).substr(-6), c.fillRect(g.x, g.y, g.width, g.height)), 
            f.lineWidth && (c.globalAlpha = f.lineAlpha * d, c.strokeStyle = "#" + ("00000" + (0 | i).toString(16)).substr(-6), 
            c.strokeRect(g.x, g.y, g.width, g.height)); else if (f.type === b.Graphics.CIRC) c.beginPath(), 
            c.arc(g.x, g.y, g.radius, 0, 2 * Math.PI), c.closePath(), f.fill && (c.globalAlpha = f.fillAlpha * d, 
            c.fillStyle = "#" + ("00000" + (0 | h).toString(16)).substr(-6), c.fill()), f.lineWidth && (c.globalAlpha = f.lineAlpha * d, 
            c.strokeStyle = "#" + ("00000" + (0 | i).toString(16)).substr(-6), c.stroke()); else if (f.type === b.Graphics.ELIP) {
                var l = 2 * g.width, m = 2 * g.height, n = g.x - l / 2, o = g.y - m / 2;
                c.beginPath();
                var p = .5522848, q = l / 2 * p, r = m / 2 * p, s = n + l, t = o + m, u = n + l / 2, v = o + m / 2;
                c.moveTo(n, v), c.bezierCurveTo(n, v - r, u - q, o, u, o), c.bezierCurveTo(u + q, o, s, v - r, s, v), 
                c.bezierCurveTo(s, v + r, u + q, t, u, t), c.bezierCurveTo(u - q, t, n, v + r, n, v), 
                c.closePath(), f.fill && (c.globalAlpha = f.fillAlpha * d, c.fillStyle = "#" + ("00000" + (0 | h).toString(16)).substr(-6), 
                c.fill()), f.lineWidth && (c.globalAlpha = f.lineAlpha * d, c.strokeStyle = "#" + ("00000" + (0 | i).toString(16)).substr(-6), 
                c.stroke());
            } else if (f.type === b.Graphics.RREC) {
                var w = g.x, x = g.y, y = g.width, z = g.height, A = g.radius, B = Math.min(y, z) / 2 | 0;
                A = A > B ? B : A, c.beginPath(), c.moveTo(w, x + A), c.lineTo(w, x + z - A), c.quadraticCurveTo(w, x + z, w + A, x + z), 
                c.lineTo(w + y - A, x + z), c.quadraticCurveTo(w + y, x + z, w + y, x + z - A), 
                c.lineTo(w + y, x + A), c.quadraticCurveTo(w + y, x, w + y - A, x), c.lineTo(w + A, x), 
                c.quadraticCurveTo(w, x, w, x + A), c.closePath(), (f.fillColor || 0 === f.fillColor) && (c.globalAlpha = f.fillAlpha * d, 
                c.fillStyle = "#" + ("00000" + (0 | h).toString(16)).substr(-6), c.fill()), f.lineWidth && (c.globalAlpha = f.lineAlpha * d, 
                c.strokeStyle = "#" + ("00000" + (0 | i).toString(16)).substr(-6), c.stroke());
            }
        }
    }, b.CanvasGraphics.renderGraphicsMask = function(a, c) {
        var d = a.graphicsData.length;
        if (0 !== d) {
            d > 1 && (d = 1, window.console.log("Pixi.js warning: masks in canvas can only mask using the first path in the graphics object"));
            for (var e = 0; 1 > e; e++) {
                var f = a.graphicsData[e], g = f.shape;
                if (f.type === b.Graphics.POLY) {
                    c.beginPath();
                    var h = g.points;
                    c.moveTo(h[0], h[1]);
                    for (var i = 1; i < h.length / 2; i++) c.lineTo(h[2 * i], h[2 * i + 1]);
                    h[0] === h[h.length - 2] && h[1] === h[h.length - 1] && c.closePath();
                } else if (f.type === b.Graphics.RECT) c.beginPath(), c.rect(g.x, g.y, g.width, g.height), 
                c.closePath(); else if (f.type === b.Graphics.CIRC) c.beginPath(), c.arc(g.x, g.y, g.radius, 0, 2 * Math.PI), 
                c.closePath(); else if (f.type === b.Graphics.ELIP) {
                    var j = 2 * g.width, k = 2 * g.height, l = g.x - j / 2, m = g.y - k / 2;
                    c.beginPath();
                    var n = .5522848, o = j / 2 * n, p = k / 2 * n, q = l + j, r = m + k, s = l + j / 2, t = m + k / 2;
                    c.moveTo(l, t), c.bezierCurveTo(l, t - p, s - o, m, s, m), c.bezierCurveTo(s + o, m, q, t - p, q, t), 
                    c.bezierCurveTo(q, t + p, s + o, r, s, r), c.bezierCurveTo(s - o, r, l, t + p, l, t), 
                    c.closePath();
                } else if (f.type === b.Graphics.RREC) {
                    var u = g.points, v = u[0], w = u[1], x = u[2], y = u[3], z = u[4], A = Math.min(x, y) / 2 | 0;
                    z = z > A ? A : z, c.beginPath(), c.moveTo(v, w + z), c.lineTo(v, w + y - z), c.quadraticCurveTo(v, w + y, v + z, w + y), 
                    c.lineTo(v + x - z, w + y), c.quadraticCurveTo(v + x, w + y, v + x, w + y - z), 
                    c.lineTo(v + x, w + z), c.quadraticCurveTo(v + x, w, v + x - z, w), c.lineTo(v + z, w), 
                    c.quadraticCurveTo(v, w, v, w + z), c.closePath();
                }
            }
        }
    }, b.CanvasGraphics.updateGraphicsTint = function(a) {
        if (16777215 !== a.tint) for (var b = (a.tint >> 16 & 255) / 255, c = (a.tint >> 8 & 255) / 255, d = (255 & a.tint) / 255, e = 0; e < a.graphicsData.length; e++) {
            var f = a.graphicsData[e], g = 0 | f.fillColor, h = 0 | f.lineColor;
            f._fillTint = ((g >> 16 & 255) / 255 * b * 255 << 16) + ((g >> 8 & 255) / 255 * c * 255 << 8) + (255 & g) / 255 * d * 255, 
            f._lineTint = ((h >> 16 & 255) / 255 * b * 255 << 16) + ((h >> 8 & 255) / 255 * c * 255 << 8) + (255 & h) / 255 * d * 255;
        }
    }, b.Graphics = function() {
        b.DisplayObjectContainer.call(this), this.renderable = !0, this.fillAlpha = 1, this.lineWidth = 0, 
        this.lineColor = 0, this.graphicsData = [], this.tint = 16777215, this.blendMode = b.blendModes.NORMAL, 
        this.currentPath = null, this._webGL = [], this.isMask = !1, this.boundsPadding = 0, 
        this._localBounds = new b.Rectangle(0, 0, 1, 1), this.dirty = !0, this.webGLDirty = !1, 
        this.cachedSpriteDirty = !1;
    }, b.Graphics.prototype = Object.create(b.DisplayObjectContainer.prototype), b.Graphics.prototype.constructor = b.Graphics, 
    Object.defineProperty(b.Graphics.prototype, "cacheAsBitmap", {
        get: function() {
            return this._cacheAsBitmap;
        },
        set: function(a) {
            this._cacheAsBitmap = a, this._cacheAsBitmap ? this._generateCachedSprite() : (this.destroyCachedSprite(), 
            this.dirty = !0);
        }
    }), b.Graphics.prototype.lineStyle = function(a, c, d) {
        if (this.lineWidth = a || 0, this.lineColor = c || 0, this.lineAlpha = arguments.length < 3 ? 1 : d, 
        this.currentPath) {
            if (this.currentPath.shape.points.length) return this.drawShape(new b.Polygon(this.currentPath.shape.points.slice(-2))), 
            this;
            this.currentPath.lineWidth = this.lineWidth, this.currentPath.lineColor = this.lineColor, 
            this.currentPath.lineAlpha = this.lineAlpha;
        }
        return this;
    }, b.Graphics.prototype.moveTo = function(a, c) {
        return this.drawShape(new b.Polygon([ a, c ])), this;
    }, b.Graphics.prototype.lineTo = function(a, b) {
        return this.currentPath.shape.points.push(a, b), this.dirty = !0, this;
    }, b.Graphics.prototype.quadraticCurveTo = function(a, b, c, d) {
        this.currentPath ? 0 === this.currentPath.shape.points.length && (this.currentPath.shape.points = [ 0, 0 ]) : this.moveTo(0, 0);
        var e, f, g = 20, h = this.currentPath.shape.points;
        0 === h.length && this.moveTo(0, 0);
        for (var i = h[h.length - 2], j = h[h.length - 1], k = 0, l = 1; g >= l; l++) k = l / g, 
        e = i + (a - i) * k, f = j + (b - j) * k, h.push(e + (a + (c - a) * k - e) * k, f + (b + (d - b) * k - f) * k);
        return this.dirty = !0, this;
    }, b.Graphics.prototype.bezierCurveTo = function(a, b, c, d, e, f) {
        this.currentPath ? 0 === this.currentPath.shape.points.length && (this.currentPath.shape.points = [ 0, 0 ]) : this.moveTo(0, 0);
        for (var g, h, i, j, k, l = 20, m = this.currentPath.shape.points, n = m[m.length - 2], o = m[m.length - 1], p = 0, q = 1; l >= q; q++) p = q / l, 
        g = 1 - p, h = g * g, i = h * g, j = p * p, k = j * p, m.push(i * n + 3 * h * p * a + 3 * g * j * c + k * e, i * o + 3 * h * p * b + 3 * g * j * d + k * f);
        return this.dirty = !0, this;
    }, b.Graphics.prototype.arcTo = function(a, b, c, d, e) {
        this.currentPath ? 0 === this.currentPath.shape.points.length && this.currentPath.shape.points.push(a, b) : this.moveTo(a, b);
        var f = this.currentPath.shape.points, g = f[f.length - 2], h = f[f.length - 1], i = h - b, j = g - a, k = d - b, l = c - a, m = Math.abs(i * l - j * k);
        if (1e-8 > m || 0 === e) (f[f.length - 2] !== a || f[f.length - 1] !== b) && f.push(a, b); else {
            var n = i * i + j * j, o = k * k + l * l, p = i * k + j * l, q = e * Math.sqrt(n) / m, r = e * Math.sqrt(o) / m, s = q * p / n, t = r * p / o, u = q * l + r * j, v = q * k + r * i, w = j * (r + s), x = i * (r + s), y = l * (q + t), z = k * (q + t), A = Math.atan2(x - v, w - u), B = Math.atan2(z - v, y - u);
            this.arc(u + a, v + b, e, A, B, j * k > l * i);
        }
        return this.dirty = !0, this;
    }, b.Graphics.prototype.arc = function(a, b, c, d, e, f) {
        var g, h = a + Math.cos(d) * c, i = b + Math.sin(d) * c;
        if (this.currentPath ? (g = this.currentPath.shape.points, 0 === g.length ? g.push(h, i) : (g[g.length - 2] !== h || g[g.length - 1] !== i) && g.push(h, i)) : (this.moveTo(h, i), 
        g = this.currentPath.shape.points), d === e) return this;
        !f && d >= e ? e += 2 * Math.PI : f && e >= d && (d += 2 * Math.PI);
        var j = f ? -1 * (d - e) : e - d, k = Math.abs(j) / (2 * Math.PI) * 40;
        if (0 === j) return this;
        for (var l = j / (2 * k), m = 2 * l, n = Math.cos(l), o = Math.sin(l), p = k - 1, q = p % 1 / p, r = 0; p >= r; r++) {
            var s = r + q * r, t = l + d + m * s, u = Math.cos(t), v = -Math.sin(t);
            g.push((n * u + o * v) * c + a, (n * -v + o * u) * c + b);
        }
        return this.dirty = !0, this;
    }, b.Graphics.prototype.beginFill = function(a, b) {
        return this.filling = !0, this.fillColor = a || 0, this.fillAlpha = void 0 === b ? 1 : b, 
        this.currentPath && this.currentPath.shape.points.length <= 2 && (this.currentPath.fill = this.filling, 
        this.currentPath.fillColor = this.fillColor, this.currentPath.fillAlpha = this.fillAlpha), 
        this;
    }, b.Graphics.prototype.endFill = function() {
        return this.filling = !1, this.fillColor = null, this.fillAlpha = 1, this;
    }, b.Graphics.prototype.drawRect = function(a, c, d, e) {
        return this.drawShape(new b.Rectangle(a, c, d, e)), this;
    }, b.Graphics.prototype.drawRoundedRect = function(a, c, d, e, f) {
        return this.drawShape(new b.RoundedRectangle(a, c, d, e, f)), this;
    }, b.Graphics.prototype.drawCircle = function(a, c, d) {
        return this.drawShape(new b.Circle(a, c, d)), this;
    }, b.Graphics.prototype.drawEllipse = function(a, c, d, e) {
        return this.drawShape(new b.Ellipse(a, c, d, e)), this;
    }, b.Graphics.prototype.drawPolygon = function(a) {
        return a instanceof Array || (a = Array.prototype.slice.call(arguments)), this.drawShape(new b.Polygon(a)), 
        this;
    }, b.Graphics.prototype.clear = function() {
        return this.lineWidth = 0, this.filling = !1, this.dirty = !0, this.clearDirty = !0, 
        this.graphicsData = [], this;
    }, b.Graphics.prototype.generateTexture = function(a, c) {
        a = a || 1;
        var d = this.getBounds(), e = new b.CanvasBuffer(d.width * a, d.height * a), f = b.Texture.fromCanvas(e.canvas, c);
        return f.baseTexture.resolution = a, e.context.scale(a, a), e.context.translate(-d.x, -d.y), 
        b.CanvasGraphics.renderGraphics(this, e.context), f;
    }, b.Graphics.prototype._renderWebGL = function(a) {
        if (this.visible !== !1 && 0 !== this.alpha && this.isMask !== !0) {
            if (this._cacheAsBitmap) return (this.dirty || this.cachedSpriteDirty) && (this._generateCachedSprite(), 
            this.updateCachedSpriteTexture(), this.cachedSpriteDirty = !1, this.dirty = !1), 
            this._cachedSprite.worldAlpha = this.worldAlpha, void b.Sprite.prototype._renderWebGL.call(this._cachedSprite, a);
            if (a.spriteBatch.stop(), a.blendModeManager.setBlendMode(this.blendMode), this._mask && a.maskManager.pushMask(this._mask, a), 
            this._filters && a.filterManager.pushFilter(this._filterBlock), this.blendMode !== a.spriteBatch.currentBlendMode) {
                a.spriteBatch.currentBlendMode = this.blendMode;
                var c = b.blendModesWebGL[a.spriteBatch.currentBlendMode];
                a.spriteBatch.gl.blendFunc(c[0], c[1]);
            }
            if (this.webGLDirty && (this.dirty = !0, this.webGLDirty = !1), b.WebGLGraphics.renderGraphics(this, a), 
            this.children.length) {
                a.spriteBatch.start();
                for (var d = 0, e = this.children.length; e > d; d++) this.children[d]._renderWebGL(a);
                a.spriteBatch.stop();
            }
            this._filters && a.filterManager.popFilter(), this._mask && a.maskManager.popMask(this.mask, a), 
            a.drawCount++, a.spriteBatch.start();
        }
    }, b.Graphics.prototype._renderCanvas = function(a) {
        if (this.visible !== !1 && 0 !== this.alpha && this.isMask !== !0) {
            if (this._cacheAsBitmap) return (this.dirty || this.cachedSpriteDirty) && (this._generateCachedSprite(), 
            this.updateCachedSpriteTexture(), this.cachedSpriteDirty = !1, this.dirty = !1), 
            this._cachedSprite.alpha = this.alpha, void b.Sprite.prototype._renderCanvas.call(this._cachedSprite, a);
            var c = a.context, d = this.worldTransform;
            this.blendMode !== a.currentBlendMode && (a.currentBlendMode = this.blendMode, c.globalCompositeOperation = b.blendModesCanvas[a.currentBlendMode]), 
            this._mask && a.maskManager.pushMask(this._mask, a);
            var e = a.resolution;
            c.setTransform(d.a * e, d.b * e, d.c * e, d.d * e, d.tx * e, d.ty * e), b.CanvasGraphics.renderGraphics(this, c);
            for (var f = 0, g = this.children.length; g > f; f++) this.children[f]._renderCanvas(a);
            this._mask && a.maskManager.popMask(a);
        }
    }, b.Graphics.prototype.getBounds = function(a) {
        if (this.isMask) return b.EmptyRectangle;
        this.dirty && (this.updateLocalBounds(), this.webGLDirty = !0, this.cachedSpriteDirty = !0, 
        this.dirty = !1);
        var c = this._localBounds, d = c.x, e = c.width + c.x, f = c.y, g = c.height + c.y, h = a || this.worldTransform, i = h.a, j = h.b, k = h.c, l = h.d, m = h.tx, n = h.ty, o = i * e + k * g + m, p = l * g + j * e + n, q = i * d + k * g + m, r = l * g + j * d + n, s = i * d + k * f + m, t = l * f + j * d + n, u = i * e + k * f + m, v = l * f + j * e + n, w = o, x = p, y = o, z = p;
        return y = y > q ? q : y, y = y > s ? s : y, y = y > u ? u : y, z = z > r ? r : z, 
        z = z > t ? t : z, z = z > v ? v : z, w = q > w ? q : w, w = s > w ? s : w, w = u > w ? u : w, 
        x = r > x ? r : x, x = t > x ? t : x, x = v > x ? v : x, this._bounds.x = y, this._bounds.width = w - y, 
        this._bounds.y = z, this._bounds.height = x - z, this._bounds;
    }, b.Graphics.prototype.updateLocalBounds = function() {
        var a = 1 / 0, c = -(1 / 0), d = 1 / 0, e = -(1 / 0);
        if (this.graphicsData.length) for (var f, g, h, i, j, k, l = 0; l < this.graphicsData.length; l++) {
            var m = this.graphicsData[l], n = m.type, o = m.lineWidth;
            if (f = m.shape, n === b.Graphics.RECT || n === b.Graphics.RREC) h = f.x - o / 2, 
            i = f.y - o / 2, j = f.width + o, k = f.height + o, a = a > h ? h : a, c = h + j > c ? h + j : c, 
            d = d > i ? i : d, e = i + k > e ? i + k : e; else if (n === b.Graphics.CIRC) h = f.x, 
            i = f.y, j = f.radius + o / 2, k = f.radius + o / 2, a = a > h - j ? h - j : a, 
            c = h + j > c ? h + j : c, d = d > i - k ? i - k : d, e = i + k > e ? i + k : e; else if (n === b.Graphics.ELIP) h = f.x, 
            i = f.y, j = f.width + o / 2, k = f.height + o / 2, a = a > h - j ? h - j : a, c = h + j > c ? h + j : c, 
            d = d > i - k ? i - k : d, e = i + k > e ? i + k : e; else {
                g = f.points;
                for (var p = 0; p < g.length; p += 2) h = g[p], i = g[p + 1], a = a > h - o ? h - o : a, 
                c = h + o > c ? h + o : c, d = d > i - o ? i - o : d, e = i + o > e ? i + o : e;
            }
        } else a = 0, c = 0, d = 0, e = 0;
        var q = this.boundsPadding;
        this._localBounds.x = a - q, this._localBounds.width = c - a + 2 * q, this._localBounds.y = d - q, 
        this._localBounds.height = e - d + 2 * q;
    }, b.Graphics.prototype._generateCachedSprite = function() {
        var a = this.getLocalBounds();
        if (this._cachedSprite) this._cachedSprite.buffer.resize(a.width, a.height); else {
            var c = new b.CanvasBuffer(a.width, a.height), d = b.Texture.fromCanvas(c.canvas);
            this._cachedSprite = new b.Sprite(d), this._cachedSprite.buffer = c, this._cachedSprite.worldTransform = this.worldTransform;
        }
        this._cachedSprite.anchor.x = -(a.x / a.width), this._cachedSprite.anchor.y = -(a.y / a.height), 
        this._cachedSprite.buffer.context.translate(-a.x, -a.y), this.worldAlpha = 1, b.CanvasGraphics.renderGraphics(this, this._cachedSprite.buffer.context), 
        this._cachedSprite.alpha = this.alpha;
    }, b.Graphics.prototype.updateCachedSpriteTexture = function() {
        var a = this._cachedSprite, b = a.texture, c = a.buffer.canvas;
        b.baseTexture.width = c.width, b.baseTexture.height = c.height, b.crop.width = b.frame.width = c.width, 
        b.crop.height = b.frame.height = c.height, a._width = c.width, a._height = c.height, 
        b.baseTexture.dirty();
    }, b.Graphics.prototype.destroyCachedSprite = function() {
        this._cachedSprite.texture.destroy(!0), this._cachedSprite = null;
    }, b.Graphics.prototype.drawShape = function(a) {
        this.currentPath && this.currentPath.shape.points.length <= 2 && this.graphicsData.pop(), 
        this.currentPath = null;
        var c = new b.GraphicsData(this.lineWidth, this.lineColor, this.lineAlpha, this.fillColor, this.fillAlpha, this.filling, a);
        return this.graphicsData.push(c), c.type === b.Graphics.POLY && (c.shape.closed = this.filling, 
        this.currentPath = c), this.dirty = !0, c;
    }, b.GraphicsData = function(a, b, c, d, e, f, g) {
        this.lineWidth = a, this.lineColor = b, this.lineAlpha = c, this._lineTint = b, 
        this.fillColor = d, this.fillAlpha = e, this._fillTint = d, this.fill = f, this.shape = g, 
        this.type = g.type;
    }, b.Graphics.POLY = 0, b.Graphics.RECT = 1, b.Graphics.CIRC = 2, b.Graphics.ELIP = 3, 
    b.Graphics.RREC = 4, b.Polygon.prototype.type = b.Graphics.POLY, b.Rectangle.prototype.type = b.Graphics.RECT, 
    b.Circle.prototype.type = b.Graphics.CIRC, b.Ellipse.prototype.type = b.Graphics.ELIP, 
    b.RoundedRectangle.prototype.type = b.Graphics.RREC, b.Strip = function(a) {
        b.DisplayObjectContainer.call(this), this.texture = a, this.uvs = new b.Float32Array([ 0, 1, 1, 1, 1, 0, 0, 1 ]), 
        this.vertices = new b.Float32Array([ 0, 0, 100, 0, 100, 100, 0, 100 ]), this.colors = new b.Float32Array([ 1, 1, 1, 1 ]), 
        this.indices = new b.Uint16Array([ 0, 1, 2, 3 ]), this.dirty = !0, this.blendMode = b.blendModes.NORMAL, 
        this.canvasPadding = 0, this.drawMode = b.Strip.DrawModes.TRIANGLE_STRIP;
    }, b.Strip.prototype = Object.create(b.DisplayObjectContainer.prototype), b.Strip.prototype.constructor = b.Strip, 
    b.Strip.prototype._renderWebGL = function(a) {
        !this.visible || this.alpha <= 0 || (a.spriteBatch.stop(), this._vertexBuffer || this._initWebGL(a), 
        a.shaderManager.setShader(a.shaderManager.stripShader), this._renderStrip(a), a.spriteBatch.start());
    }, b.Strip.prototype._initWebGL = function(a) {
        var b = a.gl;
        this._vertexBuffer = b.createBuffer(), this._indexBuffer = b.createBuffer(), this._uvBuffer = b.createBuffer(), 
        this._colorBuffer = b.createBuffer(), b.bindBuffer(b.ARRAY_BUFFER, this._vertexBuffer), 
        b.bufferData(b.ARRAY_BUFFER, this.vertices, b.DYNAMIC_DRAW), b.bindBuffer(b.ARRAY_BUFFER, this._uvBuffer), 
        b.bufferData(b.ARRAY_BUFFER, this.uvs, b.STATIC_DRAW), b.bindBuffer(b.ARRAY_BUFFER, this._colorBuffer), 
        b.bufferData(b.ARRAY_BUFFER, this.colors, b.STATIC_DRAW), b.bindBuffer(b.ELEMENT_ARRAY_BUFFER, this._indexBuffer), 
        b.bufferData(b.ELEMENT_ARRAY_BUFFER, this.indices, b.STATIC_DRAW);
    }, b.Strip.prototype._renderStrip = function(a) {
        var c = a.gl, d = a.projection, e = a.offset, f = a.shaderManager.stripShader, g = this.drawMode === b.Strip.DrawModes.TRIANGLE_STRIP ? c.TRIANGLE_STRIP : c.TRIANGLES;
        a.blendModeManager.setBlendMode(this.blendMode), c.uniformMatrix3fv(f.translationMatrix, !1, this.worldTransform.toArray(!0)), 
        c.uniform2f(f.projectionVector, d.x, -d.y), c.uniform2f(f.offsetVector, -e.x, -e.y), 
        c.uniform1f(f.alpha, this.worldAlpha), this.dirty ? (this.dirty = !1, c.bindBuffer(c.ARRAY_BUFFER, this._vertexBuffer), 
        c.bufferData(c.ARRAY_BUFFER, this.vertices, c.STATIC_DRAW), c.vertexAttribPointer(f.aVertexPosition, 2, c.FLOAT, !1, 0, 0), 
        c.bindBuffer(c.ARRAY_BUFFER, this._uvBuffer), c.bufferData(c.ARRAY_BUFFER, this.uvs, c.STATIC_DRAW), 
        c.vertexAttribPointer(f.aTextureCoord, 2, c.FLOAT, !1, 0, 0), c.activeTexture(c.TEXTURE0), 
        this.texture.baseTexture._dirty[c.id] ? a.renderer.updateTexture(this.texture.baseTexture) : c.bindTexture(c.TEXTURE_2D, this.texture.baseTexture._glTextures[c.id]), 
        c.bindBuffer(c.ELEMENT_ARRAY_BUFFER, this._indexBuffer), c.bufferData(c.ELEMENT_ARRAY_BUFFER, this.indices, c.STATIC_DRAW)) : (c.bindBuffer(c.ARRAY_BUFFER, this._vertexBuffer), 
        c.bufferSubData(c.ARRAY_BUFFER, 0, this.vertices), c.vertexAttribPointer(f.aVertexPosition, 2, c.FLOAT, !1, 0, 0), 
        c.bindBuffer(c.ARRAY_BUFFER, this._uvBuffer), c.vertexAttribPointer(f.aTextureCoord, 2, c.FLOAT, !1, 0, 0), 
        c.activeTexture(c.TEXTURE0), this.texture.baseTexture._dirty[c.id] ? a.renderer.updateTexture(this.texture.baseTexture) : c.bindTexture(c.TEXTURE_2D, this.texture.baseTexture._glTextures[c.id]), 
        c.bindBuffer(c.ELEMENT_ARRAY_BUFFER, this._indexBuffer)), c.drawElements(g, this.indices.length, c.UNSIGNED_SHORT, 0);
    }, b.Strip.prototype._renderCanvas = function(a) {
        var c = a.context, d = this.worldTransform;
        a.roundPixels ? c.setTransform(d.a, d.b, d.c, d.d, 0 | d.tx, 0 | d.ty) : c.setTransform(d.a, d.b, d.c, d.d, d.tx, d.ty), 
        this.drawMode === b.Strip.DrawModes.TRIANGLE_STRIP ? this._renderCanvasTriangleStrip(c) : this._renderCanvasTriangles(c);
    }, b.Strip.prototype._renderCanvasTriangleStrip = function(a) {
        var b = this.vertices, c = this.uvs, d = b.length / 2;
        this.count++;
        for (var e = 0; d - 2 > e; e++) {
            var f = 2 * e;
            this._renderCanvasDrawTriangle(a, b, c, f, f + 2, f + 4);
        }
    }, b.Strip.prototype._renderCanvasTriangles = function(a) {
        var b = this.vertices, c = this.uvs, d = this.indices, e = d.length;
        this.count++;
        for (var f = 0; e > f; f += 3) {
            var g = 2 * d[f], h = 2 * d[f + 1], i = 2 * d[f + 2];
            this._renderCanvasDrawTriangle(a, b, c, g, h, i);
        }
    }, b.Strip.prototype._renderCanvasDrawTriangle = function(a, b, c, d, e, f) {
        var g = this.texture.baseTexture.source, h = this.texture.width, i = this.texture.height, j = b[d], k = b[e], l = b[f], m = b[d + 1], n = b[e + 1], o = b[f + 1], p = c[d] * h, q = c[e] * h, r = c[f] * h, s = c[d + 1] * i, t = c[e + 1] * i, u = c[f + 1] * i;
        if (this.canvasPadding > 0) {
            var v = this.canvasPadding / this.worldTransform.a, w = this.canvasPadding / this.worldTransform.d, x = (j + k + l) / 3, y = (m + n + o) / 3, z = j - x, A = m - y, B = Math.sqrt(z * z + A * A);
            j = x + z / B * (B + v), m = y + A / B * (B + w), z = k - x, A = n - y, B = Math.sqrt(z * z + A * A), 
            k = x + z / B * (B + v), n = y + A / B * (B + w), z = l - x, A = o - y, B = Math.sqrt(z * z + A * A), 
            l = x + z / B * (B + v), o = y + A / B * (B + w);
        }
        a.save(), a.beginPath(), a.moveTo(j, m), a.lineTo(k, n), a.lineTo(l, o), a.closePath(), 
        a.clip();
        var C = p * t + s * r + q * u - t * r - s * q - p * u, D = j * t + s * l + k * u - t * l - s * k - j * u, E = p * k + j * r + q * l - k * r - j * q - p * l, F = p * t * l + s * k * r + j * q * u - j * t * r - s * q * l - p * k * u, G = m * t + s * o + n * u - t * o - s * n - m * u, H = p * n + m * r + q * o - n * r - m * q - p * o, I = p * t * o + s * n * r + m * q * u - m * t * r - s * q * o - p * n * u;
        a.transform(D / C, G / C, E / C, H / C, F / C, I / C), a.drawImage(g, 0, 0), a.restore();
    }, b.Strip.prototype.renderStripFlat = function(a) {
        var b = this.context, c = a.vertices, d = c.length / 2;
        this.count++, b.beginPath();
        for (var e = 1; d - 2 > e; e++) {
            var f = 2 * e, g = c[f], h = c[f + 2], i = c[f + 4], j = c[f + 1], k = c[f + 3], l = c[f + 5];
            b.moveTo(g, j), b.lineTo(h, k), b.lineTo(i, l);
        }
        b.fillStyle = "#FF0000", b.fill(), b.closePath();
    }, b.Strip.prototype.onTextureUpdate = function() {
        this.updateFrame = !0;
    }, b.Strip.prototype.getBounds = function(a) {
        for (var c = a || this.worldTransform, d = c.a, e = c.b, f = c.c, g = c.d, h = c.tx, i = c.ty, j = -(1 / 0), k = -(1 / 0), l = 1 / 0, m = 1 / 0, n = this.vertices, o = 0, p = n.length; p > o; o += 2) {
            var q = n[o], r = n[o + 1], s = d * q + f * r + h, t = g * r + e * q + i;
            l = l > s ? s : l, m = m > t ? t : m, j = s > j ? s : j, k = t > k ? t : k;
        }
        if (l === -(1 / 0) || k === 1 / 0) return b.EmptyRectangle;
        var u = this._bounds;
        return u.x = l, u.width = j - l, u.y = m, u.height = k - m, this._currentBounds = u, 
        u;
    }, b.Strip.DrawModes = {
        TRIANGLE_STRIP: 0,
        TRIANGLES: 1
    }, b.Rope = function(a, c) {
        b.Strip.call(this, a), this.points = c, this.vertices = new b.Float32Array(4 * c.length), 
        this.uvs = new b.Float32Array(4 * c.length), this.colors = new b.Float32Array(2 * c.length), 
        this.indices = new b.Uint16Array(2 * c.length), this.refresh();
    }, b.Rope.prototype = Object.create(b.Strip.prototype), b.Rope.prototype.constructor = b.Rope, 
    b.Rope.prototype.refresh = function() {
        var a = this.points;
        if (!(a.length < 1)) {
            var b = this.uvs, c = a[0], d = this.indices, e = this.colors;
            this.count -= .2, b[0] = 0, b[1] = 0, b[2] = 0, b[3] = 1, e[0] = 1, e[1] = 1, d[0] = 0, 
            d[1] = 1;
            for (var f, g, h, i = a.length, j = 1; i > j; j++) f = a[j], g = 4 * j, h = j / (i - 1), 
            j % 2 ? (b[g] = h, b[g + 1] = 0, b[g + 2] = h, b[g + 3] = 1) : (b[g] = h, b[g + 1] = 0, 
            b[g + 2] = h, b[g + 3] = 1), g = 2 * j, e[g] = 1, e[g + 1] = 1, g = 2 * j, d[g] = g, 
            d[g + 1] = g + 1, c = f;
        }
    }, b.Rope.prototype.updateTransform = function() {
        var a = this.points;
        if (!(a.length < 1)) {
            var c, d = a[0], e = {
                x: 0,
                y: 0
            };
            this.count -= .2;
            for (var f, g, h, i, j, k = this.vertices, l = a.length, m = 0; l > m; m++) f = a[m], 
            g = 4 * m, c = m < a.length - 1 ? a[m + 1] : f, e.y = -(c.x - d.x), e.x = c.y - d.y, 
            h = 10 * (1 - m / (l - 1)), h > 1 && (h = 1), i = Math.sqrt(e.x * e.x + e.y * e.y), 
            j = this.texture.height / 2, e.x /= i, e.y /= i, e.x *= j, e.y *= j, k[g] = f.x + e.x, 
            k[g + 1] = f.y + e.y, k[g + 2] = f.x - e.x, k[g + 3] = f.y - e.y, d = f;
            b.DisplayObjectContainer.prototype.updateTransform.call(this);
        }
    }, b.Rope.prototype.setTexture = function(a) {
        this.texture = a;
    }, b.TilingSprite = function(a, c, d) {
        b.Sprite.call(this, a), this._width = c || 100, this._height = d || 100, this.tileScale = new b.Point(1, 1), 
        this.tileScaleOffset = new b.Point(1, 1), this.tilePosition = new b.Point(0, 0), 
        this.renderable = !0, this.tint = 16777215, this.blendMode = b.blendModes.NORMAL;
    }, b.TilingSprite.prototype = Object.create(b.Sprite.prototype), b.TilingSprite.prototype.constructor = b.TilingSprite, 
    Object.defineProperty(b.TilingSprite.prototype, "width", {
        get: function() {
            return this._width;
        },
        set: function(a) {
            this._width = a;
        }
    }), Object.defineProperty(b.TilingSprite.prototype, "height", {
        get: function() {
            return this._height;
        },
        set: function(a) {
            this._height = a;
        }
    }), b.TilingSprite.prototype.setTexture = function(a) {
        this.texture !== a && (this.texture = a, this.refreshTexture = !0, this.cachedTint = 16777215);
    }, b.TilingSprite.prototype._renderWebGL = function(a) {
        if (this.visible !== !1 && 0 !== this.alpha) {
            var b, c;
            for (this._mask && (a.spriteBatch.stop(), a.maskManager.pushMask(this.mask, a), 
            a.spriteBatch.start()), this._filters && (a.spriteBatch.flush(), a.filterManager.pushFilter(this._filterBlock)), 
            !this.tilingTexture || this.refreshTexture ? (this.generateTilingTexture(!0), this.tilingTexture && this.tilingTexture.needsUpdate && (a.renderer.updateTexture(this.tilingTexture.baseTexture), 
            this.tilingTexture.needsUpdate = !1)) : a.spriteBatch.renderTilingSprite(this), 
            b = 0, c = this.children.length; c > b; b++) this.children[b]._renderWebGL(a);
            a.spriteBatch.stop(), this._filters && a.filterManager.popFilter(), this._mask && a.maskManager.popMask(this._mask, a), 
            a.spriteBatch.start();
        }
    }, b.TilingSprite.prototype._renderCanvas = function(a) {
        if (this.visible !== !1 && 0 !== this.alpha) {
            var c = a.context;
            this._mask && a.maskManager.pushMask(this._mask, a), c.globalAlpha = this.worldAlpha;
            var d, e, f = this.worldTransform, g = a.resolution;
            if (c.setTransform(f.a * g, f.b * g, f.c * g, f.d * g, f.tx * g, f.ty * g), !this.__tilePattern || this.refreshTexture) {
                if (this.generateTilingTexture(!1), !this.tilingTexture) return;
                this.__tilePattern = c.createPattern(this.tilingTexture.baseTexture.source, "repeat");
            }
            this.blendMode !== a.currentBlendMode && (a.currentBlendMode = this.blendMode, c.globalCompositeOperation = b.blendModesCanvas[a.currentBlendMode]);
            var h = this.tilePosition, i = this.tileScale;
            for (h.x %= this.tilingTexture.baseTexture.width, h.y %= this.tilingTexture.baseTexture.height, 
            c.scale(i.x, i.y), c.translate(h.x + this.anchor.x * -this._width, h.y + this.anchor.y * -this._height), 
            c.fillStyle = this.__tilePattern, c.fillRect(-h.x, -h.y, this._width / i.x, this._height / i.y), 
            c.scale(1 / i.x, 1 / i.y), c.translate(-h.x + this.anchor.x * this._width, -h.y + this.anchor.y * this._height), 
            this._mask && a.maskManager.popMask(a), d = 0, e = this.children.length; e > d; d++) this.children[d]._renderCanvas(a);
        }
    }, b.TilingSprite.prototype.getBounds = function() {
        var a = this._width, b = this._height, c = a * (1 - this.anchor.x), d = a * -this.anchor.x, e = b * (1 - this.anchor.y), f = b * -this.anchor.y, g = this.worldTransform, h = g.a, i = g.b, j = g.c, k = g.d, l = g.tx, m = g.ty, n = h * d + j * f + l, o = k * f + i * d + m, p = h * c + j * f + l, q = k * f + i * c + m, r = h * c + j * e + l, s = k * e + i * c + m, t = h * d + j * e + l, u = k * e + i * d + m, v = -(1 / 0), w = -(1 / 0), x = 1 / 0, y = 1 / 0;
        x = x > n ? n : x, x = x > p ? p : x, x = x > r ? r : x, x = x > t ? t : x, y = y > o ? o : y, 
        y = y > q ? q : y, y = y > s ? s : y, y = y > u ? u : y, v = n > v ? n : v, v = p > v ? p : v, 
        v = r > v ? r : v, v = t > v ? t : v, w = o > w ? o : w, w = q > w ? q : w, w = s > w ? s : w, 
        w = u > w ? u : w;
        var z = this._bounds;
        return z.x = x, z.width = v - x, z.y = y, z.height = w - y, this._currentBounds = z, 
        z;
    }, b.TilingSprite.prototype.onTextureUpdate = function() {}, b.TilingSprite.prototype.generateTilingTexture = function(a) {
        if (this.texture.baseTexture.hasLoaded) {
            var c, d, e = this.originalTexture || this.texture, f = e.frame, g = f.width !== e.baseTexture.width || f.height !== e.baseTexture.height, h = !1;
            if (a ? (c = b.getNextPowerOfTwo(f.width), d = b.getNextPowerOfTwo(f.height), (f.width !== c || f.height !== d || e.baseTexture.width !== c || e.baseTexture.height || d) && (h = !0)) : g && (e.trim ? (c = e.trim.width, 
            d = e.trim.height) : (c = f.width, d = f.height), h = !0), h) {
                var i;
                this.tilingTexture && this.tilingTexture.isTiling ? (i = this.tilingTexture.canvasBuffer, 
                i.resize(c, d), this.tilingTexture.baseTexture.width = c, this.tilingTexture.baseTexture.height = d, 
                this.tilingTexture.needsUpdate = !0) : (i = new b.CanvasBuffer(c, d), this.tilingTexture = b.Texture.fromCanvas(i.canvas), 
                this.tilingTexture.canvasBuffer = i, this.tilingTexture.isTiling = !0), i.context.drawImage(e.baseTexture.source, e.crop.x, e.crop.y, e.crop.width, e.crop.height, 0, 0, c, d), 
                this.tileScaleOffset.x = f.width / c, this.tileScaleOffset.y = f.height / d;
            } else this.tilingTexture && this.tilingTexture.isTiling && this.tilingTexture.destroy(!0), 
            this.tileScaleOffset.x = 1, this.tileScaleOffset.y = 1, this.tilingTexture = e;
            this.refreshTexture = !1, this.originalTexture = this.texture, this.texture = this.tilingTexture, 
            this.tilingTexture.baseTexture._powerOf2 = !0;
        }
    }, b.TilingSprite.prototype.destroy = function() {
        b.Sprite.prototype.destroy.call(this), this.tileScale = null, this.tileScaleOffset = null, 
        this.tilePosition = null, this.tilingTexture && (this.tilingTexture.destroy(!0), 
        this.tilingTexture = null);
    };
    var c = {
        radDeg: 180 / Math.PI,
        degRad: Math.PI / 180,
        temp: [],
        Float32Array: "undefined" == typeof Float32Array ? Array : Float32Array,
        Uint16Array: "undefined" == typeof Uint16Array ? Array : Uint16Array
    };
    c.BoneData = function(a, b) {
        this.name = a, this.parent = b;
    }, c.BoneData.prototype = {
        length: 0,
        x: 0,
        y: 0,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        inheritScale: !0,
        inheritRotation: !0,
        flipX: !1,
        flipY: !1
    }, c.SlotData = function(a, b) {
        this.name = a, this.boneData = b;
    }, c.SlotData.prototype = {
        r: 1,
        g: 1,
        b: 1,
        a: 1,
        attachmentName: null,
        additiveBlending: !1
    }, c.IkConstraintData = function(a) {
        this.name = a, this.bones = [];
    }, c.IkConstraintData.prototype = {
        target: null,
        bendDirection: 1,
        mix: 1
    }, c.Bone = function(a, b, c) {
        this.data = a, this.skeleton = b, this.parent = c, this.setToSetupPose();
    }, c.Bone.yDown = !1, c.Bone.prototype = {
        x: 0,
        y: 0,
        rotation: 0,
        rotationIK: 0,
        scaleX: 1,
        scaleY: 1,
        flipX: !1,
        flipY: !1,
        m00: 0,
        m01: 0,
        worldX: 0,
        m10: 0,
        m11: 0,
        worldY: 0,
        worldRotation: 0,
        worldScaleX: 1,
        worldScaleY: 1,
        worldFlipX: !1,
        worldFlipY: !1,
        updateWorldTransform: function() {
            var a = this.parent;
            if (a) this.worldX = this.x * a.m00 + this.y * a.m01 + a.worldX, this.worldY = this.x * a.m10 + this.y * a.m11 + a.worldY, 
            this.data.inheritScale ? (this.worldScaleX = a.worldScaleX * this.scaleX, this.worldScaleY = a.worldScaleY * this.scaleY) : (this.worldScaleX = this.scaleX, 
            this.worldScaleY = this.scaleY), this.worldRotation = this.data.inheritRotation ? a.worldRotation + this.rotationIK : this.rotationIK, 
            this.worldFlipX = a.worldFlipX != this.flipX, this.worldFlipY = a.worldFlipY != this.flipY; else {
                var b = this.skeleton.flipX, d = this.skeleton.flipY;
                this.worldX = b ? -this.x : this.x, this.worldY = d != c.Bone.yDown ? -this.y : this.y, 
                this.worldScaleX = this.scaleX, this.worldScaleY = this.scaleY, this.worldRotation = this.rotationIK, 
                this.worldFlipX = b != this.flipX, this.worldFlipY = d != this.flipY;
            }
            var e = this.worldRotation * c.degRad, f = Math.cos(e), g = Math.sin(e);
            this.worldFlipX ? (this.m00 = -f * this.worldScaleX, this.m01 = g * this.worldScaleY) : (this.m00 = f * this.worldScaleX, 
            this.m01 = -g * this.worldScaleY), this.worldFlipY != c.Bone.yDown ? (this.m10 = -g * this.worldScaleX, 
            this.m11 = -f * this.worldScaleY) : (this.m10 = g * this.worldScaleX, this.m11 = f * this.worldScaleY);
        },
        setToSetupPose: function() {
            var a = this.data;
            this.x = a.x, this.y = a.y, this.rotation = a.rotation, this.rotationIK = this.rotation, 
            this.scaleX = a.scaleX, this.scaleY = a.scaleY, this.flipX = a.flipX, this.flipY = a.flipY;
        },
        worldToLocal: function(a) {
            var b = a[0] - this.worldX, d = a[1] - this.worldY, e = this.m00, f = this.m10, g = this.m01, h = this.m11;
            this.worldFlipX != (this.worldFlipY != c.Bone.yDown) && (e = -e, h = -h);
            var i = 1 / (e * h - g * f);
            a[0] = b * e * i - d * g * i, a[1] = d * h * i - b * f * i;
        },
        localToWorld: function(a) {
            var b = a[0], c = a[1];
            a[0] = b * this.m00 + c * this.m01 + this.worldX, a[1] = b * this.m10 + c * this.m11 + this.worldY;
        }
    }, c.Slot = function(a, b) {
        this.data = a, this.bone = b, this.setToSetupPose();
    }, c.Slot.prototype = {
        r: 1,
        g: 1,
        b: 1,
        a: 1,
        _attachmentTime: 0,
        attachment: null,
        attachmentVertices: [],
        setAttachment: function(a) {
            this.attachment = a, this._attachmentTime = this.bone.skeleton.time, this.attachmentVertices.length = 0;
        },
        setAttachmentTime: function(a) {
            this._attachmentTime = this.bone.skeleton.time - a;
        },
        getAttachmentTime: function() {
            return this.bone.skeleton.time - this._attachmentTime;
        },
        setToSetupPose: function() {
            var a = this.data;
            this.r = a.r, this.g = a.g, this.b = a.b, this.a = a.a;
            for (var b = this.bone.skeleton.data.slots, c = 0, d = b.length; d > c; c++) if (b[c] == a) {
                this.setAttachment(a.attachmentName ? this.bone.skeleton.getAttachmentBySlotIndex(c, a.attachmentName) : null);
                break;
            }
        }
    }, c.IkConstraint = function(a, b) {
        this.data = a, this.mix = a.mix, this.bendDirection = a.bendDirection, this.bones = [];
        for (var c = 0, d = a.bones.length; d > c; c++) this.bones.push(b.findBone(a.bones[c].name));
        this.target = b.findBone(a.target.name);
    }, c.IkConstraint.prototype = {
        apply: function() {
            var a = this.target, b = this.bones;
            switch (b.length) {
              case 1:
                c.IkConstraint.apply1(b[0], a.worldX, a.worldY, this.mix);
                break;

              case 2:
                c.IkConstraint.apply2(b[0], b[1], a.worldX, a.worldY, this.bendDirection, this.mix);
            }
        }
    }, c.IkConstraint.apply1 = function(a, b, d, e) {
        var f = a.data.inheritRotation && a.parent ? a.parent.worldRotation : 0, g = a.rotation, h = Math.atan2(d - a.worldY, b - a.worldX) * c.radDeg - f;
        a.rotationIK = g + (h - g) * e;
    }, c.IkConstraint.apply2 = function(a, b, d, e, f, g) {
        var h = b.rotation, i = a.rotation;
        if (!g) return b.rotationIK = h, void (a.rotationIK = i);
        var j, k, l = c.temp, m = a.parent;
        m ? (l[0] = d, l[1] = e, m.worldToLocal(l), d = (l[0] - a.x) * m.worldScaleX, e = (l[1] - a.y) * m.worldScaleY) : (d -= a.x, 
        e -= a.y), b.parent == a ? (j = b.x, k = b.y) : (l[0] = b.x, l[1] = b.y, b.parent.localToWorld(l), 
        a.worldToLocal(l), j = l[0], k = l[1]);
        var n = j * a.worldScaleX, o = k * a.worldScaleY, p = Math.atan2(o, n), q = Math.sqrt(n * n + o * o), r = b.data.length * b.worldScaleX, s = 2 * q * r;
        if (1e-4 > s) return void (b.rotationIK = h + (Math.atan2(e, d) * c.radDeg - i - h) * g);
        var t = (d * d + e * e - q * q - r * r) / s;
        -1 > t ? t = -1 : t > 1 && (t = 1);
        var u = Math.acos(t) * f, v = q + r * t, w = r * Math.sin(u), x = Math.atan2(e * v - d * w, d * v + e * w), y = (x - p) * c.radDeg - i;
        y > 180 ? y -= 360 : -180 > y && (y += 360), a.rotationIK = i + y * g, y = (u + p) * c.radDeg - h, 
        y > 180 ? y -= 360 : -180 > y && (y += 360), b.rotationIK = h + (y + a.worldRotation - b.parent.worldRotation) * g;
    }, c.Skin = function(a) {
        this.name = a, this.attachments = {};
    }, c.Skin.prototype = {
        addAttachment: function(a, b, c) {
            this.attachments[a + ":" + b] = c;
        },
        getAttachment: function(a, b) {
            return this.attachments[a + ":" + b];
        },
        _attachAll: function(a, b) {
            for (var c in b.attachments) {
                var d = c.indexOf(":"), e = parseInt(c.substring(0, d)), f = c.substring(d + 1), g = a.slots[e];
                if (g.attachment && g.attachment.name == f) {
                    var h = this.getAttachment(e, f);
                    h && g.setAttachment(h);
                }
            }
        }
    }, c.Animation = function(a, b, c) {
        this.name = a, this.timelines = b, this.duration = c;
    }, c.Animation.prototype = {
        apply: function(a, b, c, d, e) {
            d && 0 != this.duration && (c %= this.duration, b %= this.duration);
            for (var f = this.timelines, g = 0, h = f.length; h > g; g++) f[g].apply(a, b, c, e, 1);
        },
        mix: function(a, b, c, d, e, f) {
            d && 0 != this.duration && (c %= this.duration, b %= this.duration);
            for (var g = this.timelines, h = 0, i = g.length; i > h; h++) g[h].apply(a, b, c, e, f);
        }
    }, c.Animation.binarySearch = function(a, b, c) {
        var d = 0, e = Math.floor(a.length / c) - 2;
        if (!e) return c;
        for (var f = e >>> 1; ;) {
            if (a[(f + 1) * c] <= b ? d = f + 1 : e = f, d == e) return (d + 1) * c;
            f = d + e >>> 1;
        }
    }, c.Animation.binarySearch1 = function(a, b) {
        var c = 0, d = a.length - 2;
        if (!d) return 1;
        for (var e = d >>> 1; ;) {
            if (a[e + 1] <= b ? c = e + 1 : d = e, c == d) return c + 1;
            e = c + d >>> 1;
        }
    }, c.Animation.linearSearch = function(a, b, c) {
        for (var d = 0, e = a.length - c; e >= d; d += c) if (a[d] > b) return d;
        return -1;
    }, c.Curves = function() {
        this.curves = [];
    }, c.Curves.prototype = {
        setLinear: function(a) {
            this.curves[19 * a] = 0;
        },
        setStepped: function(a) {
            this.curves[19 * a] = 1;
        },
        setCurve: function(a, b, c, d, e) {
            var f = .1, g = f * f, h = g * f, i = 3 * f, j = 3 * g, k = 6 * g, l = 6 * h, m = 2 * -b + d, n = 2 * -c + e, o = 3 * (b - d) + 1, p = 3 * (c - e) + 1, q = b * i + m * j + o * h, r = c * i + n * j + p * h, s = m * k + o * l, t = n * k + p * l, u = o * l, v = p * l, w = 19 * a, x = this.curves;
            x[w++] = 2;
            for (var y = q, z = r, A = w + 19 - 1; A > w; w += 2) x[w] = y, x[w + 1] = z, q += s, 
            r += t, s += u, t += v, y += q, z += r;
        },
        getCurvePercent: function(a, b) {
            b = 0 > b ? 0 : b > 1 ? 1 : b;
            var c = this.curves, d = 19 * a, e = c[d];
            if (0 === e) return b;
            if (1 == e) return 0;
            d++;
            for (var f = 0, g = d, h = d + 19 - 1; h > d; d += 2) if (f = c[d], f >= b) {
                var i, j;
                return d == g ? (i = 0, j = 0) : (i = c[d - 2], j = c[d - 1]), j + (c[d + 1] - j) * (b - i) / (f - i);
            }
            var k = c[d - 1];
            return k + (1 - k) * (b - f) / (1 - f);
        }
    }, c.RotateTimeline = function(a) {
        this.curves = new c.Curves(a), this.frames = [], this.frames.length = 2 * a;
    }, c.RotateTimeline.prototype = {
        boneIndex: 0,
        getFrameCount: function() {
            return this.frames.length / 2;
        },
        setFrame: function(a, b, c) {
            a *= 2, this.frames[a] = b, this.frames[a + 1] = c;
        },
        apply: function(a, b, d, e, f) {
            var g = this.frames;
            if (!(d < g[0])) {
                var h = a.bones[this.boneIndex];
                if (d >= g[g.length - 2]) {
                    for (var i = h.data.rotation + g[g.length - 1] - h.rotation; i > 180; ) i -= 360;
                    for (;-180 > i; ) i += 360;
                    return void (h.rotation += i * f);
                }
                var j = c.Animation.binarySearch(g, d, 2), k = g[j - 1], l = g[j], m = 1 - (d - l) / (g[j - 2] - l);
                m = this.curves.getCurvePercent(j / 2 - 1, m);
                for (var i = g[j + 1] - k; i > 180; ) i -= 360;
                for (;-180 > i; ) i += 360;
                for (i = h.data.rotation + (k + i * m) - h.rotation; i > 180; ) i -= 360;
                for (;-180 > i; ) i += 360;
                h.rotation += i * f;
            }
        }
    }, c.TranslateTimeline = function(a) {
        this.curves = new c.Curves(a), this.frames = [], this.frames.length = 3 * a;
    }, c.TranslateTimeline.prototype = {
        boneIndex: 0,
        getFrameCount: function() {
            return this.frames.length / 3;
        },
        setFrame: function(a, b, c, d) {
            a *= 3, this.frames[a] = b, this.frames[a + 1] = c, this.frames[a + 2] = d;
        },
        apply: function(a, b, d, e, f) {
            var g = this.frames;
            if (!(d < g[0])) {
                var h = a.bones[this.boneIndex];
                if (d >= g[g.length - 3]) return h.x += (h.data.x + g[g.length - 2] - h.x) * f, 
                void (h.y += (h.data.y + g[g.length - 1] - h.y) * f);
                var i = c.Animation.binarySearch(g, d, 3), j = g[i - 2], k = g[i - 1], l = g[i], m = 1 - (d - l) / (g[i + -3] - l);
                m = this.curves.getCurvePercent(i / 3 - 1, m), h.x += (h.data.x + j + (g[i + 1] - j) * m - h.x) * f, 
                h.y += (h.data.y + k + (g[i + 2] - k) * m - h.y) * f;
            }
        }
    }, c.ScaleTimeline = function(a) {
        this.curves = new c.Curves(a), this.frames = [], this.frames.length = 3 * a;
    }, c.ScaleTimeline.prototype = {
        boneIndex: 0,
        getFrameCount: function() {
            return this.frames.length / 3;
        },
        setFrame: function(a, b, c, d) {
            a *= 3, this.frames[a] = b, this.frames[a + 1] = c, this.frames[a + 2] = d;
        },
        apply: function(a, b, d, e, f) {
            var g = this.frames;
            if (!(d < g[0])) {
                var h = a.bones[this.boneIndex];
                if (d >= g[g.length - 3]) return h.scaleX += (h.data.scaleX * g[g.length - 2] - h.scaleX) * f, 
                void (h.scaleY += (h.data.scaleY * g[g.length - 1] - h.scaleY) * f);
                var i = c.Animation.binarySearch(g, d, 3), j = g[i - 2], k = g[i - 1], l = g[i], m = 1 - (d - l) / (g[i + -3] - l);
                m = this.curves.getCurvePercent(i / 3 - 1, m), h.scaleX += (h.data.scaleX * (j + (g[i + 1] - j) * m) - h.scaleX) * f, 
                h.scaleY += (h.data.scaleY * (k + (g[i + 2] - k) * m) - h.scaleY) * f;
            }
        }
    }, c.ColorTimeline = function(a) {
        this.curves = new c.Curves(a), this.frames = [], this.frames.length = 5 * a;
    }, c.ColorTimeline.prototype = {
        slotIndex: 0,
        getFrameCount: function() {
            return this.frames.length / 5;
        },
        setFrame: function(a, b, c, d, e, f) {
            a *= 5, this.frames[a] = b, this.frames[a + 1] = c, this.frames[a + 2] = d, this.frames[a + 3] = e, 
            this.frames[a + 4] = f;
        },
        apply: function(a, b, d, e, f) {
            var g = this.frames;
            if (!(d < g[0])) {
                var h, i, j, k;
                if (d >= g[g.length - 5]) {
                    var l = g.length - 1;
                    h = g[l - 3], i = g[l - 2], j = g[l - 1], k = g[l];
                } else {
                    var m = c.Animation.binarySearch(g, d, 5), n = g[m - 4], o = g[m - 3], p = g[m - 2], q = g[m - 1], r = g[m], s = 1 - (d - r) / (g[m - 5] - r);
                    s = this.curves.getCurvePercent(m / 5 - 1, s), h = n + (g[m + 1] - n) * s, i = o + (g[m + 2] - o) * s, 
                    j = p + (g[m + 3] - p) * s, k = q + (g[m + 4] - q) * s;
                }
                var t = a.slots[this.slotIndex];
                1 > f ? (t.r += (h - t.r) * f, t.g += (i - t.g) * f, t.b += (j - t.b) * f, t.a += (k - t.a) * f) : (t.r = h, 
                t.g = i, t.b = j, t.a = k);
            }
        }
    }, c.AttachmentTimeline = function(a) {
        this.curves = new c.Curves(a), this.frames = [], this.frames.length = a, this.attachmentNames = [], 
        this.attachmentNames.length = a;
    }, c.AttachmentTimeline.prototype = {
        slotIndex: 0,
        getFrameCount: function() {
            return this.frames.length;
        },
        setFrame: function(a, b, c) {
            this.frames[a] = b, this.attachmentNames[a] = c;
        },
        apply: function(a, b, d) {
            var e = this.frames;
            if (d < e[0]) return void (b > d && this.apply(a, b, Number.MAX_VALUE, null, 0));
            b > d && (b = -1);
            var f = d >= e[e.length - 1] ? e.length - 1 : c.Animation.binarySearch1(e, d) - 1;
            if (!(e[f] < b)) {
                var g = this.attachmentNames[f];
                a.slots[this.slotIndex].setAttachment(g ? a.getAttachmentBySlotIndex(this.slotIndex, g) : null);
            }
        }
    }, c.EventTimeline = function(a) {
        this.frames = [], this.frames.length = a, this.events = [], this.events.length = a;
    }, c.EventTimeline.prototype = {
        getFrameCount: function() {
            return this.frames.length;
        },
        setFrame: function(a, b, c) {
            this.frames[a] = b, this.events[a] = c;
        },
        apply: function(a, b, d, e, f) {
            if (e) {
                var g = this.frames, h = g.length;
                if (b > d) this.apply(a, b, Number.MAX_VALUE, e, f), b = -1; else if (b >= g[h - 1]) return;
                if (!(d < g[0])) {
                    var i;
                    if (b < g[0]) i = 0; else {
                        i = c.Animation.binarySearch1(g, b);
                        for (var j = g[i]; i > 0 && g[i - 1] == j; ) i--;
                    }
                    for (var k = this.events; h > i && d >= g[i]; i++) e.push(k[i]);
                }
            }
        }
    }, c.DrawOrderTimeline = function(a) {
        this.frames = [], this.frames.length = a, this.drawOrders = [], this.drawOrders.length = a;
    }, c.DrawOrderTimeline.prototype = {
        getFrameCount: function() {
            return this.frames.length;
        },
        setFrame: function(a, b, c) {
            this.frames[a] = b, this.drawOrders[a] = c;
        },
        apply: function(a, b, d) {
            var e = this.frames;
            if (!(d < e[0])) {
                var f;
                f = d >= e[e.length - 1] ? e.length - 1 : c.Animation.binarySearch1(e, d) - 1;
                var g = a.drawOrder, h = (a.slots, this.drawOrders[f]);
                if (h) for (var i = 0, j = h.length; j > i; i++) g[i] = h[i];
            }
        }
    }, c.FfdTimeline = function(a) {
        this.curves = new c.Curves(a), this.frames = [], this.frames.length = a, this.frameVertices = [], 
        this.frameVertices.length = a;
    }, c.FfdTimeline.prototype = {
        slotIndex: 0,
        attachment: 0,
        getFrameCount: function() {
            return this.frames.length;
        },
        setFrame: function(a, b, c) {
            this.frames[a] = b, this.frameVertices[a] = c;
        },
        apply: function(a, b, d, e, f) {
            var g = a.slots[this.slotIndex];
            if (g.attachment == this.attachment) {
                var h = this.frames;
                if (!(d < h[0])) {
                    var i = this.frameVertices, j = i[0].length, k = g.attachmentVertices;
                    if (k.length != j && (f = 1), k.length = j, d >= h[h.length - 1]) {
                        var l = i[h.length - 1];
                        if (1 > f) for (var m = 0; j > m; m++) k[m] += (l[m] - k[m]) * f; else for (var m = 0; j > m; m++) k[m] = l[m];
                    } else {
                        var n = c.Animation.binarySearch1(h, d), o = h[n], p = 1 - (d - o) / (h[n - 1] - o);
                        p = this.curves.getCurvePercent(n - 1, 0 > p ? 0 : p > 1 ? 1 : p);
                        var q = i[n - 1], r = i[n];
                        if (1 > f) for (var m = 0; j > m; m++) {
                            var s = q[m];
                            k[m] += (s + (r[m] - s) * p - k[m]) * f;
                        } else for (var m = 0; j > m; m++) {
                            var s = q[m];
                            k[m] = s + (r[m] - s) * p;
                        }
                    }
                }
            }
        }
    }, c.IkConstraintTimeline = function(a) {
        this.curves = new c.Curves(a), this.frames = [], this.frames.length = 3 * a;
    }, c.IkConstraintTimeline.prototype = {
        ikConstraintIndex: 0,
        getFrameCount: function() {
            return this.frames.length / 3;
        },
        setFrame: function(a, b, c, d) {
            a *= 3, this.frames[a] = b, this.frames[a + 1] = c, this.frames[a + 2] = d;
        },
        apply: function(a, b, d, e, f) {
            var g = this.frames;
            if (!(d < g[0])) {
                var h = a.ikConstraints[this.ikConstraintIndex];
                if (d >= g[g.length - 3]) return h.mix += (g[g.length - 2] - h.mix) * f, void (h.bendDirection = g[g.length - 1]);
                var i = c.Animation.binarySearch(g, d, 3), j = g[i + -2], k = g[i], l = 1 - (d - k) / (g[i + -3] - k);
                l = this.curves.getCurvePercent(i / 3 - 1, l);
                var m = j + (g[i + 1] - j) * l;
                h.mix += (m - h.mix) * f, h.bendDirection = g[i + -1];
            }
        }
    }, c.FlipXTimeline = function(a) {
        this.curves = new c.Curves(a), this.frames = [], this.frames.length = 2 * a;
    }, c.FlipXTimeline.prototype = {
        boneIndex: 0,
        getFrameCount: function() {
            return this.frames.length / 2;
        },
        setFrame: function(a, b, c) {
            a *= 2, this.frames[a] = b, this.frames[a + 1] = c ? 1 : 0;
        },
        apply: function(a, b, d) {
            var e = this.frames;
            if (d < e[0]) return void (b > d && this.apply(a, b, Number.MAX_VALUE, null, 0));
            b > d && (b = -1);
            var f = (d >= e[e.length - 2] ? e.length : c.Animation.binarySearch(e, d, 2)) - 2;
            e[f] < b || (a.bones[boneIndex].flipX = 0 != e[f + 1]);
        }
    }, c.FlipYTimeline = function(a) {
        this.curves = new c.Curves(a), this.frames = [], this.frames.length = 2 * a;
    }, c.FlipYTimeline.prototype = {
        boneIndex: 0,
        getFrameCount: function() {
            return this.frames.length / 2;
        },
        setFrame: function(a, b, c) {
            a *= 2, this.frames[a] = b, this.frames[a + 1] = c ? 1 : 0;
        },
        apply: function(a, b, d) {
            var e = this.frames;
            if (d < e[0]) return void (b > d && this.apply(a, b, Number.MAX_VALUE, null, 0));
            b > d && (b = -1);
            var f = (d >= e[e.length - 2] ? e.length : c.Animation.binarySearch(e, d, 2)) - 2;
            e[f] < b || (a.bones[boneIndex].flipY = 0 != e[f + 1]);
        }
    }, c.SkeletonData = function() {
        this.bones = [], this.slots = [], this.skins = [], this.events = [], this.animations = [], 
        this.ikConstraints = [];
    }, c.SkeletonData.prototype = {
        name: null,
        defaultSkin: null,
        width: 0,
        height: 0,
        version: null,
        hash: null,
        findBone: function(a) {
            for (var b = this.bones, c = 0, d = b.length; d > c; c++) if (b[c].name == a) return b[c];
            return null;
        },
        findBoneIndex: function(a) {
            for (var b = this.bones, c = 0, d = b.length; d > c; c++) if (b[c].name == a) return c;
            return -1;
        },
        findSlot: function(a) {
            for (var b = this.slots, c = 0, d = b.length; d > c; c++) if (b[c].name == a) return slot[c];
            return null;
        },
        findSlotIndex: function(a) {
            for (var b = this.slots, c = 0, d = b.length; d > c; c++) if (b[c].name == a) return c;
            return -1;
        },
        findSkin: function(a) {
            for (var b = this.skins, c = 0, d = b.length; d > c; c++) if (b[c].name == a) return b[c];
            return null;
        },
        findEvent: function(a) {
            for (var b = this.events, c = 0, d = b.length; d > c; c++) if (b[c].name == a) return b[c];
            return null;
        },
        findAnimation: function(a) {
            for (var b = this.animations, c = 0, d = b.length; d > c; c++) if (b[c].name == a) return b[c];
            return null;
        },
        findIkConstraint: function(a) {
            for (var b = this.ikConstraints, c = 0, d = b.length; d > c; c++) if (b[c].name == a) return b[c];
            return null;
        }
    }, c.Skeleton = function(a) {
        this.data = a, this.bones = [];
        for (var b = 0, d = a.bones.length; d > b; b++) {
            var e = a.bones[b], f = e.parent ? this.bones[a.bones.indexOf(e.parent)] : null;
            this.bones.push(new c.Bone(e, this, f));
        }
        this.slots = [], this.drawOrder = [];
        for (var b = 0, d = a.slots.length; d > b; b++) {
            var g = a.slots[b], h = this.bones[a.bones.indexOf(g.boneData)], i = new c.Slot(g, h);
            this.slots.push(i), this.drawOrder.push(b);
        }
        this.ikConstraints = [];
        for (var b = 0, d = a.ikConstraints.length; d > b; b++) this.ikConstraints.push(new c.IkConstraint(a.ikConstraints[b], this));
        this.boneCache = [], this.updateCache();
    }, c.Skeleton.prototype = {
        x: 0,
        y: 0,
        skin: null,
        r: 1,
        g: 1,
        b: 1,
        a: 1,
        time: 0,
        flipX: !1,
        flipY: !1,
        updateCache: function() {
            var a = this.ikConstraints, b = a.length, c = b + 1, d = this.boneCache;
            d.length > c && (d.length = c);
            for (var e = 0, f = d.length; f > e; e++) d[e].length = 0;
            for (;d.length < c; ) d[d.length] = [];
            var g = d[0], h = this.bones;
            a: for (var e = 0, f = h.length; f > e; e++) {
                var i = h[e], j = i;
                do {
                    for (var k = 0; b > k; k++) for (var l = a[k], m = l.bones[0], n = l.bones[l.bones.length - 1]; ;) {
                        if (j == n) {
                            d[k].push(i), d[k + 1].push(i);
                            continue a;
                        }
                        if (n == m) break;
                        n = n.parent;
                    }
                    j = j.parent;
                } while (j);
                g[g.length] = i;
            }
        },
        updateWorldTransform: function() {
            for (var a = this.bones, b = 0, c = a.length; c > b; b++) {
                var d = a[b];
                d.rotationIK = d.rotation;
            }
            for (var b = 0, e = this.boneCache.length - 1; ;) {
                for (var f = this.boneCache[b], g = 0, h = f.length; h > g; g++) f[g].updateWorldTransform();
                if (b == e) break;
                this.ikConstraints[b].apply(), b++;
            }
        },
        setToSetupPose: function() {
            this.setBonesToSetupPose(), this.setSlotsToSetupPose();
        },
        setBonesToSetupPose: function() {
            for (var a = this.bones, b = 0, c = a.length; c > b; b++) a[b].setToSetupPose();
            for (var d = this.ikConstraints, b = 0, c = d.length; c > b; b++) {
                var e = d[b];
                e.bendDirection = e.data.bendDirection, e.mix = e.data.mix;
            }
        },
        setSlotsToSetupPose: function() {
            for (var a = this.slots, b = 0, c = a.length; c > b; b++) a[b].setToSetupPose(b);
            this.resetDrawOrder();
        },
        getRootBone: function() {
            return this.bones.length ? this.bones[0] : null;
        },
        findBone: function(a) {
            for (var b = this.bones, c = 0, d = b.length; d > c; c++) if (b[c].data.name == a) return b[c];
            return null;
        },
        findBoneIndex: function(a) {
            for (var b = this.bones, c = 0, d = b.length; d > c; c++) if (b[c].data.name == a) return c;
            return -1;
        },
        findSlot: function(a) {
            for (var b = this.slots, c = 0, d = b.length; d > c; c++) if (b[c].data.name == a) return b[c];
            return null;
        },
        findSlotIndex: function(a) {
            for (var b = this.slots, c = 0, d = b.length; d > c; c++) if (b[c].data.name == a) return c;
            return -1;
        },
        setSkinByName: function(a) {
            var b = this.data.findSkin(a);
            if (!b) throw "Skin not found: " + a;
            this.setSkin(b);
        },
        setSkin: function(a) {
            if (a) if (this.skin) a._attachAll(this, this.skin); else for (var b = this.slots, c = 0, d = b.length; d > c; c++) {
                var e = b[c], f = e.data.attachmentName;
                if (f) {
                    var g = a.getAttachment(c, f);
                    g && e.setAttachment(g);
                }
            }
            this.skin = a;
        },
        getAttachmentBySlotName: function(a, b) {
            return this.getAttachmentBySlotIndex(this.data.findSlotIndex(a), b);
        },
        getAttachmentBySlotIndex: function(a, b) {
            if (this.skin) {
                var c = this.skin.getAttachment(a, b);
                if (c) return c;
            }
            return this.data.defaultSkin ? this.data.defaultSkin.getAttachment(a, b) : null;
        },
        setAttachment: function(a, b) {
            for (var c = this.slots, d = 0, e = c.length; e > d; d++) {
                var f = c[d];
                if (f.data.name == a) {
                    var g = null;
                    if (b && (g = this.getAttachmentBySlotIndex(d, b), !g)) throw "Attachment not found: " + b + ", for slot: " + a;
                    return void f.setAttachment(g);
                }
            }
            throw "Slot not found: " + a;
        },
        findIkConstraint: function(a) {
            for (var b = this.ikConstraints, c = 0, d = b.length; d > c; c++) if (b[c].data.name == a) return b[c];
            return null;
        },
        update: function(a) {
            this.time += a;
        },
        resetDrawOrder: function() {
            for (var a = 0, b = this.drawOrder.length; b > a; a++) this.drawOrder[a] = a;
        }
    }, c.EventData = function(a) {
        this.name = a;
    }, c.EventData.prototype = {
        intValue: 0,
        floatValue: 0,
        stringValue: null
    }, c.Event = function(a) {
        this.data = a;
    }, c.Event.prototype = {
        intValue: 0,
        floatValue: 0,
        stringValue: null
    }, c.AttachmentType = {
        region: 0,
        boundingbox: 1,
        mesh: 2,
        skinnedmesh: 3
    }, c.RegionAttachment = function(a) {
        this.name = a, this.offset = [], this.offset.length = 8, this.uvs = [], this.uvs.length = 8;
    }, c.RegionAttachment.prototype = {
        type: c.AttachmentType.region,
        x: 0,
        y: 0,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        width: 0,
        height: 0,
        r: 1,
        g: 1,
        b: 1,
        a: 1,
        path: null,
        rendererObject: null,
        regionOffsetX: 0,
        regionOffsetY: 0,
        regionWidth: 0,
        regionHeight: 0,
        regionOriginalWidth: 0,
        regionOriginalHeight: 0,
        setUVs: function(a, b, c, d, e) {
            var f = this.uvs;
            e ? (f[2] = a, f[3] = d, f[4] = a, f[5] = b, f[6] = c, f[7] = b, f[0] = c, f[1] = d) : (f[0] = a, 
            f[1] = d, f[2] = a, f[3] = b, f[4] = c, f[5] = b, f[6] = c, f[7] = d);
        },
        updateOffset: function() {
            var a = this.width / this.regionOriginalWidth * this.scaleX, b = this.height / this.regionOriginalHeight * this.scaleY, d = -this.width / 2 * this.scaleX + this.regionOffsetX * a, e = -this.height / 2 * this.scaleY + this.regionOffsetY * b, f = d + this.regionWidth * a, g = e + this.regionHeight * b, h = this.rotation * c.degRad, i = Math.cos(h), j = Math.sin(h), k = d * i + this.x, l = d * j, m = e * i + this.y, n = e * j, o = f * i + this.x, p = f * j, q = g * i + this.y, r = g * j, s = this.offset;
            s[0] = k - n, s[1] = m + l, s[2] = k - r, s[3] = q + l, s[4] = o - r, s[5] = q + p, 
            s[6] = o - n, s[7] = m + p;
        },
        computeVertices: function(a, b, c, d) {
            a += c.worldX, b += c.worldY;
            var e = c.m00, f = c.m01, g = c.m10, h = c.m11, i = this.offset;
            d[0] = i[0] * e + i[1] * f + a, d[1] = i[0] * g + i[1] * h + b, d[2] = i[2] * e + i[3] * f + a, 
            d[3] = i[2] * g + i[3] * h + b, d[4] = i[4] * e + i[5] * f + a, d[5] = i[4] * g + i[5] * h + b, 
            d[6] = i[6] * e + i[7] * f + a, d[7] = i[6] * g + i[7] * h + b;
        }
    }, c.MeshAttachment = function(a) {
        this.name = a;
    }, c.MeshAttachment.prototype = {
        type: c.AttachmentType.mesh,
        vertices: null,
        uvs: null,
        regionUVs: null,
        triangles: null,
        hullLength: 0,
        r: 1,
        g: 1,
        b: 1,
        a: 1,
        path: null,
        rendererObject: null,
        regionU: 0,
        regionV: 0,
        regionU2: 0,
        regionV2: 0,
        regionRotate: !1,
        regionOffsetX: 0,
        regionOffsetY: 0,
        regionWidth: 0,
        regionHeight: 0,
        regionOriginalWidth: 0,
        regionOriginalHeight: 0,
        edges: null,
        width: 0,
        height: 0,
        updateUVs: function() {
            var a = this.regionU2 - this.regionU, b = this.regionV2 - this.regionV, d = this.regionUVs.length;
            if (this.uvs && this.uvs.length == d || (this.uvs = new c.Float32Array(d)), this.regionRotate) for (var e = 0; d > e; e += 2) this.uvs[e] = this.regionU + this.regionUVs[e + 1] * a, 
            this.uvs[e + 1] = this.regionV + b - this.regionUVs[e] * b; else for (var e = 0; d > e; e += 2) this.uvs[e] = this.regionU + this.regionUVs[e] * a, 
            this.uvs[e + 1] = this.regionV + this.regionUVs[e + 1] * b;
        },
        computeWorldVertices: function(a, b, c, d) {
            var e = c.bone;
            a += e.worldX, b += e.worldY;
            var f = e.m00, g = e.m01, h = e.m10, i = e.m11, j = this.vertices, k = j.length;
            c.attachmentVertices.length == k && (j = c.attachmentVertices);
            for (var l = 0; k > l; l += 2) {
                var m = j[l], n = j[l + 1];
                d[l] = m * f + n * g + a, d[l + 1] = m * h + n * i + b;
            }
        }
    }, c.SkinnedMeshAttachment = function(a) {
        this.name = a;
    }, c.SkinnedMeshAttachment.prototype = {
        type: c.AttachmentType.skinnedmesh,
        bones: null,
        weights: null,
        uvs: null,
        regionUVs: null,
        triangles: null,
        hullLength: 0,
        r: 1,
        g: 1,
        b: 1,
        a: 1,
        path: null,
        rendererObject: null,
        regionU: 0,
        regionV: 0,
        regionU2: 0,
        regionV2: 0,
        regionRotate: !1,
        regionOffsetX: 0,
        regionOffsetY: 0,
        regionWidth: 0,
        regionHeight: 0,
        regionOriginalWidth: 0,
        regionOriginalHeight: 0,
        edges: null,
        width: 0,
        height: 0,
        updateUVs: function() {
            var a = this.regionU2 - this.regionU, b = this.regionV2 - this.regionV, d = this.regionUVs.length;
            if (this.uvs && this.uvs.length == d || (this.uvs = new c.Float32Array(d)), this.regionRotate) for (var e = 0; d > e; e += 2) this.uvs[e] = this.regionU + this.regionUVs[e + 1] * a, 
            this.uvs[e + 1] = this.regionV + b - this.regionUVs[e] * b; else for (var e = 0; d > e; e += 2) this.uvs[e] = this.regionU + this.regionUVs[e] * a, 
            this.uvs[e + 1] = this.regionV + this.regionUVs[e + 1] * b;
        },
        computeWorldVertices: function(a, b, c, d) {
            var e, f, g, h, i, j, k, l = c.bone.skeleton.bones, m = this.weights, n = this.bones, o = 0, p = 0, q = 0, r = 0, s = n.length;
            if (c.attachmentVertices.length) for (var t = c.attachmentVertices; s > p; o += 2) {
                for (f = 0, g = 0, e = n[p++] + p; e > p; p++, q += 3, r += 2) h = l[n[p]], i = m[q] + t[r], 
                j = m[q + 1] + t[r + 1], k = m[q + 2], f += (i * h.m00 + j * h.m01 + h.worldX) * k, 
                g += (i * h.m10 + j * h.m11 + h.worldY) * k;
                d[o] = f + a, d[o + 1] = g + b;
            } else for (;s > p; o += 2) {
                for (f = 0, g = 0, e = n[p++] + p; e > p; p++, q += 3) h = l[n[p]], i = m[q], j = m[q + 1], 
                k = m[q + 2], f += (i * h.m00 + j * h.m01 + h.worldX) * k, g += (i * h.m10 + j * h.m11 + h.worldY) * k;
                d[o] = f + a, d[o + 1] = g + b;
            }
        }
    }, c.BoundingBoxAttachment = function(a) {
        this.name = a, this.vertices = [];
    }, c.BoundingBoxAttachment.prototype = {
        type: c.AttachmentType.boundingbox,
        computeWorldVertices: function(a, b, c, d) {
            a += c.worldX, b += c.worldY;
            for (var e = c.m00, f = c.m01, g = c.m10, h = c.m11, i = this.vertices, j = 0, k = i.length; k > j; j += 2) {
                var l = i[j], m = i[j + 1];
                d[j] = l * e + m * f + a, d[j + 1] = l * g + m * h + b;
            }
        }
    }, c.AnimationStateData = function(a) {
        this.skeletonData = a, this.animationToMixTime = {};
    }, c.AnimationStateData.prototype = {
        defaultMix: 0,
        setMixByName: function(a, b, c) {
            var d = this.skeletonData.findAnimation(a);
            if (!d) throw "Animation not found: " + a;
            var e = this.skeletonData.findAnimation(b);
            if (!e) throw "Animation not found: " + b;
            this.setMix(d, e, c);
        },
        setMix: function(a, b, c) {
            this.animationToMixTime[a.name + ":" + b.name] = c;
        },
        getMix: function(a, b) {
            var c = a.name + ":" + b.name;
            return this.animationToMixTime.hasOwnProperty(c) ? this.animationToMixTime[c] : this.defaultMix;
        }
    }, c.TrackEntry = function() {}, c.TrackEntry.prototype = {
        next: null,
        previous: null,
        animation: null,
        loop: !1,
        delay: 0,
        time: 0,
        lastTime: -1,
        endTime: 0,
        timeScale: 1,
        mixTime: 0,
        mixDuration: 0,
        mix: 1,
        onStart: null,
        onEnd: null,
        onComplete: null,
        onEvent: null
    }, c.AnimationState = function(a) {
        this.data = a, this.tracks = [], this.events = [];
    }, c.AnimationState.prototype = {
        onStart: null,
        onEnd: null,
        onComplete: null,
        onEvent: null,
        timeScale: 1,
        update: function(a) {
            a *= this.timeScale;
            for (var b = 0; b < this.tracks.length; b++) {
                var c = this.tracks[b];
                if (c) {
                    if (c.time += a * c.timeScale, c.previous) {
                        var d = a * c.previous.timeScale;
                        c.previous.time += d, c.mixTime += d;
                    }
                    var e = c.next;
                    e ? (e.time = c.lastTime - e.delay, e.time >= 0 && this.setCurrent(b, e)) : !c.loop && c.lastTime >= c.endTime && this.clearTrack(b);
                }
            }
        },
        apply: function(a) {
            a.resetDrawOrder();
            for (var b = 0; b < this.tracks.length; b++) {
                var c = this.tracks[b];
                if (c) {
                    this.events.length = 0;
                    var d = c.time, e = c.lastTime, f = c.endTime, g = c.loop;
                    !g && d > f && (d = f);
                    var h = c.previous;
                    if (h) {
                        var i = h.time;
                        !h.loop && i > h.endTime && (i = h.endTime), h.animation.apply(a, i, i, h.loop, null);
                        var j = c.mixTime / c.mixDuration * c.mix;
                        j >= 1 && (j = 1, c.previous = null), c.animation.mix(a, c.lastTime, d, g, this.events, j);
                    } else 1 == c.mix ? c.animation.apply(a, c.lastTime, d, g, this.events) : c.animation.mix(a, c.lastTime, d, g, this.events, c.mix);
                    for (var k = 0, l = this.events.length; l > k; k++) {
                        var m = this.events[k];
                        c.onEvent && c.onEvent(b, m), this.onEvent && this.onEvent(b, m);
                    }
                    if (g ? e % f > d % f : f > e && d >= f) {
                        var n = Math.floor(d / f);
                        c.onComplete && c.onComplete(b, n), this.onComplete && this.onComplete(b, n);
                    }
                    c.lastTime = c.time;
                }
            }
        },
        clearTracks: function() {
            for (var a = 0, b = this.tracks.length; b > a; a++) this.clearTrack(a);
            this.tracks.length = 0;
        },
        clearTrack: function(a) {
            if (!(a >= this.tracks.length)) {
                var b = this.tracks[a];
                b && (b.onEnd && b.onEnd(a), this.onEnd && this.onEnd(a), this.tracks[a] = null);
            }
        },
        _expandToIndex: function(a) {
            if (a < this.tracks.length) return this.tracks[a];
            for (;a >= this.tracks.length; ) this.tracks.push(null);
            return null;
        },
        setCurrent: function(a, b) {
            var c = this._expandToIndex(a);
            if (c) {
                var d = c.previous;
                c.previous = null, c.onEnd && c.onEnd(a), this.onEnd && this.onEnd(a), b.mixDuration = this.data.getMix(c.animation, b.animation), 
                b.mixDuration > 0 && (b.mixTime = 0, b.previous = d && c.mixTime / c.mixDuration < .5 ? d : c);
            }
            this.tracks[a] = b, b.onStart && b.onStart(a), this.onStart && this.onStart(a);
        },
        setAnimationByName: function(a, b, c) {
            var d = this.data.skeletonData.findAnimation(b);
            if (!d) throw "Animation not found: " + b;
            return this.setAnimation(a, d, c);
        },
        setAnimation: function(a, b, d) {
            var e = new c.TrackEntry();
            return e.animation = b, e.loop = d, e.endTime = b.duration, this.setCurrent(a, e), 
            e;
        },
        addAnimationByName: function(a, b, c, d) {
            var e = this.data.skeletonData.findAnimation(b);
            if (!e) throw "Animation not found: " + b;
            return this.addAnimation(a, e, c, d);
        },
        addAnimation: function(a, b, d, e) {
            var f = new c.TrackEntry();
            f.animation = b, f.loop = d, f.endTime = b.duration;
            var g = this._expandToIndex(a);
            if (g) {
                for (;g.next; ) g = g.next;
                g.next = f;
            } else this.tracks[a] = f;
            return 0 >= e && (g ? e += g.endTime - this.data.getMix(g.animation, b) : e = 0), 
            f.delay = e, f;
        },
        getCurrent: function(a) {
            return a >= this.tracks.length ? null : this.tracks[a];
        }
    }, c.SkeletonJson = function(a) {
        this.attachmentLoader = a;
    }, c.SkeletonJson.prototype = {
        scale: 1,
        readSkeletonData: function(a, b) {
            var d = new c.SkeletonData();
            d.name = b;
            var e = a.skeleton;
            e && (d.hash = e.hash, d.version = e.spine, d.width = e.width || 0, d.height = e.height || 0);
            for (var f = a.bones, g = 0, h = f.length; h > g; g++) {
                var i = f[g], j = null;
                if (i.parent && (j = d.findBone(i.parent), !j)) throw "Parent bone not found: " + i.parent;
                var k = new c.BoneData(i.name, j);
                k.length = (i.length || 0) * this.scale, k.x = (i.x || 0) * this.scale, k.y = (i.y || 0) * this.scale, 
                k.rotation = i.rotation || 0, k.scaleX = i.hasOwnProperty("scaleX") ? i.scaleX : 1, 
                k.scaleY = i.hasOwnProperty("scaleY") ? i.scaleY : 1, k.inheritScale = i.hasOwnProperty("inheritScale") ? i.inheritScale : !0, 
                k.inheritRotation = i.hasOwnProperty("inheritRotation") ? i.inheritRotation : !0, 
                d.bones.push(k);
            }
            var l = a.ik;
            if (l) for (var g = 0, h = l.length; h > g; g++) {
                for (var m = l[g], n = new c.IkConstraintData(m.name), f = m.bones, o = 0, p = f.length; p > o; o++) {
                    var q = d.findBone(f[o]);
                    if (!q) throw "IK bone not found: " + f[o];
                    n.bones.push(q);
                }
                if (n.target = d.findBone(m.target), !n.target) throw "Target bone not found: " + m.target;
                n.bendDirection = !m.hasOwnProperty("bendPositive") || m.bendPositive ? 1 : -1, 
                n.mix = m.hasOwnProperty("mix") ? m.mix : 1, d.ikConstraints.push(n);
            }
            for (var r = a.slots, g = 0, h = r.length; h > g; g++) {
                var s = r[g], k = d.findBone(s.bone);
                if (!k) throw "Slot bone not found: " + s.bone;
                var t = new c.SlotData(s.name, k), u = s.color;
                u && (t.r = this.toColor(u, 0), t.g = this.toColor(u, 1), t.b = this.toColor(u, 2), 
                t.a = this.toColor(u, 3)), t.attachmentName = s.attachment, t.additiveBlending = s.additive && "true" == s.additive, 
                d.slots.push(t);
            }
            var v = a.skins;
            for (var w in v) if (v.hasOwnProperty(w)) {
                var x = v[w], y = new c.Skin(w);
                for (var z in x) if (x.hasOwnProperty(z)) {
                    var A = d.findSlotIndex(z), B = x[z];
                    for (var C in B) if (B.hasOwnProperty(C)) {
                        var D = this.readAttachment(y, C, B[C]);
                        D && y.addAttachment(A, C, D);
                    }
                }
                d.skins.push(y), "default" == y.name && (d.defaultSkin = y);
            }
            var E = a.events;
            for (var F in E) if (E.hasOwnProperty(F)) {
                var G = E[F], H = new c.EventData(F);
                H.intValue = G["int"] || 0, H.floatValue = G["float"] || 0, H.stringValue = G.string || null, 
                d.events.push(H);
            }
            var I = a.animations;
            for (var J in I) I.hasOwnProperty(J) && this.readAnimation(J, I[J], d);
            return d;
        },
        readAttachment: function(a, b, d) {
            b = d.name || b;
            var e = c.AttachmentType[d.type || "region"], f = d.path || b, g = this.scale;
            if (e == c.AttachmentType.region) {
                var h = this.attachmentLoader.newRegionAttachment(a, b, f);
                if (!h) return null;
                h.path = f, h.x = (d.x || 0) * g, h.y = (d.y || 0) * g, h.scaleX = d.hasOwnProperty("scaleX") ? d.scaleX : 1, 
                h.scaleY = d.hasOwnProperty("scaleY") ? d.scaleY : 1, h.rotation = d.rotation || 0, 
                h.width = (d.width || 0) * g, h.height = (d.height || 0) * g;
                var i = d.color;
                return i && (h.r = this.toColor(i, 0), h.g = this.toColor(i, 1), h.b = this.toColor(i, 2), 
                h.a = this.toColor(i, 3)), h.updateOffset(), h;
            }
            if (e == c.AttachmentType.mesh) {
                var j = this.attachmentLoader.newMeshAttachment(a, b, f);
                return j ? (j.path = f, j.vertices = this.getFloatArray(d, "vertices", g), j.triangles = this.getIntArray(d, "triangles"), 
                j.regionUVs = this.getFloatArray(d, "uvs", 1), j.updateUVs(), i = d.color, i && (j.r = this.toColor(i, 0), 
                j.g = this.toColor(i, 1), j.b = this.toColor(i, 2), j.a = this.toColor(i, 3)), j.hullLength = 2 * (d.hull || 0), 
                d.edges && (j.edges = this.getIntArray(d, "edges")), j.width = (d.width || 0) * g, 
                j.height = (d.height || 0) * g, j) : null;
            }
            if (e == c.AttachmentType.skinnedmesh) {
                var j = this.attachmentLoader.newSkinnedMeshAttachment(a, b, f);
                if (!j) return null;
                j.path = f;
                for (var k = this.getFloatArray(d, "uvs", 1), l = this.getFloatArray(d, "vertices", 1), m = [], n = [], o = 0, p = l.length; p > o; ) {
                    var q = 0 | l[o++];
                    n[n.length] = q;
                    for (var r = o + 4 * q; r > o; ) n[n.length] = l[o], m[m.length] = l[o + 1] * g, 
                    m[m.length] = l[o + 2] * g, m[m.length] = l[o + 3], o += 4;
                }
                return j.bones = n, j.weights = m, j.triangles = this.getIntArray(d, "triangles"), 
                j.regionUVs = k, j.updateUVs(), i = d.color, i && (j.r = this.toColor(i, 0), j.g = this.toColor(i, 1), 
                j.b = this.toColor(i, 2), j.a = this.toColor(i, 3)), j.hullLength = 2 * (d.hull || 0), 
                d.edges && (j.edges = this.getIntArray(d, "edges")), j.width = (d.width || 0) * g, 
                j.height = (d.height || 0) * g, j;
            }
            if (e == c.AttachmentType.boundingbox) {
                for (var s = this.attachmentLoader.newBoundingBoxAttachment(a, b), l = d.vertices, o = 0, p = l.length; p > o; o++) s.vertices.push(l[o] * g);
                return s;
            }
            throw "Unknown attachment type: " + e;
        },
        readAnimation: function(a, b, d) {
            var e = [], f = 0, g = b.slots;
            for (var h in g) if (g.hasOwnProperty(h)) {
                var i = g[h], j = d.findSlotIndex(h);
                for (var k in i) if (i.hasOwnProperty(k)) {
                    var l = i[k];
                    if ("color" == k) {
                        var m = new c.ColorTimeline(l.length);
                        m.slotIndex = j;
                        for (var n = 0, o = 0, p = l.length; p > o; o++) {
                            var q = l[o], r = q.color, s = this.toColor(r, 0), t = this.toColor(r, 1), u = this.toColor(r, 2), v = this.toColor(r, 3);
                            m.setFrame(n, q.time, s, t, u, v), this.readCurve(m, n, q), n++;
                        }
                        e.push(m), f = Math.max(f, m.frames[5 * m.getFrameCount() - 5]);
                    } else {
                        if ("attachment" != k) throw "Invalid timeline type for a slot: " + k + " (" + h + ")";
                        var m = new c.AttachmentTimeline(l.length);
                        m.slotIndex = j;
                        for (var n = 0, o = 0, p = l.length; p > o; o++) {
                            var q = l[o];
                            m.setFrame(n++, q.time, q.name);
                        }
                        e.push(m), f = Math.max(f, m.frames[m.getFrameCount() - 1]);
                    }
                }
            }
            var w = b.bones;
            for (var x in w) if (w.hasOwnProperty(x)) {
                var y = d.findBoneIndex(x);
                if (-1 == y) throw "Bone not found: " + x;
                var z = w[x];
                for (var k in z) if (z.hasOwnProperty(k)) {
                    var l = z[k];
                    if ("rotate" == k) {
                        var m = new c.RotateTimeline(l.length);
                        m.boneIndex = y;
                        for (var n = 0, o = 0, p = l.length; p > o; o++) {
                            var q = l[o];
                            m.setFrame(n, q.time, q.angle), this.readCurve(m, n, q), n++;
                        }
                        e.push(m), f = Math.max(f, m.frames[2 * m.getFrameCount() - 2]);
                    } else if ("translate" == k || "scale" == k) {
                        var m, A = 1;
                        "scale" == k ? m = new c.ScaleTimeline(l.length) : (m = new c.TranslateTimeline(l.length), 
                        A = this.scale), m.boneIndex = y;
                        for (var n = 0, o = 0, p = l.length; p > o; o++) {
                            var q = l[o], B = (q.x || 0) * A, C = (q.y || 0) * A;
                            m.setFrame(n, q.time, B, C), this.readCurve(m, n, q), n++;
                        }
                        e.push(m), f = Math.max(f, m.frames[3 * m.getFrameCount() - 3]);
                    } else {
                        if ("flipX" != k && "flipY" != k) throw "Invalid timeline type for a bone: " + k + " (" + x + ")";
                        var B = "flipX" == k, m = B ? new c.FlipXTimeline(l.length) : new c.FlipYTimeline(l.length);
                        m.boneIndex = y;
                        for (var D = B ? "x" : "y", n = 0, o = 0, p = l.length; p > o; o++) {
                            var q = l[o];
                            m.setFrame(n, q.time, q[D] || !1), n++;
                        }
                        e.push(m), f = Math.max(f, m.frames[2 * m.getFrameCount() - 2]);
                    }
                }
            }
            var E = b.ik;
            for (var F in E) if (E.hasOwnProperty(F)) {
                var G = d.findIkConstraint(F), l = E[F], m = new c.IkConstraintTimeline(l.length);
                m.ikConstraintIndex = d.ikConstraints.indexOf(G);
                for (var n = 0, o = 0, p = l.length; p > o; o++) {
                    var q = l[o], H = q.hasOwnProperty("mix") ? q.mix : 1, I = !q.hasOwnProperty("bendPositive") || q.bendPositive ? 1 : -1;
                    m.setFrame(n, q.time, H, I), this.readCurve(m, n, q), n++;
                }
                e.push(m), f = Math.max(f, m.frames[3 * m.frameCount - 3]);
            }
            var J = b.ffd;
            for (var K in J) {
                var L = d.findSkin(K), i = J[K];
                for (h in i) {
                    var j = d.findSlotIndex(h), M = i[h];
                    for (var N in M) {
                        var l = M[N], m = new c.FfdTimeline(l.length), O = L.getAttachment(j, N);
                        if (!O) throw "FFD attachment not found: " + N;
                        m.slotIndex = j, m.attachment = O;
                        var P, Q = O.type == c.AttachmentType.mesh;
                        P = Q ? O.vertices.length : O.weights.length / 3 * 2;
                        for (var n = 0, o = 0, p = l.length; p > o; o++) {
                            var R, q = l[o];
                            if (q.vertices) {
                                var S = q.vertices, R = [];
                                R.length = P;
                                var T = q.offset || 0, U = S.length;
                                if (1 == this.scale) for (var V = 0; U > V; V++) R[V + T] = S[V]; else for (var V = 0; U > V; V++) R[V + T] = S[V] * this.scale;
                                if (Q) for (var W = O.vertices, V = 0, U = R.length; U > V; V++) R[V] += W[V];
                            } else Q ? R = O.vertices : (R = [], R.length = P);
                            m.setFrame(n, q.time, R), this.readCurve(m, n, q), n++;
                        }
                        e[e.length] = m, f = Math.max(f, m.frames[m.frameCount - 1]);
                    }
                }
            }
            var X = b.drawOrder;
            if (X || (X = b.draworder), X) {
                for (var m = new c.DrawOrderTimeline(X.length), Y = d.slots.length, n = 0, o = 0, p = X.length; p > o; o++) {
                    var Z = X[o], $ = null;
                    if (Z.offsets) {
                        $ = [], $.length = Y;
                        for (var V = Y - 1; V >= 0; V--) $[V] = -1;
                        var _ = Z.offsets, aa = [];
                        aa.length = Y - _.length;
                        for (var ba = 0, ca = 0, V = 0, U = _.length; U > V; V++) {
                            var da = _[V], j = d.findSlotIndex(da.slot);
                            if (-1 == j) throw "Slot not found: " + da.slot;
                            for (;ba != j; ) aa[ca++] = ba++;
                            $[ba + da.offset] = ba++;
                        }
                        for (;Y > ba; ) aa[ca++] = ba++;
                        for (var V = Y - 1; V >= 0; V--) -1 == $[V] && ($[V] = aa[--ca]);
                    }
                    m.setFrame(n++, Z.time, $);
                }
                e.push(m), f = Math.max(f, m.frames[m.getFrameCount() - 1]);
            }
            var ea = b.events;
            if (ea) {
                for (var m = new c.EventTimeline(ea.length), n = 0, o = 0, p = ea.length; p > o; o++) {
                    var fa = ea[o], ga = d.findEvent(fa.name);
                    if (!ga) throw "Event not found: " + fa.name;
                    var ha = new c.Event(ga);
                    ha.intValue = fa.hasOwnProperty("int") ? fa["int"] : ga.intValue, ha.floatValue = fa.hasOwnProperty("float") ? fa["float"] : ga.floatValue, 
                    ha.stringValue = fa.hasOwnProperty("string") ? fa.string : ga.stringValue, m.setFrame(n++, fa.time, ha);
                }
                e.push(m), f = Math.max(f, m.frames[m.getFrameCount() - 1]);
            }
            d.animations.push(new c.Animation(a, e, f));
        },
        readCurve: function(a, b, c) {
            var d = c.curve;
            d ? "stepped" == d ? a.curves.setStepped(b) : d instanceof Array && a.curves.setCurve(b, d[0], d[1], d[2], d[3]) : a.curves.setLinear(b);
        },
        toColor: function(a, b) {
            if (8 != a.length) throw "Color hexidecimal length must be 8, recieved: " + a;
            return parseInt(a.substring(2 * b, 2 * b + 2), 16) / 255;
        },
        getFloatArray: function(a, b, d) {
            var e = a[b], f = new c.Float32Array(e.length), g = 0, h = e.length;
            if (1 == d) for (;h > g; g++) f[g] = e[g]; else for (;h > g; g++) f[g] = e[g] * d;
            return f;
        },
        getIntArray: function(a, b) {
            for (var d = a[b], e = new c.Uint16Array(d.length), f = 0, g = d.length; g > f; f++) e[f] = 0 | d[f];
            return e;
        }
    }, c.Atlas = function(a, b) {
        this.textureLoader = b, this.pages = [], this.regions = [];
        var d = new c.AtlasReader(a), e = [];
        e.length = 4;
        for (var f = null; ;) {
            var g = d.readLine();
            if (null === g) break;
            if (g = d.trim(g), g.length) if (f) {
                var h = new c.AtlasRegion();
                h.name = g, h.page = f, h.rotate = "true" == d.readValue(), d.readTuple(e);
                var i = parseInt(e[0]), j = parseInt(e[1]);
                d.readTuple(e);
                var k = parseInt(e[0]), l = parseInt(e[1]);
                h.u = i / f.width, h.v = j / f.height, h.rotate ? (h.u2 = (i + l) / f.width, h.v2 = (j + k) / f.height) : (h.u2 = (i + k) / f.width, 
                h.v2 = (j + l) / f.height), h.x = i, h.y = j, h.width = Math.abs(k), h.height = Math.abs(l), 
                4 == d.readTuple(e) && (h.splits = [ parseInt(e[0]), parseInt(e[1]), parseInt(e[2]), parseInt(e[3]) ], 
                4 == d.readTuple(e) && (h.pads = [ parseInt(e[0]), parseInt(e[1]), parseInt(e[2]), parseInt(e[3]) ], 
                d.readTuple(e))), h.originalWidth = parseInt(e[0]), h.originalHeight = parseInt(e[1]), 
                d.readTuple(e), h.offsetX = parseInt(e[0]), h.offsetY = parseInt(e[1]), h.index = parseInt(d.readValue()), 
                this.regions.push(h);
            } else {
                f = new c.AtlasPage(), f.name = g, 2 == d.readTuple(e) && (f.width = parseInt(e[0]), 
                f.height = parseInt(e[1]), d.readTuple(e)), f.format = c.Atlas.Format[e[0]], d.readTuple(e), 
                f.minFilter = c.Atlas.TextureFilter[e[0]], f.magFilter = c.Atlas.TextureFilter[e[1]];
                var m = d.readValue();
                f.uWrap = c.Atlas.TextureWrap.clampToEdge, f.vWrap = c.Atlas.TextureWrap.clampToEdge, 
                "x" == m ? f.uWrap = c.Atlas.TextureWrap.repeat : "y" == m ? f.vWrap = c.Atlas.TextureWrap.repeat : "xy" == m && (f.uWrap = f.vWrap = c.Atlas.TextureWrap.repeat), 
                b.load(f, g, this), this.pages.push(f);
            } else f = null;
        }
    }, c.Atlas.prototype = {
        findRegion: function(a) {
            for (var b = this.regions, c = 0, d = b.length; d > c; c++) if (b[c].name == a) return b[c];
            return null;
        },
        dispose: function() {
            for (var a = this.pages, b = 0, c = a.length; c > b; b++) this.textureLoader.unload(a[b].rendererObject);
        },
        updateUVs: function(a) {
            for (var b = this.regions, c = 0, d = b.length; d > c; c++) {
                var e = b[c];
                e.page == a && (e.u = e.x / a.width, e.v = e.y / a.height, e.rotate ? (e.u2 = (e.x + e.height) / a.width, 
                e.v2 = (e.y + e.width) / a.height) : (e.u2 = (e.x + e.width) / a.width, e.v2 = (e.y + e.height) / a.height));
            }
        }
    }, c.Atlas.Format = {
        alpha: 0,
        intensity: 1,
        luminanceAlpha: 2,
        rgb565: 3,
        rgba4444: 4,
        rgb888: 5,
        rgba8888: 6
    }, c.Atlas.TextureFilter = {
        nearest: 0,
        linear: 1,
        mipMap: 2,
        mipMapNearestNearest: 3,
        mipMapLinearNearest: 4,
        mipMapNearestLinear: 5,
        mipMapLinearLinear: 6
    }, c.Atlas.TextureWrap = {
        mirroredRepeat: 0,
        clampToEdge: 1,
        repeat: 2
    }, c.AtlasPage = function() {}, c.AtlasPage.prototype = {
        name: null,
        format: null,
        minFilter: null,
        magFilter: null,
        uWrap: null,
        vWrap: null,
        rendererObject: null,
        width: 0,
        height: 0
    }, c.AtlasRegion = function() {}, c.AtlasRegion.prototype = {
        page: null,
        name: null,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        u: 0,
        v: 0,
        u2: 0,
        v2: 0,
        offsetX: 0,
        offsetY: 0,
        originalWidth: 0,
        originalHeight: 0,
        index: 0,
        rotate: !1,
        splits: null,
        pads: null
    }, c.AtlasReader = function(a) {
        this.lines = a.split(/\r\n|\r|\n/);
    }, c.AtlasReader.prototype = {
        index: 0,
        trim: function(a) {
            return a.replace(/^\s+|\s+$/g, "");
        },
        readLine: function() {
            return this.index >= this.lines.length ? null : this.lines[this.index++];
        },
        readValue: function() {
            var a = this.readLine(), b = a.indexOf(":");
            if (-1 == b) throw "Invalid line: " + a;
            return this.trim(a.substring(b + 1));
        },
        readTuple: function(a) {
            var b = this.readLine(), c = b.indexOf(":");
            if (-1 == c) throw "Invalid line: " + b;
            for (var d = 0, e = c + 1; 3 > d; d++) {
                var f = b.indexOf(",", e);
                if (-1 == f) break;
                a[d] = this.trim(b.substr(e, f - e)), e = f + 1;
            }
            return a[d] = this.trim(b.substring(e)), d + 1;
        }
    }, c.AtlasAttachmentLoader = function(a) {
        this.atlas = a;
    }, c.AtlasAttachmentLoader.prototype = {
        newRegionAttachment: function(a, b, d) {
            var e = this.atlas.findRegion(d);
            if (!e) throw "Region not found in atlas: " + d + " (region attachment: " + b + ")";
            var f = new c.RegionAttachment(b);
            return f.rendererObject = e, f.setUVs(e.u, e.v, e.u2, e.v2, e.rotate), f.regionOffsetX = e.offsetX, 
            f.regionOffsetY = e.offsetY, f.regionWidth = e.width, f.regionHeight = e.height, 
            f.regionOriginalWidth = e.originalWidth, f.regionOriginalHeight = e.originalHeight, 
            f;
        },
        newMeshAttachment: function(a, b, d) {
            var e = this.atlas.findRegion(d);
            if (!e) throw "Region not found in atlas: " + d + " (mesh attachment: " + b + ")";
            var f = new c.MeshAttachment(b);
            return f.rendererObject = e, f.regionU = e.u, f.regionV = e.v, f.regionU2 = e.u2, 
            f.regionV2 = e.v2, f.regionRotate = e.rotate, f.regionOffsetX = e.offsetX, f.regionOffsetY = e.offsetY, 
            f.regionWidth = e.width, f.regionHeight = e.height, f.regionOriginalWidth = e.originalWidth, 
            f.regionOriginalHeight = e.originalHeight, f;
        },
        newSkinnedMeshAttachment: function(a, b, d) {
            var e = this.atlas.findRegion(d);
            if (!e) throw "Region not found in atlas: " + d + " (skinned mesh attachment: " + b + ")";
            var f = new c.SkinnedMeshAttachment(b);
            return f.rendererObject = e, f.regionU = e.u, f.regionV = e.v, f.regionU2 = e.u2, 
            f.regionV2 = e.v2, f.regionRotate = e.rotate, f.regionOffsetX = e.offsetX, f.regionOffsetY = e.offsetY, 
            f.regionWidth = e.width, f.regionHeight = e.height, f.regionOriginalWidth = e.originalWidth, 
            f.regionOriginalHeight = e.originalHeight, f;
        },
        newBoundingBoxAttachment: function(a, b) {
            return new c.BoundingBoxAttachment(b);
        }
    }, c.SkeletonBounds = function() {
        this.polygonPool = [], this.polygons = [], this.boundingBoxes = [];
    }, c.SkeletonBounds.prototype = {
        minX: 0,
        minY: 0,
        maxX: 0,
        maxY: 0,
        update: function(a, b) {
            var d = a.slots, e = d.length, f = a.x, g = a.y, h = this.boundingBoxes, i = this.polygonPool, j = this.polygons;
            h.length = 0;
            for (var k = 0, l = j.length; l > k; k++) i.push(j[k]);
            j.length = 0;
            for (var k = 0; e > k; k++) {
                var m = d[k], n = m.attachment;
                if (n.type == c.AttachmentType.boundingbox) {
                    h.push(n);
                    var o, p = i.length;
                    p > 0 ? (o = i[p - 1], i.splice(p - 1, 1)) : o = [], j.push(o), o.length = n.vertices.length, 
                    n.computeWorldVertices(f, g, m.bone, o);
                }
            }
            b && this.aabbCompute();
        },
        aabbCompute: function() {
            for (var a = this.polygons, b = Number.MAX_VALUE, c = Number.MAX_VALUE, d = Number.MIN_VALUE, e = Number.MIN_VALUE, f = 0, g = a.length; g > f; f++) for (var h = a[f], i = 0, j = h.length; j > i; i += 2) {
                var k = h[i], l = h[i + 1];
                b = Math.min(b, k), c = Math.min(c, l), d = Math.max(d, k), e = Math.max(e, l);
            }
            this.minX = b, this.minY = c, this.maxX = d, this.maxY = e;
        },
        aabbContainsPoint: function(a, b) {
            return a >= this.minX && a <= this.maxX && b >= this.minY && b <= this.maxY;
        },
        aabbIntersectsSegment: function(a, b, c, d) {
            var e = this.minX, f = this.minY, g = this.maxX, h = this.maxY;
            if (e >= a && e >= c || f >= b && f >= d || a >= g && c >= g || b >= h && d >= h) return !1;
            var i = (d - b) / (c - a), j = i * (e - a) + b;
            if (j > f && h > j) return !0;
            if (j = i * (g - a) + b, j > f && h > j) return !0;
            var k = (f - b) / i + a;
            return k > e && g > k ? !0 : (k = (h - b) / i + a, k > e && g > k ? !0 : !1);
        },
        aabbIntersectsSkeleton: function(a) {
            return this.minX < a.maxX && this.maxX > a.minX && this.minY < a.maxY && this.maxY > a.minY;
        },
        containsPoint: function(a, b) {
            for (var c = this.polygons, d = 0, e = c.length; e > d; d++) if (this.polygonContainsPoint(c[d], a, b)) return this.boundingBoxes[d];
            return null;
        },
        intersectsSegment: function(a, b, c, d) {
            for (var e = this.polygons, f = 0, g = e.length; g > f; f++) if (e[f].intersectsSegment(a, b, c, d)) return this.boundingBoxes[f];
            return null;
        },
        polygonContainsPoint: function(a, b, c) {
            for (var d = a.length, e = d - 2, f = !1, g = 0; d > g; g += 2) {
                var h = a[g + 1], i = a[e + 1];
                if (c > h && i >= c || c > i && h >= c) {
                    var j = a[g];
                    j + (c - h) / (i - h) * (a[e] - j) < b && (f = !f);
                }
                e = g;
            }
            return f;
        },
        polygonIntersectsSegment: function(a, b, c, d, e) {
            for (var f = a.length, g = b - d, h = c - e, i = b * e - c * d, j = a[f - 2], k = a[f - 1], l = 0; f > l; l += 2) {
                var m = a[l], n = a[l + 1], o = j * n - k * m, p = j - m, q = k - n, r = g * q - h * p, s = (i * p - g * o) / r;
                if ((s >= j && m >= s || s >= m && j >= s) && (s >= b && d >= s || s >= d && b >= s)) {
                    var t = (i * q - h * o) / r;
                    if ((t >= k && n >= t || t >= n && k >= t) && (t >= c && e >= t || t >= e && c >= t)) return !0;
                }
                j = m, k = n;
            }
            return !1;
        },
        getPolygon: function(a) {
            var b = this.boundingBoxes.indexOf(a);
            return -1 == b ? null : this.polygons[b];
        },
        getWidth: function() {
            return this.maxX - this.minX;
        },
        getHeight: function() {
            return this.maxY - this.minY;
        }
    }, c.Bone.yDown = !0, b.AnimCache = {}, b.SpineTextureLoader = function(a, c) {
        b.EventTarget.call(this), this.basePath = a, this.crossorigin = c, this.loadingCount = 0;
    }, b.SpineTextureLoader.prototype = b.SpineTextureLoader, b.SpineTextureLoader.prototype.load = function(a, c) {
        if (a.rendererObject = b.BaseTexture.fromImage(this.basePath + "/" + c, this.crossorigin), 
        !a.rendererObject.hasLoaded) {
            var d = this;
            ++d.loadingCount, a.rendererObject.addEventListener("loaded", function() {
                --d.loadingCount, d.dispatchEvent({
                    type: "loadedBaseTexture",
                    content: d
                });
            });
        }
    }, b.SpineTextureLoader.prototype.unload = function(a) {
        a.destroy(!0);
    }, b.Spine = function(a) {
        if (b.DisplayObjectContainer.call(this), this.spineData = b.AnimCache[a], !this.spineData) throw new Error("Spine data must be preloaded using PIXI.SpineLoader or PIXI.AssetLoader: " + a);
        this.skeleton = new c.Skeleton(this.spineData), this.skeleton.updateWorldTransform(), 
        this.stateData = new c.AnimationStateData(this.spineData), this.state = new c.AnimationState(this.stateData), 
        this.slotContainers = [];
        for (var d = 0, e = this.skeleton.slots.length; e > d; d++) {
            var f = this.skeleton.slots[d], g = f.attachment, h = new b.DisplayObjectContainer();
            if (this.slotContainers.push(h), this.addChild(h), g instanceof c.RegionAttachment) {
                var i = g.rendererObject.name, j = this.createSprite(f, g);
                f.currentSprite = j, f.currentSpriteName = i, h.addChild(j);
            } else {
                if (!(g instanceof c.MeshAttachment)) continue;
                var k = this.createMesh(f, g);
                f.currentMesh = k, f.currentMeshName = g.name, h.addChild(k);
            }
        }
        this.autoUpdate = !0;
    }, b.Spine.prototype = Object.create(b.DisplayObjectContainer.prototype), b.Spine.prototype.constructor = b.Spine, 
    Object.defineProperty(b.Spine.prototype, "autoUpdate", {
        get: function() {
            return this.updateTransform === b.Spine.prototype.autoUpdateTransform;
        },
        set: function(a) {
            this.updateTransform = a ? b.Spine.prototype.autoUpdateTransform : b.DisplayObjectContainer.prototype.updateTransform;
        }
    }), b.Spine.prototype.update = function(a) {
        this.state.update(a), this.state.apply(this.skeleton), this.skeleton.updateWorldTransform();
        for (var d = this.skeleton.drawOrder, e = this.skeleton.slots, f = 0, g = d.length; g > f; f++) this.children[f] = this.slotContainers[d[f]];
        for (f = 0, g = e.length; g > f; f++) {
            var h = e[f], i = h.attachment, j = this.slotContainers[f];
            if (i) {
                var k = i.type;
                if (k === c.AttachmentType.region) {
                    if (i.rendererObject && (!h.currentSpriteName || h.currentSpriteName !== i.name)) {
                        var l = i.rendererObject.name;
                        if (void 0 !== h.currentSprite && (h.currentSprite.visible = !1), h.sprites = h.sprites || {}, 
                        void 0 !== h.sprites[l]) h.sprites[l].visible = !0; else {
                            var m = this.createSprite(h, i);
                            j.addChild(m);
                        }
                        h.currentSprite = h.sprites[l], h.currentSpriteName = l;
                    }
                    var n = h.bone;
                    j.position.x = n.worldX + i.x * n.m00 + i.y * n.m01, j.position.y = n.worldY + i.x * n.m10 + i.y * n.m11, 
                    j.scale.x = n.worldScaleX, j.scale.y = n.worldScaleY, j.rotation = -(h.bone.worldRotation * c.degRad), 
                    h.currentSprite.tint = b.rgb2hex([ h.r, h.g, h.b ]);
                } else {
                    if (k !== c.AttachmentType.skinnedmesh) {
                        j.visible = !1;
                        continue;
                    }
                    if (!h.currentMeshName || h.currentMeshName !== i.name) {
                        var o = i.name;
                        if (void 0 !== h.currentMesh && (h.currentMesh.visible = !1), h.meshes = h.meshes || {}, 
                        void 0 !== h.meshes[o]) h.meshes[o].visible = !0; else {
                            var p = this.createMesh(h, i);
                            j.addChild(p);
                        }
                        h.currentMesh = h.meshes[o], h.currentMeshName = o;
                    }
                    i.computeWorldVertices(h.bone.skeleton.x, h.bone.skeleton.y, h, h.currentMesh.vertices);
                }
                j.visible = !0, j.alpha = h.a;
            } else j.visible = !1;
        }
    }, b.Spine.prototype.autoUpdateTransform = function() {
        this.lastTime = this.lastTime || Date.now();
        var a = .001 * (Date.now() - this.lastTime);
        this.lastTime = Date.now(), this.update(a), b.DisplayObjectContainer.prototype.updateTransform.call(this);
    }, b.Spine.prototype.createSprite = function(a, d) {
        var e = d.rendererObject, f = e.page.rendererObject, g = new b.Rectangle(e.x, e.y, e.rotate ? e.height : e.width, e.rotate ? e.width : e.height), h = new b.Texture(f, g), i = new b.Sprite(h), j = e.rotate ? .5 * Math.PI : 0;
        return i.scale.set(e.width / e.originalWidth, e.height / e.originalHeight), i.rotation = j - d.rotation * c.degRad, 
        i.anchor.x = i.anchor.y = .5, a.sprites = a.sprites || {}, a.sprites[e.name] = i, 
        i;
    }, b.Spine.prototype.createMesh = function(a, c) {
        var d = c.rendererObject, e = d.page.rendererObject, f = new b.Texture(e), g = new b.Strip(f);
        return g.drawMode = b.Strip.DrawModes.TRIANGLES, g.canvasPadding = 1.5, g.vertices = new b.Float32Array(c.uvs.length), 
        g.uvs = c.uvs, g.indices = c.triangles, a.meshes = a.meshes || {}, a.meshes[c.name] = g, 
        g;
    }, b.BaseTextureCache = {}, b.BaseTextureCacheIdGenerator = 0, b.BaseTexture = function(a, c) {
        if (this.resolution = 1, this.width = 100, this.height = 100, this.scaleMode = c || b.scaleModes.DEFAULT, 
        this.hasLoaded = !1, this.source = a, this._UID = b._UID++, this.premultipliedAlpha = !0, 
        this._glTextures = [], this.mipmap = !1, this._dirty = [ !0, !0, !0, !0 ], a) {
            if ((this.source.complete || this.source.getContext) && this.source.width && this.source.height) this.hasLoaded = !0, 
            this.width = this.source.naturalWidth || this.source.width, this.height = this.source.naturalHeight || this.source.height, 
            this.dirty(); else {
                var d = this;
                this.source.onload = function() {
                    d.hasLoaded = !0, d.width = d.source.naturalWidth || d.source.width, d.height = d.source.naturalHeight || d.source.height, 
                    d.dirty(), d.dispatchEvent({
                        type: "loaded",
                        content: d
                    });
                }, this.source.onerror = function() {
                    d.dispatchEvent({
                        type: "error",
                        content: d
                    });
                };
            }
            this.imageUrl = null, this._powerOf2 = !1;
        }
    }, b.BaseTexture.prototype.constructor = b.BaseTexture, b.EventTarget.mixin(b.BaseTexture.prototype), 
    b.BaseTexture.prototype.destroy = function() {
        this.imageUrl ? (delete b.BaseTextureCache[this.imageUrl], delete b.TextureCache[this.imageUrl], 
        this.imageUrl = null, navigator.isCocoonJS || (this.source.src = "")) : this.source && this.source._pixiId && delete b.BaseTextureCache[this.source._pixiId], 
        this.source = null, this.unloadFromGPU();
    }, b.BaseTexture.prototype.updateSourceImage = function(a) {
        this.hasLoaded = !1, this.source.src = null, this.source.src = a;
    }, b.BaseTexture.prototype.dirty = function() {
        for (var a = 0; a < this._glTextures.length; a++) this._dirty[a] = !0;
    }, b.BaseTexture.prototype.unloadFromGPU = function() {
        this.dirty();
        for (var a = this._glTextures.length - 1; a >= 0; a--) {
            var c = this._glTextures[a], d = b.glContexts[a];
            d && c && d.deleteTexture(c);
        }
        this._glTextures.length = 0, this.dirty();
    }, b.BaseTexture.fromImage = function(a, c, d) {
        var e = b.BaseTextureCache[a];
        if (void 0 === c && -1 === a.indexOf("data:") && (c = !0), !e) {
            var f = new Image();
            c && (f.crossOrigin = ""), f.src = a, e = new b.BaseTexture(f, d), e.imageUrl = a, 
            b.BaseTextureCache[a] = e, -1 !== a.indexOf(b.RETINA_PREFIX + ".") && (e.resolution = 2);
        }
        return e;
    }, b.BaseTexture.fromCanvas = function(a, c) {
        a._pixiId || (a._pixiId = "canvas_" + b.TextureCacheIdGenerator++);
        var d = b.BaseTextureCache[a._pixiId];
        return d || (d = new b.BaseTexture(a, c), b.BaseTextureCache[a._pixiId] = d), d;
    }, b.TextureCache = {}, b.FrameCache = {}, b.TextureCacheIdGenerator = 0, b.Texture = function(a, c, d, e) {
        this.noFrame = !1, c || (this.noFrame = !0, c = new b.Rectangle(0, 0, 1, 1)), a instanceof b.Texture && (a = a.baseTexture), 
        this.baseTexture = a, this.frame = c, this.trim = e, this.valid = !1, this.requiresUpdate = !1, 
        this._uvs = null, this.width = 0, this.height = 0, this.crop = d || new b.Rectangle(0, 0, 1, 1), 
        a.hasLoaded ? (this.noFrame && (c = new b.Rectangle(0, 0, a.width, a.height)), this.setFrame(c)) : a.addEventListener("loaded", this.onBaseTextureLoaded.bind(this));
    }, b.Texture.prototype.constructor = b.Texture, b.EventTarget.mixin(b.Texture.prototype), 
    b.Texture.prototype.onBaseTextureLoaded = function() {
        var a = this.baseTexture;
        a.removeEventListener("loaded", this.onLoaded), this.noFrame && (this.frame = new b.Rectangle(0, 0, a.width, a.height)), 
        this.setFrame(this.frame), this.dispatchEvent({
            type: "update",
            content: this
        });
    }, b.Texture.prototype.destroy = function(a) {
        a && this.baseTexture.destroy(), this.valid = !1;
    }, b.Texture.prototype.setFrame = function(a) {
        if (this.noFrame = !1, this.frame = a, this.width = a.width, this.height = a.height, 
        this.crop.x = a.x, this.crop.y = a.y, this.crop.width = a.width, this.crop.height = a.height, 
        !this.trim && (a.x + a.width > this.baseTexture.width || a.y + a.height > this.baseTexture.height)) throw new Error("Texture Error: frame does not fit inside the base Texture dimensions " + this);
        this.valid = a && a.width && a.height && this.baseTexture.source && this.baseTexture.hasLoaded, 
        this.trim && (this.width = this.trim.width, this.height = this.trim.height, this.frame.width = this.trim.width, 
        this.frame.height = this.trim.height), this.valid && this._updateUvs();
    }, b.Texture.prototype._updateUvs = function() {
        this._uvs || (this._uvs = new b.TextureUvs());
        var a = this.crop, c = this.baseTexture.width, d = this.baseTexture.height;
        this._uvs.x0 = a.x / c, this._uvs.y0 = a.y / d, this._uvs.x1 = (a.x + a.width) / c, 
        this._uvs.y1 = a.y / d, this._uvs.x2 = (a.x + a.width) / c, this._uvs.y2 = (a.y + a.height) / d, 
        this._uvs.x3 = a.x / c, this._uvs.y3 = (a.y + a.height) / d;
    }, b.Texture.fromImage = function(a, c, d) {
        var e = b.TextureCache[a];
        return e || (e = new b.Texture(b.BaseTexture.fromImage(a, c, d)), b.TextureCache[a] = e), 
        e;
    }, b.Texture.fromFrame = function(a) {
        var c = b.TextureCache[a];
        if (!c) throw new Error('The frameId "' + a + '" does not exist in the texture cache ');
        return c;
    }, b.Texture.fromCanvas = function(a, c) {
        var d = b.BaseTexture.fromCanvas(a, c);
        return new b.Texture(d);
    }, b.Texture.addTextureToCache = function(a, c) {
        b.TextureCache[c] = a;
    }, b.Texture.removeTextureFromCache = function(a) {
        var c = b.TextureCache[a];
        return delete b.TextureCache[a], delete b.BaseTextureCache[a], c;
    }, b.TextureUvs = function() {
        this.x0 = 0, this.y0 = 0, this.x1 = 0, this.y1 = 0, this.x2 = 0, this.y2 = 0, this.x3 = 0, 
        this.y3 = 0;
    }, b.Texture.emptyTexture = new b.Texture(new b.BaseTexture()), b.RenderTexture = function(a, c, d, e, f) {
        if (this.width = a || 100, this.height = c || 100, this.resolution = f || 1, this.frame = new b.Rectangle(0, 0, this.width * this.resolution, this.height * this.resolution), 
        this.crop = new b.Rectangle(0, 0, this.width * this.resolution, this.height * this.resolution), 
        this.baseTexture = new b.BaseTexture(), this.baseTexture.width = this.width * this.resolution, 
        this.baseTexture.height = this.height * this.resolution, this.baseTexture._glTextures = [], 
        this.baseTexture.resolution = this.resolution, this.baseTexture.scaleMode = e || b.scaleModes.DEFAULT, 
        this.baseTexture.hasLoaded = !0, b.Texture.call(this, this.baseTexture, new b.Rectangle(0, 0, this.width * this.resolution, this.height * this.resolution)), 
        this.renderer = d || b.defaultRenderer, this.renderer.type === b.WEBGL_RENDERER) {
            var g = this.renderer.gl;
            this.baseTexture._dirty[g.id] = !1, this.textureBuffer = new b.FilterTexture(g, this.width, this.height, this.baseTexture.scaleMode), 
            this.baseTexture._glTextures[g.id] = this.textureBuffer.texture, this.render = this.renderWebGL, 
            this.projection = new b.Point(.5 * this.width, .5 * -this.height);
        } else this.render = this.renderCanvas, this.textureBuffer = new b.CanvasBuffer(this.width * this.resolution, this.height * this.resolution), 
        this.baseTexture.source = this.textureBuffer.canvas;
        this.valid = !0, this._updateUvs();
    }, b.RenderTexture.prototype = Object.create(b.Texture.prototype), b.RenderTexture.prototype.constructor = b.RenderTexture, 
    b.RenderTexture.prototype.resize = function(a, c, d) {
        (a !== this.width || c !== this.height) && (this.valid = a > 0 && c > 0, this.width = a, 
        this.height = c, this.frame.width = this.crop.width = a * this.resolution, this.frame.height = this.crop.height = c * this.resolution, 
        d && (this.baseTexture.width = this.width * this.resolution, this.baseTexture.height = this.height * this.resolution), 
        this.renderer.type === b.WEBGL_RENDERER && (this.projection.x = this.width / 2, 
        this.projection.y = -this.height / 2), this.valid && this.textureBuffer.resize(this.width, this.height));
    }, b.RenderTexture.prototype.clear = function() {
        this.valid && (this.renderer.type === b.WEBGL_RENDERER && this.renderer.gl.bindFramebuffer(this.renderer.gl.FRAMEBUFFER, this.textureBuffer.frameBuffer), 
        this.textureBuffer.clear());
    }, b.RenderTexture.prototype.renderWebGL = function(a, b, c) {
        if (this.valid) {
            var d = a.worldTransform;
            d.identity(), d.translate(0, 2 * this.projection.y), b && d.append(b), d.scale(1, -1), 
            a.worldAlpha = 1;
            for (var e = a.children, f = 0, g = e.length; g > f; f++) e[f].updateTransform();
            var h = this.renderer.gl;
            h.viewport(0, 0, this.width * this.resolution, this.height * this.resolution), h.bindFramebuffer(h.FRAMEBUFFER, this.textureBuffer.frameBuffer), 
            c && this.textureBuffer.clear(), this.renderer.spriteBatch.dirty = !0, this.renderer.renderDisplayObject(a, this.projection, this.textureBuffer.frameBuffer), 
            this.renderer.spriteBatch.dirty = !0;
        }
    }, b.RenderTexture.prototype.renderCanvas = function(a, b, c) {
        if (this.valid) {
            var d = a.worldTransform;
            d.identity(), b && d.append(b), a.worldAlpha = 1;
            for (var e = a.children, f = 0, g = e.length; g > f; f++) e[f].updateTransform();
            c && this.textureBuffer.clear();
            var h = this.textureBuffer.context, i = this.renderer.resolution;
            this.renderer.resolution = this.resolution, this.renderer.renderDisplayObject(a, h), 
            this.renderer.resolution = i;
        }
    }, b.RenderTexture.prototype.getImage = function() {
        var a = new Image();
        return a.src = this.getBase64(), a;
    }, b.RenderTexture.prototype.getBase64 = function() {
        return this.getCanvas().toDataURL();
    }, b.RenderTexture.prototype.getCanvas = function() {
        if (this.renderer.type === b.WEBGL_RENDERER) {
            var a = this.renderer.gl, c = this.textureBuffer.width, d = this.textureBuffer.height, e = new Uint8Array(4 * c * d);
            a.bindFramebuffer(a.FRAMEBUFFER, this.textureBuffer.frameBuffer), a.readPixels(0, 0, c, d, a.RGBA, a.UNSIGNED_BYTE, e), 
            a.bindFramebuffer(a.FRAMEBUFFER, null);
            var f = new b.CanvasBuffer(c, d), g = f.context.getImageData(0, 0, c, d);
            return g.data.set(e), f.context.putImageData(g, 0, 0), f.canvas;
        }
        return this.textureBuffer.canvas;
    }, b.RenderTexture.tempMatrix = new b.Matrix(), b.VideoTexture = function(a, c) {
        if (!a) throw new Error("No video source element specified.");
        (a.readyState === a.HAVE_ENOUGH_DATA || a.readyState === a.HAVE_FUTURE_DATA) && a.width && a.height && (a.complete = !0), 
        b.BaseTexture.call(this, a, c), this.autoUpdate = !1, this.updateBound = this._onUpdate.bind(this), 
        a.complete || (this._onCanPlay = this.onCanPlay.bind(this), a.addEventListener("canplay", this._onCanPlay), 
        a.addEventListener("canplaythrough", this._onCanPlay), a.addEventListener("play", this.onPlayStart.bind(this)), 
        a.addEventListener("pause", this.onPlayStop.bind(this)));
    }, b.VideoTexture.prototype = Object.create(b.BaseTexture.prototype), b.VideoTexture.constructor = b.VideoTexture, 
    b.VideoTexture.prototype._onUpdate = function() {
        this.autoUpdate && (window.requestAnimationFrame(this.updateBound), this.dirty());
    }, b.VideoTexture.prototype.onPlayStart = function() {
        this.autoUpdate || (window.requestAnimationFrame(this.updateBound), this.autoUpdate = !0);
    }, b.VideoTexture.prototype.onPlayStop = function() {
        this.autoUpdate = !1;
    }, b.VideoTexture.prototype.onCanPlay = function() {
        "canplaythrough" === event.type && (this.hasLoaded = !0, this.source && (this.source.removeEventListener("canplay", this._onCanPlay), 
        this.source.removeEventListener("canplaythrough", this._onCanPlay), this.width = this.source.videoWidth, 
        this.height = this.source.videoHeight, this.__loaded || (this.__loaded = !0, this.dispatchEvent({
            type: "loaded",
            content: this
        }))));
    }, b.VideoTexture.prototype.destroy = function() {
        this.source && this.source._pixiId && (b.BaseTextureCache[this.source._pixiId] = null, 
        delete b.BaseTextureCache[this.source._pixiId], this.source._pixiId = null, delete this.source._pixiId), 
        b.BaseTexture.prototype.destroy.call(this);
    }, b.VideoTexture.baseTextureFromVideo = function(a, c) {
        a._pixiId || (a._pixiId = "video_" + b.TextureCacheIdGenerator++);
        var d = b.BaseTextureCache[a._pixiId];
        return d || (d = new b.VideoTexture(a, c), b.BaseTextureCache[a._pixiId] = d), d;
    }, b.VideoTexture.textureFromVideo = function(a, c) {
        var d = b.VideoTexture.baseTextureFromVideo(a, c);
        return new b.Texture(d);
    }, b.VideoTexture.fromUrl = function(a, c) {
        var d = document.createElement("video");
        return d.src = a, d.autoPlay = !0, d.play(), b.VideoTexture.textureFromVideo(d, c);
    }, b.AssetLoader = function(a, c) {
        this.assetURLs = a, this.crossorigin = c, this.loadersByType = {
            jpg: b.ImageLoader,
            jpeg: b.ImageLoader,
            png: b.ImageLoader,
            gif: b.ImageLoader,
            webp: b.ImageLoader,
            json: b.JsonLoader,
            atlas: b.AtlasLoader,
            anim: b.SpineLoader,
            xml: b.BitmapFontLoader,
            fnt: b.BitmapFontLoader
        };
    }, b.EventTarget.mixin(b.AssetLoader.prototype), b.AssetLoader.prototype.constructor = b.AssetLoader, 
    b.AssetLoader.prototype._getDataType = function(a) {
        var b = "data:", c = a.slice(0, b.length).toLowerCase();
        if (c === b) {
            var d = a.slice(b.length), e = d.indexOf(",");
            if (-1 === e) return null;
            var f = d.slice(0, e).split(";")[0];
            return f && "text/plain" !== f.toLowerCase() ? f.split("/").pop().toLowerCase() : "txt";
        }
        return null;
    }, b.AssetLoader.prototype.load = function() {
        function a(a) {
            b.onAssetLoaded(a.data.content);
        }
        var b = this;
        this.loadCount = this.assetURLs.length;
        for (var c = 0; c < this.assetURLs.length; c++) {
            var d = this.assetURLs[c], e = this._getDataType(d);
            e || (e = d.split("?").shift().split(".").pop().toLowerCase());
            var f = this.loadersByType[e];
            if (!f) throw new Error(e + " is an unsupported file type");
            var g = new f(d, this.crossorigin);
            g.on("loaded", a), g.load();
        }
    }, b.AssetLoader.prototype.onAssetLoaded = function(a) {
        this.loadCount--, this.emit("onProgress", {
            content: this,
            loader: a,
            loaded: this.assetURLs.length - this.loadCount,
            total: this.assetURLs.length
        }), this.onProgress && this.onProgress(a), this.loadCount || (this.emit("onComplete", {
            content: this
        }), this.onComplete && this.onComplete());
    }, b.JsonLoader = function(a, b) {
        this.url = a, this.crossorigin = b, this.baseUrl = a.replace(/[^\/]*$/, ""), this.loaded = !1;
    }, b.JsonLoader.prototype.constructor = b.JsonLoader, b.EventTarget.mixin(b.JsonLoader.prototype), 
    b.JsonLoader.prototype.load = function() {
        window.XDomainRequest && this.crossorigin ? (this.ajaxRequest = new window.XDomainRequest(), 
        this.ajaxRequest.timeout = 3e3, this.ajaxRequest.onerror = this.onError.bind(this), 
        this.ajaxRequest.ontimeout = this.onError.bind(this), this.ajaxRequest.onprogress = function() {}, 
        this.ajaxRequest.onload = this.onJSONLoaded.bind(this)) : (this.ajaxRequest = window.XMLHttpRequest ? new window.XMLHttpRequest() : new window.ActiveXObject("Microsoft.XMLHTTP"), 
        this.ajaxRequest.onreadystatechange = this.onReadyStateChanged.bind(this)), this.ajaxRequest.open("GET", this.url, !0), 
        this.ajaxRequest.send();
    }, b.JsonLoader.prototype.onReadyStateChanged = function() {
        4 !== this.ajaxRequest.readyState || 200 !== this.ajaxRequest.status && -1 !== window.location.href.indexOf("http") || this.onJSONLoaded();
    }, b.JsonLoader.prototype.onJSONLoaded = function() {
        if (!this.ajaxRequest.responseText) return void this.onError();
        if (this.json = JSON.parse(this.ajaxRequest.responseText), this.json.frames && this.json.meta && this.json.meta.image) {
            var a = this.json.meta.image;
            -1 === a.indexOf("data:") && (a = this.baseUrl + a);
            var d = new b.ImageLoader(a, this.crossorigin), e = this.json.frames;
            this.texture = d.texture.baseTexture, d.addEventListener("loaded", this.onLoaded.bind(this));
            for (var f in e) {
                var g = e[f].frame;
                if (g) {
                    var h = new b.Rectangle(g.x, g.y, g.w, g.h), i = h.clone(), j = null;
                    if (e[f].trimmed) {
                        var k = e[f].sourceSize, l = e[f].spriteSourceSize;
                        j = new b.Rectangle(l.x, l.y, k.w, k.h);
                    }
                    b.TextureCache[f] = new b.Texture(this.texture, h, i, j);
                }
            }
            d.load();
        } else if (this.json.bones) if (b.AnimCache[this.url]) this.onLoaded(); else {
            var m = this.url.substr(0, this.url.lastIndexOf(".")) + ".atlas", n = new b.JsonLoader(m, this.crossorigin), o = this;
            n.onJSONLoaded = function() {
                if (!this.ajaxRequest.responseText) return void this.onError();
                var a = new b.SpineTextureLoader(this.url.substring(0, this.url.lastIndexOf("/"))), d = new c.Atlas(this.ajaxRequest.responseText, a), e = new c.AtlasAttachmentLoader(d), f = new c.SkeletonJson(e), g = f.readSkeletonData(o.json);
                b.AnimCache[o.url] = g, o.spine = g, o.spineAtlas = d, o.spineAtlasLoader = n, a.loadingCount > 0 ? a.addEventListener("loadedBaseTexture", function(a) {
                    a.content.content.loadingCount <= 0 && o.onLoaded();
                }) : o.onLoaded();
            }, n.load();
        } else this.onLoaded();
    }, b.JsonLoader.prototype.onLoaded = function() {
        this.loaded = !0, this.dispatchEvent({
            type: "loaded",
            content: this
        });
    }, b.JsonLoader.prototype.onError = function() {
        this.dispatchEvent({
            type: "error",
            content: this
        });
    }, b.AtlasLoader = function(a, b) {
        this.url = a, this.baseUrl = a.replace(/[^\/]*$/, ""), this.crossorigin = b, this.loaded = !1;
    }, b.AtlasLoader.constructor = b.AtlasLoader, b.EventTarget.mixin(b.AtlasLoader.prototype), 
    b.AtlasLoader.prototype.load = function() {
        this.ajaxRequest = new b.AjaxRequest(), this.ajaxRequest.onreadystatechange = this.onAtlasLoaded.bind(this), 
        this.ajaxRequest.open("GET", this.url, !0), this.ajaxRequest.overrideMimeType && this.ajaxRequest.overrideMimeType("application/json"), 
        this.ajaxRequest.send(null);
    }, b.AtlasLoader.prototype.onAtlasLoaded = function() {
        if (4 === this.ajaxRequest.readyState) if (200 === this.ajaxRequest.status || -1 === window.location.href.indexOf("http")) {
            this.atlas = {
                meta: {
                    image: []
                },
                frames: []
            };
            var a = this.ajaxRequest.responseText.split(/\r?\n/), c = -3, d = 0, e = null, f = !1, g = 0, h = 0, i = this.onLoaded.bind(this);
            for (g = 0; g < a.length; g++) if (a[g] = a[g].replace(/^\s+|\s+$/g, ""), "" === a[g] && (f = g + 1), 
            a[g].length > 0) {
                if (f === g) this.atlas.meta.image.push(a[g]), d = this.atlas.meta.image.length - 1, 
                this.atlas.frames.push({}), c = -3; else if (c > 0) if (c % 7 === 1) null != e && (this.atlas.frames[d][e.name] = e), 
                e = {
                    name: a[g],
                    frame: {}
                }; else {
                    var j = a[g].split(" ");
                    if (c % 7 === 3) e.frame.x = Number(j[1].replace(",", "")), e.frame.y = Number(j[2]); else if (c % 7 === 4) e.frame.w = Number(j[1].replace(",", "")), 
                    e.frame.h = Number(j[2]); else if (c % 7 === 5) {
                        var k = {
                            x: 0,
                            y: 0,
                            w: Number(j[1].replace(",", "")),
                            h: Number(j[2])
                        };
                        k.w > e.frame.w || k.h > e.frame.h ? (e.trimmed = !0, e.realSize = k) : e.trimmed = !1;
                    }
                }
                c++;
            }
            if (null != e && (this.atlas.frames[d][e.name] = e), this.atlas.meta.image.length > 0) {
                for (this.images = [], h = 0; h < this.atlas.meta.image.length; h++) {
                    var l = this.baseUrl + this.atlas.meta.image[h], m = this.atlas.frames[h];
                    this.images.push(new b.ImageLoader(l, this.crossorigin));
                    for (g in m) {
                        var n = m[g].frame;
                        n && (b.TextureCache[g] = new b.Texture(this.images[h].texture.baseTexture, {
                            x: n.x,
                            y: n.y,
                            width: n.w,
                            height: n.h
                        }), m[g].trimmed && (b.TextureCache[g].realSize = m[g].realSize, b.TextureCache[g].trim.x = 0, 
                        b.TextureCache[g].trim.y = 0));
                    }
                }
                for (this.currentImageId = 0, h = 0; h < this.images.length; h++) this.images[h].on("loaded", i);
                this.images[this.currentImageId].load();
            } else this.onLoaded();
        } else this.onError();
    }, b.AtlasLoader.prototype.onLoaded = function() {
        this.images.length - 1 > this.currentImageId ? (this.currentImageId++, this.images[this.currentImageId].load()) : (this.loaded = !0, 
        this.emit("loaded", {
            content: this
        }));
    }, b.AtlasLoader.prototype.onError = function() {
        this.emit("error", {
            content: this
        });
    }, b.SpriteSheetLoader = function(a, b) {
        this.url = a, this.crossorigin = b, this.baseUrl = a.replace(/[^\/]*$/, ""), this.texture = null, 
        this.frames = {};
    }, b.SpriteSheetLoader.prototype.constructor = b.SpriteSheetLoader, b.EventTarget.mixin(b.SpriteSheetLoader.prototype), 
    b.SpriteSheetLoader.prototype.load = function() {
        var a = this, c = new b.JsonLoader(this.url, this.crossorigin);
        c.on("loaded", function(b) {
            a.json = b.data.content.json, a.onLoaded();
        }), c.load();
    }, b.SpriteSheetLoader.prototype.onLoaded = function() {
        this.emit("loaded", {
            content: this
        });
    }, b.ImageLoader = function(a, c) {
        this.texture = b.Texture.fromImage(a, c), this.frames = [];
    }, b.ImageLoader.prototype.constructor = b.ImageLoader, b.EventTarget.mixin(b.ImageLoader.prototype), 
    b.ImageLoader.prototype.load = function() {
        this.texture.baseTexture.hasLoaded ? this.onLoaded() : this.texture.baseTexture.on("loaded", this.onLoaded.bind(this));
    }, b.ImageLoader.prototype.onLoaded = function() {
        this.emit("loaded", {
            content: this
        });
    }, b.ImageLoader.prototype.loadFramedSpriteSheet = function(a, c, d) {
        this.frames = [];
        for (var e = Math.floor(this.texture.width / a), f = Math.floor(this.texture.height / c), g = 0, h = 0; f > h; h++) for (var i = 0; e > i; i++, 
        g++) {
            var j = new b.Texture(this.texture.baseTexture, {
                x: i * a,
                y: h * c,
                width: a,
                height: c
            });
            this.frames.push(j), d && (b.TextureCache[d + "-" + g] = j);
        }
        this.load();
    }, b.BitmapFontLoader = function(a, b) {
        this.url = a, this.crossorigin = b, this.baseUrl = a.replace(/[^\/]*$/, ""), this.texture = null;
    }, b.BitmapFontLoader.prototype.constructor = b.BitmapFontLoader, b.EventTarget.mixin(b.BitmapFontLoader.prototype), 
    b.BitmapFontLoader.prototype.load = function() {
        this.ajaxRequest = new b.AjaxRequest(), this.ajaxRequest.onreadystatechange = this.onXMLLoaded.bind(this), 
        this.ajaxRequest.open("GET", this.url, !0), this.ajaxRequest.overrideMimeType && this.ajaxRequest.overrideMimeType("application/xml"), 
        this.ajaxRequest.send(null);
    }, b.BitmapFontLoader.prototype.onXMLLoaded = function() {
        if (4 === this.ajaxRequest.readyState && (200 === this.ajaxRequest.status || -1 === window.location.protocol.indexOf("http"))) {
            var a = this.ajaxRequest.responseXML;
            if (!a || /MSIE 9/i.test(navigator.userAgent) || navigator.isCocoonJS) if ("function" == typeof window.DOMParser) {
                var c = new DOMParser();
                a = c.parseFromString(this.ajaxRequest.responseText, "text/xml");
            } else {
                var d = document.createElement("div");
                d.innerHTML = this.ajaxRequest.responseText, a = d;
            }
            var e = this.baseUrl + a.getElementsByTagName("page")[0].getAttribute("file"), f = new b.ImageLoader(e, this.crossorigin);
            this.texture = f.texture.baseTexture;
            var g = {}, h = a.getElementsByTagName("info")[0], i = a.getElementsByTagName("common")[0];
            g.font = h.getAttribute("face"), g.size = parseInt(h.getAttribute("size"), 10), 
            g.lineHeight = parseInt(i.getAttribute("lineHeight"), 10), g.chars = {};
            for (var j = a.getElementsByTagName("char"), k = 0; k < j.length; k++) {
                var l = parseInt(j[k].getAttribute("id"), 10), m = new b.Rectangle(parseInt(j[k].getAttribute("x"), 10), parseInt(j[k].getAttribute("y"), 10), parseInt(j[k].getAttribute("width"), 10), parseInt(j[k].getAttribute("height"), 10));
                g.chars[l] = {
                    xOffset: parseInt(j[k].getAttribute("xoffset"), 10),
                    yOffset: parseInt(j[k].getAttribute("yoffset"), 10),
                    xAdvance: parseInt(j[k].getAttribute("xadvance"), 10),
                    kerning: {},
                    texture: b.TextureCache[l] = new b.Texture(this.texture, m)
                };
            }
            var n = a.getElementsByTagName("kerning");
            for (k = 0; k < n.length; k++) {
                var o = parseInt(n[k].getAttribute("first"), 10), p = parseInt(n[k].getAttribute("second"), 10), q = parseInt(n[k].getAttribute("amount"), 10);
                g.chars[p].kerning[o] = q;
            }
            b.BitmapText.fonts[g.font] = g, f.addEventListener("loaded", this.onLoaded.bind(this)), 
            f.load();
        }
    }, b.BitmapFontLoader.prototype.onLoaded = function() {
        this.emit("loaded", {
            content: this
        });
    }, b.SpineLoader = function(a, b) {
        this.url = a, this.crossorigin = b, this.loaded = !1;
    }, b.SpineLoader.prototype.constructor = b.SpineLoader, b.EventTarget.mixin(b.SpineLoader.prototype), 
    b.SpineLoader.prototype.load = function() {
        var a = this, c = new b.JsonLoader(this.url, this.crossorigin);
        c.on("loaded", function(b) {
            a.json = b.data.content.json, a.onLoaded();
        }), c.load();
    }, b.SpineLoader.prototype.onLoaded = function() {
        this.loaded = !0, this.emit("loaded", {
            content: this
        });
    }, b.AbstractFilter = function(a, b) {
        this.passes = [ this ], this.shaders = [], this.dirty = !0, this.padding = 0, this.uniforms = b || {}, 
        this.fragmentSrc = a || [];
    }, b.AbstractFilter.prototype.constructor = b.AbstractFilter, b.AbstractFilter.prototype.syncUniforms = function() {
        for (var a = 0, b = this.shaders.length; b > a; a++) this.shaders[a].dirty = !0;
    }, b.AlphaMaskFilter = function(a) {
        b.AbstractFilter.call(this), this.passes = [ this ], a.baseTexture._powerOf2 = !0, 
        this.uniforms = {
            mask: {
                type: "sampler2D",
                value: a
            },
            mapDimensions: {
                type: "2f",
                value: {
                    x: 1,
                    y: 5112
                }
            },
            dimensions: {
                type: "4fv",
                value: [ 0, 0, 0, 0 ]
            }
        }, a.baseTexture.hasLoaded ? (this.uniforms.mask.value.x = a.width, this.uniforms.mask.value.y = a.height) : (this.boundLoadedFunction = this.onTextureLoaded.bind(this), 
        a.baseTexture.on("loaded", this.boundLoadedFunction)), this.fragmentSrc = [ "precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform sampler2D mask;", "uniform sampler2D uSampler;", "uniform vec2 offset;", "uniform vec4 dimensions;", "uniform vec2 mapDimensions;", "void main(void) {", "   vec2 mapCords = vTextureCoord.xy;", "   mapCords += (dimensions.zw + offset)/ dimensions.xy ;", "   mapCords.y *= -1.0;", "   mapCords.y += 1.0;", "   mapCords *= dimensions.xy / mapDimensions;", "   vec4 original =  texture2D(uSampler, vTextureCoord);", "   float maskAlpha =  texture2D(mask, mapCords).r;", "   original *= maskAlpha;", "   gl_FragColor =  original;", "}" ];
    }, b.AlphaMaskFilter.prototype = Object.create(b.AbstractFilter.prototype), b.AlphaMaskFilter.prototype.constructor = b.AlphaMaskFilter, 
    b.AlphaMaskFilter.prototype.onTextureLoaded = function() {
        this.uniforms.mapDimensions.value.x = this.uniforms.mask.value.width, this.uniforms.mapDimensions.value.y = this.uniforms.mask.value.height, 
        this.uniforms.mask.value.baseTexture.off("loaded", this.boundLoadedFunction);
    }, Object.defineProperty(b.AlphaMaskFilter.prototype, "map", {
        get: function() {
            return this.uniforms.mask.value;
        },
        set: function(a) {
            this.uniforms.mask.value = a;
        }
    }), b.ColorMatrixFilter = function() {
        b.AbstractFilter.call(this), this.passes = [ this ], this.uniforms = {
            matrix: {
                type: "mat4",
                value: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ]
            }
        }, this.fragmentSrc = [ "precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform float invert;", "uniform mat4 matrix;", "uniform sampler2D uSampler;", "void main(void) {", "   gl_FragColor = texture2D(uSampler, vTextureCoord) * matrix;", "}" ];
    }, b.ColorMatrixFilter.prototype = Object.create(b.AbstractFilter.prototype), b.ColorMatrixFilter.prototype.constructor = b.ColorMatrixFilter, 
    Object.defineProperty(b.ColorMatrixFilter.prototype, "matrix", {
        get: function() {
            return this.uniforms.matrix.value;
        },
        set: function(a) {
            this.uniforms.matrix.value = a;
        }
    }), b.GrayFilter = function() {
        b.AbstractFilter.call(this), this.passes = [ this ], this.uniforms = {
            gray: {
                type: "1f",
                value: 1
            }
        }, this.fragmentSrc = [ "precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform sampler2D uSampler;", "uniform float gray;", "void main(void) {", "   gl_FragColor = texture2D(uSampler, vTextureCoord);", "   gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.2126*gl_FragColor.r + 0.7152*gl_FragColor.g + 0.0722*gl_FragColor.b), gray);", "}" ];
    }, b.GrayFilter.prototype = Object.create(b.AbstractFilter.prototype), b.GrayFilter.prototype.constructor = b.GrayFilter, 
    Object.defineProperty(b.GrayFilter.prototype, "gray", {
        get: function() {
            return this.uniforms.gray.value;
        },
        set: function(a) {
            this.uniforms.gray.value = a;
        }
    }), b.DisplacementFilter = function(a) {
        b.AbstractFilter.call(this), this.passes = [ this ], a.baseTexture._powerOf2 = !0, 
        this.uniforms = {
            displacementMap: {
                type: "sampler2D",
                value: a
            },
            scale: {
                type: "2f",
                value: {
                    x: 30,
                    y: 30
                }
            },
            offset: {
                type: "2f",
                value: {
                    x: 0,
                    y: 0
                }
            },
            mapDimensions: {
                type: "2f",
                value: {
                    x: 1,
                    y: 5112
                }
            },
            dimensions: {
                type: "4fv",
                value: [ 0, 0, 0, 0 ]
            }
        }, a.baseTexture.hasLoaded ? (this.uniforms.mapDimensions.value.x = a.width, this.uniforms.mapDimensions.value.y = a.height) : (this.boundLoadedFunction = this.onTextureLoaded.bind(this), 
        a.baseTexture.on("loaded", this.boundLoadedFunction)), this.fragmentSrc = [ "precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform sampler2D displacementMap;", "uniform sampler2D uSampler;", "uniform vec2 scale;", "uniform vec2 offset;", "uniform vec4 dimensions;", "uniform vec2 mapDimensions;", "void main(void) {", "   vec2 mapCords = vTextureCoord.xy;", "   mapCords += (dimensions.zw + offset)/ dimensions.xy ;", "   mapCords.y *= -1.0;", "   mapCords.y += 1.0;", "   vec2 matSample = texture2D(displacementMap, mapCords).xy;", "   matSample -= 0.5;", "   matSample *= scale;", "   matSample /= mapDimensions;", "   gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.x + matSample.x, vTextureCoord.y + matSample.y));", "   gl_FragColor.rgb = mix( gl_FragColor.rgb, gl_FragColor.rgb, 1.0);", "   vec2 cord = vTextureCoord;", "}" ];
    }, b.DisplacementFilter.prototype = Object.create(b.AbstractFilter.prototype), b.DisplacementFilter.prototype.constructor = b.DisplacementFilter, 
    b.DisplacementFilter.prototype.onTextureLoaded = function() {
        this.uniforms.mapDimensions.value.x = this.uniforms.displacementMap.value.width, 
        this.uniforms.mapDimensions.value.y = this.uniforms.displacementMap.value.height, 
        this.uniforms.displacementMap.value.baseTexture.off("loaded", this.boundLoadedFunction);
    }, Object.defineProperty(b.DisplacementFilter.prototype, "map", {
        get: function() {
            return this.uniforms.displacementMap.value;
        },
        set: function(a) {
            this.uniforms.displacementMap.value = a;
        }
    }), Object.defineProperty(b.DisplacementFilter.prototype, "scale", {
        get: function() {
            return this.uniforms.scale.value;
        },
        set: function(a) {
            this.uniforms.scale.value = a;
        }
    }), Object.defineProperty(b.DisplacementFilter.prototype, "offset", {
        get: function() {
            return this.uniforms.offset.value;
        },
        set: function(a) {
            this.uniforms.offset.value = a;
        }
    }), b.PixelateFilter = function() {
        b.AbstractFilter.call(this), this.passes = [ this ], this.uniforms = {
            invert: {
                type: "1f",
                value: 0
            },
            dimensions: {
                type: "4fv",
                value: new b.Float32Array([ 1e4, 100, 10, 10 ])
            },
            pixelSize: {
                type: "2f",
                value: {
                    x: 10,
                    y: 10
                }
            }
        }, this.fragmentSrc = [ "precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform vec2 testDim;", "uniform vec4 dimensions;", "uniform vec2 pixelSize;", "uniform sampler2D uSampler;", "void main(void) {", "   vec2 coord = vTextureCoord;", "   vec2 size = dimensions.xy/pixelSize;", "   vec2 color = floor( ( vTextureCoord * size ) ) / size + pixelSize/dimensions.xy * 0.5;", "   gl_FragColor = texture2D(uSampler, color);", "}" ];
    }, b.PixelateFilter.prototype = Object.create(b.AbstractFilter.prototype), b.PixelateFilter.prototype.constructor = b.PixelateFilter, 
    Object.defineProperty(b.PixelateFilter.prototype, "size", {
        get: function() {
            return this.uniforms.pixelSize.value;
        },
        set: function(a) {
            this.dirty = !0, this.uniforms.pixelSize.value = a;
        }
    }), b.BlurXFilter = function() {
        b.AbstractFilter.call(this), this.passes = [ this ], this.uniforms = {
            blur: {
                type: "1f",
                value: 1 / 512
            }
        }, this.fragmentSrc = [ "precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform float blur;", "uniform sampler2D uSampler;", "void main(void) {", "   vec4 sum = vec4(0.0);", "   sum += texture2D(uSampler, vec2(vTextureCoord.x - 4.0*blur, vTextureCoord.y)) * 0.05;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x - 3.0*blur, vTextureCoord.y)) * 0.09;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x - 2.0*blur, vTextureCoord.y)) * 0.12;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x - blur, vTextureCoord.y)) * 0.15;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y)) * 0.16;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x + blur, vTextureCoord.y)) * 0.15;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x + 2.0*blur, vTextureCoord.y)) * 0.12;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x + 3.0*blur, vTextureCoord.y)) * 0.09;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x + 4.0*blur, vTextureCoord.y)) * 0.05;", "   gl_FragColor = sum;", "}" ];
    }, b.BlurXFilter.prototype = Object.create(b.AbstractFilter.prototype), b.BlurXFilter.prototype.constructor = b.BlurXFilter, 
    Object.defineProperty(b.BlurXFilter.prototype, "blur", {
        get: function() {
            return this.uniforms.blur.value / (1 / 7e3);
        },
        set: function(a) {
            this.dirty = !0, this.uniforms.blur.value = 1 / 7e3 * a;
        }
    }), b.BlurYFilter = function() {
        b.AbstractFilter.call(this), this.passes = [ this ], this.uniforms = {
            blur: {
                type: "1f",
                value: 1 / 512
            }
        }, this.fragmentSrc = [ "precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform float blur;", "uniform sampler2D uSampler;", "void main(void) {", "   vec4 sum = vec4(0.0);", "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - 4.0*blur)) * 0.05;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - 3.0*blur)) * 0.09;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - 2.0*blur)) * 0.12;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - blur)) * 0.15;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y)) * 0.16;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + blur)) * 0.15;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + 2.0*blur)) * 0.12;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + 3.0*blur)) * 0.09;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + 4.0*blur)) * 0.05;", "   gl_FragColor = sum;", "}" ];
    }, b.BlurYFilter.prototype = Object.create(b.AbstractFilter.prototype), b.BlurYFilter.prototype.constructor = b.BlurYFilter, 
    Object.defineProperty(b.BlurYFilter.prototype, "blur", {
        get: function() {
            return this.uniforms.blur.value / (1 / 7e3);
        },
        set: function(a) {
            this.uniforms.blur.value = 1 / 7e3 * a;
        }
    }), b.BlurFilter = function() {
        this.blurXFilter = new b.BlurXFilter(), this.blurYFilter = new b.BlurYFilter(), 
        this.passes = [ this.blurXFilter, this.blurYFilter ];
    }, b.BlurFilter.prototype = Object.create(b.AbstractFilter.prototype), b.BlurFilter.prototype.constructor = b.BlurFilter, 
    Object.defineProperty(b.BlurFilter.prototype, "blur", {
        get: function() {
            return this.blurXFilter.blur;
        },
        set: function(a) {
            this.blurXFilter.blur = this.blurYFilter.blur = a;
        }
    }), Object.defineProperty(b.BlurFilter.prototype, "blurX", {
        get: function() {
            return this.blurXFilter.blur;
        },
        set: function(a) {
            this.blurXFilter.blur = a;
        }
    }), Object.defineProperty(b.BlurFilter.prototype, "blurY", {
        get: function() {
            return this.blurYFilter.blur;
        },
        set: function(a) {
            this.blurYFilter.blur = a;
        }
    }), b.InvertFilter = function() {
        b.AbstractFilter.call(this), this.passes = [ this ], this.uniforms = {
            invert: {
                type: "1f",
                value: 1
            }
        }, this.fragmentSrc = [ "precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform float invert;", "uniform sampler2D uSampler;", "void main(void) {", "   gl_FragColor = texture2D(uSampler, vTextureCoord);", "   gl_FragColor.rgb = mix( (vec3(1)-gl_FragColor.rgb) * gl_FragColor.a, gl_FragColor.rgb, 1.0 - invert);", "}" ];
    }, b.InvertFilter.prototype = Object.create(b.AbstractFilter.prototype), b.InvertFilter.prototype.constructor = b.InvertFilter, 
    Object.defineProperty(b.InvertFilter.prototype, "invert", {
        get: function() {
            return this.uniforms.invert.value;
        },
        set: function(a) {
            this.uniforms.invert.value = a;
        }
    }), b.SepiaFilter = function() {
        b.AbstractFilter.call(this), this.passes = [ this ], this.uniforms = {
            sepia: {
                type: "1f",
                value: 1
            }
        }, this.fragmentSrc = [ "precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform float sepia;", "uniform sampler2D uSampler;", "const mat3 sepiaMatrix = mat3(0.3588, 0.7044, 0.1368, 0.2990, 0.5870, 0.1140, 0.2392, 0.4696, 0.0912);", "void main(void) {", "   gl_FragColor = texture2D(uSampler, vTextureCoord);", "   gl_FragColor.rgb = mix( gl_FragColor.rgb, gl_FragColor.rgb * sepiaMatrix, sepia);", "}" ];
    }, b.SepiaFilter.prototype = Object.create(b.AbstractFilter.prototype), b.SepiaFilter.prototype.constructor = b.SepiaFilter, 
    Object.defineProperty(b.SepiaFilter.prototype, "sepia", {
        get: function() {
            return this.uniforms.sepia.value;
        },
        set: function(a) {
            this.uniforms.sepia.value = a;
        }
    }), b.TwistFilter = function() {
        b.AbstractFilter.call(this), this.passes = [ this ], this.uniforms = {
            radius: {
                type: "1f",
                value: .5
            },
            angle: {
                type: "1f",
                value: 5
            },
            offset: {
                type: "2f",
                value: {
                    x: .5,
                    y: .5
                }
            }
        }, this.fragmentSrc = [ "precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform vec4 dimensions;", "uniform sampler2D uSampler;", "uniform float radius;", "uniform float angle;", "uniform vec2 offset;", "void main(void) {", "   vec2 coord = vTextureCoord - offset;", "   float distance = length(coord);", "   if (distance < radius) {", "       float ratio = (radius - distance) / radius;", "       float angleMod = ratio * ratio * angle;", "       float s = sin(angleMod);", "       float c = cos(angleMod);", "       coord = vec2(coord.x * c - coord.y * s, coord.x * s + coord.y * c);", "   }", "   gl_FragColor = texture2D(uSampler, coord+offset);", "}" ];
    }, b.TwistFilter.prototype = Object.create(b.AbstractFilter.prototype), b.TwistFilter.prototype.constructor = b.TwistFilter, 
    Object.defineProperty(b.TwistFilter.prototype, "offset", {
        get: function() {
            return this.uniforms.offset.value;
        },
        set: function(a) {
            this.dirty = !0, this.uniforms.offset.value = a;
        }
    }), Object.defineProperty(b.TwistFilter.prototype, "radius", {
        get: function() {
            return this.uniforms.radius.value;
        },
        set: function(a) {
            this.dirty = !0, this.uniforms.radius.value = a;
        }
    }), Object.defineProperty(b.TwistFilter.prototype, "angle", {
        get: function() {
            return this.uniforms.angle.value;
        },
        set: function(a) {
            this.dirty = !0, this.uniforms.angle.value = a;
        }
    }), b.ColorStepFilter = function() {
        b.AbstractFilter.call(this), this.passes = [ this ], this.uniforms = {
            step: {
                type: "1f",
                value: 5
            }
        }, this.fragmentSrc = [ "precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform sampler2D uSampler;", "uniform float step;", "void main(void) {", "   vec4 color = texture2D(uSampler, vTextureCoord);", "   color = floor(color * step) / step;", "   gl_FragColor = color;", "}" ];
    }, b.ColorStepFilter.prototype = Object.create(b.AbstractFilter.prototype), b.ColorStepFilter.prototype.constructor = b.ColorStepFilter, 
    Object.defineProperty(b.ColorStepFilter.prototype, "step", {
        get: function() {
            return this.uniforms.step.value;
        },
        set: function(a) {
            this.uniforms.step.value = a;
        }
    }), b.DotScreenFilter = function() {
        b.AbstractFilter.call(this), this.passes = [ this ], this.uniforms = {
            scale: {
                type: "1f",
                value: 1
            },
            angle: {
                type: "1f",
                value: 5
            },
            dimensions: {
                type: "4fv",
                value: [ 0, 0, 0, 0 ]
            }
        }, this.fragmentSrc = [ "precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform vec4 dimensions;", "uniform sampler2D uSampler;", "uniform float angle;", "uniform float scale;", "float pattern() {", "   float s = sin(angle), c = cos(angle);", "   vec2 tex = vTextureCoord * dimensions.xy;", "   vec2 point = vec2(", "       c * tex.x - s * tex.y,", "       s * tex.x + c * tex.y", "   ) * scale;", "   return (sin(point.x) * sin(point.y)) * 4.0;", "}", "void main() {", "   vec4 color = texture2D(uSampler, vTextureCoord);", "   float average = (color.r + color.g + color.b) / 3.0;", "   gl_FragColor = vec4(vec3(average * 10.0 - 5.0 + pattern()), color.a);", "}" ];
    }, b.DotScreenFilter.prototype = Object.create(b.AbstractFilter.prototype), b.DotScreenFilter.prototype.constructor = b.DotScreenFilter, 
    Object.defineProperty(b.DotScreenFilter.prototype, "scale", {
        get: function() {
            return this.uniforms.scale.value;
        },
        set: function(a) {
            this.dirty = !0, this.uniforms.scale.value = a;
        }
    }), Object.defineProperty(b.DotScreenFilter.prototype, "angle", {
        get: function() {
            return this.uniforms.angle.value;
        },
        set: function(a) {
            this.dirty = !0, this.uniforms.angle.value = a;
        }
    }), b.CrossHatchFilter = function() {
        b.AbstractFilter.call(this), this.passes = [ this ], this.uniforms = {
            blur: {
                type: "1f",
                value: 1 / 512
            }
        }, this.fragmentSrc = [ "precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform float blur;", "uniform sampler2D uSampler;", "void main(void) {", "    float lum = length(texture2D(uSampler, vTextureCoord.xy).rgb);", "    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);", "    if (lum < 1.00) {", "        if (mod(gl_FragCoord.x + gl_FragCoord.y, 10.0) == 0.0) {", "            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);", "        }", "    }", "    if (lum < 0.75) {", "        if (mod(gl_FragCoord.x - gl_FragCoord.y, 10.0) == 0.0) {", "            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);", "        }", "    }", "    if (lum < 0.50) {", "        if (mod(gl_FragCoord.x + gl_FragCoord.y - 5.0, 10.0) == 0.0) {", "            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);", "        }", "    }", "    if (lum < 0.3) {", "        if (mod(gl_FragCoord.x - gl_FragCoord.y - 5.0, 10.0) == 0.0) {", "            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);", "        }", "    }", "}" ];
    }, b.CrossHatchFilter.prototype = Object.create(b.AbstractFilter.prototype), b.CrossHatchFilter.prototype.constructor = b.CrossHatchFilter, 
    Object.defineProperty(b.CrossHatchFilter.prototype, "blur", {
        get: function() {
            return this.uniforms.blur.value / (1 / 7e3);
        },
        set: function(a) {
            this.uniforms.blur.value = 1 / 7e3 * a;
        }
    }), b.RGBSplitFilter = function() {
        b.AbstractFilter.call(this), this.passes = [ this ], this.uniforms = {
            red: {
                type: "2f",
                value: {
                    x: 20,
                    y: 20
                }
            },
            green: {
                type: "2f",
                value: {
                    x: -20,
                    y: 20
                }
            },
            blue: {
                type: "2f",
                value: {
                    x: 20,
                    y: -20
                }
            },
            dimensions: {
                type: "4fv",
                value: [ 0, 0, 0, 0 ]
            }
        }, this.fragmentSrc = [ "precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform vec2 red;", "uniform vec2 green;", "uniform vec2 blue;", "uniform vec4 dimensions;", "uniform sampler2D uSampler;", "void main(void) {", "   gl_FragColor.r = texture2D(uSampler, vTextureCoord + red/dimensions.xy).r;", "   gl_FragColor.g = texture2D(uSampler, vTextureCoord + green/dimensions.xy).g;", "   gl_FragColor.b = texture2D(uSampler, vTextureCoord + blue/dimensions.xy).b;", "   gl_FragColor.a = texture2D(uSampler, vTextureCoord).a;", "}" ];
    }, b.RGBSplitFilter.prototype = Object.create(b.AbstractFilter.prototype), b.RGBSplitFilter.prototype.constructor = b.RGBSplitFilter, 
    Object.defineProperty(b.RGBSplitFilter.prototype, "red", {
        get: function() {
            return this.uniforms.red.value;
        },
        set: function(a) {
            this.uniforms.red.value = a;
        }
    }), Object.defineProperty(b.RGBSplitFilter.prototype, "green", {
        get: function() {
            return this.uniforms.green.value;
        },
        set: function(a) {
            this.uniforms.green.value = a;
        }
    }), Object.defineProperty(b.RGBSplitFilter.prototype, "blue", {
        get: function() {
            return this.uniforms.blue.value;
        },
        set: function(a) {
            this.uniforms.blue.value = a;
        }
    }), "undefined" != typeof exports ? ("undefined" != typeof module && module.exports && (exports = module.exports = b), 
    exports.PIXI = b) : "undefined" != typeof define && define.amd ? define(b) : a.PIXI = b;
}.call(this), window.Modernizr = function(a, b, c) {
    function D(a) {
        j.cssText = a;
    }
    function E(a, b) {
        return D(n.join(a + ";") + (b || ""));
    }
    function F(a, b) {
        return typeof a === b;
    }
    function G(a, b) {
        return !!~("" + a).indexOf(b);
    }
    function H(a, b) {
        for (var d in a) {
            var e = a[d];
            if (!G(e, "-") && j[e] !== c) return "pfx" == b ? e : !0;
        }
        return !1;
    }
    function I(a, b, d) {
        for (var e in a) {
            var f = b[a[e]];
            if (f !== c) return d === !1 ? a[e] : F(f, "function") ? f.bind(d || b) : f;
        }
        return !1;
    }
    function J(a, b, c) {
        var d = a.charAt(0).toUpperCase() + a.slice(1), e = (a + " " + p.join(d + " ") + d).split(" ");
        return F(b, "string") || F(b, "undefined") ? H(e, b) : (e = (a + " " + q.join(d + " ") + d).split(" "), 
        I(e, b, c));
    }
    function K() {
        e.input = function(c) {
            for (var d = 0, e = c.length; e > d; d++) u[c[d]] = c[d] in k;
            return u.list && (u.list = !!b.createElement("datalist") && !!a.HTMLDataListElement), 
            u;
        }("autocomplete autofocus list placeholder max min multiple pattern required step".split(" ")), 
        e.inputtypes = function(a) {
            for (var e, f, h, d = 0, i = a.length; i > d; d++) k.setAttribute("type", f = a[d]), 
            e = "text" !== k.type, e && (k.value = l, k.style.cssText = "position:absolute;visibility:hidden;", 
            /^range$/.test(f) && k.style.WebkitAppearance !== c ? (g.appendChild(k), h = b.defaultView, 
            e = h.getComputedStyle && "textfield" !== h.getComputedStyle(k, null).WebkitAppearance && 0 !== k.offsetHeight, 
            g.removeChild(k)) : /^(search|tel)$/.test(f) || (e = /^(url|email)$/.test(f) ? k.checkValidity && k.checkValidity() === !1 : k.value != l)), 
            t[a[d]] = !!e;
            return t;
        }("search tel url email datetime date month week time datetime-local number range color".split(" "));
    }
    var x, C, d = "2.7.1", e = {}, f = !0, g = b.documentElement, h = "modernizr", i = b.createElement(h), j = i.style, k = b.createElement("input"), l = ":)", m = {}.toString, n = " -webkit- -moz- -o- -ms- ".split(" "), o = "Webkit Moz O ms", p = o.split(" "), q = o.toLowerCase().split(" "), r = {
        svg: "http://www.w3.org/2000/svg"
    }, s = {}, t = {}, u = {}, v = [], w = v.slice, y = function(a, c, d, e) {
        var f, i, j, k, l = b.createElement("div"), m = b.body, n = m || b.createElement("body");
        if (parseInt(d, 10)) for (;d--; ) j = b.createElement("div"), j.id = e ? e[d] : h + (d + 1), 
        l.appendChild(j);
        return f = [ "&#173;", '<style id="s', h, '">', a, "</style>" ].join(""), l.id = h, 
        (m ? l : n).innerHTML += f, n.appendChild(l), m || (n.style.background = "", n.style.overflow = "hidden", 
        k = g.style.overflow, g.style.overflow = "hidden", g.appendChild(n)), i = c(l, a), 
        m ? l.parentNode.removeChild(l) : (n.parentNode.removeChild(n), g.style.overflow = k), 
        !!i;
    }, z = function(b) {
        var c = a.matchMedia || a.msMatchMedia;
        if (c) return c(b).matches;
        var d;
        return y("@media " + b + " { #" + h + " { position: absolute; } }", function(b) {
            d = "absolute" == (a.getComputedStyle ? getComputedStyle(b, null) : b.currentStyle).position;
        }), d;
    }, A = function() {
        function d(d, e) {
            e = e || b.createElement(a[d] || "div"), d = "on" + d;
            var f = d in e;
            return f || (e.setAttribute || (e = b.createElement("div")), e.setAttribute && e.removeAttribute && (e.setAttribute(d, ""), 
            f = F(e[d], "function"), F(e[d], "undefined") || (e[d] = c), e.removeAttribute(d))), 
            e = null, f;
        }
        var a = {
            select: "input",
            change: "input",
            submit: "form",
            reset: "form",
            error: "img",
            load: "img",
            abort: "img"
        };
        return d;
    }(), B = {}.hasOwnProperty;
    C = F(B, "undefined") || F(B.call, "undefined") ? function(a, b) {
        return b in a && F(a.constructor.prototype[b], "undefined");
    } : function(a, b) {
        return B.call(a, b);
    }, Function.prototype.bind || (Function.prototype.bind = function(b) {
        var c = this;
        if ("function" != typeof c) throw new TypeError();
        var d = w.call(arguments, 1), e = function() {
            if (this instanceof e) {
                var a = function() {};
                a.prototype = c.prototype;
                var f = new a(), g = c.apply(f, d.concat(w.call(arguments)));
                return Object(g) === g ? g : f;
            }
            return c.apply(b, d.concat(w.call(arguments)));
        };
        return e;
    }), s.flexbox = function() {
        return J("flexWrap");
    }, s.canvas = function() {
        var a = b.createElement("canvas");
        return !!a.getContext && !!a.getContext("2d");
    }, s.canvastext = function() {
        return !!e.canvas && !!F(b.createElement("canvas").getContext("2d").fillText, "function");
    }, s.webgl = function() {
        return !!a.WebGLRenderingContext;
    }, s.touch = function() {
        var c;
        return "ontouchstart" in a || a.DocumentTouch && b instanceof DocumentTouch ? c = !0 : y([ "@media (", n.join("touch-enabled),("), h, ")", "{#modernizr{top:9px;position:absolute}}" ].join(""), function(a) {
            c = 9 === a.offsetTop;
        }), c;
    }, s.geolocation = function() {
        return "geolocation" in navigator;
    }, s.postmessage = function() {
        return !!a.postMessage;
    }, s.websqldatabase = function() {
        return !!a.openDatabase;
    }, s.indexedDB = function() {
        return !!J("indexedDB", a);
    }, s.hashchange = function() {
        return A("hashchange", a) && (b.documentMode === c || b.documentMode > 7);
    }, s.history = function() {
        return !!a.history && !!history.pushState;
    }, s.draganddrop = function() {
        var a = b.createElement("div");
        return "draggable" in a || "ondragstart" in a && "ondrop" in a;
    }, s.websockets = function() {
        return "WebSocket" in a || "MozWebSocket" in a;
    }, s.rgba = function() {
        return D("background-color:rgba(150,255,150,.5)"), G(j.backgroundColor, "rgba");
    }, s.hsla = function() {
        return D("background-color:hsla(120,40%,100%,.5)"), G(j.backgroundColor, "rgba") || G(j.backgroundColor, "hsla");
    }, s.multiplebgs = function() {
        return D("background:url(https://),url(https://),red url(https://)"), /(url\s*\(.*?){3}/.test(j.background);
    }, s.backgroundsize = function() {
        return J("backgroundSize");
    }, s.borderimage = function() {
        return J("borderImage");
    }, s.borderradius = function() {
        return J("borderRadius");
    }, s.boxshadow = function() {
        return J("boxShadow");
    }, s.textshadow = function() {
        return "" === b.createElement("div").style.textShadow;
    }, s.opacity = function() {
        return E("opacity:.55"), /^0.55$/.test(j.opacity);
    }, s.cssanimations = function() {
        return J("animationName");
    }, s.csscolumns = function() {
        return J("columnCount");
    }, s.cssgradients = function() {
        var a = "background-image:", b = "gradient(linear,left top,right bottom,from(#9f9),to(white));", c = "linear-gradient(left top,#9f9, white);";
        return D((a + "-webkit- ".split(" ").join(b + a) + n.join(c + a)).slice(0, -a.length)), 
        G(j.backgroundImage, "gradient");
    }, s.cssreflections = function() {
        return J("boxReflect");
    }, s.csstransforms = function() {
        return !!J("transform");
    }, s.csstransforms3d = function() {
        var a = !!J("perspective");
        return a && "webkitPerspective" in g.style && y("@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}", function(b) {
            a = 9 === b.offsetLeft && 3 === b.offsetHeight;
        }), a;
    }, s.csstransitions = function() {
        return J("transition");
    }, s.fontface = function() {
        var a;
        return y('@font-face {font-family:"font";src:url("https://")}', function(c, d) {
            var e = b.getElementById("smodernizr"), f = e.sheet || e.styleSheet, g = f ? f.cssRules && f.cssRules[0] ? f.cssRules[0].cssText : f.cssText || "" : "";
            a = /src/i.test(g) && 0 === g.indexOf(d.split(" ")[0]);
        }), a;
    }, s.generatedcontent = function() {
        var a;
        return y([ "#", h, "{font:0/0 a}#", h, ':after{content:"', l, '";visibility:hidden;font:3px/1 a}' ].join(""), function(b) {
            a = b.offsetHeight >= 3;
        }), a;
    }, s.video = function() {
        var a = b.createElement("video"), c = !1;
        try {
            (c = !!a.canPlayType) && (c = new Boolean(c), c.ogg = a.canPlayType('video/ogg; codecs="theora"').replace(/^no$/, ""), 
            c.h264 = a.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/, ""), c.webm = a.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/, ""));
        } catch (d) {}
        return c;
    }, s.audio = function() {
        var a = b.createElement("audio"), c = !1;
        try {
            (c = !!a.canPlayType) && (c = new Boolean(c), c.ogg = a.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ""), 
            c.mp3 = a.canPlayType("audio/mpeg;").replace(/^no$/, ""), c.wav = a.canPlayType('audio/wav; codecs="1"').replace(/^no$/, ""), 
            c.m4a = (a.canPlayType("audio/x-m4a;") || a.canPlayType("audio/aac;")).replace(/^no$/, ""));
        } catch (d) {}
        return c;
    }, s.localstorage = function() {
        try {
            return localStorage.setItem(h, h), localStorage.removeItem(h), !0;
        } catch (a) {
            return !1;
        }
    }, s.sessionstorage = function() {
        try {
            return sessionStorage.setItem(h, h), sessionStorage.removeItem(h), !0;
        } catch (a) {
            return !1;
        }
    }, s.webworkers = function() {
        return !!a.Worker;
    }, s.applicationcache = function() {
        return !!a.applicationCache;
    }, s.svg = function() {
        return !!b.createElementNS && !!b.createElementNS(r.svg, "svg").createSVGRect;
    }, s.inlinesvg = function() {
        var a = b.createElement("div");
        return a.innerHTML = "<svg/>", (a.firstChild && a.firstChild.namespaceURI) == r.svg;
    }, s.smil = function() {
        return !!b.createElementNS && /SVGAnimate/.test(m.call(b.createElementNS(r.svg, "animate")));
    }, s.svgclippaths = function() {
        return !!b.createElementNS && /SVGClipPath/.test(m.call(b.createElementNS(r.svg, "clipPath")));
    };
    for (var L in s) C(s, L) && (x = L.toLowerCase(), e[x] = s[L](), v.push((e[x] ? "" : "no-") + x));
    return e.input || K(), e.addTest = function(a, b) {
        if ("object" == typeof a) for (var d in a) C(a, d) && e.addTest(d, a[d]); else {
            if (a = a.toLowerCase(), e[a] !== c) return e;
            b = "function" == typeof b ? b() : b, "undefined" != typeof f && f && (g.className += " " + (b ? "" : "no-") + a), 
            e[a] = b;
        }
        return e;
    }, D(""), i = k = null, function(a, b) {
        function l(a, b) {
            var c = a.createElement("p"), d = a.getElementsByTagName("head")[0] || a.documentElement;
            return c.innerHTML = "x<style>" + b + "</style>", d.insertBefore(c.lastChild, d.firstChild);
        }
        function m() {
            var a = s.elements;
            return "string" == typeof a ? a.split(" ") : a;
        }
        function n(a) {
            var b = j[a[h]];
            return b || (b = {}, i++, a[h] = i, j[i] = b), b;
        }
        function o(a, c, d) {
            if (c || (c = b), k) return c.createElement(a);
            d || (d = n(c));
            var g;
            return g = d.cache[a] ? d.cache[a].cloneNode() : f.test(a) ? (d.cache[a] = d.createElem(a)).cloneNode() : d.createElem(a), 
            !g.canHaveChildren || e.test(a) || g.tagUrn ? g : d.frag.appendChild(g);
        }
        function p(a, c) {
            if (a || (a = b), k) return a.createDocumentFragment();
            c = c || n(a);
            for (var d = c.frag.cloneNode(), e = 0, f = m(), g = f.length; g > e; e++) d.createElement(f[e]);
            return d;
        }
        function q(a, b) {
            b.cache || (b.cache = {}, b.createElem = a.createElement, b.createFrag = a.createDocumentFragment, 
            b.frag = b.createFrag()), a.createElement = function(c) {
                return s.shivMethods ? o(c, a, b) : b.createElem(c);
            }, a.createDocumentFragment = Function("h,f", "return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&(" + m().join().replace(/[\w\-]+/g, function(a) {
                return b.createElem(a), b.frag.createElement(a), 'c("' + a + '")';
            }) + ");return n}")(s, b.frag);
        }
        function r(a) {
            a || (a = b);
            var c = n(a);
            return s.shivCSS && !g && !c.hasCSS && (c.hasCSS = !!l(a, "article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}mark{background:#FF0;color:#000}template{display:none}")), 
            k || q(a, c), a;
        }
        var g, k, c = "3.7.0", d = a.html5 || {}, e = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i, f = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i, h = "_html5shiv", i = 0, j = {};
        !function() {
            try {
                var a = b.createElement("a");
                a.innerHTML = "<xyz></xyz>", g = "hidden" in a, k = 1 == a.childNodes.length || function() {
                    b.createElement("a");
                    var a = b.createDocumentFragment();
                    return "undefined" == typeof a.cloneNode || "undefined" == typeof a.createDocumentFragment || "undefined" == typeof a.createElement;
                }();
            } catch (c) {
                g = !0, k = !0;
            }
        }();
        var s = {
            elements: d.elements || "abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output progress section summary template time video",
            version: c,
            shivCSS: d.shivCSS !== !1,
            supportsUnknownElements: k,
            shivMethods: d.shivMethods !== !1,
            type: "default",
            shivDocument: r,
            createElement: o,
            createDocumentFragment: p
        };
        a.html5 = s, r(b);
    }(this, b), e._version = d, e._prefixes = n, e._domPrefixes = q, e._cssomPrefixes = p, 
    e.mq = z, e.hasEvent = A, e.testProp = function(a) {
        return H([ a ]);
    }, e.testAllProps = J, e.testStyles = y, e.prefixed = function(a, b, c) {
        return b ? J(a, b, c) : J(a, "pfx");
    }, g.className = g.className.replace(/(^|\s)no-js(\s|$)/, "$1$2") + (f ? " js " + v.join(" ") : ""), 
    e;
}(this, this.document), function(a, b, c) {
    function d(a) {
        return "[object Function]" == o.call(a);
    }
    function e(a) {
        return "string" == typeof a;
    }
    function f() {}
    function g(a) {
        return !a || "loaded" == a || "complete" == a || "uninitialized" == a;
    }
    function h() {
        var a = p.shift();
        q = 1, a ? a.t ? m(function() {
            ("c" == a.t ? B.injectCss : B.injectJs)(a.s, 0, a.a, a.x, a.e, 1);
        }, 0) : (a(), h()) : q = 0;
    }
    function i(a, c, d, e, f, i, j) {
        function k(b) {
            if (!o && g(l.readyState) && (u.r = o = 1, !q && h(), l.onload = l.onreadystatechange = null, 
            b)) {
                "img" != a && m(function() {
                    t.removeChild(l);
                }, 50);
                for (var d in y[c]) y[c].hasOwnProperty(d) && y[c][d].onload();
            }
        }
        var j = j || B.errorTimeout, l = b.createElement(a), o = 0, r = 0, u = {
            t: d,
            s: c,
            e: f,
            a: i,
            x: j
        };
        1 === y[c] && (r = 1, y[c] = []), "object" == a ? l.data = c : (l.src = c, l.type = a), 
        l.width = l.height = "0", l.onerror = l.onload = l.onreadystatechange = function() {
            k.call(this, r);
        }, p.splice(e, 0, u), "img" != a && (r || 2 === y[c] ? (t.insertBefore(l, s ? null : n), 
        m(k, j)) : y[c].push(l));
    }
    function j(a, b, c, d, f) {
        return q = 0, b = b || "j", e(a) ? i("c" == b ? v : u, a, b, this.i++, c, d, f) : (p.splice(this.i++, 0, a), 
        1 == p.length && h()), this;
    }
    function k() {
        var a = B;
        return a.loader = {
            load: j,
            i: 0
        }, a;
    }
    var A, B, l = b.documentElement, m = a.setTimeout, n = b.getElementsByTagName("script")[0], o = {}.toString, p = [], q = 0, r = "MozAppearance" in l.style, s = r && !!b.createRange().compareNode, t = s ? l : n.parentNode, l = a.opera && "[object Opera]" == o.call(a.opera), l = !!b.attachEvent && !l, u = r ? "object" : l ? "script" : "img", v = l ? "script" : u, w = Array.isArray || function(a) {
        return "[object Array]" == o.call(a);
    }, x = [], y = {}, z = {
        timeout: function(a, b) {
            return b.length && (a.timeout = b[0]), a;
        }
    };
    B = function(a) {
        function b(a) {
            var e, f, g, a = a.split("!"), b = x.length, c = a.pop(), d = a.length, c = {
                url: c,
                origUrl: c,
                prefixes: a
            };
            for (f = 0; d > f; f++) g = a[f].split("="), (e = z[g.shift()]) && (c = e(c, g));
            for (f = 0; b > f; f++) c = x[f](c);
            return c;
        }
        function g(a, e, f, g, h) {
            var i = b(a), j = i.autoCallback;
            i.url.split(".").pop().split("?").shift(), i.bypass || (e && (e = d(e) ? e : e[a] || e[g] || e[a.split("/").pop().split("?")[0]]), 
            i.instead ? i.instead(a, e, f, g, h) : (y[i.url] ? i.noexec = !0 : y[i.url] = 1, 
            f.load(i.url, i.forceCSS || !i.forceJS && "css" == i.url.split(".").pop().split("?").shift() ? "c" : c, i.noexec, i.attrs, i.timeout), 
            (d(e) || d(j)) && f.load(function() {
                k(), e && e(i.origUrl, h, g), j && j(i.origUrl, h, g), y[i.url] = 2;
            })));
        }
        function h(a, b) {
            function c(a, c) {
                if (a) {
                    if (e(a)) c || (j = function() {
                        var a = [].slice.call(arguments);
                        k.apply(this, a), l();
                    }), g(a, j, b, 0, h); else if (Object(a) === a) for (n in m = function() {
                        var c, b = 0;
                        for (c in a) a.hasOwnProperty(c) && b++;
                        return b;
                    }(), a) a.hasOwnProperty(n) && (!c && !--m && (d(j) ? j = function() {
                        var a = [].slice.call(arguments);
                        k.apply(this, a), l();
                    } : j[n] = function(a) {
                        return function() {
                            var b = [].slice.call(arguments);
                            a && a.apply(this, b), l();
                        };
                    }(k[n])), g(a[n], j, b, n, h));
                } else !c && l();
            }
            var m, n, h = !!a.test, i = a.load || a.both, j = a.callback || f, k = j, l = a.complete || f;
            c(h ? a.yep : a.nope, !!i), i && c(i);
        }
        var i, j, l = this.yepnope.loader;
        if (e(a)) g(a, 0, l, 0); else if (w(a)) for (i = 0; i < a.length; i++) j = a[i], 
        e(j) ? g(j, 0, l, 0) : w(j) ? B(j) : Object(j) === j && h(j, l); else Object(a) === a && h(a, l);
    }, B.addPrefix = function(a, b) {
        z[a] = b;
    }, B.addFilter = function(a) {
        x.push(a);
    }, B.errorTimeout = 1e4, null == b.readyState && b.addEventListener && (b.readyState = "loading", 
    b.addEventListener("DOMContentLoaded", A = function() {
        b.removeEventListener("DOMContentLoaded", A, 0), b.readyState = "complete";
    }, 0)), a.yepnope = k(), a.yepnope.executeStack = h, a.yepnope.injectJs = function(a, c, d, e, i, j) {
        var l, o, k = b.createElement("script"), e = e || B.errorTimeout;
        k.src = a;
        for (o in d) k.setAttribute(o, d[o]);
        c = j ? h : c || f, k.onreadystatechange = k.onload = function() {
            !l && g(k.readyState) && (l = 1, c(), k.onload = k.onreadystatechange = null);
        }, m(function() {
            l || (l = 1, c(1));
        }, e), i ? k.onload() : n.parentNode.insertBefore(k, n);
    }, a.yepnope.injectCss = function(a, c, d, e, g, i) {
        var j, e = b.createElement("link"), c = i ? h : c || f;
        e.href = a, e.rel = "stylesheet", e.type = "text/css";
        for (j in d) e.setAttribute(j, d[j]);
        g || (n.parentNode.insertBefore(e, n), m(c, 0));
    };
}(this, document), Modernizr.load = function() {
    yepnope.apply(window, [].slice.call(arguments, 0));
}, function(a) {
    a.hideAddressbar = function(g) {
        g = "string" == typeof g ? document.querySelector(g) : g;
        var b = navigator.userAgent, i = ~b.indexOf("iPhone") || ~b.indexOf("iPod"), k = ~b.indexOf("iPad"), f = i || k, e = ~b.indexOf("Android"), j = a.navigator.standalone, c = 0;
        if ((f || e) && g) {
            e && a.addEventListener("scroll", function() {
                g.style.height = a.innerHeight + "px";
            }, !1);
            var h = function() {
                var l = 0;
                f ? (l = document.documentElement.clientHeight, i && !j && (l += 60)) : e && (l = a.innerHeight + 56), 
                g.style.height = l + "px", setTimeout(scrollTo, 0, 0, 1);
            };
            !function d() {
                var l = g.offsetWidth;
                c !== l && (c = l, h(), a.addEventListener("resize", d, !1));
            }();
        }
    };
}(this), function(g, h) {
    function G(F, G) {
        function W(b) {
            return c.preferFlash && v && !c.ignoreFlash && c.flash[b] !== h && c.flash[b];
        }
        function r(b) {
            return function(c) {
                var d = this._s;
                return d && d._a ? b.call(this, c) : null;
            };
        }
        this.setupOptions = {
            url: F || null,
            flashVersion: 8,
            debugMode: !0,
            debugFlash: !1,
            useConsole: !0,
            consoleOnly: !0,
            waitForWindowLoad: !1,
            bgColor: "#ffffff",
            useHighPerformance: !1,
            flashPollingInterval: null,
            html5PollingInterval: null,
            flashLoadTimeout: 1e3,
            wmode: null,
            allowScriptAccess: "always",
            useFlashBlock: !1,
            useHTML5Audio: !0,
            html5Test: /^(probably|maybe)$/i,
            preferFlash: !1,
            noSWFCache: !1,
            idPrefix: "sound"
        }, this.defaultOptions = {
            autoLoad: !1,
            autoPlay: !1,
            from: null,
            loops: 1,
            onid3: null,
            onload: null,
            whileloading: null,
            onplay: null,
            onpause: null,
            onresume: null,
            whileplaying: null,
            onposition: null,
            onstop: null,
            onfailure: null,
            onfinish: null,
            multiShot: !0,
            multiShotEvents: !1,
            position: null,
            pan: 0,
            stream: !0,
            to: null,
            type: null,
            usePolicyFile: !1,
            volume: 100
        }, this.flash9Options = {
            isMovieStar: null,
            usePeakData: !1,
            useWaveformData: !1,
            useEQData: !1,
            onbufferchange: null,
            ondataerror: null
        }, this.movieStarOptions = {
            bufferTime: 3,
            serverURL: null,
            onconnect: null,
            duration: null
        }, this.audioFormats = {
            mp3: {
                type: [ 'audio/mpeg; codecs="mp3"', "audio/mpeg", "audio/mp3", "audio/MPA", "audio/mpa-robust" ],
                required: !0
            },
            mp4: {
                related: [ "aac", "m4a", "m4b" ],
                type: [ 'audio/mp4; codecs="mp4a.40.2"', "audio/aac", "audio/x-m4a", "audio/MP4A-LATM", "audio/mpeg4-generic" ],
                required: !1
            },
            ogg: {
                type: [ "audio/ogg; codecs=vorbis" ],
                required: !1
            },
            opus: {
                type: [ "audio/ogg; codecs=opus", "audio/opus" ],
                required: !1
            },
            wav: {
                type: [ 'audio/wav; codecs="1"', "audio/wav", "audio/wave", "audio/x-wav" ],
                required: !1
            }
        }, this.movieID = "sm2-container", this.id = G || "sm2movie", this.debugID = "soundmanager-debug", 
        this.debugURLParam = /([#?&])debug=1/i, this.versionNumber = "V2.97a.20140901", 
        this.altURL = this.movieURL = this.version = null, this.enabled = this.swfLoaded = !1, 
        this.oMC = null, this.sounds = {}, this.soundIDs = [], this.didFlashBlock = this.muted = !1, 
        this.filePattern = null, this.filePatterns = {
            flash8: /\.mp3(\?.*)?$/i,
            flash9: /\.mp3(\?.*)?$/i
        }, this.features = {
            buffering: !1,
            peakData: !1,
            waveformData: !1,
            eqData: !1,
            movieStar: !1
        }, this.sandbox = {}, this.html5 = {
            usingFlash: null
        }, this.flash = {}, this.ignoreFlash = this.html5Only = !1;
        var Ja, X, la, Ma, ma, n, O, w, oa, Y, pa, D, H, I, Na, qa, ra, Z, sa, $, ta, E, ua, P, va, aa, J, Oa, wa, Pa, xa, Qa, R, za, K, ba, ca, q, Ra, Sa, Ta, ea, U, Va, fa, V, z, ga, Ba, Wa, s, Ca, v, Da, Xa, B, ha, c = this, Ka = null, k = null, t = navigator.userAgent, La = g.location.href.toString(), p = document, x = [], M = !1, N = !1, m = !1, y = !1, na = !1, Q = null, ya = null, S = !1, Aa = !1, da = 0, T = null, Ua = [], u = null, fb = Array.prototype.slice, A = !1, Ya = 0, ia = t.match(/(ipad|iphone|ipod)/i), Za = t.match(/android/i), C = t.match(/msie/i), gb = t.match(/webkit/i), ja = t.match(/safari/i) && !t.match(/chrome/i), Ea = t.match(/opera/i), Fa = t.match(/(mobile|pre\/|xoom)/i) || ia || Za, $a = !La.match(/usehtml5audio/i) && !La.match(/sm2\-ignorebadua/i) && ja && !t.match(/silk/i) && t.match(/OS X 10_6_([3-7])/i), Ga = p.hasFocus !== h ? p.hasFocus() : null, ka = ja && (p.hasFocus === h || !p.hasFocus()), ab = !ka, bb = /(mp3|mp4|mpa|m4a|m4b)/i, Ha = p.location ? p.location.protocol.match(/http/i) : null, cb = Ha ? "" : "http://", db = /^\s*audio\/(?:x-)?(?:mpeg4|aac|flv|mov|mp4||m4v|m4a|m4b|mp4v|3gp|3g2)\s*(?:$|;)/i, eb = "mpeg4 aac flv mov mp4 m4v f4v m4a m4b mp4v 3gp 3g2".split(" "), hb = RegExp("\\.(" + eb.join("|") + ")(\\?.*)?$", "i");
        this.mimePattern = /^\s*audio\/(?:x-)?(?:mp(?:eg|3))\s*(?:$|;)/i, this.useAltURL = !Ha;
        var Ia;
        try {
            Ia = Audio !== h && (Ea && opera !== h && 10 > opera.version() ? new Audio(null) : new Audio()).canPlayType !== h;
        } catch (ib) {
            Ia = !1;
        }
        this.hasHTML5 = Ia, this.setup = function(b) {
            var e = !c.url;
            return b !== h && m && u && c.ok(), oa(b), b && (e && P && b.url !== h && c.beginDelayedInit(), 
            !P && b.url !== h && "complete" === p.readyState && setTimeout(E, 1)), c;
        }, this.supported = this.ok = function() {
            return u ? m && !y : c.useHTML5Audio && c.hasHTML5;
        }, this.getMovie = function(b) {
            return X(b) || p[b] || g[b];
        }, this.createSound = function(b, e) {
            function d() {
                return a = ba(a), c.sounds[a.id] = new Ja(a), c.soundIDs.push(a.id), c.sounds[a.id];
            }
            var a, f = null;
            if (!m || !c.ok()) return !1;
            if (e !== h && (b = {
                id: b,
                url: e
            }), a = w(b), a.url = ea(a.url), void 0 === a.id && (a.id = c.setupOptions.idPrefix + Ya++), 
            q(a.id, !0)) return c.sounds[a.id];
            if (fa(a)) f = d(), f._setup_html5(a); else {
                if (c.html5Only || c.html5.usingFlash && a.url && a.url.match(/data\:/i)) return d();
                n > 8 && null === a.isMovieStar && (a.isMovieStar = !(!a.serverURL && !(a.type && a.type.match(db) || a.url && a.url.match(hb)))), 
                a = ca(a, void 0), f = d(), 8 === n ? k._createSound(a.id, a.loops || 1, a.usePolicyFile) : (k._createSound(a.id, a.url, a.usePeakData, a.useWaveformData, a.useEQData, a.isMovieStar, a.isMovieStar ? a.bufferTime : !1, a.loops || 1, a.serverURL, a.duration || null, a.autoPlay, !0, a.autoLoad, a.usePolicyFile), 
                a.serverURL || (f.connected = !0, a.onconnect && a.onconnect.apply(f))), !a.serverURL && (a.autoLoad || a.autoPlay) && f.load(a);
            }
            return !a.serverURL && a.autoPlay && f.play(), f;
        }, this.destroySound = function(b, e) {
            if (!q(b)) return !1;
            var a, d = c.sounds[b];
            for (d._iO = {}, d.stop(), d.unload(), a = 0; a < c.soundIDs.length; a++) if (c.soundIDs[a] === b) {
                c.soundIDs.splice(a, 1);
                break;
            }
            return e || d.destruct(!0), delete c.sounds[b], !0;
        }, this.load = function(b, e) {
            return q(b) ? c.sounds[b].load(e) : !1;
        }, this.unload = function(b) {
            return q(b) ? c.sounds[b].unload() : !1;
        }, this.onposition = this.onPosition = function(b, e, d, a) {
            return q(b) ? c.sounds[b].onposition(e, d, a) : !1;
        }, this.clearOnPosition = function(b, e, d) {
            return q(b) ? c.sounds[b].clearOnPosition(e, d) : !1;
        }, this.start = this.play = function(b, e) {
            var d = null, a = e && !(e instanceof Object);
            if (!m || !c.ok()) return !1;
            if (q(b, a)) a && (e = {
                url: e
            }); else {
                if (!a) return !1;
                a && (e = {
                    url: e
                }), e && e.url && (e.id = b, d = c.createSound(e).play());
            }
            return null === d && (d = c.sounds[b].play(e)), d;
        }, this.setPosition = function(b, e) {
            return q(b) ? c.sounds[b].setPosition(e) : !1;
        }, this.stop = function(b) {
            return q(b) ? c.sounds[b].stop() : !1;
        }, this.stopAll = function() {
            for (var b in c.sounds) c.sounds.hasOwnProperty(b) && c.sounds[b].stop();
        }, this.pause = function(b) {
            return q(b) ? c.sounds[b].pause() : !1;
        }, this.pauseAll = function() {
            var b;
            for (b = c.soundIDs.length - 1; b >= 0; b--) c.sounds[c.soundIDs[b]].pause();
        }, this.resume = function(b) {
            return q(b) ? c.sounds[b].resume() : !1;
        }, this.resumeAll = function() {
            var b;
            for (b = c.soundIDs.length - 1; b >= 0; b--) c.sounds[c.soundIDs[b]].resume();
        }, this.togglePause = function(b) {
            return q(b) ? c.sounds[b].togglePause() : !1;
        }, this.setPan = function(b, e) {
            return q(b) ? c.sounds[b].setPan(e) : !1;
        }, this.setVolume = function(b, e) {
            return q(b) ? c.sounds[b].setVolume(e) : !1;
        }, this.mute = function(b) {
            var e = 0;
            if (b instanceof String && (b = null), b) return q(b) ? c.sounds[b].mute() : !1;
            for (e = c.soundIDs.length - 1; e >= 0; e--) c.sounds[c.soundIDs[e]].mute();
            return c.muted = !0;
        }, this.muteAll = function() {
            c.mute();
        }, this.unmute = function(b) {
            if (b instanceof String && (b = null), b) return q(b) ? c.sounds[b].unmute() : !1;
            for (b = c.soundIDs.length - 1; b >= 0; b--) c.sounds[c.soundIDs[b]].unmute();
            return c.muted = !1, !0;
        }, this.unmuteAll = function() {
            c.unmute();
        }, this.toggleMute = function(b) {
            return q(b) ? c.sounds[b].toggleMute() : !1;
        }, this.getMemoryUse = function() {
            var b = 0;
            return k && 8 !== n && (b = parseInt(k._getMemoryUse(), 10)), b;
        }, this.disable = function(b) {
            var e;
            if (b === h && (b = !1), y) return !1;
            for (y = !0, e = c.soundIDs.length - 1; e >= 0; e--) Pa(c.sounds[c.soundIDs[e]]);
            return O(b), s.remove(g, "load", H), !0;
        }, this.canPlayMIME = function(b) {
            var e;
            return c.hasHTML5 && (e = V({
                type: b
            })), !e && u && (e = b && c.ok() ? !!(n > 8 && b.match(db) || b.match(c.mimePattern)) : null), 
            e;
        }, this.canPlayURL = function(b) {
            var e;
            return c.hasHTML5 && (e = V({
                url: b
            })), !e && u && (e = b && c.ok() ? !!b.match(c.filePattern) : null), e;
        }, this.canPlayLink = function(b) {
            return b.type !== h && b.type && c.canPlayMIME(b.type) ? !0 : c.canPlayURL(b.href);
        }, this.getSoundById = function(b) {
            return b ? c.sounds[b] : null;
        }, this.onready = function(b, c) {
            if ("function" != typeof b) throw R("needFunction", "onready");
            return c || (c = g), pa("onready", b, c), D(), !0;
        }, this.ontimeout = function(b, c) {
            if ("function" != typeof b) throw R("needFunction", "ontimeout");
            return c || (c = g), pa("ontimeout", b, c), D({
                type: "ontimeout"
            }), !0;
        }, this._wD = this._writeDebug = function() {
            return !0;
        }, this._debug = function() {}, this.reboot = function(b, e) {
            var d, a, f;
            for (d = c.soundIDs.length - 1; d >= 0; d--) c.sounds[c.soundIDs[d]].destruct();
            if (k) try {
                C && (ya = k.innerHTML), Q = k.parentNode.removeChild(k);
            } catch (h) {}
            if (ya = Q = u = k = null, c.enabled = P = m = S = Aa = M = N = y = A = c.swfLoaded = !1, 
            c.soundIDs = [], c.sounds = {}, Ya = 0, b) x = []; else for (d in x) if (x.hasOwnProperty(d)) for (a = 0, 
            f = x[d].length; f > a; a++) x[d][a].fired = !1;
            return c.html5 = {
                usingFlash: null
            }, c.flash = {}, c.html5Only = !1, c.ignoreFlash = !1, g.setTimeout(function() {
                ta(), e || c.beginDelayedInit();
            }, 20), c;
        }, this.reset = function() {
            return c.reboot(!0, !0);
        }, this.getMoviePercent = function() {
            return k && "PercentLoaded" in k ? k.PercentLoaded() : null;
        }, this.beginDelayedInit = function() {
            na = !0, E(), setTimeout(function() {
                return Aa ? !1 : (aa(), $(), Aa = !0);
            }, 20), I();
        }, this.destruct = function() {
            c.disable(!0);
        }, Ja = function(b) {
            var e, d, f, l, L, g, p, r, x, y, z, a = this, t = !1, m = [], u = 0, v = null;
            d = e = null, this.sID = this.id = b.id, this.url = b.url, this._iO = this.instanceOptions = this.options = w(b), 
            this.pan = this.options.pan, this.volume = this.options.volume, this.isHTML5 = !1, 
            this._a = null, z = this.url ? !1 : !0, this.id3 = {}, this._debug = function() {}, 
            this.load = function(b) {
                var d, e = null;
                if (b !== h ? a._iO = w(b, a.options) : (b = a.options, a._iO = b, v && v !== a.url && (a._iO.url = a.url, 
                a.url = null)), a._iO.url || (a._iO.url = a.url), a._iO.url = ea(a._iO.url), d = a.instanceOptions = a._iO, 
                !d.url && !a.url) return a;
                if (d.url === a.url && 0 !== a.readyState && 2 !== a.readyState) return 3 === a.readyState && d.onload && ha(a, function() {
                    d.onload.apply(a, [ !!a.duration ]);
                }), a;
                if (a.loaded = !1, a.readyState = 1, a.playState = 0, a.id3 = {}, fa(d)) e = a._setup_html5(d), 
                e._called_load || (a._html5_canplay = !1, a.url !== d.url && (a._a.src = d.url, 
                a.setPosition(0)), a._a.autobuffer = "auto", a._a.preload = "auto", a._a._called_load = !0); else {
                    if (c.html5Only || a._iO.url && a._iO.url.match(/data\:/i)) return a;
                    try {
                        a.isHTML5 = !1, a._iO = ca(ba(d)), a._iO.autoPlay && (a._iO.position || a._iO.from) && (a._iO.autoPlay = !1), 
                        d = a._iO, 8 === n ? k._load(a.id, d.url, d.stream, d.autoPlay, d.usePolicyFile) : k._load(a.id, d.url, !!d.stream, !!d.autoPlay, d.loops || 1, !!d.autoLoad, d.usePolicyFile);
                    } catch (f) {
                        J({
                            type: "SMSOUND_LOAD_JS_EXCEPTION",
                            fatal: !0
                        });
                    }
                }
                return a.url = d.url, a;
            }, this.unload = function() {
                return 0 !== a.readyState && (a.isHTML5 ? (g(), a._a && (a._a.pause(), v = ga(a._a))) : 8 === n ? k._unload(a.id, "about:blank") : k._unload(a.id), 
                f()), a;
            }, this.destruct = function(b) {
                a.isHTML5 ? (g(), a._a && (a._a.pause(), ga(a._a), A || L(), a._a._s = null, a._a = null)) : (a._iO.onfailure = null, 
                k._destroySound(a.id)), b || c.destroySound(a.id, !0);
            }, this.start = this.play = function(b, e) {
                var d, f, l, g, L;
                if (f = !0, f = null, e = e === h ? !0 : e, b || (b = {}), a.url && (a._iO.url = a.url), 
                a._iO = w(a._iO, a.options), a._iO = w(b, a._iO), a._iO.url = ea(a._iO.url), a.instanceOptions = a._iO, 
                !a.isHTML5 && a._iO.serverURL && !a.connected) return a.getAutoPlay() || a.setAutoPlay(!0), 
                a;
                if (fa(a._iO) && (a._setup_html5(a._iO), p()), 1 === a.playState && !a.paused && (d = a._iO.multiShot, 
                d || (a.isHTML5 && a.setPosition(a._iO.position), f = a)), null !== f) return f;
                if (b.url && b.url !== a.url && (a.readyState || a.isHTML5 || 8 !== n || !z ? a.load(a._iO) : z = !1), 
                a.loaded || (0 === a.readyState ? (a.isHTML5 || c.html5Only ? a.isHTML5 ? a.load(a._iO) : f = a : (a._iO.autoPlay = !0, 
                a.load(a._iO)), a.instanceOptions = a._iO) : 2 === a.readyState && (f = a)), null !== f) return f;
                if (!a.isHTML5 && 9 === n && 0 < a.position && a.position === a.duration && (b.position = 0), 
                a.paused && 0 <= a.position && (!a._iO.serverURL || 0 < a.position)) a.resume(); else {
                    if (a._iO = w(b, a._iO), (!a.isHTML5 && null !== a._iO.position && 0 < a._iO.position || null !== a._iO.from && 0 < a._iO.from || null !== a._iO.to) && 0 === a.instanceCount && 0 === a.playState && !a._iO.serverURL) {
                        if (d = function() {
                            a._iO = w(b, a._iO), a.play(a._iO);
                        }, a.isHTML5 && !a._html5_canplay ? (a.load({
                            _oncanplay: d
                        }), f = !1) : a.isHTML5 || a.loaded || a.readyState && 2 === a.readyState || (a.load({
                            onload: d
                        }), f = !1), null !== f) return f;
                        a._iO = y();
                    }
                    (!a.instanceCount || a._iO.multiShotEvents || a.isHTML5 && a._iO.multiShot && !A || !a.isHTML5 && n > 8 && !a.getAutoPlay()) && a.instanceCount++, 
                    a._iO.onposition && 0 === a.playState && r(a), a.playState = 1, a.paused = !1, a.position = a._iO.position === h || isNaN(a._iO.position) ? 0 : a._iO.position, 
                    a.isHTML5 || (a._iO = ca(ba(a._iO))), a._iO.onplay && e && (a._iO.onplay.apply(a), 
                    t = !0), a.setVolume(a._iO.volume, !0), a.setPan(a._iO.pan, !0), a.isHTML5 ? 2 > a.instanceCount ? (p(), 
                    f = a._setup_html5(), a.setPosition(a._iO.position), f.play()) : (l = new Audio(a._iO.url), 
                    g = function() {
                        s.remove(l, "ended", g), a._onfinish(a), ga(l), l = null;
                    }, L = function() {
                        s.remove(l, "canplay", L);
                        try {
                            l.currentTime = a._iO.position / 1e3;
                        } catch (b) {}
                        l.play();
                    }, s.add(l, "ended", g), void 0 !== a._iO.volume && (l.volume = Math.max(0, Math.min(1, a._iO.volume / 100))), 
                    a.muted && (l.muted = !0), a._iO.position ? s.add(l, "canplay", L) : l.play()) : (f = k._start(a.id, a._iO.loops || 1, 9 === n ? a.position : a.position / 1e3, a._iO.multiShot || !1), 
                    9 === n && !f && a._iO.onplayerror && a._iO.onplayerror.apply(a));
                }
                return a;
            }, this.stop = function(b) {
                var c = a._iO;
                return 1 === a.playState && (a._onbufferchange(0), a._resetOnPosition(0), a.paused = !1, 
                a.isHTML5 || (a.playState = 0), x(), c.to && a.clearOnPosition(c.to), a.isHTML5 ? a._a && (b = a.position, 
                a.setPosition(0), a.position = b, a._a.pause(), a.playState = 0, a._onTimer(), g()) : (k._stop(a.id, b), 
                c.serverURL && a.unload()), a.instanceCount = 0, a._iO = {}, c.onstop && c.onstop.apply(a)), 
                a;
            }, this.setAutoPlay = function(b) {
                a._iO.autoPlay = b, a.isHTML5 || (k._setAutoPlay(a.id, b), b && !a.instanceCount && 1 === a.readyState && a.instanceCount++);
            }, this.getAutoPlay = function() {
                return a._iO.autoPlay;
            }, this.setPosition = function(b) {
                b === h && (b = 0);
                var c = a.isHTML5 ? Math.max(b, 0) : Math.min(a.duration || a._iO.duration, Math.max(b, 0));
                if (a.position = c, b = a.position / 1e3, a._resetOnPosition(a.position), a._iO.position = c, 
                a.isHTML5) {
                    if (a._a) {
                        if (a._html5_canplay) {
                            if (a._a.currentTime !== b) try {
                                a._a.currentTime = b, (0 === a.playState || a.paused) && a._a.pause();
                            } catch (e) {}
                        } else if (b) return a;
                        a.paused && a._onTimer(!0);
                    }
                } else b = 9 === n ? a.position : b, a.readyState && 2 !== a.readyState && k._setPosition(a.id, b, a.paused || !a.playState, a._iO.multiShot);
                return a;
            }, this.pause = function(b) {
                return a.paused || 0 === a.playState && 1 !== a.readyState ? a : (a.paused = !0, 
                a.isHTML5 ? (a._setup_html5().pause(), g()) : (b || b === h) && k._pause(a.id, a._iO.multiShot), 
                a._iO.onpause && a._iO.onpause.apply(a), a);
            }, this.resume = function() {
                var b = a._iO;
                return a.paused ? (a.paused = !1, a.playState = 1, a.isHTML5 ? (a._setup_html5().play(), 
                p()) : (b.isMovieStar && !b.serverURL && a.setPosition(a.position), k._pause(a.id, b.multiShot)), 
                !t && b.onplay ? (b.onplay.apply(a), t = !0) : b.onresume && b.onresume.apply(a), 
                a) : a;
            }, this.togglePause = function() {
                return 0 === a.playState ? (a.play({
                    position: 9 !== n || a.isHTML5 ? a.position / 1e3 : a.position
                }), a) : (a.paused ? a.resume() : a.pause(), a);
            }, this.setPan = function(b, c) {
                return b === h && (b = 0), c === h && (c = !1), a.isHTML5 || k._setPan(a.id, b), 
                a._iO.pan = b, c || (a.pan = b, a.options.pan = b), a;
            }, this.setVolume = function(b, e) {
                return b === h && (b = 100), e === h && (e = !1), a.isHTML5 ? a._a && (c.muted && !a.muted && (a.muted = !0, 
                a._a.muted = !0), a._a.volume = Math.max(0, Math.min(1, b / 100))) : k._setVolume(a.id, c.muted && !a.muted || a.muted ? 0 : b), 
                a._iO.volume = b, e || (a.volume = b, a.options.volume = b), a;
            }, this.mute = function() {
                return a.muted = !0, a.isHTML5 ? a._a && (a._a.muted = !0) : k._setVolume(a.id, 0), 
                a;
            }, this.unmute = function() {
                a.muted = !1;
                var b = a._iO.volume !== h;
                return a.isHTML5 ? a._a && (a._a.muted = !1) : k._setVolume(a.id, b ? a._iO.volume : a.options.volume), 
                a;
            }, this.toggleMute = function() {
                return a.muted ? a.unmute() : a.mute();
            }, this.onposition = this.onPosition = function(b, c, e) {
                return m.push({
                    position: parseInt(b, 10),
                    method: c,
                    scope: e !== h ? e : a,
                    fired: !1
                }), a;
            }, this.clearOnPosition = function(a, b) {
                var c;
                if (a = parseInt(a, 10), isNaN(a)) return !1;
                for (c = 0; c < m.length; c++) a !== m[c].position || b && b !== m[c].method || (m[c].fired && u--, 
                m.splice(c, 1));
            }, this._processOnPosition = function() {
                var b, c;
                if (b = m.length, !b || !a.playState || u >= b) return !1;
                for (b -= 1; b >= 0; b--) c = m[b], !c.fired && a.position >= c.position && (c.fired = !0, 
                u++, c.method.apply(c.scope, [ c.position ]));
                return !0;
            }, this._resetOnPosition = function(a) {
                var b, c;
                if (b = m.length, !b) return !1;
                for (b -= 1; b >= 0; b--) c = m[b], c.fired && a <= c.position && (c.fired = !1, 
                u--);
                return !0;
            }, y = function() {
                var d, f, b = a._iO, c = b.from, e = b.to;
                return f = function() {
                    a.clearOnPosition(e, f), a.stop();
                }, d = function() {
                    null === e || isNaN(e) || a.onPosition(e, f);
                }, null !== c && !isNaN(c) && (b.position = c, b.multiShot = !1, d()), b;
            }, r = function() {
                var b, c = a._iO.onposition;
                if (c) for (b in c) c.hasOwnProperty(b) && a.onPosition(parseInt(b, 10), c[b]);
            }, x = function() {
                var b, c = a._iO.onposition;
                if (c) for (b in c) c.hasOwnProperty(b) && a.clearOnPosition(parseInt(b, 10));
            }, p = function() {
                a.isHTML5 && Ra(a);
            }, g = function() {
                a.isHTML5 && Sa(a);
            }, f = function(b) {
                b || (m = [], u = 0), t = !1, a._hasTimer = null, a._a = null, a._html5_canplay = !1, 
                a.bytesLoaded = null, a.bytesTotal = null, a.duration = a._iO && a._iO.duration ? a._iO.duration : null, 
                a.durationEstimate = null, a.buffered = [], a.eqData = [], a.eqData.left = [], a.eqData.right = [], 
                a.failures = 0, a.isBuffering = !1, a.instanceOptions = {}, a.instanceCount = 0, 
                a.loaded = !1, a.metadata = {}, a.readyState = 0, a.muted = !1, a.paused = !1, a.peakData = {
                    left: 0,
                    right: 0
                }, a.waveformData = {
                    left: [],
                    right: []
                }, a.playState = 0, a.position = null, a.id3 = {};
            }, f(), this._onTimer = function(b) {
                var c, f = !1, l = {};
                return a._hasTimer || b ? (a._a && (b || (0 < a.playState || 1 === a.readyState) && !a.paused) && (c = a._get_html5_duration(), 
                c !== e && (e = c, a.duration = c, f = !0), a.durationEstimate = a.duration, c = 1e3 * a._a.currentTime || 0, 
                c !== d && (d = c, f = !0), (f || b) && a._whileplaying(c, l, l, l, l)), f) : void 0;
            }, this._get_html5_duration = function() {
                var b = a._iO;
                return (b = a._a && a._a.duration ? 1e3 * a._a.duration : b && b.duration ? b.duration : null) && !isNaN(b) && 1 / 0 !== b ? b : null;
            }, this._apply_loop = function(a, b) {
                a.loop = b > 1 ? "loop" : "";
            }, this._setup_html5 = function(b) {
                b = w(a._iO, b);
                var d, c = A ? Ka : a._a, e = decodeURI(b.url);
                if (A ? e === decodeURI(Ca) && (d = !0) : e === decodeURI(v) && (d = !0), c) {
                    if (c._s) if (A) c._s && c._s.playState && !d && c._s.stop(); else if (!A && e === decodeURI(v)) return a._apply_loop(c, b.loops), 
                    c;
                    d || (v && f(!1), c.src = b.url, Ca = v = a.url = b.url, c._called_load = !1);
                } else b.autoLoad || b.autoPlay ? (a._a = new Audio(b.url), a._a.load()) : a._a = Ea && 10 > opera.version() ? new Audio(null) : new Audio(), 
                c = a._a, c._called_load = !1, A && (Ka = c);
                return a.isHTML5 = !0, a._a = c, c._s = a, l(), a._apply_loop(c, b.loops), b.autoLoad || b.autoPlay ? a.load() : (c.autobuffer = !1, 
                c.preload = "auto"), c;
            }, l = function() {
                if (a._a._added_events) return !1;
                var b;
                a._a._added_events = !0;
                for (b in B) B.hasOwnProperty(b) && a._a && a._a.addEventListener(b, B[b], !1);
                return !0;
            }, L = function() {
                var b;
                a._a._added_events = !1;
                for (b in B) B.hasOwnProperty(b) && a._a && a._a.removeEventListener(b, B[b], !1);
            }, this._onload = function(b) {
                var c = !!b || !a.isHTML5 && 8 === n && a.duration;
                return a.loaded = c, a.readyState = c ? 3 : 2, a._onbufferchange(0), a._iO.onload && ha(a, function() {
                    a._iO.onload.apply(a, [ c ]);
                }), !0;
            }, this._onbufferchange = function(b) {
                return 0 === a.playState || b && a.isBuffering || !b && !a.isBuffering ? !1 : (a.isBuffering = 1 === b, 
                a._iO.onbufferchange && a._iO.onbufferchange.apply(a, [ b ]), !0);
            }, this._onsuspend = function() {
                return a._iO.onsuspend && a._iO.onsuspend.apply(a), !0;
            }, this._onfailure = function(b, c, e) {
                a.failures++, a._iO.onfailure && 1 === a.failures && a._iO.onfailure(b, c, e);
            }, this._onwarning = function(b, c, e) {
                a._iO.onwarning && a._iO.onwarning(b, c, e);
            }, this._onfinish = function() {
                var b = a._iO.onfinish;
                a._onbufferchange(0), a._resetOnPosition(0), a.instanceCount && (a.instanceCount--, 
                a.instanceCount || (x(), a.playState = 0, a.paused = !1, a.instanceCount = 0, a.instanceOptions = {}, 
                a._iO = {}, g(), a.isHTML5 && (a.position = 0)), (!a.instanceCount || a._iO.multiShotEvents) && b && ha(a, function() {
                    b.apply(a);
                }));
            }, this._whileloading = function(b, c, e, d) {
                var f = a._iO;
                a.bytesLoaded = b, a.bytesTotal = c, a.duration = Math.floor(e), a.bufferLength = d, 
                a.durationEstimate = a.isHTML5 || f.isMovieStar ? a.duration : f.duration ? a.duration > f.duration ? a.duration : f.duration : parseInt(a.bytesTotal / a.bytesLoaded * a.duration, 10), 
                a.isHTML5 || (a.buffered = [ {
                    start: 0,
                    end: a.duration
                } ]), (3 !== a.readyState || a.isHTML5) && f.whileloading && f.whileloading.apply(a);
            }, this._whileplaying = function(b, c, e, d, f) {
                var l = a._iO;
                return isNaN(b) || null === b ? !1 : (a.position = Math.max(0, b), a._processOnPosition(), 
                !a.isHTML5 && n > 8 && (l.usePeakData && c !== h && c && (a.peakData = {
                    left: c.leftPeak,
                    right: c.rightPeak
                }), l.useWaveformData && e !== h && e && (a.waveformData = {
                    left: e.split(","),
                    right: d.split(",")
                }), l.useEQData && f !== h && f && f.leftEQ && (b = f.leftEQ.split(","), a.eqData = b, 
                a.eqData.left = b, f.rightEQ !== h && f.rightEQ && (a.eqData.right = f.rightEQ.split(",")))), 
                1 === a.playState && (!a.isHTML5 && 8 === n && !a.position && a.isBuffering && a._onbufferchange(0), 
                l.whileplaying && l.whileplaying.apply(a)), !0);
            }, this._oncaptiondata = function(b) {
                a.captiondata = b, a._iO.oncaptiondata && a._iO.oncaptiondata.apply(a, [ b ]);
            }, this._onmetadata = function(b, c) {
                var d, f, e = {};
                for (d = 0, f = b.length; f > d; d++) e[b[d]] = c[d];
                a.metadata = e, console.log("updated metadata", a.metadata), a._iO.onmetadata && a._iO.onmetadata.call(a, a.metadata);
            }, this._onid3 = function(b, c) {
                var d, f, e = [];
                for (d = 0, f = b.length; f > d; d++) e[b[d]] = c[d];
                a.id3 = w(a.id3, e), a._iO.onid3 && a._iO.onid3.apply(a);
            }, this._onconnect = function(b) {
                b = 1 === b, (a.connected = b) && (a.failures = 0, q(a.id) && (a.getAutoPlay() ? a.play(h, a.getAutoPlay()) : a._iO.autoLoad && a.load()), 
                a._iO.onconnect && a._iO.onconnect.apply(a, [ b ]));
            }, this._ondataerror = function() {
                0 < a.playState && a._iO.ondataerror && a._iO.ondataerror.apply(a);
            };
        }, va = function() {
            return p.body || p.getElementsByTagName("div")[0];
        }, X = function(b) {
            return p.getElementById(b);
        }, w = function(b, e) {
            var a, f, d = b || {};
            a = e === h ? c.defaultOptions : e;
            for (f in a) a.hasOwnProperty(f) && d[f] === h && (d[f] = "object" != typeof a[f] || null === a[f] ? a[f] : w(d[f], a[f]));
            return d;
        }, ha = function(b, c) {
            b.isHTML5 || 8 !== n ? c() : g.setTimeout(c, 0);
        }, Y = {
            onready: 1,
            ontimeout: 1,
            defaultOptions: 1,
            flash9Options: 1,
            movieStarOptions: 1
        }, oa = function(b, e) {
            var d, a = !0, f = e !== h, l = c.setupOptions;
            for (d in b) if (b.hasOwnProperty(d)) if ("object" != typeof b[d] || null === b[d] || b[d] instanceof Array || b[d] instanceof RegExp) f && Y[e] !== h ? c[e][d] = b[d] : l[d] !== h ? (c.setupOptions[d] = b[d], 
            c[d] = b[d]) : Y[d] === h ? a = !1 : c[d] instanceof Function ? c[d].apply(c, b[d] instanceof Array ? b[d] : [ b[d] ]) : c[d] = b[d]; else {
                if (Y[d] !== h) return oa(b[d], d);
                a = !1;
            }
            return a;
        }, s = function() {
            function b(a) {
                a = fb.call(a);
                var b = a.length;
                return d ? (a[1] = "on" + a[1], b > 3 && a.pop()) : 3 === b && a.push(!1), a;
            }
            function c(b, e) {
                var h = b.shift(), g = [ a[e] ];
                d ? h[g](b[0], b[1]) : h[g].apply(h, b);
            }
            var d = g.attachEvent, a = {
                add: d ? "attachEvent" : "addEventListener",
                remove: d ? "detachEvent" : "removeEventListener"
            };
            return {
                add: function() {
                    c(b(arguments), "add");
                },
                remove: function() {
                    c(b(arguments), "remove");
                }
            };
        }(), B = {
            abort: r(function() {}),
            canplay: r(function() {
                var c, b = this._s;
                if (b._html5_canplay) return !0;
                if (b._html5_canplay = !0, b._onbufferchange(0), c = b._iO.position === h || isNaN(b._iO.position) ? null : b._iO.position / 1e3, 
                this.currentTime !== c) try {
                    this.currentTime = c;
                } catch (d) {}
                b._iO._oncanplay && b._iO._oncanplay();
            }),
            canplaythrough: r(function() {
                var b = this._s;
                b.loaded || (b._onbufferchange(0), b._whileloading(b.bytesLoaded, b.bytesTotal, b._get_html5_duration()), 
                b._onload(!0));
            }),
            durationchange: r(function() {
                var c, b = this._s;
                c = b._get_html5_duration(), !isNaN(c) && c !== b.duration && (b.durationEstimate = b.duration = c);
            }),
            ended: r(function() {
                this._s._onfinish();
            }),
            error: r(function() {
                this._s._onload(!1);
            }),
            loadeddata: r(function() {
                var b = this._s;
                !b._loaded && !ja && (b.duration = b._get_html5_duration());
            }),
            loadedmetadata: r(function() {}),
            loadstart: r(function() {
                this._s._onbufferchange(1);
            }),
            play: r(function() {
                this._s._onbufferchange(0);
            }),
            playing: r(function() {
                this._s._onbufferchange(0);
            }),
            progress: r(function(b) {
                var d, a, c = this._s, f = 0, f = b.target.buffered;
                d = b.loaded || 0;
                var l = b.total || 1;
                if (c.buffered = [], f && f.length) {
                    for (d = 0, a = f.length; a > d; d++) c.buffered.push({
                        start: 1e3 * f.start(d),
                        end: 1e3 * f.end(d)
                    });
                    f = 1e3 * (f.end(0) - f.start(0)), d = Math.min(1, f / (1e3 * b.target.duration));
                }
                isNaN(d) || (c._whileloading(d, l, c._get_html5_duration()), d && l && d === l && B.canplaythrough.call(this, b));
            }),
            ratechange: r(function() {}),
            suspend: r(function(b) {
                var c = this._s;
                B.progress.call(this, b), c._onsuspend();
            }),
            stalled: r(function() {}),
            timeupdate: r(function() {
                this._s._onTimer();
            }),
            waiting: r(function() {
                this._s._onbufferchange(1);
            })
        }, fa = function(b) {
            return b && (b.type || b.url || b.serverURL) ? b.serverURL || b.type && W(b.type) ? !1 : b.type ? V({
                type: b.type
            }) : V({
                url: b.url
            }) || c.html5Only || b.url.match(/data\:/i) : !1;
        }, ga = function(b) {
            var e;
            return b && (e = ja ? "about:blank" : c.html5.canPlayType("audio/wav") ? "data:audio/wave;base64,/UklGRiYAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQIAAAD//w==" : "about:blank", 
            b.src = e, void 0 !== b._called_unload && (b._called_load = !1)), A && (Ca = null), 
            e;
        }, V = function(b) {
            if (!c.useHTML5Audio || !c.hasHTML5) return !1;
            var e = b.url || null;
            b = b.type || null;
            var a, d = c.audioFormats;
            if (b && c.html5[b] !== h) return c.html5[b] && !W(b);
            if (!z) {
                z = [];
                for (a in d) d.hasOwnProperty(a) && (z.push(a), d[a].related && (z = z.concat(d[a].related)));
                z = RegExp("\\.(" + z.join("|") + ")(\\?.*)?$", "i");
            }
            return a = e ? e.toLowerCase().match(z) : null, a && a.length ? a = a[1] : b && (e = b.indexOf(";"), 
            a = (-1 !== e ? b.substr(0, e) : b).substr(6)), a && c.html5[a] !== h ? e = c.html5[a] && !W(a) : (b = "audio/" + a, 
            e = c.html5.canPlayType({
                type: b
            }), e = (c.html5[a] = e) && c.html5[b] && !W(b)), e;
        }, Wa = function() {
            function b(a) {
                var b, d = b = !1;
                if (!e || "function" != typeof e.canPlayType) return b;
                if (a instanceof Array) {
                    for (g = 0, b = a.length; b > g; g++) (c.html5[a[g]] || e.canPlayType(a[g]).match(c.html5Test)) && (d = !0, 
                    c.html5[a[g]] = !0, c.flash[a[g]] = !!a[g].match(bb));
                    b = d;
                } else a = e && "function" == typeof e.canPlayType ? e.canPlayType(a) : !1, b = !(!a || !a.match(c.html5Test));
                return b;
            }
            if (!c.useHTML5Audio || !c.hasHTML5) return u = c.html5.usingFlash = !0, !1;
            var d, a, l, g, e = Audio !== h ? Ea && 10 > opera.version() ? new Audio(null) : new Audio() : null, f = {};
            l = c.audioFormats;
            for (d in l) if (l.hasOwnProperty(d) && (a = "audio/" + d, f[d] = b(l[d].type), 
            f[a] = f[d], d.match(bb) ? (c.flash[d] = !0, c.flash[a] = !0) : (c.flash[d] = !1, 
            c.flash[a] = !1), l[d] && l[d].related)) for (g = l[d].related.length - 1; g >= 0; g--) f["audio/" + l[d].related[g]] = f[d], 
            c.html5[l[d].related[g]] = f[d], c.flash[l[d].related[g]] = f[d];
            return f.canPlayType = e ? b : null, c.html5 = w(c.html5, f), c.html5.usingFlash = Va(), 
            u = c.html5.usingFlash, !0;
        }, sa = {}, R = function() {}, ba = function(b) {
            return 8 === n && 1 < b.loops && b.stream && (b.stream = !1), b;
        }, ca = function(b) {
            return b && !b.usePolicyFile && (b.onid3 || b.usePeakData || b.useWaveformData || b.useEQData) && (b.usePolicyFile = !0), 
            b;
        }, la = function() {
            return !1;
        }, Pa = function(b) {
            for (var c in b) b.hasOwnProperty(c) && "function" == typeof b[c] && (b[c] = la);
        }, xa = function(b) {
            b === h && (b = !1), (y || b) && c.disable(b);
        }, Qa = function(b) {
            var e = null;
            if (b) if (b.match(/\.swf(\?.*)?$/i)) {
                if (e = b.substr(b.toLowerCase().lastIndexOf(".swf?") + 4)) return b;
            } else b.lastIndexOf("/") !== b.length - 1 && (b += "/");
            return b = (b && -1 !== b.lastIndexOf("/") ? b.substr(0, b.lastIndexOf("/") + 1) : "./") + c.movieURL, 
            c.noSWFCache && (b += "?ts=" + new Date().getTime()), b;
        }, ra = function() {
            n = parseInt(c.flashVersion, 10), 8 !== n && 9 !== n && (c.flashVersion = n = 8);
            var b = c.debugMode || c.debugFlash ? "_debug.swf" : ".swf";
            c.useHTML5Audio && !c.html5Only && c.audioFormats.mp4.required && 9 > n && (c.flashVersion = n = 9), 
            c.version = c.versionNumber + (c.html5Only ? " (HTML5-only mode)" : 9 === n ? " (AS3/Flash 9)" : " (AS2/Flash 8)"), 
            n > 8 ? (c.defaultOptions = w(c.defaultOptions, c.flash9Options), c.features.buffering = !0, 
            c.defaultOptions = w(c.defaultOptions, c.movieStarOptions), c.filePatterns.flash9 = RegExp("\\.(mp3|" + eb.join("|") + ")(\\?.*)?$", "i"), 
            c.features.movieStar = !0) : c.features.movieStar = !1, c.filePattern = c.filePatterns[8 !== n ? "flash9" : "flash8"], 
            c.movieURL = (8 === n ? "soundmanager2.swf" : "soundmanager2_flash9.swf").replace(".swf", b), 
            c.features.peakData = c.features.waveformData = c.features.eqData = n > 8;
        }, Oa = function(b, c) {
            return k ? void k._setPolling(b, c) : !1;
        }, wa = function() {}, q = this.getSoundById, K = function() {
            var b = [];
            return c.debugMode && b.push("sm2_debug"), c.debugFlash && b.push("flash_debug"), 
            c.useHighPerformance && b.push("high_performance"), b.join(" ");
        }, za = function() {
            R("fbHandler");
            var b = c.getMoviePercent(), e = {
                type: "FLASHBLOCK"
            };
            return c.html5Only ? !1 : void (c.ok() ? c.oMC && (c.oMC.className = [ K(), "movieContainer", "swf_loaded" + (c.didFlashBlock ? " swf_unblocked" : "") ].join(" ")) : (u && (c.oMC.className = K() + " movieContainer " + (null === b ? "swf_timedout" : "swf_error")), 
            c.didFlashBlock = !0, D({
                type: "ontimeout",
                ignoreInit: !0,
                error: e
            }), J(e)));
        }, pa = function(b, c, d) {
            x[b] === h && (x[b] = []), x[b].push({
                method: c,
                scope: d || null,
                fired: !1
            });
        }, D = function(b) {
            if (b || (b = {
                type: c.ok() ? "onready" : "ontimeout"
            }), !m && b && !b.ignoreInit || "ontimeout" === b.type && (c.ok() || y && !b.ignoreInit)) return !1;
            var f, e = {
                success: b && b.ignoreInit ? c.ok() : !y
            }, d = b && b.type ? x[b.type] || [] : [], a = [], e = [ e ], g = u && !c.ok();
            for (b.error && (e[0].error = b.error), b = 0, f = d.length; f > b; b++) !0 !== d[b].fired && a.push(d[b]);
            if (a.length) for (b = 0, f = a.length; f > b; b++) a[b].scope ? a[b].method.apply(a[b].scope, e) : a[b].method.apply(this, e), 
            g || (a[b].fired = !0);
            return !0;
        }, H = function() {
            g.setTimeout(function() {
                c.useFlashBlock && za(), D(), "function" == typeof c.onload && c.onload.apply(g), 
                c.waitForWindowLoad && s.add(g, "load", H);
            }, 1);
        }, Da = function() {
            if (v !== h) return v;
            var a, b = !1, c = navigator, d = c.plugins, f = g.ActiveXObject;
            if (d && d.length) (c = c.mimeTypes) && c["application/x-shockwave-flash"] && c["application/x-shockwave-flash"].enabledPlugin && c["application/x-shockwave-flash"].enabledPlugin.description && (b = !0); else if (f !== h && !t.match(/MSAppHost/i)) {
                try {
                    a = new f("ShockwaveFlash.ShockwaveFlash");
                } catch (l) {
                    a = null;
                }
                b = !!a;
            }
            return v = b;
        }, Va = function() {
            var b, e, d = c.audioFormats;
            if (ia && t.match(/os (1|2|3_0|3_1)\s/i) ? (c.hasHTML5 = !1, c.html5Only = !0, c.oMC && (c.oMC.style.display = "none")) : !c.useHTML5Audio || c.html5 && c.html5.canPlayType || (c.hasHTML5 = !1), 
            c.useHTML5Audio && c.hasHTML5) for (e in U = !0, d) d.hasOwnProperty(e) && d[e].required && (c.html5.canPlayType(d[e].type) ? c.preferFlash && (c.flash[e] || c.flash[d[e].type]) && (b = !0) : (U = !1, 
            b = !0));
            return c.ignoreFlash && (b = !1, U = !0), c.html5Only = c.hasHTML5 && c.useHTML5Audio && !b, 
            !c.html5Only;
        }, ea = function(b) {
            var e, d, a = 0;
            if (b instanceof Array) {
                for (e = 0, d = b.length; d > e; e++) if (b[e] instanceof Object) {
                    if (c.canPlayMIME(b[e].type)) {
                        a = e;
                        break;
                    }
                } else if (c.canPlayURL(b[e])) {
                    a = e;
                    break;
                }
                b[a].url && (b[a] = b[a].url), b = b[a];
            }
            return b;
        }, Ra = function(b) {
            b._hasTimer || (b._hasTimer = !0, !Fa && c.html5PollingInterval && (null === T && 0 === da && (T = setInterval(Ta, c.html5PollingInterval)), 
            da++));
        }, Sa = function(b) {
            b._hasTimer && (b._hasTimer = !1, !Fa && c.html5PollingInterval && da--);
        }, Ta = function() {
            var b;
            if (null !== T && !da) return clearInterval(T), T = null, !1;
            for (b = c.soundIDs.length - 1; b >= 0; b--) c.sounds[c.soundIDs[b]].isHTML5 && c.sounds[c.soundIDs[b]]._hasTimer && c.sounds[c.soundIDs[b]]._onTimer();
        }, J = function(b) {
            b = b !== h ? b : {}, "function" == typeof c.onerror && c.onerror.apply(g, [ {
                type: b.type !== h ? b.type : null
            } ]), b.fatal !== h && b.fatal && c.disable();
        }, Xa = function() {
            if (!$a || !Da()) return !1;
            var e, d, b = c.audioFormats;
            for (d in b) if (b.hasOwnProperty(d) && ("mp3" === d || "mp4" === d) && (c.html5[d] = !1, 
            b[d] && b[d].related)) for (e = b[d].related.length - 1; e >= 0; e--) c.html5[b[d].related[e]] = !1;
        }, this._setSandboxType = function() {}, this._externalInterfaceOK = function() {
            return c.swfLoaded ? !1 : (c.swfLoaded = !0, ka = !1, $a && Xa(), void setTimeout(ma, C ? 100 : 1));
        }, aa = function(b, e) {
            function d(a, b) {
                return '<param name="' + a + '" value="' + b + '" />';
            }
            if (M && N) return !1;
            if (c.html5Only) return ra(), c.oMC = X(c.movieID), ma(), N = M = !0, !1;
            var m, r, q, a = e || c.url, f = c.altURL || a, g = va(), k = K(), n = null, n = p.getElementsByTagName("html")[0], n = n && n.dir && n.dir.match(/rtl/i);
            if (b = b === h ? c.id : b, ra(), c.url = Qa(Ha ? a : f), e = c.url, c.wmode = !c.wmode && c.useHighPerformance ? "transparent" : c.wmode, 
            null !== c.wmode && (t.match(/msie 8/i) || !C && !c.useHighPerformance) && navigator.platform.match(/win32|win64/i) && (Ua.push(sa.spcWmode), 
            c.wmode = null), g = {
                name: b,
                id: b,
                src: e,
                quality: "high",
                allowScriptAccess: c.allowScriptAccess,
                bgcolor: c.bgColor,
                pluginspage: cb + "www.macromedia.com/go/getflashplayer",
                title: "JS/Flash audio component (SoundManager 2)",
                type: "application/x-shockwave-flash",
                wmode: c.wmode,
                hasPriority: "true"
            }, c.debugFlash && (g.FlashVars = "debug=1"), c.wmode || delete g.wmode, C) a = p.createElement("div"), 
            r = [ '<object id="' + b + '" data="' + e + '" type="' + g.type + '" title="' + g.title + '" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="' + cb + 'download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0">', d("movie", e), d("AllowScriptAccess", c.allowScriptAccess), d("quality", g.quality), c.wmode ? d("wmode", c.wmode) : "", d("bgcolor", c.bgColor), d("hasPriority", "true"), c.debugFlash ? d("FlashVars", g.FlashVars) : "", "</object>" ].join(""); else for (m in a = p.createElement("embed"), 
            g) g.hasOwnProperty(m) && a.setAttribute(m, g[m]);
            if (wa(), k = K(), g = va()) if (c.oMC = X(c.movieID) || p.createElement("div"), 
            c.oMC.id) q = c.oMC.className, c.oMC.className = (q ? q + " " : "movieContainer") + (k ? " " + k : ""), 
            c.oMC.appendChild(a), C && (m = c.oMC.appendChild(p.createElement("div")), m.className = "sm2-object-box", 
            m.innerHTML = r), N = !0; else {
                if (c.oMC.id = c.movieID, c.oMC.className = "movieContainer " + k, m = k = null, 
                c.useFlashBlock || (c.useHighPerformance ? k = {
                    position: "fixed",
                    width: "8px",
                    height: "8px",
                    bottom: "0px",
                    left: "0px",
                    overflow: "hidden"
                } : (k = {
                    position: "absolute",
                    width: "6px",
                    height: "6px",
                    top: "-9999px",
                    left: "-9999px"
                }, n && (k.left = Math.abs(parseInt(k.left, 10)) + "px"))), gb && (c.oMC.style.zIndex = 1e4), 
                !c.debugFlash) for (q in k) k.hasOwnProperty(q) && (c.oMC.style[q] = k[q]);
                try {
                    C || c.oMC.appendChild(a), g.appendChild(c.oMC), C && (m = c.oMC.appendChild(p.createElement("div")), 
                    m.className = "sm2-object-box", m.innerHTML = r), N = !0;
                } catch (s) {
                    throw Error(R("domError") + " \n" + s.toString());
                }
            }
            return M = !0;
        }, $ = function() {
            return c.html5Only ? (aa(), !1) : k || !c.url ? !1 : (k = c.getMovie(c.id), k || (Q ? (C ? c.oMC.innerHTML = ya : c.oMC.appendChild(Q), 
            Q = null, M = !0) : aa(c.id, c.url), k = c.getMovie(c.id)), "function" == typeof c.oninitmovie && setTimeout(c.oninitmovie, 1), 
            !0);
        }, I = function() {
            setTimeout(Na, 1e3);
        }, qa = function() {
            g.setTimeout(function() {
                c.setup({
                    preferFlash: !1
                }).reboot(), c.didFlashBlock = !0, c.beginDelayedInit();
            }, 1);
        }, Na = function() {
            var b, e = !1;
            return !c.url || S ? !1 : (S = !0, s.remove(g, "load", I), v && ka && !Ga ? !1 : (m || (b = c.getMoviePercent(), 
            b > 0 && 100 > b && (e = !0)), void setTimeout(function() {
                return b = c.getMoviePercent(), e ? (S = !1, g.setTimeout(I, 1), !1) : void (!m && ab && (null === b ? c.useFlashBlock || 0 === c.flashLoadTimeout ? c.useFlashBlock && za() : !c.useFlashBlock && U ? qa() : D({
                    type: "ontimeout",
                    ignoreInit: !0,
                    error: {
                        type: "INIT_FLASHBLOCK"
                    }
                }) : 0 !== c.flashLoadTimeout && (!c.useFlashBlock && U ? qa() : xa(!0))));
            }, c.flashLoadTimeout)));
        }, Z = function() {
            return Ga || !ka ? (s.remove(g, "focus", Z), !0) : (Ga = ab = !0, S = !1, I(), s.remove(g, "focus", Z), 
            !0);
        }, O = function(b) {
            if (m) return !1;
            if (c.html5Only) return m = !0, H(), !0;
            var d, e = !0;
            return c.useFlashBlock && c.flashLoadTimeout && !c.getMoviePercent() || (m = !0), 
            d = {
                type: !v && u ? "NO_FLASH" : "INIT_TIMEOUT"
            }, (y || b) && (c.useFlashBlock && c.oMC && (c.oMC.className = K() + " " + (null === c.getMoviePercent() ? "swf_timedout" : "swf_error")), 
            D({
                type: "ontimeout",
                error: d,
                ignoreInit: !0
            }), J(d), e = !1), y || (c.waitForWindowLoad && !na ? s.add(g, "load", H) : H()), 
            e;
        }, Ma = function() {
            var b, e = c.setupOptions;
            for (b in e) e.hasOwnProperty(b) && (c[b] === h ? c[b] = e[b] : c[b] !== e[b] && (c.setupOptions[b] = c[b]));
        }, ma = function() {
            if (m) return !1;
            if (c.html5Only) return m || (s.remove(g, "load", c.beginDelayedInit), c.enabled = !0, 
            O()), !0;
            $();
            try {
                k._externalInterfaceTest(!1), Oa(!0, c.flashPollingInterval || (c.useHighPerformance ? 10 : 50)), 
                c.debugMode || k._disableDebug(), c.enabled = !0, c.html5Only || s.add(g, "unload", la);
            } catch (b) {
                return J({
                    type: "JS_TO_FLASH_EXCEPTION",
                    fatal: !0
                }), xa(!0), O(), !1;
            }
            return O(), s.remove(g, "load", c.beginDelayedInit), !0;
        }, E = function() {
            return P ? !1 : (P = !0, Ma(), wa(), !v && c.hasHTML5 && c.setup({
                useHTML5Audio: !0,
                preferFlash: !1
            }), Wa(), !v && u && (Ua.push(sa.needFlash), c.setup({
                flashLoadTimeout: 1
            })), p.removeEventListener && p.removeEventListener("DOMContentLoaded", E, !1), 
            $(), !0);
        }, Ba = function() {
            return "complete" === p.readyState && (E(), p.detachEvent("onreadystatechange", Ba)), 
            !0;
        }, ua = function() {
            na = !0, E(), s.remove(g, "load", ua);
        }, ta = function() {
            Fa && (c.setupOptions.useHTML5Audio = !0, c.setupOptions.preferFlash = !1, ia || Za && !t.match(/android\s2\.3/i)) && (ia && (c.ignoreFlash = !0), 
            A = !0);
        }, ta(), Da(), s.add(g, "focus", Z), s.add(g, "load", I), s.add(g, "load", ua), 
        p.addEventListener ? p.addEventListener("DOMContentLoaded", E, !1) : p.attachEvent ? p.attachEvent("onreadystatechange", Ba) : J({
            type: "NO_DOM2_EVENTS",
            fatal: !0
        });
    }
    if (!g || !g.document) throw Error("SoundManager requires a browser with window and document objects.");
    var F = null;
    void 0 !== g.SM2_DEFER && SM2_DEFER || (F = new G()), "object" == typeof module && module && "object" == typeof module.exports ? (g.soundManager = F, 
    module.exports.SoundManager = G, module.exports.soundManager = F) : "function" == typeof define && define.amd ? define("SoundManager", [], function() {
        return {
            SoundManager: G,
            soundManager: F
        };
    }) : (g.SoundManager = G, g.soundManager = F);
}(window), !function(a, b) {
    "object" == typeof module && "object" == typeof module.exports ? module.exports = a.document ? b(a, !0) : function(a) {
        if (!a.document) throw new Error("jQuery requires a window with a document");
        return b(a);
    } : b(a);
}("undefined" != typeof window ? window : this, function(a, b) {
    function r(a) {
        var b = a.length, c = m.type(a);
        return "function" === c || m.isWindow(a) ? !1 : 1 === a.nodeType && b ? !0 : "array" === c || 0 === b || "number" == typeof b && b > 0 && b - 1 in a;
    }
    function w(a, b, c) {
        if (m.isFunction(b)) return m.grep(a, function(a, d) {
            return !!b.call(a, d, a) !== c;
        });
        if (b.nodeType) return m.grep(a, function(a) {
            return a === b !== c;
        });
        if ("string" == typeof b) {
            if (v.test(b)) return m.filter(b, a, c);
            b = m.filter(b, a);
        }
        return m.grep(a, function(a) {
            return m.inArray(a, b) >= 0 !== c;
        });
    }
    function D(a, b) {
        do a = a[b]; while (a && 1 !== a.nodeType);
        return a;
    }
    function G(a) {
        var b = F[a] = {};
        return m.each(a.match(E) || [], function(a, c) {
            b[c] = !0;
        }), b;
    }
    function I() {
        y.addEventListener ? (y.removeEventListener("DOMContentLoaded", J, !1), a.removeEventListener("load", J, !1)) : (y.detachEvent("onreadystatechange", J), 
        a.detachEvent("onload", J));
    }
    function J() {
        (y.addEventListener || "load" === event.type || "complete" === y.readyState) && (I(), 
        m.ready());
    }
    function O(a, b, c) {
        if (void 0 === c && 1 === a.nodeType) {
            var d = "data-" + b.replace(N, "-$1").toLowerCase();
            if (c = a.getAttribute(d), "string" == typeof c) {
                try {
                    c = "true" === c ? !0 : "false" === c ? !1 : "null" === c ? null : +c + "" === c ? +c : M.test(c) ? m.parseJSON(c) : c;
                } catch (e) {}
                m.data(a, b, c);
            } else c = void 0;
        }
        return c;
    }
    function P(a) {
        var b;
        for (b in a) if (("data" !== b || !m.isEmptyObject(a[b])) && "toJSON" !== b) return !1;
        return !0;
    }
    function Q(a, b, d, e) {
        if (m.acceptData(a)) {
            var f, g, h = m.expando, i = a.nodeType, j = i ? m.cache : a, k = i ? a[h] : a[h] && h;
            if (k && j[k] && (e || j[k].data) || void 0 !== d || "string" != typeof b) return k || (k = i ? a[h] = c.pop() || m.guid++ : h), 
            j[k] || (j[k] = i ? {} : {
                toJSON: m.noop
            }), ("object" == typeof b || "function" == typeof b) && (e ? j[k] = m.extend(j[k], b) : j[k].data = m.extend(j[k].data, b)), 
            g = j[k], e || (g.data || (g.data = {}), g = g.data), void 0 !== d && (g[m.camelCase(b)] = d), 
            "string" == typeof b ? (f = g[b], null == f && (f = g[m.camelCase(b)])) : f = g, 
            f;
        }
    }
    function R(a, b, c) {
        if (m.acceptData(a)) {
            var d, e, f = a.nodeType, g = f ? m.cache : a, h = f ? a[m.expando] : m.expando;
            if (g[h]) {
                if (b && (d = c ? g[h] : g[h].data)) {
                    m.isArray(b) ? b = b.concat(m.map(b, m.camelCase)) : b in d ? b = [ b ] : (b = m.camelCase(b), 
                    b = b in d ? [ b ] : b.split(" ")), e = b.length;
                    for (;e--; ) delete d[b[e]];
                    if (c ? !P(d) : !m.isEmptyObject(d)) return;
                }
                (c || (delete g[h].data, P(g[h]))) && (f ? m.cleanData([ a ], !0) : k.deleteExpando || g != g.window ? delete g[h] : g[h] = null);
            }
        }
    }
    function ab() {
        return !0;
    }
    function bb() {
        return !1;
    }
    function cb() {
        try {
            return y.activeElement;
        } catch (a) {}
    }
    function db(a) {
        var b = eb.split("|"), c = a.createDocumentFragment();
        if (c.createElement) for (;b.length; ) c.createElement(b.pop());
        return c;
    }
    function ub(a, b) {
        var c, d, e = 0, f = typeof a.getElementsByTagName !== K ? a.getElementsByTagName(b || "*") : typeof a.querySelectorAll !== K ? a.querySelectorAll(b || "*") : void 0;
        if (!f) for (f = [], c = a.childNodes || a; null != (d = c[e]); e++) !b || m.nodeName(d, b) ? f.push(d) : m.merge(f, ub(d, b));
        return void 0 === b || b && m.nodeName(a, b) ? m.merge([ a ], f) : f;
    }
    function vb(a) {
        W.test(a.type) && (a.defaultChecked = a.checked);
    }
    function wb(a, b) {
        return m.nodeName(a, "table") && m.nodeName(11 !== b.nodeType ? b : b.firstChild, "tr") ? a.getElementsByTagName("tbody")[0] || a.appendChild(a.ownerDocument.createElement("tbody")) : a;
    }
    function xb(a) {
        return a.type = (null !== m.find.attr(a, "type")) + "/" + a.type, a;
    }
    function yb(a) {
        var b = pb.exec(a.type);
        return b ? a.type = b[1] : a.removeAttribute("type"), a;
    }
    function zb(a, b) {
        for (var c, d = 0; null != (c = a[d]); d++) m._data(c, "globalEval", !b || m._data(b[d], "globalEval"));
    }
    function Ab(a, b) {
        if (1 === b.nodeType && m.hasData(a)) {
            var c, d, e, f = m._data(a), g = m._data(b, f), h = f.events;
            if (h) {
                delete g.handle, g.events = {};
                for (c in h) for (d = 0, e = h[c].length; e > d; d++) m.event.add(b, c, h[c][d]);
            }
            g.data && (g.data = m.extend({}, g.data));
        }
    }
    function Bb(a, b) {
        var c, d, e;
        if (1 === b.nodeType) {
            if (c = b.nodeName.toLowerCase(), !k.noCloneEvent && b[m.expando]) {
                e = m._data(b);
                for (d in e.events) m.removeEvent(b, d, e.handle);
                b.removeAttribute(m.expando);
            }
            "script" === c && b.text !== a.text ? (xb(b).text = a.text, yb(b)) : "object" === c ? (b.parentNode && (b.outerHTML = a.outerHTML), 
            k.html5Clone && a.innerHTML && !m.trim(b.innerHTML) && (b.innerHTML = a.innerHTML)) : "input" === c && W.test(a.type) ? (b.defaultChecked = b.checked = a.checked, 
            b.value !== a.value && (b.value = a.value)) : "option" === c ? b.defaultSelected = b.selected = a.defaultSelected : ("input" === c || "textarea" === c) && (b.defaultValue = a.defaultValue);
        }
    }
    function Eb(b, c) {
        var d, e = m(c.createElement(b)).appendTo(c.body), f = a.getDefaultComputedStyle && (d = a.getDefaultComputedStyle(e[0])) ? d.display : m.css(e[0], "display");
        return e.detach(), f;
    }
    function Fb(a) {
        var b = y, c = Db[a];
        return c || (c = Eb(a, b), "none" !== c && c || (Cb = (Cb || m("<iframe frameborder='0' width='0' height='0'/>")).appendTo(b.documentElement), 
        b = (Cb[0].contentWindow || Cb[0].contentDocument).document, b.write(), b.close(), 
        c = Eb(a, b), Cb.detach()), Db[a] = c), c;
    }
    function Lb(a, b) {
        return {
            get: function() {
                var c = a();
                return null != c ? c ? void delete this.get : (this.get = b).apply(this, arguments) : void 0;
            }
        };
    }
    function Ub(a, b) {
        if (b in a) return b;
        for (var c = b.charAt(0).toUpperCase() + b.slice(1), d = b, e = Tb.length; e--; ) if (b = Tb[e] + c, 
        b in a) return b;
        return d;
    }
    function Vb(a, b) {
        for (var c, d, e, f = [], g = 0, h = a.length; h > g; g++) d = a[g], d.style && (f[g] = m._data(d, "olddisplay"), 
        c = d.style.display, b ? (f[g] || "none" !== c || (d.style.display = ""), "" === d.style.display && U(d) && (f[g] = m._data(d, "olddisplay", Fb(d.nodeName)))) : (e = U(d), 
        (c && "none" !== c || !e) && m._data(d, "olddisplay", e ? c : m.css(d, "display"))));
        for (g = 0; h > g; g++) d = a[g], d.style && (b && "none" !== d.style.display && "" !== d.style.display || (d.style.display = b ? f[g] || "" : "none"));
        return a;
    }
    function Wb(a, b, c) {
        var d = Pb.exec(b);
        return d ? Math.max(0, d[1] - (c || 0)) + (d[2] || "px") : b;
    }
    function Xb(a, b, c, d, e) {
        for (var f = c === (d ? "border" : "content") ? 4 : "width" === b ? 1 : 0, g = 0; 4 > f; f += 2) "margin" === c && (g += m.css(a, c + T[f], !0, e)), 
        d ? ("content" === c && (g -= m.css(a, "padding" + T[f], !0, e)), "margin" !== c && (g -= m.css(a, "border" + T[f] + "Width", !0, e))) : (g += m.css(a, "padding" + T[f], !0, e), 
        "padding" !== c && (g += m.css(a, "border" + T[f] + "Width", !0, e)));
        return g;
    }
    function Yb(a, b, c) {
        var d = !0, e = "width" === b ? a.offsetWidth : a.offsetHeight, f = Ib(a), g = k.boxSizing && "border-box" === m.css(a, "boxSizing", !1, f);
        if (0 >= e || null == e) {
            if (e = Jb(a, b, f), (0 > e || null == e) && (e = a.style[b]), Hb.test(e)) return e;
            d = g && (k.boxSizingReliable() || e === a.style[b]), e = parseFloat(e) || 0;
        }
        return e + Xb(a, b, c || (g ? "border" : "content"), d, f) + "px";
    }
    function Zb(a, b, c, d, e) {
        return new Zb.prototype.init(a, b, c, d, e);
    }
    function fc() {
        return setTimeout(function() {
            $b = void 0;
        }), $b = m.now();
    }
    function gc(a, b) {
        var c, d = {
            height: a
        }, e = 0;
        for (b = b ? 1 : 0; 4 > e; e += 2 - b) c = T[e], d["margin" + c] = d["padding" + c] = a;
        return b && (d.opacity = d.width = a), d;
    }
    function hc(a, b, c) {
        for (var d, e = (ec[b] || []).concat(ec["*"]), f = 0, g = e.length; g > f; f++) if (d = e[f].call(c, b, a)) return d;
    }
    function ic(a, b, c) {
        var d, e, f, g, h, i, j, l, n = this, o = {}, p = a.style, q = a.nodeType && U(a), r = m._data(a, "fxshow");
        c.queue || (h = m._queueHooks(a, "fx"), null == h.unqueued && (h.unqueued = 0, i = h.empty.fire, 
        h.empty.fire = function() {
            h.unqueued || i();
        }), h.unqueued++, n.always(function() {
            n.always(function() {
                h.unqueued--, m.queue(a, "fx").length || h.empty.fire();
            });
        })), 1 === a.nodeType && ("height" in b || "width" in b) && (c.overflow = [ p.overflow, p.overflowX, p.overflowY ], 
        j = m.css(a, "display"), l = "none" === j ? m._data(a, "olddisplay") || Fb(a.nodeName) : j, 
        "inline" === l && "none" === m.css(a, "float") && (k.inlineBlockNeedsLayout && "inline" !== Fb(a.nodeName) ? p.zoom = 1 : p.display = "inline-block")), 
        c.overflow && (p.overflow = "hidden", k.shrinkWrapBlocks() || n.always(function() {
            p.overflow = c.overflow[0], p.overflowX = c.overflow[1], p.overflowY = c.overflow[2];
        }));
        for (d in b) if (e = b[d], ac.exec(e)) {
            if (delete b[d], f = f || "toggle" === e, e === (q ? "hide" : "show")) {
                if ("show" !== e || !r || void 0 === r[d]) continue;
                q = !0;
            }
            o[d] = r && r[d] || m.style(a, d);
        } else j = void 0;
        if (m.isEmptyObject(o)) "inline" === ("none" === j ? Fb(a.nodeName) : j) && (p.display = j); else {
            r ? "hidden" in r && (q = r.hidden) : r = m._data(a, "fxshow", {}), f && (r.hidden = !q), 
            q ? m(a).show() : n.done(function() {
                m(a).hide();
            }), n.done(function() {
                var b;
                m._removeData(a, "fxshow");
                for (b in o) m.style(a, b, o[b]);
            });
            for (d in o) g = hc(q ? r[d] : 0, d, n), d in r || (r[d] = g.start, q && (g.end = g.start, 
            g.start = "width" === d || "height" === d ? 1 : 0));
        }
    }
    function jc(a, b) {
        var c, d, e, f, g;
        for (c in a) if (d = m.camelCase(c), e = b[d], f = a[c], m.isArray(f) && (e = f[1], 
        f = a[c] = f[0]), c !== d && (a[d] = f, delete a[c]), g = m.cssHooks[d], g && "expand" in g) {
            f = g.expand(f), delete a[d];
            for (c in f) c in a || (a[c] = f[c], b[c] = e);
        } else b[d] = e;
    }
    function kc(a, b, c) {
        var d, e, f = 0, g = dc.length, h = m.Deferred().always(function() {
            delete i.elem;
        }), i = function() {
            if (e) return !1;
            for (var b = $b || fc(), c = Math.max(0, j.startTime + j.duration - b), d = c / j.duration || 0, f = 1 - d, g = 0, i = j.tweens.length; i > g; g++) j.tweens[g].run(f);
            return h.notifyWith(a, [ j, f, c ]), 1 > f && i ? c : (h.resolveWith(a, [ j ]), 
            !1);
        }, j = h.promise({
            elem: a,
            props: m.extend({}, b),
            opts: m.extend(!0, {
                specialEasing: {}
            }, c),
            originalProperties: b,
            originalOptions: c,
            startTime: $b || fc(),
            duration: c.duration,
            tweens: [],
            createTween: function(b, c) {
                var d = m.Tween(a, j.opts, b, c, j.opts.specialEasing[b] || j.opts.easing);
                return j.tweens.push(d), d;
            },
            stop: function(b) {
                var c = 0, d = b ? j.tweens.length : 0;
                if (e) return this;
                for (e = !0; d > c; c++) j.tweens[c].run(1);
                return b ? h.resolveWith(a, [ j, b ]) : h.rejectWith(a, [ j, b ]), this;
            }
        }), k = j.props;
        for (jc(k, j.opts.specialEasing); g > f; f++) if (d = dc[f].call(j, a, k, j.opts)) return d;
        return m.map(k, hc, j), m.isFunction(j.opts.start) && j.opts.start.call(a, j), m.fx.timer(m.extend(i, {
            elem: a,
            anim: j,
            queue: j.opts.queue
        })), j.progress(j.opts.progress).done(j.opts.done, j.opts.complete).fail(j.opts.fail).always(j.opts.always);
    }
    function Lc(a) {
        return function(b, c) {
            "string" != typeof b && (c = b, b = "*");
            var d, e = 0, f = b.toLowerCase().match(E) || [];
            if (m.isFunction(c)) for (;d = f[e++]; ) "+" === d.charAt(0) ? (d = d.slice(1) || "*", 
            (a[d] = a[d] || []).unshift(c)) : (a[d] = a[d] || []).push(c);
        };
    }
    function Mc(a, b, c, d) {
        function g(h) {
            var i;
            return e[h] = !0, m.each(a[h] || [], function(a, h) {
                var j = h(b, c, d);
                return "string" != typeof j || f || e[j] ? f ? !(i = j) : void 0 : (b.dataTypes.unshift(j), 
                g(j), !1);
            }), i;
        }
        var e = {}, f = a === Ic;
        return g(b.dataTypes[0]) || !e["*"] && g("*");
    }
    function Nc(a, b) {
        var c, d, e = m.ajaxSettings.flatOptions || {};
        for (d in b) void 0 !== b[d] && ((e[d] ? a : c || (c = {}))[d] = b[d]);
        return c && m.extend(!0, a, c), a;
    }
    function Oc(a, b, c) {
        for (var d, e, f, g, h = a.contents, i = a.dataTypes; "*" === i[0]; ) i.shift(), 
        void 0 === e && (e = a.mimeType || b.getResponseHeader("Content-Type"));
        if (e) for (g in h) if (h[g] && h[g].test(e)) {
            i.unshift(g);
            break;
        }
        if (i[0] in c) f = i[0]; else {
            for (g in c) {
                if (!i[0] || a.converters[g + " " + i[0]]) {
                    f = g;
                    break;
                }
                d || (d = g);
            }
            f = f || d;
        }
        return f ? (f !== i[0] && i.unshift(f), c[f]) : void 0;
    }
    function Pc(a, b, c, d) {
        var e, f, g, h, i, j = {}, k = a.dataTypes.slice();
        if (k[1]) for (g in a.converters) j[g.toLowerCase()] = a.converters[g];
        for (f = k.shift(); f; ) if (a.responseFields[f] && (c[a.responseFields[f]] = b), 
        !i && d && a.dataFilter && (b = a.dataFilter(b, a.dataType)), i = f, f = k.shift()) if ("*" === f) f = i; else if ("*" !== i && i !== f) {
            if (g = j[i + " " + f] || j["* " + f], !g) for (e in j) if (h = e.split(" "), h[1] === f && (g = j[i + " " + h[0]] || j["* " + h[0]])) {
                g === !0 ? g = j[e] : j[e] !== !0 && (f = h[0], k.unshift(h[1]));
                break;
            }
            if (g !== !0) if (g && a["throws"]) b = g(b); else try {
                b = g(b);
            } catch (l) {
                return {
                    state: "parsererror",
                    error: g ? l : "No conversion from " + i + " to " + f
                };
            }
        }
        return {
            state: "success",
            data: b
        };
    }
    function Vc(a, b, c, d) {
        var e;
        if (m.isArray(b)) m.each(b, function(b, e) {
            c || Rc.test(a) ? d(a, e) : Vc(a + "[" + ("object" == typeof e ? b : "") + "]", e, c, d);
        }); else if (c || "object" !== m.type(b)) d(a, b); else for (e in b) Vc(a + "[" + e + "]", b[e], c, d);
    }
    function Zc() {
        try {
            return new a.XMLHttpRequest();
        } catch (b) {}
    }
    function $c() {
        try {
            return new a.ActiveXObject("Microsoft.XMLHTTP");
        } catch (b) {}
    }
    function dd(a) {
        return m.isWindow(a) ? a : 9 === a.nodeType ? a.defaultView || a.parentWindow : !1;
    }
    var c = [], d = c.slice, e = c.concat, f = c.push, g = c.indexOf, h = {}, i = h.toString, j = h.hasOwnProperty, k = {}, l = "1.11.2", m = function(a, b) {
        return new m.fn.init(a, b);
    }, n = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, o = /^-ms-/, p = /-([\da-z])/gi, q = function(a, b) {
        return b.toUpperCase();
    };
    m.fn = m.prototype = {
        jquery: l,
        constructor: m,
        selector: "",
        length: 0,
        toArray: function() {
            return d.call(this);
        },
        get: function(a) {
            return null != a ? 0 > a ? this[a + this.length] : this[a] : d.call(this);
        },
        pushStack: function(a) {
            var b = m.merge(this.constructor(), a);
            return b.prevObject = this, b.context = this.context, b;
        },
        each: function(a, b) {
            return m.each(this, a, b);
        },
        map: function(a) {
            return this.pushStack(m.map(this, function(b, c) {
                return a.call(b, c, b);
            }));
        },
        slice: function() {
            return this.pushStack(d.apply(this, arguments));
        },
        first: function() {
            return this.eq(0);
        },
        last: function() {
            return this.eq(-1);
        },
        eq: function(a) {
            var b = this.length, c = +a + (0 > a ? b : 0);
            return this.pushStack(c >= 0 && b > c ? [ this[c] ] : []);
        },
        end: function() {
            return this.prevObject || this.constructor(null);
        },
        push: f,
        sort: c.sort,
        splice: c.splice
    }, m.extend = m.fn.extend = function() {
        var a, b, c, d, e, f, g = arguments[0] || {}, h = 1, i = arguments.length, j = !1;
        for ("boolean" == typeof g && (j = g, g = arguments[h] || {}, h++), "object" == typeof g || m.isFunction(g) || (g = {}), 
        h === i && (g = this, h--); i > h; h++) if (null != (e = arguments[h])) for (d in e) a = g[d], 
        c = e[d], g !== c && (j && c && (m.isPlainObject(c) || (b = m.isArray(c))) ? (b ? (b = !1, 
        f = a && m.isArray(a) ? a : []) : f = a && m.isPlainObject(a) ? a : {}, g[d] = m.extend(j, f, c)) : void 0 !== c && (g[d] = c));
        return g;
    }, m.extend({
        expando: "jQuery" + (l + Math.random()).replace(/\D/g, ""),
        isReady: !0,
        error: function(a) {
            throw new Error(a);
        },
        noop: function() {},
        isFunction: function(a) {
            return "function" === m.type(a);
        },
        isArray: Array.isArray || function(a) {
            return "array" === m.type(a);
        },
        isWindow: function(a) {
            return null != a && a == a.window;
        },
        isNumeric: function(a) {
            return !m.isArray(a) && a - parseFloat(a) + 1 >= 0;
        },
        isEmptyObject: function(a) {
            var b;
            for (b in a) return !1;
            return !0;
        },
        isPlainObject: function(a) {
            var b;
            if (!a || "object" !== m.type(a) || a.nodeType || m.isWindow(a)) return !1;
            try {
                if (a.constructor && !j.call(a, "constructor") && !j.call(a.constructor.prototype, "isPrototypeOf")) return !1;
            } catch (c) {
                return !1;
            }
            if (k.ownLast) for (b in a) return j.call(a, b);
            for (b in a) ;
            return void 0 === b || j.call(a, b);
        },
        type: function(a) {
            return null == a ? a + "" : "object" == typeof a || "function" == typeof a ? h[i.call(a)] || "object" : typeof a;
        },
        globalEval: function(b) {
            b && m.trim(b) && (a.execScript || function(b) {
                a.eval.call(a, b);
            })(b);
        },
        camelCase: function(a) {
            return a.replace(o, "ms-").replace(p, q);
        },
        nodeName: function(a, b) {
            return a.nodeName && a.nodeName.toLowerCase() === b.toLowerCase();
        },
        each: function(a, b, c) {
            var d, e = 0, f = a.length, g = r(a);
            if (c) {
                if (g) for (;f > e && (d = b.apply(a[e], c), d !== !1); e++) ; else for (e in a) if (d = b.apply(a[e], c), 
                d === !1) break;
            } else if (g) for (;f > e && (d = b.call(a[e], e, a[e]), d !== !1); e++) ; else for (e in a) if (d = b.call(a[e], e, a[e]), 
            d === !1) break;
            return a;
        },
        trim: function(a) {
            return null == a ? "" : (a + "").replace(n, "");
        },
        makeArray: function(a, b) {
            var c = b || [];
            return null != a && (r(Object(a)) ? m.merge(c, "string" == typeof a ? [ a ] : a) : f.call(c, a)), 
            c;
        },
        inArray: function(a, b, c) {
            var d;
            if (b) {
                if (g) return g.call(b, a, c);
                for (d = b.length, c = c ? 0 > c ? Math.max(0, d + c) : c : 0; d > c; c++) if (c in b && b[c] === a) return c;
            }
            return -1;
        },
        merge: function(a, b) {
            for (var c = +b.length, d = 0, e = a.length; c > d; ) a[e++] = b[d++];
            if (c !== c) for (;void 0 !== b[d]; ) a[e++] = b[d++];
            return a.length = e, a;
        },
        grep: function(a, b, c) {
            for (var d, e = [], f = 0, g = a.length, h = !c; g > f; f++) d = !b(a[f], f), d !== h && e.push(a[f]);
            return e;
        },
        map: function(a, b, c) {
            var d, f = 0, g = a.length, h = r(a), i = [];
            if (h) for (;g > f; f++) d = b(a[f], f, c), null != d && i.push(d); else for (f in a) d = b(a[f], f, c), 
            null != d && i.push(d);
            return e.apply([], i);
        },
        guid: 1,
        proxy: function(a, b) {
            var c, e, f;
            return "string" == typeof b && (f = a[b], b = a, a = f), m.isFunction(a) ? (c = d.call(arguments, 2), 
            e = function() {
                return a.apply(b || this, c.concat(d.call(arguments)));
            }, e.guid = a.guid = a.guid || m.guid++, e) : void 0;
        },
        now: function() {
            return +new Date();
        },
        support: k
    }), m.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(a, b) {
        h["[object " + b + "]"] = b.toLowerCase();
    });
    var s = function(a) {
        function gb(a, b, d, e) {
            var f, h, j, k, l, o, r, s, w, x;
            if ((b ? b.ownerDocument || b : v) !== n && m(b), b = b || n, d = d || [], k = b.nodeType, 
            "string" != typeof a || !a || 1 !== k && 9 !== k && 11 !== k) return d;
            if (!e && p) {
                if (11 !== k && (f = _.exec(a))) if (j = f[1]) {
                    if (9 === k) {
                        if (h = b.getElementById(j), !h || !h.parentNode) return d;
                        if (h.id === j) return d.push(h), d;
                    } else if (b.ownerDocument && (h = b.ownerDocument.getElementById(j)) && t(b, h) && h.id === j) return d.push(h), 
                    d;
                } else {
                    if (f[2]) return H.apply(d, b.getElementsByTagName(a)), d;
                    if ((j = f[3]) && c.getElementsByClassName) return H.apply(d, b.getElementsByClassName(j)), 
                    d;
                }
                if (c.qsa && (!q || !q.test(a))) {
                    if (s = r = u, w = b, x = 1 !== k && a, 1 === k && "object" !== b.nodeName.toLowerCase()) {
                        for (o = g(a), (r = b.getAttribute("id")) ? s = r.replace(bb, "\\$&") : b.setAttribute("id", s), 
                        s = "[id='" + s + "'] ", l = o.length; l--; ) o[l] = s + rb(o[l]);
                        w = ab.test(a) && pb(b.parentNode) || b, x = o.join(",");
                    }
                    if (x) try {
                        return H.apply(d, w.querySelectorAll(x)), d;
                    } catch (y) {} finally {
                        r || b.removeAttribute("id");
                    }
                }
            }
            return i(a.replace(R, "$1"), b, d, e);
        }
        function hb() {
            function b(c, e) {
                return a.push(c + " ") > d.cacheLength && delete b[a.shift()], b[c + " "] = e;
            }
            var a = [];
            return b;
        }
        function ib(a) {
            return a[u] = !0, a;
        }
        function jb(a) {
            var b = n.createElement("div");
            try {
                return !!a(b);
            } catch (c) {
                return !1;
            } finally {
                b.parentNode && b.parentNode.removeChild(b), b = null;
            }
        }
        function kb(a, b) {
            for (var c = a.split("|"), e = a.length; e--; ) d.attrHandle[c[e]] = b;
        }
        function lb(a, b) {
            var c = b && a, d = c && 1 === a.nodeType && 1 === b.nodeType && (~b.sourceIndex || C) - (~a.sourceIndex || C);
            if (d) return d;
            if (c) for (;c = c.nextSibling; ) if (c === b) return -1;
            return a ? 1 : -1;
        }
        function mb(a) {
            return function(b) {
                var c = b.nodeName.toLowerCase();
                return "input" === c && b.type === a;
            };
        }
        function nb(a) {
            return function(b) {
                var c = b.nodeName.toLowerCase();
                return ("input" === c || "button" === c) && b.type === a;
            };
        }
        function ob(a) {
            return ib(function(b) {
                return b = +b, ib(function(c, d) {
                    for (var e, f = a([], c.length, b), g = f.length; g--; ) c[e = f[g]] && (c[e] = !(d[e] = c[e]));
                });
            });
        }
        function pb(a) {
            return a && "undefined" != typeof a.getElementsByTagName && a;
        }
        function qb() {}
        function rb(a) {
            for (var b = 0, c = a.length, d = ""; c > b; b++) d += a[b].value;
            return d;
        }
        function sb(a, b, c) {
            var d = b.dir, e = c && "parentNode" === d, f = x++;
            return b.first ? function(b, c, f) {
                for (;b = b[d]; ) if (1 === b.nodeType || e) return a(b, c, f);
            } : function(b, c, g) {
                var h, i, j = [ w, f ];
                if (g) {
                    for (;b = b[d]; ) if ((1 === b.nodeType || e) && a(b, c, g)) return !0;
                } else for (;b = b[d]; ) if (1 === b.nodeType || e) {
                    if (i = b[u] || (b[u] = {}), (h = i[d]) && h[0] === w && h[1] === f) return j[2] = h[2];
                    if (i[d] = j, j[2] = a(b, c, g)) return !0;
                }
            };
        }
        function tb(a) {
            return a.length > 1 ? function(b, c, d) {
                for (var e = a.length; e--; ) if (!a[e](b, c, d)) return !1;
                return !0;
            } : a[0];
        }
        function ub(a, b, c) {
            for (var d = 0, e = b.length; e > d; d++) gb(a, b[d], c);
            return c;
        }
        function vb(a, b, c, d, e) {
            for (var f, g = [], h = 0, i = a.length, j = null != b; i > h; h++) (f = a[h]) && (!c || c(f, d, e)) && (g.push(f), 
            j && b.push(h));
            return g;
        }
        function wb(a, b, c, d, e, f) {
            return d && !d[u] && (d = wb(d)), e && !e[u] && (e = wb(e, f)), ib(function(f, g, h, i) {
                var j, k, l, m = [], n = [], o = g.length, p = f || ub(b || "*", h.nodeType ? [ h ] : h, []), q = !a || !f && b ? p : vb(p, m, a, h, i), r = c ? e || (f ? a : o || d) ? [] : g : q;
                if (c && c(q, r, h, i), d) for (j = vb(r, n), d(j, [], h, i), k = j.length; k--; ) (l = j[k]) && (r[n[k]] = !(q[n[k]] = l));
                if (f) {
                    if (e || a) {
                        if (e) {
                            for (j = [], k = r.length; k--; ) (l = r[k]) && j.push(q[k] = l);
                            e(null, r = [], j, i);
                        }
                        for (k = r.length; k--; ) (l = r[k]) && (j = e ? J(f, l) : m[k]) > -1 && (f[j] = !(g[j] = l));
                    }
                } else r = vb(r === g ? r.splice(o, r.length) : r), e ? e(null, g, r, i) : H.apply(g, r);
            });
        }
        function xb(a) {
            for (var b, c, e, f = a.length, g = d.relative[a[0].type], h = g || d.relative[" "], i = g ? 1 : 0, k = sb(function(a) {
                return a === b;
            }, h, !0), l = sb(function(a) {
                return J(b, a) > -1;
            }, h, !0), m = [ function(a, c, d) {
                var e = !g && (d || c !== j) || ((b = c).nodeType ? k(a, c, d) : l(a, c, d));
                return b = null, e;
            } ]; f > i; i++) if (c = d.relative[a[i].type]) m = [ sb(tb(m), c) ]; else {
                if (c = d.filter[a[i].type].apply(null, a[i].matches), c[u]) {
                    for (e = ++i; f > e && !d.relative[a[e].type]; e++) ;
                    return wb(i > 1 && tb(m), i > 1 && rb(a.slice(0, i - 1).concat({
                        value: " " === a[i - 2].type ? "*" : ""
                    })).replace(R, "$1"), c, e > i && xb(a.slice(i, e)), f > e && xb(a = a.slice(e)), f > e && rb(a));
                }
                m.push(c);
            }
            return tb(m);
        }
        function yb(a, b) {
            var c = b.length > 0, e = a.length > 0, f = function(f, g, h, i, k) {
                var l, m, o, p = 0, q = "0", r = f && [], s = [], t = j, u = f || e && d.find.TAG("*", k), v = w += null == t ? 1 : Math.random() || .1, x = u.length;
                for (k && (j = g !== n && g); q !== x && null != (l = u[q]); q++) {
                    if (e && l) {
                        for (m = 0; o = a[m++]; ) if (o(l, g, h)) {
                            i.push(l);
                            break;
                        }
                        k && (w = v);
                    }
                    c && ((l = !o && l) && p--, f && r.push(l));
                }
                if (p += q, c && q !== p) {
                    for (m = 0; o = b[m++]; ) o(r, s, g, h);
                    if (f) {
                        if (p > 0) for (;q--; ) r[q] || s[q] || (s[q] = F.call(i));
                        s = vb(s);
                    }
                    H.apply(i, s), k && !f && s.length > 0 && p + b.length > 1 && gb.uniqueSort(i);
                }
                return k && (w = v, j = t), r;
            };
            return c ? ib(f) : f;
        }
        var b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u = "sizzle" + 1 * new Date(), v = a.document, w = 0, x = 0, y = hb(), z = hb(), A = hb(), B = function(a, b) {
            return a === b && (l = !0), 0;
        }, C = 1 << 31, D = {}.hasOwnProperty, E = [], F = E.pop, G = E.push, H = E.push, I = E.slice, J = function(a, b) {
            for (var c = 0, d = a.length; d > c; c++) if (a[c] === b) return c;
            return -1;
        }, K = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped", L = "[\\x20\\t\\r\\n\\f]", M = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+", N = M.replace("w", "w#"), O = "\\[" + L + "*(" + M + ")(?:" + L + "*([*^$|!~]?=)" + L + "*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + N + "))|)" + L + "*\\]", P = ":(" + M + ")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|" + O + ")*)|.*)\\)|)", Q = new RegExp(L + "+", "g"), R = new RegExp("^" + L + "+|((?:^|[^\\\\])(?:\\\\.)*)" + L + "+$", "g"), S = new RegExp("^" + L + "*," + L + "*"), T = new RegExp("^" + L + "*([>+~]|" + L + ")" + L + "*"), U = new RegExp("=" + L + "*([^\\]'\"]*?)" + L + "*\\]", "g"), V = new RegExp(P), W = new RegExp("^" + N + "$"), X = {
            ID: new RegExp("^#(" + M + ")"),
            CLASS: new RegExp("^\\.(" + M + ")"),
            TAG: new RegExp("^(" + M.replace("w", "w*") + ")"),
            ATTR: new RegExp("^" + O),
            PSEUDO: new RegExp("^" + P),
            CHILD: new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + L + "*(even|odd|(([+-]|)(\\d*)n|)" + L + "*(?:([+-]|)" + L + "*(\\d+)|))" + L + "*\\)|)", "i"),
            bool: new RegExp("^(?:" + K + ")$", "i"),
            needsContext: new RegExp("^" + L + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + L + "*((?:-\\d)?\\d*)" + L + "*\\)|)(?=[^-]|$)", "i")
        }, Y = /^(?:input|select|textarea|button)$/i, Z = /^h\d$/i, $ = /^[^{]+\{\s*\[native \w/, _ = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/, ab = /[+~]/, bb = /'|\\/g, cb = new RegExp("\\\\([\\da-f]{1,6}" + L + "?|(" + L + ")|.)", "ig"), db = function(a, b, c) {
            var d = "0x" + b - 65536;
            return d !== d || c ? b : 0 > d ? String.fromCharCode(d + 65536) : String.fromCharCode(d >> 10 | 55296, 1023 & d | 56320);
        }, eb = function() {
            m();
        };
        try {
            H.apply(E = I.call(v.childNodes), v.childNodes), E[v.childNodes.length].nodeType;
        } catch (fb) {
            H = {
                apply: E.length ? function(a, b) {
                    G.apply(a, I.call(b));
                } : function(a, b) {
                    for (var c = a.length, d = 0; a[c++] = b[d++]; ) ;
                    a.length = c - 1;
                }
            };
        }
        c = gb.support = {}, f = gb.isXML = function(a) {
            var b = a && (a.ownerDocument || a).documentElement;
            return b ? "HTML" !== b.nodeName : !1;
        }, m = gb.setDocument = function(a) {
            var b, e, g = a ? a.ownerDocument || a : v;
            return g !== n && 9 === g.nodeType && g.documentElement ? (n = g, o = g.documentElement, 
            e = g.defaultView, e && e !== e.top && (e.addEventListener ? e.addEventListener("unload", eb, !1) : e.attachEvent && e.attachEvent("onunload", eb)), 
            p = !f(g), c.attributes = jb(function(a) {
                return a.className = "i", !a.getAttribute("className");
            }), c.getElementsByTagName = jb(function(a) {
                return a.appendChild(g.createComment("")), !a.getElementsByTagName("*").length;
            }), c.getElementsByClassName = $.test(g.getElementsByClassName), c.getById = jb(function(a) {
                return o.appendChild(a).id = u, !g.getElementsByName || !g.getElementsByName(u).length;
            }), c.getById ? (d.find.ID = function(a, b) {
                if ("undefined" != typeof b.getElementById && p) {
                    var c = b.getElementById(a);
                    return c && c.parentNode ? [ c ] : [];
                }
            }, d.filter.ID = function(a) {
                var b = a.replace(cb, db);
                return function(a) {
                    return a.getAttribute("id") === b;
                };
            }) : (delete d.find.ID, d.filter.ID = function(a) {
                var b = a.replace(cb, db);
                return function(a) {
                    var c = "undefined" != typeof a.getAttributeNode && a.getAttributeNode("id");
                    return c && c.value === b;
                };
            }), d.find.TAG = c.getElementsByTagName ? function(a, b) {
                return "undefined" != typeof b.getElementsByTagName ? b.getElementsByTagName(a) : c.qsa ? b.querySelectorAll(a) : void 0;
            } : function(a, b) {
                var c, d = [], e = 0, f = b.getElementsByTagName(a);
                if ("*" === a) {
                    for (;c = f[e++]; ) 1 === c.nodeType && d.push(c);
                    return d;
                }
                return f;
            }, d.find.CLASS = c.getElementsByClassName && function(a, b) {
                return p ? b.getElementsByClassName(a) : void 0;
            }, r = [], q = [], (c.qsa = $.test(g.querySelectorAll)) && (jb(function(a) {
                o.appendChild(a).innerHTML = "<a id='" + u + "'></a><select id='" + u + "-\f]' msallowcapture=''><option selected=''></option></select>", 
                a.querySelectorAll("[msallowcapture^='']").length && q.push("[*^$]=" + L + "*(?:''|\"\")"), 
                a.querySelectorAll("[selected]").length || q.push("\\[" + L + "*(?:value|" + K + ")"), 
                a.querySelectorAll("[id~=" + u + "-]").length || q.push("~="), a.querySelectorAll(":checked").length || q.push(":checked"), 
                a.querySelectorAll("a#" + u + "+*").length || q.push(".#.+[+~]");
            }), jb(function(a) {
                var b = g.createElement("input");
                b.setAttribute("type", "hidden"), a.appendChild(b).setAttribute("name", "D"), a.querySelectorAll("[name=d]").length && q.push("name" + L + "*[*^$|!~]?="), 
                a.querySelectorAll(":enabled").length || q.push(":enabled", ":disabled"), a.querySelectorAll("*,:x"), 
                q.push(",.*:");
            })), (c.matchesSelector = $.test(s = o.matches || o.webkitMatchesSelector || o.mozMatchesSelector || o.oMatchesSelector || o.msMatchesSelector)) && jb(function(a) {
                c.disconnectedMatch = s.call(a, "div"), s.call(a, "[s!='']:x"), r.push("!=", P);
            }), q = q.length && new RegExp(q.join("|")), r = r.length && new RegExp(r.join("|")), 
            b = $.test(o.compareDocumentPosition), t = b || $.test(o.contains) ? function(a, b) {
                var c = 9 === a.nodeType ? a.documentElement : a, d = b && b.parentNode;
                return a === d || !(!d || 1 !== d.nodeType || !(c.contains ? c.contains(d) : a.compareDocumentPosition && 16 & a.compareDocumentPosition(d)));
            } : function(a, b) {
                if (b) for (;b = b.parentNode; ) if (b === a) return !0;
                return !1;
            }, B = b ? function(a, b) {
                if (a === b) return l = !0, 0;
                var d = !a.compareDocumentPosition - !b.compareDocumentPosition;
                return d ? d : (d = (a.ownerDocument || a) === (b.ownerDocument || b) ? a.compareDocumentPosition(b) : 1, 
                1 & d || !c.sortDetached && b.compareDocumentPosition(a) === d ? a === g || a.ownerDocument === v && t(v, a) ? -1 : b === g || b.ownerDocument === v && t(v, b) ? 1 : k ? J(k, a) - J(k, b) : 0 : 4 & d ? -1 : 1);
            } : function(a, b) {
                if (a === b) return l = !0, 0;
                var c, d = 0, e = a.parentNode, f = b.parentNode, h = [ a ], i = [ b ];
                if (!e || !f) return a === g ? -1 : b === g ? 1 : e ? -1 : f ? 1 : k ? J(k, a) - J(k, b) : 0;
                if (e === f) return lb(a, b);
                for (c = a; c = c.parentNode; ) h.unshift(c);
                for (c = b; c = c.parentNode; ) i.unshift(c);
                for (;h[d] === i[d]; ) d++;
                return d ? lb(h[d], i[d]) : h[d] === v ? -1 : i[d] === v ? 1 : 0;
            }, g) : n;
        }, gb.matches = function(a, b) {
            return gb(a, null, null, b);
        }, gb.matchesSelector = function(a, b) {
            if ((a.ownerDocument || a) !== n && m(a), b = b.replace(U, "='$1']"), !(!c.matchesSelector || !p || r && r.test(b) || q && q.test(b))) try {
                var d = s.call(a, b);
                if (d || c.disconnectedMatch || a.document && 11 !== a.document.nodeType) return d;
            } catch (e) {}
            return gb(b, n, null, [ a ]).length > 0;
        }, gb.contains = function(a, b) {
            return (a.ownerDocument || a) !== n && m(a), t(a, b);
        }, gb.attr = function(a, b) {
            (a.ownerDocument || a) !== n && m(a);
            var e = d.attrHandle[b.toLowerCase()], f = e && D.call(d.attrHandle, b.toLowerCase()) ? e(a, b, !p) : void 0;
            return void 0 !== f ? f : c.attributes || !p ? a.getAttribute(b) : (f = a.getAttributeNode(b)) && f.specified ? f.value : null;
        }, gb.error = function(a) {
            throw new Error("Syntax error, unrecognized expression: " + a);
        }, gb.uniqueSort = function(a) {
            var b, d = [], e = 0, f = 0;
            if (l = !c.detectDuplicates, k = !c.sortStable && a.slice(0), a.sort(B), l) {
                for (;b = a[f++]; ) b === a[f] && (e = d.push(f));
                for (;e--; ) a.splice(d[e], 1);
            }
            return k = null, a;
        }, e = gb.getText = function(a) {
            var b, c = "", d = 0, f = a.nodeType;
            if (f) {
                if (1 === f || 9 === f || 11 === f) {
                    if ("string" == typeof a.textContent) return a.textContent;
                    for (a = a.firstChild; a; a = a.nextSibling) c += e(a);
                } else if (3 === f || 4 === f) return a.nodeValue;
            } else for (;b = a[d++]; ) c += e(b);
            return c;
        }, d = gb.selectors = {
            cacheLength: 50,
            createPseudo: ib,
            match: X,
            attrHandle: {},
            find: {},
            relative: {
                ">": {
                    dir: "parentNode",
                    first: !0
                },
                " ": {
                    dir: "parentNode"
                },
                "+": {
                    dir: "previousSibling",
                    first: !0
                },
                "~": {
                    dir: "previousSibling"
                }
            },
            preFilter: {
                ATTR: function(a) {
                    return a[1] = a[1].replace(cb, db), a[3] = (a[3] || a[4] || a[5] || "").replace(cb, db), 
                    "~=" === a[2] && (a[3] = " " + a[3] + " "), a.slice(0, 4);
                },
                CHILD: function(a) {
                    return a[1] = a[1].toLowerCase(), "nth" === a[1].slice(0, 3) ? (a[3] || gb.error(a[0]), 
                    a[4] = +(a[4] ? a[5] + (a[6] || 1) : 2 * ("even" === a[3] || "odd" === a[3])), a[5] = +(a[7] + a[8] || "odd" === a[3])) : a[3] && gb.error(a[0]), 
                    a;
                },
                PSEUDO: function(a) {
                    var b, c = !a[6] && a[2];
                    return X.CHILD.test(a[0]) ? null : (a[3] ? a[2] = a[4] || a[5] || "" : c && V.test(c) && (b = g(c, !0)) && (b = c.indexOf(")", c.length - b) - c.length) && (a[0] = a[0].slice(0, b), 
                    a[2] = c.slice(0, b)), a.slice(0, 3));
                }
            },
            filter: {
                TAG: function(a) {
                    var b = a.replace(cb, db).toLowerCase();
                    return "*" === a ? function() {
                        return !0;
                    } : function(a) {
                        return a.nodeName && a.nodeName.toLowerCase() === b;
                    };
                },
                CLASS: function(a) {
                    var b = y[a + " "];
                    return b || (b = new RegExp("(^|" + L + ")" + a + "(" + L + "|$)")) && y(a, function(a) {
                        return b.test("string" == typeof a.className && a.className || "undefined" != typeof a.getAttribute && a.getAttribute("class") || "");
                    });
                },
                ATTR: function(a, b, c) {
                    return function(d) {
                        var e = gb.attr(d, a);
                        return null == e ? "!=" === b : b ? (e += "", "=" === b ? e === c : "!=" === b ? e !== c : "^=" === b ? c && 0 === e.indexOf(c) : "*=" === b ? c && e.indexOf(c) > -1 : "$=" === b ? c && e.slice(-c.length) === c : "~=" === b ? (" " + e.replace(Q, " ") + " ").indexOf(c) > -1 : "|=" === b ? e === c || e.slice(0, c.length + 1) === c + "-" : !1) : !0;
                    };
                },
                CHILD: function(a, b, c, d, e) {
                    var f = "nth" !== a.slice(0, 3), g = "last" !== a.slice(-4), h = "of-type" === b;
                    return 1 === d && 0 === e ? function(a) {
                        return !!a.parentNode;
                    } : function(b, c, i) {
                        var j, k, l, m, n, o, p = f !== g ? "nextSibling" : "previousSibling", q = b.parentNode, r = h && b.nodeName.toLowerCase(), s = !i && !h;
                        if (q) {
                            if (f) {
                                for (;p; ) {
                                    for (l = b; l = l[p]; ) if (h ? l.nodeName.toLowerCase() === r : 1 === l.nodeType) return !1;
                                    o = p = "only" === a && !o && "nextSibling";
                                }
                                return !0;
                            }
                            if (o = [ g ? q.firstChild : q.lastChild ], g && s) {
                                for (k = q[u] || (q[u] = {}), j = k[a] || [], n = j[0] === w && j[1], m = j[0] === w && j[2], 
                                l = n && q.childNodes[n]; l = ++n && l && l[p] || (m = n = 0) || o.pop(); ) if (1 === l.nodeType && ++m && l === b) {
                                    k[a] = [ w, n, m ];
                                    break;
                                }
                            } else if (s && (j = (b[u] || (b[u] = {}))[a]) && j[0] === w) m = j[1]; else for (;(l = ++n && l && l[p] || (m = n = 0) || o.pop()) && ((h ? l.nodeName.toLowerCase() !== r : 1 !== l.nodeType) || !++m || (s && ((l[u] || (l[u] = {}))[a] = [ w, m ]), 
                            l !== b)); ) ;
                            return m -= e, m === d || m % d === 0 && m / d >= 0;
                        }
                    };
                },
                PSEUDO: function(a, b) {
                    var c, e = d.pseudos[a] || d.setFilters[a.toLowerCase()] || gb.error("unsupported pseudo: " + a);
                    return e[u] ? e(b) : e.length > 1 ? (c = [ a, a, "", b ], d.setFilters.hasOwnProperty(a.toLowerCase()) ? ib(function(a, c) {
                        for (var d, f = e(a, b), g = f.length; g--; ) d = J(a, f[g]), a[d] = !(c[d] = f[g]);
                    }) : function(a) {
                        return e(a, 0, c);
                    }) : e;
                }
            },
            pseudos: {
                not: ib(function(a) {
                    var b = [], c = [], d = h(a.replace(R, "$1"));
                    return d[u] ? ib(function(a, b, c, e) {
                        for (var f, g = d(a, null, e, []), h = a.length; h--; ) (f = g[h]) && (a[h] = !(b[h] = f));
                    }) : function(a, e, f) {
                        return b[0] = a, d(b, null, f, c), b[0] = null, !c.pop();
                    };
                }),
                has: ib(function(a) {
                    return function(b) {
                        return gb(a, b).length > 0;
                    };
                }),
                contains: ib(function(a) {
                    return a = a.replace(cb, db), function(b) {
                        return (b.textContent || b.innerText || e(b)).indexOf(a) > -1;
                    };
                }),
                lang: ib(function(a) {
                    return W.test(a || "") || gb.error("unsupported lang: " + a), a = a.replace(cb, db).toLowerCase(), 
                    function(b) {
                        var c;
                        do if (c = p ? b.lang : b.getAttribute("xml:lang") || b.getAttribute("lang")) return c = c.toLowerCase(), 
                        c === a || 0 === c.indexOf(a + "-"); while ((b = b.parentNode) && 1 === b.nodeType);
                        return !1;
                    };
                }),
                target: function(b) {
                    var c = a.location && a.location.hash;
                    return c && c.slice(1) === b.id;
                },
                root: function(a) {
                    return a === o;
                },
                focus: function(a) {
                    return a === n.activeElement && (!n.hasFocus || n.hasFocus()) && !!(a.type || a.href || ~a.tabIndex);
                },
                enabled: function(a) {
                    return a.disabled === !1;
                },
                disabled: function(a) {
                    return a.disabled === !0;
                },
                checked: function(a) {
                    var b = a.nodeName.toLowerCase();
                    return "input" === b && !!a.checked || "option" === b && !!a.selected;
                },
                selected: function(a) {
                    return a.parentNode && a.parentNode.selectedIndex, a.selected === !0;
                },
                empty: function(a) {
                    for (a = a.firstChild; a; a = a.nextSibling) if (a.nodeType < 6) return !1;
                    return !0;
                },
                parent: function(a) {
                    return !d.pseudos.empty(a);
                },
                header: function(a) {
                    return Z.test(a.nodeName);
                },
                input: function(a) {
                    return Y.test(a.nodeName);
                },
                button: function(a) {
                    var b = a.nodeName.toLowerCase();
                    return "input" === b && "button" === a.type || "button" === b;
                },
                text: function(a) {
                    var b;
                    return "input" === a.nodeName.toLowerCase() && "text" === a.type && (null == (b = a.getAttribute("type")) || "text" === b.toLowerCase());
                },
                first: ob(function() {
                    return [ 0 ];
                }),
                last: ob(function(a, b) {
                    return [ b - 1 ];
                }),
                eq: ob(function(a, b, c) {
                    return [ 0 > c ? c + b : c ];
                }),
                even: ob(function(a, b) {
                    for (var c = 0; b > c; c += 2) a.push(c);
                    return a;
                }),
                odd: ob(function(a, b) {
                    for (var c = 1; b > c; c += 2) a.push(c);
                    return a;
                }),
                lt: ob(function(a, b, c) {
                    for (var d = 0 > c ? c + b : c; --d >= 0; ) a.push(d);
                    return a;
                }),
                gt: ob(function(a, b, c) {
                    for (var d = 0 > c ? c + b : c; ++d < b; ) a.push(d);
                    return a;
                })
            }
        }, d.pseudos.nth = d.pseudos.eq;
        for (b in {
            radio: !0,
            checkbox: !0,
            file: !0,
            password: !0,
            image: !0
        }) d.pseudos[b] = mb(b);
        for (b in {
            submit: !0,
            reset: !0
        }) d.pseudos[b] = nb(b);
        return qb.prototype = d.filters = d.pseudos, d.setFilters = new qb(), g = gb.tokenize = function(a, b) {
            var c, e, f, g, h, i, j, k = z[a + " "];
            if (k) return b ? 0 : k.slice(0);
            for (h = a, i = [], j = d.preFilter; h; ) {
                (!c || (e = S.exec(h))) && (e && (h = h.slice(e[0].length) || h), i.push(f = [])), 
                c = !1, (e = T.exec(h)) && (c = e.shift(), f.push({
                    value: c,
                    type: e[0].replace(R, " ")
                }), h = h.slice(c.length));
                for (g in d.filter) !(e = X[g].exec(h)) || j[g] && !(e = j[g](e)) || (c = e.shift(), 
                f.push({
                    value: c,
                    type: g,
                    matches: e
                }), h = h.slice(c.length));
                if (!c) break;
            }
            return b ? h.length : h ? gb.error(a) : z(a, i).slice(0);
        }, h = gb.compile = function(a, b) {
            var c, d = [], e = [], f = A[a + " "];
            if (!f) {
                for (b || (b = g(a)), c = b.length; c--; ) f = xb(b[c]), f[u] ? d.push(f) : e.push(f);
                f = A(a, yb(e, d)), f.selector = a;
            }
            return f;
        }, i = gb.select = function(a, b, e, f) {
            var i, j, k, l, m, n = "function" == typeof a && a, o = !f && g(a = n.selector || a);
            if (e = e || [], 1 === o.length) {
                if (j = o[0] = o[0].slice(0), j.length > 2 && "ID" === (k = j[0]).type && c.getById && 9 === b.nodeType && p && d.relative[j[1].type]) {
                    if (b = (d.find.ID(k.matches[0].replace(cb, db), b) || [])[0], !b) return e;
                    n && (b = b.parentNode), a = a.slice(j.shift().value.length);
                }
                for (i = X.needsContext.test(a) ? 0 : j.length; i-- && (k = j[i], !d.relative[l = k.type]); ) if ((m = d.find[l]) && (f = m(k.matches[0].replace(cb, db), ab.test(j[0].type) && pb(b.parentNode) || b))) {
                    if (j.splice(i, 1), a = f.length && rb(j), !a) return H.apply(e, f), e;
                    break;
                }
            }
            return (n || h(a, o))(f, b, !p, e, ab.test(a) && pb(b.parentNode) || b), e;
        }, c.sortStable = u.split("").sort(B).join("") === u, c.detectDuplicates = !!l, 
        m(), c.sortDetached = jb(function(a) {
            return 1 & a.compareDocumentPosition(n.createElement("div"));
        }), jb(function(a) {
            return a.innerHTML = "<a href='#'></a>", "#" === a.firstChild.getAttribute("href");
        }) || kb("type|href|height|width", function(a, b, c) {
            return c ? void 0 : a.getAttribute(b, "type" === b.toLowerCase() ? 1 : 2);
        }), c.attributes && jb(function(a) {
            return a.innerHTML = "<input/>", a.firstChild.setAttribute("value", ""), "" === a.firstChild.getAttribute("value");
        }) || kb("value", function(a, b, c) {
            return c || "input" !== a.nodeName.toLowerCase() ? void 0 : a.defaultValue;
        }), jb(function(a) {
            return null == a.getAttribute("disabled");
        }) || kb(K, function(a, b, c) {
            var d;
            return c ? void 0 : a[b] === !0 ? b.toLowerCase() : (d = a.getAttributeNode(b)) && d.specified ? d.value : null;
        }), gb;
    }(a);
    m.find = s, m.expr = s.selectors, m.expr[":"] = m.expr.pseudos, m.unique = s.uniqueSort, 
    m.text = s.getText, m.isXMLDoc = s.isXML, m.contains = s.contains;
    var t = m.expr.match.needsContext, u = /^<(\w+)\s*\/?>(?:<\/\1>|)$/, v = /^.[^:#\[\.,]*$/;
    m.filter = function(a, b, c) {
        var d = b[0];
        return c && (a = ":not(" + a + ")"), 1 === b.length && 1 === d.nodeType ? m.find.matchesSelector(d, a) ? [ d ] : [] : m.find.matches(a, m.grep(b, function(a) {
            return 1 === a.nodeType;
        }));
    }, m.fn.extend({
        find: function(a) {
            var b, c = [], d = this, e = d.length;
            if ("string" != typeof a) return this.pushStack(m(a).filter(function() {
                for (b = 0; e > b; b++) if (m.contains(d[b], this)) return !0;
            }));
            for (b = 0; e > b; b++) m.find(a, d[b], c);
            return c = this.pushStack(e > 1 ? m.unique(c) : c), c.selector = this.selector ? this.selector + " " + a : a, 
            c;
        },
        filter: function(a) {
            return this.pushStack(w(this, a || [], !1));
        },
        not: function(a) {
            return this.pushStack(w(this, a || [], !0));
        },
        is: function(a) {
            return !!w(this, "string" == typeof a && t.test(a) ? m(a) : a || [], !1).length;
        }
    });
    var x, y = a.document, z = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/, A = m.fn.init = function(a, b) {
        var c, d;
        if (!a) return this;
        if ("string" == typeof a) {
            if (c = "<" === a.charAt(0) && ">" === a.charAt(a.length - 1) && a.length >= 3 ? [ null, a, null ] : z.exec(a), 
            !c || !c[1] && b) return !b || b.jquery ? (b || x).find(a) : this.constructor(b).find(a);
            if (c[1]) {
                if (b = b instanceof m ? b[0] : b, m.merge(this, m.parseHTML(c[1], b && b.nodeType ? b.ownerDocument || b : y, !0)), 
                u.test(c[1]) && m.isPlainObject(b)) for (c in b) m.isFunction(this[c]) ? this[c](b[c]) : this.attr(c, b[c]);
                return this;
            }
            if (d = y.getElementById(c[2]), d && d.parentNode) {
                if (d.id !== c[2]) return x.find(a);
                this.length = 1, this[0] = d;
            }
            return this.context = y, this.selector = a, this;
        }
        return a.nodeType ? (this.context = this[0] = a, this.length = 1, this) : m.isFunction(a) ? "undefined" != typeof x.ready ? x.ready(a) : a(m) : (void 0 !== a.selector && (this.selector = a.selector, 
        this.context = a.context), m.makeArray(a, this));
    };
    A.prototype = m.fn, x = m(y);
    var B = /^(?:parents|prev(?:Until|All))/, C = {
        children: !0,
        contents: !0,
        next: !0,
        prev: !0
    };
    m.extend({
        dir: function(a, b, c) {
            for (var d = [], e = a[b]; e && 9 !== e.nodeType && (void 0 === c || 1 !== e.nodeType || !m(e).is(c)); ) 1 === e.nodeType && d.push(e), 
            e = e[b];
            return d;
        },
        sibling: function(a, b) {
            for (var c = []; a; a = a.nextSibling) 1 === a.nodeType && a !== b && c.push(a);
            return c;
        }
    }), m.fn.extend({
        has: function(a) {
            var b, c = m(a, this), d = c.length;
            return this.filter(function() {
                for (b = 0; d > b; b++) if (m.contains(this, c[b])) return !0;
            });
        },
        closest: function(a, b) {
            for (var c, d = 0, e = this.length, f = [], g = t.test(a) || "string" != typeof a ? m(a, b || this.context) : 0; e > d; d++) for (c = this[d]; c && c !== b; c = c.parentNode) if (c.nodeType < 11 && (g ? g.index(c) > -1 : 1 === c.nodeType && m.find.matchesSelector(c, a))) {
                f.push(c);
                break;
            }
            return this.pushStack(f.length > 1 ? m.unique(f) : f);
        },
        index: function(a) {
            return a ? "string" == typeof a ? m.inArray(this[0], m(a)) : m.inArray(a.jquery ? a[0] : a, this) : this[0] && this[0].parentNode ? this.first().prevAll().length : -1;
        },
        add: function(a, b) {
            return this.pushStack(m.unique(m.merge(this.get(), m(a, b))));
        },
        addBack: function(a) {
            return this.add(null == a ? this.prevObject : this.prevObject.filter(a));
        }
    }), m.each({
        parent: function(a) {
            var b = a.parentNode;
            return b && 11 !== b.nodeType ? b : null;
        },
        parents: function(a) {
            return m.dir(a, "parentNode");
        },
        parentsUntil: function(a, b, c) {
            return m.dir(a, "parentNode", c);
        },
        next: function(a) {
            return D(a, "nextSibling");
        },
        prev: function(a) {
            return D(a, "previousSibling");
        },
        nextAll: function(a) {
            return m.dir(a, "nextSibling");
        },
        prevAll: function(a) {
            return m.dir(a, "previousSibling");
        },
        nextUntil: function(a, b, c) {
            return m.dir(a, "nextSibling", c);
        },
        prevUntil: function(a, b, c) {
            return m.dir(a, "previousSibling", c);
        },
        siblings: function(a) {
            return m.sibling((a.parentNode || {}).firstChild, a);
        },
        children: function(a) {
            return m.sibling(a.firstChild);
        },
        contents: function(a) {
            return m.nodeName(a, "iframe") ? a.contentDocument || a.contentWindow.document : m.merge([], a.childNodes);
        }
    }, function(a, b) {
        m.fn[a] = function(c, d) {
            var e = m.map(this, b, c);
            return "Until" !== a.slice(-5) && (d = c), d && "string" == typeof d && (e = m.filter(d, e)), 
            this.length > 1 && (C[a] || (e = m.unique(e)), B.test(a) && (e = e.reverse())), 
            this.pushStack(e);
        };
    });
    var E = /\S+/g, F = {};
    m.Callbacks = function(a) {
        a = "string" == typeof a ? F[a] || G(a) : m.extend({}, a);
        var b, c, d, e, f, g, h = [], i = !a.once && [], j = function(l) {
            for (c = a.memory && l, d = !0, f = g || 0, g = 0, e = h.length, b = !0; h && e > f; f++) if (h[f].apply(l[0], l[1]) === !1 && a.stopOnFalse) {
                c = !1;
                break;
            }
            b = !1, h && (i ? i.length && j(i.shift()) : c ? h = [] : k.disable());
        }, k = {
            add: function() {
                if (h) {
                    var d = h.length;
                    !function f(b) {
                        m.each(b, function(b, c) {
                            var d = m.type(c);
                            "function" === d ? a.unique && k.has(c) || h.push(c) : c && c.length && "string" !== d && f(c);
                        });
                    }(arguments), b ? e = h.length : c && (g = d, j(c));
                }
                return this;
            },
            remove: function() {
                return h && m.each(arguments, function(a, c) {
                    for (var d; (d = m.inArray(c, h, d)) > -1; ) h.splice(d, 1), b && (e >= d && e--, 
                    f >= d && f--);
                }), this;
            },
            has: function(a) {
                return a ? m.inArray(a, h) > -1 : !(!h || !h.length);
            },
            empty: function() {
                return h = [], e = 0, this;
            },
            disable: function() {
                return h = i = c = void 0, this;
            },
            disabled: function() {
                return !h;
            },
            lock: function() {
                return i = void 0, c || k.disable(), this;
            },
            locked: function() {
                return !i;
            },
            fireWith: function(a, c) {
                return !h || d && !i || (c = c || [], c = [ a, c.slice ? c.slice() : c ], b ? i.push(c) : j(c)), 
                this;
            },
            fire: function() {
                return k.fireWith(this, arguments), this;
            },
            fired: function() {
                return !!d;
            }
        };
        return k;
    }, m.extend({
        Deferred: function(a) {
            var b = [ [ "resolve", "done", m.Callbacks("once memory"), "resolved" ], [ "reject", "fail", m.Callbacks("once memory"), "rejected" ], [ "notify", "progress", m.Callbacks("memory") ] ], c = "pending", d = {
                state: function() {
                    return c;
                },
                always: function() {
                    return e.done(arguments).fail(arguments), this;
                },
                then: function() {
                    var a = arguments;
                    return m.Deferred(function(c) {
                        m.each(b, function(b, f) {
                            var g = m.isFunction(a[b]) && a[b];
                            e[f[1]](function() {
                                var a = g && g.apply(this, arguments);
                                a && m.isFunction(a.promise) ? a.promise().done(c.resolve).fail(c.reject).progress(c.notify) : c[f[0] + "With"](this === d ? c.promise() : this, g ? [ a ] : arguments);
                            });
                        }), a = null;
                    }).promise();
                },
                promise: function(a) {
                    return null != a ? m.extend(a, d) : d;
                }
            }, e = {};
            return d.pipe = d.then, m.each(b, function(a, f) {
                var g = f[2], h = f[3];
                d[f[1]] = g.add, h && g.add(function() {
                    c = h;
                }, b[1 ^ a][2].disable, b[2][2].lock), e[f[0]] = function() {
                    return e[f[0] + "With"](this === e ? d : this, arguments), this;
                }, e[f[0] + "With"] = g.fireWith;
            }), d.promise(e), a && a.call(e, e), e;
        },
        when: function(a) {
            var i, j, k, b = 0, c = d.call(arguments), e = c.length, f = 1 !== e || a && m.isFunction(a.promise) ? e : 0, g = 1 === f ? a : m.Deferred(), h = function(a, b, c) {
                return function(e) {
                    b[a] = this, c[a] = arguments.length > 1 ? d.call(arguments) : e, c === i ? g.notifyWith(b, c) : --f || g.resolveWith(b, c);
                };
            };
            if (e > 1) for (i = new Array(e), j = new Array(e), k = new Array(e); e > b; b++) c[b] && m.isFunction(c[b].promise) ? c[b].promise().done(h(b, k, c)).fail(g.reject).progress(h(b, j, i)) : --f;
            return f || g.resolveWith(k, c), g.promise();
        }
    });
    var H;
    m.fn.ready = function(a) {
        return m.ready.promise().done(a), this;
    }, m.extend({
        isReady: !1,
        readyWait: 1,
        holdReady: function(a) {
            a ? m.readyWait++ : m.ready(!0);
        },
        ready: function(a) {
            if (a === !0 ? !--m.readyWait : !m.isReady) {
                if (!y.body) return setTimeout(m.ready);
                m.isReady = !0, a !== !0 && --m.readyWait > 0 || (H.resolveWith(y, [ m ]), m.fn.triggerHandler && (m(y).triggerHandler("ready"), 
                m(y).off("ready")));
            }
        }
    }), m.ready.promise = function(b) {
        if (!H) if (H = m.Deferred(), "complete" === y.readyState) setTimeout(m.ready); else if (y.addEventListener) y.addEventListener("DOMContentLoaded", J, !1), 
        a.addEventListener("load", J, !1); else {
            y.attachEvent("onreadystatechange", J), a.attachEvent("onload", J);
            var c = !1;
            try {
                c = null == a.frameElement && y.documentElement;
            } catch (d) {}
            c && c.doScroll && !function e() {
                if (!m.isReady) {
                    try {
                        c.doScroll("left");
                    } catch (a) {
                        return setTimeout(e, 50);
                    }
                    I(), m.ready();
                }
            }();
        }
        return H.promise(b);
    };
    var L, K = "undefined";
    for (L in m(k)) break;
    k.ownLast = "0" !== L, k.inlineBlockNeedsLayout = !1, m(function() {
        var a, b, c, d;
        c = y.getElementsByTagName("body")[0], c && c.style && (b = y.createElement("div"), 
        d = y.createElement("div"), d.style.cssText = "position:absolute;border:0;width:0;height:0;top:0;left:-9999px", 
        c.appendChild(d).appendChild(b), typeof b.style.zoom !== K && (b.style.cssText = "display:inline;margin:0;border:0;padding:1px;width:1px;zoom:1", 
        k.inlineBlockNeedsLayout = a = 3 === b.offsetWidth, a && (c.style.zoom = 1)), c.removeChild(d));
    }), function() {
        var a = y.createElement("div");
        if (null == k.deleteExpando) {
            k.deleteExpando = !0;
            try {
                delete a.test;
            } catch (b) {
                k.deleteExpando = !1;
            }
        }
        a = null;
    }(), m.acceptData = function(a) {
        var b = m.noData[(a.nodeName + " ").toLowerCase()], c = +a.nodeType || 1;
        return 1 !== c && 9 !== c ? !1 : !b || b !== !0 && a.getAttribute("classid") === b;
    };
    var M = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/, N = /([A-Z])/g;
    m.extend({
        cache: {},
        noData: {
            "applet ": !0,
            "embed ": !0,
            "object ": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
        },
        hasData: function(a) {
            return a = a.nodeType ? m.cache[a[m.expando]] : a[m.expando], !!a && !P(a);
        },
        data: function(a, b, c) {
            return Q(a, b, c);
        },
        removeData: function(a, b) {
            return R(a, b);
        },
        _data: function(a, b, c) {
            return Q(a, b, c, !0);
        },
        _removeData: function(a, b) {
            return R(a, b, !0);
        }
    }), m.fn.extend({
        data: function(a, b) {
            var c, d, e, f = this[0], g = f && f.attributes;
            if (void 0 === a) {
                if (this.length && (e = m.data(f), 1 === f.nodeType && !m._data(f, "parsedAttrs"))) {
                    for (c = g.length; c--; ) g[c] && (d = g[c].name, 0 === d.indexOf("data-") && (d = m.camelCase(d.slice(5)), 
                    O(f, d, e[d])));
                    m._data(f, "parsedAttrs", !0);
                }
                return e;
            }
            return "object" == typeof a ? this.each(function() {
                m.data(this, a);
            }) : arguments.length > 1 ? this.each(function() {
                m.data(this, a, b);
            }) : f ? O(f, a, m.data(f, a)) : void 0;
        },
        removeData: function(a) {
            return this.each(function() {
                m.removeData(this, a);
            });
        }
    }), m.extend({
        queue: function(a, b, c) {
            var d;
            return a ? (b = (b || "fx") + "queue", d = m._data(a, b), c && (!d || m.isArray(c) ? d = m._data(a, b, m.makeArray(c)) : d.push(c)), 
            d || []) : void 0;
        },
        dequeue: function(a, b) {
            b = b || "fx";
            var c = m.queue(a, b), d = c.length, e = c.shift(), f = m._queueHooks(a, b), g = function() {
                m.dequeue(a, b);
            };
            "inprogress" === e && (e = c.shift(), d--), e && ("fx" === b && c.unshift("inprogress"), 
            delete f.stop, e.call(a, g, f)), !d && f && f.empty.fire();
        },
        _queueHooks: function(a, b) {
            var c = b + "queueHooks";
            return m._data(a, c) || m._data(a, c, {
                empty: m.Callbacks("once memory").add(function() {
                    m._removeData(a, b + "queue"), m._removeData(a, c);
                })
            });
        }
    }), m.fn.extend({
        queue: function(a, b) {
            var c = 2;
            return "string" != typeof a && (b = a, a = "fx", c--), arguments.length < c ? m.queue(this[0], a) : void 0 === b ? this : this.each(function() {
                var c = m.queue(this, a, b);
                m._queueHooks(this, a), "fx" === a && "inprogress" !== c[0] && m.dequeue(this, a);
            });
        },
        dequeue: function(a) {
            return this.each(function() {
                m.dequeue(this, a);
            });
        },
        clearQueue: function(a) {
            return this.queue(a || "fx", []);
        },
        promise: function(a, b) {
            var c, d = 1, e = m.Deferred(), f = this, g = this.length, h = function() {
                --d || e.resolveWith(f, [ f ]);
            };
            for ("string" != typeof a && (b = a, a = void 0), a = a || "fx"; g--; ) c = m._data(f[g], a + "queueHooks"), 
            c && c.empty && (d++, c.empty.add(h));
            return h(), e.promise(b);
        }
    });
    var S = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source, T = [ "Top", "Right", "Bottom", "Left" ], U = function(a, b) {
        return a = b || a, "none" === m.css(a, "display") || !m.contains(a.ownerDocument, a);
    }, V = m.access = function(a, b, c, d, e, f, g) {
        var h = 0, i = a.length, j = null == c;
        if ("object" === m.type(c)) {
            e = !0;
            for (h in c) m.access(a, b, h, c[h], !0, f, g);
        } else if (void 0 !== d && (e = !0, m.isFunction(d) || (g = !0), j && (g ? (b.call(a, d), 
        b = null) : (j = b, b = function(a, b, c) {
            return j.call(m(a), c);
        })), b)) for (;i > h; h++) b(a[h], c, g ? d : d.call(a[h], h, b(a[h], c)));
        return e ? a : j ? b.call(a) : i ? b(a[0], c) : f;
    }, W = /^(?:checkbox|radio)$/i;
    !function() {
        var a = y.createElement("input"), b = y.createElement("div"), c = y.createDocumentFragment();
        if (b.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>", 
        k.leadingWhitespace = 3 === b.firstChild.nodeType, k.tbody = !b.getElementsByTagName("tbody").length, 
        k.htmlSerialize = !!b.getElementsByTagName("link").length, k.html5Clone = "<:nav></:nav>" !== y.createElement("nav").cloneNode(!0).outerHTML, 
        a.type = "checkbox", a.checked = !0, c.appendChild(a), k.appendChecked = a.checked, 
        b.innerHTML = "<textarea>x</textarea>", k.noCloneChecked = !!b.cloneNode(!0).lastChild.defaultValue, 
        c.appendChild(b), b.innerHTML = "<input type='radio' checked='checked' name='t'/>", 
        k.checkClone = b.cloneNode(!0).cloneNode(!0).lastChild.checked, k.noCloneEvent = !0, 
        b.attachEvent && (b.attachEvent("onclick", function() {
            k.noCloneEvent = !1;
        }), b.cloneNode(!0).click()), null == k.deleteExpando) {
            k.deleteExpando = !0;
            try {
                delete b.test;
            } catch (d) {
                k.deleteExpando = !1;
            }
        }
    }(), function() {
        var b, c, d = y.createElement("div");
        for (b in {
            submit: !0,
            change: !0,
            focusin: !0
        }) c = "on" + b, (k[b + "Bubbles"] = c in a) || (d.setAttribute(c, "t"), k[b + "Bubbles"] = d.attributes[c].expando === !1);
        d = null;
    }();
    var X = /^(?:input|select|textarea)$/i, Y = /^key/, Z = /^(?:mouse|pointer|contextmenu)|click/, $ = /^(?:focusinfocus|focusoutblur)$/, _ = /^([^.]*)(?:\.(.+)|)$/;
    m.event = {
        global: {},
        add: function(a, b, c, d, e) {
            var f, g, h, i, j, k, l, n, o, p, q, r = m._data(a);
            if (r) {
                for (c.handler && (i = c, c = i.handler, e = i.selector), c.guid || (c.guid = m.guid++), 
                (g = r.events) || (g = r.events = {}), (k = r.handle) || (k = r.handle = function(a) {
                    return typeof m === K || a && m.event.triggered === a.type ? void 0 : m.event.dispatch.apply(k.elem, arguments);
                }, k.elem = a), b = (b || "").match(E) || [ "" ], h = b.length; h--; ) f = _.exec(b[h]) || [], 
                o = q = f[1], p = (f[2] || "").split(".").sort(), o && (j = m.event.special[o] || {}, 
                o = (e ? j.delegateType : j.bindType) || o, j = m.event.special[o] || {}, l = m.extend({
                    type: o,
                    origType: q,
                    data: d,
                    handler: c,
                    guid: c.guid,
                    selector: e,
                    needsContext: e && m.expr.match.needsContext.test(e),
                    namespace: p.join(".")
                }, i), (n = g[o]) || (n = g[o] = [], n.delegateCount = 0, j.setup && j.setup.call(a, d, p, k) !== !1 || (a.addEventListener ? a.addEventListener(o, k, !1) : a.attachEvent && a.attachEvent("on" + o, k))), 
                j.add && (j.add.call(a, l), l.handler.guid || (l.handler.guid = c.guid)), e ? n.splice(n.delegateCount++, 0, l) : n.push(l), 
                m.event.global[o] = !0);
                a = null;
            }
        },
        remove: function(a, b, c, d, e) {
            var f, g, h, i, j, k, l, n, o, p, q, r = m.hasData(a) && m._data(a);
            if (r && (k = r.events)) {
                for (b = (b || "").match(E) || [ "" ], j = b.length; j--; ) if (h = _.exec(b[j]) || [], 
                o = q = h[1], p = (h[2] || "").split(".").sort(), o) {
                    for (l = m.event.special[o] || {}, o = (d ? l.delegateType : l.bindType) || o, n = k[o] || [], 
                    h = h[2] && new RegExp("(^|\\.)" + p.join("\\.(?:.*\\.|)") + "(\\.|$)"), i = f = n.length; f--; ) g = n[f], 
                    !e && q !== g.origType || c && c.guid !== g.guid || h && !h.test(g.namespace) || d && d !== g.selector && ("**" !== d || !g.selector) || (n.splice(f, 1), 
                    g.selector && n.delegateCount--, l.remove && l.remove.call(a, g));
                    i && !n.length && (l.teardown && l.teardown.call(a, p, r.handle) !== !1 || m.removeEvent(a, o, r.handle), 
                    delete k[o]);
                } else for (o in k) m.event.remove(a, o + b[j], c, d, !0);
                m.isEmptyObject(k) && (delete r.handle, m._removeData(a, "events"));
            }
        },
        trigger: function(b, c, d, e) {
            var f, g, h, i, k, l, n, o = [ d || y ], p = j.call(b, "type") ? b.type : b, q = j.call(b, "namespace") ? b.namespace.split(".") : [];
            if (h = l = d = d || y, 3 !== d.nodeType && 8 !== d.nodeType && !$.test(p + m.event.triggered) && (p.indexOf(".") >= 0 && (q = p.split("."), 
            p = q.shift(), q.sort()), g = p.indexOf(":") < 0 && "on" + p, b = b[m.expando] ? b : new m.Event(p, "object" == typeof b && b), 
            b.isTrigger = e ? 2 : 3, b.namespace = q.join("."), b.namespace_re = b.namespace ? new RegExp("(^|\\.)" + q.join("\\.(?:.*\\.|)") + "(\\.|$)") : null, 
            b.result = void 0, b.target || (b.target = d), c = null == c ? [ b ] : m.makeArray(c, [ b ]), 
            k = m.event.special[p] || {}, e || !k.trigger || k.trigger.apply(d, c) !== !1)) {
                if (!e && !k.noBubble && !m.isWindow(d)) {
                    for (i = k.delegateType || p, $.test(i + p) || (h = h.parentNode); h; h = h.parentNode) o.push(h), 
                    l = h;
                    l === (d.ownerDocument || y) && o.push(l.defaultView || l.parentWindow || a);
                }
                for (n = 0; (h = o[n++]) && !b.isPropagationStopped(); ) b.type = n > 1 ? i : k.bindType || p, 
                f = (m._data(h, "events") || {})[b.type] && m._data(h, "handle"), f && f.apply(h, c), 
                f = g && h[g], f && f.apply && m.acceptData(h) && (b.result = f.apply(h, c), b.result === !1 && b.preventDefault());
                if (b.type = p, !e && !b.isDefaultPrevented() && (!k._default || k._default.apply(o.pop(), c) === !1) && m.acceptData(d) && g && d[p] && !m.isWindow(d)) {
                    l = d[g], l && (d[g] = null), m.event.triggered = p;
                    try {
                        d[p]();
                    } catch (r) {}
                    m.event.triggered = void 0, l && (d[g] = l);
                }
                return b.result;
            }
        },
        dispatch: function(a) {
            a = m.event.fix(a);
            var b, c, e, f, g, h = [], i = d.call(arguments), j = (m._data(this, "events") || {})[a.type] || [], k = m.event.special[a.type] || {};
            if (i[0] = a, a.delegateTarget = this, !k.preDispatch || k.preDispatch.call(this, a) !== !1) {
                for (h = m.event.handlers.call(this, a, j), b = 0; (f = h[b++]) && !a.isPropagationStopped(); ) for (a.currentTarget = f.elem, 
                g = 0; (e = f.handlers[g++]) && !a.isImmediatePropagationStopped(); ) (!a.namespace_re || a.namespace_re.test(e.namespace)) && (a.handleObj = e, 
                a.data = e.data, c = ((m.event.special[e.origType] || {}).handle || e.handler).apply(f.elem, i), 
                void 0 !== c && (a.result = c) === !1 && (a.preventDefault(), a.stopPropagation()));
                return k.postDispatch && k.postDispatch.call(this, a), a.result;
            }
        },
        handlers: function(a, b) {
            var c, d, e, f, g = [], h = b.delegateCount, i = a.target;
            if (h && i.nodeType && (!a.button || "click" !== a.type)) for (;i != this; i = i.parentNode || this) if (1 === i.nodeType && (i.disabled !== !0 || "click" !== a.type)) {
                for (e = [], f = 0; h > f; f++) d = b[f], c = d.selector + " ", void 0 === e[c] && (e[c] = d.needsContext ? m(c, this).index(i) >= 0 : m.find(c, this, null, [ i ]).length), 
                e[c] && e.push(d);
                e.length && g.push({
                    elem: i,
                    handlers: e
                });
            }
            return h < b.length && g.push({
                elem: this,
                handlers: b.slice(h)
            }), g;
        },
        fix: function(a) {
            if (a[m.expando]) return a;
            var b, c, d, e = a.type, f = a, g = this.fixHooks[e];
            for (g || (this.fixHooks[e] = g = Z.test(e) ? this.mouseHooks : Y.test(e) ? this.keyHooks : {}), 
            d = g.props ? this.props.concat(g.props) : this.props, a = new m.Event(f), b = d.length; b--; ) c = d[b], 
            a[c] = f[c];
            return a.target || (a.target = f.srcElement || y), 3 === a.target.nodeType && (a.target = a.target.parentNode), 
            a.metaKey = !!a.metaKey, g.filter ? g.filter(a, f) : a;
        },
        props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),
        fixHooks: {},
        keyHooks: {
            props: "char charCode key keyCode".split(" "),
            filter: function(a, b) {
                return null == a.which && (a.which = null != b.charCode ? b.charCode : b.keyCode), 
                a;
            }
        },
        mouseHooks: {
            props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
            filter: function(a, b) {
                var c, d, e, f = b.button, g = b.fromElement;
                return null == a.pageX && null != b.clientX && (d = a.target.ownerDocument || y, 
                e = d.documentElement, c = d.body, a.pageX = b.clientX + (e && e.scrollLeft || c && c.scrollLeft || 0) - (e && e.clientLeft || c && c.clientLeft || 0), 
                a.pageY = b.clientY + (e && e.scrollTop || c && c.scrollTop || 0) - (e && e.clientTop || c && c.clientTop || 0)), 
                !a.relatedTarget && g && (a.relatedTarget = g === a.target ? b.toElement : g), a.which || void 0 === f || (a.which = 1 & f ? 1 : 2 & f ? 3 : 4 & f ? 2 : 0), 
                a;
            }
        },
        special: {
            load: {
                noBubble: !0
            },
            focus: {
                trigger: function() {
                    if (this !== cb() && this.focus) try {
                        return this.focus(), !1;
                    } catch (a) {}
                },
                delegateType: "focusin"
            },
            blur: {
                trigger: function() {
                    return this === cb() && this.blur ? (this.blur(), !1) : void 0;
                },
                delegateType: "focusout"
            },
            click: {
                trigger: function() {
                    return m.nodeName(this, "input") && "checkbox" === this.type && this.click ? (this.click(), 
                    !1) : void 0;
                },
                _default: function(a) {
                    return m.nodeName(a.target, "a");
                }
            },
            beforeunload: {
                postDispatch: function(a) {
                    void 0 !== a.result && a.originalEvent && (a.originalEvent.returnValue = a.result);
                }
            }
        },
        simulate: function(a, b, c, d) {
            var e = m.extend(new m.Event(), c, {
                type: a,
                isSimulated: !0,
                originalEvent: {}
            });
            d ? m.event.trigger(e, null, b) : m.event.dispatch.call(b, e), e.isDefaultPrevented() && c.preventDefault();
        }
    }, m.removeEvent = y.removeEventListener ? function(a, b, c) {
        a.removeEventListener && a.removeEventListener(b, c, !1);
    } : function(a, b, c) {
        var d = "on" + b;
        a.detachEvent && (typeof a[d] === K && (a[d] = null), a.detachEvent(d, c));
    }, m.Event = function(a, b) {
        return this instanceof m.Event ? (a && a.type ? (this.originalEvent = a, this.type = a.type, 
        this.isDefaultPrevented = a.defaultPrevented || void 0 === a.defaultPrevented && a.returnValue === !1 ? ab : bb) : this.type = a, 
        b && m.extend(this, b), this.timeStamp = a && a.timeStamp || m.now(), void (this[m.expando] = !0)) : new m.Event(a, b);
    }, m.Event.prototype = {
        isDefaultPrevented: bb,
        isPropagationStopped: bb,
        isImmediatePropagationStopped: bb,
        preventDefault: function() {
            var a = this.originalEvent;
            this.isDefaultPrevented = ab, a && (a.preventDefault ? a.preventDefault() : a.returnValue = !1);
        },
        stopPropagation: function() {
            var a = this.originalEvent;
            this.isPropagationStopped = ab, a && (a.stopPropagation && a.stopPropagation(), 
            a.cancelBubble = !0);
        },
        stopImmediatePropagation: function() {
            var a = this.originalEvent;
            this.isImmediatePropagationStopped = ab, a && a.stopImmediatePropagation && a.stopImmediatePropagation(), 
            this.stopPropagation();
        }
    }, m.each({
        mouseenter: "mouseover",
        mouseleave: "mouseout",
        pointerenter: "pointerover",
        pointerleave: "pointerout"
    }, function(a, b) {
        m.event.special[a] = {
            delegateType: b,
            bindType: b,
            handle: function(a) {
                var c, d = this, e = a.relatedTarget, f = a.handleObj;
                return (!e || e !== d && !m.contains(d, e)) && (a.type = f.origType, c = f.handler.apply(this, arguments), 
                a.type = b), c;
            }
        };
    }), k.submitBubbles || (m.event.special.submit = {
        setup: function() {
            return m.nodeName(this, "form") ? !1 : void m.event.add(this, "click._submit keypress._submit", function(a) {
                var b = a.target, c = m.nodeName(b, "input") || m.nodeName(b, "button") ? b.form : void 0;
                c && !m._data(c, "submitBubbles") && (m.event.add(c, "submit._submit", function(a) {
                    a._submit_bubble = !0;
                }), m._data(c, "submitBubbles", !0));
            });
        },
        postDispatch: function(a) {
            a._submit_bubble && (delete a._submit_bubble, this.parentNode && !a.isTrigger && m.event.simulate("submit", this.parentNode, a, !0));
        },
        teardown: function() {
            return m.nodeName(this, "form") ? !1 : void m.event.remove(this, "._submit");
        }
    }), k.changeBubbles || (m.event.special.change = {
        setup: function() {
            return X.test(this.nodeName) ? (("checkbox" === this.type || "radio" === this.type) && (m.event.add(this, "propertychange._change", function(a) {
                "checked" === a.originalEvent.propertyName && (this._just_changed = !0);
            }), m.event.add(this, "click._change", function(a) {
                this._just_changed && !a.isTrigger && (this._just_changed = !1), m.event.simulate("change", this, a, !0);
            })), !1) : void m.event.add(this, "beforeactivate._change", function(a) {
                var b = a.target;
                X.test(b.nodeName) && !m._data(b, "changeBubbles") && (m.event.add(b, "change._change", function(a) {
                    !this.parentNode || a.isSimulated || a.isTrigger || m.event.simulate("change", this.parentNode, a, !0);
                }), m._data(b, "changeBubbles", !0));
            });
        },
        handle: function(a) {
            var b = a.target;
            return this !== b || a.isSimulated || a.isTrigger || "radio" !== b.type && "checkbox" !== b.type ? a.handleObj.handler.apply(this, arguments) : void 0;
        },
        teardown: function() {
            return m.event.remove(this, "._change"), !X.test(this.nodeName);
        }
    }), k.focusinBubbles || m.each({
        focus: "focusin",
        blur: "focusout"
    }, function(a, b) {
        var c = function(a) {
            m.event.simulate(b, a.target, m.event.fix(a), !0);
        };
        m.event.special[b] = {
            setup: function() {
                var d = this.ownerDocument || this, e = m._data(d, b);
                e || d.addEventListener(a, c, !0), m._data(d, b, (e || 0) + 1);
            },
            teardown: function() {
                var d = this.ownerDocument || this, e = m._data(d, b) - 1;
                e ? m._data(d, b, e) : (d.removeEventListener(a, c, !0), m._removeData(d, b));
            }
        };
    }), m.fn.extend({
        on: function(a, b, c, d, e) {
            var f, g;
            if ("object" == typeof a) {
                "string" != typeof b && (c = c || b, b = void 0);
                for (f in a) this.on(f, b, c, a[f], e);
                return this;
            }
            if (null == c && null == d ? (d = b, c = b = void 0) : null == d && ("string" == typeof b ? (d = c, 
            c = void 0) : (d = c, c = b, b = void 0)), d === !1) d = bb; else if (!d) return this;
            return 1 === e && (g = d, d = function(a) {
                return m().off(a), g.apply(this, arguments);
            }, d.guid = g.guid || (g.guid = m.guid++)), this.each(function() {
                m.event.add(this, a, d, c, b);
            });
        },
        one: function(a, b, c, d) {
            return this.on(a, b, c, d, 1);
        },
        off: function(a, b, c) {
            var d, e;
            if (a && a.preventDefault && a.handleObj) return d = a.handleObj, m(a.delegateTarget).off(d.namespace ? d.origType + "." + d.namespace : d.origType, d.selector, d.handler), 
            this;
            if ("object" == typeof a) {
                for (e in a) this.off(e, b, a[e]);
                return this;
            }
            return (b === !1 || "function" == typeof b) && (c = b, b = void 0), c === !1 && (c = bb), 
            this.each(function() {
                m.event.remove(this, a, c, b);
            });
        },
        trigger: function(a, b) {
            return this.each(function() {
                m.event.trigger(a, b, this);
            });
        },
        triggerHandler: function(a, b) {
            var c = this[0];
            return c ? m.event.trigger(a, b, c, !0) : void 0;
        }
    });
    var eb = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video", fb = / jQuery\d+="(?:null|\d+)"/g, gb = new RegExp("<(?:" + eb + ")[\\s/>]", "i"), hb = /^\s+/, ib = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi, jb = /<([\w:]+)/, kb = /<tbody/i, lb = /<|&#?\w+;/, mb = /<(?:script|style|link)/i, nb = /checked\s*(?:[^=]|=\s*.checked.)/i, ob = /^$|\/(?:java|ecma)script/i, pb = /^true\/(.*)/, qb = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g, rb = {
        option: [ 1, "<select multiple='multiple'>", "</select>" ],
        legend: [ 1, "<fieldset>", "</fieldset>" ],
        area: [ 1, "<map>", "</map>" ],
        param: [ 1, "<object>", "</object>" ],
        thead: [ 1, "<table>", "</table>" ],
        tr: [ 2, "<table><tbody>", "</tbody></table>" ],
        col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
        td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
        _default: k.htmlSerialize ? [ 0, "", "" ] : [ 1, "X<div>", "</div>" ]
    }, sb = db(y), tb = sb.appendChild(y.createElement("div"));
    rb.optgroup = rb.option, rb.tbody = rb.tfoot = rb.colgroup = rb.caption = rb.thead, 
    rb.th = rb.td, m.extend({
        clone: function(a, b, c) {
            var d, e, f, g, h, i = m.contains(a.ownerDocument, a);
            if (k.html5Clone || m.isXMLDoc(a) || !gb.test("<" + a.nodeName + ">") ? f = a.cloneNode(!0) : (tb.innerHTML = a.outerHTML, 
            tb.removeChild(f = tb.firstChild)), !(k.noCloneEvent && k.noCloneChecked || 1 !== a.nodeType && 11 !== a.nodeType || m.isXMLDoc(a))) for (d = ub(f), 
            h = ub(a), g = 0; null != (e = h[g]); ++g) d[g] && Bb(e, d[g]);
            if (b) if (c) for (h = h || ub(a), d = d || ub(f), g = 0; null != (e = h[g]); g++) Ab(e, d[g]); else Ab(a, f);
            return d = ub(f, "script"), d.length > 0 && zb(d, !i && ub(a, "script")), d = h = e = null, 
            f;
        },
        buildFragment: function(a, b, c, d) {
            for (var e, f, g, h, i, j, l, n = a.length, o = db(b), p = [], q = 0; n > q; q++) if (f = a[q], 
            f || 0 === f) if ("object" === m.type(f)) m.merge(p, f.nodeType ? [ f ] : f); else if (lb.test(f)) {
                for (h = h || o.appendChild(b.createElement("div")), i = (jb.exec(f) || [ "", "" ])[1].toLowerCase(), 
                l = rb[i] || rb._default, h.innerHTML = l[1] + f.replace(ib, "<$1></$2>") + l[2], 
                e = l[0]; e--; ) h = h.lastChild;
                if (!k.leadingWhitespace && hb.test(f) && p.push(b.createTextNode(hb.exec(f)[0])), 
                !k.tbody) for (f = "table" !== i || kb.test(f) ? "<table>" !== l[1] || kb.test(f) ? 0 : h : h.firstChild, 
                e = f && f.childNodes.length; e--; ) m.nodeName(j = f.childNodes[e], "tbody") && !j.childNodes.length && f.removeChild(j);
                for (m.merge(p, h.childNodes), h.textContent = ""; h.firstChild; ) h.removeChild(h.firstChild);
                h = o.lastChild;
            } else p.push(b.createTextNode(f));
            for (h && o.removeChild(h), k.appendChecked || m.grep(ub(p, "input"), vb), q = 0; f = p[q++]; ) if ((!d || -1 === m.inArray(f, d)) && (g = m.contains(f.ownerDocument, f), 
            h = ub(o.appendChild(f), "script"), g && zb(h), c)) for (e = 0; f = h[e++]; ) ob.test(f.type || "") && c.push(f);
            return h = null, o;
        },
        cleanData: function(a, b) {
            for (var d, e, f, g, h = 0, i = m.expando, j = m.cache, l = k.deleteExpando, n = m.event.special; null != (d = a[h]); h++) if ((b || m.acceptData(d)) && (f = d[i], 
            g = f && j[f])) {
                if (g.events) for (e in g.events) n[e] ? m.event.remove(d, e) : m.removeEvent(d, e, g.handle);
                j[f] && (delete j[f], l ? delete d[i] : typeof d.removeAttribute !== K ? d.removeAttribute(i) : d[i] = null, 
                c.push(f));
            }
        }
    }), m.fn.extend({
        text: function(a) {
            return V(this, function(a) {
                return void 0 === a ? m.text(this) : this.empty().append((this[0] && this[0].ownerDocument || y).createTextNode(a));
            }, null, a, arguments.length);
        },
        append: function() {
            return this.domManip(arguments, function(a) {
                if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
                    var b = wb(this, a);
                    b.appendChild(a);
                }
            });
        },
        prepend: function() {
            return this.domManip(arguments, function(a) {
                if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
                    var b = wb(this, a);
                    b.insertBefore(a, b.firstChild);
                }
            });
        },
        before: function() {
            return this.domManip(arguments, function(a) {
                this.parentNode && this.parentNode.insertBefore(a, this);
            });
        },
        after: function() {
            return this.domManip(arguments, function(a) {
                this.parentNode && this.parentNode.insertBefore(a, this.nextSibling);
            });
        },
        remove: function(a, b) {
            for (var c, d = a ? m.filter(a, this) : this, e = 0; null != (c = d[e]); e++) b || 1 !== c.nodeType || m.cleanData(ub(c)), 
            c.parentNode && (b && m.contains(c.ownerDocument, c) && zb(ub(c, "script")), c.parentNode.removeChild(c));
            return this;
        },
        empty: function() {
            for (var a, b = 0; null != (a = this[b]); b++) {
                for (1 === a.nodeType && m.cleanData(ub(a, !1)); a.firstChild; ) a.removeChild(a.firstChild);
                a.options && m.nodeName(a, "select") && (a.options.length = 0);
            }
            return this;
        },
        clone: function(a, b) {
            return a = null == a ? !1 : a, b = null == b ? a : b, this.map(function() {
                return m.clone(this, a, b);
            });
        },
        html: function(a) {
            return V(this, function(a) {
                var b = this[0] || {}, c = 0, d = this.length;
                if (void 0 === a) return 1 === b.nodeType ? b.innerHTML.replace(fb, "") : void 0;
                if (!("string" != typeof a || mb.test(a) || !k.htmlSerialize && gb.test(a) || !k.leadingWhitespace && hb.test(a) || rb[(jb.exec(a) || [ "", "" ])[1].toLowerCase()])) {
                    a = a.replace(ib, "<$1></$2>");
                    try {
                        for (;d > c; c++) b = this[c] || {}, 1 === b.nodeType && (m.cleanData(ub(b, !1)), 
                        b.innerHTML = a);
                        b = 0;
                    } catch (e) {}
                }
                b && this.empty().append(a);
            }, null, a, arguments.length);
        },
        replaceWith: function() {
            var a = arguments[0];
            return this.domManip(arguments, function(b) {
                a = this.parentNode, m.cleanData(ub(this)), a && a.replaceChild(b, this);
            }), a && (a.length || a.nodeType) ? this : this.remove();
        },
        detach: function(a) {
            return this.remove(a, !0);
        },
        domManip: function(a, b) {
            a = e.apply([], a);
            var c, d, f, g, h, i, j = 0, l = this.length, n = this, o = l - 1, p = a[0], q = m.isFunction(p);
            if (q || l > 1 && "string" == typeof p && !k.checkClone && nb.test(p)) return this.each(function(c) {
                var d = n.eq(c);
                q && (a[0] = p.call(this, c, d.html())), d.domManip(a, b);
            });
            if (l && (i = m.buildFragment(a, this[0].ownerDocument, !1, this), c = i.firstChild, 
            1 === i.childNodes.length && (i = c), c)) {
                for (g = m.map(ub(i, "script"), xb), f = g.length; l > j; j++) d = i, j !== o && (d = m.clone(d, !0, !0), 
                f && m.merge(g, ub(d, "script"))), b.call(this[j], d, j);
                if (f) for (h = g[g.length - 1].ownerDocument, m.map(g, yb), j = 0; f > j; j++) d = g[j], 
                ob.test(d.type || "") && !m._data(d, "globalEval") && m.contains(h, d) && (d.src ? m._evalUrl && m._evalUrl(d.src) : m.globalEval((d.text || d.textContent || d.innerHTML || "").replace(qb, "")));
                i = c = null;
            }
            return this;
        }
    }), m.each({
        appendTo: "append",
        prependTo: "prepend",
        insertBefore: "before",
        insertAfter: "after",
        replaceAll: "replaceWith"
    }, function(a, b) {
        m.fn[a] = function(a) {
            for (var c, d = 0, e = [], g = m(a), h = g.length - 1; h >= d; d++) c = d === h ? this : this.clone(!0), 
            m(g[d])[b](c), f.apply(e, c.get());
            return this.pushStack(e);
        };
    });
    var Cb, Db = {};
    !function() {
        var a;
        k.shrinkWrapBlocks = function() {
            if (null != a) return a;
            a = !1;
            var b, c, d;
            return c = y.getElementsByTagName("body")[0], c && c.style ? (b = y.createElement("div"), 
            d = y.createElement("div"), d.style.cssText = "position:absolute;border:0;width:0;height:0;top:0;left:-9999px", 
            c.appendChild(d).appendChild(b), typeof b.style.zoom !== K && (b.style.cssText = "-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:1px;width:1px;zoom:1", 
            b.appendChild(y.createElement("div")).style.width = "5px", a = 3 !== b.offsetWidth), 
            c.removeChild(d), a) : void 0;
        };
    }();
    var Ib, Jb, Gb = /^margin/, Hb = new RegExp("^(" + S + ")(?!px)[a-z%]+$", "i"), Kb = /^(top|right|bottom|left)$/;
    a.getComputedStyle ? (Ib = function(b) {
        return b.ownerDocument.defaultView.opener ? b.ownerDocument.defaultView.getComputedStyle(b, null) : a.getComputedStyle(b, null);
    }, Jb = function(a, b, c) {
        var d, e, f, g, h = a.style;
        return c = c || Ib(a), g = c ? c.getPropertyValue(b) || c[b] : void 0, c && ("" !== g || m.contains(a.ownerDocument, a) || (g = m.style(a, b)), 
        Hb.test(g) && Gb.test(b) && (d = h.width, e = h.minWidth, f = h.maxWidth, h.minWidth = h.maxWidth = h.width = g, 
        g = c.width, h.width = d, h.minWidth = e, h.maxWidth = f)), void 0 === g ? g : g + "";
    }) : y.documentElement.currentStyle && (Ib = function(a) {
        return a.currentStyle;
    }, Jb = function(a, b, c) {
        var d, e, f, g, h = a.style;
        return c = c || Ib(a), g = c ? c[b] : void 0, null == g && h && h[b] && (g = h[b]), 
        Hb.test(g) && !Kb.test(b) && (d = h.left, e = a.runtimeStyle, f = e && e.left, f && (e.left = a.currentStyle.left), 
        h.left = "fontSize" === b ? "1em" : g, g = h.pixelLeft + "px", h.left = d, f && (e.left = f)), 
        void 0 === g ? g : g + "" || "auto";
    }), !function() {
        function i() {
            var b, c, d, i;
            c = y.getElementsByTagName("body")[0], c && c.style && (b = y.createElement("div"), 
            d = y.createElement("div"), d.style.cssText = "position:absolute;border:0;width:0;height:0;top:0;left:-9999px", 
            c.appendChild(d).appendChild(b), b.style.cssText = "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;display:block;margin-top:1%;top:1%;border:1px;padding:1px;width:4px;position:absolute", 
            e = f = !1, h = !0, a.getComputedStyle && (e = "1%" !== (a.getComputedStyle(b, null) || {}).top, 
            f = "4px" === (a.getComputedStyle(b, null) || {
                width: "4px"
            }).width, i = b.appendChild(y.createElement("div")), i.style.cssText = b.style.cssText = "-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:0", 
            i.style.marginRight = i.style.width = "0", b.style.width = "1px", h = !parseFloat((a.getComputedStyle(i, null) || {}).marginRight), 
            b.removeChild(i)), b.innerHTML = "<table><tr><td></td><td>t</td></tr></table>", 
            i = b.getElementsByTagName("td"), i[0].style.cssText = "margin:0;border:0;padding:0;display:none", 
            g = 0 === i[0].offsetHeight, g && (i[0].style.display = "", i[1].style.display = "none", 
            g = 0 === i[0].offsetHeight), c.removeChild(d));
        }
        var b, c, d, e, f, g, h;
        b = y.createElement("div"), b.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>", 
        d = b.getElementsByTagName("a")[0], (c = d && d.style) && (c.cssText = "float:left;opacity:.5", 
        k.opacity = "0.5" === c.opacity, k.cssFloat = !!c.cssFloat, b.style.backgroundClip = "content-box", 
        b.cloneNode(!0).style.backgroundClip = "", k.clearCloneStyle = "content-box" === b.style.backgroundClip, 
        k.boxSizing = "" === c.boxSizing || "" === c.MozBoxSizing || "" === c.WebkitBoxSizing, 
        m.extend(k, {
            reliableHiddenOffsets: function() {
                return null == g && i(), g;
            },
            boxSizingReliable: function() {
                return null == f && i(), f;
            },
            pixelPosition: function() {
                return null == e && i(), e;
            },
            reliableMarginRight: function() {
                return null == h && i(), h;
            }
        }));
    }(), m.swap = function(a, b, c, d) {
        var e, f, g = {};
        for (f in b) g[f] = a.style[f], a.style[f] = b[f];
        e = c.apply(a, d || []);
        for (f in b) a.style[f] = g[f];
        return e;
    };
    var Mb = /alpha\([^)]*\)/i, Nb = /opacity\s*=\s*([^)]*)/, Ob = /^(none|table(?!-c[ea]).+)/, Pb = new RegExp("^(" + S + ")(.*)$", "i"), Qb = new RegExp("^([+-])=(" + S + ")", "i"), Rb = {
        position: "absolute",
        visibility: "hidden",
        display: "block"
    }, Sb = {
        letterSpacing: "0",
        fontWeight: "400"
    }, Tb = [ "Webkit", "O", "Moz", "ms" ];
    m.extend({
        cssHooks: {
            opacity: {
                get: function(a, b) {
                    if (b) {
                        var c = Jb(a, "opacity");
                        return "" === c ? "1" : c;
                    }
                }
            }
        },
        cssNumber: {
            columnCount: !0,
            fillOpacity: !0,
            flexGrow: !0,
            flexShrink: !0,
            fontWeight: !0,
            lineHeight: !0,
            opacity: !0,
            order: !0,
            orphans: !0,
            widows: !0,
            zIndex: !0,
            zoom: !0
        },
        cssProps: {
            "float": k.cssFloat ? "cssFloat" : "styleFloat"
        },
        style: function(a, b, c, d) {
            if (a && 3 !== a.nodeType && 8 !== a.nodeType && a.style) {
                var e, f, g, h = m.camelCase(b), i = a.style;
                if (b = m.cssProps[h] || (m.cssProps[h] = Ub(i, h)), g = m.cssHooks[b] || m.cssHooks[h], 
                void 0 === c) return g && "get" in g && void 0 !== (e = g.get(a, !1, d)) ? e : i[b];
                if (f = typeof c, "string" === f && (e = Qb.exec(c)) && (c = (e[1] + 1) * e[2] + parseFloat(m.css(a, b)), 
                f = "number"), null != c && c === c && ("number" !== f || m.cssNumber[h] || (c += "px"), 
                k.clearCloneStyle || "" !== c || 0 !== b.indexOf("background") || (i[b] = "inherit"), 
                !(g && "set" in g && void 0 === (c = g.set(a, c, d))))) try {
                    i[b] = c;
                } catch (j) {}
            }
        },
        css: function(a, b, c, d) {
            var e, f, g, h = m.camelCase(b);
            return b = m.cssProps[h] || (m.cssProps[h] = Ub(a.style, h)), g = m.cssHooks[b] || m.cssHooks[h], 
            g && "get" in g && (f = g.get(a, !0, c)), void 0 === f && (f = Jb(a, b, d)), "normal" === f && b in Sb && (f = Sb[b]), 
            "" === c || c ? (e = parseFloat(f), c === !0 || m.isNumeric(e) ? e || 0 : f) : f;
        }
    }), m.each([ "height", "width" ], function(a, b) {
        m.cssHooks[b] = {
            get: function(a, c, d) {
                return c ? Ob.test(m.css(a, "display")) && 0 === a.offsetWidth ? m.swap(a, Rb, function() {
                    return Yb(a, b, d);
                }) : Yb(a, b, d) : void 0;
            },
            set: function(a, c, d) {
                var e = d && Ib(a);
                return Wb(a, c, d ? Xb(a, b, d, k.boxSizing && "border-box" === m.css(a, "boxSizing", !1, e), e) : 0);
            }
        };
    }), k.opacity || (m.cssHooks.opacity = {
        get: function(a, b) {
            return Nb.test((b && a.currentStyle ? a.currentStyle.filter : a.style.filter) || "") ? .01 * parseFloat(RegExp.$1) + "" : b ? "1" : "";
        },
        set: function(a, b) {
            var c = a.style, d = a.currentStyle, e = m.isNumeric(b) ? "alpha(opacity=" + 100 * b + ")" : "", f = d && d.filter || c.filter || "";
            c.zoom = 1, (b >= 1 || "" === b) && "" === m.trim(f.replace(Mb, "")) && c.removeAttribute && (c.removeAttribute("filter"), 
            "" === b || d && !d.filter) || (c.filter = Mb.test(f) ? f.replace(Mb, e) : f + " " + e);
        }
    }), m.cssHooks.marginRight = Lb(k.reliableMarginRight, function(a, b) {
        return b ? m.swap(a, {
            display: "inline-block"
        }, Jb, [ a, "marginRight" ]) : void 0;
    }), m.each({
        margin: "",
        padding: "",
        border: "Width"
    }, function(a, b) {
        m.cssHooks[a + b] = {
            expand: function(c) {
                for (var d = 0, e = {}, f = "string" == typeof c ? c.split(" ") : [ c ]; 4 > d; d++) e[a + T[d] + b] = f[d] || f[d - 2] || f[0];
                return e;
            }
        }, Gb.test(a) || (m.cssHooks[a + b].set = Wb);
    }), m.fn.extend({
        css: function(a, b) {
            return V(this, function(a, b, c) {
                var d, e, f = {}, g = 0;
                if (m.isArray(b)) {
                    for (d = Ib(a), e = b.length; e > g; g++) f[b[g]] = m.css(a, b[g], !1, d);
                    return f;
                }
                return void 0 !== c ? m.style(a, b, c) : m.css(a, b);
            }, a, b, arguments.length > 1);
        },
        show: function() {
            return Vb(this, !0);
        },
        hide: function() {
            return Vb(this);
        },
        toggle: function(a) {
            return "boolean" == typeof a ? a ? this.show() : this.hide() : this.each(function() {
                U(this) ? m(this).show() : m(this).hide();
            });
        }
    }), m.Tween = Zb, Zb.prototype = {
        constructor: Zb,
        init: function(a, b, c, d, e, f) {
            this.elem = a, this.prop = c, this.easing = e || "swing", this.options = b, this.start = this.now = this.cur(), 
            this.end = d, this.unit = f || (m.cssNumber[c] ? "" : "px");
        },
        cur: function() {
            var a = Zb.propHooks[this.prop];
            return a && a.get ? a.get(this) : Zb.propHooks._default.get(this);
        },
        run: function(a) {
            var b, c = Zb.propHooks[this.prop];
            return this.pos = b = this.options.duration ? m.easing[this.easing](a, this.options.duration * a, 0, 1, this.options.duration) : a, 
            this.now = (this.end - this.start) * b + this.start, this.options.step && this.options.step.call(this.elem, this.now, this), 
            c && c.set ? c.set(this) : Zb.propHooks._default.set(this), this;
        }
    }, Zb.prototype.init.prototype = Zb.prototype, Zb.propHooks = {
        _default: {
            get: function(a) {
                var b;
                return null == a.elem[a.prop] || a.elem.style && null != a.elem.style[a.prop] ? (b = m.css(a.elem, a.prop, ""), 
                b && "auto" !== b ? b : 0) : a.elem[a.prop];
            },
            set: function(a) {
                m.fx.step[a.prop] ? m.fx.step[a.prop](a) : a.elem.style && (null != a.elem.style[m.cssProps[a.prop]] || m.cssHooks[a.prop]) ? m.style(a.elem, a.prop, a.now + a.unit) : a.elem[a.prop] = a.now;
            }
        }
    }, Zb.propHooks.scrollTop = Zb.propHooks.scrollLeft = {
        set: function(a) {
            a.elem.nodeType && a.elem.parentNode && (a.elem[a.prop] = a.now);
        }
    }, m.easing = {
        linear: function(a) {
            return a;
        },
        swing: function(a) {
            return .5 - Math.cos(a * Math.PI) / 2;
        }
    }, m.fx = Zb.prototype.init, m.fx.step = {};
    var $b, _b, ac = /^(?:toggle|show|hide)$/, bc = new RegExp("^(?:([+-])=|)(" + S + ")([a-z%]*)$", "i"), cc = /queueHooks$/, dc = [ ic ], ec = {
        "*": [ function(a, b) {
            var c = this.createTween(a, b), d = c.cur(), e = bc.exec(b), f = e && e[3] || (m.cssNumber[a] ? "" : "px"), g = (m.cssNumber[a] || "px" !== f && +d) && bc.exec(m.css(c.elem, a)), h = 1, i = 20;
            if (g && g[3] !== f) {
                f = f || g[3], e = e || [], g = +d || 1;
                do h = h || ".5", g /= h, m.style(c.elem, a, g + f); while (h !== (h = c.cur() / d) && 1 !== h && --i);
            }
            return e && (g = c.start = +g || +d || 0, c.unit = f, c.end = e[1] ? g + (e[1] + 1) * e[2] : +e[2]), 
            c;
        } ]
    };
    m.Animation = m.extend(kc, {
        tweener: function(a, b) {
            m.isFunction(a) ? (b = a, a = [ "*" ]) : a = a.split(" ");
            for (var c, d = 0, e = a.length; e > d; d++) c = a[d], ec[c] = ec[c] || [], ec[c].unshift(b);
        },
        prefilter: function(a, b) {
            b ? dc.unshift(a) : dc.push(a);
        }
    }), m.speed = function(a, b, c) {
        var d = a && "object" == typeof a ? m.extend({}, a) : {
            complete: c || !c && b || m.isFunction(a) && a,
            duration: a,
            easing: c && b || b && !m.isFunction(b) && b
        };
        return d.duration = m.fx.off ? 0 : "number" == typeof d.duration ? d.duration : d.duration in m.fx.speeds ? m.fx.speeds[d.duration] : m.fx.speeds._default, 
        (null == d.queue || d.queue === !0) && (d.queue = "fx"), d.old = d.complete, d.complete = function() {
            m.isFunction(d.old) && d.old.call(this), d.queue && m.dequeue(this, d.queue);
        }, d;
    }, m.fn.extend({
        fadeTo: function(a, b, c, d) {
            return this.filter(U).css("opacity", 0).show().end().animate({
                opacity: b
            }, a, c, d);
        },
        animate: function(a, b, c, d) {
            var e = m.isEmptyObject(a), f = m.speed(b, c, d), g = function() {
                var b = kc(this, m.extend({}, a), f);
                (e || m._data(this, "finish")) && b.stop(!0);
            };
            return g.finish = g, e || f.queue === !1 ? this.each(g) : this.queue(f.queue, g);
        },
        stop: function(a, b, c) {
            var d = function(a) {
                var b = a.stop;
                delete a.stop, b(c);
            };
            return "string" != typeof a && (c = b, b = a, a = void 0), b && a !== !1 && this.queue(a || "fx", []), 
            this.each(function() {
                var b = !0, e = null != a && a + "queueHooks", f = m.timers, g = m._data(this);
                if (e) g[e] && g[e].stop && d(g[e]); else for (e in g) g[e] && g[e].stop && cc.test(e) && d(g[e]);
                for (e = f.length; e--; ) f[e].elem !== this || null != a && f[e].queue !== a || (f[e].anim.stop(c), 
                b = !1, f.splice(e, 1));
                (b || !c) && m.dequeue(this, a);
            });
        },
        finish: function(a) {
            return a !== !1 && (a = a || "fx"), this.each(function() {
                var b, c = m._data(this), d = c[a + "queue"], e = c[a + "queueHooks"], f = m.timers, g = d ? d.length : 0;
                for (c.finish = !0, m.queue(this, a, []), e && e.stop && e.stop.call(this, !0), 
                b = f.length; b--; ) f[b].elem === this && f[b].queue === a && (f[b].anim.stop(!0), 
                f.splice(b, 1));
                for (b = 0; g > b; b++) d[b] && d[b].finish && d[b].finish.call(this);
                delete c.finish;
            });
        }
    }), m.each([ "toggle", "show", "hide" ], function(a, b) {
        var c = m.fn[b];
        m.fn[b] = function(a, d, e) {
            return null == a || "boolean" == typeof a ? c.apply(this, arguments) : this.animate(gc(b, !0), a, d, e);
        };
    }), m.each({
        slideDown: gc("show"),
        slideUp: gc("hide"),
        slideToggle: gc("toggle"),
        fadeIn: {
            opacity: "show"
        },
        fadeOut: {
            opacity: "hide"
        },
        fadeToggle: {
            opacity: "toggle"
        }
    }, function(a, b) {
        m.fn[a] = function(a, c, d) {
            return this.animate(b, a, c, d);
        };
    }), m.timers = [], m.fx.tick = function() {
        var a, b = m.timers, c = 0;
        for ($b = m.now(); c < b.length; c++) a = b[c], a() || b[c] !== a || b.splice(c--, 1);
        b.length || m.fx.stop(), $b = void 0;
    }, m.fx.timer = function(a) {
        m.timers.push(a), a() ? m.fx.start() : m.timers.pop();
    }, m.fx.interval = 13, m.fx.start = function() {
        _b || (_b = setInterval(m.fx.tick, m.fx.interval));
    }, m.fx.stop = function() {
        clearInterval(_b), _b = null;
    }, m.fx.speeds = {
        slow: 600,
        fast: 200,
        _default: 400
    }, m.fn.delay = function(a, b) {
        return a = m.fx ? m.fx.speeds[a] || a : a, b = b || "fx", this.queue(b, function(b, c) {
            var d = setTimeout(b, a);
            c.stop = function() {
                clearTimeout(d);
            };
        });
    }, function() {
        var a, b, c, d, e;
        b = y.createElement("div"), b.setAttribute("className", "t"), b.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>", 
        d = b.getElementsByTagName("a")[0], c = y.createElement("select"), e = c.appendChild(y.createElement("option")), 
        a = b.getElementsByTagName("input")[0], d.style.cssText = "top:1px", k.getSetAttribute = "t" !== b.className, 
        k.style = /top/.test(d.getAttribute("style")), k.hrefNormalized = "/a" === d.getAttribute("href"), 
        k.checkOn = !!a.value, k.optSelected = e.selected, k.enctype = !!y.createElement("form").enctype, 
        c.disabled = !0, k.optDisabled = !e.disabled, a = y.createElement("input"), a.setAttribute("value", ""), 
        k.input = "" === a.getAttribute("value"), a.value = "t", a.setAttribute("type", "radio"), 
        k.radioValue = "t" === a.value;
    }();
    var lc = /\r/g;
    m.fn.extend({
        val: function(a) {
            var b, c, d, e = this[0];
            return arguments.length ? (d = m.isFunction(a), this.each(function(c) {
                var e;
                1 === this.nodeType && (e = d ? a.call(this, c, m(this).val()) : a, null == e ? e = "" : "number" == typeof e ? e += "" : m.isArray(e) && (e = m.map(e, function(a) {
                    return null == a ? "" : a + "";
                })), b = m.valHooks[this.type] || m.valHooks[this.nodeName.toLowerCase()], b && "set" in b && void 0 !== b.set(this, e, "value") || (this.value = e));
            })) : e ? (b = m.valHooks[e.type] || m.valHooks[e.nodeName.toLowerCase()], b && "get" in b && void 0 !== (c = b.get(e, "value")) ? c : (c = e.value, 
            "string" == typeof c ? c.replace(lc, "") : null == c ? "" : c)) : void 0;
        }
    }), m.extend({
        valHooks: {
            option: {
                get: function(a) {
                    var b = m.find.attr(a, "value");
                    return null != b ? b : m.trim(m.text(a));
                }
            },
            select: {
                get: function(a) {
                    for (var b, c, d = a.options, e = a.selectedIndex, f = "select-one" === a.type || 0 > e, g = f ? null : [], h = f ? e + 1 : d.length, i = 0 > e ? h : f ? e : 0; h > i; i++) if (c = d[i], 
                    !(!c.selected && i !== e || (k.optDisabled ? c.disabled : null !== c.getAttribute("disabled")) || c.parentNode.disabled && m.nodeName(c.parentNode, "optgroup"))) {
                        if (b = m(c).val(), f) return b;
                        g.push(b);
                    }
                    return g;
                },
                set: function(a, b) {
                    for (var c, d, e = a.options, f = m.makeArray(b), g = e.length; g--; ) if (d = e[g], 
                    m.inArray(m.valHooks.option.get(d), f) >= 0) try {
                        d.selected = c = !0;
                    } catch (h) {
                        d.scrollHeight;
                    } else d.selected = !1;
                    return c || (a.selectedIndex = -1), e;
                }
            }
        }
    }), m.each([ "radio", "checkbox" ], function() {
        m.valHooks[this] = {
            set: function(a, b) {
                return m.isArray(b) ? a.checked = m.inArray(m(a).val(), b) >= 0 : void 0;
            }
        }, k.checkOn || (m.valHooks[this].get = function(a) {
            return null === a.getAttribute("value") ? "on" : a.value;
        });
    });
    var mc, nc, oc = m.expr.attrHandle, pc = /^(?:checked|selected)$/i, qc = k.getSetAttribute, rc = k.input;
    m.fn.extend({
        attr: function(a, b) {
            return V(this, m.attr, a, b, arguments.length > 1);
        },
        removeAttr: function(a) {
            return this.each(function() {
                m.removeAttr(this, a);
            });
        }
    }), m.extend({
        attr: function(a, b, c) {
            var d, e, f = a.nodeType;
            return a && 3 !== f && 8 !== f && 2 !== f ? typeof a.getAttribute === K ? m.prop(a, b, c) : (1 === f && m.isXMLDoc(a) || (b = b.toLowerCase(), 
            d = m.attrHooks[b] || (m.expr.match.bool.test(b) ? nc : mc)), void 0 === c ? d && "get" in d && null !== (e = d.get(a, b)) ? e : (e = m.find.attr(a, b), 
            null == e ? void 0 : e) : null !== c ? d && "set" in d && void 0 !== (e = d.set(a, c, b)) ? e : (a.setAttribute(b, c + ""), 
            c) : void m.removeAttr(a, b)) : void 0;
        },
        removeAttr: function(a, b) {
            var c, d, e = 0, f = b && b.match(E);
            if (f && 1 === a.nodeType) for (;c = f[e++]; ) d = m.propFix[c] || c, m.expr.match.bool.test(c) ? rc && qc || !pc.test(c) ? a[d] = !1 : a[m.camelCase("default-" + c)] = a[d] = !1 : m.attr(a, c, ""), 
            a.removeAttribute(qc ? c : d);
        },
        attrHooks: {
            type: {
                set: function(a, b) {
                    if (!k.radioValue && "radio" === b && m.nodeName(a, "input")) {
                        var c = a.value;
                        return a.setAttribute("type", b), c && (a.value = c), b;
                    }
                }
            }
        }
    }), nc = {
        set: function(a, b, c) {
            return b === !1 ? m.removeAttr(a, c) : rc && qc || !pc.test(c) ? a.setAttribute(!qc && m.propFix[c] || c, c) : a[m.camelCase("default-" + c)] = a[c] = !0, 
            c;
        }
    }, m.each(m.expr.match.bool.source.match(/\w+/g), function(a, b) {
        var c = oc[b] || m.find.attr;
        oc[b] = rc && qc || !pc.test(b) ? function(a, b, d) {
            var e, f;
            return d || (f = oc[b], oc[b] = e, e = null != c(a, b, d) ? b.toLowerCase() : null, 
            oc[b] = f), e;
        } : function(a, b, c) {
            return c ? void 0 : a[m.camelCase("default-" + b)] ? b.toLowerCase() : null;
        };
    }), rc && qc || (m.attrHooks.value = {
        set: function(a, b, c) {
            return m.nodeName(a, "input") ? void (a.defaultValue = b) : mc && mc.set(a, b, c);
        }
    }), qc || (mc = {
        set: function(a, b, c) {
            var d = a.getAttributeNode(c);
            return d || a.setAttributeNode(d = a.ownerDocument.createAttribute(c)), d.value = b += "", 
            "value" === c || b === a.getAttribute(c) ? b : void 0;
        }
    }, oc.id = oc.name = oc.coords = function(a, b, c) {
        var d;
        return c ? void 0 : (d = a.getAttributeNode(b)) && "" !== d.value ? d.value : null;
    }, m.valHooks.button = {
        get: function(a, b) {
            var c = a.getAttributeNode(b);
            return c && c.specified ? c.value : void 0;
        },
        set: mc.set
    }, m.attrHooks.contenteditable = {
        set: function(a, b, c) {
            mc.set(a, "" === b ? !1 : b, c);
        }
    }, m.each([ "width", "height" ], function(a, b) {
        m.attrHooks[b] = {
            set: function(a, c) {
                return "" === c ? (a.setAttribute(b, "auto"), c) : void 0;
            }
        };
    })), k.style || (m.attrHooks.style = {
        get: function(a) {
            return a.style.cssText || void 0;
        },
        set: function(a, b) {
            return a.style.cssText = b + "";
        }
    });
    var sc = /^(?:input|select|textarea|button|object)$/i, tc = /^(?:a|area)$/i;
    m.fn.extend({
        prop: function(a, b) {
            return V(this, m.prop, a, b, arguments.length > 1);
        },
        removeProp: function(a) {
            return a = m.propFix[a] || a, this.each(function() {
                try {
                    this[a] = void 0, delete this[a];
                } catch (b) {}
            });
        }
    }), m.extend({
        propFix: {
            "for": "htmlFor",
            "class": "className"
        },
        prop: function(a, b, c) {
            var d, e, f, g = a.nodeType;
            return a && 3 !== g && 8 !== g && 2 !== g ? (f = 1 !== g || !m.isXMLDoc(a), f && (b = m.propFix[b] || b, 
            e = m.propHooks[b]), void 0 !== c ? e && "set" in e && void 0 !== (d = e.set(a, c, b)) ? d : a[b] = c : e && "get" in e && null !== (d = e.get(a, b)) ? d : a[b]) : void 0;
        },
        propHooks: {
            tabIndex: {
                get: function(a) {
                    var b = m.find.attr(a, "tabindex");
                    return b ? parseInt(b, 10) : sc.test(a.nodeName) || tc.test(a.nodeName) && a.href ? 0 : -1;
                }
            }
        }
    }), k.hrefNormalized || m.each([ "href", "src" ], function(a, b) {
        m.propHooks[b] = {
            get: function(a) {
                return a.getAttribute(b, 4);
            }
        };
    }), k.optSelected || (m.propHooks.selected = {
        get: function(a) {
            var b = a.parentNode;
            return b && (b.selectedIndex, b.parentNode && b.parentNode.selectedIndex), null;
        }
    }), m.each([ "tabIndex", "readOnly", "maxLength", "cellSpacing", "cellPadding", "rowSpan", "colSpan", "useMap", "frameBorder", "contentEditable" ], function() {
        m.propFix[this.toLowerCase()] = this;
    }), k.enctype || (m.propFix.enctype = "encoding");
    var uc = /[\t\r\n\f]/g;
    m.fn.extend({
        addClass: function(a) {
            var b, c, d, e, f, g, h = 0, i = this.length, j = "string" == typeof a && a;
            if (m.isFunction(a)) return this.each(function(b) {
                m(this).addClass(a.call(this, b, this.className));
            });
            if (j) for (b = (a || "").match(E) || []; i > h; h++) if (c = this[h], d = 1 === c.nodeType && (c.className ? (" " + c.className + " ").replace(uc, " ") : " ")) {
                for (f = 0; e = b[f++]; ) d.indexOf(" " + e + " ") < 0 && (d += e + " ");
                g = m.trim(d), c.className !== g && (c.className = g);
            }
            return this;
        },
        removeClass: function(a) {
            var b, c, d, e, f, g, h = 0, i = this.length, j = 0 === arguments.length || "string" == typeof a && a;
            if (m.isFunction(a)) return this.each(function(b) {
                m(this).removeClass(a.call(this, b, this.className));
            });
            if (j) for (b = (a || "").match(E) || []; i > h; h++) if (c = this[h], d = 1 === c.nodeType && (c.className ? (" " + c.className + " ").replace(uc, " ") : "")) {
                for (f = 0; e = b[f++]; ) for (;d.indexOf(" " + e + " ") >= 0; ) d = d.replace(" " + e + " ", " ");
                g = a ? m.trim(d) : "", c.className !== g && (c.className = g);
            }
            return this;
        },
        toggleClass: function(a, b) {
            var c = typeof a;
            return "boolean" == typeof b && "string" === c ? b ? this.addClass(a) : this.removeClass(a) : this.each(m.isFunction(a) ? function(c) {
                m(this).toggleClass(a.call(this, c, this.className, b), b);
            } : function() {
                if ("string" === c) for (var b, d = 0, e = m(this), f = a.match(E) || []; b = f[d++]; ) e.hasClass(b) ? e.removeClass(b) : e.addClass(b); else (c === K || "boolean" === c) && (this.className && m._data(this, "__className__", this.className), 
                this.className = this.className || a === !1 ? "" : m._data(this, "__className__") || "");
            });
        },
        hasClass: function(a) {
            for (var b = " " + a + " ", c = 0, d = this.length; d > c; c++) if (1 === this[c].nodeType && (" " + this[c].className + " ").replace(uc, " ").indexOf(b) >= 0) return !0;
            return !1;
        }
    }), m.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "), function(a, b) {
        m.fn[b] = function(a, c) {
            return arguments.length > 0 ? this.on(b, null, a, c) : this.trigger(b);
        };
    }), m.fn.extend({
        hover: function(a, b) {
            return this.mouseenter(a).mouseleave(b || a);
        },
        bind: function(a, b, c) {
            return this.on(a, null, b, c);
        },
        unbind: function(a, b) {
            return this.off(a, null, b);
        },
        delegate: function(a, b, c, d) {
            return this.on(b, a, c, d);
        },
        undelegate: function(a, b, c) {
            return 1 === arguments.length ? this.off(a, "**") : this.off(b, a || "**", c);
        }
    });
    var vc = m.now(), wc = /\?/, xc = /(,)|(\[|{)|(}|])|"(?:[^"\\\r\n]|\\["\\\/bfnrt]|\\u[\da-fA-F]{4})*"\s*:?|true|false|null|-?(?!0\d)\d+(?:\.\d+|)(?:[eE][+-]?\d+|)/g;
    m.parseJSON = function(b) {
        if (a.JSON && a.JSON.parse) return a.JSON.parse(b + "");
        var c, d = null, e = m.trim(b + "");
        return e && !m.trim(e.replace(xc, function(a, b, e, f) {
            return c && b && (d = 0), 0 === d ? a : (c = e || b, d += !f - !e, "");
        })) ? Function("return " + e)() : m.error("Invalid JSON: " + b);
    }, m.parseXML = function(b) {
        var c, d;
        if (!b || "string" != typeof b) return null;
        try {
            a.DOMParser ? (d = new DOMParser(), c = d.parseFromString(b, "text/xml")) : (c = new ActiveXObject("Microsoft.XMLDOM"), 
            c.async = "false", c.loadXML(b));
        } catch (e) {
            c = void 0;
        }
        return c && c.documentElement && !c.getElementsByTagName("parsererror").length || m.error("Invalid XML: " + b), 
        c;
    };
    var yc, zc, Ac = /#.*$/, Bc = /([?&])_=[^&]*/, Cc = /^(.*?):[ \t]*([^\r\n]*)\r?$/gm, Dc = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/, Ec = /^(?:GET|HEAD)$/, Fc = /^\/\//, Gc = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/, Hc = {}, Ic = {}, Jc = "*/".concat("*");
    try {
        zc = location.href;
    } catch (Kc) {
        zc = y.createElement("a"), zc.href = "", zc = zc.href;
    }
    yc = Gc.exec(zc.toLowerCase()) || [], m.extend({
        active: 0,
        lastModified: {},
        etag: {},
        ajaxSettings: {
            url: zc,
            type: "GET",
            isLocal: Dc.test(yc[1]),
            global: !0,
            processData: !0,
            async: !0,
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            accepts: {
                "*": Jc,
                text: "text/plain",
                html: "text/html",
                xml: "application/xml, text/xml",
                json: "application/json, text/javascript"
            },
            contents: {
                xml: /xml/,
                html: /html/,
                json: /json/
            },
            responseFields: {
                xml: "responseXML",
                text: "responseText",
                json: "responseJSON"
            },
            converters: {
                "* text": String,
                "text html": !0,
                "text json": m.parseJSON,
                "text xml": m.parseXML
            },
            flatOptions: {
                url: !0,
                context: !0
            }
        },
        ajaxSetup: function(a, b) {
            return b ? Nc(Nc(a, m.ajaxSettings), b) : Nc(m.ajaxSettings, a);
        },
        ajaxPrefilter: Lc(Hc),
        ajaxTransport: Lc(Ic),
        ajax: function(a, b) {
            function x(a, b, c, d) {
                var j, r, s, u, w, x = b;
                2 !== t && (t = 2, g && clearTimeout(g), i = void 0, f = d || "", v.readyState = a > 0 ? 4 : 0, 
                j = a >= 200 && 300 > a || 304 === a, c && (u = Oc(k, v, c)), u = Pc(k, u, v, j), 
                j ? (k.ifModified && (w = v.getResponseHeader("Last-Modified"), w && (m.lastModified[e] = w), 
                w = v.getResponseHeader("etag"), w && (m.etag[e] = w)), 204 === a || "HEAD" === k.type ? x = "nocontent" : 304 === a ? x = "notmodified" : (x = u.state, 
                r = u.data, s = u.error, j = !s)) : (s = x, (a || !x) && (x = "error", 0 > a && (a = 0))), 
                v.status = a, v.statusText = (b || x) + "", j ? o.resolveWith(l, [ r, x, v ]) : o.rejectWith(l, [ v, x, s ]), 
                v.statusCode(q), q = void 0, h && n.trigger(j ? "ajaxSuccess" : "ajaxError", [ v, k, j ? r : s ]), 
                p.fireWith(l, [ v, x ]), h && (n.trigger("ajaxComplete", [ v, k ]), --m.active || m.event.trigger("ajaxStop")));
            }
            "object" == typeof a && (b = a, a = void 0), b = b || {};
            var c, d, e, f, g, h, i, j, k = m.ajaxSetup({}, b), l = k.context || k, n = k.context && (l.nodeType || l.jquery) ? m(l) : m.event, o = m.Deferred(), p = m.Callbacks("once memory"), q = k.statusCode || {}, r = {}, s = {}, t = 0, u = "canceled", v = {
                readyState: 0,
                getResponseHeader: function(a) {
                    var b;
                    if (2 === t) {
                        if (!j) for (j = {}; b = Cc.exec(f); ) j[b[1].toLowerCase()] = b[2];
                        b = j[a.toLowerCase()];
                    }
                    return null == b ? null : b;
                },
                getAllResponseHeaders: function() {
                    return 2 === t ? f : null;
                },
                setRequestHeader: function(a, b) {
                    var c = a.toLowerCase();
                    return t || (a = s[c] = s[c] || a, r[a] = b), this;
                },
                overrideMimeType: function(a) {
                    return t || (k.mimeType = a), this;
                },
                statusCode: function(a) {
                    var b;
                    if (a) if (2 > t) for (b in a) q[b] = [ q[b], a[b] ]; else v.always(a[v.status]);
                    return this;
                },
                abort: function(a) {
                    var b = a || u;
                    return i && i.abort(b), x(0, b), this;
                }
            };
            if (o.promise(v).complete = p.add, v.success = v.done, v.error = v.fail, k.url = ((a || k.url || zc) + "").replace(Ac, "").replace(Fc, yc[1] + "//"), 
            k.type = b.method || b.type || k.method || k.type, k.dataTypes = m.trim(k.dataType || "*").toLowerCase().match(E) || [ "" ], 
            null == k.crossDomain && (c = Gc.exec(k.url.toLowerCase()), k.crossDomain = !(!c || c[1] === yc[1] && c[2] === yc[2] && (c[3] || ("http:" === c[1] ? "80" : "443")) === (yc[3] || ("http:" === yc[1] ? "80" : "443")))), 
            k.data && k.processData && "string" != typeof k.data && (k.data = m.param(k.data, k.traditional)), 
            Mc(Hc, k, b, v), 2 === t) return v;
            h = m.event && k.global, h && 0 === m.active++ && m.event.trigger("ajaxStart"), 
            k.type = k.type.toUpperCase(), k.hasContent = !Ec.test(k.type), e = k.url, k.hasContent || (k.data && (e = k.url += (wc.test(e) ? "&" : "?") + k.data, 
            delete k.data), k.cache === !1 && (k.url = Bc.test(e) ? e.replace(Bc, "$1_=" + vc++) : e + (wc.test(e) ? "&" : "?") + "_=" + vc++)), 
            k.ifModified && (m.lastModified[e] && v.setRequestHeader("If-Modified-Since", m.lastModified[e]), 
            m.etag[e] && v.setRequestHeader("If-None-Match", m.etag[e])), (k.data && k.hasContent && k.contentType !== !1 || b.contentType) && v.setRequestHeader("Content-Type", k.contentType), 
            v.setRequestHeader("Accept", k.dataTypes[0] && k.accepts[k.dataTypes[0]] ? k.accepts[k.dataTypes[0]] + ("*" !== k.dataTypes[0] ? ", " + Jc + "; q=0.01" : "") : k.accepts["*"]);
            for (d in k.headers) v.setRequestHeader(d, k.headers[d]);
            if (k.beforeSend && (k.beforeSend.call(l, v, k) === !1 || 2 === t)) return v.abort();
            u = "abort";
            for (d in {
                success: 1,
                error: 1,
                complete: 1
            }) v[d](k[d]);
            if (i = Mc(Ic, k, b, v)) {
                v.readyState = 1, h && n.trigger("ajaxSend", [ v, k ]), k.async && k.timeout > 0 && (g = setTimeout(function() {
                    v.abort("timeout");
                }, k.timeout));
                try {
                    t = 1, i.send(r, x);
                } catch (w) {
                    if (!(2 > t)) throw w;
                    x(-1, w);
                }
            } else x(-1, "No Transport");
            return v;
        },
        getJSON: function(a, b, c) {
            return m.get(a, b, c, "json");
        },
        getScript: function(a, b) {
            return m.get(a, void 0, b, "script");
        }
    }), m.each([ "get", "post" ], function(a, b) {
        m[b] = function(a, c, d, e) {
            return m.isFunction(c) && (e = e || d, d = c, c = void 0), m.ajax({
                url: a,
                type: b,
                dataType: e,
                data: c,
                success: d
            });
        };
    }), m._evalUrl = function(a) {
        return m.ajax({
            url: a,
            type: "GET",
            dataType: "script",
            async: !1,
            global: !1,
            "throws": !0
        });
    }, m.fn.extend({
        wrapAll: function(a) {
            if (m.isFunction(a)) return this.each(function(b) {
                m(this).wrapAll(a.call(this, b));
            });
            if (this[0]) {
                var b = m(a, this[0].ownerDocument).eq(0).clone(!0);
                this[0].parentNode && b.insertBefore(this[0]), b.map(function() {
                    for (var a = this; a.firstChild && 1 === a.firstChild.nodeType; ) a = a.firstChild;
                    return a;
                }).append(this);
            }
            return this;
        },
        wrapInner: function(a) {
            return this.each(m.isFunction(a) ? function(b) {
                m(this).wrapInner(a.call(this, b));
            } : function() {
                var b = m(this), c = b.contents();
                c.length ? c.wrapAll(a) : b.append(a);
            });
        },
        wrap: function(a) {
            var b = m.isFunction(a);
            return this.each(function(c) {
                m(this).wrapAll(b ? a.call(this, c) : a);
            });
        },
        unwrap: function() {
            return this.parent().each(function() {
                m.nodeName(this, "body") || m(this).replaceWith(this.childNodes);
            }).end();
        }
    }), m.expr.filters.hidden = function(a) {
        return a.offsetWidth <= 0 && a.offsetHeight <= 0 || !k.reliableHiddenOffsets() && "none" === (a.style && a.style.display || m.css(a, "display"));
    }, m.expr.filters.visible = function(a) {
        return !m.expr.filters.hidden(a);
    };
    var Qc = /%20/g, Rc = /\[\]$/, Sc = /\r?\n/g, Tc = /^(?:submit|button|image|reset|file)$/i, Uc = /^(?:input|select|textarea|keygen)/i;
    m.param = function(a, b) {
        var c, d = [], e = function(a, b) {
            b = m.isFunction(b) ? b() : null == b ? "" : b, d[d.length] = encodeURIComponent(a) + "=" + encodeURIComponent(b);
        };
        if (void 0 === b && (b = m.ajaxSettings && m.ajaxSettings.traditional), m.isArray(a) || a.jquery && !m.isPlainObject(a)) m.each(a, function() {
            e(this.name, this.value);
        }); else for (c in a) Vc(c, a[c], b, e);
        return d.join("&").replace(Qc, "+");
    }, m.fn.extend({
        serialize: function() {
            return m.param(this.serializeArray());
        },
        serializeArray: function() {
            return this.map(function() {
                var a = m.prop(this, "elements");
                return a ? m.makeArray(a) : this;
            }).filter(function() {
                var a = this.type;
                return this.name && !m(this).is(":disabled") && Uc.test(this.nodeName) && !Tc.test(a) && (this.checked || !W.test(a));
            }).map(function(a, b) {
                var c = m(this).val();
                return null == c ? null : m.isArray(c) ? m.map(c, function(a) {
                    return {
                        name: b.name,
                        value: a.replace(Sc, "\r\n")
                    };
                }) : {
                    name: b.name,
                    value: c.replace(Sc, "\r\n")
                };
            }).get();
        }
    }), m.ajaxSettings.xhr = void 0 !== a.ActiveXObject ? function() {
        return !this.isLocal && /^(get|post|head|put|delete|options)$/i.test(this.type) && Zc() || $c();
    } : Zc;
    var Wc = 0, Xc = {}, Yc = m.ajaxSettings.xhr();
    a.attachEvent && a.attachEvent("onunload", function() {
        for (var a in Xc) Xc[a](void 0, !0);
    }), k.cors = !!Yc && "withCredentials" in Yc, Yc = k.ajax = !!Yc, Yc && m.ajaxTransport(function(a) {
        if (!a.crossDomain || k.cors) {
            var b;
            return {
                send: function(c, d) {
                    var e, f = a.xhr(), g = ++Wc;
                    if (f.open(a.type, a.url, a.async, a.username, a.password), a.xhrFields) for (e in a.xhrFields) f[e] = a.xhrFields[e];
                    a.mimeType && f.overrideMimeType && f.overrideMimeType(a.mimeType), a.crossDomain || c["X-Requested-With"] || (c["X-Requested-With"] = "XMLHttpRequest");
                    for (e in c) void 0 !== c[e] && f.setRequestHeader(e, c[e] + "");
                    f.send(a.hasContent && a.data || null), b = function(c, e) {
                        var h, i, j;
                        if (b && (e || 4 === f.readyState)) if (delete Xc[g], b = void 0, f.onreadystatechange = m.noop, 
                        e) 4 !== f.readyState && f.abort(); else {
                            j = {}, h = f.status, "string" == typeof f.responseText && (j.text = f.responseText);
                            try {
                                i = f.statusText;
                            } catch (k) {
                                i = "";
                            }
                            h || !a.isLocal || a.crossDomain ? 1223 === h && (h = 204) : h = j.text ? 200 : 404;
                        }
                        j && d(h, i, j, f.getAllResponseHeaders());
                    }, a.async ? 4 === f.readyState ? setTimeout(b) : f.onreadystatechange = Xc[g] = b : b();
                },
                abort: function() {
                    b && b(void 0, !0);
                }
            };
        }
    }), m.ajaxSetup({
        accepts: {
            script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
        },
        contents: {
            script: /(?:java|ecma)script/
        },
        converters: {
            "text script": function(a) {
                return m.globalEval(a), a;
            }
        }
    }), m.ajaxPrefilter("script", function(a) {
        void 0 === a.cache && (a.cache = !1), a.crossDomain && (a.type = "GET", a.global = !1);
    }), m.ajaxTransport("script", function(a) {
        if (a.crossDomain) {
            var b, c = y.head || m("head")[0] || y.documentElement;
            return {
                send: function(d, e) {
                    b = y.createElement("script"), b.async = !0, a.scriptCharset && (b.charset = a.scriptCharset), 
                    b.src = a.url, b.onload = b.onreadystatechange = function(a, c) {
                        (c || !b.readyState || /loaded|complete/.test(b.readyState)) && (b.onload = b.onreadystatechange = null, 
                        b.parentNode && b.parentNode.removeChild(b), b = null, c || e(200, "success"));
                    }, c.insertBefore(b, c.firstChild);
                },
                abort: function() {
                    b && b.onload(void 0, !0);
                }
            };
        }
    });
    var _c = [], ad = /(=)\?(?=&|$)|\?\?/;
    m.ajaxSetup({
        jsonp: "callback",
        jsonpCallback: function() {
            var a = _c.pop() || m.expando + "_" + vc++;
            return this[a] = !0, a;
        }
    }), m.ajaxPrefilter("json jsonp", function(b, c, d) {
        var e, f, g, h = b.jsonp !== !1 && (ad.test(b.url) ? "url" : "string" == typeof b.data && !(b.contentType || "").indexOf("application/x-www-form-urlencoded") && ad.test(b.data) && "data");
        return h || "jsonp" === b.dataTypes[0] ? (e = b.jsonpCallback = m.isFunction(b.jsonpCallback) ? b.jsonpCallback() : b.jsonpCallback, 
        h ? b[h] = b[h].replace(ad, "$1" + e) : b.jsonp !== !1 && (b.url += (wc.test(b.url) ? "&" : "?") + b.jsonp + "=" + e), 
        b.converters["script json"] = function() {
            return g || m.error(e + " was not called"), g[0];
        }, b.dataTypes[0] = "json", f = a[e], a[e] = function() {
            g = arguments;
        }, d.always(function() {
            a[e] = f, b[e] && (b.jsonpCallback = c.jsonpCallback, _c.push(e)), g && m.isFunction(f) && f(g[0]), 
            g = f = void 0;
        }), "script") : void 0;
    }), m.parseHTML = function(a, b, c) {
        if (!a || "string" != typeof a) return null;
        "boolean" == typeof b && (c = b, b = !1), b = b || y;
        var d = u.exec(a), e = !c && [];
        return d ? [ b.createElement(d[1]) ] : (d = m.buildFragment([ a ], b, e), e && e.length && m(e).remove(), 
        m.merge([], d.childNodes));
    };
    var bd = m.fn.load;
    m.fn.load = function(a, b, c) {
        if ("string" != typeof a && bd) return bd.apply(this, arguments);
        var d, e, f, g = this, h = a.indexOf(" ");
        return h >= 0 && (d = m.trim(a.slice(h, a.length)), a = a.slice(0, h)), m.isFunction(b) ? (c = b, 
        b = void 0) : b && "object" == typeof b && (f = "POST"), g.length > 0 && m.ajax({
            url: a,
            type: f,
            dataType: "html",
            data: b
        }).done(function(a) {
            e = arguments, g.html(d ? m("<div>").append(m.parseHTML(a)).find(d) : a);
        }).complete(c && function(a, b) {
            g.each(c, e || [ a.responseText, b, a ]);
        }), this;
    }, m.each([ "ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend" ], function(a, b) {
        m.fn[b] = function(a) {
            return this.on(b, a);
        };
    }), m.expr.filters.animated = function(a) {
        return m.grep(m.timers, function(b) {
            return a === b.elem;
        }).length;
    };
    var cd = a.document.documentElement;
    m.offset = {
        setOffset: function(a, b, c) {
            var d, e, f, g, h, i, j, k = m.css(a, "position"), l = m(a), n = {};
            "static" === k && (a.style.position = "relative"), h = l.offset(), f = m.css(a, "top"), 
            i = m.css(a, "left"), j = ("absolute" === k || "fixed" === k) && m.inArray("auto", [ f, i ]) > -1, 
            j ? (d = l.position(), g = d.top, e = d.left) : (g = parseFloat(f) || 0, e = parseFloat(i) || 0), 
            m.isFunction(b) && (b = b.call(a, c, h)), null != b.top && (n.top = b.top - h.top + g), 
            null != b.left && (n.left = b.left - h.left + e), "using" in b ? b.using.call(a, n) : l.css(n);
        }
    }, m.fn.extend({
        offset: function(a) {
            if (arguments.length) return void 0 === a ? this : this.each(function(b) {
                m.offset.setOffset(this, a, b);
            });
            var b, c, d = {
                top: 0,
                left: 0
            }, e = this[0], f = e && e.ownerDocument;
            return f ? (b = f.documentElement, m.contains(b, e) ? (typeof e.getBoundingClientRect !== K && (d = e.getBoundingClientRect()), 
            c = dd(f), {
                top: d.top + (c.pageYOffset || b.scrollTop) - (b.clientTop || 0),
                left: d.left + (c.pageXOffset || b.scrollLeft) - (b.clientLeft || 0)
            }) : d) : void 0;
        },
        position: function() {
            if (this[0]) {
                var a, b, c = {
                    top: 0,
                    left: 0
                }, d = this[0];
                return "fixed" === m.css(d, "position") ? b = d.getBoundingClientRect() : (a = this.offsetParent(), 
                b = this.offset(), m.nodeName(a[0], "html") || (c = a.offset()), c.top += m.css(a[0], "borderTopWidth", !0), 
                c.left += m.css(a[0], "borderLeftWidth", !0)), {
                    top: b.top - c.top - m.css(d, "marginTop", !0),
                    left: b.left - c.left - m.css(d, "marginLeft", !0)
                };
            }
        },
        offsetParent: function() {
            return this.map(function() {
                for (var a = this.offsetParent || cd; a && !m.nodeName(a, "html") && "static" === m.css(a, "position"); ) a = a.offsetParent;
                return a || cd;
            });
        }
    }), m.each({
        scrollLeft: "pageXOffset",
        scrollTop: "pageYOffset"
    }, function(a, b) {
        var c = /Y/.test(b);
        m.fn[a] = function(d) {
            return V(this, function(a, d, e) {
                var f = dd(a);
                return void 0 === e ? f ? b in f ? f[b] : f.document.documentElement[d] : a[d] : void (f ? f.scrollTo(c ? m(f).scrollLeft() : e, c ? e : m(f).scrollTop()) : a[d] = e);
            }, a, d, arguments.length, null);
        };
    }), m.each([ "top", "left" ], function(a, b) {
        m.cssHooks[b] = Lb(k.pixelPosition, function(a, c) {
            return c ? (c = Jb(a, b), Hb.test(c) ? m(a).position()[b] + "px" : c) : void 0;
        });
    }), m.each({
        Height: "height",
        Width: "width"
    }, function(a, b) {
        m.each({
            padding: "inner" + a,
            content: b,
            "": "outer" + a
        }, function(c, d) {
            m.fn[d] = function(d, e) {
                var f = arguments.length && (c || "boolean" != typeof d), g = c || (d === !0 || e === !0 ? "margin" : "border");
                return V(this, function(b, c, d) {
                    var e;
                    return m.isWindow(b) ? b.document.documentElement["client" + a] : 9 === b.nodeType ? (e = b.documentElement, 
                    Math.max(b.body["scroll" + a], e["scroll" + a], b.body["offset" + a], e["offset" + a], e["client" + a])) : void 0 === d ? m.css(b, c, g) : m.style(b, c, d, g);
                }, b, f ? d : void 0, f, null);
            };
        });
    }), m.fn.size = function() {
        return this.length;
    }, m.fn.andSelf = m.fn.addBack, "function" == typeof define && define.amd && define("jquery", [], function() {
        return m;
    });
    var ed = a.jQuery, fd = a.$;
    return m.noConflict = function(b) {
        return a.$ === m && (a.$ = fd), b && a.jQuery === m && (a.jQuery = ed), m;
    }, typeof b === K && (a.jQuery = a.$ = m), m;
}), function() {
    var initializing = !1, fnTest = /xyz/.test(function() {
        xyz;
    }) ? /\b_super\b/ : /.*/;
    this.Class = function() {}, Class.extend = function(prop) {
        function Class() {
            !initializing && this.init && this.init.apply(this, arguments);
        }
        var _super = this.prototype;
        initializing = !0;
        var prototype = new this();
        initializing = !1;
        for (var name in prop) prototype[name] = "function" == typeof prop[name] && "function" == typeof _super[name] && fnTest.test(prop[name]) ? function(name, fn) {
            return function() {
                var tmp = this._super;
                this._super = _super[name];
                var ret = fn.apply(this, arguments);
                return this._super = tmp, ret;
            };
        }(name, prop[name]) : prop[name];
        return Class.prototype = prototype, Class.prototype.constructor = Class, Class.extend = arguments.callee, 
        Class;
    };
}();

var openFB = function() {
    function init(params) {
        if (!params.appId) throw "appId parameter not set in init()";
        fbAppId = params.appId, params.tokenStore && (tokenStore = params.tokenStore), params.runningInCordova && (runningInCordova = params.runningInCordova);
    }
    function getLoginStatus(callback) {
        var token = tokenStore["fb.token"], loginStatus = {};
        token ? (loginStatus.status = "connected", loginStatus.authResponse = {
            token: token
        }) : loginStatus.status = "unknown", callback && callback(loginStatus);
    }
    function login(callback, options) {
        function loginWindow_loadStartHandler(event) {
            var url = event.url;
            if (console.log("load start handler"), url.indexOf("access_token=") > 0 || url.indexOf("error=") > 0) {
                console.log("load start handler, token or error");
                var timeout = 600 - (new Date().getTime() - startTime);
                setTimeout(function() {
                    loginWindow.close();
                }, timeout > 0 ? timeout : 0), oauthCallback(url);
            }
        }
        function loginWindow_exitHandler() {
            console.log("exit and remove listeners"), deferredLogin.reject({
                error: "user_cancelled",
                error_description: "User cancelled login process",
                error_reason: "user_cancelled"
            }), loginWindow.removeEventListener("loadstop", loginWindow_loadStartHandler), loginWindow.removeEventListener("exit", loginWindow_exitHandler), 
            loginWindow = null, console.log("done removing listeners");
        }
        var loginWindow, startTime, scope = "";
        return fbAppId ? (options && options.scope && (scope = options.scope), loginCallback = callback, 
        loginProcessed = !1, runningInCordova && (oauthRedirectURL = "https://www.facebook.com/connect/login_success.html"), 
        console.log(oauthRedirectURL), startTime = new Date().getTime(), loginWindow = window.open(FB_LOGIN_URL + "?client_id=" + fbAppId + "&redirect_uri=" + oauthRedirectURL + "&response_type=token&scope=" + scope, "_blank", "location=no"), 
        void (runningInCordova && (console.log("add listeners"), loginWindow.addEventListener("loadstart", loginWindow_loadStartHandler), 
        loginWindow.addEventListener("exit", loginWindow_exitHandler)))) : callback({
            status: "unknown",
            error: "Facebook App Id not set."
        });
    }
    function oauthCallback(url) {
        var queryString, obj;
        loginProcessed = !0, url.indexOf("access_token=") > 0 ? (queryString = url.substr(url.indexOf("#") + 1), 
        obj = parseQueryString(queryString), tokenStore["fb.token"] = obj.access_token, 
        loginCallback && loginCallback({
            status: "connected",
            authResponse: {
                token: obj.access_token
            }
        })) : url.indexOf("error=") > 0 ? (queryString = url.substring(url.indexOf("?") + 1, url.indexOf("#")), 
        obj = parseQueryString(queryString), loginCallback && loginCallback({
            status: "not_authorized",
            error: obj.error
        })) : loginCallback && loginCallback({
            status: "not_authorized"
        });
    }
    function logout(callback) {
        var logoutWindow, token = tokenStore["fb.token"];
        tokenStore.removeItem("fb.token"), token && (logoutWindow = window.open(FB_LOGOUT_URL + "?access_token=" + token + "&next=" + logoutRedirectURL, "_blank", "location=no"), 
        runningInCordova && setTimeout(function() {
            logoutWindow.close();
        }, 700)), callback && callback();
    }
    function api(obj) {
        var url, method = obj.method || "GET", params = obj.params || {}, xhr = new XMLHttpRequest();
        params.access_token = tokenStore["fb.token"], url = "https://graph.facebook.com" + obj.path + "?" + toQueryString(params), 
        xhr.onreadystatechange = function() {
            if (4 === xhr.readyState) if (200 === xhr.status) obj.success && obj.success(JSON.parse(xhr.responseText)); else {
                var error = xhr.responseText ? JSON.parse(xhr.responseText).error : {
                    message: "An error has occurred"
                };
                obj.error && obj.error(error);
            }
        }, xhr.open(method, url, !0), xhr.send();
    }
    function revokePermissions(success, error) {
        return api({
            method: "DELETE",
            path: "/me/permissions",
            success: function() {
                tokenStore["fb.token"] = void 0, success();
            },
            error: error
        });
    }
    function parseQueryString(queryString) {
        var qs = decodeURIComponent(queryString), obj = {}, params = qs.split("&");
        return params.forEach(function(param) {
            var splitter = param.split("=");
            obj[splitter[0]] = splitter[1];
        }), obj;
    }
    function toQueryString(obj) {
        var parts = [];
        for (var i in obj) obj.hasOwnProperty(i) && parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
        return parts.join("&");
    }
    var fbAppId, loginCallback, runningInCordova, loginProcessed, FB_LOGIN_URL = "https://www.facebook.com/dialog/oauth", FB_LOGOUT_URL = "https://www.facebook.com/logout.php", tokenStore = window.sessionStorage, context = window.location.pathname.substring(0, window.location.pathname.indexOf("/", 2)), baseURL = location.protocol + "//" + location.hostname + (location.port ? ":" + location.port : "") + context, oauthRedirectURL = baseURL + "/oauthcallback.html", logoutRedirectURL = baseURL + "/logoutcallback.html";
    return console.log(oauthRedirectURL), console.log(logoutRedirectURL), document.addEventListener("deviceready", function() {
        runningInCordova = !0;
    }, !1), {
        init: init,
        login: login,
        logout: logout,
        revokePermissions: revokePermissions,
        api: api,
        oauthCallback: oauthCallback,
        getLoginStatus: getLoginStatus
    };
}();

(window._gsQueue || (window._gsQueue = [])).push(function() {
    "use strict";
    window._gsDefine("easing.Back", [ "easing.Ease" ], function(t) {
        var e, i, s, r = window.GreenSockGlobals || window, n = r.com.greensock, a = 2 * Math.PI, o = Math.PI / 2, h = n._class, l = function(e, i) {
            var s = h("easing." + e, function() {}, !0), r = s.prototype = new t();
            return r.constructor = s, r.getRatio = i, s;
        }, _ = t.register || function() {}, u = function(t, e, i, s) {
            var r = h("easing." + t, {
                easeOut: new e(),
                easeIn: new i(),
                easeInOut: new s()
            }, !0);
            return _(r, t), r;
        }, c = function(t, e, i) {
            this.t = t, this.v = e, i && (this.next = i, i.prev = this, this.c = i.v - e, this.gap = i.t - t);
        }, f = function(e, i) {
            var s = h("easing." + e, function(t) {
                this._p1 = t || 0 === t ? t : 1.70158, this._p2 = 1.525 * this._p1;
            }, !0), r = s.prototype = new t();
            return r.constructor = s, r.getRatio = i, r.config = function(t) {
                return new s(t);
            }, s;
        }, p = u("Back", f("BackOut", function(t) {
            return (t -= 1) * t * ((this._p1 + 1) * t + this._p1) + 1;
        }), f("BackIn", function(t) {
            return t * t * ((this._p1 + 1) * t - this._p1);
        }), f("BackInOut", function(t) {
            return 1 > (t *= 2) ? .5 * t * t * ((this._p2 + 1) * t - this._p2) : .5 * ((t -= 2) * t * ((this._p2 + 1) * t + this._p2) + 2);
        })), m = h("easing.SlowMo", function(t, e, i) {
            e = e || 0 === e ? e : .7, null == t ? t = .7 : t > 1 && (t = 1), this._p = 1 !== t ? e : 0, 
            this._p1 = (1 - t) / 2, this._p2 = t, this._p3 = this._p1 + this._p2, this._calcEnd = i === !0;
        }, !0), d = m.prototype = new t();
        return d.constructor = m, d.getRatio = function(t) {
            var e = t + (.5 - t) * this._p;
            return this._p1 > t ? this._calcEnd ? 1 - (t = 1 - t / this._p1) * t : e - (t = 1 - t / this._p1) * t * t * t * e : t > this._p3 ? this._calcEnd ? 1 - (t = (t - this._p3) / this._p1) * t : e + (t - e) * (t = (t - this._p3) / this._p1) * t * t * t : this._calcEnd ? 1 : e;
        }, m.ease = new m(.7, .7), d.config = m.config = function(t, e, i) {
            return new m(t, e, i);
        }, e = h("easing.SteppedEase", function(t) {
            t = t || 1, this._p1 = 1 / t, this._p2 = t + 1;
        }, !0), d = e.prototype = new t(), d.constructor = e, d.getRatio = function(t) {
            return 0 > t ? t = 0 : t >= 1 && (t = .999999999), (this._p2 * t >> 0) * this._p1;
        }, d.config = e.config = function(t) {
            return new e(t);
        }, i = h("easing.RoughEase", function(e) {
            e = e || {};
            for (var i, s, r, n, a, o, h = e.taper || "none", l = [], _ = 0, u = 0 | (e.points || 20), f = u, p = e.randomize !== !1, m = e.clamp === !0, d = e.template instanceof t ? e.template : null, g = "number" == typeof e.strength ? .4 * e.strength : .4; --f > -1; ) i = p ? Math.random() : 1 / u * f, 
            s = d ? d.getRatio(i) : i, "none" === h ? r = g : "out" === h ? (n = 1 - i, r = n * n * g) : "in" === h ? r = i * i * g : .5 > i ? (n = 2 * i, 
            r = .5 * n * n * g) : (n = 2 * (1 - i), r = .5 * n * n * g), p ? s += Math.random() * r - .5 * r : f % 2 ? s += .5 * r : s -= .5 * r, 
            m && (s > 1 ? s = 1 : 0 > s && (s = 0)), l[_++] = {
                x: i,
                y: s
            };
            for (l.sort(function(t, e) {
                return t.x - e.x;
            }), o = new c(1, 1, null), f = u; --f > -1; ) a = l[f], o = new c(a.x, a.y, o);
            this._prev = new c(0, 0, 0 !== o.t ? o : o.next);
        }, !0), d = i.prototype = new t(), d.constructor = i, d.getRatio = function(t) {
            var e = this._prev;
            if (t > e.t) {
                for (;e.next && t >= e.t; ) e = e.next;
                e = e.prev;
            } else for (;e.prev && e.t >= t; ) e = e.prev;
            return this._prev = e, e.v + (t - e.t) / e.gap * e.c;
        }, d.config = function(t) {
            return new i(t);
        }, i.ease = new i(), u("Bounce", l("BounceOut", function(t) {
            return 1 / 2.75 > t ? 7.5625 * t * t : 2 / 2.75 > t ? 7.5625 * (t -= 1.5 / 2.75) * t + .75 : 2.5 / 2.75 > t ? 7.5625 * (t -= 2.25 / 2.75) * t + .9375 : 7.5625 * (t -= 2.625 / 2.75) * t + .984375;
        }), l("BounceIn", function(t) {
            return 1 / 2.75 > (t = 1 - t) ? 1 - 7.5625 * t * t : 2 / 2.75 > t ? 1 - (7.5625 * (t -= 1.5 / 2.75) * t + .75) : 2.5 / 2.75 > t ? 1 - (7.5625 * (t -= 2.25 / 2.75) * t + .9375) : 1 - (7.5625 * (t -= 2.625 / 2.75) * t + .984375);
        }), l("BounceInOut", function(t) {
            var e = .5 > t;
            return t = e ? 1 - 2 * t : 2 * t - 1, t = 1 / 2.75 > t ? 7.5625 * t * t : 2 / 2.75 > t ? 7.5625 * (t -= 1.5 / 2.75) * t + .75 : 2.5 / 2.75 > t ? 7.5625 * (t -= 2.25 / 2.75) * t + .9375 : 7.5625 * (t -= 2.625 / 2.75) * t + .984375, 
            e ? .5 * (1 - t) : .5 * t + .5;
        })), u("Circ", l("CircOut", function(t) {
            return Math.sqrt(1 - (t -= 1) * t);
        }), l("CircIn", function(t) {
            return -(Math.sqrt(1 - t * t) - 1);
        }), l("CircInOut", function(t) {
            return 1 > (t *= 2) ? -.5 * (Math.sqrt(1 - t * t) - 1) : .5 * (Math.sqrt(1 - (t -= 2) * t) + 1);
        })), s = function(e, i, s) {
            var r = h("easing." + e, function(t, e) {
                this._p1 = t || 1, this._p2 = e || s, this._p3 = this._p2 / a * (Math.asin(1 / this._p1) || 0);
            }, !0), n = r.prototype = new t();
            return n.constructor = r, n.getRatio = i, n.config = function(t, e) {
                return new r(t, e);
            }, r;
        }, u("Elastic", s("ElasticOut", function(t) {
            return this._p1 * Math.pow(2, -10 * t) * Math.sin((t - this._p3) * a / this._p2) + 1;
        }, .3), s("ElasticIn", function(t) {
            return -(this._p1 * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - this._p3) * a / this._p2));
        }, .3), s("ElasticInOut", function(t) {
            return 1 > (t *= 2) ? -.5 * this._p1 * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - this._p3) * a / this._p2) : .5 * this._p1 * Math.pow(2, -10 * (t -= 1)) * Math.sin((t - this._p3) * a / this._p2) + 1;
        }, .45)), u("Expo", l("ExpoOut", function(t) {
            return 1 - Math.pow(2, -10 * t);
        }), l("ExpoIn", function(t) {
            return Math.pow(2, 10 * (t - 1)) - .001;
        }), l("ExpoInOut", function(t) {
            return 1 > (t *= 2) ? .5 * Math.pow(2, 10 * (t - 1)) : .5 * (2 - Math.pow(2, -10 * (t - 1)));
        })), u("Sine", l("SineOut", function(t) {
            return Math.sin(t * o);
        }), l("SineIn", function(t) {
            return -Math.cos(t * o) + 1;
        }), l("SineInOut", function(t) {
            return -.5 * (Math.cos(Math.PI * t) - 1);
        })), h("easing.EaseLookup", {
            find: function(e) {
                return t.map[e];
            }
        }, !0), _(r.SlowMo, "SlowMo", "ease,"), _(i, "RoughEase", "ease,"), _(e, "SteppedEase", "ease,"), 
        p;
    }, !0);
}), window._gsDefine && window._gsQueue.pop()(), (window._gsQueue || (window._gsQueue = [])).push(function() {
    "use strict";
    window._gsDefine("TimelineLite", [ "core.Animation", "core.SimpleTimeline", "TweenLite" ], function(t, e, i) {
        var s = function(t) {
            e.call(this, t), this._labels = {}, this.autoRemoveChildren = this.vars.autoRemoveChildren === !0, 
            this.smoothChildTiming = this.vars.smoothChildTiming === !0, this._sortChildren = !0, 
            this._onUpdate = this.vars.onUpdate;
            var i, s, r = this.vars;
            for (s in r) i = r[s], i instanceof Array && -1 !== i.join("").indexOf("{self}") && (r[s] = this._swapSelfInParams(i));
            r.tweens instanceof Array && this.add(r.tweens, 0, r.align, r.stagger);
        }, r = [], n = function(t) {
            var e, i = {};
            for (e in t) i[e] = t[e];
            return i;
        }, a = function(t, e, i, s) {
            t._timeline.pause(t._startTime), e && e.apply(s || t._timeline, i || r);
        }, o = r.slice, h = s.prototype = new e();
        return s.version = "1.10.2", h.constructor = s, h.kill()._gc = !1, h.to = function(t, e, s, r) {
            return e ? this.add(new i(t, e, s), r) : this.set(t, s, r);
        }, h.from = function(t, e, s, r) {
            return this.add(i.from(t, e, s), r);
        }, h.fromTo = function(t, e, s, r, n) {
            return e ? this.add(i.fromTo(t, e, s, r), n) : this.set(t, r, n);
        }, h.staggerTo = function(t, e, r, a, h, l, _, u) {
            var p, f = new s({
                onComplete: l,
                onCompleteParams: _,
                onCompleteScope: u
            });
            for ("string" == typeof t && (t = i.selector(t) || t), !(t instanceof Array) && t.length && t !== window && t[0] && (t[0] === window || t[0].nodeType && t[0].style && !t.nodeType) && (t = o.call(t, 0)), 
            a = a || 0, p = 0; t.length > p; p++) r.startAt && (r.startAt = n(r.startAt)), f.to(t[p], e, n(r), p * a);
            return this.add(f, h);
        }, h.staggerFrom = function(t, e, i, s, r, n, a, o) {
            return i.immediateRender = 0 != i.immediateRender, i.runBackwards = !0, this.staggerTo(t, e, i, s, r, n, a, o);
        }, h.staggerFromTo = function(t, e, i, s, r, n, a, o, h) {
            return s.startAt = i, s.immediateRender = 0 != s.immediateRender && 0 != i.immediateRender, 
            this.staggerTo(t, e, s, r, n, a, o, h);
        }, h.call = function(t, e, s, r) {
            return this.add(i.delayedCall(0, t, e, s), r);
        }, h.set = function(t, e, s) {
            return s = this._parseTimeOrLabel(s, 0, !0), null == e.immediateRender && (e.immediateRender = s === this._time && !this._paused), 
            this.add(new i(t, 0, e), s);
        }, s.exportRoot = function(t, e) {
            t = t || {}, null == t.smoothChildTiming && (t.smoothChildTiming = !0);
            var r, n, a = new s(t), o = a._timeline;
            for (null == e && (e = !0), o._remove(a, !0), a._startTime = 0, a._rawPrevTime = a._time = a._totalTime = o._time, 
            r = o._first; r; ) n = r._next, e && r instanceof i && r.target === r.vars.onComplete || a.add(r, r._startTime - r._delay), 
            r = n;
            return o.add(a, 0), a;
        }, h.add = function(r, n, a, o) {
            var h, l, _, u, p;
            if ("number" != typeof n && (n = this._parseTimeOrLabel(n, 0, !0, r)), !(r instanceof t)) {
                if (r instanceof Array) {
                    for (a = a || "normal", o = o || 0, h = n, l = r.length, _ = 0; l > _; _++) (u = r[_]) instanceof Array && (u = new s({
                        tweens: u
                    })), this.add(u, h), "string" != typeof u && "function" != typeof u && ("sequence" === a ? h = u._startTime + u.totalDuration() / u._timeScale : "start" === a && (u._startTime -= u.delay())), 
                    h += o;
                    return this._uncache(!0);
                }
                if ("string" == typeof r) return this.addLabel(r, n);
                if ("function" != typeof r) throw "Cannot add " + r + " into the timeline; it is neither a tween, timeline, function, nor a string.";
                r = i.delayedCall(0, r);
            }
            if (e.prototype.add.call(this, r, n), this._gc && !this._paused && this._time === this._duration && this._time < this.duration()) for (p = this; p._gc && p._timeline; ) p._timeline.smoothChildTiming ? p.totalTime(p._totalTime, !0) : p._enabled(!0, !1), 
            p = p._timeline;
            return this;
        }, h.remove = function(e) {
            if (e instanceof t) return this._remove(e, !1);
            if (e instanceof Array) {
                for (var i = e.length; --i > -1; ) this.remove(e[i]);
                return this;
            }
            return "string" == typeof e ? this.removeLabel(e) : this.kill(null, e);
        }, h._remove = function(t, i) {
            return e.prototype._remove.call(this, t, i), this._last ? this._time > this._last._startTime && (this._time = this.duration(), 
            this._totalTime = this._totalDuration) : this._time = this._totalTime = 0, this;
        }, h.append = function(t, e) {
            return this.add(t, this._parseTimeOrLabel(null, e, !0, t));
        }, h.insert = h.insertMultiple = function(t, e, i, s) {
            return this.add(t, e || 0, i, s);
        }, h.appendMultiple = function(t, e, i, s) {
            return this.add(t, this._parseTimeOrLabel(null, e, !0, t), i, s);
        }, h.addLabel = function(t, e) {
            return this._labels[t] = this._parseTimeOrLabel(e), this;
        }, h.addPause = function(t, e, i, s) {
            return this.call(a, [ "{self}", e, i, s ], this, t);
        }, h.removeLabel = function(t) {
            return delete this._labels[t], this;
        }, h.getLabelTime = function(t) {
            return null != this._labels[t] ? this._labels[t] : -1;
        }, h._parseTimeOrLabel = function(e, i, s, r) {
            var n;
            if (r instanceof t && r.timeline === this) this.remove(r); else if (r instanceof Array) for (n = r.length; --n > -1; ) r[n] instanceof t && r[n].timeline === this && this.remove(r[n]);
            if ("string" == typeof i) return this._parseTimeOrLabel(i, s && "number" == typeof e && null == this._labels[i] ? e - this.duration() : 0, s);
            if (i = i || 0, "string" != typeof e || !isNaN(e) && null == this._labels[e]) null == e && (e = this.duration()); else {
                if (n = e.indexOf("="), -1 === n) return null == this._labels[e] ? s ? this._labels[e] = this.duration() + i : i : this._labels[e] + i;
                i = parseInt(e.charAt(n - 1) + "1", 10) * Number(e.substr(n + 1)), e = n > 1 ? this._parseTimeOrLabel(e.substr(0, n - 1), 0, s) : this.duration();
            }
            return Number(e) + i;
        }, h.seek = function(t, e) {
            return this.totalTime("number" == typeof t ? t : this._parseTimeOrLabel(t), e !== !1);
        }, h.stop = function() {
            return this.paused(!0);
        }, h.gotoAndPlay = function(t, e) {
            return this.play(t, e);
        }, h.gotoAndStop = function(t, e) {
            return this.pause(t, e);
        }, h.render = function(t, e, i) {
            this._gc && this._enabled(!0, !1);
            var s, n, a, o, h, l = this._dirty ? this.totalDuration() : this._totalDuration, _ = this._time, u = this._startTime, p = this._timeScale, f = this._paused;
            if (t >= l ? (this._totalTime = this._time = l, this._reversed || this._hasPausedChild() || (n = !0, 
            o = "onComplete", 0 === this._duration && (0 === t || 0 > this._rawPrevTime) && this._rawPrevTime !== t && this._first && (h = !0, 
            this._rawPrevTime > 0 && (o = "onReverseComplete"))), this._rawPrevTime = t, t = l + 1e-6) : 1e-7 > t ? (this._totalTime = this._time = 0, 
            (0 !== _ || 0 === this._duration && this._rawPrevTime > 0) && (o = "onReverseComplete", 
            n = this._reversed), 0 > t ? (this._active = !1, 0 === this._duration && this._rawPrevTime >= 0 && this._first && (h = !0), 
            this._rawPrevTime = t) : (this._rawPrevTime = t, t = 0, this._initted || (h = !0))) : this._totalTime = this._time = this._rawPrevTime = t, 
            this._time !== _ && this._first || i || h) {
                if (this._initted || (this._initted = !0), this._active || !this._paused && this._time !== _ && t > 0 && (this._active = !0), 
                0 === _ && this.vars.onStart && 0 !== this._time && (e || this.vars.onStart.apply(this.vars.onStartScope || this, this.vars.onStartParams || r)), 
                this._time >= _) for (s = this._first; s && (a = s._next, !this._paused || f); ) (s._active || s._startTime <= this._time && !s._paused && !s._gc) && (s._reversed ? s.render((s._dirty ? s.totalDuration() : s._totalDuration) - (t - s._startTime) * s._timeScale, e, i) : s.render((t - s._startTime) * s._timeScale, e, i)), 
                s = a; else for (s = this._last; s && (a = s._prev, !this._paused || f); ) (s._active || _ >= s._startTime && !s._paused && !s._gc) && (s._reversed ? s.render((s._dirty ? s.totalDuration() : s._totalDuration) - (t - s._startTime) * s._timeScale, e, i) : s.render((t - s._startTime) * s._timeScale, e, i)), 
                s = a;
                this._onUpdate && (e || this._onUpdate.apply(this.vars.onUpdateScope || this, this.vars.onUpdateParams || r)), 
                o && (this._gc || (u === this._startTime || p !== this._timeScale) && (0 === this._time || l >= this.totalDuration()) && (n && (this._timeline.autoRemoveChildren && this._enabled(!1, !1), 
                this._active = !1), !e && this.vars[o] && this.vars[o].apply(this.vars[o + "Scope"] || this, this.vars[o + "Params"] || r)));
            }
        }, h._hasPausedChild = function() {
            for (var t = this._first; t; ) {
                if (t._paused || t instanceof s && t._hasPausedChild()) return !0;
                t = t._next;
            }
            return !1;
        }, h.getChildren = function(t, e, s, r) {
            r = r || -9999999999;
            for (var n = [], a = this._first, o = 0; a; ) r > a._startTime || (a instanceof i ? e !== !1 && (n[o++] = a) : (s !== !1 && (n[o++] = a), 
            t !== !1 && (n = n.concat(a.getChildren(!0, e, s)), o = n.length))), a = a._next;
            return n;
        }, h.getTweensOf = function(t, e) {
            for (var s = i.getTweensOf(t), r = s.length, n = [], a = 0; --r > -1; ) (s[r].timeline === this || e && this._contains(s[r])) && (n[a++] = s[r]);
            return n;
        }, h._contains = function(t) {
            for (var e = t.timeline; e; ) {
                if (e === this) return !0;
                e = e.timeline;
            }
            return !1;
        }, h.shiftChildren = function(t, e, i) {
            i = i || 0;
            for (var s, r = this._first, n = this._labels; r; ) r._startTime >= i && (r._startTime += t), 
            r = r._next;
            if (e) for (s in n) n[s] >= i && (n[s] += t);
            return this._uncache(!0);
        }, h._kill = function(t, e) {
            if (!t && !e) return this._enabled(!1, !1);
            for (var i = e ? this.getTweensOf(e) : this.getChildren(!0, !0, !1), s = i.length, r = !1; --s > -1; ) i[s]._kill(t, e) && (r = !0);
            return r;
        }, h.clear = function(t) {
            var e = this.getChildren(!1, !0, !0), i = e.length;
            for (this._time = this._totalTime = 0; --i > -1; ) e[i]._enabled(!1, !1);
            return t !== !1 && (this._labels = {}), this._uncache(!0);
        }, h.invalidate = function() {
            for (var t = this._first; t; ) t.invalidate(), t = t._next;
            return this;
        }, h._enabled = function(t, i) {
            if (t === this._gc) for (var s = this._first; s; ) s._enabled(t, !0), s = s._next;
            return e.prototype._enabled.call(this, t, i);
        }, h.progress = function(t) {
            return arguments.length ? this.totalTime(this.duration() * t, !1) : this._time / this.duration();
        }, h.duration = function(t) {
            return arguments.length ? (0 !== this.duration() && 0 !== t && this.timeScale(this._duration / t), 
            this) : (this._dirty && this.totalDuration(), this._duration);
        }, h.totalDuration = function(t) {
            if (!arguments.length) {
                if (this._dirty) {
                    for (var e, i, s = 0, r = this._last, n = 999999999999; r; ) e = r._prev, r._dirty && r.totalDuration(), 
                    r._startTime > n && this._sortChildren && !r._paused ? this.add(r, r._startTime - r._delay) : n = r._startTime, 
                    0 > r._startTime && !r._paused && (s -= r._startTime, this._timeline.smoothChildTiming && (this._startTime += r._startTime / this._timeScale), 
                    this.shiftChildren(-r._startTime, !1, -9999999999), n = 0), i = r._startTime + r._totalDuration / r._timeScale, 
                    i > s && (s = i), r = e;
                    this._duration = this._totalDuration = s, this._dirty = !1;
                }
                return this._totalDuration;
            }
            return 0 !== this.totalDuration() && 0 !== t && this.timeScale(this._totalDuration / t), 
            this;
        }, h.usesFrames = function() {
            for (var e = this._timeline; e._timeline; ) e = e._timeline;
            return e === t._rootFramesTimeline;
        }, h.rawTime = function() {
            return this._paused || 0 !== this._totalTime && this._totalTime !== this._totalDuration ? this._totalTime : (this._timeline.rawTime() - this._startTime) * this._timeScale;
        }, s;
    }, !0);
}), window._gsDefine && window._gsQueue.pop()(), function(t) {
    "use strict";
    var e, i, s, n, r, a = t.GreenSockGlobals || t, o = function(t) {
        var e, i = t.split("."), s = a;
        for (e = 0; i.length > e; e++) s[i[e]] = s = s[i[e]] || {};
        return s;
    }, h = o("com.greensock"), l = [].slice, _ = function() {}, u = {}, m = function(e, i, s, n) {
        this.sc = u[e] ? u[e].sc : [], u[e] = this, this.gsClass = null, this.func = s;
        var r = [];
        this.check = function(h) {
            for (var l, _, f, p, c = i.length, d = c; --c > -1; ) (l = u[i[c]] || new m(i[c], [])).gsClass ? (r[c] = l.gsClass, 
            d--) : h && l.sc.push(this);
            if (0 === d && s) for (_ = ("com.greensock." + e).split("."), f = _.pop(), p = o(_.join("."))[f] = this.gsClass = s.apply(s, r), 
            n && (a[f] = p, "function" == typeof define && define.amd ? define((t.GreenSockAMDPath ? t.GreenSockAMDPath + "/" : "") + e.split(".").join("/"), [], function() {
                return p;
            }) : "undefined" != typeof module && module.exports && (module.exports = p)), c = 0; this.sc.length > c; c++) this.sc[c].check();
        }, this.check(!0);
    }, f = t._gsDefine = function(t, e, i, s) {
        return new m(t, e, i, s);
    }, p = h._class = function(t, e, i) {
        return e = e || function() {}, f(t, [], function() {
            return e;
        }, i), e;
    };
    f.globals = a;
    var c = [ 0, 0, 1, 1 ], d = [], v = p("easing.Ease", function(t, e, i, s) {
        this._func = t, this._type = i || 0, this._power = s || 0, this._params = e ? c.concat(e) : c;
    }, !0), g = v.map = {}, T = v.register = function(t, e, i, s) {
        for (var n, r, a, o, l = e.split(","), _ = l.length, u = (i || "easeIn,easeOut,easeInOut").split(","); --_ > -1; ) for (r = l[_], 
        n = s ? p("easing." + r, null, !0) : h.easing[r] || {}, a = u.length; --a > -1; ) o = u[a], 
        g[r + "." + o] = g[o + r] = n[o] = t.getRatio ? t : t[o] || new t();
    };
    for (s = v.prototype, s._calcEnd = !1, s.getRatio = function(t) {
        if (this._func) return this._params[0] = t, this._func.apply(null, this._params);
        var e = this._type, i = this._power, s = 1 === e ? 1 - t : 2 === e ? t : .5 > t ? 2 * t : 2 * (1 - t);
        return 1 === i ? s *= s : 2 === i ? s *= s * s : 3 === i ? s *= s * s * s : 4 === i && (s *= s * s * s * s), 
        1 === e ? 1 - s : 2 === e ? s : .5 > t ? s / 2 : 1 - s / 2;
    }, e = [ "Linear", "Quad", "Cubic", "Quart", "Quint,Strong" ], i = e.length; --i > -1; ) s = e[i] + ",Power" + i, 
    T(new v(null, null, 1, i), s, "easeOut", !0), T(new v(null, null, 2, i), s, "easeIn" + (0 === i ? ",easeNone" : "")), 
    T(new v(null, null, 3, i), s, "easeInOut");
    g.linear = h.easing.Linear.easeIn, g.swing = h.easing.Quad.easeInOut;
    var w = p("events.EventDispatcher", function(t) {
        this._listeners = {}, this._eventTarget = t || this;
    });
    s = w.prototype, s.addEventListener = function(t, e, i, s, a) {
        a = a || 0;
        var o, h, l = this._listeners[t], _ = 0;
        for (null == l && (this._listeners[t] = l = []), h = l.length; --h > -1; ) o = l[h], 
        o.c === e && o.s === i ? l.splice(h, 1) : 0 === _ && a > o.pr && (_ = h + 1);
        l.splice(_, 0, {
            c: e,
            s: i,
            up: s,
            pr: a
        }), this !== n || r || n.wake();
    }, s.removeEventListener = function(t, e) {
        var i, s = this._listeners[t];
        if (s) for (i = s.length; --i > -1; ) if (s[i].c === e) return void s.splice(i, 1);
    }, s.dispatchEvent = function(t) {
        var e, i, s, n = this._listeners[t];
        if (n) for (e = n.length, i = this._eventTarget; --e > -1; ) s = n[e], s.up ? s.c.call(s.s || i, {
            type: t,
            target: i
        }) : s.c.call(s.s || i);
    };
    var P = t.requestAnimationFrame, y = t.cancelAnimationFrame, k = Date.now || function() {
        return new Date().getTime();
    };
    for (e = [ "ms", "moz", "webkit", "o" ], i = e.length; --i > -1 && !P; ) P = t[e[i] + "RequestAnimationFrame"], 
    y = t[e[i] + "CancelAnimationFrame"] || t[e[i] + "CancelRequestAnimationFrame"];
    p("Ticker", function(t, e) {
        var i, s, a, o, h, l = this, u = k(), m = e !== !1 && P, f = function(t) {
            l.time = (k() - u) / 1e3;
            var e = a, n = l.time - h;
            (!i || n > 0 || t === !0) && (l.frame++, h += n + (n >= o ? .004 : o - n), l.dispatchEvent("tick")), 
            t !== !0 && e === a && (a = s(f));
        };
        w.call(l), this.time = this.frame = 0, this.tick = function() {
            f(!0);
        }, this.sleep = function() {
            null != a && (m && y ? y(a) : clearTimeout(a), s = _, a = null, l === n && (r = !1));
        }, this.wake = function() {
            null !== a && l.sleep(), s = 0 === i ? _ : m && P ? P : function(t) {
                return setTimeout(t, 0 | 1e3 * (h - l.time) + 1);
            }, l === n && (r = !0), f(2);
        }, this.fps = function(t) {
            return arguments.length ? (i = t, o = 1 / (i || 60), h = this.time + o, void l.wake()) : i;
        }, this.useRAF = function(t) {
            return arguments.length ? (l.sleep(), m = t, void l.fps(i)) : m;
        }, l.fps(t), setTimeout(function() {
            m && (!a || 5 > l.frame) && l.useRAF(!1);
        }, 1500);
    }), s = h.Ticker.prototype = new h.events.EventDispatcher(), s.constructor = h.Ticker;
    var b = p("core.Animation", function(t, e) {
        if (this.vars = e || {}, this._duration = this._totalDuration = t || 0, this._delay = Number(this.vars.delay) || 0, 
        this._timeScale = 1, this._active = this.vars.immediateRender === !0, this.data = this.vars.data, 
        this._reversed = this.vars.reversed === !0, L) {
            r || n.wake();
            var i = this.vars.useFrames ? U : L;
            i.add(this, i._time), this.vars.paused && this.paused(!0);
        }
    });
    n = b.ticker = new h.Ticker(), s = b.prototype, s._dirty = s._gc = s._initted = s._paused = !1, 
    s._totalTime = s._time = 0, s._rawPrevTime = -1, s._next = s._last = s._onUpdate = s._timeline = s.timeline = null, 
    s._paused = !1, s.play = function(t, e) {
        return arguments.length && this.seek(t, e), this.reversed(!1).paused(!1);
    }, s.pause = function(t, e) {
        return arguments.length && this.seek(t, e), this.paused(!0);
    }, s.resume = function(t, e) {
        return arguments.length && this.seek(t, e), this.paused(!1);
    }, s.seek = function(t, e) {
        return this.totalTime(Number(t), e !== !1);
    }, s.restart = function(t, e) {
        return this.reversed(!1).paused(!1).totalTime(t ? -this._delay : 0, e !== !1, !0);
    }, s.reverse = function(t, e) {
        return arguments.length && this.seek(t || this.totalDuration(), e), this.reversed(!0).paused(!1);
    }, s.render = function() {}, s.invalidate = function() {
        return this;
    }, s._enabled = function(t, e) {
        return r || n.wake(), this._gc = !t, this._active = t && !this._paused && this._totalTime > 0 && this._totalTime < this._totalDuration, 
        e !== !0 && (t && !this.timeline ? this._timeline.add(this, this._startTime - this._delay) : !t && this.timeline && this._timeline._remove(this, !0)), 
        !1;
    }, s._kill = function() {
        return this._enabled(!1, !1);
    }, s.kill = function(t, e) {
        return this._kill(t, e), this;
    }, s._uncache = function(t) {
        for (var e = t ? this : this.timeline; e; ) e._dirty = !0, e = e.timeline;
        return this;
    }, s._swapSelfInParams = function(t) {
        for (var e = t.length, i = t.concat(); --e > -1; ) "{self}" === t[e] && (i[e] = this);
        return i;
    }, s.eventCallback = function(t, e, i, s) {
        if ("on" === (t || "").substr(0, 2)) {
            var n = this.vars;
            if (1 === arguments.length) return n[t];
            null == e ? delete n[t] : (n[t] = e, n[t + "Params"] = i instanceof Array && -1 !== i.join("").indexOf("{self}") ? this._swapSelfInParams(i) : i, 
            n[t + "Scope"] = s), "onUpdate" === t && (this._onUpdate = e);
        }
        return this;
    }, s.delay = function(t) {
        return arguments.length ? (this._timeline.smoothChildTiming && this.startTime(this._startTime + t - this._delay), 
        this._delay = t, this) : this._delay;
    }, s.duration = function(t) {
        return arguments.length ? (this._duration = this._totalDuration = t, this._uncache(!0), 
        this._timeline.smoothChildTiming && this._time > 0 && this._time < this._duration && 0 !== t && this.totalTime(this._totalTime * (t / this._duration), !0), 
        this) : (this._dirty = !1, this._duration);
    }, s.totalDuration = function(t) {
        return this._dirty = !1, arguments.length ? this.duration(t) : this._totalDuration;
    }, s.time = function(t, e) {
        return arguments.length ? (this._dirty && this.totalDuration(), this.totalTime(t > this._duration ? this._duration : t, e)) : this._time;
    }, s.totalTime = function(t, e, i) {
        if (r || n.wake(), !arguments.length) return this._totalTime;
        if (this._timeline) {
            if (0 > t && !i && (t += this.totalDuration()), this._timeline.smoothChildTiming) {
                this._dirty && this.totalDuration();
                var s = this._totalDuration, a = this._timeline;
                if (t > s && !i && (t = s), this._startTime = (this._paused ? this._pauseTime : a._time) - (this._reversed ? s - t : t) / this._timeScale, 
                a._dirty || this._uncache(!1), a._timeline) for (;a._timeline; ) a._timeline._time !== (a._startTime + a._totalTime) / a._timeScale && a.totalTime(a._totalTime, !0), 
                a = a._timeline;
            }
            this._gc && this._enabled(!0, !1), this._totalTime !== t && this.render(t, e, !1);
        }
        return this;
    }, s.startTime = function(t) {
        return arguments.length ? (t !== this._startTime && (this._startTime = t, this.timeline && this.timeline._sortChildren && this.timeline.add(this, t - this._delay)), 
        this) : this._startTime;
    }, s.timeScale = function(t) {
        if (!arguments.length) return this._timeScale;
        if (t = t || 1e-6, this._timeline && this._timeline.smoothChildTiming) {
            var e = this._pauseTime, i = e || 0 === e ? e : this._timeline.totalTime();
            this._startTime = i - (i - this._startTime) * this._timeScale / t;
        }
        return this._timeScale = t, this._uncache(!1);
    }, s.reversed = function(t) {
        return arguments.length ? (t != this._reversed && (this._reversed = t, this.totalTime(this._totalTime, !0)), 
        this) : this._reversed;
    }, s.paused = function(t) {
        if (!arguments.length) return this._paused;
        if (t != this._paused && this._timeline) {
            r || t || n.wake();
            var e = this._timeline, i = e.rawTime(), s = i - this._pauseTime;
            !t && e.smoothChildTiming && (this._startTime += s, this._uncache(!1)), this._pauseTime = t ? i : null, 
            this._paused = t, this._active = !t && this._totalTime > 0 && this._totalTime < this._totalDuration, 
            t || 0 === s || 0 === this._duration || this.render(e.smoothChildTiming ? this._totalTime : (i - this._startTime) / this._timeScale, !0, !0);
        }
        return this._gc && !t && this._enabled(!0, !1), this;
    };
    var S = p("core.SimpleTimeline", function(t) {
        b.call(this, 0, t), this.autoRemoveChildren = this.smoothChildTiming = !0;
    });
    s = S.prototype = new b(), s.constructor = S, s.kill()._gc = !1, s._first = s._last = null, 
    s._sortChildren = !1, s.add = s.insert = function(t, e) {
        var i, s;
        if (t._startTime = Number(e || 0) + t._delay, t._paused && this !== t._timeline && (t._pauseTime = t._startTime + (this.rawTime() - t._startTime) / t._timeScale), 
        t.timeline && t.timeline._remove(t, !0), t.timeline = t._timeline = this, t._gc && t._enabled(!0, !0), 
        i = this._last, this._sortChildren) for (s = t._startTime; i && i._startTime > s; ) i = i._prev;
        return i ? (t._next = i._next, i._next = t) : (t._next = this._first, this._first = t), 
        t._next ? t._next._prev = t : this._last = t, t._prev = i, this._timeline && this._uncache(!0), 
        this;
    }, s._remove = function(t, e) {
        return t.timeline === this && (e || t._enabled(!1, !0), t.timeline = null, t._prev ? t._prev._next = t._next : this._first === t && (this._first = t._next), 
        t._next ? t._next._prev = t._prev : this._last === t && (this._last = t._prev), 
        this._timeline && this._uncache(!0)), this;
    }, s.render = function(t, e, i) {
        var s, n = this._first;
        for (this._totalTime = this._time = this._rawPrevTime = t; n; ) s = n._next, (n._active || t >= n._startTime && !n._paused) && (n._reversed ? n.render((n._dirty ? n.totalDuration() : n._totalDuration) - (t - n._startTime) * n._timeScale, e, i) : n.render((t - n._startTime) * n._timeScale, e, i)), 
        n = s;
    }, s.rawTime = function() {
        return r || n.wake(), this._totalTime;
    };
    var A = p("TweenLite", function(e, i, s) {
        if (b.call(this, i, s), null == e) throw "Cannot tween a null target.";
        this.target = e = "string" != typeof e ? e : A.selector(e) || e;
        var n, r, a, o = e.jquery || e.length && e !== t && e[0] && (e[0] === t || e[0].nodeType && e[0].style && !e.nodeType), h = this.vars.overwrite;
        if (this._overwrite = h = null == h ? N[A.defaultOverwrite] : "number" == typeof h ? h >> 0 : N[h], 
        (o || e instanceof Array) && "number" != typeof e[0]) for (this._targets = a = l.call(e, 0), 
        this._propLookup = [], this._siblings = [], n = 0; a.length > n; n++) r = a[n], 
        r ? "string" != typeof r ? r.length && r !== t && r[0] && (r[0] === t || r[0].nodeType && r[0].style && !r.nodeType) ? (a.splice(n--, 1), 
        this._targets = a = a.concat(l.call(r, 0))) : (this._siblings[n] = F(r, this, !1), 
        1 === h && this._siblings[n].length > 1 && j(r, this, null, 1, this._siblings[n])) : (r = a[n--] = A.selector(r), 
        "string" == typeof r && a.splice(n + 1, 1)) : a.splice(n--, 1); else this._propLookup = {}, 
        this._siblings = F(e, this, !1), 1 === h && this._siblings.length > 1 && j(e, this, null, 1, this._siblings);
        (this.vars.immediateRender || 0 === i && 0 === this._delay && this.vars.immediateRender !== !1) && this.render(-this._delay, !1, !0);
    }, !0), x = function(e) {
        return e.length && e !== t && e[0] && (e[0] === t || e[0].nodeType && e[0].style && !e.nodeType);
    }, C = function(t, e) {
        var i, s = {};
        for (i in t) O[i] || i in e && "x" !== i && "y" !== i && "width" !== i && "height" !== i && "className" !== i && "border" !== i || !(!D[i] || D[i] && D[i]._autoCSS) || (s[i] = t[i], 
        delete t[i]);
        t.css = s;
    };
    s = A.prototype = new b(), s.constructor = A, s.kill()._gc = !1, s.ratio = 0, s._firstPT = s._targets = s._overwrittenProps = s._startAt = null, 
    s._notifyPluginsOfEnabled = !1, A.version = "1.10.1", A.defaultEase = s._ease = new v(null, null, 1, 1), 
    A.defaultOverwrite = "auto", A.ticker = n, A.autoSleep = !0, A.selector = t.$ || t.jQuery || function(e) {
        return t.$ ? (A.selector = t.$, t.$(e)) : t.document ? t.document.getElementById("#" === e.charAt(0) ? e.substr(1) : e) : e;
    };
    var R = A._internals = {}, D = A._plugins = {}, E = A._tweenLookup = {}, I = 0, O = R.reservedProps = {
        ease: 1,
        delay: 1,
        overwrite: 1,
        onComplete: 1,
        onCompleteParams: 1,
        onCompleteScope: 1,
        useFrames: 1,
        runBackwards: 1,
        startAt: 1,
        onUpdate: 1,
        onUpdateParams: 1,
        onUpdateScope: 1,
        onStart: 1,
        onStartParams: 1,
        onStartScope: 1,
        onReverseComplete: 1,
        onReverseCompleteParams: 1,
        onReverseCompleteScope: 1,
        onRepeat: 1,
        onRepeatParams: 1,
        onRepeatScope: 1,
        easeParams: 1,
        yoyo: 1,
        immediateRender: 1,
        repeat: 1,
        repeatDelay: 1,
        data: 1,
        paused: 1,
        reversed: 1,
        autoCSS: 1
    }, N = {
        none: 0,
        all: 1,
        auto: 2,
        concurrent: 3,
        allOnStart: 4,
        preexisting: 5,
        "true": 1,
        "false": 0
    }, U = b._rootFramesTimeline = new S(), L = b._rootTimeline = new S();
    L._startTime = n.time, U._startTime = n.frame, L._active = U._active = !0, b._updateRoot = function() {
        if (L.render((n.time - L._startTime) * L._timeScale, !1, !1), U.render((n.frame - U._startTime) * U._timeScale, !1, !1), 
        !(n.frame % 120)) {
            var t, e, i;
            for (i in E) {
                for (e = E[i].tweens, t = e.length; --t > -1; ) e[t]._gc && e.splice(t, 1);
                0 === e.length && delete E[i];
            }
            if (i = L._first, (!i || i._paused) && A.autoSleep && !U._first && 1 === n._listeners.tick.length) {
                for (;i && i._paused; ) i = i._next;
                i || n.sleep();
            }
        }
    }, n.addEventListener("tick", b._updateRoot);
    var F = function(t, e, i) {
        var s, n, r = t._gsTweenID;
        if (E[r || (t._gsTweenID = r = "t" + I++)] || (E[r] = {
            target: t,
            tweens: []
        }), e && (s = E[r].tweens, s[n = s.length] = e, i)) for (;--n > -1; ) s[n] === e && s.splice(n, 1);
        return E[r].tweens;
    }, j = function(t, e, i, s, n) {
        var r, a, o, h;
        if (1 === s || s >= 4) {
            for (h = n.length, r = 0; h > r; r++) if ((o = n[r]) !== e) o._gc || o._enabled(!1, !1) && (a = !0); else if (5 === s) break;
            return a;
        }
        var l, _ = e._startTime + 1e-10, u = [], m = 0, f = 0 === e._duration;
        for (r = n.length; --r > -1; ) (o = n[r]) === e || o._gc || o._paused || (o._timeline !== e._timeline ? (l = l || G(e, 0, f), 
        0 === G(o, l, f) && (u[m++] = o)) : _ >= o._startTime && o._startTime + o.totalDuration() / o._timeScale + 1e-10 > _ && ((f || !o._initted) && 2e-10 >= _ - o._startTime || (u[m++] = o)));
        for (r = m; --r > -1; ) o = u[r], 2 === s && o._kill(i, t) && (a = !0), (2 !== s || !o._firstPT && o._initted) && o._enabled(!1, !1) && (a = !0);
        return a;
    }, G = function(t, e, i) {
        for (var s = t._timeline, n = s._timeScale, r = t._startTime, a = 1e-10; s._timeline; ) {
            if (r += s._startTime, n *= s._timeScale, s._paused) return -100;
            s = s._timeline;
        }
        return r /= n, r > e ? r - e : i && r === e || !t._initted && 2 * a > r - e ? a : (r += t.totalDuration() / t._timeScale / n) > e + a ? 0 : r - e - a;
    };
    s._init = function() {
        var t, e, i, s, n = this.vars, r = this._overwrittenProps, a = this._duration, o = n.ease;
        if (n.startAt) {
            if (n.startAt.overwrite = 0, n.startAt.immediateRender = !0, this._startAt = A.to(this.target, 0, n.startAt), 
            n.immediateRender && (this._startAt = null, 0 === this._time && 0 !== a)) return;
        } else if (n.runBackwards && n.immediateRender && 0 !== a) if (this._startAt) this._startAt.render(-1, !0), 
        this._startAt = null; else if (0 === this._time) {
            i = {};
            for (s in n) O[s] && "autoCSS" !== s || (i[s] = n[s]);
            return i.overwrite = 0, void (this._startAt = A.to(this.target, 0, i));
        }
        if (this._ease = o ? o instanceof v ? n.easeParams instanceof Array ? o.config.apply(o, n.easeParams) : o : "function" == typeof o ? new v(o, n.easeParams) : g[o] || A.defaultEase : A.defaultEase, 
        this._easeType = this._ease._type, this._easePower = this._ease._power, this._firstPT = null, 
        this._targets) for (t = this._targets.length; --t > -1; ) this._initProps(this._targets[t], this._propLookup[t] = {}, this._siblings[t], r ? r[t] : null) && (e = !0); else e = this._initProps(this.target, this._propLookup, this._siblings, r);
        if (e && A._onPluginEvent("_onInitAllProps", this), r && (this._firstPT || "function" != typeof this.target && this._enabled(!1, !1)), 
        n.runBackwards) for (i = this._firstPT; i; ) i.s += i.c, i.c = -i.c, i = i._next;
        this._onUpdate = n.onUpdate, this._initted = !0;
    }, s._initProps = function(e, i, s, n) {
        var r, a, o, h, l, _;
        if (null == e) return !1;
        this.vars.css || e.style && e !== t && e.nodeType && D.css && this.vars.autoCSS !== !1 && C(this.vars, e);
        for (r in this.vars) {
            if (_ = this.vars[r], O[r]) _ instanceof Array && -1 !== _.join("").indexOf("{self}") && (this.vars[r] = _ = this._swapSelfInParams(_, this)); else if (D[r] && (h = new D[r]())._onInitTween(e, this.vars[r], this)) {
                for (this._firstPT = l = {
                    _next: this._firstPT,
                    t: h,
                    p: "setRatio",
                    s: 0,
                    c: 1,
                    f: !0,
                    n: r,
                    pg: !0,
                    pr: h._priority
                }, a = h._overwriteProps.length; --a > -1; ) i[h._overwriteProps[a]] = this._firstPT;
                (h._priority || h._onInitAllProps) && (o = !0), (h._onDisable || h._onEnable) && (this._notifyPluginsOfEnabled = !0);
            } else this._firstPT = i[r] = l = {
                _next: this._firstPT,
                t: e,
                p: r,
                f: "function" == typeof e[r],
                n: r,
                pg: !1,
                pr: 0
            }, l.s = l.f ? e[r.indexOf("set") || "function" != typeof e["get" + r.substr(3)] ? r : "get" + r.substr(3)]() : parseFloat(e[r]), 
            l.c = "string" == typeof _ && "=" === _.charAt(1) ? parseInt(_.charAt(0) + "1", 10) * Number(_.substr(2)) : Number(_) - l.s || 0;
            l && l._next && (l._next._prev = l);
        }
        return n && this._kill(n, e) ? this._initProps(e, i, s, n) : this._overwrite > 1 && this._firstPT && s.length > 1 && j(e, this, i, this._overwrite, s) ? (this._kill(i, e), 
        this._initProps(e, i, s, n)) : o;
    }, s.render = function(t, e, i) {
        var s, n, r, a = this._time;
        if (t >= this._duration) this._totalTime = this._time = this._duration, this.ratio = this._ease._calcEnd ? this._ease.getRatio(1) : 1, 
        this._reversed || (s = !0, n = "onComplete"), 0 === this._duration && ((0 === t || 0 > this._rawPrevTime) && this._rawPrevTime !== t && (i = !0, 
        this._rawPrevTime > 0 && (n = "onReverseComplete", e && (t = -1))), this._rawPrevTime = t); else if (1e-7 > t) this._totalTime = this._time = 0, 
        this.ratio = this._ease._calcEnd ? this._ease.getRatio(0) : 0, (0 !== a || 0 === this._duration && this._rawPrevTime > 0) && (n = "onReverseComplete", 
        s = this._reversed), 0 > t ? (this._active = !1, 0 === this._duration && (this._rawPrevTime >= 0 && (i = !0), 
        this._rawPrevTime = t)) : this._initted || (i = !0); else if (this._totalTime = this._time = t, 
        this._easeType) {
            var o = t / this._duration, h = this._easeType, l = this._easePower;
            (1 === h || 3 === h && o >= .5) && (o = 1 - o), 3 === h && (o *= 2), 1 === l ? o *= o : 2 === l ? o *= o * o : 3 === l ? o *= o * o * o : 4 === l && (o *= o * o * o * o), 
            this.ratio = 1 === h ? 1 - o : 2 === h ? o : .5 > t / this._duration ? o / 2 : 1 - o / 2;
        } else this.ratio = this._ease.getRatio(t / this._duration);
        if (this._time !== a || i) {
            if (!this._initted) {
                if (this._init(), !this._initted) return;
                this._time && !s ? this.ratio = this._ease.getRatio(this._time / this._duration) : s && this._ease._calcEnd && (this.ratio = this._ease.getRatio(0 === this._time ? 0 : 1));
            }
            for (this._active || !this._paused && this._time !== a && t >= 0 && (this._active = !0), 
            0 === a && (this._startAt && (t >= 0 ? this._startAt.render(t, e, i) : n || (n = "_dummyGS")), 
            this.vars.onStart && (0 !== this._time || 0 === this._duration) && (e || this.vars.onStart.apply(this.vars.onStartScope || this, this.vars.onStartParams || d))), 
            r = this._firstPT; r; ) r.f ? r.t[r.p](r.c * this.ratio + r.s) : r.t[r.p] = r.c * this.ratio + r.s, 
            r = r._next;
            this._onUpdate && (0 > t && this._startAt && this._startAt.render(t, e, i), e || this._onUpdate.apply(this.vars.onUpdateScope || this, this.vars.onUpdateParams || d)), 
            n && (this._gc || (0 > t && this._startAt && !this._onUpdate && this._startAt.render(t, e, i), 
            s && (this._timeline.autoRemoveChildren && this._enabled(!1, !1), this._active = !1), 
            !e && this.vars[n] && this.vars[n].apply(this.vars[n + "Scope"] || this, this.vars[n + "Params"] || d)));
        }
    }, s._kill = function(t, e) {
        if ("all" === t && (t = null), null == t && (null == e || e === this.target)) return this._enabled(!1, !1);
        e = "string" != typeof e ? e || this._targets || this.target : A.selector(e) || e;
        var i, s, n, r, a, o, h, l;
        if ((e instanceof Array || x(e)) && "number" != typeof e[0]) for (i = e.length; --i > -1; ) this._kill(t, e[i]) && (o = !0); else {
            if (this._targets) {
                for (i = this._targets.length; --i > -1; ) if (e === this._targets[i]) {
                    a = this._propLookup[i] || {}, this._overwrittenProps = this._overwrittenProps || [], 
                    s = this._overwrittenProps[i] = t ? this._overwrittenProps[i] || {} : "all";
                    break;
                }
            } else {
                if (e !== this.target) return !1;
                a = this._propLookup, s = this._overwrittenProps = t ? this._overwrittenProps || {} : "all";
            }
            if (a) {
                h = t || a, l = t !== s && "all" !== s && t !== a && (null == t || t._tempKill !== !0);
                for (n in h) (r = a[n]) && (r.pg && r.t._kill(h) && (o = !0), r.pg && 0 !== r.t._overwriteProps.length || (r._prev ? r._prev._next = r._next : r === this._firstPT && (this._firstPT = r._next), 
                r._next && (r._next._prev = r._prev), r._next = r._prev = null), delete a[n]), l && (s[n] = 1);
                !this._firstPT && this._initted && this._enabled(!1, !1);
            }
        }
        return o;
    }, s.invalidate = function() {
        return this._notifyPluginsOfEnabled && A._onPluginEvent("_onDisable", this), this._firstPT = null, 
        this._overwrittenProps = null, this._onUpdate = null, this._startAt = null, this._initted = this._active = this._notifyPluginsOfEnabled = !1, 
        this._propLookup = this._targets ? {} : [], this;
    }, s._enabled = function(t, e) {
        if (r || n.wake(), t && this._gc) {
            var i, s = this._targets;
            if (s) for (i = s.length; --i > -1; ) this._siblings[i] = F(s[i], this, !0); else this._siblings = F(this.target, this, !0);
        }
        return b.prototype._enabled.call(this, t, e), this._notifyPluginsOfEnabled && this._firstPT ? A._onPluginEvent(t ? "_onEnable" : "_onDisable", this) : !1;
    }, A.to = function(t, e, i) {
        return new A(t, e, i);
    }, A.from = function(t, e, i) {
        return i.runBackwards = !0, i.immediateRender = 0 != i.immediateRender, new A(t, e, i);
    }, A.fromTo = function(t, e, i, s) {
        return s.startAt = i, s.immediateRender = 0 != s.immediateRender && 0 != i.immediateRender, 
        new A(t, e, s);
    }, A.delayedCall = function(t, e, i, s, n) {
        return new A(e, 0, {
            delay: t,
            onComplete: e,
            onCompleteParams: i,
            onCompleteScope: s,
            onReverseComplete: e,
            onReverseCompleteParams: i,
            onReverseCompleteScope: s,
            immediateRender: !1,
            useFrames: n,
            overwrite: 0
        });
    }, A.set = function(t, e) {
        return new A(t, 0, e);
    }, A.killTweensOf = A.killDelayedCallsTo = function(t, e) {
        for (var i = A.getTweensOf(t), s = i.length; --s > -1; ) i[s]._kill(e, t);
    }, A.getTweensOf = function(t) {
        if (null == t) return [];
        t = "string" != typeof t ? t : A.selector(t) || t;
        var e, i, s, n;
        if ((t instanceof Array || x(t)) && "number" != typeof t[0]) {
            for (e = t.length, i = []; --e > -1; ) i = i.concat(A.getTweensOf(t[e]));
            for (e = i.length; --e > -1; ) for (n = i[e], s = e; --s > -1; ) n === i[s] && i.splice(e, 1);
        } else for (i = F(t).concat(), e = i.length; --e > -1; ) i[e]._gc && i.splice(e, 1);
        return i;
    };
    var Q = p("plugins.TweenPlugin", function(t, e) {
        this._overwriteProps = (t || "").split(","), this._propName = this._overwriteProps[0], 
        this._priority = e || 0, this._super = Q.prototype;
    }, !0);
    if (s = Q.prototype, Q.version = "1.10.1", Q.API = 2, s._firstPT = null, s._addTween = function(t, e, i, s, n, r) {
        var a, o;
        return null != s && (a = "number" == typeof s || "=" !== s.charAt(1) ? Number(s) - i : parseInt(s.charAt(0) + "1", 10) * Number(s.substr(2))) ? (this._firstPT = o = {
            _next: this._firstPT,
            t: t,
            p: e,
            s: i,
            c: a,
            f: "function" == typeof t[e],
            n: n || e,
            r: r
        }, o._next && (o._next._prev = o), o) : void 0;
    }, s.setRatio = function(t) {
        for (var e, i = this._firstPT, s = 1e-6; i; ) e = i.c * t + i.s, i.r ? e = 0 | e + (e > 0 ? .5 : -.5) : s > e && e > -s && (e = 0), 
        i.f ? i.t[i.p](e) : i.t[i.p] = e, i = i._next;
    }, s._kill = function(t) {
        var e, i = this._overwriteProps, s = this._firstPT;
        if (null != t[this._propName]) this._overwriteProps = []; else for (e = i.length; --e > -1; ) null != t[i[e]] && i.splice(e, 1);
        for (;s; ) null != t[s.n] && (s._next && (s._next._prev = s._prev), s._prev ? (s._prev._next = s._next, 
        s._prev = null) : this._firstPT === s && (this._firstPT = s._next)), s = s._next;
        return !1;
    }, s._roundProps = function(t, e) {
        for (var i = this._firstPT; i; ) (t[this._propName] || null != i.n && t[i.n.split(this._propName + "_").join("")]) && (i.r = e), 
        i = i._next;
    }, A._onPluginEvent = function(t, e) {
        var i, s, n, r, a, o = e._firstPT;
        if ("_onInitAllProps" === t) {
            for (;o; ) {
                for (a = o._next, s = n; s && s.pr > o.pr; ) s = s._next;
                (o._prev = s ? s._prev : r) ? o._prev._next = o : n = o, (o._next = s) ? s._prev = o : r = o, 
                o = a;
            }
            o = e._firstPT = n;
        }
        for (;o; ) o.pg && "function" == typeof o.t[t] && o.t[t]() && (i = !0), o = o._next;
        return i;
    }, Q.activate = function(t) {
        for (var e = t.length; --e > -1; ) t[e].API === Q.API && (D[new t[e]()._propName] = t[e]);
        return !0;
    }, f.plugin = function(t) {
        if (!(t && t.propName && t.init && t.API)) throw "illegal plugin definition.";
        var e, i = t.propName, s = t.priority || 0, n = t.overwriteProps, r = {
            init: "_onInitTween",
            set: "setRatio",
            kill: "_kill",
            round: "_roundProps",
            initAll: "_onInitAllProps"
        }, a = p("plugins." + i.charAt(0).toUpperCase() + i.substr(1) + "Plugin", function() {
            Q.call(this, i, s), this._overwriteProps = n || [];
        }, t.global === !0), o = a.prototype = new Q(i);
        o.constructor = a, a.API = t.API;
        for (e in r) "function" == typeof t[e] && (o[r[e]] = t[e]);
        return a.version = t.version, Q.activate([ a ]), a;
    }, e = t._gsQueue) {
        for (i = 0; e.length > i; i++) e[i]();
        for (s in u) u[s].func || t.console.log("GSAP encountered missing dependency: com.greensock." + s);
    }
    r = !1;
}(window);

var DefaultButton = Class.extend({
    init: function(imgUp, imgOver, imgDown) {
        imgDown || (imgDown = imgOver), this.container = new PIXI.DisplayObjectContainer(), 
        this.textureButton = PIXI.Texture.fromImage(imgUp), this.textureButtonDown = PIXI.Texture.fromImage(imgDown), 
        this.textureButtonOver = PIXI.Texture.fromImage(imgOver), this.shapeButton = new PIXI.Sprite(this.textureButton), 
        this.isOver = !1, this.isdown = !1, this.width = 10, this.height = 10, this.clickCallback = null, 
        this.mouseDownCallback = null, this.mouseUpCallback = null, this.container.addChild(this.shapeButton);
    },
    destroy: function() {
        this.textureButton.destroy(), this.textureButtonDown.destroy(), this.textureButtonOver.destroy(), 
        delete this.container;
    },
    build: function(width, height) {
        var that = this;
        this.width = width ? width : this.shapeButton.width, this.height = height ? height : this.shapeButton.height, 
        this.shapeButton.buttonMode = !0, this.shapeButton.position.x = 0, this.shapeButton.position.y = 0, 
        width && (this.shapeButton.width = this.width), height && (this.shapeButton.height = this.height), 
        this.shapeButton.interactive = !0, this.shapeButton.mousedown = this.shapeButton.touchstart = function() {
            null != that.mouseDownCallback && that.mouseDownCallback(), that.isdown = !0, that.shapeButton.setTexture(that.textureButtonDown), 
            that.alpha = 1;
        }, this.shapeButton.mouseup = this.shapeButton.touchend = this.shapeButton.touchoutside = this.shapeButton.mouseuoutside = this.shapeButton.touchendoutside = function() {
            this.isdown = !1, null != that.mouseUpCallback && that.mouseUpCallback(), that.shapeButton.setTexture(that.isOver ? that.textureButtonOver : that.textureButton);
        }, this.shapeButton.mouseover = function() {
            that.isOver = !0, that.shapeButton.setTexture(that.textureButtonOver);
        }, this.shapeButton.mouseout = function() {
            that.isOver = !1, that.shapeButton.setTexture(that.textureButton);
        }, this.shapeButton.click = function() {
            null != that.clickCallback && that.clickCallback();
        }, this.shapeButton.tap = function() {
            null != that.clickCallback && that.clickCallback();
        };
    },
    addLabel: function(text, marginX, marginY, autoAlign, acressX, acressY) {
        if (this.container.addChild(text), marginX || (marginX = 0), marginY || (marginY = 0), 
        text.position.x = this.shapeButton.position.x, text.position.y = this.shapeButton.position.y, 
        autoAlign) {
            var scaleFactorX = (this.shapeButton.width - 2 * marginX) / text.width, scaleFactorY = (this.shapeButton.height - 2 * marginY) / text.height;
            scaleFactorY > scaleFactorX ? scaleFactorY = scaleFactorX : scaleFactorX = scaleFactorY, 
            text.width *= scaleFactorX, text.height *= scaleFactorY, text.position.x = this.shapeButton.position.x + this.shapeButton.width / 2 - text.width / 2 + acressX, 
            text.position.y = this.shapeButton.position.y + this.shapeButton.height / 2 - text.height / 2 + acressY;
        } else text.position.x = this.shapeButton.position.x + marginX, text.position.y = this.shapeButton.position.y + marginY;
    },
    setPosition: function(x, y) {
        this.container.position.x = x, this.container.position.y = y;
    },
    getContent: function() {
        return this.container;
    },
    destroy: function() {}
}), AbstractApplication = Class.extend({
    init: function(canvasWidth, canvasHeight) {
        this.stage = new PIXI.Stage(6750105, !0), this.canvasWidth = canvasWidth, this.canvasHeight = canvasHeight, 
        this.screenManager = new ScreenManager(), this.screenManager.build("MainScreenManager"), 
        this.screenManager.setCanvasArea(canvasWidth, canvasHeight), this.stage.addChild(this.screenManager.container), 
        this.loader, this.loadPercent, this.loadText = new PIXI.Text("0%", {
            font: "20px Luckiest Guy",
            fill: "black",
            align: "center"
        }), this.stage.addChild(this.loadText), this.loadText.position.x = this.canvasWidth / 2 - this.loadText.width / 2, 
        this.loadText.position.y = this.canvasHeight / 2 - this.loadText.height / 2;
    },
    build: function() {},
    update: function() {
        this.screenManager.update();
    },
    initLoad: function() {
        var that = this;
        this.loader.onComplete = function() {
            that.onAssetsLoaded();
        }, this.loader.onProgress = function() {
            that.onProgress();
        }, this.loader.load();
    },
    onAssetsLoaded: function() {},
    onProgress: function() {
        this.loadPercent = (this.loader.assetURLs.length - this.loader.loadCount) / this.loader.assetURLs.length, 
        this.stage.removeChild(this.loadText), this.loadText = new PIXI.Text(Math.floor(100 * this.loadPercent) + "%", {
            fill: "black",
            align: "center"
        }), this.stage.addChild(this.loadText), this.loadText.position.x = this.canvasWidth / 2 - this.loadText.width / 2, 
        this.loadText.position.y = this.canvasHeight / 2 - this.loadText.height / 2;
    }
}), Entity = Class.extend({
    init: function() {
        this.texture = "", this.sprite = "", this.velocity = {
            x: 0,
            y: 0
        }, this.centerPosition = {
            x: 0,
            y: 0
        }, this.gravity = 0, this.kill = !1, this.updateable = !0, this.boundsCollision = !1, 
        this.range = 10, this.collidable = !0, this.virtualVelocity = {
            x: 0,
            y: 0
        }, this.layer, this.jumpPower = 2, this.life = 2, this.collisionPointsMarginDivide = 8, 
        this.defaultVelocity = 0;
    },
    build: function(img) {
        this.texture = PIXI.Texture.fromImage(img), this.sprite = new PIXI.Sprite(this.texture), 
        this.sprite.anchor.x = .5, this.sprite.anchor.y = .5;
    },
    getBounds: function() {
        return this.bounds = {
            x: this.getPosition().x - this.width * this.sprite.anchor.x,
            y: this.getPosition().y - this.height * this.sprite.anchor.y,
            w: this.sprite.width,
            h: this.sprite.height
        }, this.bounds;
    },
    debugPolygon: function(color, force) {
        if (this.polygon && this.polygon.points && (this.lastColorDebug !== color || force)) {
            null === this.debugGraphic.parent && null !== this.getContent().parent && this.getContent().parent.addChild(this.debugGraphic), 
            this.lastColorDebug = color, this.gambAcum++, void 0 !== this.debugGraphic ? this.debugGraphic.clear() : this.debugGraphic = new PIXI.Graphics(), 
            this.debugGraphic.beginFill(color, .5), this.debugGraphic.lineStyle(1, 16767232), 
            this.debugGraphic.moveTo(this.polygon.points[this.polygon.points.length - 1].x, this.polygon.points[this.polygon.points.length - 1].y);
            for (var i = this.polygon.points.length - 2; i >= 0; i--) this.debugGraphic.lineTo(this.polygon.points[i].x, this.polygon.points[i].y);
            this.debugGraphic.endFill();
        }
    },
    updateCollisionPoints: function(makePoly) {
        this.collisionPoints = {
            up: {
                x: this.bounds.x + this.bounds.w / 2,
                y: this.bounds.y
            },
            down: {
                x: this.bounds.x + this.bounds.w / 2,
                y: this.bounds.y + this.bounds.h
            },
            bottomLeft: {
                x: this.bounds.x,
                y: this.bounds.y + this.bounds.h - this.bounds.h / this.collisionPointsMarginDivide
            },
            topLeft: {
                x: this.bounds.x,
                y: this.bounds.y + this.bounds.h / this.collisionPointsMarginDivide
            },
            bottomRight: {
                x: this.bounds.x + this.bounds.w,
                y: this.bounds.y + this.bounds.h - this.bounds.h / this.collisionPointsMarginDivide
            },
            topRight: {
                x: this.bounds.x + this.bounds.w,
                y: this.bounds.y + this.bounds.h / this.collisionPointsMarginDivide
            }
        }, makePoly && (this.polygon = new PIXI.Polygon(new PIXI.Point(this.bounds.x + this.bounds.w / 2, this.bounds.y), new PIXI.Point(this.bounds.x, this.bounds.y + this.bounds.h / this.collisionPointsMarginDivide), new PIXI.Point(this.bounds.x, this.bounds.y + this.bounds.h - this.bounds.h / this.collisionPointsMarginDivide), new PIXI.Point(this.bounds.x + this.bounds.w / 2, this.bounds.y + this.bounds.h), new PIXI.Point(this.bounds.x + this.bounds.w, this.bounds.y + this.bounds.h - this.bounds.h / this.collisionPointsMarginDivide), new PIXI.Point(this.bounds.x + this.bounds.w, this.bounds.y + this.bounds.h / this.collisionPointsMarginDivide)));
    },
    preKill: function() {
        this.kill = !0;
    },
    setParentLayer: function(parentLayer) {
        this.layer = parentLayer;
    },
    setScale: function(x, y) {
        this.sprite.scale.x = x, this.sprite.scale.y = y;
    },
    getContent: function() {
        return this.sprite;
    },
    getPosition: function() {
        return this.sprite.position;
    },
    setPosition: function(x, y) {
        this.sprite.position.x = x, this.sprite.position.y = y;
    },
    setVelocity: function(x, y) {
        this.velocity.x = x, this.velocity.y = y;
    },
    update: function() {
        this.sprite.position.x += this.velocity.x, this.sprite.position.y += this.velocity.y;
    },
    applyGravity: function() {
        this.velocity.y += this.gravity;
    },
    jump: function() {
        this.velocity.y = -this.jumpPower;
    },
    setGravity: function(gravity) {
        this.gravity = gravity;
    },
    collide: function() {}
}), SpritesheetEntity = Entity.extend({
    init: function() {
        this._super(!0), this.spritesheet;
    },
    build: function(spSheet) {
        this.spritesheet = spSheet, this.spritesheet.setPosition(100, 100), this.setVelocity(1, 1);
    },
    setPosition: function(x, y) {
        this.spritesheet && (this.spritesheet.position.x = x, this.spritesheet.position.y = y, 
        this.spritesheet.setPosition(x, y));
    },
    setScale: function(scaleX, scaleY) {
        this.spritesheet.scale.x = scaleX, this.spritesheet.scale.y = scaleY, this.spritesheet.texture.scale.x = this.spritesheet.scale.x, 
        this.spritesheet.texture.scale.y = this.spritesheet.scale.y, this.spritesheet.updateFrame();
    },
    getBounds: function() {
        return this.bounds = {
            x: this.getPosition().x,
            y: this.getPosition().y,
            w: this.width,
            h: this.height
        }, this.centerPosition = {
            x: this.width / 2,
            y: this.height / 2
        }, this.collisionPoints = {
            up: {
                x: this.bounds.x + this.bounds.w / 2,
                y: this.bounds.y
            },
            down: {
                x: this.bounds.x + this.bounds.w / 2,
                y: this.bounds.y + this.bounds.h
            },
            bottomLeft: {
                x: this.bounds.x,
                y: this.bounds.y + this.bounds.h
            },
            topLeft: {
                x: this.bounds.x,
                y: this.bounds.y
            },
            bottomRight: {
                x: this.bounds.x + this.bounds.w,
                y: this.bounds.y + this.bounds.h
            },
            topRight: {
                x: this.bounds.x + this.bounds.w,
                y: this.bounds.y
            }
        }, this.bounds;
    },
    getPosition: function() {
        return this.spritesheet.position;
    },
    getTexture: function() {
        return this.spritesheet.texture.texture;
    },
    getContent: function() {
        return this.spritesheet.container;
    },
    update: function() {
        this.spritesheet.position.x += this.velocity.x, this.spritesheet.position.y += this.velocity.y;
        var temp = {
            x: this.spritesheet.position.x + this.velocity.x,
            y: this.spritesheet.position.y + this.velocity.y
        };
        this.spritesheet.setPosition(temp.x, temp.y), this.spritesheet.update();
    },
    getFramesByRange: function(label, init, end, type) {
        for (var tempArray = new Array(), tempI = "", i = init; end >= i; i++) 10 > i ? tempI = "00" + i : 100 > i ? tempI = "0" + i : 1e3 > i && (tempI = i), 
        tempArray.push(label + tempI);
        if ("pingPong" == type) for (var i = end - 1; i > init; i--) 10 > i ? tempI = "00" + i : 100 > i ? tempI = "0" + i : 1e3 > i && (tempI = i), 
        tempArray.push(label + tempI);
        return tempArray;
    }
}), Layer = Class.extend({
    init: function() {
        this.childs = new Array(), this.name, this.container = new PIXI.DisplayObjectContainer(), 
        this.updateable = !0, this.layerManager = null, this.kill = !1;
    },
    build: function(name) {
        this.name = name;
    },
    getContent: function() {
        return this.container;
    },
    addChild: function(child) {
        this.childs.push(child), this.container.addChild(child.getContent()), child.setParentLayer(this);
    },
    removeChild: function(child) {
        for (var i = 0; i < this.childs.length; i++) if (this.childs[i] == child) return this.childs.splice(i, 1), 
        void this.container.removeChild(child.getContent());
    },
    update: function() {
        for (var i = 0; i < this.childs.length; i++) this.childs[i].kill && this.removeChild(this.childs[i]), 
        this.childs[i] && this.childs[i].updateable && this.childs[i].update();
    },
    collideChilds: function(child) {
        if (child && child.collidable) {
            for (var isCollide = !1, objectCollided = new Array(), i = 0; i < this.childs.length; i++) this.childs[i] != child && this.childs[i].collidable && Math.abs(child.range + this.childs[i].range) > 0 && this.pointDistance(child.getPosition().x + child.centerPosition.x, child.getPosition().y + child.centerPosition.y, this.childs[i].getPosition().x + this.childs[i].centerPosition.x, this.childs[i].getPosition().y + this.childs[i].centerPosition.y) < child.range + this.childs[i].range && (objectCollided.push(this.childs[i]), 
            isCollide = !0);
            isCollide && child.collide(objectCollided);
        }
    },
    pointDistance: function(x, y, x0, y0) {
        return Math.sqrt((x -= x0) * x + (y -= y0) * y);
    },
    setManager: function(layerManager) {
        this.layerManager = layerManager;
    }
}), LayerManager = Class.extend({
    init: function() {
        this.childs = new Array(), this.name, this.container = new PIXI.DisplayObjectContainer(), 
        this.updateable = !0;
    },
    build: function(name) {
        this.name = name;
    },
    addLayer: function(layer) {
        this.childs.push(layer), this.container.addChild(layer.container), layer.setManager(this);
    },
    getContent: function() {
        return this.container;
    },
    removeChild: function(child) {
        for (var i = 0; i < this.childs.length; i++) if (this.childs[i] == child) return this.childs.splice(i, 1), 
        void this.container.removeChild(child.getContent());
    },
    update: function() {
        for (var i = 0; i < this.childs.length; i++) this.childs[i].kill && this.removeChild(this.childs[i]), 
        this.childs[i] && this.childs[i].updateable && this.childs[i].update();
    }
}), AbstractScreen = Class.extend({
    init: function(label) {
        this.screenLabel = label, this.screenManager = null, this.childs = [], this.outCallback = null, 
        this.container = new PIXI.DisplayObjectContainer(), this.updateable = !0, this.layerManager = null, 
        this.canvasArea = {
            x: 0,
            y: 0
        }, this.loader, this.loadPercent, this.JSONloader, this.JSONloadPercent, this.jsonLoaded = !0, 
        this.assetsLoaded = !0;
    },
    initJSONLoad: function() {
        this.jsonLoaded = !1;
        var that = this;
        this.JSONloader.onComplete = function() {
            that.jsonLoaded = !0, that.onJSONLoaded();
        }, this.JSONloader.onProgress = function() {
            that.onProgress();
        }, this.JSONloader.load();
    },
    initLoad: function() {
        this.assetsLoaded = !1;
        var that = this;
        this.loader.onComplete = function() {
            that.assetsLoaded = !0, that.onAssetsLoaded();
        }, this.loader.onProgress = function() {
            that.onProgress();
        }, this.loader.load();
    },
    build: function() {
        AbstractScreen.debug && console.log("build", this.screenLabel);
    },
    getContent: function() {
        return this.container;
    },
    onJSONLoaded: function() {},
    onAssetsLoaded: function() {},
    onProgress: function() {
        this.loadPercent = (this.loader.assetURLs.length - this.loader.loadCount) / this.loader.assetURLs.length;
    },
    addChild: function(child) {
        this.childs.push(child), this.container.addChild(void 0 != child.getContent ? child.getContent() : child);
    },
    removeChild: function(child) {
        child instanceof PIXI.Text;
        for (var i = 0; i < this.childs.length; i++) if (this.childs[i] == child) return this.childs.splice(i, 1), 
        void (this.container && this.container.removeChild(void 0 != child.getContent ? child.getContent() : child));
    },
    update: function() {
        for (var i = 0; i < this.childs.length; i++) this.childs[i].kill && this.removeChild(this.childs[i]), 
        this.childs[i] && this.childs[i].updateable && this.childs[i].update();
    },
    transitionIn: function() {
        AbstractScreen.debug && console.log("transitionIn", this.screenLabel), this.build();
    },
    transitionOut: function(nextScreen, container) {
        AbstractScreen.debug && console.log("transitionOut", this.screenLabel, "to", nextScreen.screenLabel), 
        this.destroy(), container.removeChild(this.getContent()), nextScreen.transitionIn();
    },
    destroy: function() {
        for (AbstractScreen.debug && console.log("destroy", this.screenLabel); this.childs.length > 0; ) {
            var temp = this.childs[0];
            this.removeChild(this.childs[0]), "function" == typeof temp.destroy && temp.destroy(), 
            delete temp;
        }
        this.childs = new Array();
    }
}), ScreenManager = Class.extend({
    init: function() {
        this.label = "", this.childs = [], this.container = new PIXI.DisplayObjectContainer(), 
        this.currentScreen = null, this.lastScreenLabel = null, this.nextScreen = null, 
        this.canvasArea = {
            x: 0,
            y: 0
        };
    },
    build: function(label) {
        this.label = label;
    },
    addScreen: function(screen) {
        null === this.currentScreen && (this.currentScreen = screen), this.childs.push(screen), 
        screen.canvasArea = this.canvasArea, screen.screenManager = this;
    },
    prevScreen: function() {
        this.change(this.lastScreenLabel);
    },
    change: function(screenLabel) {
        ScreenManager.debug && console.log("change to", screenLabel);
        for (var i = 0; i < this.childs.length; i++) this.childs[i].screenLabel == screenLabel && (this.nextScreen = this.childs[i], 
        this.currentScreen && this.currentScreen.getContent().parent ? (this.currentScreen.transitionOut(this.nextScreen, this.container), 
        this.container.addChild(this.nextScreen.getContent())) : (this.nextScreen.transitionIn(), 
        this.container.addChild(this.nextScreen.getContent())), this.lastScreenLabel = this.currentScreen.screenLabel, 
        this.currentScreen = this.nextScreen);
    },
    update: function() {
        null != this.currentScreen && this.currentScreen.update();
    },
    setCanvasArea: function(canvasWidth, canvasHeight) {
        this.canvasArea.x = canvasWidth, this.canvasArea.y = canvasHeight;
    }
}), BoundCollisionSystem = Class.extend({
    init: function(container, debug) {
        this.container = container, debug && (this.graphDebug = new PIXI.Graphics(), this.graphDebug && this.container.addChild(this.graphDebug));
    },
    applyCollision: function(env, entities, colEntitiesTypes, precise) {
        var tempEnv = null, tempEntity = null, tempEnvBounds = null, tempEntityBounds = null;
        this.graphDebug && (this.graphDebug.clear(), this.graphDebug.beginFill(16711680), 
        this.graphDebug.lineStyle(5, 16711680));
        for (var i = env.length - 1; i >= 0; i--) {
            var isTouch = !1;
            if (tempEnv = env[i], "environment" === tempEnv.type && tempEnv.collidable) {
                tempEnvBounds = tempEnv.getBounds();
                for (var j = entities.length - 1; j >= 0; j--) if (tempEntity = entities[j], "environment" !== tempEntity.type && tempEntity.collidable) {
                    if (tempEntityBounds = tempEntity.getBounds(), tempEntityBounds.y += tempEntity.virtualVelocity.y, 
                    tempEntityBounds.x += tempEntity.virtualVelocity.x, this.testBoundsCollide(tempEnvBounds, tempEntityBounds)) {
                        var tempBounds = {
                            x: 0,
                            y: 0,
                            w: 1,
                            h: 1
                        }, touchCollection = {
                            object: tempEnv,
                            up: !1,
                            down: !1,
                            left: !1,
                            right: !1,
                            middleUp: !1,
                            middleDown: !1,
                            bottomLeft: !1,
                            bottomRight: !1,
                            topLeft: !1,
                            topRight: !1
                        };
                        tempEntity.boundsCollision ? (tempBounds.x = tempEntityBounds.x + Math.abs(2 * tempEntity.defaultVelocity), 
                        tempBounds.y = tempEntity.collisionPoints.up.y + 2 * tempEntity.virtualVelocity.y, 
                        tempBounds.w = tempEntityBounds.w - Math.abs(2 * tempEntity.defaultVelocity * 2), 
                        tempBounds.h = 1, this.graphDebug && this.graphDebug.drawRect(tempBounds.x, tempBounds.y, tempBounds.w, tempBounds.h), 
                        this.testBoundsCollide(tempEnvBounds, tempBounds) && tempEntity.virtualVelocity.y < 0 && (touchCollection.up = !0), 
                        tempBounds.x = tempEntityBounds.x + Math.abs(2 * tempEntity.defaultVelocity), tempBounds.y = tempEntity.collisionPoints.down.y + 2 * tempEntity.virtualVelocity.y, 
                        tempBounds.w = tempEntityBounds.w - Math.abs(2 * tempEntity.defaultVelocity * 2), 
                        tempBounds.h = 1, this.graphDebug && this.graphDebug.drawRect(tempBounds.x, tempBounds.y, tempBounds.w, tempBounds.h), 
                        this.testBoundsCollide(tempEnvBounds, tempBounds) && tempEntity.virtualVelocity.y > 0 && (touchCollection.down = !0), 
                        tempBounds.w = 1, tempBounds.x = tempEntity.collisionPoints.topLeft.x + 2 * tempEntity.virtualVelocity.x, 
                        tempBounds.y = tempEntity.collisionPoints.topLeft.y + Math.abs(2 * tempEntity.defaultVelocity), 
                        tempBounds.h = Math.abs(tempEntity.collisionPoints.topLeft.y - tempEntity.collisionPoints.bottomLeft.y) - Math.abs(2 * tempEntity.defaultVelocity * 2), 
                        this.graphDebug && this.graphDebug.drawRect(tempBounds.x, tempBounds.y, tempBounds.w, tempBounds.h), 
                        this.testBoundsCollide(tempEnvBounds, tempBounds) && tempEntity.virtualVelocity.x < 0 && (touchCollection.left = !0), 
                        tempBounds.w = 1, tempBounds.x = tempEntity.collisionPoints.topRight.x + 2 * tempEntity.virtualVelocity.x, 
                        tempBounds.y = tempEntity.collisionPoints.topRight.y + Math.abs(2 * tempEntity.defaultVelocity), 
                        tempBounds.h = Math.abs(tempEntity.collisionPoints.topRight.y - tempEntity.collisionPoints.bottomRight.y) - Math.abs(2 * tempEntity.defaultVelocity * 2), 
                        this.graphDebug && this.graphDebug.drawRect(tempBounds.x, tempBounds.y, tempBounds.w, tempBounds.h), 
                        this.testBoundsCollide(tempEnvBounds, tempBounds) && tempEntity.virtualVelocity.x > 0 && (touchCollection.right = !0), 
                        precise && (tempBounds.w = 1, tempBounds.h = 1, tempBounds.x = tempEntity.collisionPoints.down.x, 
                        tempBounds.y = tempEntityBounds.y, this.testBoundsCollide(tempEnvBounds, tempBounds) && (touchCollection.middleUp = !0), 
                        tempBounds.w = 1, tempBounds.x = tempEntity.collisionPoints.down.x, tempBounds.y = tempEntity.collisionPoints.down.y, 
                        this.testBoundsCollide(tempEnvBounds, tempBounds) && (touchCollection.middleDown = !0), 
                        tempBounds.x = tempEntity.collisionPoints.bottomLeft.x, tempBounds.y = tempEntity.collisionPoints.bottomLeft.y, 
                        this.testBoundsCollide(tempEnvBounds, tempBounds) && (touchCollection.bottomLeft = !0), 
                        tempBounds.x = tempEntity.collisionPoints.bottomRight.x, tempBounds.y = tempEntity.collisionPoints.bottomRight.y, 
                        this.testBoundsCollide(tempEnvBounds, tempBounds) && (touchCollection.bottomRight = !0), 
                        tempBounds.x = tempEntity.collisionPoints.topLeft.x, tempBounds.y = tempEntity.collisionPoints.topLeft.y, 
                        this.testBoundsCollide(tempEnvBounds, tempBounds) && (touchCollection.topLeft = !0), 
                        tempBounds.x = tempEntity.collisionPoints.topRight.x, tempBounds.y = tempEntity.collisionPoints.topRight.y, 
                        this.testBoundsCollide(tempEnvBounds, tempBounds) && (touchCollection.topRight = !0)), 
                        tempEntity.touch(touchCollection)) : tempEntity && tempEntity.touch && tempEntity.touch(touchCollection), 
                        isTouch = !0;
                    }
                    tempEntity.isTouch = isTouch;
                }
            }
        }
    },
    testBoundsCollide: function(bound1, bound2) {
        return bound1.x + bound1.w > bound2.x && bound1.x < bound2.x + bound2.w && bound1.y + bound1.h > bound2.y && bound1.y < bound2.y + bound2.h;
    }
}), ArrayUtils = {
    shuffle: function(array) {
        for (var temporaryValue, randomIndex, currentIndex = array.length; 0 !== currentIndex; ) randomIndex = Math.floor(Math.random() * currentIndex), 
        currentIndex -= 1, temporaryValue = array[currentIndex], array[currentIndex] = array[randomIndex], 
        array[randomIndex] = temporaryValue;
        return array;
    }
}, SimpleEntity = Class.extend({
    init: function(img) {
        this.texture = "string" == typeof img ? new PIXI.Texture.fromImage(img) : img, this.container = new PIXI.Sprite(this.texture), 
        this.velocity = {
            x: 0,
            y: 0
        }, this.updateable = !0;
    },
    update: function() {
        this.container.position.x += this.velocity.x, this.container.position.y += this.velocity.y;
    },
    getContent: function() {
        return this.container;
    },
    preKill: function() {
        this.kill = !0;
    },
    setParentLayer: function(parentLayer) {
        this.layer = parentLayer;
    },
    setPosition: function(x, y) {
        this.container.position.x = x, this.container.position.y = y;
    }
}), SimpleSprite = Class.extend({
    init: function(img) {
        this.texture = "string" == typeof img ? new PIXI.Texture.fromImage(img) : img, this.container = new PIXI.Sprite(this.texture);
    },
    getContent: function() {
        return this.container;
    },
    setPosition: function(x, y) {
        this.container.position.x = x, this.container.position.y = y;
    }
}), Spritesheet = Class.extend({
    init: function() {
        this.animations = [], this.currentAnimation = null, this.texture = null, this.timeElapsed = 0, 
        this.currentFrame = 0, this.container = new PIXI.DisplayObjectContainer(), this.position = {
            x: 0,
            y: 0
        }, this.scale = {
            x: 1,
            y: 1
        };
    },
    build: function() {},
    setFrame: function(frame) {
        this.currentAnimation = null, this.currentFrame = frame;
    },
    setScale: function(scaleX, scaleY) {
        this.scale.x = scaleX, this.scale.y = scaleY, this.texture.scale.x = this.scale.x, 
        this.texture.scale.y = this.scale.y, this.updateFrame();
    },
    addAnimation: function(animation) {
        this.animations.push(animation), null == this.texture && (this.currentAnimation = animation, 
        this.texture = PIXI.Sprite.fromFrame(this.currentAnimation.frames[this.currentAnimation.currentID]), 
        this.container.addChild(this.texture));
    },
    play: function(label) {
        for (var i = 0; i < this.animations.length; i++) this.animations[i].label == label && (this.currentAnimation = this.animations[i]), 
        this.currentAnimation.repeat || (this.currentAnimation.currentID = 0);
    },
    setPosition: function(x, y) {
        this.position.x = x, this.position.y = y, this.texture.position.x = this.position.x - this.texture.width / 2, 
        this.texture.position.y = this.position.y - this.texture.height / 2, this.updateFrame();
    },
    update: function() {
        var stop = !1;
        null != this.currentAnimation && (this.timeElapsed > this.currentAnimation.timeFrame ? (this.currentAnimation.currentID++, 
        this.currentAnimation.currentID >= this.currentAnimation.frames.length && (this.currentAnimation.currentID = this.currentAnimation.repeat ? 0 : this.currentAnimation.frames.length - 1, 
        null != this.currentAnimation.callback && this.currentAnimation.callback()), this.timeElapsed = 0, 
        stop || this.updateFrame()) : this.timeElapsed++);
    },
    updateFrame: function() {
        this.container.removeChild(this.texture);
        var frameID = 0;
        frameID = null == this.currentAnimation ? this.currentFrame : this.currentAnimation.frames[this.currentAnimation.currentID], 
        this.texture = PIXI.Sprite.fromFrame(frameID), this.texture.scale.x = this.scale.x, 
        this.texture.scale.y = this.scale.y, this.texture.position.x = this.position.x - this.texture.width / 2, 
        this.texture.position.y = this.position.y - this.texture.height / 2, this.container.addChild(this.texture);
    }
}), SpritesheetAnimation = Class.extend({
    init: function() {
        this.label = "", this.frames = [], this.timeFrame = 0, this.currentID = 0, this.callback = null, 
        this.repeat = !0;
    },
    build: function(label, frames, timeFrame, repeat, callback) {
        this.callback = callback, this.label = label, this.frames = frames, this.timeFrame = timeFrame, 
        this.repeat = repeat;
    }
});