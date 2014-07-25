var app = require('./app.js');

var isload = 0; //0:no load,1:loaded,2:loading

function lancement(req,res,srv,body){
    if(isload == 1){
	app.start(req, res, srv, body);
    }else if(isload == 0){
	isload = 2;
	var next = function(){isload = 1;
			      console.log('ressources loaded');
			      app.start(req, res, srv,body);
			     };
	app.load(next);
    }else{
	res.end('Wait please and retry');
    }

}

exports.run = function(req, res, srv) {
    //on s'occupe des methodes POST
    if(req.method == 'POST'){
	var body = '';
	req.on('data', function(data) {
	    body += data;
	    if(body.length > 1e6) {
		body = '';
		res.writeHead(413, {'Content-Type': 'text/plain'});
		    res.end();
		req.connection.destroy();
	    }
	});
	req.on('end',function(){
	    lancement(req,res,srv,body);
			       });
    }else {
	lancement(req,res,srv,null);
    }
};   
