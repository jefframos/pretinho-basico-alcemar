/*jshint undef:false */
var ServerApi = Class.extend({
    init: function() {
        this.endpoint = 'http://pretinho-server-dev.elasticbeanstalk.com/';

        this.token = null;

        document.addEventListener('deviceready', function() {
            this.fetchToken();
        });
    },

    fetchToken: function() {
        var self = this;
        intel.security.secureStorage.read(
            function(instanceID) {
                intel.security.secureData.getData(
                    function(data) {
                        self.token = data;
                    },
                    function(errorObj) {
                        console.log('fail: code = ' + errorObj.code + ', message = ' + errorObj.message);
                    },
                    instanceID
                );
            },
            function(errorObj) {
                console.log('fail: code = ' + errorObj.code + ', message = ' + errorObj.message);
            },
            {'id': 'token'}
        );
    },

    setToken: function(token) {
        this.token = token;

        intel.security.secureStorage.write(
            function() {console.log('success');},
            function(errorObj) {console.log('fail: code = ' + errorObj.code + ', message = ' + errorObj.message);},
            {'id': 'token', 'data': token }
        );
    },

    openFacebook: function(callback) {
        var self = this;

        openFB.init({appId: '262874990468179', runningInCordova: true});

        openFB.login(
            function(response) {
                if (response.status === 'connected') {
                    this.authWithServer(response.authResponse, callback);
                    alert('Facebook login succeeded, got access token: ' + response.authResponse.token);
                } else {
                    callback(response.error);
                    alert('Facebook login failed: ' + response.error);
                }
            },
            {scope: 'email,public_profile,publish_stream'}
        );
    },

    authWithServer: function(authResponse, callback) {
        var self = this;

        $.ajax({
            method: 'POST',
            url: self.endpoint + '/auth',
            data: {fbToken: authResponse.token}
        }).done(function(message) {
            self.setToken(message.token);
            callback('connected');
        }).fail(function(jqXHR, textStatus, errorThrown) {
            callback('error');
        });
    },

    sendScore: function(score, callback) {
        var self = this;

        if (!this.token) {
            callback('no_token_available');
        }

        $.ajax({
            method: 'POST',
            url: self.endpoint + '/ranking',
            headers: {Authorization: 'Bearer ' + self.token},
            data: score
        }).done(function(message) {
            self.setToken(message.token);
            callback('connected');
        }).fail(function(jqXHR, textStatus, errorThrown) {
            if (jqXHR.statusCode() !== 401) {
                // not a token error
                callback(message.error);
                return;
            }

            // token error: should refresh token
            // then try the request again
            self.openFacebook(function (status) {
                if (status === 'connected') {
                    $.ajax({
                        method: 'POST',
                        url: self.endpoint + '/ranking',
                        headers: {Authorization: 'Bearer ' + self.token},
                        data: score
                    }).done(function(message) {
                        self.setToken(message.token);
                        callback('connected');
                    }).fail(function(jqXHR, textStatus, errorThrown) {
                        // give up
                    });
                }
            });
        });
    },

    getToday: function(callback) {
        var self = this;

        $.ajax({
            url: self.endpoint + '/ranking'
        }).done(function(message) {
            callback(message);
        }).fail(function(jqXHR, textStatus, errorThrown) {
            callback('error');
        });
    },
});
