
/*
** Load virtual hosts configuration
*/
var vhost = require('../config/dev_vhost.json');
global.$ = require('framework');
/*
 ** method of HTTP Server 
 */

httpServer = function(server) {
    var http = require('http'),
    io = require('socket.io');

    var app = require(server.hosts['default'].index);
    
    var srv = http.createServer(function (req, res) {

        /** 3 **/
       /* var host = req.headers.host;console.log(host);
        
        if (typeof server.hosts[host] !== 'undefined') {
            var app = require(server.hosts[host].index);
        } else {
            var app = require(server.hosts['default'].index);
	}*/
       
       app.run(req, res, server.hosts['default']);
    }).listen(server.port);
    var ioServer = io.listen(srv);
    ioServer.sockets.on('connection', function(socket){
	app.execSocket(socket);
    });
};
/*
** method of HTTPS Server
*/

httpsServer = function(server) {
    var https = require('https');
    var fs = require("fs");
    
    if(typeof server.https.key !== 'undefined') {
        var options = {
            key: fs.readFileSync(server.https.key),
            cert: fs.readFileSync(server.https.cert) 
        };
    } else {
        var options = {
            pfx: fs.readFileSync(server.https.pfx)
        };
    }
    
    https.createServer(options, function(req, res){
        var host = req.headers.host;
        
        if(typeof server.host[host] !== 'undefined') {
            var app = require(server.hosts[host].index);
        } else {
            var app = require(server.hosts['default'].index);
        }
        
        res.writeHead(200,{'Content-Type' : 'text/plain'});
        res.end("hello world\n");
    }).listen(server.port);
};
for (var i in vhost) {
    var server = vhost[i];
    var method = server.protocol+'Server';
    
    /** 4 **/
   global[method](server);
}
