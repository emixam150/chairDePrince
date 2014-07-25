/*
 * Contact Controller
 */
var fs = require('fs'),
    stream  = require('stream'),
    mustache = $.require('mustache');

var messagePath = __dirname + "/../../web/html/message.txt";

exports.exec = function(res, ressourcePath, content, page, post) {

    if(isValidPost(post)){
	fs.appendFile(messagePath, writeHtmlMessage(post), function(){
	    constructReponse(res, ressourcePath, content, page, post);
	});
    }else{
	constructReponse(res, ressourcePath, content, page, post);
    }   
};

function constructReponse(res, ressourcePath, content, page, post){
    var streammessage = fs.createReadStream(messagePath),
	messages = '';
    streammessage.setEncoding('utf8');

    streammessage.on('data', function(chunk){
	messages += chunk;
    });

    streammessage.on('end', function(){

	var output = mustache.to_html(content, {'messages': messages });

	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end(output,'utf8');
    });
}

function isValidPost(post){
    return typeof post.message != 'undefined' 
	&& post.message != ''
	&& typeof post.name != 'undefined' 
	&& post.name != ''
	&& typeof post.subject != 'undefined' 
	&& post.subject != '';
}

function writeHtmlMessage(post){
    var now = new Date();
    return "<p>	<h5>"+ post.subject + " de " + post.name + 
	" le " + now.getDate() +"/"+ now.getMonth() +"/"+ now.getFullYear() +
	" à " + now.getHours()+ "h" + now.getMinutes() +" :</h5>" +
    post.message
	+"</p>";
}
