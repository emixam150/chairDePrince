
/*
* File's Reader 
*
* Lit un fichier texte et le charge en une variable, 
requiert le : * un lien vers le fichier
              * un type pour l'encodage
*/

var fs = require('fs');

exports.exec = function(path, type, cb) {
    var option = (type !== 'image') ? 'utf8' : 'binary',
    file = '';
    
    fs.stat(path, function (err,stat) {
	if(err) {
	    if('ENOENT' == err.code){ 
		console.log('lib/fileReader.js: '+ path+ ' not found');
		cb(err);
	    }else{ 
                console.log('lib/fileReader.js: '+ path + ' error while finding');
		cb(err);
	    }     
	}else{ 
	    var stream = fs.createReadStream(path);
	    stream.setEncoding(option);
	    
	    stream.on('data', function(chunk) {
   		file += chunk; 
	    });
	    
	    stream.on('end', function(){
		cb(undefined,file,stat);
	    });
        }
    });
};