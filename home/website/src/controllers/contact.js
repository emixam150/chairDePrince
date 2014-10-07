/*
 * Contact Controller
 */
var fs = require('fs'),
    stream  = require('stream'),
    mustache = $.require('mustache');

var messagePath = "message.txt";

exports.exec = function(support) {

    post(support, get);
};

function get(support){
    var streammessage = fs.createReadStream(support.paths.html+ '/' + messagePath),
	messages = '';
    streammessage.setEncoding('utf8');

    streammessage.on('data', function(chunk){
	messages += chunk;
    });

    streammessage.on('end', function(){

	var output = mustache.to_html(support.content, {'messages': messages });
	
	support.res.setHeader('Cache-Control','max-age=' + support.page.maxAge );
	support.res.setHeader('Content-Type', 'text/html');
	$.require('makeTextResponse').send(output, support.headers, support.res);
    });
}

function post(support, getcall){
    if(isValidPost(support.post)){
	fs.appendFile(support.paths.html +'/'+ messagePath, writeHtmlMessage(support.post), function(){
	    getcall(support);
	});
    }else{
	getcall(support);
    }   
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
