/*jshint undef:false */
var CookieManager = Class.extend({
	init:function(){
	},
	setCookie:function(cname, cvalue, exdays){
		var d = new Date();
		d.setTime(d.getTime() + (exdays*24*60*60*1000));
		var expires = 'expires='+d.toUTCString();
		document.cookie = cname + '=' + cvalue + '; ' + expires;
	},
	getCookie:function(name){
		return (name = new RegExp('(?:^|;\\s*)' + ('' + name).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + '=([^;]*)').exec(document.cookie)) && name[1];
	},

	setSafeCookie: function (key, value) {
		intel.security.secureStorage.write(
				function() {console.log('success');},
				function(errorObj) {console.log('fail: code = ' + errorObj.code + ', message = ' + errorObj.message);},
				{'id': key, 'data': value }
		);
	},

	getSafeCookie: function (key, callback) {
		intel.security.secureStorage.read(
				function(instanceID) {
						intel.security.secureData.getData(
								function(data) {
										callback(data);
									},
								function(errorObj) {
										console.log('fail: code = ' + errorObj.code + ', message = ' + errorObj.message);
										callback(null);
									},
								instanceID
						);
					},
				function(errorObj) {
						console.log('fail: code = ' + errorObj.code + ', message = ' + errorObj.message);
						callback(null);
					},
				{'id': key}
		);
	}
});
	// checkCookie:function(){
	// 	var user = getCookie('username');
//    if (user != ''){
//        alert('Welcome again ' + user);
	//     } else {
	//         user = prompt('Please enter your name:', ');
	//         if (user != ' && user != null) {
	//             setCookie('username', user, 365);
	//         }
	//     }
	// }
// function setCookie(cname, cvalue, exdays) {
//     var d = new Date();
//     d.setTime(d.getTime() + (exdays*24*60*60*1000));
//     var expires = 'expires='+d.toUTCString();
//     document.cookie = cname + '=' + cvalue + '; ' + expires;
// }

// function getCookie(cname) {
//     var name = cname + '=';
//     var ca = document.cookie.split(';');
//     for(var i=0; i<ca.length; i++) {
//         var c = ca[i];
//         while (c.charAt(0)==' ') c = c.substring(1);
//         if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
//     }
//     return ';
// }
// function readCookie(name) {
//     return (name = new RegExp('(?:^|;\\s*)' + ('' + name).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + '=([^;]*)').exec(document.cookie)) && name[1];
// }

// function checkCookie() {
//     var user = getCookie('username');
//     if (user != ') {
//         alert('Welcome again ' + user);
//     } else {
//         user = prompt('Please enter your name:', ');
//         if (user != ' && user != null) {
//             setCookie('username', user, 365);
//         }
//     }
// }
