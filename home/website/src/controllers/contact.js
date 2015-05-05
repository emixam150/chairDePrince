/*
 * Contact Controller
 */
var fs = require('fs'),
    stream  = require('stream'),
    mustache = $.require('mustache');

var paths = require($.paths),
    commonTreeTemplate = require( paths.models + '/commonTreeTemplate.js'),
    tempModel = require(paths.models + '/template.js'),
    LeadIn = require(paths.models + '/leadin.js'),
    nodemailer = $.require('nodemailer');

var messagePath = "message.txt";
var transporter = nodemailer.createTransport();
exports.exec = function(support) {

    post(support, get);
};

function get(support){

        console.log("contact");

    var leadIn = new LeadIn();

    leadIn.getRandom('accueil', function(){

	var queriesTemp = {
	    title : "Contact - Chère de prince",
	    lang: "fr",
	    contact: true,
	    leadIn: leadIn.content,
	    sessionDisplay: typeof support.session.user != "undefined",
	    userName:  (typeof support.session.user != "undefined")? support.session.user.name : '',
	    cssLinked:[],
	    jsLinked: false,//[{path: /path.js}]
	    cssSpe: false, //support.file.css.indexSpe
	    bannierePath :  "images/bannieres/contact.png",
	    stat: true
	};
	
	var section ={
	    id: "section",
	    type: "part",
	    children:{},
	    queries: {
		banniereHeader: {
		    link: "/svg/bannieres/contact.svg",
		    alt: "la Bécasse allongée écontant les news"
		},
		jsSpe: false
	    },
	    content: support.file.html.contact
	};
	
	commonTreeTemplate.constructTree( queriesTemp, function(tree){
	    tree.children.section = section;
	    support.res.setHeader('Cache-Control','max-age=' + support.page.maxAge + ',public');
	    support.res.setHeader('Content-Type', 'text/html');
	    tempModel.constructOutput(tree, function(output){
		$.require('makeTextResponse').send(output, support.headers, support.res);
	    });
	});
    });

}

function post(support, getcall){
    if(isValidPost(support.post)){
	transporter.sendMail({
	    from: support.post.name + ' <'+support.post.email +'>',
	    to: ' "La Bécasse" <becasse@ovh.fr>',
	    subject: support.post.subject,
	    text: support.post.message +'\n'+ support.post.site
	}, function(err, info){
	    if(err)
		console.log(err);
	    else{
		getcall(support);
		console.log(info);
	    }
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
	&& typeof post.email != 'undefined'
	&& post.email != ''    
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
