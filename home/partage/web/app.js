/*
** Define the root directory
**/ $.define(exports,"ROOT", __dirname + '/..');

/*
** Project's paths
**/ var paths = {
        html:        this.ROOT + '/web/html',
        images:      this.ROOT + '/web/images',
        js:          this.ROOT + '/web/js',
        css:         this.ROOT + '/web/css',
        config:      this.ROOT + '/app/config',
        crons:       this.ROOT + '/app/crons',
        entities:    this.ROOT + '/app/entities',
        language:    this.ROOT + '/app/language',
        logs:        this.ROOT + '/app/logs',
        test:        this.ROOT + '/app/test',
        controllers: this.ROOT + '/src/controllers',
        models:      this.ROOT + '/src/models'
    }
    /*
    ** Load routes from routes config file
    */
    var routes = require(paths.config + '/routes.json');
        
    
    /*
    **entry point
    */
 exports.start = function(req, res, server) {
     
    var fs = require("fs");
    var url = require("url");
    var querystring = require("querystring");
    
    var path = url.parse(req.url).pathname;
    var page = $.require('router').get(routes, path);
    
    if (typeof page.ctrl !== 'undefined'){
        var controller = require(paths.controllers + '/' + page.ctrl);
    }
    
    fs.exists(paths.html + '/' + page.file, function(exists) {
        if(exists){
            fs.readFile(paths.html +'/'+ page.file,'utf-8',function(err,data) {
            if (err) throw err;
            var content = data;
            
            res.writeHead(200,{'Content-Type' : 'text/html'});
            res.end(content);
            });
        }
    });
    
    
 }
 
