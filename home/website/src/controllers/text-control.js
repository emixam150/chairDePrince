/*
 * Text Controller
 *  Si support.content est non "null" alors on envoie le contenu 
 Sinon il existe support.ressourcePath on envoie le contenu du fichier lié au path 
 */
var paths = require($.paths),
fileReader = require(paths.lib +'/fileReader.js'),
error404 = require(paths.controllers +'/error404.js').exec;

exports.exec = function(support) {
    if(support.content != null){
	support.res.setHeader('Content-Type', support.page.mime);
	$.require('makeTextResponse').send(support.content, support.headers, support.res);
    }else
	fileReader.exec(support.ressourcePath, 'text', function(err,file,stat){
	    if(err){
		if(err.code == 'ENOENT'){
		    if(support.page.type != 'html'){
			support.res.statusCode = 404;
			support.res.end('Not Found');
		    }else{
			error404(support);
		    }
		}else{
		    support.res.statusCode = 500;
		    support.res.end('Internal Server Error');
		}
	    }else{
		support.res.setHeader('Content-Type', support.page.mime);
		$.require('makeTextResponse').send(file, support.headers, support.res);
	    }
	});
};
