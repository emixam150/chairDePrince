/*
* Share controller
Dirige les  support vers le controllers suivant le format de la ressource 
FONCTONNE UNIQUEMENT POUR LES REQUETES COMMENCANT PAR '/share/...'
*/
var paths = require($.paths),
textControl = require(paths.controllers +'/text-control.js').exec,
image = require(paths.controllers +'/image.js').exec,
error404 = require(paths.controllers +'/error404.js').exec;

exports.exec = function(support){
    switch(support.page.query.extension){
    case 'html':
	support.page.mime = 'text/html';
	support.page.type = 'html';
	textControl(support);
	break;
    case 'js':
	support.page.mime = 'application/javascript';
	support.page.type = 'js';
	textControl(support);
	break;
    case 'css': 
	support.page.mime = 'text/css';
	support.page.type = 'css';
	textControl(support);
	break;
    case 'png': 
	support.page.mime = 'image/png';
	support.page.type = 'image';
	image(support);
	break;
    case 'jpg': 
	support.page.mime = 'image/jpeg';
	support.page.type = 'image';
	image(support);
	break;
    case 'svg': 
	support.page.mime = 'image/svg+xml';
	support.page.type = 'image';
	image(support);
	break;
    case 'ttf': 
	support.page.mime = 'font/opentype';
	support.page.type = 'share';
	image(support);
	break;
    case 'mp3': 
	support.page.mime = 'audio/mpeg';
	support.page.type = 'share';
	image(support);
	break;
    default:
	error404(support);
	break;
    }
}